import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { CRS } from "leaflet";
import SensorMarker from "./SensorMarker";
import { Sensor } from "../pages/index";

interface Props {
  sensors: Sensor[];
  alertThreshold?: number;
  filterThresholdMaximum?: number;
  filterThresholdMinimum?: number;
  selectedGroup?: string;
  selectedAssetTag?: string;
  selectedBinType?: string;
  selectedBinVolume?: string;
}

const regions = {
  "Metro Vancouver": {
    center: [49.1527, -123.0207],
    zoom: 11,
  },
  "Greater Toronto Area": {
    center: [43.70, -79.42],  // GTA approximate coordinates
    zoom: 10,
  },
  // Add more regions as needed in the future
};

const Map: React.FC<Props> = ({ sensors, filterThresholdMaximum, filterThresholdMinimum, alertThreshold, selectedGroup, selectedAssetTag, selectedBinType, selectedBinVolume }) => {
  const [currentRegion, setCurrentRegion] = React.useState("Metro Vancouver");
  
  const points = sensors.map((sensor) => {
    return (
      <SensorMarker
        key={sensor.id}
        sensorToMark={sensor}
        alertThreshold={alertThreshold}
        filterThresholdMaximum={filterThresholdMaximum}
        filterThresholdMinimum={filterThresholdMinimum}
        selectedGroup={selectedGroup}
        selectedAssetTag={selectedAssetTag}
        selectedBinType={selectedBinType}
        selectedBinVolume={selectedBinVolume}
      />
    );
  });

  /* const UpdateView: React.FC = () => {
    const map = useMap();
    useEffect(() => {
      map.setView(regions[currentRegion].center, regions[currentRegion].zoom);
    }, [currentRegion, map]);

    return null;
  }; */

  return (
    <>
      {/* <select 
        value={currentRegion} 
        onChange={(e) => setCurrentRegion(e.target.value)}
      >
        {Object.keys(regions).map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select> */}

      <MapContainer
        center={[43.70, -79.42]}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        crs={CRS.EPSG3857}
      >
        {/* <UpdateView /> */}
        {points}
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </>
  );
};

export default Map;
