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

export const getDate12HrTime = (dateTimeStr) => {
  // param: 2023-09-25T08:45:00
  // return: Sep 25 2023 8:45 AM
  return new Date(dateTimeStr).toLocaleTimeString('en-us', 
    { 
      year: "numeric", 
      month: "short", 
      day: "numeric", 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit', 
      timezone: "UTC"
    })
    .replaceAll(',', '');
};
