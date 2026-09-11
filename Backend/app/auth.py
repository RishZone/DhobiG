# ============================================================
# IMPORTS
# ============================================================

import os
# Used to read environment variables.
# Here we use it to get JWT_SECRET_KEY.


from datetime import datetime, timedelta
# datetime -> current date/time
# timedelta -> represents a period of time.
#
# Example:
# timedelta(minutes=60)
# means 60 minutes.


from typing import Optional
# Optional means a value can be present OR None.


from fastapi import Depends, HTTPException, status
# Depends:
#   Used for FastAPI Dependency Injection.
#   It allows FastAPI to automatically provide things like
#   the database session or logged-in user.
#
# HTTPException:
#   Used when we want to return an error to the client.
#
# status:
#   Provides readable HTTP status codes like:
#   status.HTTP_401_UNAUTHORIZED


from fastapi.security import OAuth2PasswordBearer
# OAuth2PasswordBearer helps FastAPI read the JWT token
# from the Authorization header.
#
# Example request:
#
# Authorization: Bearer eyJhbGciOiJIUzI1Ni...


from jose import JWTError, jwt
# python-jose is used to create and decode JWT tokens.
#
# JWT = JSON Web Token
#
# JWT is commonly used to identify an authenticated user.


from passlib.context import CryptContext
# Passlib handles password hashing.
#
# We NEVER want to store a user's plain password
# directly in the database.


from sqlalchemy.orm import Session
# Session represents our SQLAlchemy database session.
# We use it to query the User table.


from app.database import get_db
# get_db() gives us a database session.


from app.models import User, UserRole
# User -> SQLAlchemy User database model.
# UserRole -> Enum containing user roles such as admin/customer/etc.


# ============================================================
# JWT CONFIGURATION
# ============================================================

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "dev-secret-change-me-in-production"
)

# SECRET_KEY is used to SIGN and VERIFY JWT tokens.
#
# First:
# os.getenv("JWT_SECRET_KEY", ...)
#
# means:
#
# "Look for JWT_SECRET_KEY in environment variables."
#
# If it doesn't exist, use:
# "dev-secret-change-me-in-production"
#
# IMPORTANT:
# In production, you should set a strong secret key
# through an environment variable.
#
# Don't expose the real secret key in GitHub.


ALGORITHM = "HS256"

# Algorithm used to sign the JWT.
#
# HS256 = HMAC SHA-256


ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# 60 minutes × 24 = 1440 minutes = 24 hours.
#
# Therefore, the login token is valid for 24 hours.


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# Creates a password-hashing configuration.
#
# bcrypt is used to hash passwords.
#
# Example:
#
# User enters:
# "mypassword123"
#
# Database stores something like:
# "$2b$12$...."
#
# The original password is NOT stored.


# ============================================================
# OAUTH2
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

# This tells FastAPI:
#
# "The endpoint used to obtain the access token is:
# /api/auth/login"
#
# OAuth2PasswordBearer will look for the token
# inside the Authorization header.
#
# Example:
#
# Authorization: Bearer <JWT_TOKEN>


# ============================================================
# HASH PASSWORD
# ============================================================

def hash_password(password: str) -> str:
    # Takes a plain-text password
    # and converts it into a secure hash.

    return pwd_context.hash(password)

# Example:
#
# Input:
# "hello123"
#
# Output:
# "$2b$12$...."
#
# The hash is what we store in the database.


# ============================================================
# VERIFY PASSWORD
# ============================================================

def verify_password(plain: str, hashed: str) -> bool:
    # plain  -> password entered by the user
    # hashed -> password hash stored in database
    #
    # Returns:
    # True  -> password is correct
    # False -> password is incorrect.

    return pwd_context.verify(plain, hashed)

# Example:
#
# User enters:
# "hello123"
#
# Database contains:
# bcrypt hash of "hello123"
#
# verify_password(...)
#        ↓
# True


# ============================================================
# CREATE JWT ACCESS TOKEN
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:

    # data contains information that we want to put
    # inside the JWT.
    #
    # Usually something like:
    #
    # {
    #     "sub": user.id
    # }


    to_encode = data.copy()

    # Make a copy so that we don't modify the original
    # dictionary.


    expire = datetime.utcnow() + (
        expires_delta
        or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Calculate when the token should expire.
    #
    # Default:
    # 24 hours from now.


    to_encode.update({"exp": expire})

    # Add expiration time to the JWT payload.
    #
    # "exp" = expiration time.


    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    # Finally create the JWT.
    #
    # The token is signed using:
    # SECRET_KEY + HS256
    #
    # The resulting token is returned to the client.


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:

    # This is VERY important.
    #
    # It is used to find out:
    #
    # "Who is the currently logged-in user?"
    #
    # FastAPI automatically provides:
    #
    # token -> from Authorization header
    # db    -> database session from get_db()


    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # This is the error we return if:
    #
    # - token is invalid
    # - token is missing/invalid
    # - user doesn't exist
    # - user is inactive


    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # Decode and verify the JWT.
        #
        # jwt.decode() checks whether the token was correctly
        # signed using our SECRET_KEY.
        #
        # It also checks things such as expiration.


        user_id: str = payload.get("sub")

        # Get the "sub" value from the JWT payload.
        #
        # Usually we put the user's ID inside "sub".
        #
        # Example JWT payload:
        #
        # {
        #     "sub": "12345",
        #     "exp": ...
        # }
        #
        # user_id = "12345"


        if user_id is None:
            raise credentials_exception

        # If JWT doesn't contain a user ID,
        # authentication fails.


    except JWTError:
        raise credentials_exception

    # If JWT decoding fails, return:
    #
    # 401 Unauthorized


    user = db.query(User).filter(
        User.id == user_id
    ).first()

    # Now we use the user ID from the JWT
    # to find the actual user in PostgreSQL.
    #
    # SQLAlchemy roughly generates:
    #
    # SELECT *
    # FROM users
    # WHERE id = user_id
    #
    # .first() returns the first matching user.


    if user is None or not user.is_active:
        raise credentials_exception

    # If:
    #
    # user doesn't exist
    # OR
    # user is inactive
    #
    # authentication fails.


    return user

    # If everything is valid:
    #
    # return the logged-in User object.


# ============================================================
# REQUIRE ADMIN
# ============================================================

def require_admin(
    user: User = Depends(get_current_user)
) -> User:

    # This function is used for ADMIN-ONLY APIs.
    #
    # FastAPI first calls:
    #
    # get_current_user()
    #
    # That gives us the currently logged-in user.


    if user.role != UserRole.admin:

        # Check whether the logged-in user's role
        # is actually ADMIN.

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

        # 403 = Forbidden.
        #
        # The user is authenticated,
        # but doesn't have permission.


    return user

    # If user is an admin,
    # allow the request to continue.