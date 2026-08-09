# Base Imports
# ---
from fastapi import Depends, HTTPException
# ---

# Database Imports
# ---
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
# ---

# Import Models
# ---
from app.models.user import User
# ---

# Import Schemas
# ---
from app.schemas import user_roles
from app.schemas import user_group
# ---

# Import Services
# ---
from app.services.database import groups_table
from app.services.database import user_groups_table
# ---

# Get User Groups
# ---
def get_user_groups(
    db: Session,
    current_user: User,
):
    pass
# ---

# Get Group Data
# ---
def get_group_data(
    db: Session,
    current_user: User,
):
    pass
# ---

# Get Group Destinations
# ---
def get_group_destinations(
    db: Session,
    current_user: User,
):
    pass
# ---

# Search Group Destinations
# ---
def search_group_destinations(
    db: Session,
    current_user: User,
):
    pass
# ---

# Create Group
# ---
def create_group(
    db: Session,
    current_user: User,
    group_name: str,
):
    # Create Named Group
    # ---
    group_id: int = groups_table.create_group(
        db=db,
        group_name=group_name,
    ).id
    # ---

    # Build Schema
    # ---
    user_group_create: user_group.UserGroupCreate = user_group.UserGroupCreate(
        user_id= current_user.id,
        group_id= group_id,
        role= user_roles.UserRole.owner,
        car_capacity= 0,
        is_passenger= False,
    )
    # ---

    # Add Current User
    # ---
    user_groups_table.add_user(
        db=db,
        user_group_create=user_group_create,
    )
    # ---
# ---