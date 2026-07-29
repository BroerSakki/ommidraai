# Imports
# ---
from fastapi import APIRouter
from app.api.dev.tables import router as table_router
# ---

router = APIRouter(prefix="/dev")

router.include_router(table_router)