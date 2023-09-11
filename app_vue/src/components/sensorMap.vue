<script setup>
  import { reactive, onMounted, watch, onBeforeMount } from 'vue'
  import SensorMapMarker from '@/components/sensorMapMarker.vue';
  import 'leaflet/dist/leaflet.css'
  import { LMap, LTileLayer, LMarker, LControlZoom, LPolyline, LIcon } from '@vue-leaflet/vue-leaflet'
  import { useDevice, DEVICE_SIZE } from '@/utils/screenSizeHelper';
  import { getLatLng } from '@/utils/getLatLngFromAddressHelper';
  import { useSensorStore } from '@/stores/sensors_store';
  import { useRouteStore } from '@/stores/route_store';
  import { storeToRefs } from 'pinia';

  // stores
  const sensorStore = useSensorStore();
  const { sensors } = storeToRefs(sensorStore);
  const routeStore = useRouteStore();
  const { 
    getSelectedRouteLatLong, 
    getIsRouteOptimized } = storeToRefs(routeStore);

  const state = reactive({
    location: 'bottomright',
    device: useDevice(),
    isRouteOptimized: false,
    polyLineLatLngs: [],
    startPointLatLng: [],
    endPointLatLng: [],
    zoom: 10,
    center: [43.7, -79.42]
  });

  const startImgUrl = 'src/assets/images/feather-disc.svg';
  const endImgUrl = 'src/assets/images/feather-map-pin.svg';

  onBeforeMount(async () => {
    state.startPointLatLng = await getLatLng(routeStore.getStartPointAddress);
    state.endPointLatLng = await getLatLng(routeStore.getEndPointAddress);
    state.center = state.startPointLatLng;
  })

  onMounted(() => {
    positionZoom();
    window.addEventListener("resize", positionZoom);
  });

  watch(getSelectedRouteLatLong, () => {
    state.polyLineLatLngs = routeStore.getSelectedRouteLatLong;

    // additional lines for start and end points
    if (state.startPointLatLng.length && state.endPointLatLng.length) {
      state.polyLineLatLngs.unshift(state.startPointLatLng);
      state.polyLineLatLngs.push(state.endPointLatLng);
    }
  }, { deep: true })

  watch(getIsRouteOptimized, () => {
    state.isRouteOptimized = routeStore.getIsRouteOptimized;
  })

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
      <!-- alternative maps URLS (for aesthetic): -->
      <!-- https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png -->
      <!-- https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png -->
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-polyline v-if="state.isRouteOptimized" :lat-lngs="state.polyLineLatLngs"></l-polyline>

      <!-- starting point marker -->
      <l-marker v-if="state.startPointLatLng.length"
        :lat-lng="state.startPointLatLng">
        <l-icon class="color-green" :icon-size="[25, 25]" :icon-anchor="[15, 14]" :icon-url="startImgUrl" />
      </l-marker>

      <!-- ending point marker -->
      <l-marker v-if="state.endPointLatLng.length"
        :lat-lng="state.endPointLatLng">
        <l-icon :icon-size="[25, 25]" :icon-anchor="[12, 14]" :icon-url="endImgUrl" />
      </l-marker>


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
