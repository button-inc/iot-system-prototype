import os
from pydantic import BaseModel
from typing import Optional, List, Dict, Union

def get_optimized_routes_payload(selectedRouteList, originAddress, destinationAddress, to_optimize):
    origin = {
        "address": originAddress
    }
    destination = {
        "address": destinationAddress
    }
    intermediates = [
        {
            "location": {
                "latLng": {
                    "latitude": waypoint['lat'],
                    "longitude": waypoint['long']
                }
            }
        } for waypoint in selectedRouteList
    ]
    
    if to_optimize:
        GOOG_FIELD_MASK = 'routes.duration,routes.distanceMeters,routes.optimizedIntermediateWaypointIndex'
        optimizeWaypointOrder = True
    else:
        GOOG_FIELD_MASK = 'routes.duration,routes.distanceMeters'
        optimizeWaypointOrder = False

    return {
        "origin": origin,
        "intermediates": intermediates,
        "destination": destination,
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_UNAWARE",
        "computeAlternativeRoutes": False,
        "routeModifiers": {
            "avoidTolls": False,
            "avoidHighways": False,
            "avoidFerries": False
        },
        "languageCode": "en-US",
        "units": "IMPERIAL",
        "optimizeWaypointOrder": optimizeWaypointOrder
    }, GOOG_FIELD_MASK

class RouteRequest(BaseModel):
    selectedRouteList: List[Dict[str, float]]
    originAddress: str
    destinationAddress: str
    to_optimize: bool