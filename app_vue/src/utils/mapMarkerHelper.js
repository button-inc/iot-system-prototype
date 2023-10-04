const ICON_NAMES = {
  FULL_BIN: 'full-bin',
  HALF_FULL_BIN: 'half-full-bin',
  EMPTY_BIN: 'empty-bin',
  ERROR_BIN: 'error-bin'
  // GREYSCALE_EMPTY_BIN: 'greyscale-empty-bin',
  // GREYSCALE_HALF_FULL_BIN: 'greyscale-half-full-bin',
  // GREYSCALE_FULL_BIN: 'greyscale-full-bin'
};

// const IS_FILTERED_OUT = 'isFilteredOut';

export const getBinIconName = (sensor) => {
  const isErrorState = sensor.error;
  // const isFilteredOut = sensor[IS_FILTERED_OUT];
  const isFullState = sensor.fill_level && sensor.fill_level >= 75;
  const isHalfFullState = sensor.fill_level && sensor.fill_level >= 50 && sensor.fill_level < 75;
  const isEmptyState = sensor.fill_level && sensor.fill_level < 50;

  if (isErrorState) {
    return ICON_NAMES.ERROR_BIN;
  } else if (isFullState) {
    return ICON_NAMES.FULL_BIN;
  } else if (isHalfFullState) {
    return ICON_NAMES.HALF_FULL_BIN;
  } else if (isEmptyState) {
    return ICON_NAMES.EMPTY_BIN;
  }
  return ICON_NAMES.EMPTY_BIN; // default
};

export const getMaterialTypeIconURL = (materialType) => {
  const directory = 'src/assets/images/materialTypeIcons';
  const genericMaterialIconPath = `${directory}/generic-material.svg`;
  if (!materialType) {
    return genericMaterialIconPath;
  }
  const materialMap = {
    Cardboard: `${directory}/cardboard.svg`,
    Plastic: `${directory}/plastic.svg`,
    Compost: `${directory}/compost.svg`,
    Garbage: `${directory}/garbage.svg`,
    'Mixed Recyclables': `${directory}/mixed_recyclables.svg`,
    Paper: `${directory}/paper.svg`,
    'Mixed Containers': `${directory}/mixed_containers.svg`,
    'Glass, Metal, Plastic': `${directory}/glass_metal_plastic.svg`,
    'Soft Plastic': `${directory}/soft_plastic.svg`,
    WTE: `${directory}/wte.svg`,
    Shredding: `${directory}/shredding.svg`,
    'Scrap Metal': `${directory}/scrap_metal.svg`,
    Wood: `${directory}/wood.svg`,
    'Construction Waste': `${directory}/construction_waste.svg`
  };
  return materialMap[materialType] || genericMaterialIconPath;
};

// linearProgressColor -> used by Vuetify to determine progress bar color
export const getVuetifyLinearProgressColor = (iconName) => {
  const RED = '#C92828';
  const GREEN = 'green';
  const ORANGE = '#F07F2D';

  let linearProgressColor = GREEN;

  if (iconName === ICON_NAMES.ERROR_BIN || iconName === ICON_NAMES.FULL_BIN) {
    linearProgressColor = RED;
  } else if (iconName === ICON_NAMES.HALF_FULL_BIN) {
    linearProgressColor = ORANGE;
  }
  return linearProgressColor;
};

// iconURL -> used by Vuetify to display bin icon
export const getIconUrl = (iconName) => {
  const iconDirectory = 'src/assets/images/binMarkerIcons';
  return `${iconDirectory}/${iconName}.png`;
};
