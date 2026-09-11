import random
import string
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models import Address, Coupon, Order, OrderItem, OrderStatus, Service, User, UserRole
from app.schemas import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/api/orders", tags=["orders"])

# Status progression used by the tracking timeline / agents
STATUS_FLOW = [
    OrderStatus.booked,
    OrderStatus.pickup_assigned,
    OrderStatus.collected,
    OrderStatus.cleaning,
    OrderStatus.quality_check,
    OrderStatus.out_for_delivery,
    OrderStatus.delivered,
]


def _generate_order_number() -> str:
    suffix = "".join(random.choices(string.digits, k=6))
    return f"DG-{datetime.utcnow().strftime('%y%m')}-{suffix}"


def _apply_coupon(subtotal: float, coupon: Optional[Coupon]) -> float:
    if not coupon or not coupon.is_active:
        return 0
    if subtotal < (coupon.min_order_value or 0):
        return 0
    if coupon.usage_limit and coupon.times_used >= coupon.usage_limit:
        return 0
    discount = 0.0
    if coupon.discount_percent:
        discount = subtotal * (coupon.discount_percent / 100)
        if coupon.max_discount:
            discount = min(discount, coupon.max_discount)
    elif coupon.discount_flat:
        discount = coupon.discount_flat
    return round(min(discount, subtotal), 2)


@router.post("", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    address = db.query(Address).filter(Address.id == payload.address_id, Address.user_id == user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    order = Order(
        order_number=_generate_order_number(),
        customer_id=user.id,
        address_id=address.id,
        pickup_date=payload.pickup_date,
        pickup_slot=payload.pickup_slot,
        special_instructions=payload.special_instructions,
        status=OrderStatus.booked,
    )

    subtotal = 0.0
    items: List[OrderItem] = []
    for item in payload.items:
        service = db.query(Service).filter(Service.id == item.service_id, Service.is_active.is_(True)).first()
        if not service:
            raise HTTPException(status_code=404, detail=f"Service {item.service_id} not found")
        line_total = round(service.price * item.quantity, 2)
        subtotal += line_total
        items.append(
            OrderItem(
                service_id=service.id,
                quantity=item.quantity,
                unit_price=service.price,
                line_total=line_total,
            )
        )

    coupon = None
    if payload.coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == payload.coupon_code.upper()).first()
        if not coupon:
            raise HTTPException(status_code=404, detail="Invalid coupon code")

    discount = _apply_coupon(subtotal, coupon)
    if coupon and discount > 0:
        order.coupon_id = coupon.id
        coupon.times_used += 1

    order.subtotal = round(subtotal, 2)
    order.discount = discount
    order.total = round(subtotal - discount, 2)
    order.items = items

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=List[OrderOut])
def list_my_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (
        db.query(Order)
        .filter(Order.customer_id == user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/all", response_model=List[OrderOut])
def list_all_orders(
    status: Optional[OrderStatus] = None,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin: list every order, optionally filtered by status."""
    q = db.query(Order)
    if status:
        q = q.filter(Order.status == status)
    return q.order_by(Order.created_at.desc()).all()


@router.get("/track/{order_number}", response_model=OrderOut)
def track_order(order_number: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.role == UserRole.customer and order.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    return order


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.role == UserRole.customer and order.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_status(
    order_id: str,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin / driver-app endpoint to move an order through the pipeline."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = payload.status
    if payload.driver_id:
        order.driver_id = payload.driver_id
    if payload.status == OrderStatus.delivered:
        order.delivery_date = datetime.utcnow()
    order.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(order)
    return order


@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(order_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.customer_id == user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status in (OrderStatus.out_for_delivery, OrderStatus.delivered):
        raise HTTPException(status_code=400, detail="Order can no longer be cancelled")
    order.status = OrderStatus.cancelled
    db.commit()
    db.refresh(order)
    return order
