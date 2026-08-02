# Import External Libraries
# ---
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, update
from fastapi import HTTPException, Depends
# ---

# Import Local Libraries
# ---
from app.services.locations_service import add_location
# ---

# Import Schemas
# ---
from app.schemas import user_roles
from app.schemas.group import GroupCreate
from app.schemas.location import LocationCreate
from app.schemas import invite
# ---

# Import Models
# ---
from app.models.group import Group
from app.models.user import User
from app.models.user_group import User_Group
from app.models.group_location import Group_Location
from app.models.invite import Invite
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
            role = user_roles.UserRole.creator,
        )

        # Do user group insert
        db.add(new_user_group)

        db.commit()

        db.refresh(new_group)
        db.refresh(new_user_group)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Unable to create group"
        )
    return new_group
# ---

# Get needed data of a specific group for frontend
# ---
def get_group_data(db: Session, group: Group):
    # Check if user is logged in
    
    # Verify that user is apart of that group
    
    # Return group data
    # Get users

    # Get Locations
    return True
# ---

# Add location to group
# ---
def add_group_location(
    db: Session,
    location: LocationCreate,
    current_user: User,
    group_id: int
):
    user_group: User_Group = db.scalar(
        select(User_Group)
        .where(
            User_Group.group_id == group_id,
            User_Group.user_id == current_user.id,
        )
    )

    # Verify Permissions
    if not user_roles.can_manage_locations(
        role=user_group.role
    ):
        raise HTTPException(
            status_code=403,
            detail="Permission denied"
        )
	# Add location to group
    location_id = add_location(
        db=db,
        location=location
    )
    try:
        new_group_location = Group_Location(
            group_id = user_group.group_id,
            location_id = location_id,
        )

        db.add(new_group_location)
        db.commit()
        db.refresh(new_group_location)
       
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not add a location to the group"
        )

    return new_group_location
# ---

# Delete location from group
# ---
def remove_group_location(
    db: Session,
    current_user: User,
    location_id: int,
    group_id: int,
):
	# Find User Group
    # ---
    user_group: User_Group = db.scalar(
        select(User_Group)
        .where(
            User_Group.group_id == group_id,
            User_Group.user_id == current_user.id,
        )
    )
    if user_group is None:
        raise HTTPException(
            status_code=404,
            detail="Group could not be found",
        )
    # ---

    # Verify Permissions
    # ---
    if not user_roles.can_manage_locations(
        role=user_group.role
    ):
        raise HTTPException(
            status_code=403,
            detail=f" Role \"{user_group.role}\" cannot manage locations"
        )
    # ---

    # Find Group Location
    # ---
    group_location: Group_Location = db.scalar(
        select(Group_Location)
        .where(
            Group_Location.group_id == group_id,
            Group_Location.location_id == location_id,
        )
    )
    if group_location is None:
        raise HTTPException(
            status_code=404,
            detail="Location cannot be found in group"
        )
    # ---

	# Delete location from group
    # ---
    try:
        db.delete(group_location)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not remove location from the group"
        )
    # ---

    return {"message": f"Location with id {location_id} was removed from the group"}
# ---

# Add user to group
# ---
def remove_group_user():
    # Check if user is logged in
    
    # Check if current user is admin on the group
    
    # Remove user from table
    return True
# ---

def update_user_group_data(
    db: Session,
    current_user: User,
    group_id: int,
    car_capacity: int,
    is_passenger: bool
):
    try:
        db.execute(
            update(User_Group)
            .where(User_Group.user_id == current_user, User_Group.group_id == group_id)
            .values(car_capacity=car_capacity, is_passenger=is_passenger)
        )
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Couldn't update user_group data"
        )