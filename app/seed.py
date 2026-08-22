"""
Seeds the database with the DhobiG service catalog (aligned with
ai/documents/pricing.md so the RAG chatbot and the live API always agree),
a couple of coupons, sample drivers, and demo login accounts.

Run with:  python -m app.seed
"""
from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Coupon, Driver, Service, User, UserRole

SERVICES = [
    # Wash & Fold (per kg)
    ("Wash & Fold", "Regular Wash & Fold", "kg", 79, 48, "Everyday laundry washed, dried, and folded."),
    ("Wash & Fold", "Wash, Fold & Iron", "kg", 99, 48, "Washed, dried, folded, and pressed."),
    # Premium Laundry
    ("Premium Laundry", "Premium Wash & Fold", "kg", 129, 48, "Fabric-specific gentle wash for office wear."),
    # Dry Cleaning (per piece)
    ("Dry Cleaning", "Shirt", "piece", 79, 48, "Dry cleaned and pressed shirt."),
    ("Dry Cleaning", "T-Shirt", "piece", 79, 48, "Dry cleaned t-shirt."),
    ("Dry Cleaning", "Trousers", "piece", 99, 48, "Dry cleaned and creased trousers."),
    ("Dry Cleaning", "Jeans", "piece", 99, 48, "Dry cleaned jeans."),
    ("Dry Cleaning", "Suit (2-piece)", "piece", 349, 72, "Jacket + trousers dry cleaned and pressed."),
    ("Dry Cleaning", "Blazer", "piece", 199, 72, "Dry cleaned blazer/coat."),
    ("Dry Cleaning", "Saree (plain)", "piece", 199, 72, "Dry cleaned plain saree."),
    ("Dry Cleaning", "Saree (heavy work)", "piece", 349, 72, "Dry cleaned embroidered/zari saree, hand-finished."),
    ("Dry Cleaning", "Sherwani", "piece", 499, 96, "Dry cleaned sherwani with hand finishing."),
    ("Dry Cleaning", "Lehenga", "piece", 499, 96, "Dry cleaned lehenga with hand finishing."),
    ("Dry Cleaning", "Kurta", "piece", 99, 48, "Dry cleaned kurta."),
    # Steam Ironing (per piece)
    ("Steam Ironing", "Shirt Ironing", "piece", 15, 24, "Standalone steam press for shirts."),
    ("Steam Ironing", "Trousers Ironing", "piece", 20, 24, "Standalone steam press for trousers."),
    ("Steam Ironing", "Saree Ironing", "piece", 40, 24, "Standalone steam press for sarees."),
    # Specialty
    ("Shoe Cleaning", "Shoe Cleaning (Canvas)", "piece", 149, 72, "Deep clean for canvas/sneaker shoes."),
    ("Shoe Cleaning", "Shoe Cleaning (Leather)", "piece", 299, 72, "Deep clean + condition for leather shoes."),
    ("Bag Cleaning", "Bag Cleaning", "piece", 249, 72, "Cleaning for fabric/leather bags."),
    ("Curtain Cleaning", "Curtain Panel (Small)", "piece", 99, 72, "Cleaning for a single small curtain panel."),
    ("Curtain Cleaning", "Curtain Panel (Large)", "piece", 149, 72, "Cleaning for a single large curtain panel."),
    ("Carpet Cleaning", "Carpet Cleaning (per sqft)", "piece", 50, 72, "Steam-extraction carpet cleaning, priced per sqft."),
    ("Sofa Cleaning", "Sofa Cleaning (3-seater)", "piece", 999, 24, "In-home deep upholstery cleaning, 3-seater."),
    ("Sofa Cleaning", "Sofa Cleaning (5-seater)", "piece", 1799, 24, "In-home deep upholstery cleaning, 5-seater."),
    ("Leather Cleaning", "Leather Jacket Cleaning", "piece", 699, 96, "Specialized solvent cleaning + conditioning."),
]

COUPONS = [
    ("WELCOME20", "20% off for first-time customers", 20, None, 200, 150, 1000),
    ("MONTHLY15", "15% off for monthly Wash & Fold subscribers", 15, None, 500, 300, None),
    ("FLAT50", "Flat Rs.50 off orders above Rs.400", None, 50, 400, None, None),
]

DRIVERS = [
    ("Ramesh Kumar", "9876500001", "DL-01-AB-1234", "North Zone"),
    ("Suresh Yadav", "9876500002", "DL-02-CD-5678", "South Zone"),
    ("Priya Nair", "9876500003", "DL-03-EF-9012", "East Zone"),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(Service).first():
            for category, name, unit, price, turnaround, desc in SERVICES:
                db.add(Service(category=category, name=name, unit=unit, price=price, turnaround_hours=turnaround, description=desc))

        if not db.query(Coupon).first():
            for code, desc, pct, flat, min_val, max_disc, limit in COUPONS:
                db.add(
                    Coupon(
                        code=code,
                        description=desc,
                        discount_percent=pct,
                        discount_flat=flat,
                        min_order_value=min_val,
                        max_discount=max_disc,
                        usage_limit=limit,
                    )
                )

        if not db.query(Driver).first():
            for name, phone, vehicle, zone in DRIVERS:
                db.add(Driver(name=name, phone=phone, vehicle_number=vehicle, zone=zone))

        if not db.query(User).filter(User.email == "admin@dhobig.com").first():
            db.add(
                User(
                    name="DhobiG Admin",
                    email="admin@dhobig.com",
                    phone="9999900000",
                    hashed_password=hash_password("Admin@123"),
                    role=UserRole.admin,
                )
            )

        if not db.query(User).filter(User.email == "demo@dhobig.com").first():
            db.add(
                User(
                    name="Demo Customer",
                    email="demo@dhobig.com",
                    phone="9999900001",
                    hashed_password=hash_password("Demo@123"),
                    role=UserRole.customer,
                )
            )

        db.commit()
        print("Seed complete: services, coupons, drivers, and demo accounts created.")
        print("  Admin login:    admin@dhobig.com / Admin@123")
        print("  Customer login: demo@dhobig.com / Demo@123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
