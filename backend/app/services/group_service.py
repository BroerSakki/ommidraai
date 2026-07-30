# Import External Libraries
# ---
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from fastapi import HTTPException, Depends
# ---

# Import Schemas
# ---
from app.schemas.user_roles import UserRole
from app.schemas.group import GroupCreate
from app.schemas.location import LocationCreate
# ---

# Import Models
# ---
from app.models.group import Group
from app.models.user import User
from app.models.user_group import User_Group
# ---

# Get current user groups
# ---
def get_current_user_groups(
    db: Session,
    current_user: User
): 
    # Go get from user_group all group_ids that current user_id is in
    return db.scalars(
        select(User_Group)
        .where(
            User_Group.user_id == current_user.id
        )
    ).all()
# ---

# New Group Service
# ---
def create_group(
    db: Session,
    group: GroupCreate,
    current_user: User
):
    try:
        # Add Group
        new_group = Group(
            name=group.name,
        )
        db.add(new_group)
        db.flush()

        # Add User to Group
        new_user_group = User_Group(
            user_id = current_user.id,
            group_id = new_group.id,
            role = UserRole.admin,
        )

        # Do user group insert
        db.add(new_user_group)

        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Unable to create group")
    finally:
        db.refresh(new_group)
        db.refresh(new_user_group)
    return new_group
# ---

# Get needed data of a specific group for frontend
# ---
def get_group_data():
    # Check if user is logged in
    
    # Verify that user is apart of that group
    
    # Return group data
    return True
# ---

# Add location to group
# ---
def add_group_location(db: Session, location: LocationCreate):
    # Check if user is logged in
    
	# Verify that user is admin on the group
    
	# Add location to group
    return True
# ---

# Delete location from group
# ---
def delete_group_location():
    # Check if user is logged in
    
	# Verify that user is admin on the group
    
	# Delete location from group
    return True
# ---

# Create invite
# ---
def create_invite():
    # Check if user is logged in
    
    # Verify that user is admin on the group
    
    # Create invite in invite table
    return True
# ---

# Add user to group
# ---
def add_group_user():
    # Check if user is logged in
    
    # Check if user_id exists in invite table
    
    # Add user to user_group and remove from invite
    return True
# ---

# Add user to group
# ---
def delete_group_user():
    # Check if user is logged in
    
    # Check if current user is admin on the group
    
    # Remove user from table
    return True
# ---