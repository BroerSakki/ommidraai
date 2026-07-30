# Import External Libraries
# ---
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
# ---

# Import Local Libraries
# ---
from app.models.user import User
from app.services import auth_service
from app.database import engine, get_db
from app.security import get_current_user, ACCESS_COOKIE_NAME
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
@router.post("/login")
def login(
    response: Response,
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    # Create Access Token
    # ---
    access_token = auth_service.login(
        db=db,
        credentials=credentials,
    )
    # ---

    # Set Cookie
    # ---
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=False, # Production: True
        samesite="lax",
        max_age=60 * 15,
    )
    # ---

    return {
        "message": "Login successful"
    }
# ---

# Logout
# ---
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        secure=False, # Production: True
        samesite="lax",
    )

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