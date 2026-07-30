# Import External Libraries
# ---
from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
# ---

# Import Local Libraries
# ---
from app.database import get_db
# ---

# Import Models
# ---
from app.models.user import User
from app.models.location import Location
from app.models.group import Group
from app.models.user_location import User_Location
from app.models.invite import Invite
from app.models.user_group import User_Group
from app.models.user_location import User_Location
# ---

# Constants
# ---
TABLES = {
    "users": User,
    "locations": Location,
    "groups": Group,
    "user_locations": User_Location,
    "invites": Invite,
    "user_groups": User_Group,
    "user_locations": User_Location,
}
# ---

# Connect Router
# ---
router = APIRouter(
    prefix="/tables",
    tags=["Dev - Tables"]
)
# ---

@router.get("/{table}")
def get_table(
    table: str,
    db: Session = Depends(get_db),
):
    model = TABLES.get(table)

    if model is None:
        raise HTTPException(
            status_code=404,
            detail="Unknown table",
        )

    return db.scalars(select(model)).all()