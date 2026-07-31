# Imports
# ---
from enum import Enum
from pydantic import BaseModel, Field
from app.schemas.user_roles import UserRole
# ---

# Classes
# ---
class InviteRole(str, Enum):
    admin = "admin"
    member = "member"
    guest = "guest"

class InviteCreate(BaseModel):
    user_id: int
    origin_id: int
    group_id: int
    role: InviteRole
# ---