# Imports
# ---
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.location import LocationCreate
from app.services import locations_service
# ---

# Set up APIRouter
# ---
router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)
# ---

# Add
# ---
@router.post("/add", status_code=201)
def add_location(location:LocationCreate, db: Session = Depends(get_db)):
    locations_service.add_location(db=db, location=location)
# ---

# Remove
# ---

# ---