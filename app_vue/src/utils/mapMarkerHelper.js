const ICON_NAMES = {
  GREYSCALE_FULL_BIN: 'greyscale-full-bin',
  FULL_BIN: 'full-bin',
  GREYSCALE_HALF_FULL_BIN: 'greyscale-half-full-bin',
  HALF_FULL_BIN: 'half-full-bin',
  GREYSCALE_EMPTY_BIN: 'greyscale-empty-bin',
  EMPTY_BIN: 'empty-bin',
  ERROR_BIN: 'error-bin'
};

const getBinIconName = (sensor) => {
  const isErrorState = sensor.error;
  const isFilteredOut = 'keepAfterFiltering' in sensor && !sensor.keepAfterFiltering;
  const isFullState = sensor.fill_level && sensor.fill_level >= 75;
  const isHalfFullState = sensor.fill_level && sensor.fill_level >= 50 && sensor.fill_level < 75;
  const isEmptyState = sensor.fill_level && sensor.fill_level < 50;

  if (isErrorState) {
    // shows error icon
    return ICON_NAMES.ERROR_BIN;
  } else if (isFilteredOut && isFullState) {
    return ICON_NAMES.GREYSCALE_FULL_BIN;
  } else if (isFilteredOut && isHalfFullState) {
    return ICON_NAMES.GREYSCALE_HALF_FULL_BIN;
  } else if (isFilteredOut && isEmptyState) {
    return ICON_NAMES.GREYSCALE_EMPTY_BIN;
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
// iconURL -> used by Vuetify to display bin icon
export const getIconAndProgressColor = (sensor) => {
  // mini-helper function
  const iconName = getBinIconName(sensor);
  let iconUrl = '';
  let linearProgressColor = '';
  const RED = '#C92828';
  const GREEN = 'green';
  const ORANGE = '#F07F2D';
  const iconDirectory = 'src/assets/images/binMarkerIcons';

  iconUrl = `${iconDirectory}/${iconName}.png`;
  linearProgressColor = GREEN;

  if (iconName === ICON_NAMES.ERROR_BIN || iconName === ICON_NAMES.FULL_BIN) {
    linearProgressColor = RED;
  } else if (iconName === ICON_NAMES.HALF_FULL_BIN) {
    linearProgressColor = ORANGE;
  }

  return { iconUrl, linearProgressColor };
};

export default getIconAndProgressColor;
