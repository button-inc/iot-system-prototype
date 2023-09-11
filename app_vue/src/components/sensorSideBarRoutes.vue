<script setup>
  import { watch, reactive, onMounted } from 'vue'
  import { useRouteStore } from '@/stores/route_store';
  import { useSensorStore } from '@/stores/sensors_store';
  import { storeToRefs } from 'pinia';
  import { v4 as uuidv4 } from 'uuid';
  import { getOptimizedRoute } from '@/utils/optimizeRouteHelper';
  import { getMinutesString, getKmFromMeterString } from '@/utils/formattingHelper';
  import draggable from 'vuedraggable';

  // stores
  const routeStore = useRouteStore();
  const sensorStore = useSensorStore();
  const { selectedRouteList, getIsRouteOptimized } = storeToRefs(routeStore);
  const { getTotalSensors } = storeToRefs(sensorStore);

  const state = reactive({
    startPoint: '',
    endPoint: '',
    totalSensors: 0,
    isRouteOptimized: false,
    drag: false
  });

  onMounted(() => {
    state.startPoint = routeStore.getStartPoint;
    state.endPoint = routeStore.getEndPoint;
  })

  // element variables
  watch(getTotalSensors, () => {
    state.totalSensors = sensorStore.getTotalSensors;
  })

  watch(getIsRouteOptimized, () => {
    state.isRouteOptimized = routeStore.getIsRouteOptimized;
  })

  async function findRouteClicked() {
    routeStore.updateRouteWithSensorList(sensorStore.sensors); // store current displayed sensors into route list
    await optimizeRoute();
  }

  async function optimizeRoute() {
    // make a call to google
    const googResponse = await getOptimizedRoute(routeStore.getSelectedRouteList, state.startPoint, state.endPoint);
    if (googResponse && googResponse.routes && googResponse.routes[0]) {
      const routeOrder = googResponse.routes[0].optimizedIntermediateWaypointIndex; // [0,3,4]
      routeStore.updateWithOptimizedRoute(routeOrder); // update current route
      routeStore.setIsRouteOptimized(true); // set flag is optimized to true

      if (googResponse.routes[0].duration) {
        routeStore.setRouteDuration(googResponse.routes[0]?.duration);
      }

      if (googResponse.routes[0].distanceMeters) {
        routeStore.setRouteDistance(googResponse.routes[0]?.distanceMeters);
      }
      
    }
  }

  function routeDragged() {
    state.drag = false; // completed drag
  }

  function exportRouteClicked() {
    // columns
    let csv = 'Order,Sensor Type,Fill Level,Latitude,Longitude,Manufacturer,Bin Name,Address Line 1,Address Line 2,Group,Bin Type,Material Type,Asset Tag,Bin Volume\n';

    // grab required data to be exported
    const csvObjectArray = routeStore.selectedRouteList.map((sensor, index) => {
      return {
        order: index + 1,
        sensor_type: sensor.sensor_type,
        fill_level: sensor.fill_level,
        lat: sensor.lat,
        long: sensor.long,
        manufacturer: sensor.manufacturer,
        bin_name: sensor.bin_name,
        address_line1: sensor.address_line1 || '',
        address_line2: sensor.address_line2 ? sensor.address_line2.replace(',','') : '', // typically has a comma which will interfere with csv
        group: sensor || '',
        bin_type: sensor.bin_type,
        material_type: sensor.material_type,
        asset_tag: sensor.asset_tag,
        bin_volume: sensor.bin_volume
      };
    })

    // convert JSON to csv rows
    csvObjectArray.forEach((sensor) => {
      const csvRow = Object.values(sensor).toString(); // outputs json to a value string separated by commas
      csv += csvRow + "\n";
    });
 
    // export
    const anchor = document.createElement('a');
    anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    anchor.target = '_blank';
    anchor.download = `Route-${uuidv4()}.csv`;
    anchor.click();
  }

</script>

