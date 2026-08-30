from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from app.algorithms.osrm_functions import query_osrm_table, query_osrm_route

# Penalty (in metres) used when OSRM reports a point pair as unreachable, so
# the solver skips those arcs instead of crashing on a None matrix entry.
UNREACHABLE_PENALTY = 10 ** 9

def evaluate_destinations_with_osrm(starts_data, starting_capacities, passengers_data, destinations_data, osrm_host="osrm:5000"):
    start_nodes = list(starts_data.keys())
    passengers = list(passengers_data.keys())
    destinations = list(destinations_data.keys())
    
    ranking = []
    
    for d in destinations:
        # Build node translation matrix specifically for this destination evaluation instance
        # Order: [Drivers...] + [Passengers...] + [Target Destination]
        active_nodes = start_nodes + passengers + [d]
        num_vehicles = len(start_nodes)
        
        key_to_idx = {key: idx for idx, key in enumerate(active_nodes)}
        idx_to_key = {idx: key for idx, key in enumerate(active_nodes)}
        all_coords = [starts_data[k] if k in starts_data else (passengers_data[k] if k in passengers_data else destinations_data[k]) for k in active_nodes]
        
        # Build unified distance table matrix
        raw_matrix = query_osrm_table(all_coords, list(range(len(active_nodes))), list(range(len(active_nodes))), osrm_host)
        
        # Define vehicle configurations
        # Every vehicle starts at its driver node index and must finish at the target destination index
        starts = [key_to_idx[s] for s in start_nodes]
        ends = [key_to_idx[d]] * num_vehicles
        
        manager = pywrapcp.RoutingIndexManager(len(active_nodes), num_vehicles, starts, ends)
        routing = pywrapcp.RoutingModel(manager)
        
        # Transit callback tracking distance
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            value = raw_matrix[from_node][to_node]
            return int(value) if value is not None else UNREACHABLE_PENALTY
            
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # Add Distance Dimension with Global Span Cost to optimize for bottleneck minimization
        routing.AddDimension(
            transit_callback_index,
            0,            # Null slack allowance
            4000000,      # Max capacity distance constraint per car (~4000km)
            True,         # Fix start cumulative tracks directly from zero
            "Distance"
        )
        distance_dimension = routing.GetDimensionOrDie("Distance")
        distance_dimension.SetGlobalSpanCostCoefficient(100000) # Predominant bottleneck factor
        
        # Add Demands Dimension to manage seat capacity restrictions smoothly
        # Drivers/Destinations use 0 demand, passenger pickups consume 1 capacity seat
        node_demands = [0] * len(active_nodes)
        for p in passengers:
            node_demands[key_to_idx[p]] = 1
            
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            return node_demands[from_node]
            
        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        
        vehicle_capacities = [starting_capacities[s] for s in start_nodes]
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,                  # Null capacity slack allowance
            vehicle_capacities, # Array of distinct vehicle limits
            True,               # Fix start tracking constraints to zero
            "Capacity"
        )
        
        # Configure metaheuristic parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = 2 # 2-second hard exit threshold
        
        solution = routing.SolveWithParameters(search_parameters)
        
        if solution:
            routes_with_geometry = {}
            destination_bottleneck = 0
            
            for vehicle_id in range(num_vehicles):
                driver_key = start_nodes[vehicle_id]
                index = routing.Start(vehicle_id)
                
                path_nodes = []
                while not routing.IsEnd(index):
                    node_idx = manager.IndexToNode(index)
                    path_nodes.append(idx_to_key[node_idx])
                    index = solution.Value(routing.NextVar(index))
                path_nodes.append(d) # Append destination endpoint node
                
                # Fetch route distance from cumulative tracker variables
                route_dist = solution.Value(distance_dimension.CumulVar(routing.End(vehicle_id)))
                
                # Extract clean coordinate maps for route polyline processing
                path_coords = [all_coords[key_to_idx[k]] for k in path_nodes]
                try:
                    geometry, osrm_route_distance = query_osrm_route(path_coords, osrm_host)
                    if osrm_route_distance:
                        route_dist = osrm_route_distance
                except Exception:
                    geometry = None

                destination_bottleneck = max(destination_bottleneck, route_dist)
                    
                routes_with_geometry[driver_key] = {
                    "distance": route_dist,
                    "geometry": geometry,
                    "path": path_nodes
                }
                
            ranking.append({
                "destination": d,
                "bottleneck": destination_bottleneck,
                "routes": routes_with_geometry
            })
            
    ranking.sort(key=lambda x: x["bottleneck"])
    return ranking
