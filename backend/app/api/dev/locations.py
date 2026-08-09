# Import External Librarises
# ---
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
# ---

# Import Local Libraries
# ---
from app.database import get_db
from app.services import locations_service
from app.schemas.location import LocationCreate
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/locations",
    tags=["Dev - Locations"]
)
# ---

# Add
# ---
@router.post("/add", status_code=201)
def add_location(
    location:LocationCreate,
    db: Session = Depends(get_db)
):
    return locations_service.add_location(db=db, location=location)
# ---

# Run a test with berlin test map data
# ---
@router.post("/get_name")
async def get_location_name(location: LocationCreate):
    return await locations_service.get_place_name(location=location)
# ---

# Remove
# ---
@router.delete("/delete", status_code=201)
def delete_location(
    location_id: int,
    db: Session = Depends(get_db)
):
    return locations_service.delete_location(
        location_id=location_id,
        db=db,
    )
# ---
