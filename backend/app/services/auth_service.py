# Imports
# ---
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest, Token
from app.database import get_db
from app.security import hash_password, verify_password, create_access_token
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Depends, HTTPException
# ---

# Register Service
# ---
def register(db: Session, user: UserCreate):
    hashed = hash_password(user.password)
    new_user = User(
        username=user.usename,
        email=user.email,
        password_hash=hashed
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
# ---

# Login
# ---
def login(db: Session, credentials: LoginRequest):
    stmt = select(User).where(User.username == credentials.username)
    user = db.scalar(stmt)
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=403, detail="Invalid username or password")
    token = create_access_token(
        {
            "sub": str(user.id)
        }
    )
    return Token(
        access_token=token
    )
# ---