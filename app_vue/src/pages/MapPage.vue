<script setup>
  import { ref } from 'vue';
  import SensorMap from '@/components/sensorMap.vue';
  import SensorSidebar from '@/components/sensorSidebar.vue';
  import data from '@/data/sensorsMock.json';
  import { useSensorStore } from '@/stores/sensors_store';
  import { useNavbarStore } from '@/stores/navbar_store';

  // config
  const alertThreshold = ref(50);
  const filterThresholdMaximum = ref(100);
  const filterThresholdMinimum = ref(0);
  
  // using mock sensor data
  const sensorStore = useSensorStore();
  sensorStore.setSensors(data.sensors);

  //navbar
  const expand = ref(false);
  const expandNavBar = () => {
    expand.value = !expand.value;
  };
</script>

<template>
  <main>
    <v-layout class="map-page">
      
      <v-navigation-drawer
        id="navigation"
        :expand-on-hover="expand"
        :mini-variant="expand"
        :key="expand"
        permanent
        color="#191A1C"
        rail
        rail-width="41"
        width="400"
      >
        <v-list class="navbar-icon" :class="{'align-right': expand}" @click="expandNavBar">
          <vue-feather v-show="!expand" type="align-justify"></vue-feather>
          <vue-feather v-show="expand" class="navbar-icon__close" type="x"></vue-feather>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-folder" title="My Files" value="myfiles"></v-list-item>
          <v-list-item prepend-icon="mdi-account-multiple" title="Shared with me" value="shared"></v-list-item>
          <v-list-item prepend-icon="mdi-star" title="Starred" value="starred"></v-list-item>
        </v-list>
      </v-navigation-drawer>

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
  .navbar-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    &.align-right {
      justify-content: flex-end;
      margin-right: 8px;
    }
  }
  
</style>