# Imports
# ---
from pydantic import BaseModel
from app.schemas import user_roles
# ---

# Class
# ---
class Invite_Code_Create(BaseModel):
    code: int
    origin_id: int
    group_id: int
    role: user_roles.InviteRole
# ---