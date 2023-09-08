import axios from 'axios';

const getGoogPayload = (selectedRouteList) => {
  const waypointArr = [...selectedRouteList]; // ensures original variable isnt modified
  const origin = waypointArr.shift(); // grab first sensor in route
  const destination = waypointArr.pop(); // grab last sensor in route
  
  const intermediates = waypointArr.map(waypoint => {
    return {
      "location":{
        "latLng":{
          "latitude": waypoint.lat,
          "longitude": waypoint.long
        }
      }
    }
  });

  const data = {
    "origin": { // specify starting point
      "location":{
        "latLng":{
          "latitude": origin.lat,
          "longitude": origin.long
        }
      }
    },
    intermediates,
    "destination":{ // specify ending point
      "location":{
        "latLng":{
          "latitude": destination.lat,
          "longitude": destination.long
        }
      }
    },
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
    "optimizeWaypointOrder": "true", // note this special feature being true charges us advanced:route pricing
  };
  return data;
};

// google api call to optimize route
// https://developers.google.com/maps/documentation/routes/opt-way
export const getOptimizedRoute = async (selectedRouteList) => {

  if (selectedRouteList && selectedRouteList.length === 0) {
    return;
  }
  // google headers
  const googApiKey = 'AIzaSyAgixnED4py56GFy-b2hlfYgofEyISUjSo'; //TODO: move to .env
  const googFieldMask = 'routes.duration,routes.distanceMeters,routes.optimizedIntermediateWaypointIndex';
  const URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
  const data = getGoogPayload(selectedRouteList);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': googFieldMask,
      'X-Goog-Api-Key': googApiKey
    }
  };

  try {
    const response = await axios.post(URL, data, config);
    if (response) {
      return response.data;
    }
  } catch(e) {
    console.log('error getting optimized route', e);
  }

};

export default getOptimizedRoute