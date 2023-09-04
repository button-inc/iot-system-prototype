<script setup>
  import { ref, watch } from 'vue';
  import { LPopup, LIcon } from '@vue-leaflet/vue-leaflet';
  import { useRouteStore } from '@/stores/route_store';
  import { storeToRefs } from 'pinia';

  const props = defineProps({
    sensor: {
      type: Object,
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
    }
  });

  const fillPercent = ref(Math.round(props.sensor.fill_level || 0));
  const { iconUrl, linearProgressColor } = getIconAndProgressColor(getIconName());

  const routeStore = useRouteStore();
  const isAlreadyInRoute = ref(false);
  const { getSensorRouteList } = storeToRefs(routeStore);

  // watch for changes in stored sensor route array (ie. when a sensor gets added or removed)
  watch(getSensorRouteList, () => {
    if (routeStore.getSensorRouteList.length > 0) {
      isAlreadyInRoute.value = !!routeStore.getSensorRouteList.find(bin => bin.id === props.sensor.id);
    } else {
      isAlreadyInRoute.value = false
    }
  }, { deep: true })

  function addBinToRoute(sensor) {
    // only add to route if not already added
    if (isAlreadyInRoute.value === false) {
      routeStore.addSensorToRoute(sensor);
    }
  }

  function removeBinFromRoute(sensor) {
    // only add to route if not already added
    if (isAlreadyInRoute.value === true) {
      routeStore.removeSensorFromRoute(sensor);
    }
  }

  function getIconName() {
    const isDefaultState = props.sensor.fill_level
      ? props.sensor.fill_level < props.filterThresholdMinimum 
      || props.sensor.fill_level > props.filterThresholdMaximum
      : false;

    const isFullState = props.sensor.fill_level
      ? props.alertThreshold && props.sensor.fill_level > props.alertThreshold
      : false;
    
    const isErrorState = !props.sensor.fill_level;

    if (isErrorState) {
      return 'error';
    } else if (isDefaultState) {
      return 'default';
    } else if (isFullState) {
      return 'full';
    }
    return 'healthy';
  }

  function getIconAndProgressColor(iconName) {
    let iconUrl = ''
    let linearProgressColor = '';
    switch (iconName) {
      case 'error':
        iconUrl = 'https://cdn-icons-png.flaticon.com/128/1304/1304037.png';
        linearProgressColor = 'error';
        break;
      case 'full':
        iconUrl = 'https://cdn-icons-png.flaticon.com/128/5028/5028066.png';
        linearProgressColor = 'error';
        break;
      case 'healthy':
        iconUrl = 'https://cdn-icons-png.flaticon.com/128/542/542775.png';
        linearProgressColor = 'success';
        break;
      default:
        iconUrl = 'https://cdn-icons-png.flaticon.com/128/484/484662.png';
        linearProgressColor = 'primary';
    }
    return { iconUrl, linearProgressColor };
  }
</script>

<template>
  <l-icon :icon-size="[25, 25]" :icon-anchor="[13, 0]" :icon-url="iconUrl" />

  <l-popup class="popup">
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
        <img class="material-type__image" src="@/assets/images/open-box.png"/>
        <span class="material-type__description">{{ props.sensor.material_type }}</span>
      </div>
    </section>


    <section class="bin-details">
      <span class="text-h6">{{ props.sensor.bin_name }}</span>
      <span class="text-subtitle-2">ID: {{ props.sensor.id }}</span>
      <div class="bin-details__address">
        <span>{{ props.sensor.address_line1 }}</span>
        <span>{{ props.sensor.address_line2 }}</span>
      </div>
      <div class="bin-details__group">
        <span class="font-weight-bold">Group</span>
        {{ props.sensor.group }}
      </div>
      <div class="bin-details__bin-type">
        <span class="font-weight-bold">Bin type</span>
        {{ props.sensor.bin_type }}
      </div>
      <div class="bin-details__bin-volume">
        <span class="font-weight-bold">Bin Volume: </span>
        {{ props.sensor.bin_volume }}
      </div>
      <div class="bin-details__tag-list">
        <span class="bin-details__tag-list-text">Tags:</span>
        <span class="bin-details__tag">{{ props.sensor.asset_tag }}</span>
      </div>
      <div class="bin-details__cta-routes">
        <v-btn variant="flat"
          class="mt-2 mb-2 text-capitalize"
          color="#191A1C"
          :disabled="isAlreadyInRoute"
          @click="addBinToRoute(props.sensor)">
          + Add to route
        </v-btn>
        <v-btn variant="tonal" v-if="isAlreadyInRoute"
          class="mt-2 mb-2 text-capitalize"
          @click="removeBinFromRoute(props.sensor)">
          - Remove from route
        </v-btn>
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
      background: #2196F3;
      color: white;
      border-radius: 999px;
      padding: 0 10px;
      width: fit-content;
    }

    &__tag-list-text {
      font-weight: 700;
      margin-bottom: 6px;
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
      width: 194px;
    }
  }
</style>
