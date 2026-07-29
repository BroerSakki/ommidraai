# Imports
# ---
from pydantic import BaseModel
# ---

# Class
# ---
class GroupLocationCreate(BaseModel):
    group_id: int
    location_id: int
    ranking: int
# ---