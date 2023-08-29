<script setup lang="ts">
import SensorMap from '@/components/sensorMap.vue';
import data from '@/data/sensorsMock.json';

const sensors = data.sensors;
</script>

<template>
  <main>
    <div class="test">Map page here</div>
    <SensorMap :sensors="sensors"></SensorMap>
  </main>
</template>

<style lang="scss" scoped>

</style>
