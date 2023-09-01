<script setup>
  // import data from '@/data/latestReadingsMock.json'; // imports MOCK data file
  import { ref, onMounted } from 'vue';
  import SensorMap from '@/components/sensorMap.vue';
  import SensorSidebar from '@/components/sensorSidebar.vue';
  import { useSensorStore } from '@/stores/sensors_store';
  import NavigationBar from '@/layout/navigationBar.vue';
  import axios from 'axios';

  // config
  const alertThreshold = ref(50);
  const filterThresholdMaximum = ref(100);
  const filterThresholdMinimum = ref(0);
  
  // prepare sensor store
  const sensorStore = useSensorStore();
  //sensorStore.setSensors(data.sensors); // Using MOCK data file

  // make api call to get sensors
  const getLatestReadings = () => {
    axios
      .get('http://localhost:8080/latest_readings')
      .then((response) => {
        sensorStore.setSensors(response.data.sensors);
      });
  };
  
  onMounted(() => {
    getLatestReadings();
  })

</script>

<template>
  <main>
    <v-layout class="map-page">
      
      <NavigationBar></NavigationBar>
      <SensorSidebar></SensorSidebar>
      <SensorMap :sensors="sensorStore.sensors" 
        :alertThreshold="alertThreshold"
        :filterThresholdMaximum="filterThresholdMaximum"
        :filterThresholdMinimum="filterThresholdMinimum">
      </SensorMap>

    </v-layout>
    
  </main>
</template>

<style lang="scss" scoped>
  
</style>