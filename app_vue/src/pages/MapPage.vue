<script setup>
  import { ref } from 'vue';
  import SensorMap from '@/components/sensorMap.vue';
  import SensorSidebar from '@/components/sensorSidebar.vue';
  import data from '@/data/sensorsMock.json';
  import { useSensorStore } from '@/stores/sensors_store';

  // config
  const alertThreshold = ref(50);
  const filterThresholdMaximum = ref(100);
  const filterThresholdMinimum = ref(0);
  
  // using mock sensor data
  const sensorStore = useSensorStore();
  sensorStore.setSensors(data.sensors);

</script>

<template>
  <main>
    <SensorSidebar></SensorSidebar>
    <SensorMap :sensors="sensorStore.sensors" 
      :alertThreshold="alertThreshold"
      :filterThresholdMaximum="filterThresholdMaximum"
      :filterThresholdMinimum="filterThresholdMinimum">
    </SensorMap>
  </main>
</template>

<style lang="scss" scoped>

</style>