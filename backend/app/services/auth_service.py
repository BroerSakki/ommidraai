# Imports
# ---
from app.models.user import User
from app.schemas.user import UserCreate
from app.database import get_db
from app.security import hash_password
from sqlalchemy.orm import Session
from fastapi import Depends
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