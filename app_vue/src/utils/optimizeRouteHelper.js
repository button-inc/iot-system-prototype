import axios from 'axios';

const getGoogPayload = (selectedRouteList, originAddress, destinationAddress) => {
  const origin = {
    "address": originAddress
  };
  const destination = {
    "address": destinationAddress
  };
  const waypointArr = [...selectedRouteList]; // ensures original variable isnt modified
  const intermediates = waypointArr.map(waypoint => {
    return {
      "location": {
        "latLng": {
          "latitude": waypoint.lat,
          "longitude": waypoint.long
        }
      }
    }
  });

  return {
    origin,
    intermediates,
    destination,
    "travelMode": "DRIVE",
    "routingPreference": "TRAFFIC_UNAWARE",
    "computeAlternativeRoutes": false,
    "routeModifiers": {
      "avoidTolls": false,
      "avoidHighways": false,
      "avoidFerries": false
    },
    "languageCode": "en-US",
    "units": "IMPERIAL",
    "optimizeWaypointOrder": "true"
  };
};

// google api call to optimize route
// https://developers.google.com/maps/documentation/routes/opt-way
export const getOptimizedRoute = async (selectedRouteList, originAddress, destinationAddress) => {

  if (selectedRouteList && selectedRouteList.length === 0) {
    return;
  }
  // google headers
  const googApiKey = 'AIzaSyAgixnED4py56GFy-b2hlfYgofEyISUjSo';
  const googFieldMask = 'routes.duration,routes.distanceMeters,routes.optimizedIntermediateWaypointIndex';
  const URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
  const data = getGoogPayload(selectedRouteList, originAddress, destinationAddress);
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': googFieldMask,
      'X-Goog-Api-Key': googApiKey
    }
  };

  try {
    // if there is an empty object returned, then there is an incorrect lat/long passed
    const response = await axios.post(URL, data, config);
    if (response) {
      return response.data;
    }
  } catch(e) {
    console.log('error getting optimized route', e);
  }

};

export default getOptimizedRoute