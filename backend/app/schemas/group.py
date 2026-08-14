# Imports
# ---
from pydantic import BaseModel, ConfigDict
# ---

# Classes
# ---
class GroupCreate(BaseModel):
    name: str

    model_config = ConfigDict(
        from_attributes=True
    )
# ---