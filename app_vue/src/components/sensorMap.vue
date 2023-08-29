<script setup>
import { ref } from 'vue'
import SensorMapMarker from './sensorMapMarker.vue'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'

const props = defineProps({
  sensors: {
    type: Array,
    required: true
  },
  alertThreshold: {
    type: Number
  },
  filterThresholdMaximum: {
    type: Number
  },
  filterThresholdMinimum: {
    type: Number
  }
})

const center = ref([43.7, -79.42])
const zoom = ref(10)
</script>

<template>
  <div v-if="sensors" class="container">
    <l-map ref="map" v-model:zoom="zoom" :use-global-leaflet="false" :center="center">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>

      <l-marker
        v-for="sensor in props.sensors"
        :key="sensor.id"
        :lat-lng="[sensor.lat, sensor.long]"
      >
        <SensorMapMarker 
          :sensor="sensor"
          :alertThreshold="alertThreshold"
          :filterThresholdMaximum="filterThresholdMaximum"
          :filterThresholdMinimum="filterThresholdMinimum">
        </SensorMapMarker>
      </l-marker>
    </l-map>
  </div>
</template>

<style lang="scss" scoped>
  .container {
    width: 800px;
    height: 600px;
  }
</style>
