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
    'Cardboard': `${directory}/cardboard.svg`, //confirmed
    'Plastic': `${directory}/plastic.svg`, // confirmed
    'Compost': `${directory}/compost.svg`, // confirmed
    'Diesel': `${directory}/oil-drum.svg`,
    'Dyed Diesel': `${directory}/oil-drum.svg`,
    'Kerosene': `${directory}/oil-drum.svg`,
    'Water': `${directory}/plastic.svg`, // TODO: confirm water icon
    'Gas Oil': `${directory}/oil-drum.svg`,
    'Mixed waste': `${directory}/trash.svg`
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
