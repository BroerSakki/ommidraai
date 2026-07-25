# Imports
# ---
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
# ---

# Class
# ---
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    password_hash: Mapped[str]
# ---