export const getMinutesString = (stringSeconds) => {
  let duration = stringSeconds.replace('s','');

  const hours = Math.floor(duration / 3600);
  duration = duration % 3600;
  const minutes = Math.floor(duration / 60);

  const hoursString = hours ? `${hours} hrs ` : '';
  const minutesString = minutes ? `${minutes} min ` : '';
  return hoursString + minutesString;
};

export const getKmFromMeterString = (meters) => {
  return (meters / 1000).toFixed(0);
};