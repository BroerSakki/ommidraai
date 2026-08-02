# Imports
# ---
from fastapi import APIRouter
from app.api.dev.tables import router as table_router
import httpx
# ---

router = APIRouter(prefix="/dev")

router.include_router(table_router)

# Run a test with berlin test map data
@router.get("/test-osrm")
async def routing_test():
    url = "http://osrm:5000/route/v1/driving/4.897,52.377;4.904,52.369?steps=true&geometries=geojson"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10)
        response.raise_for_status()
        return response.json()