# Imports
# ---
from fastapi import APIRouter
from app.api.dev.tables import router as tables_router
from app.api.dev.osrm import router as osrm_router
from app.api.dev.locations import router as locations_router
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/dev"
)
# ---

# Add Routers
# ---
router.include_router(tables_router)
router.include_router(osrm_router)
router.include_router(locations_router)
# ---