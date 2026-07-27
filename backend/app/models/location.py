# Imports
# ---
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry
from app.database import Base
# ---

# Class
# ---
class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    geom: Mapped[Geometry] = mapped_column(Geometry(geometry_type="POINT", srid=4326))
# ---