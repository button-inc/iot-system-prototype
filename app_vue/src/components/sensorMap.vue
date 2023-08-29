<script setup lang="ts">
  /*
  * this file uses openlayer for vue 3: https://vue3openlayers.netlify.app/componentsguide/map/
  */
  import { ref, inject, onMounted } from "vue";
  import type { View } from "ol";
  import type { ObjectEvent } from "ol/Object";
  import SensorMapMarker from './sensorMapMarker.vue';

  // import type { PropType } from 'vue' // TODO: implement type interface to sensors prop

  // export interface Sensor {
  //   id: string;
  //   fill_level: number | null;
  //   lat: number;
  //   long: number;
  //   sensor_type: string;
  //   material_type: string;
  //   bin_type: string;
  //   sim: string;
  //   bin_name: string;
  //   bin_volume: string;
  //   group: string;
  //   address_line1: string;
  //   address_line2: string;
  //   asset_tag: string;
  //   manufacturer: string;
  // }

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

  const center = ref([-79.42, 43.70]);
  const projection = ref("EPSG:4326");
  const zoom = ref(10);
  const rotation = ref(0);

  const view = ref<View>();
  const userPosition = ref([]);

  // callback upon receiving user's geo location
  const geoLocChange = (event: ObjectEvent) => {
    userPosition.value = event.target.getPosition();
    view.value?.setCenter(event.target?.getPosition());
  };

  // TODO: remove debugging start
  const currentCenter = ref(center);
  const currentZoom = ref(zoom);
  const currentRotation = ref(rotation);

  function zoomChanged(z: any) {
    currentZoom.value = z;
  }
  function centerChanged(c: any) {
    currentCenter.value = c;
  }
  function rotationChanged(r: any) {
    currentRotation.value = r;
  }
  // TODO: remove debugging end

</script>

<template>
  <div class="container" style="height:600px; width:800px" v-if="sensors">
    <ol-map style="height: 600px">
      <ol-view
        ref="view"
        :center="center"
        :rotation="rotation"
        :zoom="zoom"
        :projection="projection"
        @zoomChanged="zoomChanged"
        @centerChanged="centerChanged"
        @rotationChanged="rotationChanged"
      />

      <!-- position of current user https://vue3openlayers.netlify.app/componentsguide/geolocation/ -->
      <ol-geolocation :projection="projection" @change:position="geoLocChange">
        <template>
          <ol-vector-layer :zIndex="2">
            <ol-source-vector>
              <ol-feature ref="positionFeature">
                <ol-geom-point :coordinates="userPosition"></ol-geom-point>
                <ol-style>
                  <ol-style-icon src="https://cdn-icons-png.flaticon.com/128/1304/1304037.png" :scale=".2"></ol-style-icon>
                </ol-style>
              </ol-feature>
            </ol-source-vector>
          </ol-vector-layer>
        </template>
      </ol-geolocation>

      <ol-tile-layer>
        <ol-source-osm /> <!-- Source layer that loads OpenStreetMaps tiles -->
      </ol-tile-layer>

      <!-- position is in order of long, lat -->
      <SensorMapMarker :position="[-79.35467147, 43.80861421]" id="8CD9834D4694893F"></SensorMapMarker>

    </ol-map>

    <div>
      center : {{ currentCenter }} zoom : {{ currentZoom }} rotation : {{ currentRotation }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.icon {
  width: 25px;
  height: 25px;
}
</style>
