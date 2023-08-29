<script setup>
  import { ref } from 'vue';
  import SensorMap from '@/components/sensorMap.vue';
  import SensorFilter from '@/components/sensorFilter.vue';
  import data from '@/data/sensorsMock.json';

  const sensors = ref(data.sensors);
  const alertThreshold = ref(50);
  const filterThresholdMaximum = ref(100);
  const filterThresholdMinimum = ref(0);
</script>

<template>
  <main>
    <SensorFilter></SensorFilter>
    <SensorMap :sensors="sensors" 
      :alertThreshold="alertThreshold"
      :filterThresholdMaximum="filterThresholdMaximum"
      :filterThresholdMinimum="filterThresholdMinimum">
    </SensorMap>
  </main>
</template>

<style lang="scss" scoped>

</style>