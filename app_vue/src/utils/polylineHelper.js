import polyUtil from 'polyline-encoded';

export const decodePolyline = () => {
  const latlngs = [
    [38.5, -120.5],
    [40.7, -120.95],
    [43.252, -126.453]
  ];

  console.log(polyUtil.encode(latlngs));
  const encoded = '_p~iF~cn~U_ulLn{vA_mqNvxq`@';
  console.log(polyUtil.decode(encoded));
};
