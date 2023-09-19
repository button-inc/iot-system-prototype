from dotenv import load_dotenv
import os
from pydantic import BaseModel
from typing import Optional, List, Dict, Union
import httpx

load_dotenv()

goog_routes_api_key = os.environ.get("GOOGLE_ROUTES_API_KEY")
goog_routes_url = os.environ.get("GOOGLE_ROUTES_URL")

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

# TODO: Allow origin and destination to be lat/long
class RouteRequest(BaseModel):
    selectedRouteList: List[Dict[str, float]]
    originAddress: str
    destinationAddress: str
    to_optimize: bool = True

async def get_optimized_routes_response(request):
    data, goog_field_mask = get_optimized_routes_payload(request.selectedRouteList, request.originAddress, request.destinationAddress, request.to_optimize)
    
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': goog_field_mask,
        'X-Goog-Api-Key': goog_routes_api_key
    }

    async with httpx.AsyncClient() as client:  
        response = await client.post(goog_routes_url, json=data, headers=headers) 
    
    return response
