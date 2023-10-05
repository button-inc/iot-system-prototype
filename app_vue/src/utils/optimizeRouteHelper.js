import axios from 'axios';

const ENV_API_BASE_URL = process.env.VUE_APP_API_HOST || 'http://localhost:8080';

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

// google api call to optimize route
// https://developers.google.com/maps/documentation/routes/opt-way
export const getOptimizedRouteData = async (selectedRouteList, originAddress, destinationAddress, optimize = true) => {
  if (selectedRouteList && selectedRouteList.length === 0) {
    return;
  }

  const URL = ENV_API_BASE_URL + '/getOptimizedRoute'; // Updated URL
  const data = {
    selectedRouteList: selectedRouteList.map((waypoint) => ({ lat: waypoint.lat, long: waypoint.long })),
    originAddress: originAddress,
    destinationAddress: destinationAddress,
    to_optimize: optimize
  };

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await axios.post(URL, data, config);
    if (response) {
      return response.data;
    }
  } catch (e) {
    console.error('error getting optimized route', e);
  }
};

export default getOptimizedRouteData;
