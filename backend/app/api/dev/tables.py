# Import External Libraries
# ---
from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from enum import Enum
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
from app.models.group_location import Group_Location
from app.models.invite_code import Invite_Code
# ---

# Class
# ---
class Table(str, Enum):
    users = "users"
    locations = "locations"
    groups = "groups"
    group_locations = "group_locations"
    user_locations = "user_locations"
    invites = "invites"
    invite_codes = "invite_codes"
    user_groups = "user_groups"
# ---

# Constants
# ---
TABLES = {
    "users": User,
    "locations": Location,
    "groups": Group,
    "group_locations": Group_Location,
    "user_locations": User_Location,
    "invites": Invite,
    "invite_codes": Invite_Code,
    "user_groups": User_Group,
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
    table: Table,
    db: Session = Depends(get_db),
):
    model = TABLES.get(table)

    if model is None:
        raise HTTPException(
            status_code=404,
            detail="Unknown table",
        )

    return db.scalars(select(model)).all()