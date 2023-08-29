<script setup>
import SensorMap from '@/components/sensorMap.vue';
import data from '@/data/sensorsMock.json';

const sensors = data.sensors;
</script>

<template>
  <main>
    <SensorMap :sensors="sensors"></SensorMap>
  </main>
</template>

<style lang="scss" scoped>

</style>