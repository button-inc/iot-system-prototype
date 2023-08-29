<script setup lang="ts">
  /*
  * this file uses openlayer for vue 3: https://vue3openlayers.netlify.app/componentsguide/map/
  */
  import { ref} from "vue";
  import SensorMapMarker from './sensorMapMarker.vue';
  import "leaflet/dist/leaflet.css";
  import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
  import type { PropType } from 'vue';

  export interface Sensor {
    id: string;
    fill_level: number | null;
    lat: number;
    long: number;
    sensor_type: string;
    material_type: string;
    bin_type: string;
    sim: string;
    bin_name: string;
    bin_volume: string;
    group: string;
    address_line1: string;
    address_line2: string;
    asset_tag: string;
    manufacturer: string;
  }

  const props = defineProps({
    sensors: {
      type: Array as PropType<Sensor[]>,
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
    },
    selectedGroup: {
      type: String
    },
    selectedAssetTag: {
      type: String
    },
    selectedBinType: {
      type: String
    },
    selectedBinVolume: {
      type: String
    }
  });

  const center = ref([43.70, -79.42]);
  const zoom = ref(10);

</script>

<template>
  <div class="container" style="height:600px; width:800px" v-if="sensors">
    
    <l-map ref="map" v-model:zoom="zoom" :use-global-leaflet="false" :center="center">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>

      <l-marker v-for="sensor in props.sensors" 
        :key="sensor.id"
        :lat-lng="[sensor.lat, sensor.long]">
        <SensorMapMarker :sensor="sensor"></SensorMapMarker>
      </l-marker>
    </l-map>

  </div>
</template>

<style lang="scss" scoped>
  
</style>
