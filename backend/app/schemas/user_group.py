# Imports
# ---
from app.schemas.user_roles import UserRole
from app.schemas.group import GroupCreate
from pydantic import BaseModel, ConfigDict
# ---
# Classes
# ---
class UserGroupCreate(BaseModel):
    user_id: int
    group_id: int
    role: UserRole
    car_capacity: int
    is_passenger: bool

    model_config = ConfigDict(
        from_attributes=True
    )

class UserGroupResponse(BaseModel):
    User_Group: UserGroupCreate
    Group: GroupCreate

    model_config = ConfigDict(
        from_attributes=True
    )

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