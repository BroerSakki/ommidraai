# Imports
# ---
from pydantic import BaseModel
# ---

# Classes
# ---
class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: int | None = None
# ---