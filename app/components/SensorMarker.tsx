import React from "react";
import { Marker, Popup } from "react-leaflet";
import L, { icon } from "leaflet";
import { Sensor } from "../pages/index";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Image from 'next/image';
import ErrorIcon from '@mui/icons-material/Error';

interface Props {
  sensorToMark: Sensor;
  fillLevelThreshold?: number;
}

const SensorMarker: React.FC<Props> = ({
  sensorToMark,
  fillLevelThreshold,
}) => {
  const { 
    id, 
    lat, 
    long, 
    fill_level, 
    address_line1, 
    address_line2, 
    group, 
    bin_name, 
    bin_type, 
    material_type 
  } = sensorToMark;
  
  const iconName =
    fill_level === null
      ? "error"
      : fillLevelThreshold && fill_level > fillLevelThreshold
      ? "full"
      : "healthy";

  let iconUrl;
  let linearProgressColor : "error" | "inherit" | "success" | "primary" | "secondary" | "info" | "warning";
  switch (iconName) {
    case "error":
      iconUrl = "https://cdn-icons-png.flaticon.com/128/1304/1304037.png";
      linearProgressColor = "error";
      break;
    case "full":
      iconUrl = "https://cdn-icons-png.flaticon.com/128/5028/5028066.png";
      linearProgressColor = "error";
      break;
    case "healthy":
      iconUrl = "https://cdn-icons-png.flaticon.com/128/542/542775.png";
      linearProgressColor = "success";
      break;
    default:
      iconUrl = "https://cdn-icons-png.flaticon.com/128/484/484662.png";
      linearProgressColor = "primary";
  }
  const maekerIcon = new L.Icon({
    iconUrl: iconUrl,
    iconSize: [25, 25],
  });


  const fill_pct =  (fillLevelThreshold === undefined || fill_level === null)? null : Math.round(fill_level / fillLevelThreshold * 100);
  
  
  return (
    <Marker key={id} position={[lat, long]} icon={maekerIcon}>
      <Popup>
          <div style={{ padding: '5px', display: 'flex', width: '300px' }}>
              <div style={{ flex: 2 }}> {/* Left column*/}

              {(fill_pct === null) && 
                <Box 
                  style={{
                      margin: 'auto', 
                      width: '40px',
                      height: '65%',
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                  }}
                  >
                    <ErrorIcon style={{width:'45px', height:'45px', color:'red', marginTop:'-30px'}}/>
                    <Typography 
                      variant="subtitle2" 
                      style={{ marginTop: '2px', whiteSpace: 'nowrap', marginRight: '5px', }}
                    >
                      level not captured
                    </Typography>
                  </Box> 
                }

              {fill_pct && 
                <Box 
                  style={{
                      margin: 'auto', 
                      width: '40px',
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
                      {`${fill_pct}%`}
                    </Typography>
                  
                  <LinearProgress 
                      variant="determinate" 
                      value={fill_pct}
                      color={linearProgressColor}
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
        
                </Box>}


                {/* TODO: refactor potentially needed */}

                <Box 
                  style={{
                      margin: 'auto', 
                      width: '40px',
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
                      {material_type}
                  </Typography>

                </Box>        
                  
              </div>


              <div style={{ flex: 3, paddingLeft: '10px' }}> {/* Right column*/}
                  <Typography variant="h6" style={{ fontWeight: 'bold' }}>{bin_name}</Typography>
                  <Typography variant="subtitle2">{`ID ${id}`}</Typography>
  
                  <Typography variant="body2">{address_line1}<br />{address_line2}<br />({lat}, {long})</Typography>
                  <Typography variant="subtitle1" style={{marginBottom: '3px'}}><span style={{ fontWeight: 'bold' }}>Group: </span> {group}</Typography>
                  <Typography variant="subtitle1"><span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', }}>Bin Type: </span> {bin_type} </Typography>
                 
                 
              </div>
          </div>
      </Popup>
    </Marker>
  );
};

export default SensorMarker;
