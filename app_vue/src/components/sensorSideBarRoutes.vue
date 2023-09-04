<script setup>
  import { watch, ref } from 'vue'
  import { useRouteStore } from '@/stores/route_store';
  import { storeToRefs } from 'pinia';

  const routeStore = useRouteStore();
  const { sensorRouteList } = storeToRefs(routeStore);
  const isOpen = ref(false);
  watch(sensorRouteList, () => {

  }, { deep: true })

</script>

<template>
  <section class="routes-list">
    <div class="text-h6 padding-b-30">Routes</div>
    <div class="py-4 px-4 routes-list__route-container">
      <!-- no route present -->
      <span v-if="sensorRouteList && sensorRouteList.length === 0" 
        class="font-italic">
        No route to be displayed yet
      </span>
      <!-- route is present -->
      <div v-else>
        <div class="d-flex align-center justify-space-between">
          <span>{{ sensorRouteList.length }} Bins </span>
          <div>
            <v-btn class="pl-0" variant="plain" @click="routeStore.clearSensorRoute">
              <vue-feather type="trash-2"></vue-feather>
            </v-btn>
            <v-btn class="pa-0" variant="plain" @click="isOpen = !isOpen">
              <vue-feather :type="isOpen ? 'chevron-up':'chevron-down'"></vue-feather>
            </v-btn>
          </div>
        </div>
        <template v-if="isOpen">
          <div v-for="sensor in sensorRouteList" :key="sensor.id" class="d-flex routes-list__route mt-4">
            <vue-feather type="map-pin"></vue-feather>
            <div class="d-flex flex-column ml-2">
              <span>{{ sensor.address_line1 }}</span>
              <span>{{ sensor.address_line2 }}</span>
            </div>
          </div>
          <!-- TODO: placeholders -->
          <v-btn class="pa-0" variant="plain">
            Optimize route
          </v-btn>
          <v-btn class="pa-0" variant="plain">
            Export route
          </v-btn>
        </template>
      </div>
    </div>

  </section>
</template>

<style lang="scss" scoped>
  .routes-list {
    margin-top: 40px;
    width: 100%;

    &__route-container {
      border: 1px solid $grey;
    }

    &__route {
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep .v-btn--size-default {
      min-width: 24px;
    }
  }
</style>
