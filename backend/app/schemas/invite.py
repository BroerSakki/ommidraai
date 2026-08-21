# Imports
# ---
from enum import Enum
from pydantic import BaseModel
from app.schemas import user_roles
# ---

# Classes
# ---
class InviteCreate(BaseModel):
    user_id: int
    origin_id: int
    group_id: int
    role: user_roles.InviteRole
# ---