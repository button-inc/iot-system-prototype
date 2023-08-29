<script setup>
  import { ref, reactive, watch } from 'vue'

  const props = defineProps({
    sensors: {
      type: Array,
      required: true
    },
  })

  const state = reactive({ 
    drawer: false,
    group: null,
    items: [
      {
        title: 'Foo',
        value: 'foo',
      },
      {
        title: 'Bar',
        value: 'bar',
      },
      {
        title: 'Fizz',
        value: 'fizz',
      },
      {
        title: 'Buzz',
        value: 'buzz',
      },
    ],
  });

  watch(() => state.group, () => {
    state.drawer = false;
  });

</script>

<template>
  <div>
    <v-layout>
      <v-app-bar
        color="#E4E4E4"
        prominent
      >
        <v-app-bar-nav-icon @click.stop="state.drawer = !state.drawer">
          <vue-feather type="align-justify"></vue-feather>
        </v-app-bar-nav-icon>
        <v-toolbar-title>Create Route</v-toolbar-title>
      </v-app-bar>

      <v-navigation-drawer
        v-model="state.drawer"
        :width="392"
        location="bottom"
        temporary
      >
        <section class="navbar-container">

          <section class="filter-list">
            <span class="text-h6">Filters</span>
          </section>

          <!-- Map Updated button -->
          <v-btn class="map-updated" variant="plain">
            <vue-feather class="map-updated__icon" type="refresh-ccw"></vue-feather>
            <div>
              <span class="map-updated__text">Map updated:</span>
              <span>Just now</span>
            </div>
          </v-btn>
        </section>

      </v-navigation-drawer>
    </v-layout>


  </div>
</template>

<style lang="scss" scoped>
  .navbar-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 17px 10px;

    @include smallScreens {
      padding: 17px 43px 31px 43px;
    }
  }
  
  .map-updated {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #8D8D8D;
    min-width: 204px;

    &__icon {
      padding-right: 8px;
    }

    &__text {
      padding-right: 4px;
    }
  }
</style>
