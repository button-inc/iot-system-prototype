<script setup>
  import { reactive, ref, onMounted } from 'vue'
  import SensorMapMarker from '@/components/sensorMapMarker.vue';
  import 'leaflet/dist/leaflet.css'
  import { LMap, LTileLayer, LMarker, LControlZoom } from '@vue-leaflet/vue-leaflet'
  import { useDevice, DEVICE_SIZE } from '@/utils/screenSizeHelper';

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

  const center = ref([43.7, -79.42]);
  const zoom = ref(10);

  const state = reactive({
    location: 'bottomright',
    device: useDevice()
  });

  onMounted(() => {
    window.addEventListener("resize", onWindowResize);
  });

  function onWindowResize() {
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
    <l-map ref="map" v-model:zoom="zoom" :use-global-leaflet="false" :center="center" :options="{zoomControl: false}">
      <l-control-zoom :position="state.location"/>
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
