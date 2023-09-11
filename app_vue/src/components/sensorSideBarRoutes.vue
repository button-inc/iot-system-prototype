<script setup>
  import { watch, reactive, onMounted } from 'vue'
  import { useRouteStore } from '@/stores/route_store';
  import { useSensorStore } from '@/stores/sensors_store';
  import { storeToRefs } from 'pinia';
  import SensorRouteBlock from './sensorRouteBlock.vue';

  // stores
  const routeStore = useRouteStore();
  const sensorStore = useSensorStore();
  const { getIsRouteOptimized } = storeToRefs(routeStore);

  const state = reactive({
    startPointAddress: '',
    endPointAddress: '',
    isRouteOptimized: false,
    drag: false
  });

  onMounted(() => {
    state.startPointAddress = routeStore.getStartPointAddress;
    state.endPointAddress = routeStore.getEndPointAddress;
  })

  // element variables
  watch(getIsRouteOptimized, () => {
    state.isRouteOptimized = routeStore.getIsRouteOptimized;
  })

  async function findRouteClicked() {
    routeStore.updateRouteListWithSensors(sensorStore.sensors); // store current displayed sensors into route list
    await routeStore.optimizeRoute();
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
      <v-btn color="#191A1C" :disabled="state.isRouteOptimized" @click="findRouteClicked">
        <span class="pr-1">Find Route</span>
        <vue-feather type="search"></vue-feather>
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
  }
</style>