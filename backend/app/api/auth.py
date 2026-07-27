# Imports
# ---
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest, Token
from app.schemas.location import LocationCreate
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
def register(user: UserCreate, location: LocationCreate, db: Session = Depends(get_db)):
    return auth_service.register(db=db, user=user, location=location)
# ---

# Login
# ---
@router.post("/login", response_model=Token)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    return auth_service.login(db=db, credentials=credentials)
# ---

# Current User
# ---
@router.get("/me")
def me():
    pass
# ---