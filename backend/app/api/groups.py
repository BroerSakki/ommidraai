# Import External Libraries
# ---
from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.orm import Session
# ---

# Import Local Libraries
# ---
from app.security import get_current_user
from app.database import get_db
from app.services import group_service
# ---

# Import Models
# ---
from app.models.user import User
# ---

# Import Schemas
# ---
from app.schemas import invite
from app.schemas.group import GroupCreate
from app.schemas.location import LocationCreate
from app.schemas.user_roles import UserRole
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/groups",
    tags=["Groups"],
)
# ---

# Get User Groups
# ---
@router.get("/")
def get_user_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return group_service.get_current_user_groups(
        db=db,
        current_user=current_user,
    )
# ---


# Create Group
# ---
@router.post("/create")
def create_group(
    group: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return group_service.create_group(
        db=db,
        group=group,
        current_user=current_user
    )
# ---

# Get Group Data
# ---
@router.get("/{group_id}")
def get_group_data(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return group_service.get_group_data(
        db=db,
        group_id=group_id,
        current_user=current_user
	)
# ---

# Get Group Destinations
# ---
@router.get("/{group_id}/locations")
def get_group_destinations(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return group_service.get_group_destinations(
        db=db,
        group_id=group_id,
    )
# ---

# Search Group Destinations
# ---
@router.get("/{group_id}/locations/{display_name}")
def search_group_destinations(
    group_id: int,
    display_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return group_service.search_group_destinations(
        db=db,
        group_id=group_id,
        display_name=display_name,
    )
# ---

# Add Location
# ---
@router.post("/{group_id}/location/add")
def add_location(
    group_id: int,
    location: LocationCreate,
    display_name: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return group_service.add_group_location(
        db=db,
        location=location,
        current_user=current_user,
        group_id=group_id,
        display_name=display_name,
    )
# ---

# Remove Location
# ---
@router.delete("/{group_id}/location/delete")
def remove_location(
    group_id: int,
    location_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return group_service.remove_group_location(
        db=db,
        current_user=current_user,
        location_id=location_id,
        group_id=group_id,
    )
# ---

# Edit User Properties
# ---
@router.put("/{group_id}/user/properties")
def update_user_properties(
    group_id: int,
    car_capacity: int,
    is_passenger: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return group_service.update_user_group_data(
        db=db,
        current_user=current_user,
        group_id=group_id,
        car_capacity=car_capacity,
        is_passenger=is_passenger
	)
# ---