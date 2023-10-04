import axios from 'axios';

// uses openstreetmap geocoding (opensource)
// https://nominatim.openstreetmap.org/ui/search.html
export const getLatLng = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${address}`;
  try {
    const response = await axios.get(url);
    if (response && response.data && response.data[0]) {
      return [response.data[0].lat, response.data[0].lon];
    }
    return [];
  } catch (e) {
    console.error('error generating lat lng', e);
    return [];
  }
};

export default getLatLng;
