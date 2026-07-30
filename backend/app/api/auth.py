# Import External Libraries
# ---
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
# ---

# Import Local Libraries
# ---
from app.models.user import User
from app.services import auth_service
from app.database import engine, get_db
from app.security import get_current_user, OAUTH2_SCHEME
# ---

# Import Schemas
# ---
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, Token
from app.schemas.location import LocationCreate
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

# Logout
# ---
@router.post("/logout")
def logout():
    return {
        "message": "Logged out"
    }
# ---

# Current User
# ---
@router.get("/me", response_model=UserResponse)
def me(
    current_user: User = Depends(get_current_user),
):
    return current_user
# ---