# Import External Libraries
# ---
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from fastapi import Depends, HTTPException
# ---

# Import Local Libraries
# ---
from app.models.user import User
from app.models.location import Location
from app.services.locations_service import add_location
from app.security import hash_password, verify_password, create_access_token

# ---

# Import Schemas
# ---
from app.schemas.location import LocationCreate
from app.schemas.auth import LoginRequest
from app.schemas.user import UserCreate
# ---

# Register Service
# ---
def register(db: Session, user: UserCreate, location: LocationCreate):
    try:
        default_location_id = add_location(db=db, location=location)

        hashed = hash_password(user.password)
        new_user = User(
            username=user.usename,
            email=user.email,
            password_hash=hashed,
            default_location_id=default_location_id,
        )

        db.add(new_user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email already in use",
        )
    finally:
        db.refresh(new_user)
    return new_user
# ---

# Login
# ---
def login(
    db: Session,
    credentials: LoginRequest,
) -> str:

    stmt = select(User).where(
        User.username == credentials.username
    )

    user = db.scalar(stmt)

    if user is None:
        raise HTTPException(
            status_code=403,
            detail="Invalid username or password",
        )

    if not verify_password(
        credentials.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid username or password",
        )

    return create_access_token(
        {"sub": str(user.id)}
    )# ---

# Get User
# ---
def get_user_by_id(
    db: Session,
    user_id: int,
) -> User | None:
    return db.scalar(
        select(User).where(User.id == user_id)
    )
# ---