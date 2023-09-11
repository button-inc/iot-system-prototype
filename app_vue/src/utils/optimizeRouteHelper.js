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
      "location":{
        "latLng":{
          "latitude": waypoint.lat,
          "longitude": waypoint.long
        }
      }
    }
  });

  const data = {
    "origin": origin,
    "intermediates": intermediates,
    "destination": destination,
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
    "optimizeWaypointOrder": "true",
  };
  return data;
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
  // const data = {
  //   "origin": {
  //     "address": "McLaren+Vale,SA"
  //   },
  //   "intermediates": [
  //     {
  //       "location":{
  //         "latLng":{
  //           "latitude": 37.417670,
  //           "longitude": -122.079595
  //         }
  //       }
  //     },
  //     {
  //       "location":{
  //         "latLng":{
  //           "latitude": 37.419734,
  //           "longitude": -122.0827784
  //         }
  //       }
  //     }
  //   ],
  //   "destination": {
  //     "address": "Adelaide,SA"
  //   },
  //   "travelMode": "DRIVE",
  //   "routingPreference": "TRAFFIC_UNAWARE",
  //   "computeAlternativeRoutes": false,
  //   "routeModifiers": {
  //     "avoidTolls": false,
  //     "avoidHighways": false,
  //     "avoidFerries": false
  //   },
  //   "languageCode": "en-US",
  //   "units": "IMPERIAL",
  //   "optimizeWaypointOrder": "true"
  // };
  // const data = {
  //   "origin": {
  //     "address": "Adelaide,SA"
  //   },
  //   "destination": {
  //     "address": "Adelaide,SA"
  //   },
  //   "intermediates": [
  //     {"address": "Barossa+Valley,SA"},
  //     {"address": "Clare,SA"},
  //     {"address": "Connawarra,SA"},
  //     {"address": "McLaren+Vale,SA"}
  //   ],
  //   "travelMode": "DRIVE",
  //   "optimizeWaypointOrder": "true"
  //   };
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': googFieldMask,
      'X-Goog-Api-Key': googApiKey
    }
  };

  try {
    const response = await axios.post(URL, data, config);
    console.log('data', data);
    console.log('response', response);
    if (response) {
      return response.data;
    }
  } catch(e) {
    console.log('error getting optimized route', e);
  }

};

export default getOptimizedRoute