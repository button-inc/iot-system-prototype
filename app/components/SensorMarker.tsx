import React from "react";
import { Marker, Popup } from "react-leaflet";
import L, { icon } from "leaflet";
import { Sensor } from "../pages/index";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
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
      <Popup>
          <div style={{ padding: '5px', display: 'flex', width: '300px' }}>
              <div style={{ flex: 2 }}> {/* Left column (labels) */}
                  <Box style={{ margin: 'auto', width: '40px' }}>
                    <Box 
                    style={{
                        background: 'lightgrey', 
                        marginTop: '5px',
                        height: '100%', 
                        borderRadius: '10px 10px 0px 0px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                    }}
                    >
                    <Typography variant="body1" style={{ marginBottom: '10px' }}>{fill_level ?? "Error"}%</Typography>
                    <div 
            style={{ 
                background: 'lightgrey', 
                width: '40px', 
                height: '35px',
                display: 'flex',
                alignItems: 'center'
            }}
        >
            <LinearProgress 
                variant="determinate" 
                value={50} 
                style={{ transform: 'rotate(270deg)', width: '100%', height:'100%' }}
            />
        </div>
                </Box>

                      
                      <Typography variant="body1">Fill level</Typography>
                      
                  </Box>
                  {/* <Typography variant="h6" style={{ marginBottom: '10px' }}>Asset ID</Typography>
                  <Typography variant="body1" style={{ marginBottom: '15px' }}>Fill Level:</Typography>
                  <Typography variant="body2" style={{ marginBottom: '15px' }}>Last Updated:</Typography>
                  <Typography variant="body2" style={{ marginBottom: '15px' }}>Location:</Typography>
                  <Typography variant="body2" style={{ marginBottom: '15px' }}>Temperature:</Typography>
                  <Typography variant="body2">Battery Level:</Typography> */}
              </div>
              <div style={{ flex: 3, paddingLeft: '10px' }}> {/* Right column (data values) */}
                  <Typography variant="h6" style={{ marginBottom: '10px' }}>{id}</Typography>
                  <div style={{ marginBottom: '10px' }}>
                      <Typography variant="body1">{fill_level ?? "Error"}%</Typography>
                      <LinearProgress variant="determinate" value={fill_level} style={{ marginTop: '5px' }}/>
                  </div>
                  <Typography variant="body2" style={{ marginBottom: '15px' }}>{sensorToMark.last_updated}</Typography>
                  <Typography variant="body2" style={{ marginBottom: '15px' }}>{sensorToMark.location}</Typography>
                  <Typography variant="body2" style={{ marginBottom: '15px' }}>{sensorToMark.temperature}°C</Typography>
                  <div>
                      <Typography variant="body2">{sensorToMark.battery_level}%</Typography>
                      <LinearProgress variant="determinate" value={sensorToMark.battery_level} style={{ marginTop: '5px' }}/>
                  </div>
              </div>
          </div>
      </Popup>
    </Marker>
  );
};

export default SensorMarker;
