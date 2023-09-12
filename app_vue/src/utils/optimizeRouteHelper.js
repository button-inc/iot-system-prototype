import axios from 'axios';

// reorders intermediate points in our selectedRouteList according to a list of given indexes (newRouteIndexOrder)
export const getNewOptimizedRoute = (selectedRouteList, newRouteIndexOrder) => {
  // assuming newRouteIndexOrder looks like [originLocationSensor, midLocationSensor1...midLocationSensor4, destinationLocaitonSensor]
  // variable to hold our intermediate waypoints for update (no start/end point included)
  const intermediates = [...selectedRouteList];

  // refer to google route order and match it to our defined route
  // copy result to temp
  let temp = [];
  for (let i = 0; i < newRouteIndexOrder.length; i++) {
    temp[i] = intermediates[newRouteIndexOrder[i]];
  }

  // replace intermediate waypoint array with temp
  for (let j = 0; j < newRouteIndexOrder.length; j++) {
    intermediates[j] = temp[j];
  }

  // return new route order
  return [...intermediates];
};

const getGoogPayload = (selectedRouteList, originAddress, destinationAddress, optimize = true) => {
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
    "optimizeWaypointOrder": optimize ? "true" : "false"
  };
};

// google api call to optimize route
// https://developers.google.com/maps/documentation/routes/opt-way
export const getOptimizedRouteData = async (selectedRouteList, originAddress, destinationAddress, optimize = true) => {

  if (selectedRouteList && selectedRouteList.length === 0) {
    return;
  }
  // google headers
  const googApiKey = 'AIzaSyAgixnED4py56GFy-b2hlfYgofEyISUjSo';
  const googFieldMask = 'routes.duration,routes.distanceMeters,routes.optimizedIntermediateWaypointIndex';
  const URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
  const data = getGoogPayload(selectedRouteList, originAddress, destinationAddress, optimize);
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

export default getOptimizedRouteData