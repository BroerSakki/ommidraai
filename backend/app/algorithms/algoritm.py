import heapq
from app.algorithms.osrm_functions import query_osrm_table, query_osrm_route

def evaluate_destinations_with_osrm(starts_data, starting_capacities, passengers_data, destinations_data, osrm_host="osrm:5000"):
    """
    Computes optimal destination rankings by minimizing maximum individual distance.
	starts_data = {'S1': ({latitude}, {longtitude}), ...}
    Accepts starting_capacities as a dictionary: { 'S1': 1, 'S2': 2 }
    """
    start_nodes = list(starts_data.keys())
    passengers = list(passengers_data.keys())
    destinations = list(destinations_data.keys())
    
    # 1. PARSE AND MAP GEOLOCATIONS FOR OSRM TABLE
    all_keys = start_nodes + passengers + destinations
    all_coords = [starts_data[k] if k in starts_data else (passengers_data[k] if k in passengers_data else destinations_data[k]) for k in all_keys]
    
    key_to_idx = {key: idx for idx, key in enumerate(all_keys)}
    key_to_coord = {key: coord for key, coord in zip(all_keys, all_coords)}
    source_keys = start_nodes + passengers
    dest_keys = passengers + destinations
    
    # Generate the distance matrix from OSRM
    source_indices = [key_to_idx[k] for k in source_keys]
    dest_indices = [key_to_idx[k] for k in dest_keys]
    raw_matrix = query_osrm_table(all_coords, source_indices, dest_indices, osrm_host)
    
    distance_matrix = {}
    for s_i, src_key in enumerate(source_keys):
        distance_matrix[src_key] = {}
        for d_i, dest_key in enumerate(dest_keys):
            val = raw_matrix[s_i][d_i]
            if val is not None:
                distance_matrix[src_key][dest_key] = val
                
    # Dijkstra to record all valid mask combinations at destination
    num_passengers = len(passengers)
    target_mask = (1 << num_passengers) - 1
    pass_to_bit = {p: i for i, p in enumerate(passengers)}
    
    def dijkstra_virtual_all_masks(start_node, initial_capacity, dest_node):
        distances = {}
        pq = [(0, start_node, 0, initial_capacity, [start_node])]
        distances[(start_node, 0, initial_capacity)] = 0
        destination_results = {}
        
        while pq:
            cost, u, mask, cap, path = heapq.heappop(pq)
            if cost > distances.get((u, mask, cap), float('inf')):
                continue
            if u == dest_node:
                if mask not in destination_results or cost < destination_results[mask][0]:
                    destination_results[mask] = (cost, path)
                continue
            if u in destinations and u != dest_node:
                continue

            next_hops = [p for p in passengers if u != p] + [dest_node]
            for v in next_hops:
                if u not in distance_matrix or v not in distance_matrix[u]:
                    continue
                weight = distance_matrix[u][v]
                next_cost = cost + weight
                next_path = path + [v]
                
                # Pickup pickup logic branch
                if v in pass_to_bit and cap > 0:
                    bit_idx = pass_to_bit[v]
                    if not (mask & (1 << bit_idx)):
                        next_mask = mask | (1 << bit_idx)
                        next_cap = cap - 1
                        state = (v, next_mask, next_cap)
                        if next_cost < distances.get(state, float('inf')):
                            distances[state] = next_cost
                            heapq.heappush(pq, (next_cost, v, next_mask, next_cap, next_path))
                
                # Default travel pass-through logic branch
                state = (v, mask, cap)
                if next_cost < distances.get(state, float('inf')):
                    distances[state] = next_cost
                    heapq.heappush(pq, (next_cost, v, mask, cap, next_path))
                    
        return destination_results

    # Evaluate combinations and rank destinations
    ranking = []
    
    for d in destinations:
        node_routes = {}
        for s in start_nodes:
            cap = starting_capacities[s] # Pull dynamically from function parameters
            node_routes[s] = dijkstra_virtual_all_masks(s, cap, d)
            
        min_destination_bottleneck = float('inf')
        best_assignment_details = {}
        
        def find_combinations(start_idx, current_combined_mask, current_max_dist, current_assignment):
            nonlocal min_destination_bottleneck, best_assignment_details
            if start_idx == len(start_nodes):
                if current_combined_mask == target_mask:
                    if current_max_dist < min_destination_bottleneck:
                        min_destination_bottleneck = current_max_dist
                        best_assignment_details = dict(current_assignment)
                return
                
            s = start_nodes[start_idx]
            for mask, (dist, path) in node_routes[s].items():
                current_assignment[s] = {"distance": dist, "path": path, "mask": mask}
                find_combinations(
                    start_idx + 1, 
                    current_combined_mask | mask, 
                    max(current_max_dist, dist), 
                    current_assignment
                )
                del current_assignment[s]

        find_combinations(0, 0, 0, {})
        
        if min_destination_bottleneck != float('inf'):
            # Fetch the exact driving geometry from OSRM for every assigned route
            routes_with_geometry = {}
            for s, route_details in best_assignment_details.items():
                path_coords = [key_to_coord[k] for k in route_details["path"]]
                try:
                    geometry, _route_distance = query_osrm_route(path_coords, osrm_host)
                except Exception:
                    geometry = None

                routes_with_geometry[s] = {
                    "distance": route_details["distance"],
                    "geometry": geometry,
                    "path": route_details["path"]
                }

            ranking.append({
                "destination": d,
                "bottleneck": min_destination_bottleneck,
                "routes": routes_with_geometry
            })
            
    ranking.sort(key=lambda x: x["bottleneck"])
    return ranking
