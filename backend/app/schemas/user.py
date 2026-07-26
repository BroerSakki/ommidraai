# Imports
# ---
from pydantic import BaseModel, EmailStr, Field
# ---

# Classes
# ---
class UserCreate(BaseModel):
        usename: str = Field(min_length=3)
        email: EmailStr
        password: str = Field(min_length=8)

class UserRespond(BaseModel):
    id: int
    username: str

    model_config = {
        "from_attributes": True
    }
# ---