<script setup>
  import { ref, watch } from 'vue';
  import { LPopup, LIcon } from '@vue-leaflet/vue-leaflet';
  import { useRouteStore } from '@/stores/route_store';
  import { storeToRefs } from 'pinia';
  import { getIconAndProgressColor, getMaterialTypeIconURL } from '@/utils/mapMarkerHelper';

  const props = defineProps({
    sensor: {
      type: Object,
      required: true
    }
  });

  // set html element variables
  const fillPercent = ref(Math.round(props.sensor.fill_level || 0));
  const { iconUrl, linearProgressColor } = getIconAndProgressColor(props.sensor);
  const isAlreadyInRoute = ref(false);
  const isRouteCreated = ref(false);
  
  // route store
  const routeStore = useRouteStore();
  const { getSelectedRouteList, getIsRouteOptimized } = storeToRefs(routeStore);
  
  // watch for changes in stored sensor route array (ie. when a sensor gets added or removed)
  watch(getSelectedRouteList, () => {
    isAlreadyInRoute.value = routeStore.isAlreadyInRoute(props.sensor);
  }, { deep: true })

  watch(getIsRouteOptimized, () => {
    isRouteCreated.value = routeStore.getIsRouteOptimized;
  }, { deep: true })

  function addBinToRoute(sensor) {
    // only add to route if not already added
    if (isAlreadyInRoute.value === false) {
      routeStore.addSensorToRoute(sensor);
      routeStore.googOptimizeRoute();
    }
  }

  function removeBinFromRoute(sensor) {
    // only remove from route if already added
    if (isAlreadyInRoute.value === true) {
      routeStore.removeSensorFromRoute(sensor);
      routeStore.googOptimizeRoute();
    }
  }

</script>

<template>
  <l-icon :icon-size="[19, 23]" :icon-anchor="[10, 18]" :icon-url="iconUrl" />

  <l-popup class="popup">
    <section class="bin-details">
      <span class="text-h6">{{ props.sensor.bin_name }}</span>
      <div class="bin-details__address color-cyan-blue" v-if="props.sensor.address_line1 || props.sensor.address_line2">
        <span v-if="props.sensor.address_line1">{{ props.sensor.address_line1 }}</span>
        <span v-if="props.sensor.address_line2">{{ props.sensor.address_line2 }}</span>
      </div>
      <div class="bin-details__group" v-if="props.sensor.group">
        <span class="color-gray-grey">Group</span>
        {{ props.sensor.group }}
      </div>
      <div class="bin-details__bin-type">
        <span class="color-gray-grey">Bin type</span>
        {{ props.sensor.bin_type }}
      </div>
      <div class="bin-details__bin-volume">
        <span class="color-gray-grey">Bin Volume: </span>
        {{ props.sensor.bin_volume }}
      </div>
      <div class="bin-details__tag-list">
        <span class="bin-details__tag-list-text">Tags:</span>
        <span class="bin-details__tag">{{ props.sensor.asset_tag }}</span>
      </div>
      <div class="bin-details__cta-routes" v-if="isRouteCreated">
        <v-btn variant="flat"
          class="mt-2 mb-2"
          color="#191A1C"
          :disabled="isAlreadyInRoute"
          @click="addBinToRoute(props.sensor)">
          + Add to route
        </v-btn>
        <v-btn variant="tonal" v-if="isAlreadyInRoute"
          class="mt-2 mb-2"
          @click="removeBinFromRoute(props.sensor)">
          - Remove from route
        </v-btn>
      </div>
    </section>

    <section class="popup__sidebar">
      <div class="fill-level">
        <template v-if="fillPercent === null">level not captured</template>
        <template v-else>
          <span class="fill-level__percent">{{ fillPercent }}% </span>
          <v-progress-linear class="fill-level__progress-bar" 
            style="width:100px; height: 20px; transform: rotate(270deg); top: unset; left: unset;"
            :model-value="fillPercent" 
            :color="linearProgressColor" 
            :max="100">
          </v-progress-linear>
          <div class="fill-level__text">Fill level</div>
        </template>
      </div>

      <div class="material-type">
        <v-img class="material-type__image" :src="getMaterialTypeIconURL(props.sensor.material_type)" width="40" height="40" />
        <!-- <img class="material-type__image" :src="getMaterialTypeIconURL(props.sensor.material_type)"/> -->
        <span class="material-type__description">{{ props.sensor.material_type }}</span>
      </div>
    </section>
  </l-popup>
</template>

<style lang="scss" scoped>

  // custom css
  .popup {
    display: flex;
    align-items: flex-start;
    width: 250px;

    @include smallScreens {
      width: inherit;
    }

    &__sidebar {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }
  .fill-level {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__progress-bar {
      border-radius: 0px 5px 5px 0px;
      margin: 38px 0;
    }

    &__percent {
      margin-bottom: 6px;
    }

    &__text {
      margin-top: 6px;
    }
  }

  .material-type {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__image {
      width: 40px;
      height: 100%;
    }

    &__description {
      white-space: nowrap;
    }
  }

  .bin-details {
    display: flex;
    flex-direction: column;
    @include fontBody;

    &__address {
      margin: 6px 0;
      @include fontBodySmall;
    }

    &__tag {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      min-width: 50px;
      background: rgba(0, 0, 0, 0.08);
      border-radius: 999px;
      padding: 0 10px;
      width: fit-content;
    }

    &__tag-list-text {
      margin-bottom: 6px;
      color: $grey;
    }

    &__tag-list,
    &__group,
    &__bin-type,
    &__bin-volume {
      display: flex;
      flex-direction: column;
      margin-bottom: 6px;
      @include fontSubTitle2;
    }

    &__cta-routes button {
      width: 184px;
      @include smallScreens {
        width: 224px;
      }
    }
  }
</style>
