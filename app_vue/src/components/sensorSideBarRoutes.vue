<script setup>
  import { ref, watch } from 'vue'
  import { useRouteStore } from '@/stores/route_store';
  import { storeToRefs } from 'pinia';
  import { v4 as uuidv4 } from 'uuid';
  
  const routeStore = useRouteStore();
  const { sensorRouteList, getEnableOptimizeRoute } = storeToRefs(routeStore);
  const isOpen = ref(false);
  const isOptimizeRouteEnabled = ref(true);

  // listen for status of optimize route button
  watch(getEnableOptimizeRoute, () => {
    isOptimizeRouteEnabled.value = routeStore.getEnableOptimizeRoute;
  })

  function optimizeRouteClicked() {
    // update status of optimize route button to be disabled after first click
    routeStore.setEnableOptimizedRoute(false);

    // TODO: add call to google api
  }

  function exportRouteClicked() {
    // columns
    let csv = 'Order,Sensor Type,Fill Level,Latitude,Longitude,Manufacturer,Bin Name,Address Line 1,Address Line 2,Group,Bin Type,Material Type,Asset Tag,Bin Volume\n';

    // grab required data to be exported
    const csvObjectArray = routeStore.sensorRouteList.map((sensor, index) => {
      return {
        order: index + 1,
        sensor_type: sensor.sensor_type,
        fill_level: sensor.fill_level,
        lat: sensor.lat,
        long: sensor.long,
        manufacturer: sensor.manufacturer,
        bin_name: sensor.bin_name,
        address_line1: sensor.address_line1,
        address_line2: sensor.address_line2.replace(',',''), // typically has a comma which will interfere with csv
        group: sensor.group,
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
    <div class="text-h6 padding-b-30">Routes</div>
    <div class="py-4 px-4 routes-list__route-container">
      <!-- no route present -->
      <span v-if="sensorRouteList && sensorRouteList.length === 0" 
        class="font-italic">
        No route to be displayed yet
      </span>
      <!-- route is present -->
      <div class="w-100 h-100" v-else>
        <div tabindex="0" class="w-100 h-100 d-flex align-center justify-space-between cursor-pointer" @click="isOpen = !isOpen">
          <span>{{ sensorRouteList.length }} Bins </span>
          <div>
            <v-btn class="pa-0" variant="plain">
              <vue-feather :type="isOpen ? 'chevron-up':'chevron-down'"></vue-feather>
            </v-btn>
          </div>
        </div>
        <template v-if="isOpen">
          <div v-for="sensor in sensorRouteList" :key="sensor.id" class="d-flex routes-list__route mt-4">
            <vue-feather type="map-pin"></vue-feather>
            <div class="d-flex flex-column ml-2">
              <span>{{ sensor.address_line1 }}</span>
              <span>{{ sensor.address_line2 }}</span>
            </div>
          </div>
          <div class="d-flex align-center" 
            :class="{
              'justify-space-between': sensorRouteList && sensorRouteList.length > 1, 
              'justify-end': sensorRouteList && sensorRouteList.length <= 1
            }">
            <div v-if="sensorRouteList && sensorRouteList.length > 1">
              <v-btn class="pa-0" variant="plain" :disabled="!isOptimizeRouteEnabled" @click="optimizeRouteClicked">
                Optimize route
              </v-btn>
              <v-btn class="pa-0" variant="plain" @click="exportRouteClicked">
                Export route
              </v-btn>
            </div>
            <v-btn class="pl-0 align-self-end" variant="plain" @click="routeStore.clearSensorRoute">
              <vue-feather type="trash-2"></vue-feather>
            </v-btn>
          </div>

        </template>
      </div>
    </div>

  </section>
</template>

<style lang="scss" scoped>
  .routes-list {
    margin-top: 40px;
    width: 100%;

    &__route-container {
      border: 1px solid $grey;
    }

    &__route {
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep .v-btn--size-default {
      min-width: 24px;
    }
  }
</style>
