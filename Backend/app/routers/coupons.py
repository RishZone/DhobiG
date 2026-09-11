from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import Coupon, User
from app.schemas import CouponCreate, CouponOut

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


@router.get("", response_model=List[CouponOut])
def list_coupons(db: Session = Depends(get_db)):
    """Public: used by the booking page to show available offers."""
    return db.query(Coupon).filter(Coupon.is_active.is_(True)).all()


@router.get("/validate/{code}", response_model=CouponOut)
def validate_coupon(code: str, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.code == code.upper(), Coupon.is_active.is_(True)).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon")
    return coupon


@router.post("", response_model=CouponOut, status_code=201)
def create_coupon(payload: CouponCreate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    coupon = Coupon(**payload.model_dump(), code=payload.code.upper())
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}", status_code=204)
def deactivate_coupon(coupon_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    coupon.is_active = False
    db.commit()