<template>
  <section class="routes-list">
    <div class="text-h6 padding-b-16">Routes</div>

    <!-- start and end point display -->
    <section v-if="!state.isRouteOptimized">
      <v-text-field 
        v-model="state.startPoint"
        disabled
        label="Start point" 
        variant="underlined">
      </v-text-field>
      <v-text-field 
        v-model="state.endPoint"
        disabled
        label="End point"
        variant="underlined">
      </v-text-field>
      <v-btn color="#191A1C" :disabled="state.isRouteOptimized" @click="findRouteClicked">
        <span class="pr-1">Find Route</span>
        <vue-feather type="search"></vue-feather>
      </v-btn>
    </section>
    

    <!-- route display -->
    <section v-else>
      <div v-if="selectedRouteList && selectedRouteList.length !== 0" class="padding-b-16">1 route(s) found</div>
      <div class="py-4 px-4 routes-list__route-container">
        <!-- route is present -->
        <div class="w-100 h-100">
          <div tabindex="0" class="w-100 h-100 d-flex align-center justify-space-between cursor-pointer">
            <span class="font-body">
              {{ selectedRouteList.length }} Bins    
            </span>
            <span>&#8226;</span>
            <div class="d-flex flex-column">
              <span> {{ getMinutesString(routeStore.getRouteDuration) }}</span>
              <span> ({{ getKmFromMeterString(routeStore.getRouteDistance) }}km)</span>
            </div>


          </div>

          <!-- route list -->
          <section>
            <!-- starting point -->
            <div class="d-flex align-center">
              <vue-feather class="color-green" type="disc"></vue-feather>
              <span class="routes-list__point ml-2 mt-4">{{ state.startPoint }}</span>
            </div>
            <!-- destinations -->
            <draggable 
              v-model="selectedRouteList" 
              tag="div"
              item-key="id"
              @start="state.drag=true"
              @end="routeDragged">
              <template #item="{ element: sensor }">
                <li class="routes-list__items" :class="{'margin-b-0' : selectedRouteList.length === 1}">
                  <vue-feather class="transform-rotate-270" type="git-commit"></vue-feather>
                  <div class="d-flex flex-column ml-2">
                    <span>{{ sensor.address_line1 }}</span>
                    <span>{{ sensor.address_line2 }}</span>
                  </div>
                </li>
              </template>
            </draggable>
            <!-- ending point -->
            <div class="d-flex align-center">
              <vue-feather class="color-red" type="map-pin"></vue-feather>
              <span class="routes-list__point ml-2 mb-4">{{ state.endPoint }}</span>
            </div>

            <!-- route call-to-actions -->
            <div class="d-flex align-center" 
              :class="{
                'justify-space-between': selectedRouteList && selectedRouteList.length > 1, 
                'justify-end': selectedRouteList && selectedRouteList.length <= 1
              }">
              <div v-if="selectedRouteList && selectedRouteList.length > 1">
                <v-btn class="pa-0 routes-list__export" variant="plain" @click="exportRouteClicked">
                  Export route
                  <vue-feather type="upload"></vue-feather>
                </v-btn>
              </div>
              <v-btn class="routes-list__delete pl-0 align-self-end" variant="plain" @click="routeStore.clearSensorRoute">
                <vue-feather type="trash-2"></vue-feather>
              </v-btn>
            </div>

          </section>
        </div>
      </div>
    </section>
    

  </section>
</template>

<style lang="scss" scoped>

  .vue-feather {
    width: 20px;
    height: 20px;

    &--upload {
      margin-left: 4px;
      width: 15px;
      height: 15px;
    }
  }
  
  .routes-list {
    margin-top: 40px;
    width: 100%;

    &__route-container {
      border: 1px solid $lightergrey;
      border-radius: 20px;
      @include fontBodySmall;;
    }

    &__route {
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 0;
      }
    }

    &__export {
      display: flex;
      align-items: center;
    }

    &__items {
      cursor: pointer;
    }

    &__point {
      max-width: 174px;
    }

    :deep .v-btn--size-default {
      min-width: 24px;
    }
  }
</style>