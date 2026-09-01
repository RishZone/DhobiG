from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Order, Review, User
from app.schemas import ReviewCreate, ReviewOut

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=ReviewOut, status_code=201)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == payload.order_id, Order.customer_id == user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.review:
        raise HTTPException(status_code=400, detail="Order already reviewed")

    review = Review(order_id=order.id, user_id=user.id, rating=payload.rating, comment=payload.comment)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("", response_model=List[ReviewOut])
def list_reviews(db: Session = Depends(get_db)):
    return db.query(Review).order_by(Review.created_at.desc()).limit(50).all()
