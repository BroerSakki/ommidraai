# Imports
# ---
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.models.user import User
from app.services import auth_service
from app.database import engine, get_db
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)
# ---

# Register
# ---
@router.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register(db=db, user=user)
# ---

# Login
# ---
@router.post("/login")
def login():
    pass
# ---

# Current User
# ---
@router.get("/me")
def me():
    pass
# ---