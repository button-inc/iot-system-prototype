<script setup>
  import { ref } from 'vue';

  const expand = ref(false);
  const expandNavBar = () => {
    expand.value = !expand.value;
  };
</script>

<template>
  <div>
    <v-navigation-drawer
      id="navigation"
      :expand-on-hover="expand"
      :key="expand"
      color="#191A1C"
      rail-width="41"
      width="400"
      rail
      permanent
    >
      <v-list class="navbar-icon" :class="{'navbar-icon__align-right': expand}" @click="expandNavBar">
        <vue-feather v-show="!expand" type="align-justify"></vue-feather>
        <vue-feather v-show="expand" type="x"></vue-feather>
      </v-list>

      <v-list density="compact" nav>
        <v-list-item title="Map" value="myfiles"></v-list-item>
      </v-list>

    </v-navigation-drawer>

    <div v-if="expand" class="navigation-overlay" @click="expand = false"></div>


  </div>
</template>

<style lang="scss" scoped>

  .navigation-overlay {
    background-color: black;
    opacity: 0.2;
    width: 100%;
    height: 100vh;
    position: absolute;
    top:0;
    right: 0;
    z-index: 1005;
  }

  .navbar-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    &__align-right {
      justify-content: flex-end;
      margin-right: 8px;
    }
  }
  
</style>