# Imports
# ---
from fastapi import APIRouter
from app.algorithms.algoritm import evaluate_destinations_with_osrm
import httpx
# ---

# Router Setup
# ---
router = APIRouter(
    prefix="/osrm",
    tags=["Dev-osrm"]
)
# ---

# Run a test with berlin test map data
# ---
@router.get("/test")
async def routing_test():
    url = "http://osrm:5000/route/v1/driving/4.897,52.377;4.904,52.369?steps=true&geometries=geojson"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
# ---

# Run an algorithm test on Berlin test map data
# ---
@router.get("/test-algorithm")
def algorithm_test():
    # These are locations in Berlin as we already have downloaded Berlin test map data
    start_data = {
    	'S1': (13.3888, 52.5170),
    	'S2': (13.3910, 52.5210)
	}
    start_capacities = {
	    'S1': 1,
	    'S2': 2
	}
    passengers_data = {
	    'P1': (13.3777, 52.5162),
	    'P2': (13.4012, 52.5300)
	}
    destinations_data = {
	    'D1': (13.3424, 52.5204),
	    'D2': (13.4100, 52.5100)
	}
    return evaluate_destinations_with_osrm(starts_data=start_data, starting_capacities=start_capacities, passengers_data=passengers_data, destinations_data=destinations_data)
# ---