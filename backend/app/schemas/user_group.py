# Imports
# ---
from app.schemas.user_role import UserRole
from pydantic import BaseModel
# ---

# Class
# ---
class UserGroupCreate(BaseModel):
    user_id: int
    group_id: int
    role: UserRole
    car_capacity: int
    is_passenger: bool
# ---