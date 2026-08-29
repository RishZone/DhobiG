from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import Driver, User
from app.schemas import DriverCreate, DriverOut

router = APIRouter(prefix="/api/drivers", tags=["drivers"])


@router.get("", response_model=List[DriverOut])
def list_drivers(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return db.query(Driver).order_by(Driver.name).all()


@router.post("", response_model=DriverOut, status_code=201)
def create_driver(payload: DriverCreate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    driver = Driver(**payload.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


@router.patch("/{driver_id}/toggle", response_model=DriverOut)
def toggle_driver(driver_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    driver.is_active = not driver.is_active
    db.commit()
    db.refresh(driver)
    return driver
