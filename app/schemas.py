from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.models import OrderStatus, PaymentMethod, PaymentStatus, UserRole


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Address ----------
class AddressCreate(BaseModel):
    label: str = "Home"
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    landmark: Optional[str] = None
    is_default: bool = False


class AddressOut(AddressCreate):
    id: str

    class Config:
        from_attributes = True


# ---------- Service ----------
class ServiceOut(BaseModel):
    id: str
    category: str
    name: str
    unit: str
    price: float
    turnaround_hours: int
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Coupon ----------
class CouponOut(BaseModel):
    id: str
    code: str
    description: Optional[str] = None
    discount_percent: Optional[float] = None
    discount_flat: Optional[float] = None
    min_order_value: float
    is_active: bool

    class Config:
        from_attributes = True


class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_percent: Optional[float] = None
    discount_flat: Optional[float] = None
    min_order_value: float = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None


# ---------- Orders ----------
class OrderItemCreate(BaseModel):
    service_id: str
    quantity: float = 1


class OrderItemOut(BaseModel):
    id: str
    service_id: str
    quantity: float
    unit_price: float
    line_total: float
    service: Optional[ServiceOut] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    address_id: str
    pickup_date: datetime
    pickup_slot: str
    special_instructions: Optional[str] = None
    coupon_code: Optional[str] = None
    items: List[OrderItemCreate]


class OrderOut(BaseModel):
    id: str
    order_number: str
    customer_id: str
    address_id: str
    driver_id: Optional[str] = None
    pickup_date: datetime
    pickup_slot: str
    delivery_date: Optional[datetime] = None
    status: OrderStatus
    subtotal: float
    discount: float
    total: float
    special_instructions: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    driver_id: Optional[str] = None


# ---------- Payments ----------
class PaymentCreate(BaseModel):
    order_id: str
    method: PaymentMethod


class PaymentOut(BaseModel):
    id: str
    order_id: str
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    transaction_ref: str
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------- Drivers ----------
class DriverCreate(BaseModel):
    name: str
    phone: str
    vehicle_number: Optional[str] = None
    zone: Optional[str] = None


class DriverOut(DriverCreate):
    id: str
    is_active: bool
    rating: float

    class Config:
        from_attributes = True


# ---------- Reviews ----------
class ReviewCreate(BaseModel):
    order_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(ReviewCreate):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Chat / AI ----------
class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    agent_used: str
    sources: List[str] = []


# ---------- Admin analytics ----------
class DashboardStats(BaseModel):
    total_orders: int
    orders_today: int
    revenue_total: float
    revenue_this_month: float
    active_customers: int
    pending_pickups: int
    orders_by_status: dict
