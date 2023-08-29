<script setup>
import { ref } from 'vue';
import SensorMap from '@/components/sensorMap.vue';
import data from '@/data/sensorsMock.json';

const sensors = ref(data.sensors);
const alertThreshold = 50;
const filterThresholdMaximum = 100;
const filterThresholdMinimum = 0;

</script>

<template>
  <main>
    <SensorMap :sensors="sensors" 
      :alertThreshold="alertThreshold"
      :filterThresholdMaximum="filterThresholdMaximum"
      :filterThresholdMinimum="filterThresholdMinimum">
    </SensorMap>
  </main>
</template>

<style lang="scss" scoped>

</style>