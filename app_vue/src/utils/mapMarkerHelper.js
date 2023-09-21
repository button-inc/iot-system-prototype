const getBinIconName = (sensor) => {
  const isErrorState = sensor.error;
  const isFullState = sensor.fill_level && sensor.fill_level >= 75;
  const isHalfFullState = sensor.fill_level && sensor.fill_level >= 50 && sensor.fill_level < 75;
  const isEmptyState = sensor.fill_level && sensor.fill_level < 50;

  if (isErrorState) { // shows error icon
    return 'error';
  } else if (isFullState) {
    return 'full';
  } else if (isHalfFullState) {
    return 'half-full';
  } else if (isEmptyState) {
    return 'empty';
  }
  return 'empty'; // default
}

export const getMaterialTypeIconURL = (materialType) => {
  const directory = 'src/assets/images/materialTypeIcons';
  const genericMaterialIconPath = `${directory}/generic-material.svg`;
  if (!materialType) {
    return genericMaterialIconPath;
  }
  const materialMap = {
    'Cardboard': `${directory}/cardboard.svg`,
    'Plastic': `${directory}/plastic.svg`,
    'Compost': `${directory}/compost.svg`,
    'Garbage': `${directory}/garbage.svg`,
    'Mixed Recyclables': `${directory}/mixed_recyclables.svg`,
    'Paper': `${directory}/paper.svg`,
    'Mixed Containers': `${directory}/mixed_containers.svg`,
    'Glass, Metal, Plastic': `${directory}/glass_metal_plastic.svg`,
    'Soft Plastic': `${directory}/soft_plastic.svg`,
    'WTE': `${directory}/wte.svg`,
    'Shredding': `${directory}/shredding.svg`,
    'Scrap Metal': `${directory}/scrap_metal.svg`,
    'Wood': `${directory}/wood.svg`,
    'Construction Waste': `${directory}/construction_waste.svg`,
  };
  return materialMap[materialType] || genericMaterialIconPath;
}

// linearProgressColor -> used by Vuetify to determine progress bar color
// iconURL -> used by Vuetify to display bin icon
export const getIconAndProgressColor = (sensor) => {
  // mini-helper function
  const iconName = getBinIconName(sensor);
  let iconUrl = ''
  let linearProgressColor = '';
  const RED = '#C92828';
  const GREEN = 'green';
  const ORANGE = '#F07F2D';
  const iconDirectory = 'src/assets/images/binMarkerIcons';
  switch (iconName) {
    case 'error':
      iconUrl = `${iconDirectory}/alert-bin.png`;
      linearProgressColor = RED;
      break;
    case 'full':
      iconUrl = `${iconDirectory}/full-bin.png`;
      linearProgressColor = RED;
      break;
    case 'half-full':
      iconUrl = `${iconDirectory}/half-full-bin.png`;
      linearProgressColor = ORANGE;
      break;
    case 'empty':
      iconUrl = `${iconDirectory}/empty-bin.png`;
      linearProgressColor = GREEN;
      break;
    default: // default is empty bin
      iconUrl = `${iconDirectory}/empty-bin.png`;
      linearProgressColor = GREEN;
  }
  return { iconUrl, linearProgressColor };
}

export default getIconAndProgressColor
