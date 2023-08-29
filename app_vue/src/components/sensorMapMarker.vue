<script setup lang="ts">
  /*
  * this file uses openlayer for vue 3: https://vue3openlayers.netlify.app/componentsguide/map/
  */
  import { ref, inject, onMounted } from "vue";
  import type { View } from "ol";
  import type { ObjectEvent } from "ol/Object";
  import type { PropType } from 'vue'


  const props = defineProps({
    position: {
      type: Array as PropType<Number[]>,
      required: true
    },
    id: {
      type: String,
      default: ''
    }
  });

  const positionData = ref(props.position);


  // callback used when clicking marker
  const overlayClicked = (event: ObjectEvent, position: Array<Number>, id: string) => {
    console.log('event', event, position, id);
    document.getElementById('8CD9834D4694893F')?.classList.toggle('show');
  };
</script>

<template>
  <!-- position is in order of long, lat -->
  <ol-overlay
    :position="positionData"
    @click="overlayClicked($event, positionData, props.id)"
  >

    <div class="overlay-content">
      <img class="icon" src="https://cdn-icons-png.flaticon.com/128/1304/1304037.png"/>

      <div class="hover-content" id="8CD9834D4694893F">
        hover here!
      </div>
    </div>

  </ol-overlay>
</template>

<style lang="scss" scoped>
.icon {
  width: 25px;
  height: 25px;
}

.hover-content {
  display: none;
  &.show {
    display: block;
  }
}
</style>
