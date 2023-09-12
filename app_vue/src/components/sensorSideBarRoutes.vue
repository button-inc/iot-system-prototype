<script setup>
  import { watch, reactive, onMounted } from 'vue'
  import { useRouteStore } from '@/stores/route_store';
  import { useSensorStore } from '@/stores/sensors_store';
  import { storeToRefs } from 'pinia';
  import SensorRouteBlock from '@/components/sensorRouteBlock.vue';

  // stores
  const routeStore = useRouteStore();
  const sensorStore = useSensorStore();
  const { getIsRouteOptimized, getHasMappedStartEnd } = storeToRefs(routeStore);

  const state = reactive({
    startPointAddress: '',
    endPointAddress: '',
    isRouteOptimized: false,
    drag: false,
    isMapInitialized: false,
    isLoadingGoogApi: false
  });

  onMounted(() => {
    state.startPointAddress = routeStore.getStartPointAddress;
    state.endPointAddress = routeStore.getEndPointAddress;
  })

  // element variables
  watch(getIsRouteOptimized, () => {
    state.isRouteOptimized = routeStore.getIsRouteOptimized;
  })

  watch(getHasMappedStartEnd, () => {
    state.isMapInitialized = routeStore.getHasMappedStartEnd;
  })

  async function findRouteClicked() {
    state.isLoadingGoogApi = true;
    routeStore.updateRouteListWithSensors(sensorStore.sensors); // store current displayed sensors into route list
    await routeStore.googOptimizeRoute();
    state.isLoadingGoogApi = false;
  }

</script>

<template>
  <section class="routes-list">
    <div class="text-h6 padding-b-16">Routes</div>

    <!-- route info display -->
    <section v-if="state.isRouteOptimized">
      <SensorRouteBlock
        :selectedRouteList="routeStore.getSelectedRouteList"
        :startPointAddress="routeStore.getStartPointAddress"
        :endPointAddress="routeStore.getEndPointAddress">
      </SensorRouteBlock>
    </section>

    <!-- start and end point entry -->
    <section v-else>
      <v-text-field 
        v-model="state.startPointAddress"
        disabled
        label="Start point" 
        variant="underlined">
      </v-text-field>
      <v-text-field 
        v-model="state.endPointAddress"
        disabled
        label="End point"
        variant="underlined">
      </v-text-field>
      <div class="d-flex align-center py-4 px-2 color-warning-bg mb-5" v-if="routeStore.getSelectedRouteList > 25">
        <vue-feather class="color-red mx-3" type="alert-triangle"></vue-feather>
        <span class="routes-list__warning-text">Note: Currently only 25 bins can be added to the route. Please deselect {{ routeStore.getSelectedRouteList - 25 }} bin(s).</span>
      </div>
      <v-btn color="#191A1C" :disabled="!state.isMapInitialized || routeStore.getSelectedRouteList > 25 || sensorStore.getTotalSensors <= 1" @click="findRouteClicked">
        <span class="pr-1">Find Route</span>
        <v-progress-circular v-if="!state.isMapInitialized || state.isLoadingGoogApi"
          indeterminate
          :size="20"
          color="#8D8D8D"
        ></v-progress-circular>
        <vue-feather type="search" v-else></vue-feather>
      </v-btn>
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
    width: 100%;

    &__warning-text {
      max-width: 200px;
      @include fontBodySmall;
    }
  }
</style>