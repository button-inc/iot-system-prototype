<script setup>
  import { reactive, ref } from 'vue'
  import { useSensorStore } from '@/stores/sensors_store';

  const thresholdRange = ref([0,100]);
  const sensorStore = useSensorStore();
  
  const state = reactive({
    selectedGroup: null,
    selectedAssetTag: [],
    selectedBinType: null,
    selectedBinVolume: null,
    selectedFillRange: [0, 100],
    group: sensorStore.getAllGroupOptions(),
    assetTag: sensorStore.getAllAssetTags(),
    binType: sensorStore.getAllBinTypes(),
    binVolume: sensorStore.getAllBinVolumes(),
  });

  function updateGroupFilter() {
    sensorStore.setSelectedGroup(state.selectedGroup);
    sensorStore.updateSensorsWithFilters();
  }

  function updateAssetTagFilter() {
    sensorStore.setSelectedAssetTag(state.selectedAssetTag);
    sensorStore.updateSensorsWithFilters();
  }

  function updateBinTypeFilter() {
    sensorStore.setSelectedBinType(state.selectedBinType);
    sensorStore.updateSensorsWithFilters();
  }

  function updateBinVolumeFilter() {
    sensorStore.setSelectedBinVolume(state.selectedBinVolume);
    sensorStore.updateSensorsWithFilters();
  }

  function updateFillRangeFilter() {
    sensorStore.setSelectedFillRange(state.selectedFillRange);
    sensorStore.updateSensorsWithFilters();
  }

  function clearFilters() {
    sensorStore.$reset();
    state.selectedGroup = null;
    state.selectedAssetTag = null;
    state.selectedBinType = null;
    state.selectedBinVolume = null;
    state.selectedFillRange = [0, 100];
  }

</script>

<template>
  <section class="filter-list">
    <div class="text-h6 padding-b-30 d-flex align-center">
      <span>Filter Sensors ({{ sensorStore.getTotalSensors() }})</span> 
      <span class="mx-3">|</span>
      <v-btn variant="plain" color="#2196F3" class="pa-0 pt-1 text-capitalize" @click="clearFilters">Clear</v-btn>
    </div>

    <div class="filter-list__fill-level">
      <div class="filter-list__label color-gray-grey">Fill Level Threshold</div>
      <v-range-slider class="filter-list__slider" 
        v-model="state.selectedFillRange"
        strict
        color="#2196F3"
        track-color="#2196F3"
        :ticks="[0,50,100]"
        show-ticks="always"
        tick-size="4"
        :step="1"
        :max="thresholdRange[1]"
        :min="thresholdRange[0]"
        @update:modelValue="updateFillRangeFilter">
        <template v-slot:thumb-label="{ modelValue }">
          {{modelValue}}%
        </template>
      </v-range-slider>
    </div>

    <v-select class="filter-list__dropdown"
      v-model="state.selectedGroup"
      label="Group"
      :items="state.group"
      @update:modelValue="updateGroupFilter"
    ></v-select>

    <v-select class="filter-list__dropdown"
      v-model="state.selectedAssetTag"
      label="Asset Tag"
      chips
      multiple
      :items="state.assetTag"
      @update:modelValue="updateAssetTagFilter"
    ></v-select>

    <v-select class="filter-list__dropdown"
      v-model="state.selectedBinType"
      label="Bin Type"
      :items="state.binType"
      @update:modelValue="updateBinTypeFilter"
    ></v-select>

    <v-select class="filter-list__dropdown"
      v-model="state.selectedBinVolume"
      label="Bin Volume"
      :items="state.binVolume"
      @update:modelValue="updateBinVolumeFilter"
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
