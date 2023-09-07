<script setup>
  import { ref, watch } from 'vue'
  import { useRouteStore } from '@/stores/route_store';
  import { storeToRefs } from 'pinia';
  import { v4 as uuidv4 } from 'uuid';
  import { getOptimizedRoute } from '@/utils/optimizeRouteHelper';
  import draggable from 'vuedraggable';

  const routeStore = useRouteStore();
  const { sensorRouteList, getEnableOptimizeRoute } = storeToRefs(routeStore);
  const isOptimizeRouteEnabled = ref(true);
  const drag = ref(false);

  // listen for status of optimize route button
  watch(getEnableOptimizeRoute, () => {
    isOptimizeRouteEnabled.value = routeStore.getEnableOptimizeRoute;
  })

  async function optimizeRouteClicked() {
    // button to be disabled after first click
    // routeStore.setEnableOptimizedRoute(false);

    const googResponse = await getOptimizedRoute(sensorRouteList);
    if (googResponse && googResponse.routes) {
      const routeOrder = googResponse.routes[0]?.optimizedIntermediateWaypointIndex; // [0,3,4]
      routeStore.updateWithOptimizedRoute(routeOrder);
    }

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
    <div class="text-h6 padding-b-16">Routes</div>
    <div v-if="sensorRouteList && sensorRouteList.length !== 0" class="padding-b-16">1 route(s) found</div>
    <div class="py-4 px-4 routes-list__route-container">
      <!-- no route present -->
      <span v-if="sensorRouteList && sensorRouteList.length === 0" 
        class="font-italic">
        No route to be displayed yet
      </span>
      <!-- route is present -->
      <div class="w-100 h-100" v-else>
        <div tabindex="0" class="w-100 h-100 d-flex align-center justify-space-between cursor-pointer">
          <span class="font-body">{{ sensorRouteList.length }} Bins </span>
        </div>

        <!-- route list -->
        <section>
          <!-- route list items -->
          <draggable 
            v-model="sensorRouteList" 
            tag="div"
            item-key="id"
            @start="drag=true"
            @end="drag=false">
            <template #item="{ element: sensor, index }">
              <li class="routes-list__items">
                <vue-feather v-if="index === 0" class="color-green" type="disc"></vue-feather>
                <vue-feather v-if="index > 0 && index < (sensorRouteList.length - 1)" class="transform-rotate-270" type="git-commit"></vue-feather>
                <vue-feather v-if="index === (sensorRouteList.length - 1) && index !== 0" class="color-red" type="map-pin"></vue-feather>
                <div class="d-flex flex-column ml-2">
                  <span>{{ sensor.address_line1 }}</span>
                  <span>{{ sensor.address_line2 }}</span>
                </div>
              </li>
            </template>
          </draggable>

          <!-- route call-to-actions -->
          <div class="d-flex align-center" 
            :class="{
              'justify-space-between': sensorRouteList && sensorRouteList.length > 1, 
              'justify-end': sensorRouteList && sensorRouteList.length <= 1
            }">
            <div v-if="sensorRouteList && sensorRouteList.length > 1">
              <v-btn v-if="sensorRouteList.length >= 4" class="pa-0" variant="plain" :disabled="!isOptimizeRouteEnabled" @click="optimizeRouteClicked">
                Optimize route
              </v-btn>
              <v-btn class="pa-0 routes-list__export" variant="plain" @click="exportRouteClicked">
                Export route
                <vue-feather type="upload"></vue-feather>
              </v-btn>
            </div>
            <v-btn class="pl-0 align-self-end" variant="plain" @click="routeStore.clearSensorRoute">
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
    :deep .v-btn--size-default {
      min-width: 24px;
    }
  }
</style>