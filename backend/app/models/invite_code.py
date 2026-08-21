# Imports
# ---
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
# ---

# Class
# ---
class Invite_Code(Base):
    __tablename__ = "invite_codes"
    code: Mapped[int] = mapped_column(
        primary_key=True,
        nullable=False
    )
    origin_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    group_id: Mapped[int] = mapped_column(
        ForeignKey("groups.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
    role: Mapped[str]
# ---