<script setup lang="ts">
import RoutingMachineTest from './routingMachineTest.vue';
import { onMounted, ref } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';

const waypoints = [
  { lat: 38.7436056, lng: -9.2304153 },
  { lat: 38.7436056, lng: -0.131281 }
]

const mapId = 'map'
const mapObject = ref(null)
const zoom = 6
const center = { lat: 38.7436056, lng: -2.2304153 }
const osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
const attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

onMounted(() => {
  mapObject.value = L.map(mapId, {
    zoom,
    center
  })

  L.tileLayer(osmUrl, {
    attribution
  }).addTo(mapObject)
})
</script>

<template>
  <div>
    <div :id="mapId" class="map"></div>
    <!-- <routing-machine-test :mapObject="mapObject" :waypoints="waypoints" /> -->
  </div>
</template>

<style>
.map {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
