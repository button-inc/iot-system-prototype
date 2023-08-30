import { reactive } from 'vue'

export const DEVICE_SIZE = { xs: 'xs', s: 's', m: 'm', l:'l', xl:'xl' };

const calcSize = (width) => {
    if (width < 300) return DEVICE_SIZE.xs
    if (width < 500) return DEVICE_SIZE.s
    if (width < 814) return DEVICE_SIZE.m
    if (width < 1200) return DEVICE_SIZE.l
    return DEVICE_SIZE.xl
}

const deviceInfo = reactive({
    windowWidth: window.innerWidth,
    size: DEVICE_SIZE.xs,
})

deviceInfo.size = calcSize(window.innerWidth)

window.addEventListener('resize', () => {
    const width = window.innerWidth
    deviceInfo.windowWidth = width
    deviceInfo.size = calcSize(width)
})

export const useDevice = () => {
    return deviceInfo
}

export default useDevice

/*
useage:
<script setup lang="ts">
  import { useDevice, DEVICE_SIZE } from '@/utils/screenSizeHelper'

  const device = useDevice()
</script>

<template>
  <div v-if="device.size > DEVICE_SIZE.s">Some large screen content</div>
</template>
*/