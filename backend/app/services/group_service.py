# Import External Libraries
# ---
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from fastapi import HTTPException, Depends
# ---

# Import Local Libraries
# ---
from app.services.locations_service import add_location
# ---

# Import Schemas
# ---
from app.schemas.user_roles import UserRole
from app.schemas.group import GroupCreate
from app.schemas.location import LocationCreate
from app.schemas.invite import InviteCreate
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
            role = UserRole.admin,
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

    # Verify that user is admin on the group
    if user_group.role != UserRole.admin:
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
def delete_group_location():
    # Check if user is logged in
    
	# Verify that user is admin on the group
    
	# Delete location from group
    return True
# ---

# Get current user groups
# ---
def get_current_user_invites(
    db: Session,
    current_user: User,
): 
    # Go get from user_group all group_ids that current user_id is in
    return db.scalars(
        select(Invite)
        .where(
            Invite.user_id == current_user.id
        )
    ).all()
# ---

# Create invite
# ---
def create_invite(
    db: Session,
    current_user: User,
    group_id: int,
    username: str,
    role: UserRole
):
    user_group: User_Group = db.scalar(
        select(User_Group)
        .where(
            User_Group.group_id == group_id,
            User_Group.user_id == current_user.id,
        )
    )

    # Verify that user is admin on the group
    if user_group.role != UserRole.admin:
        raise HTTPException(
            status_code=403,
            detail="Permission denied"
        )

    # Get invitee user details
    invitee_user: User = db.scalar(
        select(User)
        .where(
            User.username == username
        )
    )

    if invitee_user == None:
        raise HTTPException(
            status_code=400,
            detail="User does not exist"
        )

    invitee_user_group: User_Group = db.scalar(
        select(User_Group)
        .where(
            User_Group.group_id == group_id,
            User_Group.user_id == invitee_user.id
		)
	)

    if invitee_user_group != None:
        raise HTTPException(
            status_code=400,
            detail="User already in group"
        )

    # Create invite in invite table
    try:
        new_invite = Invite(
            user_id=invitee_user.id,
            group_id=group_id,
            role=role
        )

        db.add(new_invite)
        db.commit()
        db.refresh(new_invite)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invite could not be created"
		)
    
    return new_invite
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