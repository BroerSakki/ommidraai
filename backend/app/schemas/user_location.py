# Imports
# ---
from pydantic import BaseModel, Field
from app.schemas.location import LocationCreate
# ---

# Class
# ---
class UserLocationCreate(BaseModel):
    name: str = Field(min_length=3)
    location: LocationCreate
# ---