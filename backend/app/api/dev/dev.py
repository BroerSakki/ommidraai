# Imports
# ---
from fastapi import APIRouter
from app.api.dev.tables import router as table_router
from app.api.dev.experimental import router as experimental_router
# ---

router = APIRouter(prefix="/dev")

router.include_router(table_router)
router.include_router(experimental_router)