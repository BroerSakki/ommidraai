# Import External Libraries
# ---
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
# ---

# Import Local Libraries
# ---
from app.services import locations_service
# ---

# Import Models
# ---
from app.models.user import User
from app.models.user_location import User_Location
from app.models.location import Location
# ---

# Import Schemas
# ---
from app.schemas.user_location import UserLocationCreate, UserLocationResponse
from app.schemas.location import LocationCreate
# ---

# Get Current User Locations
# ---
def get_current_user_locations(
    db: Session,
    current_user: User,
):
    results = db.execute(
        select(User_Location, Location)
        .join(Location, Location.id == User_Location.location_id)
        .where(
            User_Location.user_id == current_user.id
        )
    ).all()

    return [
        UserLocationResponse(
            name=ul.name,
            latitude=loc.latitude,
            longitude=loc.longitude,
        )
        for ul, loc in results
    ]
# ---

# Add User Location
# ---
def add_user_location(
    db: Session,
    current_user: User,
    user_location: UserLocationCreate
):
    try:
        # Check if name is used
        # ---
        user_location_check = db.scalar(
            select(User_Location)
            .where(
                User_Location.name == user_location.name
            )
        )
        if user_location_check is not None:
            raise HTTPException(
                status_code=400,
                detail=f"Name \"{user_location.name}\" already in use"
            )
        # ---

        # Add location
        # ---
        location_id = locations_service.add_location(
            db=db,
            location=user_location.location
        )
        new_user_location = User_Location(
            location_id = location_id,
            user_id = current_user.id,
            name = user_location.name,
        )
        db.add(new_user_location)
        db.commit()
        # ---
        
    except SQLAlchemyError:
        raise HTTPException(
            status_code=400,
            detail="User location was not added"
        )
    finally:
        db.refresh(new_user_location)
    return new_user_location
# ---

# Get Default Location
# ---
def get_default_user_location(
    db: Session,
    default_location_id: int,
):
    try:
        user_location: User_Location = db.scalar(
            select(User_Location)
            .where(
                User_Location.location_id == default_location_id,
            )
        )
        if user_location is None:
            raise HTTPException(
                status_code=404,
                detail=f"Location not found",
            )

        return user_location
    except SQLAlchemyError:
        raise HTTPException(
            status_code=400,
            detail="Default location not returned",
        )
# ---

# User By Name
# ---
def get_user_by_name(
    db: Session,
    user_name: str
) -> User:
    try:
        user: User = db.scalar(
            select(User)
            .where(
                User.username == user_name,
            )
        )
        if user is None:
            raise HTTPException(
                status_code=404,
                detail=f"User '{user_name}' not found",
            )
        return user
    except SQLAlchemyError:
        raise HTTPException(
            status_code=400,
            detail=f"Could not access user '{user_name}'"
        )
# ---

# Remove User Location
# ---
def remove_user_location(
    db: Session,
    current_user: User,
    location_name: str,
):
    # Find Location
    # ---
    user_location: User_Location = db.scalar(
        select(User_Location)
        .where(
            User_Location.user_id == current_user.id,
            User_Location.name == location_name,
        )
    )
    if user_location is None:
        raise HTTPException(
            status_code=404,
            detail="Location cannot be found"
        )
    # ---

	# Delete location
    # ---
    try:
        db.delete(user_location)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not remove location"
        )
    # ---

    return {"message": f"Location '{location_name}' was removed"}
# ---

# Update Current User Default Location
# ---
def update_user_default_location(
    db: Session,
    current_user: User,
    name: str,
):
    user_location: User_Location = db.scalar(
        select(User_Location)
        .where(
            User_Location.user_id == current_user.id,
            User_Location.name == name,
        )
    )

    if user_location is None:
        raise HTTPException(
            status_code=404,
            detail="User has no saved locations",
        )

    current_user.default_location_id = user_location.location_id
    db.commit()
    db.refresh(current_user)
    return current_user
# ---