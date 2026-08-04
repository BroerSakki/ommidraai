# Import External Libraries
# ---
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, update, exists
from fastapi import HTTPException, Depends
# ---

# Import Local Libraries
# ---
from app.services.locations_service import add_location
from app.algorithms.algoritm import evaluate_destinations_with_osrm
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
from app.models.location import Location
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
        # Check if group exists
        group_check = db.scalar(
            select(Group)
            .where(
                Group.name == group.name,
            )
        )
        if group_check is not None:
            raise HTTPException(
                status_code=400,
                detail="Group name already in use"
            )

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
            location_id = current_user.default_location_id,
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
def get_group_data(
    db: Session,
    current_user: User,
    group_id: int
):
    is_member = db.scalar(
        select(exists().where(
            User_Group.group_id == group_id,
            User_Group.user_id == current_user.id
        ))
    )

    if not is_member:
        raise HTTPException(
            status_code=400,
            detail="User not in group"
        )
    
    users_data = db.execute(
        select(User.username, User_Group.is_passenger, User_Group.car_capacity, Location.longitude, Location.latitude)
        .join(User_Group, User.id == User_Group.user_id)
        .join(Location, Location.id == User.default_location_id) # Assume default location_id is the users location for now
        .where(User_Group.group_id == group_id)
    ).all()

    coords = db.execute(
        select(Location.id, Location.longitude, Location.latitude)
        .join(Group_Location, Location.id == Group_Location.location_id)
        .where(Group_Location.group_id == group_id)
    ).all()

    usernames = []
    starts_data = {}
    starts_capacities = {}
    passengers_data = {}
    destinations_data = {}

    for username, is_passenger, car_capacity, longtitude, latitude in users_data:
        usernames.append(username)
        if is_passenger:
            passengers_data[username] = (longtitude, latitude)
        else:
            starts_data[username] = (longtitude, latitude)
            starts_capacities[username] = car_capacity

    for id, longtitude, latitude in coords:
        destinations_data[id] = (longtitude, latitude)

    routing_data = []
    if starts_data and destinations_data:
        routing_data = evaluate_destinations_with_osrm(starts_data=starts_data, starting_capacities=starts_capacities, passengers_data=passengers_data, destinations_data=destinations_data)

    return {
        "usernames": usernames,
        "destinations": destinations_data,
        "algorithm": routing_data
	}
# ---

# Get All Group Locations
# ---
def get_group_destinations(
    db: Session,
    group_id: int,
):
    group_locations = db.scalars(
        select(Group_Location)
        .where(
            Group_Location.group_id == group_id
        )
    )
    if group_locations is None:
        raise HTTPException(
            status_code=400,
            detail="Group has no destinations"
        )
    return group_locations
# ---

# Search Group Locations
# ---

# ---

# Add location to group
# ---
def add_group_location(
    db: Session,
    location: LocationCreate,
    current_user: User,
    group_id: int,
    display_name: str,
):
    if display_name is None:
        raise HTTPException(
            status_code=400,
            detail="Display Name required"
        )

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
            display_name = display_name,
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
    location_name: str,
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
            Group_Location.display_name == location_name,
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

    return {"message": f"Location '{location_name}' was removed from the group"}
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