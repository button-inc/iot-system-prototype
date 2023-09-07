import axios from 'axios';

// google api call to optimize route
// https://developers.google.com/maps/documentation/routes/opt-way
export const getOptimizedRoute = async () => {
  const googApiKey = 'AIzaSyAgixnED4py56GFy-b2hlfYgofEyISUjSo'; //TODO: move to .env
  //TODO: add routes.optimizedIntermediateWaypointIndex to the field mask when ready to use optimized waypoint
  const googFieldMask = 'routes.duration,routes.distanceMeters,routes.optimizedIntermediateWaypointIndex'; 

  const URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
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
    "optimizeWaypointOrder": "true", // TODO: uncomment to enable special feature that charges us advanced:route pricing
  };
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': googFieldMask,
      'X-Goog-Api-Key': googApiKey
    }
  }

  try {
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
  } catch(e) {
    console.log('error getting optimized route', e);
  }

};

export default getOptimizedRoute