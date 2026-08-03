# Imports
# ---
from fastapi import APIRouter
from app.services.locations_service import get_place_name
from app.schemas.location import LocationCreate
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/locations",
    tags=["Dev - Locations"]
)
# ---

# Run a test with berlin test map data
# ---
@router.post("/get_name")
async def get_location_name(location: LocationCreate):
    return await get_place_name(location=location)
# ---