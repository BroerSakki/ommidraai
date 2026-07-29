# Imports
# ---
from datetime import datetime, timedelta, UTC
from jose import jwt
from pwdlib import PasswordHash
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
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

# Create Token
# ---
def create_access_token(data: dict, expiration_time_minutes: int = EXPIRATION_TIME) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(UTC) + timedelta(minutes=expiration_time_minutes)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
# ---

# Current User
# ---
def get_current_user_id(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id = payload.get("sub")
        if id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
# ---