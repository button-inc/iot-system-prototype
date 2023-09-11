<script setup>
  import { reactive, onMounted, watch } from 'vue'
  import SensorMapMarker from '@/components/sensorMapMarker.vue';
  import 'leaflet/dist/leaflet.css'
  import { LMap, LTileLayer, LMarker, LControlZoom, LPolyline } from '@vue-leaflet/vue-leaflet'
  import { useDevice, DEVICE_SIZE } from '@/utils/screenSizeHelper';
  import { useSensorStore } from '@/stores/sensors_store';
  import { useRouteStore } from '@/stores/route_store';
  import { storeToRefs } from 'pinia';

  // stores
  const sensorStore = useSensorStore();
  const { sensors } = storeToRefs(sensorStore);
  const routeStore = useRouteStore();
  const { getSelectedRouteLatLong, getIsRouteOptimized } = storeToRefs(routeStore);

  const state = reactive({
    location: 'bottomright',
    device: useDevice(),
    isRouteOptimized: false,
    polyLineLatLngs: [],
    zoom: 10,
    center: [43.7, -79.42] // TODO: update to possibly be user's current location
  });

  watch(getSelectedRouteLatLong, () => {
    state.polyLineLatLngs = routeStore.getSelectedRouteLatLong;
  }, { deep: true })

  watch(getIsRouteOptimized, () => {
    state.isRouteOptimized = routeStore.getIsRouteOptimized;
    console.log('state.isRouteOptimized', state.isRouteOptimized)
  })

  onMounted(() => {
    positionZoom();
    window.addEventListener("resize", positionZoom);
  });

  function positionZoom() {
    state.device = useDevice();
    if (state.device.size === DEVICE_SIZE.s || state.device.size === DEVICE_SIZE.xs) {
      state.location = 'topright';
    } else {
      state.location = 'bottomright';
    }
  }
</script>

<template>
  <div v-if="sensors" class="sensor-map-container">
    <l-map ref="map" v-model:zoom="state.zoom" :use-global-leaflet="false" :center="state.center" :options="{zoomControl: false}">
      <l-control-zoom :position="state.location"/>
      <!-- alternative maps (for aesthetic): -->
      <!-- favourite: https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png -->
      <!-- another one: https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png -->
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-polyline v-if="state.isRouteOptimized" :lat-lngs="state.polyLineLatLngs"></l-polyline>

      <l-marker
        v-for="sensor in sensors"
        :key="sensor.id"
        :lat-lng="[sensor.lat, sensor.long]"
      >
        <SensorMapMarker :sensor="sensor">
        </SensorMapMarker>
      </l-marker>
    </l-map>
  </div>
</template>

<style lang="scss" scoped>
  // leaflet css override for mobile views

  :deep .leaflet-pane .leaflet-layer { // handles map opacity level
    opacity: 0.70 !important;
  }
  :deep .leaflet-popup-content {
    margin: 13px 0 13px 0;

    @include smallScreens {
      margin: 20px;
    }
  }
  :deep .leaflet-popup-content-wrapper {
    width: 300px;
    height: 300px;
    overflow-y: scroll;
    overflow-x: hidden;

    @include smallScreens {
      width: inherit;
      height: inherit;
    }
  }

  // custom css
  .sensor-map-container {
    width: 100%;
    height: 100vh;

    // leaflet library popup close button override
    :deep .leaflet-container a.leaflet-popup-close-button{
      top: 2px;
      right: 4px;
    }
  }

</style>
