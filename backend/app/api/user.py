# Import External Libraries
# ---
from fastapi import (
    APIRouter,
    Depends
)
from sqlalchemy.orm import Session
# ---

# Import Local Libraries
# ---
from app.database import get_db
from app.security import get_current_user
from app.services import user_service
# ---

# Import Models
# ---
from app.models.user import User
# ---

# Import Schemas
# ---
from app.schemas.user_location import UserLocationCreate
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/user",
    tags=["User"],
)
# ---

# Get Current User Locations
# ---
@router.get("/locations")
def get_current_user_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return user_service.get_current_user_locations(
        db=db,
        current_user=current_user,
    )
# ---

# Add Current User Location
# ---
@router.post("/location/add")
def add_user_location(
    user_location: UserLocationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return user_service.add_user_location(
        db=db,
        current_user=current_user,
        user_location=user_location,
    )
# ---

# Remove Current User Location
# ---
@router.delete("/location/")
def remove_user_location(
    location_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return user_service.remove_user_location(
        db=db,
        current_user=current_user,
        location_name=location_name,
    )
# ---