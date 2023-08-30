<script setup>
  import { reactive, ref } from 'vue'

  const thresholdRange = ref([0,100]);

  const state = reactive({
    sliderValue: [0, 100],
    group: ['Alton North', 'Halton West', 'Bolton South'],
    assetTag: ['Up', 'Down', 'Top', 'Bottom', 'Strange', 'Charm'],
    binType: ['EMW Cathedral Container 10yd', 'EMW Cathedral Container 20yd'],
    binVolume: ['Small', 'Medium', 'Large']
  });

</script>

<template>
  <section class="filter-list">
    <div class="text-h6 padding-b-30">Filter Sensors</div>

    <div class="filter-list__fill-level">
      <div class="filter-list__label color-gray-grey">Fill Level Threshold</div>
      <v-range-slider class="filter-list__slider" 
        v-model="state.sliderValue"
        strict
        color="#2196F3"
        track-color="#2196F3"
        :ticks="[0,50,100]"
        show-ticks="always"
        tick-size="4"
        :step="1"
        :max="thresholdRange[1]"
        :min="thresholdRange[0]">
        <template v-slot:thumb-label="{ modelValue }">
          {{modelValue}}%
        </template>
      </v-range-slider>
    </div>

    <v-select class="filter-list__dropdown"
      label="Group"
      :items="state.group"
    ></v-select>

    <v-select class="filter-list__dropdown"
      label="Asset Tag"
      chips
      multiple
      :items="state.assetTag"
    ></v-select>

    <v-select class="filter-list__dropdown"
      label="Bin Type"
      :items="state.binType"
    ></v-select>

    <v-select class="filter-list__dropdown"
      label="Bin Volume"
      :items="state.binVolume"
    ></v-select>

  </section>
</template>

<style lang="scss" scoped>

  // vuetify overrides
  :deep .v-field--variant-filled .v-field__overlay { // vue select background
    background-color: white;
  }

  :deep .v-slider-thumb__surface { // slider size
    width: 12px;
    height: 12px;
  }

  :deep .v-input__details { // input padding size
    min-height: 14px;
  }
  
  .filter-list {
    width: 100%;

    &__label {
      @include fontBody;
    }
  }

</style>
