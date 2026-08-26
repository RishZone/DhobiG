from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.models import Order, Payment, PaymentStatus, User
from app.schemas import PaymentCreate, PaymentOut

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("", response_model=PaymentOut, status_code=201)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Mock payment capture. In production this would create a Razorpay/Stripe
    order, return a client secret, and confirm via webhook. Here we simulate
    an instant successful capture so the booking flow is fully demoable.
    """
    order = db.query(Order).filter(Order.id == payload.order_id, Order.customer_id == user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.payment:
        raise HTTPException(status_code=400, detail="Order already has a payment")

    payment = Payment(
        order_id=order.id,
        amount=order.total,
        method=payload.method,
        status=PaymentStatus.paid,
        paid_at=datetime.utcnow(),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/{order_id}", response_model=PaymentOut)
def get_payment(order_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    payment = db.query(Payment).join(Order).filter(Order.id == order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if user.role.value == "customer" and payment.order.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Not your payment")
    return payment


@router.get("", response_model=List[PaymentOut])
def list_payments(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return db.query(Payment).order_by(Payment.created_at.desc()).all()
