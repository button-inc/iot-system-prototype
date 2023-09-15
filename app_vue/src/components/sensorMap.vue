<script setup>
  import { reactive, onMounted, watch, onBeforeMount, onDeactivated } from 'vue'
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
  const { getSensors } = storeToRefs(sensorStore);
  const routeStore = useRouteStore();
  const { 
    getSelectedRouteLatLong, 
    getIsRouteGenerated,
    getStartPointAddress,
    getEndPointAddress } = storeToRefs(routeStore);

  const state = reactive({
    location: 'bottomright',
    device: useDevice(),
    isRouteGenerated: false,
    polyLineLatLngs: [],
    startPointLatLng: [],
    endPointLatLng: [],
    zoom: 10,
    center: [43.7, -79.42],
    sensors: []
  });

  const startImgUrl = 'src/assets/images/feather-disc.svg';
  const endImgUrl = 'src/assets/images/feather-map-pin.svg';

  onBeforeMount(async () => {
    // processing start/end/center lat lng points
    state.startPointLatLng = await getLatLng(routeStore.getStartPointAddress);
    state.endPointLatLng = await getLatLng(routeStore.getEndPointAddress);
    state.center = state.startPointLatLng;

    routeStore.setHasMappedStartEnd(true);
  })

  onMounted(() => {
    positionZoom();
    window.addEventListener("resize", positionZoom);
    state.sensors = sensorStore.getSensors;
  });

  onDeactivated(() => {
    routeStore.setHasMappedStartEnd(false);
  })

  watch(getSensors, () => {
    state.sensors = sensorStore.getSensors;
  })

  // when route updates, update the map polylines
  watch(getSelectedRouteLatLong, () => {
    state.polyLineLatLngs = routeStore.getSelectedRouteLatLong;

    // additional lines for start and end points
    if (state.startPointLatLng.length && state.endPointLatLng.length) {
      state.polyLineLatLngs.unshift(state.startPointLatLng); // append as first element
      state.polyLineLatLngs.push(state.endPointLatLng); // append as last element
    }
  }, { deep: true })

  watch(getIsRouteGenerated, () => {
    state.isRouteGenerated = routeStore.getIsRouteGenerated;
  })

  // when start point gets updated
  watch(getStartPointAddress, async() => {
    routeStore.setHasMappedStartEnd(false);
    state.startPointLatLng = await getLatLng(routeStore.getStartPointAddress); // get start point
    state.polyLineLatLngs = routeStore.getSelectedRouteLatLong; // get route polyline

    appendStartEndPolylines();
    state.center = state.startPointLatLng; // update map center
    routeStore.setHasMappedStartEnd(true);
  })

  // when end point gets updated
  watch(getEndPointAddress, async() => {
    routeStore.setHasMappedStartEnd(false);
    state.endPointLatLng = await getLatLng(routeStore.getEndPointAddress); // get end point
    state.polyLineLatLngs = routeStore.getSelectedRouteLatLong; // get route polyline

    appendStartEndPolylines()
    routeStore.setHasMappedStartEnd(true);
  })

  function appendStartEndPolylines() {
    if (state.startPointLatLng.length && state.endPointLatLng.length) {
      state.polyLineLatLngs.unshift(state.startPointLatLng); // append as first element
      state.polyLineLatLngs.push(state.endPointLatLng); // append as last element
    }
  }

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
  <div class="sensor-map-container">
    <l-map ref="map" v-model:zoom="state.zoom" :use-global-leaflet="false" :center="state.center" :options="{zoomControl: false}">
      <l-control-zoom v-if="state.location" :position="state.location"/>
      <!-- alternative maps URLS (for aesthetic): -->
      <!-- https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png -->
      <!-- https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png -->
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>

      <!-- route polyline -->
      <l-polyline v-if="state.isRouteGenerated" :lat-lngs="state.polyLineLatLngs"></l-polyline>

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


      <template v-if="state.sensors && state.sensors.length">
        <template v-for="sensor in state.sensors"
          :key="sensor.id">
          <l-marker v-if="sensor"
            :lat-lng="[sensor.lat, sensor.long]"
          >
            <SensorMapMarker :sensor="sensor"></SensorMapMarker>
          </l-marker>
        </template>
      </template>

      
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
