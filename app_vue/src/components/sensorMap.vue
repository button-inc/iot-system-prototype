<script setup>
import { reactive, ref, onMounted, watch, onBeforeMount, onDeactivated } from 'vue';
import SensorMapMarker from '@/components/sensorMapMarker.vue';
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LControlZoom, LPolyline, LIcon } from '@vue-leaflet/vue-leaflet';
import { useDevice, DEVICE_SIZE } from '@/utils/screenSizeHelper';
import { getLatLng } from '@/utils/geoCodingHelper';
import { useSensorStore } from '@/stores/sensors_store';
import { useRouteStore } from '@/stores/route_store';
import { storeToRefs } from 'pinia';
import { decodePolyline } from '@/utils/polylineHelper';

// stores
const sensorStore = useSensorStore();
const { getSensors } = storeToRefs(sensorStore);
const routeStore = useRouteStore();
const { getShouldDisplayRoute, getStartPointAddress, getEndPointAddress, getGoogEncodedPolyline } = storeToRefs(routeStore);

// element variables
const state = reactive({
  location: 'bottomright',
  device: useDevice(),
  shouldDisplayRoute: false,
  polyLineLatLngs: [],
  startPointLatLng: [],
  endPointLatLng: [],
  zoom: 10,
  center: [43.7, -79.42],
  sensors: []
});
const startImgUrl = 'src/assets/images/feather-disc.svg';
const endImgUrl = 'src/assets/images/feather-map-pin.svg';
const leafletMap = ref(null); // ref to access leafletMap object

onBeforeMount(async () => {
  // processing start/end/center lat lng points
  state.startPointLatLng = await getLatLng(routeStore.getStartPointAddress);
  state.endPointLatLng = await getLatLng(routeStore.getEndPointAddress);
  state.center = state.startPointLatLng;

  routeStore.setHasMappedStartEnd(true);
});

onMounted(() => {
  positionZoom();
  window.addEventListener('resize', positionZoom);
  state.sensors = sensorStore.getSensors;
});

watch(getSensors, () => {
  state.sensors = sensorStore.getSensors;
});

watch(getShouldDisplayRoute, () => {
  state.shouldDisplayRoute = routeStore.getShouldDisplayRoute;
});

// when we have gathered a new polyline from google routes response
watch(getGoogEncodedPolyline, async () => {
  const encoded = routeStore.getGoogEncodedPolyline;
  if (!encoded) {
    return;
  }
  const latlngsArr = await decodePolyline(encoded);

  // update route polyline
  state.polyLineLatLngs = latlngsArr;
  state.center = latlngsArr[0];
});

// when start point gets updated
watch(getStartPointAddress, async () => {
  routeStore.setHasMappedStartEnd(false);
  state.startPointLatLng = await getLatLng(routeStore.getStartPointAddress); // get start point

  state.center = state.startPointLatLng; // update map center
  routeStore.setHasMappedStartEnd(true);
});

// when end point gets updated
watch(getEndPointAddress, async () => {
  routeStore.setHasMappedStartEnd(false);
  state.endPointLatLng = await getLatLng(routeStore.getEndPointAddress); // get end point
  routeStore.setHasMappedStartEnd(true);
});

function positionZoom() {
  state.device = useDevice();
  if (state.device.size === DEVICE_SIZE.s || state.device.size === DEVICE_SIZE.xs) {
    state.location = 'topright';
  } else {
    state.location = 'bottomright';
  }
}

onDeactivated(() => {
  routeStore.setHasMappedStartEnd(false);
});
</script>

<template>
  <div class="sensor-map-container">
    <l-map
      ref="leafletMap"
      v-model:zoom="state.zoom"
      :use-global-leaflet="false"
      :center="state.center"
      :options="{ zoomControl: false }"
    >
      <l-control-zoom
        v-if="state.location"
        :position="state.location"
      />
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>

      <!-- route polyline -->
      <l-polyline
        v-if="state.shouldDisplayRoute"
        :lat-lngs="state.polyLineLatLngs"
      ></l-polyline>

      <!-- starting point marker -->
      <l-marker
        v-if="state.startPointLatLng.length"
        :lat-lng="state.startPointLatLng"
      >
        <l-icon
          class="color-green"
          :icon-size="[25, 25]"
          :icon-anchor="[15, 14]"
          :icon-url="startImgUrl"
        />
      </l-marker>

      <!-- ending point marker -->
      <l-marker
        v-if="state.endPointLatLng.length"
        :lat-lng="state.endPointLatLng"
      >
        <l-icon
          :icon-size="[25, 25]"
          :icon-anchor="[12, 14]"
          :icon-url="endImgUrl"
        />
      </l-marker>

      <template v-if="state.sensors && state.sensors.length">
        <template
          v-for="sensor in state.sensors"
          :key="sensor.id"
        >
          <l-marker
            v-if="sensor"
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
:deep img.low-opacity {
  // class from sensorMapMaker that handles filtered out bins opacity
  opacity: 0.47;
}
:deep .leaflet-pane .leaflet-layer {
  // handles map opacity level
  opacity: 0.7 !important;
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
  overflow-y: auto;
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
  :deep .leaflet-container a.leaflet-popup-close-button {
    top: 2px;
    right: 4px;
  }
}
</style>
