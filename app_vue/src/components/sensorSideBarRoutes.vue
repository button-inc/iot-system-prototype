<script setup>
import { watch, reactive, onMounted } from 'vue';
import { useRouteStore } from '@/stores/route_store';
import { useSensorStore } from '@/stores/sensors_store';
import { storeToRefs } from 'pinia';
import SensorRouteBlock from '@/components/sensorRouteBlock.vue';
import PointAddressField from '@/components/shared/pointAddressField.vue';
import { telusUi } from '@/styles/telusUi';

// stores
const routeStore = useRouteStore();
const sensorStore = useSensorStore();
const { getShouldDisplayRoute, getHasMappedStartEnd, getSelectedRouteList } = storeToRefs(routeStore);

const state = reactive({
  startPointAddress: '',
  endPointAddress: '',
  startAddressOptions: [],
  endAddressOptions: [],
  shouldDisplayRoute: false,
  drag: false,
  isMapInitialized: false,
  isLoadingGoogApi: false,
  selectedRouteList: []
});

onMounted(() => {
  // setup initial start and end point
  state.startPointAddress = routeStore.getStartPointAddress;
  state.startAddressOptions.push(state.startPointAddress);

  state.endPointAddress = routeStore.getEndPointAddress;
  state.endAddressOptions.push(state.endPointAddress);
});

// element variables
watch(getShouldDisplayRoute, () => {
  state.shouldDisplayRoute = routeStore.getShouldDisplayRoute;
});

watch(getHasMappedStartEnd, () => {
  state.isMapInitialized = routeStore.getHasMappedStartEnd;
});

watch(getSelectedRouteList, () => {
  state.selectedRouteList = routeStore.getSelectedRouteList;
});

async function findRouteClicked() {
  state.isLoadingGoogApi = true;
  routeStore.setSelectedRouteList(sensorStore.getRoutableSensors); // store current displayed sensors into route list

  const routeList = routeStore.getSelectedRouteList;
  if (routeList.length === 1) {
    await routeStore.googUpdateRouteStats();
  } else {
    await routeStore.googOptimizeRoute();
  }
  state.isLoadingGoogApi = false;
}

function updateStartAddress(value) {
  state.startAddressOptions.push(value);
}

function updateStartPoint(value) {
  routeStore.setStartPoint(value);
}

function updateEndAddress(value) {
  state.endAddressOptions.push(value);
}

function updateEndPoint(value) {
  routeStore.setEndPoint(value);
}
</script>

<template>
  <section class="routes-list">
    <div class="text-h6 padding-b-16">Create Route</div>

    <!-- route info display -->
    <section v-if="state.shouldDisplayRoute">
      <SensorRouteBlock
        :selectedRouteList="state.selectedRouteList"
        :startPointAddress="routeStore.getStartPointAddress"
        :endPointAddress="routeStore.getEndPointAddress"
      ></SensorRouteBlock>
    </section>

    <!-- start and end point entry -->
    <section v-else>
      <PointAddressField
        v-model="state.startPointAddress"
        :addressOptions="state.startAddressOptions"
        label="Start point"
        @update:modelValue="updateStartPoint"
        @update:addressOptions="updateStartAddress"
      ></PointAddressField>

      <PointAddressField
        v-model="state.endPointAddress"
        :addressOptions="state.endAddressOptions"
        label="End point"
        @update:modelValue="updateEndPoint"
        @update:addressOptions="updateEndAddress"
      ></PointAddressField>

      <div
        class="d-flex align-center py-4 px-2 color-warning-bg mb-5"
        v-if="routeStore.getSelectedRouteList > 25"
      >
        <vue-feather
          class="color-red mx-3"
          type="alert-triangle"
        ></vue-feather>
        <span class="routes-list__warning-text">Note: Currently only 25 bins can be added to the route. Please deselect {{ routeStore.getSelectedRouteList - 25 }} bin(s).</span>
      </div>

      <v-btn
        class="find-route-btn"
        :color="telusUi.green"
        :disabled="!state.isMapInitialized || routeStore.getSelectedRouteList > 25 || sensorStore.getTotalSensors === 0"
        @click="findRouteClicked"
      >
        <span class="find-route-text pr-1">Find Route</span>
        <v-progress-circular
          v-if="!state.isMapInitialized || state.isLoadingGoogApi"
          indeterminate
          :size="20"
          :color="telusUi.green"
        ></v-progress-circular>
        <vue-feather
          type="search"
          v-else
        ></vue-feather>
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

.find-route-btn {
  margin-top: -35px;
}

.find-route-text {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  font-weight: bold;
}
</style>
