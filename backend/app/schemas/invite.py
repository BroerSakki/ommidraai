# Imports
# ---
from pydantic import BaseModel, Field
from app.schemas.user_roles import UserRole
# ---

# Classes
# ---
class InviteCreate(BaseModel):
    user_id: int
    origin_id: int
    group_id: int
    role: UserRole
# ---