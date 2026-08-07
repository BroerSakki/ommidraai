# Import External Libraries
# ---
from datetime import datetime, timedelta, UTC
from pwdlib import PasswordHash
from fastapi import Depends, HTTPException, Request, Cookie, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError
# ---

# Import Local Libraries
# ---
from app.database import get_db
from app.services import auth_service
from app.models.user import User
# ---

# Method
# ---
password_hash = PasswordHash.recommended()
# ---

# Local Constants
# ---
SECRET_KEY = "test-thingymadoodle"
ALGORITHM = "HS256"
ACCESS_TOKEN_LIFETIME = timedelta(minutes=15)
REFRESH_TOKEN_LIFETIME = timedelta(days=30)
ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"
# ---

# Hash
# ---
def hash_password(password: str) -> str:
    return password_hash.hash(password)
# ---

# Verify
# ---
def verify_password(password: str, hashed: str) -> bool:
    return password_hash.verify(password, hashed)
# ---

# Token Creation
# ---
def create_token(
        data: dict,
        expires_delta: timedelta
    ) -> str:
    payload = data.copy()
    payload["exp"] = (
        datetime.now(UTC)
        + expires_delta
    )
    
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def create_access_token(data):
    return create_token(
        data=data,
        expires_delta=ACCESS_TOKEN_LIFETIME,
    )

def create_refresh_token(data):
    return create_token(
        data=data,
        expires_delta=REFRESH_TOKEN_LIFETIME,
    )
# ---

# Token Verification
# ---
def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

def verify_access_token(token: str) -> int:

    payload = decode_token(token)

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=401,
            detail="Invalid access token",
        )

    return int(payload["sub"])

def verify_refresh_token(token: str) -> int:

    payload = decode_token(token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

    return int(payload["sub"])
# ---

# Current User
# ---
def get_current_user(
    request: Request,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
) -> User:

    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    else:
        token = request.cookies.get(ACCESS_COOKIE_NAME)

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    user_id = verify_access_token(token)

    user = auth_service.get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user
# ---