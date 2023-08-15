import React from "react";
import { Marker, Popup } from "react-leaflet";
import L, { icon } from "leaflet";
import { Sensor } from "../pages/index";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Image from 'next/image';
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

  const fill_level1 = 50;
  const bin_vol1 = 100;
  const fill_pct =  Math.round(fill_level1 / bin_vol1 * 100);

  return (
    <Marker key={id} position={[lat, long]} icon={maekerIcon}>
      <Popup>
          <div style={{ padding: '5px', display: 'flex', width: '300px' }}>
              <div style={{ flex: 2 }}> {/* Left column (labels) */}

                <Box 
                  style={{
                      margin: 'auto', width: '40px',
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                  }}
                  >
                  <Typography 
                    variant="body1" 
                    style={{ marginBottom: '38px', marginTop: '5px', }}
                  >
                    {`${fill_pct}%` ?? "Error"}
                  </Typography>
                  
                  <LinearProgress 
                      variant="determinate" 
                      value={fill_pct} 
                      style={{ 
                        transform: 'rotate(270deg)', 
                        width: '100px', 
                        height:'20px', 
                        borderRadius: '0px 5px 5px 0px',  }}
                  />
                  <Typography 
                    variant="body1" 
                    style={{ whiteSpace: 'nowrap',marginTop: '38px'}}  
                  >
                      Fill level
                  </Typography>
        
                </Box>


                {/* refactor needed */}

                <Box 
                  style={{
                      margin: 'auto', width: '40px',
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginTop: '3px',
                  }}
                  >
                  <Image src="/assets/open-box.png" alt="Open Box" width={100} height={100} />
                  <Typography 
                    variant="body1" 
                    style={{ whiteSpace: 'nowrap', marginTop: '0px'}}  
                    >
                      Cardboard
                  </Typography>

                </Box>

                

                      
                      
                      
             
                  
              </div>
              <div style={{ flex: 3, paddingLeft: '10px' }}> {/* Right column (data values) */}
                  <Typography variant="h6" style={{ marginBottom: '10px' }}>{id}</Typography>
                  <div style={{ marginBottom: '10px' }}>
                      <Typography variant="body1">{fill_level ?? "Error"}%</Typography>
                      <LinearProgress variant="determinate" value={fill_level} style={{ marginTop: '5px' }}/>
                  </div>
                  <Typography variant="body2" style={{ marginBottom: '15px' }}>{"sensorToMark.last_updated"}</Typography>
                  <Typography variant="body2" style={{ marginBottom: '15px' }}>{"sensorToMark.location"}</Typography>
                  <Typography variant="body2" style={{ marginBottom: '15px' }}>{"sensorToMark.temperature"}°C</Typography>
                  <div>
                      <Typography variant="body2">{"sensorToMark.battery_level"}%</Typography>
                      <LinearProgress variant="determinate" value={0} style={{ marginTop: '5px' }}/>
                  </div>
              </div>
          </div>
      </Popup>
    </Marker>
  );
};

export default SensorMarker;
