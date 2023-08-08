import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { CRS } from "leaflet";
import SensorMarker from "./SensorMarker";
import { Sensor } from "../pages/index";

interface Props {
  sensors: Sensor[];
  fillLevelThreshold?: number;
}

const Map: React.FC<Props> = ({ sensors, fillLevelThreshold }) => {
  const points = sensors.map((sensor) => {
    return (
      <SensorMarker
        key={sensor.id}
        sensorToMark={sensor}
        fillLevelThreshold={fillLevelThreshold}
      />
    );
  });
  const sensor = sensors[0];
  return (
    <MapContainer
      center={[49.1527, -123.0207]}
      zoom={11}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      crs={CRS.EPSG3857}
    >
      {points}
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
};

export default Map;
