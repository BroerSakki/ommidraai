# Imports
# ---
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.location import LocationCreate
# ---

# Class
# ---
class UserLocationCreate(BaseModel):
    name: str = Field(min_length=3)
    location: LocationCreate

class UserLocationResponse(BaseModel):
    name: str
    latitude: float
    longitude: float

    model_config = ConfigDict(
        from_attributes=True
    )
# ---