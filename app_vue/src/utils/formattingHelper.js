export const getMinutesString = (stringSeconds) => {
  let duration = stringSeconds.replace('s','');
  console.log('duration', duration);

  const hours = Math.floor(duration / 3600);
  duration = duration % 3600;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const hoursString = hours ? `${hours} hrs ` : '';
  const minutesString = minutes ? `${minutes} min ` : '';
  const secondsString = seconds ? `${seconds} sec` : '';
  return hoursString + minutesString + secondsString;
};

export const getKmFromMeterString = (meters) => {
  return (meters / 1000).toFixed(0);
};