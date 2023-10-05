import { defineStore } from 'pinia';

export const useSensorStore = defineStore('sensors', {
  state: () => ({
    sensors: [],
    selectedGroup: [],
    selectedAssetTag: [],
    selectedBinType: [],
    selectedBinVolume: [],
    selectedFillRange: [0, 100],
    selectedMaterialType: []
  }),
  getters: {
    getSensors({ sensors }) {
      return sensors;
    },
    getRoutableSensors({ sensors }) {
      return sensors.filter((sensor) => {
        return !sensor.isFilteredOut;
      });
    },
    getTotalSensors({ sensors }) {
      return Object.keys(sensors).length;
    },
    getAllGroupOptions({ sensors }) {
      return [...new Set(sensors.flatMap((sensor) => sensor.group || []))];
    },
    getAllAssetTags({ sensors }) {
      return [...new Set(sensors.flatMap((sensor) => sensor.asset_tag || []))];
    },
    getAllBinTypes({ sensors }) {
      return [...new Set(sensors.flatMap((sensor) => sensor.bin_type || []))];
    },
    getAllBinVolumes({ sensors }) {
      return [...new Set(sensors.flatMap((sensor) => sensor.bin_volume || []))];
    },
    getAllMaterialTypes({ sensors }) {
      return [...new Set(sensors.flatMap((sensor) => sensor.material_type || []))];
    }
  },
  actions: {
    clearSelected() {
      this.selectedGroup = [];
      this.selectedAssetTag = [];
      this.selectedBinType = [];
      this.selectedBinVolume = [];
      this.selectedFillRange = [0, 100];
      this.selectedMaterialType = [];
      this.updateSensorsWithFilters();
    },
    setSensors(value) {
      this.sensors = value;
    },
    setSelectedGroup(group) {
      this.selectedGroup = group;
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
    setSelectedMaterialType(materialType) {
      this.selectedMaterialType = materialType;
    },
    updateSensorsWithFilters() {
      this.sensors.map((sensor) => {
        // filter for fill range
        const fillRangeFilter = () => {
          if (this.selectedFillRange && (sensor.fill_level || sensor.fill_level === 0)) {
            return sensor.fill_level >= this.selectedFillRange[0] && sensor.fill_level <= this.selectedFillRange[1];
          }
          return true;
        };

        // filter for group
        const groupFilter = () => {
          if (this.selectedGroup && this.selectedGroup.length > 0 && sensor.group) {
            return this.selectedGroup.includes(sensor.group);
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
          if (this.selectedBinVolume && this.selectedBinVolume.length > 0 && sensor.bin_volume) {
            return this.selectedBinVolume.includes(sensor.bin_volume);
          }
          return true;
        };

        // filter for materialType
        const materialTypeFilter = () => {
          if (this.selectedMaterialType && this.selectedMaterialType.length > 0 && sensor.material_type) {
            return this.selectedMaterialType.includes(sensor.material_type);
          }
          return true;
        };

        // setting up new property

        const keepAfterFiltering = fillRangeFilter() && groupFilter() && assetTagFilter() && binTypeFilter() && binVolumeFilter() && materialTypeFilter();
        sensor.isFilteredOut = !keepAfterFiltering;
        return sensor;
      });
    }
  }
});
