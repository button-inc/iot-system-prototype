import { defineStore } from 'pinia'

export const useSensorStore = defineStore('sensors', {
  state: () => ({
    sensors: [],
    allSensors: [],
    selectedGroup: null,
    selectedAssetTag: [],
    selectedBinType: [],
    selectedBinVolume: null,
    selectedFillRange: [0,100]
  }),
  getters: {
    getTotalSensors({ sensors }) {
      return Object.keys(sensors).length;
    },
    getAllGroupOptions({ allSensors }) {
      return [...new Set(allSensors.flatMap(sensor => sensor.group || []))];
    },
    getAllAssetTags({ allSensors }) {
      return [...new Set(allSensors.flatMap(sensor => sensor.asset_tag || []))];
    },
    getAllBinTypes({ allSensors }) {
      return [...new Set(allSensors.flatMap(sensor => sensor.bin_type || []))];
    },
    getAllBinVolumes({ allSensors }) {
      return [...new Set(allSensors.flatMap(sensor => sensor.bin_volume || []))];
    }
  },
  actions: {
    clearSelected() {
      this.selectedGroup = null;
      this.selectedAssetTag = [];
      this.selectedBinType = [];
      this.selectedBinVolume = null;
      this.selectedFillRange = [0, 100];
      this.updateSensorsWithFilters();
    },
    setSensors(value) {
      this.sensors = value;
      this.allSensors = value;
    },
    setSelectedGroup(group) {
      this.selectedGroup = group
    },
    setSelectedAssetTag(assetTag) {
      this.selectedAssetTag = assetTag;
    },
    setSelectedBinType(binType) {
      this.selectedBinType = binType;
    },
    setSelectedBinVolume(binVolume) {
      this.selectedBinVolume = binVolume;
    },
    setSelectedFillRange(fillRange) {
      this.selectedFillRange = fillRange;
    },
    updateSensorsWithFilters() {
      this.sensors = this.allSensors.filter(sensor => {
        // filter for fill range
        const fillRangeFilter = () => {
          if (this.selectedFillRange && sensor.fill_level) {
            return sensor.fill_level >= this.selectedFillRange[0] && sensor.fill_level <= this.selectedFillRange[1];
          }
          return true;
        };
  
        // filter for group
        const groupFilter = () => {
          if (this.selectedGroup && sensor.group) {
            return sensor.group === this.selectedGroup;
          }
          return true;
        };
  
        // filter for asset tag
        const assetTagFilter = () => {
          if (this.selectedAssetTag && this.selectedAssetTag.length > 0 && sensor.asset_tag) {
            return this.selectedAssetTag.includes(sensor.asset_tag);
          }
          return true;
        };
  
        // filter for bintype
        const binTypeFilter = () => {
          if (this.selectedBinType && this.selectedBinType.length > 0 && sensor.bin_type) {
            return this.selectedBinType.includes(sensor.bin_type);
          }
          return true;
        };
  
        // filter for bin volume
        const binVolumeFilter = () => {
          if (this.selectedBinVolume && sensor.bin_volume) {
            return sensor.bin_volume === this.selectedBinVolume;
          }
          return true;
        };
        
        // combining results of all filters together
        return fillRangeFilter() && groupFilter() && assetTagFilter() && binTypeFilter() && binVolumeFilter();
      })
    }
  },
})