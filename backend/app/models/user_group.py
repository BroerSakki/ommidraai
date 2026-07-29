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

    id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        primary_key=True
    )
    group_id: Mapped[int] = mapped_column(
        ForeignKey("groups.id"),
        primary_key=True
    )
    role: Mapped[str]
# ---