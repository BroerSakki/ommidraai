# Import External Libraries
# ---
from fastapi import (
    APIRouter,
    Depends
)
from typing import List
from sqlalchemy.orm import Session
from pydantic import BaseModel
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
from app.schemas.user_location import UserLocationCreate, UserLocationResponse
from app.schemas.location import LocationCreate
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
@router.get("/locations", response_model=List[UserLocationResponse])
def get_current_user_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return user_service.get_current_user_locations(
        db=db,
        current_user=current_user,
    )
# ---

# Get Current User Default Location
# ---
@router.get("/location/default")
def get_current_user_default_location(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return user_service.get_default_user_location(
        db=db,
        default_location_id=current_user.default_location_id,
    )
# ---

# Add Current User Location
# ---
@router.post(
    "/location/add",
    response_model=UserLocationResponse
)
def add_user_location(
    user_location: UserLocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return user_service.add_user_location(
        db=db,
        current_user=current_user,
        user_location=user_location,
    )
# ---

# Edit User Location
# ---
class UpdateLocationRequest(BaseModel):
    name: str

@router.put("/location/edit")
def update_user_default_location(
    payload: UpdateLocationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_service.update_user_default_location(
        db=db,
        current_user=current_user,
        name=payload.name,
    )
# ---

# Remove Current User Location
# ---
@router.delete("/location/delete/{location_name}")
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