# Imports
# ---
from app.schemas.user_role import UserRole
from pydantic import BaseModel
# ---
# Classes
# ---
class UserGroupCreate(BaseModel):
    user_id: int
    group_id: int
    role: UserRole
    car_capacity: int
    is_passenger: bool

class UserGroupSelect(BaseModel):
    group_id: int
    user_id: int

class UserGroupSearch(BaseModel):
    group_name: str
    user_name: str
class UserGroupProfile(BaseModel):
    car_capacity: int
    is_passenger: bool
# ---