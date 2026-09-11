from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Address, User
from app.schemas import AddressCreate, AddressOut

router = APIRouter(prefix="/api/addresses", tags=["addresses"])


@router.get("", response_model=List[AddressOut])
def list_addresses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Address).filter(Address.user_id == user.id).all()


@router.post("", response_model=AddressOut, status_code=201)
def create_address(payload: AddressCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.is_default:
        db.query(Address).filter(Address.user_id == user.id).update({"is_default": False})
    addr = Address(user_id=user.id, **payload.model_dump())
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return addr


@router.delete("/{address_id}", status_code=204)
def delete_address(address_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(addr)
    db.commit()
