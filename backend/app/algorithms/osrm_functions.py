import requests

def query_osrm_table(all_coords, source_indices, dest_indices, osrm_host="osrm:5000"):
    """
    Sends a single optimized query to the OSRM Table Service endpoint.

    all_coords must be a list of (latitude, longitude) tuples. Returns the
    distance matrix in metres for the requested source/destination indices.
    """
    coord_str = ";".join([f"{lon},{lat}" for lat, lon in all_coords])
    sources_param = ";".join(map(str, source_indices))
    dests_param = ";".join(map(str, dest_indices))
    
    url = f"http://{osrm_host}/table/v1/driving/{coord_str}"
    params = {
        "annotations": "distance",
        "sources": sources_param,
        "destinations": dests_param
    }
    
    response = requests.get(url, params=params).json()
    if response.get("code") != "Ok":
        raise Exception("OSRM Query Failed")
    
    return response["distances"]

def query_osrm_route(coords, osrm_host="osrm:5000"):
    """
    Sends a query to the OSRM Route Service endpoint and returns the full
    driving geometry for an ordered list of waypoints.

    coords: ordered list of (latitude, longitude) tuples.
    Returns: (encoded_polyline, distance_meters).

    `overview=full` and `geometries=polyline` ensure OSRM returns the exact
    driving path (every shape point) as an encoded polyline instead of a
    simplified line or only breadcrumb-style waypoints.
    """
    coord_str = ";".join([f"{lon},{lat}" for lat, lon in coords])
    url = f"http://{osrm_host}/route/v1/driving/{coord_str}"
    params = {
        "overview": "full",
        "geometries": "polyline",
        "steps": "false"
    }

    response = requests.get(url, params=params).json()
    if response.get("code") != "Ok" or not response.get("routes"):
        raise Exception("OSRM Route Query Failed")

    route = response["routes"][0]
    geometry = route.get("geometry", "")
    distance = route.get("distance", 0)

    return geometry, distance