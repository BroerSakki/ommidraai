# Imports
# ---
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.security import get_current_user_id
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/experimental",
    tags=["Dev - Experimental"]
)
# ---

# Secutiry
# ---
@router.get("/me")
def me(token: str = Depends(OAuth2PasswordBearer(tokenUrl="auth/login"))):
    return get_current_user_id(token=token)
# ---