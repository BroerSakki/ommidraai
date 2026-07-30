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
from app.schemas.group import GroupCreate
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/groups",
    tags=["Groups"],
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