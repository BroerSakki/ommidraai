# Imports
# ---
from app.models.location import Location
from app.schemas.location import LocationCreate
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from fastapi import HTTPException
import httpx
import asyncio
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
def add_location(
    db: Session,
    location: LocationCreate
) -> int:
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

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not add location",
        )
# ---

# Delete Location
# ---
def delete_location(
    location_id: int,
    db: Session,
):
    try:
        location = db.scalar(
            select(Location)
            .where(
                Location.id == location_id,
            )
        )
        if location is None:
            raise HTTPException(
                status_code=404,
                detail=f"Location with id '{location_id}' could not be found"
            )
        
        db.delete(location)
        db.commit()

        return f"Removed location with id '{location_id}'"
    except SQLAlchemyError:
        raise HTTPException(
            status_code=400,
            detail=f"Could not remove location with id '{location_id}'"
        )
# ---

# Get location Place Name
# ---
async def get_place_name(
    location: LocationCreate
):
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": location.latitude,
        "lon": location.longitude,
        "format": "jsonv2",
    }
    headers = {
        "User-Agent": "ommidraai/1.0 (contact: 2025050949@akademiastudente.co.za)",
        "Accept": "application/json",
        "Accept-Language": "en",
    }

    try:
        # Respect the public Nominatim 1 request/second usage policy.
        await asyncio.sleep(1)

        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                params=params,
                headers=headers,
                timeout=15.0,
                follow_redirects=True,
            )
            response.raise_for_status()

        data = response.json()
        display_name = data.get("display_name")

        if not display_name:
            raise HTTPException(
                status_code=404,
                detail="No place name could be resolved for the provided coordinates.",
            )

        return display_name

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"OSM API returned error status: {e.response.status_code}",
        ) from e
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Network error while contacting the OSM API: {e}",
        ) from e
# ---