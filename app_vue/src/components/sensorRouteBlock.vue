<script setup>
  import { reactive, onMounted, watch } from 'vue'
  import { useRouteStore } from '@/stores/route_store';
  import { v4 as uuidv4 } from 'uuid';
  import { getMinutesString, getKmFromMeterString } from '@/utils/formattingHelper';
  import draggable from 'vuedraggable';

  const props = defineProps({
    selectedRouteList: {
      type: Array,
      required: true
    },
    startPointAddress: {
      type: String,
      required: true
    },
    endPointAddress: {
      type: String,
      required: true
    }
  });

  // stores
  const routeStore = useRouteStore();

  const state = reactive({
    startPointAddress: '',
    endPointAddress: '',
    drag: false,
    selectedRouteList: []
  });

  onMounted(() => {
    state.startPointAddress = props.startPointAddress;
    state.endPointAddress = props.endPointAddress;
    state.selectedRouteList = props.selectedRouteList;
  })

  watch(() => props.selectedRouteList, (value) => {
    state.selectedRouteList = value;
  });

  function exportRouteClicked() {
    // columns
    let csv = 'Order,Sensor Type,Fill Level,Latitude,Longitude,Manufacturer,Bin Name,Address Line 1,Address Line 2,Group,Bin Type,Material Type,Asset Tag,Bin Volume\n';

    // grab required data to be exported
    const csvObjectArray = state.selectedRouteList.map((sensor, index) => {
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

  <!-- route display -->
  <section class="route-display">
    <div v-if="state.selectedRouteList && state.selectedRouteList.length !== 0" 
      class="padding-b-16">
      1 route(s) found
    </div>
    <div class="py-4 px-4 route-display__route-container">
      <!-- route is present -->
      <div class="w-100 h-100">
        <div tabindex="0" class="w-100 h-100 d-flex align-center cursor-pointer">
          <span class="font-body">
            {{ state.selectedRouteList.length }} Bins    
          </span>
          <span class="mx-2">&#8226;</span>
          <span v-if="routeStore.getRouteDuration"> {{ getMinutesString(routeStore.getRouteDuration) }}</span>
          <span class="ml-1" v-if="routeStore.getRouteDistance"> ({{ getKmFromMeterString(routeStore.getRouteDistance) }}km)</span>
        </div>

        <!-- route list -->
        <section>
          <!-- starting point -->
          <div class="d-flex align-center">
            <vue-feather class="color-green" type="disc"></vue-feather>
            <span class="route-display__point ml-2 mt-4">{{ state.startPointAddress }}</span>
          </div>
          <!-- destinations -->
          <draggable 
            v-model="state.selectedRouteList" 
            tag="div"
            item-key="id"
            @start="state.drag=true"
            @end="state.drag = false">
            <template #item="{ element: sensor }">
              <li class="route-display__items" :class="{'margin-b-0' : state.selectedRouteList.length === 1}">
                <vue-feather class="transform-rotate-270" type="git-commit"></vue-feather>
                <div class="d-flex flex-column ml-2">
                  <span>{{ sensor.address_line1 }}</span>
                  <span>{{ sensor.address_line2 }}</span>
                </div>
              </li>
            </template>
          </draggable>
          <!-- ending point -->
          <div class="d-flex align-center mb-4">
            <vue-feather class="color-red mr-2" type="map-pin"></vue-feather>
            <span class="route-display__point">{{ state.endPointAddress }}</span>
          </div>

          <!-- route call-to-actions -->
          <div class="d-flex align-center" 
            :class="{
              'justify-space-between': state.selectedRouteList && state.selectedRouteList.length > 1, 
              'justify-end': state.selectedRouteList && state.selectedRouteList.length <= 1
            }">
            <div v-if="state.selectedRouteList && state.selectedRouteList.length > 1">
              <v-btn class="pa-0 route-display__export" variant="plain" @click="exportRouteClicked">
                Export route
                <vue-feather type="upload"></vue-feather>
              </v-btn>
            </div>
            <v-btn class="route-display__delete pl-0 align-self-end" variant="plain" @click="routeStore.clearSensorRoute">
              <vue-feather type="trash-2"></vue-feather>
            </v-btn>
          </div>

        </section>
      </div>
    </div>
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
  
  .route-display {
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