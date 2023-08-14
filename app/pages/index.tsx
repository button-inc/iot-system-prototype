import type { NextPage } from "next";
import dynamic from "next/dynamic";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import DefaultLayout from "../components/Layout";
import Sidebar from "../components/Sidebar";

export interface Sensor {
  id: number;
  fill_level: number;
  lat: number;
  long: number;
  bin_vol: number;

  sensor_type: string;
  material_type: string;
  bin_type: string;
  group: string;
  sim: string;
  site_address: string;
   
  
}

const Home: NextPage = () => {
  const Map = useMemo(
    () =>
      dynamic(() => import("../components/map"), {
        ssr: false,
      }),
    []
  );

  const [sensors, setSensors] = useState<any[]>([]);

  const getSensors = useCallback(async () => {
    const res = await fetch(`http://localhost:8080/sensors`);
    const responseJson = await res.json();
    setSensors(responseJson.sensors);
  }, []);

  useEffect(() => {
    getSensors().catch(console.error);
  }, [getSensors]);

  return (
    <DefaultLayout>
      <div className="content-wrapper">
        <Sidebar sensors={sensors} />
        <div id="map" style={{ height: "75vh", width: "100%" }}>
          <Map sensors={sensors} fillLevelThreshold={79} />
        </div>
        <style jsx>
          {`
            .content-wrapper {
              display: flex;
              flex-direction: row;
            }
          `}
        </style>
      </div>
    </DefaultLayout>
  );
};

export default Home;
