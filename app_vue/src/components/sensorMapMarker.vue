<script setup>
  import { ref } from 'vue'
  import { LPopup, LIcon } from '@vue-leaflet/vue-leaflet'

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
  })

  const fillPercent = ref(Math.round(props.sensor.fill_level || 0))

  function getIconName() {
    const isDefaultState = props.sensor.fill_level
      ? props.sensor.fill_level < props.filterThresholdMinimum ||
        props.sensor.fill_level > props.filterThresholdMaximum
      : false

    const isFullState = props.sensor.fill_level
      ? props.alertThreshold && props.sensor.fill_level > props.alertThreshold
      : false

    if (isDefaultState) {
      return 'default';
    } else if (isFullState) {
      return 'full';
    }
    return 'healthy';
  }

  const getIconAndProgressColor = (iconName) => {
    let iconUrl = ''
    let linearProgressColor = '';
    switch (iconName) {
      case 'error':
        iconUrl = 'https://cdn-icons-png.flaticon.com/128/1304/1304037.png'
        linearProgressColor = 'error'
        break
      case 'full':
        iconUrl = 'https://cdn-icons-png.flaticon.com/128/5028/5028066.png'
        linearProgressColor = 'error'
        break
      case 'healthy':
        iconUrl = 'https://cdn-icons-png.flaticon.com/128/542/542775.png'
        linearProgressColor = 'success'
        break
      default:
        iconUrl = 'https://cdn-icons-png.flaticon.com/128/484/484662.png'
        linearProgressColor = 'primary'
    }
    return { iconUrl, linearProgressColor }
  }

  const { iconUrl, linearProgressColor } = getIconAndProgressColor(getIconName())
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
      <div v-if="props.sensor.group" class="bin-details__group">
        <span class="font-weight-bold">Group</span>
        {{ props.sensor.group }}
      </div>
      <div v-if="props.sensor.bin_type" class="bin-details__bin-type">
        <span class="font-weight-bold">Bin type</span>
        {{ props.sensor.bin_type }}
      </div>
      <div v-if="props.sensor.bin_volume" class="bin-details__bin-volume">
        <span class="font-weight-bold">Bin Volume: </span>
        {{ props.sensor.bin_volume }}
      </div>
      <div v-if="props.sensor.asset_tag" class="bin-details__tag-list">
        <span class="bin-details__tag-list-text">Tags:</span>
        <span class="bin-details__tag">{{ props.sensor.asset_tag }}</span>
      </div>
    </section>
  </l-popup>
</template>

<style lang="scss" scoped>
  // custom css
  .popup {
    display: flex;
    align-items: flex-start;

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
  }
</style>
