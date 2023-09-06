import { defineStore } from 'pinia'

export const useRouteStore = defineStore('route', {
  state: () => ({
    sensorRouteList: [], // list of sensor objects part of the route
    enableOptimizeRoute: true, // enables optimize route button to be clicked
  }),
  getters: {
    getSensorRouteList({sensorRouteList}) {
      return sensorRouteList;
    },
    getSensorRouteLatLong({sensorRouteList}) {
      if (sensorRouteList.length > 0) {
        return sensorRouteList.map(sensor => [sensor.lat, sensor.long]);
      }
      return [];
    },
    getEnableOptimizeRoute({enableOptimizeRoute}) {
      return enableOptimizeRoute;
    },
  },
  actions: {
    addSensorToRoute(sensor) {
      this.sensorRouteList.push(sensor);
      this.enableOptimizeRoute = true;
    },
    removeSensorFromRoute(sensor) {
      const index = this.sensorRouteList.indexOf(sensor);
      if (index > -1) {
        this.sensorRouteList.splice(index, 1);
      }
      this.enableOptimizeRoute = true;
    },
    clearSensorRoute() {
      this.sensorRouteList = [];
      this.enableOptimizeRoute = true;
    },
    setEnableOptimizedRoute(value) {
      this.enableOptimizeRoute = value;
    }
  },
})