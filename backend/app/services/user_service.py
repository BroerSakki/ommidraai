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
# ---

# Import Schemas
# ---
from app.schemas.user_location import UserLocationCreate
from app.schemas.location import LocationCreate
# ---

# Get Current User Locations
# ---
def get_current_user_locations(
    db: Session,
    current_user: User,
):
    user_locations = db.scalars(
        select(User_Location)
        .where(
            User_Location.user_id == current_user.id
        )
    ).all()
    return user_locations
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