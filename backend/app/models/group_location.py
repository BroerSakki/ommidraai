# Imports
# ---
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
# ---

# Class
# ---
class Group_Location(Base):
    __tablename__ = "group_locations"

    group_id: Mapped[int] = mapped_column(
        ForeignKey("groups.id"),
        primary_key=True,
        nullable=False
    )
    location_id: Mapped[int] = mapped_column(
        ForeignKey("locations.id"),
        primary_key=True,
        nullable=False
    )
    ranking: Mapped[int | None] = mapped_column(
        nullable=True,
    )
    display_name: Mapped[str] = mapped_column(
        nullable=False
    )
# ---