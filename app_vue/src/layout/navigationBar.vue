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
      :expand-on-hover="false"
      :rail="!expand"
      :key="expand"
      color="#191A1C"
      rail-width="41"
      width="400"
      permanent
    >
      <v-list class="navbar-icon" :class="{'navbar-icon__x': expand}" @click="expandNavBar">
        <vue-feather v-show="!expand" type="align-justify"></vue-feather>
        <vue-feather v-show="expand" type="x"></vue-feather>
      </v-list>

      <v-list v-show="expand" class="navbar-links" density="compact" nav>
        <v-list-item class="navbar-links__link" link href="/" rounded value="Map">
          <vue-feather v-show="expand" type="map"></vue-feather>
          Map
        </v-list-item>
        <v-divider class="mt-3 mb-3"></v-divider>
      </v-list>

    </v-navigation-drawer>

    <div v-if="expand" class="navigation-overlay" @click="expand = false"></div>


  </div>
</template>

<style lang="scss" scoped>
  // vuetify overrides
  :deep .v-list.navbar-icon {
    padding: 14px 0;
  }
  :deep .navbar-links .v-list-item__content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  :deep .navbar-links.v-list {
    padding: 0 40px 40px 40px;
  }

  :deep .v-list-item.navbar-links__link {
    padding: 6px 16px;
  }

  // custom css
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
    cursor: pointer;

    &__x {
      justify-content: flex-end;
      margin-right: 8px;
    }
  }
  
</style>