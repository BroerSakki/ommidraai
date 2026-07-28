# Imports
# ---
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
# ---

# Model Imports
# ---
from app.models.user import User, User_Location
from app.models.location import Location
from app.models.group import Group
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/tables",
    tags=["Developer - Tables"]
)
# ---

# Get Table Data
# ---
@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    result = db.execute(select(User))
    users = result.scalars().all()
    return users

@router.get("/user_locations")
def get_user_locations(db: Session = Depends(get_db)):
    result = db.execute(select(User_Location))
    user_locations = result.scalars().all()
    return user_locations

@router.get("/locations")
def get_locations(db: Session = Depends(get_db)):
    result = db.execute(select(Location))
    locations = result.scalars().all()
    return locations

@router.get("/groups")
def get_groups(db: Session = Depends(get_db)):
    result = db.execute(select(Group))
    groups = result.scalars().all()
    return groups
# ---