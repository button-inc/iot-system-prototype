import React from "react";
import { useState } from "react";

interface Props {
  sensors: any[];
}

const Sidebar: React.FC<Props> = ({ sensors }) => {
  return (
    <div className="sidebar">
      <div className="top-bar">
        <p>Sensors</p>
      </div>
      <div>
        {sensors.map((sensor) => {
          return <div key={sensor.id}>{sensor.id}</div>;
        })}
      </div>
      <style jsx>
        {`
          .sidebar {
            min-width: 475px;
            max-width: 475px;
            margin-right: 10px;
          }
          .top-bar {
            display: flex;
            justify-content: space-around;
            margin-bottom: 10px;
          }
        `}
      </style>
    </div>
  );
};

export default Sidebar;
