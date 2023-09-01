import { ref } from 'vue'
import { defineStore } from 'pinia'

// this store is used to carry sensor data throughout our app
// functions starting with "set" -> setters
// functions starting with "get" -> getters
// functions starting with "update" -> actions
export const useSensorStore = defineStore('sensors', () => {
  //state
  const sensors = ref([]); // variable to manipulate sensor data
  const allSensors = ref([]); // state to hold all sensors

  const selectedGroup = ref(null);
  const selectedAssetTag = ref([]);
  const selectedBinType = ref(null);
  const selectedBinVolume = ref(null);
  const selectedFillRange = ref([0,100]);

  function $reset() {
    sensors.value = allSensors.value;
    selectedGroup.value = null;
    selectedAssetTag.value = [];
    selectedBinType.value = null;
    selectedBinVolume.value = null;
    selectedFillRange.value = null;
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
    // if user has selected a filter option, and that param is present in sensor data, confirm that they match
    // if they don't match, filter the sensor out (ie. return false)
    // if sensor data is having a null param, keep the sensor (ie. return true by default)
    // note: when we return true, sensor is still kept in the list
    sensors.value = allSensors.value.filter(sensor => {
      // filter for fill range
      const fillRangeFilter = () => {
        if (selectedFillRange.value && sensor.fill_level) {
          return sensor.fill_level >= selectedFillRange?.value[0] && sensor.fill_level <= selectedFillRange?.value[1];
        }
        return true;
      };

      // filter for group
      const groupFilter = () => {
        if (selectedGroup.value && sensor.group) {
          return sensor.group === selectedGroup.value;
        }
        return true;
      };

      // filter for asset tag
      const assetTagFilter = () => {
        if (selectedAssetTag.value && selectedAssetTag.value.length > 0 && sensor.asset_tag) {
          return selectedAssetTag.value.includes(sensor.asset_tag);
        }
        return true;
      };

      // filter for bintype
      const binTypeFilter = () => {
        if (selectedBinType.value && sensor.bin_type) {
          return sensor.bin_type === selectedBinType.value ;
        }
        return true;
      };

      // filter for bin volume
      const binVolumeFilter = () => {
        if (selectedBinVolume.value && sensor.bin_volume) {
          return sensor.bin_volume === selectedBinVolume.value;
        }
        return true;
      };
      
      // combining results of all filters together
      return fillRangeFilter() && groupFilter() && assetTagFilter() && binTypeFilter() && binVolumeFilter();
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