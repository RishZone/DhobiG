import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import admin, addresses, auth, chat, coupons, drivers, orders, payments, reviews, services

app = FastAPI(
    title="DhobiG API",
    description="AI-Powered Laundry & Dry Cleaning Platform — customer, admin, and RAG/agent endpoints.",
    version="1.0.0",
)  # This is the main FastAPI application instance. It sets up the API with a title, description, and version.  

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") # This line retrieves the CORS origins from an environment variable. If the variable is not set, it defaults to allowing requests from localhost on port 5173. The origins are split into a list.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine) # Check if the database tables exist. If they don't, create them .


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok", "service": "DhobiG API"}


app.include_router(auth.router)
app.include_router(services.router)
app.include_router(addresses.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(coupons.router)
app.include_router(drivers.router)
app.include_router(reviews.router)
app.include_router(admin.router)
app.include_router(chat.router)
# include_router() connects the APIs defined in separate files to your main FastAPI application, keeping the project clean, organized, and easy to maintain.


