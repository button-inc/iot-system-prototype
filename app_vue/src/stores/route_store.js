import { defineStore } from 'pinia'

export const useRouteStore = defineStore('route', {
  state: () => ({
    selectedRouteList: [], // list of sensor objects part of the route
    enableOptimizeRoute: true, // enables optimize route button to be clicked
    isRouteOptimized: false
  }),
  getters: {
    getSelectedRouteList({selectedRouteList}) {
      return selectedRouteList;
    },
    getSelectedRouteLatLong({selectedRouteList}) {
      if (selectedRouteList.length > 0) {
        return selectedRouteList.map(sensor => [sensor.lat, sensor.long]);
      }
      return [];
    },
    getEnableOptimizeRoute({enableOptimizeRoute}) {
      return enableOptimizeRoute;
    },
    getIsRouteOptimized({isRouteOptimized}) {
      return isRouteOptimized;
    },
  },
  actions: {
    addSensorToRoute(sensor) {
      this.selectedRouteList.push(sensor);
      // reset
      this.enableOptimizeRoute = true;
      this.isRouteOptimized = false;
    },
    removeSensorFromRoute(sensor) {
      const index = this.selectedRouteList.indexOf(sensor);
      if (index > -1) {
        this.selectedRouteList.splice(index, 1);
      }
      // reset
      this.enableOptimizeRoute = true;
      this.isRouteOptimized = false;
    },
    clearSensorRoute() {
      this.selectedRouteList = [];
      // reset
      this.enableOptimizeRoute = true;
      this.isRouteOptimized = false;
    },
    setEnableOptimizedRoute(value) {
      this.enableOptimizeRoute = value;
    },
    setIsRouteOptimized(value) {
      this.isRouteOptimized = value;
    },
    // reorders intermediate points in our selectedRouteList according to a list of given indexes (routeOrder)
    updateWithOptimizedRoute(routeOrder) {
      // assuming routeOrder looks like [originLocationSensor, midLocationSensor1...midLocationSensor4, destinationLocaitonSensor]
      // variable to hold our intermediate waypoints for update (no start/end point included)
      const intermediates = [...this.selectedRouteList];
      intermediates.shift(); // remove start point
      intermediates.pop(); // remove end point

      // refer to google route order and match it to our defined route
      // copy result to temp
      let temp = [];
      const arrLength = intermediates.length;
      for (let i = 0; i < arrLength; i++) {
        temp[routeOrder[i]] = intermediates[i];
      }

      // replace intermediate waypoint array with temp
      for (let j = 0; j < arrLength; j++) {
        intermediates[j] = temp[j];
      }

      // update saved routelist with new route order
      this.selectedRouteList.splice(1, intermediates.length, ...intermediates);
    }
  },
})