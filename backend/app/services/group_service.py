# Import External Libraries
# ---
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, update, exists
from fastapi import HTTPException, Depends
# ---

# Import Local Libraries
# ---
from app.services.user_service import get_user_by_name
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
from app.models.user_location import User_Location
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

# Get User Group
# ---
def get_user_group(
    db: Session,
    group_name: str,
    user: User
) -> User_Group:
    try:
        group: Group = db.scalar(
            select(Group)
            .where(
                Group.name == group_name,
            )
        )
        if group is None:
            raise HTTPException(
                status_code=404,
                detail=f"Group '{group_name}' not found",
            )
        user_group: User_Group = db.scalar(
            select(User_Group)
            .where(
                User_Group.group_id == group.id,
                User_Group.user_id == user.id
            )
        )
        if user_group is None:
            raise HTTPException(
                status_code=404,
                detail=f"User is not in group '{group_name}'",
            )
        return user_group
    except SQLAlchemyError:
        raise HTTPException(
            status_code=400,
            detail=f"Database error while trying to get user group"
        )
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
            role = user_roles.UserRole.owner,
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

# Delete group
# ---
def delete_group(
    db: Session,
    group_id: int,
    current_user: User
):
    group: Group = db.scalar(
        select(Group)
        .where(
            Group.id == group_id,
        )
    )

    if group is None:
        raise HTTPException(
            status_code=404,
            detail="Group doesn't exist",
        )
	
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
            detail="User not apart of the group",
        )

    if not user_roles.can_delete_group(
        role=user_group.role
    ):
        raise HTTPException(
            status_code=403,
            detail=f" Role \"{user_group.role}\" cannot delete this group"
        )

    try:
        db.delete(group)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not delete group"
        )

    return {"message": f"Group '{group.name}' was deleted"}
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
        select(User, User_Group, Location)
        .join(User_Group, User.id == User_Group.user_id)
        .join(Location, Location.id == User.default_location_id) # Assume default location_id is the users location for now
        .where(User_Group.group_id == group_id)
    ).all()

    coords = db.execute(
        select(Group_Location, Location)
        .join(Group_Location, Location.id == Group_Location.location_id)
        .where(Group_Location.group_id == group_id)
    ).all()

    usernames = []
    starts_data = {}
    starts_capacities = {}
    passengers_data = {}
    destinations_data = {}
    passenger_count = 0

    for user, user_group, location in users_data:
        usernames.append(user.username)
        if user_group.is_passenger:
            passengers_data[user.username] = (location.latitude, location.longitude)
            passenger_count += 1
        else:
            starts_data[user.username] = (location.latitude, location.longitude)
            starts_capacities[user.username] = user_group.car_capacity
            passenger_count -= user_group.car_capacity

    for group_location, location in coords:
        destinations_data[group_location.display_name] = (location.latitude, location.longitude)

    routing_data = []
    if starts_data and destinations_data and (passenger_count <= 0):
        routing_data = evaluate_destinations_with_osrm(starts_data=starts_data, starting_capacities=starts_capacities, passengers_data=passengers_data, destinations_data=destinations_data)
    else:
        routing_data = "Input data for routing not valid"

    return {
        "users": [
            {
                "user": {"username": u.username, "email": u.email},
                "user_group": {"is_passenger": ug.is_passenger, "car_capacity": ug.car_capacity},
                "location": {"latitude": loc.latitude, "longitude": loc.longitude}
            }
            for u, ug, loc in users_data
        ],
        "destinations": [
            {
                "group_location": {"display_name": gl.display_name},
                "location": {"latitude": loc.latitude, "longitude": loc.longitude}
            }
            for gl, loc in coords
        ],
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
            Group_Location.group_id == group_id,
        )
    ).all()
    if group_locations is None:
        raise HTTPException(
            status_code=400,
            detail="Group has no destinations"
        )
    return group_locations
# ---

# Search Group Locations
# ---
def search_group_destinations(
    db: Session,
    group_id: int,
    display_name: str,
):
    group_locations = db.scalars(
        select(Group_Location)
        .where(
            Group_Location.group_id == group_id,
            Group_Location.display_name == display_name,
        )
    ).all()
    if group_locations is None:
        raise HTTPException(
            status_code=400,
            detail="Group has no destinations"
        )
    return group_locations
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

# Remove user from group
# ---
def remove_group_user(
    db: Session,
    current_user: User,
    group_id: int,
    username: str,
):
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
            detail=f"User {current_user.username} not found in group",
        )

    user: User = db.scalar(
        select(User)
        .where(
            User.username == username,
        )
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail=f"User {username} doen't exist",
        )

    target_user_group: User_Group = db.scalar(
        select(User_Group)
        .where(
            User_Group.group_id == group_id,
            User_Group.user_id == user.id,
		)
	)

    if target_user_group is None:
        raise HTTPException(
            status_code=404,
            detail=f"User {username} not found in group",
        )

    if not user_roles.can_manage_user(
        actor=user_group.role,
        target=target_user_group.role
    ):
        raise HTTPException(
            status_code=403,
            detail=f" Role \"{user_group.role}\" cannot remove \"{username}\""
        )

    try:
        db.delete(user)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not remove user from the group"
        )
    
    return {"message": f"User '{username}' was removed from the group"}
# ---

# Update User Role
# ---
def update_user_role(
    db: Session,
    current_user: User,
    group_name: str,
    user_name: str,
    role: user_roles.UserRole,
):
    try:
        actor: User_Group = get_user_group(
            db=db,
            group_name=group_name,
            user=current_user,
        )
        target: User_Group = get_user_group(
            db=db,
            group_name=group_name,
            user=get_user_by_name(
                db=db,
                user_name=user_name,
            )
        )
        if not user_roles.can_manage_user(
            actor=actor.role,
            target= target.role,
        ):
            raise HTTPException(
                status_code=403,
                detail="Permission denied",
            )
        target.role = role
        if role == user_roles.UserRole.owner:
            actor.role = user_roles.UserRole.admin
        db.commit()
        db.refresh(target)
        return target
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not update user permissions"
        )
# ---

# Get Members
# ---
def get_user_group_members(
    db: Session,
    group_id: int,
):
    try:
        user_groups = db.scalars(
            select(User_Group)
            .where(
                User_Group.group_id == group_id
            )
        ).all()
        return user_groups
    except SQLAlchemyError:
        raise HTTPException(
            status_code=400,
            detail="Could not connect to user groups"
        )
# ---

# Leave User Group
# ---
def leave_user_group(
    db: Session,
    current_user: User,
    group_name: str,
):
    user_group: User_Group = get_user_group(
        db=db,
        group_name=group_name,
        user=current_user,
    )
    try:
        db.delete(user_group)
        db.commit()
        if get_user_group_members(
            db=db,
            group_id=user_group.group_id,
        ) is None:
            group: Group = db.scalar(
                select(Group)
                .where(
                    Group.name == group_name,
                )
            )
            if group is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Group '{group_name}' not found"
                )
            db.delete(group)
            db.commit()
    except SQLAlchemyError:
        raise HTTPException(
            status_code=400,
            detail="Could not leave group",
        )
    return f"Left group '{group_name}'"
# ---

def update_user_group_data(
    db: Session,
    current_user: User,
    group_id: int,
    car_capacity: int,
    is_passenger: bool,
):
    try:
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
                detail=f"User {current_user.username} not found in group",
            )
        user_group.is_passenger = is_passenger
        user_group.car_capacity = car_capacity
        db.commit()
        db.refresh(user_group)
        return user_group
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Couldn't update user_group data",
        )