import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSensorStore = defineStore('sensors', () => {
  //state
  const sensors = ref([]);
  const allSensors = ref([]);

  const selectedGroup = ref('');
  const selectedAssetTag = ref('');
  const selectedBinType = ref('');
  const selectedBinVolume = ref('');
  const selectedFillRange = ref([0,100]);

  function $reset() {
    sensors.value = [];
  }

  //setters
  function setSensors(value) {
    sensors.value = value;
    allSensors.value = value;
  }

  function setSelectedGroup(group) {
    selectedGroup.value = group;
  }

  function setSelectedAssetTag(assetTag) {
    selectedAssetTag.value = assetTag;
  }

  function setSelectedBinType(binType) {
    selectedBinType.value = binType;
  }

  function setSelectedBinVolume(binVolume) {
    selectedBinVolume.value = binVolume;
  }

  function setSelectedFillRange(fillRange) {
    selectedFillRange.value = fillRange;
  }

  function updateSensorsWithFilters() {
    // TODO: accomodate null fill level
    sensors.value = allSensors.value.filter(sensor => {
      const isFillRangeValid = selectedFillRange.value && sensor.fill_level;
      const isWithinFillRange = sensor.fill_level >= selectedFillRange.value[0] && sensor.fill_level <= selectedFillRange.value[1];
      
      return selectedFillRange.value && sensor.fill_level ? sensor.fill_level >= selectedFillRange.value[0] && sensor.fill_level <= selectedFillRange.value[1] : true
        && selectedGroup.value && sensor.group ? sensor.group === selectedGroup.value : true
        && selectedAssetTag.value && sensor.asset_tag ? sensor.asset_tag === selectedAssetTag.value : true
        && selectedBinType.value && sensor.bin_type ? sensor.bin_type === selectedBinType.value : true
        && selectedBinVolume.value && sensor.bin_volume ? sensor.bin_volume === selectedBinVolume.value : true;
    })
  }

  //getters
  function getTotalSensors() {
    return sensors.value.length;
  }

  function getAllGroupOptions() {
    return [...new Set(sensors.value.flatMap(sensor => sensor.group || []))];
  }

  function getAllAssetTags() {
    return [...new Set(sensors.value.flatMap(sensor => sensor.asset_tag || []))];
  }

  function getAllBinTypes() {
    return [...new Set(sensors.value.flatMap(sensor => sensor.bin_type || []))];
  }

  function getAllBinVolumes() {
    return [...new Set(sensors.value.flatMap(sensor => sensor.bin_volume || []))];
  }

  return { 
    $reset,
    sensors, 
    setSensors, 
    setSelectedGroup,
    setSelectedAssetTag,
    setSelectedBinType,
    setSelectedBinVolume,
    setSelectedFillRange,
    updateSensorsWithFilters,
    getTotalSensors,
    getAllGroupOptions,
    getAllAssetTags,
    getAllBinTypes,
    getAllBinVolumes  
  };
})