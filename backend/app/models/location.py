# Imports
# ---
from sqlalchemy import Float, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
# ---

# Class
# ---
class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint('latitude', 'longitude', name='uq_lat_lon'),
    )
# ---