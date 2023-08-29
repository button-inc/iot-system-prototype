<script setup lang="ts">
  /*
  * this file uses openlayer for vue 3: https://vue3openlayers.netlify.app/componentsguide/map/
  */
  import { ref, inject, onMounted } from "vue";
  import type { View } from "ol";
  import type { ObjectEvent } from "ol/Object";
  import type { PropType } from 'vue'
  import Overlay from 'ol/Overlay.js';

  const emit = defineEmits(["update-center"]);
  const props = defineProps({
    position: {
      type: Array as PropType<number[]>,
      required: true
    },
    id: {
      type: String,
      default: ''
    }
  });

  const positionData = ref(props.position);
  const popupData = ref([props.position[0] + 1, props.position[1]])

  // callback used when clicking marker
  const overlayClicked = (event: ObjectEvent, position: Array<number>, id: string) => {



    console.log('event', event, position, id);

    document.getElementById(id)?.classList.toggle('show');
    positionData.value = position;

    emit('update-center', position);
  };
</script>

<template>
  <!-- position is in order of long, lat -->
  <ol-overlay
    :position="positionData"
    @click="overlayClicked($event, positionData, props.id)"
  >

    <div class="sensor-marker">
      <img class="sensor-marker__icon" src="https://cdn-icons-png.flaticon.com/128/1304/1304037.png"/>
      <div class="popup" :id="id">
        hover here!
      </div>
       
      <!-- <div class="popup" :id="props.id">
        hover here!
      </div> -->
    </div>

  </ol-overlay>
</template>

<style lang="scss" scoped>
.sensor-marker {
  &__icon {
    width: 25px;
    height: 25px;
  }
}

.popup {
  display: none;
  height: 200px;
  width: 200px;
  background: white;
  border-radius: 16px;
  padding: 4px;
  &.show {
    display: block;
  }
}
</style>
