import axios from 'axios';

export const getOptimizedRoute = async () => {
  const googApiKey = 'AIzaSyAgixnED4py56GFy-b2hlfYgofEyISUjSo';
  //TODO: add routes.optimizedIntermediateWaypointIndex to the field mask when ready to use optimized waypoint
  const googFieldMask = 'routes.duration,routes.distanceMeters'; 

  const URL = 'https://routespreferred.googleapis.com/v1:computeRoutes';
  // sample data
  const data = {
    "origin": { // specify starting point
      "location":{
        "latLng":{
          "latitude": 37.419734,
          "longitude": -122.0827784
        }
      }
    },
    "intermediates": [ // in-between
      {
        "location":{
          "latLng":{
            "latitude": 37.417670,
            "longitude": -122.069595
          }
        }
      },
      {
        "location":{
          "latLng":{
            "latitude": 37.427670,
            "longitude": -122.069595
          }
        }
      }
    ],
    "destination":{ // specify ending point
      "location":{
        "latLng":{
          "latitude": 37.417670,
          "longitude": -122.079595
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
    //"optimizeWaypointOrder": "true", // TODO: uncomment to enable special feature that charges us advanced:route pricing
  };
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': googFieldMask,
      'X-Goog-Api-Key': googApiKey
    }
  }
  const response = await axios.post(URL, data, config);
  if (response) {
    console.log('response', response);
    /*
    response should return index indicating optimal order for routes defined in "intermediate"
    if defined correct googFieldMask
    "optimizedIntermediateWaypointIndex": [
        3,
        2,
        0,
        1
    ]
    */
  }
};

export default getOptimizedRoute