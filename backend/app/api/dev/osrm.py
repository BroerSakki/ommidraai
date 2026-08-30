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
    url = "http://osrm:5000/route/v1/driving/13.33686282844628,52.59413890226844;13.342355992293388,52.54656282080115?steps=false&geometries=polyline&overview=full"
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
    	'S1': (52.5170, 13.3888),
    	'S2': (52.5210, 13.3910)
	}
    start_capacities = {
	    'S1': 1,
	    'S2': 2
	}
    passengers_data = {
	    'P1': (52.5162, 13.3777),
	    'P2': (52.5300, 13.4012)
	}
    destinations_data = {
	    'D1': (52.5204, 13.3424),
	    'D2': (52.5100, 13.4100)
	}
    return evaluate_destinations_with_osrm(starts_data=start_data, starting_capacities=start_capacities, passengers_data=passengers_data, destinations_data=destinations_data)
# ---