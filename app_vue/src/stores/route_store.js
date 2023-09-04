import { defineStore } from 'pinia'

export const useRouteStore = defineStore('route', {
  state: () => ({
    sensorRouteList: [] // list of sensor objects part of the route
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
    }
  },
  actions: {
    addSensorToRoute(sensor) {
      this.sensorRouteList.push(sensor);
    },
    removeSensorFromRoute(sensor) {
      const index = this.sensorRouteList.indexOf(sensor);
      if (index > -1) {
        this.sensorRouteList.splice(index, 1);
      }
    },
    clearSensorRoute() {
      this.sensorRouteList = [];
    }
  },
})