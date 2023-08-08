import React from "react";
import { Marker, Popup } from "react-leaflet";
import L, { icon } from "leaflet";
import { Sensor } from "../pages/index";
interface Props {
  sensorToMark: Sensor;
  fillLevelThreshold?: number;
}

const SensorMarker: React.FC<Props> = ({
  sensorToMark,
  fillLevelThreshold,
}) => {
  const { id, lat, long, fill_level } = sensorToMark;
  const iconName =
    fill_level === null
      ? "error"
      : fillLevelThreshold && fill_level > fillLevelThreshold
      ? "full"
      : "healthy";

  let iconUrl;
  switch (iconName) {
    case "error":
      iconUrl = "https://cdn-icons-png.flaticon.com/128/1304/1304037.png";
      break;
    case "full":
      iconUrl = "https://cdn-icons-png.flaticon.com/128/5028/5028066.png";
      break;
    case "healthy":
      iconUrl = "https://cdn-icons-png.flaticon.com/128/542/542775.png";
      break;
    default:
      iconUrl = "https://cdn-icons-png.flaticon.com/128/484/484662.png";
  }
  const maekerIcon = new L.Icon({
    iconUrl: iconUrl,
    iconSize: [25, 25],
  });

  return (
    <Marker key={id} position={[lat, long]} icon={maekerIcon}>
      <Popup>Fill Level: {fill_level ?? "Error"}</Popup>
    </Marker>
  );
};

export default SensorMarker;
