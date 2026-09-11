from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Service
from app.schemas import ServiceOut

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=List[ServiceOut])
def list_services(category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Service).filter(Service.is_active.is_(True))
    if category:
        q = q.filter(Service.category == category)
    return q.order_by(Service.category, Service.name).all()


@router.get("/categories", response_model=List[str])
def list_categories(db: Session = Depends(get_db)):
    rows = db.query(Service.category).filter(Service.is_active.is_(True)).distinct().all()
    return [r[0] for r in rows]


@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: str, db: Session = Depends(get_db)):
    return db.query(Service).filter(Service.id == service_id).first()
