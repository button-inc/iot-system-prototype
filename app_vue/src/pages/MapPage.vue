<script setup>
  // import data from '@/data/latestReadingsMock.json'; // imports MOCK data file
  import { onMounted } from 'vue';
  import SensorMap from '@/components/sensorMap.vue';
  import SensorSidebar from '@/components/sensorSidebar.vue';
  import { useSensorStore } from '@/stores/sensors_store';
  import NavigationBar from '@/layout/navigationBar.vue';
  import axios from 'axios';

  // config
  const ENV_API_BASE_URL = process.env.VUE_APP_API_HOST || "http://localhost:8080";
  
  // prepare sensor store
  const sensorStore = useSensorStore();
  //sensorStore.setSensors(data.sensors); // Using MOCK data file

  // make api call to get sensors
  const getLatestReadings = async () => {
    try {
      const response = await axios.get(ENV_API_BASE_URL + '/latest_readings');
      if (response) {
        sensorStore.setSensors(response.data.sensors);
      }
    } catch(e) {
      console.error('error getting latest readings', e);
    }
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
      <SensorMap></SensorMap>

    </v-layout>
    
  </main>
</template>

<style lang="scss" scoped>
  
</style>