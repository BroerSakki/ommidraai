# Imports
# ---
from app.models.location import Location
from app.schemas.location import LocationCreate
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from fastapi import HTTPException
# ---

# Location ID Service
# ---
def get_location_id(
    db: Session,
    location: LocationCreate,
) -> int | None:
    return db.scalar(
        select(Location.id).where(
            Location.latitude == location.latitude,
            Location.longitude == location.longitude,
        )
    )
# ---

# New Location Service
# ---
def add_location(db: Session, location: LocationCreate) -> int:
    try:
        stmt = (
            insert(Location)
            .values(
                latitude=location.latitude,
                longitude=location.longitude,
            )
            .on_conflict_do_nothing(
                constraint="uq_lat_lon"
            )
            .returning(Location.id)
        )

        location_id = db.execute(stmt).scalar_one_or_none()

        if location_id is None:
            location_id = get_location_id(db, location)

        db.commit()
        return location_id

    except Exception:
        db.rollback()
        raise
# ---