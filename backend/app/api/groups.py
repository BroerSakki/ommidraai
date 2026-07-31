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
@router.post("/")
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

# Add Location
# ---
@router.post("/{group_id}/locations/add")
def add_location(
    group_id: int,
    location: LocationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return group_service.add_group_location(
        db=db,
        location=location,
        current_user=current_user,
        group_id=group_id,
    )
# ---