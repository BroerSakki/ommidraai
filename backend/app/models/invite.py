# Imports
# ---
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
# ---

# Class
# ---
class Invite(Base):
    __tablename__ = "invites"
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        primary_key=True,
        nullable=False
    )
    group_id: Mapped[int] = mapped_column(
        ForeignKey("groups.id"),
        primary_key=True,
        nullable=False
    )
    role: Mapped[str]
# ---