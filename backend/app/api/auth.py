# Import External Libraries
# ---
from fastapi import APIRouter, Depends, Response, Request, HTTPException
from sqlalchemy.orm import Session
# ---

# Import Local Libraries
# ---
from app.models.user import User
from app.services import auth_service
from app.database import engine, get_db
from app.security import get_current_user, ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME
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
def register(
    user: UserCreate,
    location: LocationCreate,
    db: Session = Depends(get_db)
):
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
    access_token, refresh_token = auth_service.login(
        db=db,
        credentials=credentials,
    )
    # ---

    # Set Cookies
    # ---
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 15,
    )

    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    # ---

    return {
        "message": "Login successful"
    }
# ---

# Refresh Access
# ---
@router.post("/refresh")
def refresh(
    request: Request,
    response: Response,
):
    refresh_token = request.cookies.get(
        REFRESH_COOKIE_NAME
    )

    if refresh_token is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    access_token = auth_service.refresh(
        refresh_token
    )

    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=900,
    )

    return {
        "message": "Token refreshed",
    }
# ---

# Logout
# ---
@router.post("/logout")
def logout(
    response: Response
):
    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        secure=False,
        samesite="lax",
    )
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        secure=False,
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