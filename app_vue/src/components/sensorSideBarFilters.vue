<script setup>
  import { reactive, ref, watch } from 'vue'
  import { useSensorStore } from '@/stores/sensors_store';
  import { useRouteStore } from '@/stores/route_store';
  import { storeToRefs } from 'pinia';
  import { telusUi } from '@/styles/telusUi';

  const thresholdRange = ref([0,100]);

  // route store
  const routeStore = useRouteStore();

  // sensor store
  const sensorStore = useSensorStore();
  const { 
    sensors, 
    getAllGroupOptions,
    getAllAssetTags,
    getAllBinTypes,
    getAllBinVolumes,
    getAllMaterialTypes } = storeToRefs(sensorStore);

  // component reactive variables
  const state = reactive({
    selectedGroup: null,
    selectedAssetTag: [],
    selectedBinType: [],
    selectedBinVolume: null,
    selectedFillRange: [0, 100],
    selectedMaterialType: [],
    group: [],
    assetTag: [],
    binType: [],
    binVolume: [],
    materialType: [],
    totalSensors: 0,
    showFillLabel: false,
    isCollapsed: false,
    filterEnabledMap: {
      fillRange: false,
      group: false,
      assetTag: false,
      binType: false,
      binVolume: false,
      matType: false
    }
  });

  // watching for store state updates and updating component variables
  watch(sensors, () => {
    state.totalSensors = sensorStore.getTotalSensors;
  })

  watch(getAllGroupOptions, () => {
    state.group = sensorStore.getAllGroupOptions;
  })

  watch(getAllAssetTags, () => {
    state.assetTag = sensorStore.getAllAssetTags;
  })

  watch(getAllBinTypes, () => {
    state.binType = sensorStore.getAllBinTypes;
  })

  watch(getAllBinVolumes, () => {
    state.binVolume = sensorStore.getAllBinVolumes;
  })

  watch(getAllMaterialTypes, () => {
    state.materialType = sensorStore.getAllMaterialTypes;
  })

  function updateSensorsShown() {
    routeStore.clearSensorRoute();
    sensorStore.updateSensorsWithFilters();
  }

  // when change event is received from form, update sensor store
  function updateGroupFilter() {
    sensorStore.setSelectedGroup(state.selectedGroup);
    updateSensorsShown();

    if (state.selectedGroup) {
      state.filterEnabledMap['group'] = true;
    } else {
      state.filterEnabledMap['group'] = false;
    }
  }

  function updateAssetTagFilter() {
    sensorStore.setSelectedAssetTag(state.selectedAssetTag);
    updateSensorsShown();

    if (state.selectedAssetTag.length > 0) {
      state.filterEnabledMap['assetTag'] = true;
    } else {
      state.filterEnabledMap['assetTag'] = false;
    }
  }

  function updateBinTypeFilter() {
    sensorStore.setSelectedBinType(state.selectedBinType);
    updateSensorsShown();

    if (state.selectedBinType.length > 0) {
      state.filterEnabledMap['binType'] = true;
    } else {
      state.filterEnabledMap['binType'] = false;
    }
  }

  function updateBinVolumeFilter() {
    sensorStore.setSelectedBinVolume(state.selectedBinVolume);
    updateSensorsShown();

    if (state.selectedBinVolume) {
      state.filterEnabledMap['binVolume'] = true;
    } else {
      state.filterEnabledMap['binVolume'] = false;
    }
  }

  function updateFillRangeFilter() {
    sensorStore.setSelectedFillRange(state.selectedFillRange);
    updateSensorsShown();

    const isInitial = state.selectedFillRange[0] === 0 && state.selectedFillRange[1] === 100;
    if (isInitial) {
      state.filterEnabledMap['fillRange'] = false;
    } else {
      state.filterEnabledMap['fillRange'] = true;
    }
  }

  function updateMaterialTypeFilter() {
    sensorStore.setSelectedMaterialType(state.selectedMaterialType);
    updateSensorsShown();

    if (state.selectedMaterialType.length > 0) {
      state.filterEnabledMap['materialType'] = true;
    } else {
      state.filterEnabledMap['materialType'] = false;
    }
  }

  function clearFilters() {
    sensorStore.clearSelected(); // clear store of selected values
    routeStore.clearSensorRoute(); // clear route
    // clear v-models in form
    state.selectedGroup = null;
    state.selectedAssetTag = [];
    state.selectedBinType = null;
    state.selectedBinVolume = null;
    state.selectedFillRange = [0, 100];
    state.selectedMaterialType = [];

    Object.keys(state.filterEnabledMap).forEach(key => {
      state.filterEnabledMap[key] = false;
    })
  }

  function getFilterCount() { // returns number of filters in use
    const truthArr = Object.values(state.filterEnabledMap).filter(isEnabled => isEnabled);
    return truthArr.length;
  }

