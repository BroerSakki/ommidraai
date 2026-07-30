# Import External Libraries
# ---
from datetime import datetime, timedelta, UTC
from jose import jwt
from pwdlib import PasswordHash
from fastapi import Depends, HTTPException, Request
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
EXPIRATION_TIME = 60
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

# Token Methods
# ---
def create_access_token(data: dict, expiration_time_minutes: int = EXPIRATION_TIME) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(UTC) + timedelta(minutes=expiration_time_minutes)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> int:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

        return int(user_id)

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )
# ---

# Current User
# ---
def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:

    token = request.cookies.get(ACCESS_COOKIE_NAME)

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    user_id = decode_access_token(token)

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