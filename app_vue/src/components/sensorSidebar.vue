<script setup>
  import SensorSideBarFilters from '@/components/sensorSideBarFilters.vue';
  import { useDevice, DEVICE_SIZE } from '@/utils/screenSizeHelper';
  import { reactive, onMounted } from 'vue'

  const state = reactive({
    location: 'left',
    device: useDevice()
  });

  onMounted(() => {
    window.addEventListener("resize", onWindowResize);
  });

  function onWindowResize() {
    state.device = useDevice();
    if (state.device.size === DEVICE_SIZE.s || state.device.size === DEVICE_SIZE.xs) {
      state.location = 'bottom';
    } else {
      state.location = 'left';
    }
  }


</script>

<template>
  <div>
    <v-layout>
      <v-navigation-drawer
        class="navigation-container"
        permanent
        :location="state.location"
        width="inherit"
        height="inherit"
      >
        <div class="navbar-content">

          <SensorSideBarFilters></SensorSideBarFilters>

          <section class="routes-list">
            <div class="text-h6 padding-b-30">Routes</div>
            <span class="font-italic">No routes to be displayed yet</span>
          </section>

          <!-- Map Updated button -->
          <v-btn class="map-updated" variant="plain">
            <vue-feather class="map-updated__icon" type="refresh-ccw"></vue-feather>
            <div>
              <span class="map-updated__text">Map updated:</span>
              <span>Just now</span>
            </div>
          </v-btn>

        </div>

      </v-navigation-drawer>
    </v-layout>


  </div>
</template>

<style lang="scss" scoped>

  :deep .v-navigation-drawer {
    width: 255px;
    border-radius: 20px 20px 0 0;
    height: 40%;

    @include smallScreens {
      height: 100%;
      border-radius: 0 20px 20px 0;
    }

    @include mediumScreens {
      width: 392px;
    }
  }

  //custom css
  .navbar-content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 17px 34px 31px 34px;
    
    @include smallScreens {
      height: 100%;
    }
  }

  .routes-list {
    margin-top: 40px;
    width: 100%;
  }

  .map-updated {
    display: none; //TODO: switch to flex when needed
    // display: flex;
    align-items: center;
    margin-top: auto;
    gap: 10px;
    color: #8D8D8D;
    min-width: 204px;
    width: 100%;
    justify-content: flex-start;
    padding-left: 0;
    @include fontBodySmall;

    &__icon {
     padding-right: 8px;
    }

    &__text {
      padding-right: 4px;
    }
  }
</style>
