# Imports
# ---
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
# ---

# Class
# ---
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )
    username: Mapped[str] = mapped_column(
        unique=True
    )
    email: Mapped[str] = mapped_column(
        unique=True
    )
    default_location_id: Mapped[int] = mapped_column(
        ForeignKey("locations.id"),
        nullable=True
    )
    password_hash: Mapped[str]

class User_Location(Base):
    __tablename__ = "user_locations"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )
    location_id: Mapped[int] = mapped_column(
        ForeignKey("locations.id"),
        nullable=False
    )
# ---