export const decodePolyline = async (encoded) => {
  const polyUtil = await import('polyline-encoded');

  return polyUtil.decode(encoded);
};
