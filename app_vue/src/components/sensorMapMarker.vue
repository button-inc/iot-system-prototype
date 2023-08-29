<script setup>
import { ref } from 'vue'
import { LPopup, LIcon } from '@vue-leaflet/vue-leaflet'

const props = defineProps({
  sensor: {
    type: Object,
    required: true
  }
})

const fill_pct = ref(Math.round(props.sensor.fill_level || 0))
const alertThreshold = 50
const filterThresholdMaximum = 100
const filterThresholdMinimum = 0

function getIconName() {
  const isDefaultState = props.sensor.fill_level
    ? props.sensor.fill_level < filterThresholdMinimum ||
      props.sensor.fill_level > filterThresholdMaximum
    : false

  const isFullState = props.sensor.fill_level
    ? alertThreshold && props.sensor.fill_level > alertThreshold
    : false

  if (isDefaultState) {
    return 'default'
  } else if (isFullState) {
    return 'full'
  }
  return 'healthy'
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
  <l-popup>
    <div class="progress-bar">
      <div v-if="fill_pct === null">level not captured</div>
      <div v-else>{{ fill_pct }}% Fill level</div>
    </div>

    <div class="box">
      {{ props.sensor.material_type }}
    </div>

    <div class="details">
      {{ props.sensor.bin_name }} <br />
      id: {{ props.sensor.id }} <br />
      {{ props.sensor.address_line1 }} <br />
      {{ props.sensor.address_line2 }} <br />
      {{ props.sensor.group }} <br />
      {{ props.sensor.asset_tag }} <br />
      {{ props.sensor.bin_type }} <br />
      {{ props.sensor.bin_volume }}
    </div>
  </l-popup>
</template>

<style lang="scss" scoped></style>
