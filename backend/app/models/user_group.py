# Imports
# ---
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
# ---

# Class
# ---
class User_Group(Base):
    __tablename__ = "user_groups"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        primary_key=True
    )
    group_id: Mapped[int] = mapped_column(
        ForeignKey("groups.id"),
        primary_key=True
    )
    location_id: Mapped[int] = mapped_column(
        ForeignKey("locations.id"),
        nullable=False
    )
    role: Mapped[str]
    car_capacity: Mapped[int] = mapped_column(
        default=0
    )
    is_passenger: Mapped[bool] = mapped_column(
        default=False,
        nullable=False
    )
# ---