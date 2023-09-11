import { defineStore } from 'pinia'
import { getOptimizedRoute } from '@/utils/optimizeRouteHelper';

export const useRouteStore = defineStore('route', {
  state: () => ({
    selectedRouteList: [], // list of sensor objects part of the route
    isRouteOptimized: false, // when google api has been run on the route and we want to present it
    startPointAddress: '6900 Airport Rd Mississauga ON',
    endPointAddress: '6900 Airport Rd Mississauga ON',
    routeDuration: '',
    routeDistance: ''
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
    getIsRouteOptimized({isRouteOptimized}) {
      return isRouteOptimized;
    },
    getStartPointAddress({startPointAddress}) {
      return startPointAddress;
    },
    getEndPointAddress({endPointAddress}) {
      return endPointAddress;
    },
    getRouteDuration({routeDuration}) {
      return routeDuration;
    },
    getRouteDistance({routeDistance}) {
      return routeDistance;
    }
  },
  actions: {
    setStartPoint(value) {
      this.startPointAddress = value;
    },
    setEndPoint(value) {
      this.endPointAddress = value;
    },
    setRouteDuration(value) {
      this.routeDuration = value;
    },
    setRouteDistance(value) {
      this.routeDistance = value;
    },
    updateRouteListWithSensors(sensors) {
      this.selectedRouteList = [...sensors];
    },
    addSensorToRoute(sensor) {
      this.selectedRouteList.push(sensor);
    },
    removeSensorFromRoute(sensor) {
      const index = this.selectedRouteList.indexOf(sensor);
      if (index > -1) {
        this.selectedRouteList.splice(index, 1);
      }
    },
    clearSensorRoute() {
      this.selectedRouteList = [];
      // reset
      this.isRouteOptimized = false;
    },
    setIsRouteOptimized(value) {
      this.isRouteOptimized = value;
    },
    isAlreadyInRoute(sensor) {
      if (this.getSelectedRouteList.length > 0) {
        return !!this.getSelectedRouteList.find(bin => bin.id === sensor.id);
      }
      return false
    },
    // reorders intermediate points in our selectedRouteList according to a list of given indexes (routeOrder)
    updateWithOptimizedRoute(routeOrder) {
      // assuming routeOrder looks like [originLocationSensor, midLocationSensor1...midLocationSensor4, destinationLocaitonSensor]
      // variable to hold our intermediate waypoints for update (no start/end point included)
      const intermediates = [...this.selectedRouteList];

      // refer to google route order and match it to our defined route
      // copy result to temp
      let temp = [];
      for (let i = 0; i < routeOrder.length; i++) {
        temp[i] = intermediates[routeOrder[i]];
      }

      // replace intermediate waypoint array with temp
      for (let j = 0; j < routeOrder.length; j++) {
        intermediates[j] = temp[j];
      }

      // update saved routelist with new route order
      this.selectedRouteList = [...intermediates];
    },
    async optimizeRoute() {
      // make a call to google
      const googResponse = await getOptimizedRoute(this.getSelectedRouteList, this.startPointAddress, this.endPointAddress);
      if (googResponse && googResponse.routes && googResponse.routes[0]) {
        const routeOrder = googResponse.routes[0].optimizedIntermediateWaypointIndex; // [0,3,4]
        this.updateWithOptimizedRoute(routeOrder); // update current route
        this.setIsRouteOptimized(true); // set flag is optimized to true

        if (googResponse.routes[0].duration) {
          this.setRouteDuration(googResponse.routes[0]?.duration);
        }

        if (googResponse.routes[0].distanceMeters) {
          this.setRouteDistance(googResponse.routes[0]?.distanceMeters);
        }
        
      }
    }
  },
})