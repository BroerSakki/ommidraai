# Base Imports
# ---
from fastapi import HTTPException
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
from app.models.user_group import User_Group
# ---

# Import Schemas
# ---
from app.schemas import user_group as user_group_schemas
# ---

# Import Services
# ---
from app.services.database import groups_table
from app.services.database import users_table
# ---

# Get User Groups
# ---
def get_user_groups(
    db: Session,
    user_id: int,
):
    try:
        # Get User Groups
        # ---
        user_groups = db.scalars(
            select(User_Group)
            .where(
                User_Group.user_id == user_id,
            )
        ).all()
        # ---

        # Return
        # ---
        return user_groups
        # ---

    except SQLAlchemyError:
        # Database Error
        # ---
        raise HTTPException(
            status_code=400,
            detail="Could not retrieve user groups"
        )
        # ---
# ---

# Get Group Users
# ---
def get_group_users(
    db: Session,
    group_id: int,
):
    try:
        # Get User Groups
        # ---
        user_groups = db.scalars(
            select(User_Group)
            .where(
                User_Group.group_id == group_id,
            )
        ).all()
        # ---

        # Return
        # ---
        return user_groups
        # ---

    except SQLAlchemyError:
        # Database Error
        # ---
        raise HTTPException(
            status_code=400,
            detail="Could not retrieve user groups"
        )
        # ---
# ---

# Has Users
# ---
def has_users(
    db: Session,
    group_id: int,
) -> bool:
    try:
        # Get User Groups
        # ---
        user_group = db.scalar(
            select(User_Group)
            .where(
                User_Group.group_id == group_id,
            )
        )
        # ---

        # Return
        # ---
        if user_group is None:
            return False
        else:
            return True
        # ---

    except SQLAlchemyError:
        # Database Error
        # ---
        raise HTTPException(
            status_code=400,
            detail="Could not retrieve user groups"
        )
        # ---
# ---

# Get User Group
# ---
def get_user_group(
    db: Session,
    user_group_select: user_group_schemas.UserGroupSelect,
) -> User_Group:
    try:
        # Get User Group
        # ---
        user_group: User_Group = db.scalar(
            select(User_Group)
            .where(
                User_Group.group_id == user_group_select.group_id,
                User_Group.user_id == user_group_select.user_id,
            )
        )
        if user_group is None:
            raise HTTPException(
                status_code=404,
                detail="User group not found",
            )
        # ---

        # Return
        # ---
        return user_group
        # ---

    except SQLAlchemyError:
        # Database Error
        # ---
        raise HTTPException(
            status_code=400,
            detail="User group was not retrieved",
        )
        # ---
# ---

# Search User Group
# ---
def search_user_group(
    db: Session,
    user_group_search: user_group_schemas.UserGroupSearch,
) -> User_Group:
    try:
        # Get User Group
        # ---
        user_group: User_Group = get_user_group(
            db=db,
            user_group_select=user_group_schemas.UserGroupSelect(
                group_id= groups_table.get_group_id(
                    db=db,
                    group_name=user_group_search.group_name,
                ),
                user_id= users_table.get_user_id(
                    db=db,
                    user_name=user_group_search.user_name,
                ),
            )
        )
        # ---

        # Return
        # ---
        return user_group
        # ---

    except SQLAlchemyError:
        # Database Error
        # ---
        raise HTTPException(
            status_code=400,
            detail="User group was not retrieved",
        )
        # ---
# ---

# Add User
# ---
def add_user(
    db: Session,
    user_group_create: user_group_schemas.UserGroupCreate,
) -> user_group_schemas.UserGroupCreate:
    try:
        # Get User Location
        # ---
        default_location_id: int = users_table.get_user(
            db=db,
            user_id=user_group_create.user_id,
        ).default_location_id
        # ---

        # Check User Group
        # ---
        user_group_check: User_Group = get_user_group(
            db=db,
            user_group_select=user_group_schemas.UserGroupSelect(
                group_id=user_group_create.group_id,
                user_id=user_group_create.user_id,
            )
        )
        if user_group_check is not None:
            raise HTTPException(
                status_code=400,
                detail="User already in group",
            )
        # ---

        # Create New User Group
        # ---
        new_user_group: User_Group = User_Group(
            group_id= user_group_create.group_id,
            user_id= user_group_create.user_id,
            location_id= default_location_id,
            role= user_group_create.role,
            car_capacity= user_group_create.car_capacity,
            is_passenger= user_group_create.is_passenger,
        )
        # ---

        # Update Database
        # ---
        db.add(new_user_group)
        db.commit()
        db.refresh(new_user_group)
        # ---

        # Return
        # ---
        return new_user_group
        # ---

    except SQLAlchemyError:
        # Database Error
        # ---
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="User was not added to group"
        )
        # ---
# ---

# Edit User
# ---
def edit_profile(
    db: Session,
    user_group: User_Group,
    user_group_profile: user_group_schemas.UserGroupProfile
) -> User_Group:
    try:
        # Update Database
        # ---
        user_group.is_passenger = user_group_profile.is_passenger
        user_group.car_capacity = user_group_profile.car_capacity
        db.commit()
        db.refresh(user_group)
        # ---

        return user_group

    except SQLAlchemyError:
        # Database Error
        # ---
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="User profile was not updated"
        )
        # ---
# ---

# Remove User
# ---
def remove_user(
    db: Session,
    user_group: User_Group,
) -> bool:
    try:
        # Remember Group
        # ---
        group_id = user_group.group_id
        # ---

        # Update Database
        # ---
        db.delete(user_group)
        db.commit()
        # ---

        # Return
        # ---
        return has_users(
            db=db,
            group_id=group_id,
        )
        # ---
    
    except SQLAlchemyError:
        # Database Error
        # ---
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="User was not removed",
        )
        # ---
# --