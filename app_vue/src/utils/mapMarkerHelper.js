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
  if (!materialType) {
    return '@/assets/images/open-box.png';
  }
  const materialMap = {
    'Cardboard': 'src/assets/images/cardboard.svg', //confirmed
    'Plastic': 'src/assets/images/plastic.svg', // confirmed
    'Compost': 'src/assets/images/compost.svg', // confirmed
    'Diesel': 'src/assets/images/oil-drum.svg',
    'Dyed Diesel': 'src/assets/images/oil-drum.svg',
    'Kerosene': 'src/assets/images/oil-drum.svg',
    'Water': 'src/assets/images/plastic.svg', // TODO: confirm water icon
    'Gas Oil': 'src/assets/images/oil-drum.svg',
    'Mixed waste': 'src/assets/images/trash.svg'
  };
  return materialMap[materialType];
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
  switch (iconName) {
    case 'error':
      iconUrl = 'src/assets/images/alert-bin.png';
      linearProgressColor = RED;
      break;
    case 'full':
      iconUrl = 'src/assets/images/full-bin.png';
      linearProgressColor = RED;
      break;
    case 'half-full':
      iconUrl = 'src/assets/images/half-full-bin.png';
      linearProgressColor = ORANGE;
      break;
    case 'empty':
      iconUrl = 'src/assets/images/empty-bin.png';
      linearProgressColor = GREEN;
      break;
    default: // default is empty bin
      iconUrl = 'src/assets/images/empty-bin.png';
      linearProgressColor = GREEN;
  }
  return { iconUrl, linearProgressColor };
}

export default getIconAndProgressColor