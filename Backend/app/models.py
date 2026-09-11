import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"
    driver = "driver"


class OrderStatus(str, enum.Enum):
    booked = "booked"
    pickup_assigned = "pickup_assigned"
    collected = "collected"
    cleaning = "cleaning"
    quality_check = "quality_check"
    out_for_delivery = "out_for_delivery"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"


class PaymentMethod(str, enum.Enum):
    card = "card"
    upi = "upi"
    cash_on_delivery = "cash_on_delivery"
    wallet = "wallet"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="customer", foreign_keys="Order.customer_id")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    vehicle_number = Column(String, nullable=True)
    zone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    rating = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="driver")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    label = Column(String, default="Home")  # Home / Work / Other
    line1 = Column(String, nullable=False)
    line2 = Column(String, nullable=True)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=False)
    landmark = Column(String, nullable=True)
    is_default = Column(Boolean, default=False)

    user = relationship("User", back_populates="addresses")


class Service(Base):
    __tablename__ = "services"

    id = Column(String, primary_key=True, default=gen_uuid)
    category = Column(String, nullable=False)  # e.g. "Wash & Fold"
    name = Column(String, nullable=False)  # e.g. "Cotton Shirt"
    unit = Column(String, default="piece")  # piece / kg
    price = Column(Float, nullable=False)
    turnaround_hours = Column(Integer, default=48)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    order_items = relationship("OrderItem", back_populates="service")


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(String, primary_key=True, default=gen_uuid)
    code = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    discount_percent = Column(Float, nullable=True)
    discount_flat = Column(Float, nullable=True)
    min_order_value = Column(Float, default=0)
    max_discount = Column(Float, nullable=True)
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=True)
    usage_limit = Column(Integer, nullable=True)
    times_used = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    orders = relationship("Order", back_populates="coupon")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=gen_uuid)
    order_number = Column(String, unique=True, nullable=False)
    customer_id = Column(String, ForeignKey("users.id"), nullable=False)
    address_id = Column(String, ForeignKey("addresses.id"), nullable=False)
    driver_id = Column(String, ForeignKey("drivers.id"), nullable=True)
    coupon_id = Column(String, ForeignKey("coupons.id"), nullable=True)

    pickup_date = Column(DateTime, nullable=False)
    pickup_slot = Column(String, nullable=False)  # e.g. "10:00-12:00"
    delivery_date = Column(DateTime, nullable=True)

    status = Column(Enum(OrderStatus), default=OrderStatus.booked, nullable=False)
    subtotal = Column(Float, default=0)
    discount = Column(Float, default=0)
    total = Column(Float, default=0)
    special_instructions = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("User", back_populates="orders", foreign_keys=[customer_id])
    address = relationship("Address")
    driver = relationship("Driver", back_populates="orders")
    coupon = relationship("Coupon", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")
    review = relationship("Review", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=gen_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    service_id = Column(String, ForeignKey("services.id"), nullable=False)
    quantity = Column(Float, default=1)  # pieces or kg
    unit_price = Column(Float, nullable=False)
    line_total = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    service = relationship("Service", back_populates="order_items")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=gen_uuid)
    order_id = Column(String, ForeignKey("orders.id"), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    method = Column(Enum(PaymentMethod), default=PaymentMethod.upi)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    transaction_ref = Column(String, default=gen_uuid)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payment")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=gen_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="review")
    user = relationship("User", back_populates="reviews")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    session_id = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)  # user / assistant
    message = Column(Text, nullable=False)
    agent_used = Column(String, nullable=True)  # rag / booking_agent / pricing_agent / tracking_agent / recommendation_agent
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_history")