</script>

<template>
  <section class="filter-list">
    <div class="filter-list__heading">
      <div class="d-flex align-center">
        <span class="filter-list__title">Filter ({{ getFilterCount() }})</span> 
        <span class="mx-3">|</span>
        <v-btn variant="plain" color="#2196F3" class="pa-0 pt-1 text-capitalize" @click="clearFilters">Clear</v-btn>
      </div>

      <v-btn variant="plain" color="#191A1C" class="pa-0" @click="state.isCollapsed = !state.isCollapsed">
        <vue-feather :type="state.isCollapsed ? 'chevron-up' : 'chevron-down'"></vue-feather>
      </v-btn>
    </div>
    
    <section v-if="!state.isCollapsed" class="filter-list__fields">
      <div class="filter-list__fill-level">
        <div class="filter-list__label color-gray-grey">Fill Level Threshold</div>
        <v-range-slider class="filter-list__slider" 
          v-model="state.selectedFillRange"
          strict
          :color="telusUi.green"
          :track-color="telusUi.green"
          :ticks="[0,50,100]"
          show-ticks="always"
          tick-size="0"
          :step="1"
          :max="thresholdRange[1]"
          :min="thresholdRange[0]"
          :thumb-label="state.showFillLabel"
          @mouseup="state.showFillLabel = false"
          @mousedown="state.showFillLabel = true"
          @update:modelValue="updateFillRangeFilter">
          <template v-slot:thumb-label="{ modelValue }">
            {{modelValue}}%
          </template>
        </v-range-slider>
      </div>

      <v-autocomplete class="filter-list__dropdown"
        v-model="state.selectedGroup"
        label="Group"
        clearable
        :items="state.group"
        @update:modelValue="updateGroupFilter"
      ></v-autocomplete>

      <v-autocomplete class="filter-list__dropdown"
        v-model="state.selectedAssetTag"
        label="Asset Tag"
        chips
        multiple
        :items="state.assetTag"
        @update:modelValue="updateAssetTagFilter"
      ></v-autocomplete>

      <v-autocomplete class="filter-list__dropdown"
        v-model="state.selectedBinType"
        label="Bin Type"
        chips
        multiple
        :items="state.binType"
        @update:modelValue="updateBinTypeFilter"
      ></v-autocomplete>

      <v-autocomplete class="filter-list__dropdown"
        v-model="state.selectedBinVolume"
        label="Bin Volume"
        clearable
        :items="state.binVolume"
        @update:modelValue="updateBinVolumeFilter"
      ></v-autocomplete>

      <v-autocomplete class="filter-list__dropdown"
        v-model="state.selectedMaterialType"
        label="Material Type"
        chips
        multiple
        :items="state.materialType"
        @update:modelValue="updateMaterialTypeFilter"
      ></v-autocomplete>
    </section>


    <div class="my-6">
      <span class="font-weight-bold">Result: {{ state.totalSensors }} bin{{ state.totalSensors > 1 ? 's' : '' }}</span>
      displayed on map
    </div>
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

  :deep .v-slider-track__fill{ // slider track size
    height: 2px !important;
  }

  :deep .v-slider-track__background{ // slider bg size
    height: 2px !important;
  }

  :deep .v-input__details { // input padding size
    min-height: 14px;
  }
  
  .filter-list {
    width: 100%;

    &__heading {
      display: flex;
      align-items: center;
      padding-bottom: 30px;
      justify-content: space-between;
      flex-direction: column;
      @include fontHeading6;

      @include smallScreens {
        flex-direction: column;
      }
      
      @include mediumScreens {
        flex-direction: row;
      }
    }

    &__label {
      @include fontBody;
    }

    &__title {
      min-width: 164px;
    }

    .v-btn {
      min-width: 0;
    }
  }

</style>
