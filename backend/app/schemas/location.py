# Imports
# ---
from pydantic import BaseModel
# ---

# Classes
# ---
class LocationCreate(BaseModel):
    latitude: float
    longitude: float
# ---