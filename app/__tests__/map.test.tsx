import React from "react";
import { render } from "@testing-library/react";
import Map from "../components/map";

jest.mock('react-leaflet')
jest.mock('leaflet')

describe("Map Integration Tests", () => {

  /*interface Sensor {
    id: number;
    fill_level: number;
    lat: number;
    long: number;
    bin_vol: number;
  
    sensor_type: string;
    material_type: string;
    bin_type: string;
    sim: string;
    bin_name: string;
    bin_volume: string;
    group: string;
    address_line1: string;
    address_line2: string;
    asset_tag: string;
  
  }*/

  const mockSensors = [
    {
      "id": 2453473454,
      "sensor_type": "liquid bin level",
      "fill_level": null,
      "sim": "12344423",
      "lat": 43.84488,
      "long": -80.057859,
      "manufacturer": "Real Fake Sensors",
      "bin_name": "Big Purple Bin",
      "address_line1": "55 John St",
      "address_line2": "Alton, ON L7K 0C4",
      "group": "Alton East",
      "bin_type": "EMW Cathedral Container 10yd",
      "material_type": "Cardboard",
      "asset_tag": "up",
      "bin_volume": "small"
    },
  ]

  it("renders the map with correct number of points", () => {
    const { container } = render(
      <Map 
      sensors={mockSensors}
      alertThreshold={50}
      filterThresholdMinimum ={0}
      filterThresholdMaximum={100}
      selectedGroup={"Bolton South"}
      selectedAssetTag={"bottom"}
      selectedBinType={"EMW Cathedral Container 10yd"}
      selectedBinVolume={"small"}
      />
    );

    const markerElements = container.querySelectorAll(".leaflet-marker-icon");
    expect(markerElements.length).toBe(mockSensors.length);
  });

});
