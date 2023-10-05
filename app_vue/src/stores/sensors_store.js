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
          const groupSelected = this.selectedGroup && this.selectedGroup.length > 0;
          if (!groupSelected) {
            return true;
          }
          return sensor.group && this.selectedGroup.includes(sensor.group);
        };

        // filter for asset tag
        const assetTagFilter = () => {
          const tagSelected = this.selectedAssetTag && this.selectedAssetTag.length > 0;
          if (!tagSelected) {
            return true;
          }
          return sensor.asset_tag && this.selectedAssetTag.includes(sensor.asset_tag);
        };

        // filter for bintype
        const binTypeFilter = () => {
          const binTypeSelected = this.selectedBinType && this.selectedBinType.length > 0;
          if (!binTypeSelected) {
            return true;
          }
          return sensor.bin_type && this.selectedBinType.includes(sensor.bin_type);
        };

        // filter for bin volume
        const binVolumeFilter = () => {
          const binVolumeSelected = this.selectedBinVolume && this.selectedBinVolume.length > 0;
          if (!binVolumeSelected) {
            return true;
          }
          return sensor.bin_volume && this.selectedBinVolume.includes(sensor.bin_volume);
        };

        // filter for materialType
        const materialTypeFilter = () => {
          const matTypeSelected = this.selectedMaterialType && this.selectedMaterialType.length > 0;
          if (!matTypeSelected) {
            return true;
          }
          return sensor.material_type && this.selectedMaterialType.includes(sensor.material_type);
        };

        // setting up new property
        const keepAfterFiltering = fillRangeFilter() && groupFilter() && assetTagFilter() && binTypeFilter() && binVolumeFilter() && materialTypeFilter();
        sensor.isFilteredOut = !keepAfterFiltering;
        return sensor;
      });
    }
  }
});
