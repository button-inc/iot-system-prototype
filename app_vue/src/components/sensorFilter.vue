<script setup>
  import { ref, reactive, watch } from 'vue'

  // const props = defineProps({
  //   sensors: {
  //     type: Array,
  //     required: true
  //   },
  //   alertThreshold: {
  //     type: Number
  //   },
  //   filterThresholdMaximum: {
  //     type: Number
  //   },
  //   filterThresholdMinimum: {
  //     type: Number
  //   }
  // })

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
          <v-icon icon="fa:fas fa-list"></v-icon>
        </v-app-bar-nav-icon>
        <v-toolbar-title>Create Route</v-toolbar-title>
      </v-app-bar>

      <v-navigation-drawer
        v-model="state.drawer"
        location="left"
        temporary
      >
        <v-list
          :items="state.items"
        ></v-list>
      </v-navigation-drawer>
    </v-layout>


  </div>
</template>

<style lang="scss" scoped>

</style>
