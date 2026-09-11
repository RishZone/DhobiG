from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import Order, OrderStatus, Payment, PaymentStatus, User, UserRole
from app.schemas import DashboardStats, UserOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    month_start = datetime(now.year, now.month, 1)

    total_orders = db.query(func.count(Order.id)).scalar() or 0
    orders_today = db.query(func.count(Order.id)).filter(Order.created_at >= today_start).scalar() or 0

    revenue_total = (
        db.query(func.coalesce(func.sum(Payment.amount), 0.0))
        .filter(Payment.status == PaymentStatus.paid)
        .scalar()
        or 0.0
    )
    revenue_this_month = (
        db.query(func.coalesce(func.sum(Payment.amount), 0.0))
        .filter(Payment.status == PaymentStatus.paid, Payment.paid_at >= month_start)
        .scalar()
        or 0.0
    )

    active_customers = db.query(func.count(User.id)).filter(User.role == UserRole.customer, User.is_active.is_(True)).scalar() or 0
    pending_pickups = (
        db.query(func.count(Order.id))
        .filter(Order.status.in_([OrderStatus.booked, OrderStatus.pickup_assigned]))
        .scalar()
        or 0
    )

    status_rows = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    orders_by_status = {status.value: count for status, count in status_rows}

    return DashboardStats(
        total_orders=total_orders,
        orders_today=orders_today,
        revenue_total=round(revenue_total, 2),
        revenue_this_month=round(revenue_this_month, 2),
        active_customers=active_customers,
        pending_pickups=pending_pickups,
        orders_by_status=orders_by_status,
    )


@router.get("/customers", response_model=List[UserOut])
def list_customers(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return db.query(User).filter(User.role == UserRole.customer).order_by(User.created_at.desc()).all()


@router.patch("/customers/{user_id}/toggle", response_model=UserOut)
def toggle_customer(user_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active = not user.is_active
        db.commit()
        db.refresh(user)
    return user
