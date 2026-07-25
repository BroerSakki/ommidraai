# Imports
# ---
from pydantic import BaseModel
# ---

# Classes
# ---
class UserCreate(BaseModel):
        usename: str
        password: str

class UserRespond(BaseModel):
    id: int
    username: str

    model_config = {
        "from_attributes": True
    }
# ---