# Imports
# ---
from pydantic import BaseModel, ConfigDict, EmailStr, Field
# ---

# Classes
# ---
class UserCreate(BaseModel):
    username: str = Field(min_length=3)
    email: EmailStr
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    default_location_id: int

    model_config = ConfigDict(
        from_attributes=True
    )
# ---