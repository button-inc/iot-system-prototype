<script setup>
  import { ref, watch } from 'vue';
  import { LPopup, LIcon } from '@vue-leaflet/vue-leaflet';
  import { useRouteStore } from '@/stores/route_store';
  import { storeToRefs } from 'pinia';
  import { getIconAndProgressColor, getMaterialTypeIconURL } from '@/utils/mapMarkerHelper';
  import { getDate12HrTime } from '@/utils/formattingHelper';

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
  const { getSelectedRouteList, getIsRouteGenerated } = storeToRefs(routeStore);
  
  // watch for changes in stored sensor route array (ie. when a sensor gets added or removed)
  watch(getSelectedRouteList, () => {
    isAlreadyInRoute.value = routeStore.isAlreadyInRoute(props.sensor);
  }, { deep: true })

  watch(getIsRouteGenerated, () => {
    isRouteCreated.value = routeStore.getIsRouteGenerated;
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
    <div class="d-flex direction-row">
      <!-- bin data details -->
      <section class="bin-details">
        <div class="text-h6 bin-details__bin-name">{{ props.sensor.bin_name }}</div>
        <div class="bin-details__address color-cyan-blue" v-if="props.sensor.address_line1 || props.sensor.address_line2">
          <span v-if="props.sensor.address_line1">{{ props.sensor.address_line1 }}</span>
          <span v-if="props.sensor.address_line2">{{ props.sensor.address_line2 }}</span>
          <div>
            <span v-if="props.sensor.city">{{ props.sensor.city }}</span>
            <span v-if="props.sensor.province || props.sensor.postal_code">,</span>
            <span v-if="props.sensor.province">{{ ' ' + props.sensor.province }}</span>
            <span v-if="props.sensor.postal_code">{{ ' ' + props.sensor.postal_code }}</span>
          </div>
        </div>
        <div class="bin-details__group" v-if="props.sensor.group">
          <span class="color-gray-grey">Group</span>
          {{ props.sensor.group }}
        </div>
        <div class="bin-details__volume_and_type">
          <div class="bin-details__bin-volume" v-if="props.sensor.bin_volume">
            <span class="color-gray-grey">Bin Volume </span>
            {{ props.sensor.bin_volume }}
          </div>
          <div class="bin-details__bin-type" v-if="props.sensor.bin_type && props.sensor.bin_type.length">
            <span class="color-gray-grey">Bin Type</span>
            {{ props.sensor.bin_type }}
          </div>
        </div>
        <div class="bin-details__tag-list" v-if="props.sensor.asset_tag && props.sensor.asset_tag.length">
          <span class="bin-details__tag-list-text">Tags</span>
          <span class="bin-details__tag">{{ props.sensor.asset_tag }}</span>
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
          <span class="material-type__description">{{ props.sensor.material_type }}</span>
        </div>
      </section>
    </div>

    <section class="alerts-section">
      <div class="alerts">
        <div class="alerts__title">
          <span>Alerts Set</span>
        </div>
        <div class="alerts__item" v-if="props.sensor.fill_level_alert">
          <vue-feather size="18" class="color-green mr-2" type="bell"></vue-feather>
          <span>Fill-level > {{ props.sensor.fill_level_alert }}%</span>
        </div>
        <div class="alerts__item" v-if="props.sensor.temperature_alert">
          <vue-feather size="18" class="color-green mr-2" type="bell"></vue-feather>
          <span>Temperature > {{props.sensor.temperature_alert}}&deg;C</span>
        </div>
        <div class="alerts__item" v-if="props.sensor.illegal_dumping_alert">
          <vue-feather size="18" class="color-green mr-2" type="bell"></vue-feather>
          <span>Illegal dumping</span>
        </div>
        <div class="alerts__item" v-if="props.sensor.contamination_alert">
          <vue-feather size="18" class="color-green mr-2" type="bell"></vue-feather>
          <span>Contamination</span>
        </div>
      </div>
      <div class="last-collected" v-if="props.sensor.last_collected">
        <span class="last-collected__title">Last Collected</span>
        <div class="last-collected__item">
          <span>{{ getDate12HrTime(props.sensor.last_collected) }}</span>
          <span v-if="props.sensor.fill_level_last_collected">
            at {{ props.sensor.fill_level_last_collected }}% full
          </span> 
        </div>
      </div>
    </section>


    <!-- add to route buttons -->
    <section class="bin-details__cta-routes" v-if="isRouteCreated">
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
    </section>
  </l-popup>
</template>

<style lang="scss" scoped>

  // custom css
  .popup {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    margin: 20px;
    flex-direction: column;

    @include smallScreens {
      margin: 0;
    }

    &__sidebar {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 80px;
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
      text-align: center;
    }
  }

  .bin-details {
    display: flex;
    flex-direction: column;
    @include fontBody;

    &__bin-name {
      margin-bottom: 6px;
    }

    &__volume_and_type {
      display: flex;
      flex-direction: row;
    }

    &__bin-volume,
    &__bin-type {
      display: flex;
      flex-direction: row;
      margin-right: 20px;
    }

    &__address {
      display: flex;
      flex-direction: column;
      margin-bottom: 6px;
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

    &__cta-routes,
    &__cta-routes button {
      width: 100%;
    }
  }

  .alerts-section {
    display: flex;
    align-items: flex-start;
    flex: 1;
    gap: 20px;
    margin-top: 6px;
    width: 100%;
    .alerts {
      display: flex;
      flex-direction: column;
      &__title {
        margin-bottom: 6px;
        color: $grey;
        @include fontSubTitle2;
      }

      &__item {
        display: flex;
        align-items: center;
        padding-bottom: 2px;
      }
    }

    .last-collected {
      display: flex;
      flex-direction: column;
      flex: 1;
      align-items: center;

      &__title {
        margin-bottom: 6px;
        color: $grey;
        text-align: center;
        @include fontSubTitle2;
      }

      &__item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        max-width: 86px;
        text-align: center;
      }
    }
  }
</style>
