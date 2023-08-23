import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Sensor } from "../pages/index";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Image from 'next/image';
import ErrorIcon from '@mui/icons-material/Error';

interface Props {
  sensorToMark: Sensor;
  alertThreshold?: number;
  filterThresholdMaximum?: number;
  filterThresholdMinimum?: number;
  selectedGroup?: string;
  selectedAssetTag?: string;
  selectedBinType?: string;
  selectedBinVolume?: string;
}

export function getIconName(
  fill_level: number | null,
  filterThresholdMinimum: number | undefined,
  filterThresholdMaximum: number | undefined,
  alertThreshold: number | undefined,
  selectedGroup: string | undefined,
  selectedAssetTag: string | undefined,
  selectedBinType: string | undefined,
  selectedBinVolume: string | undefined,
  group: string | undefined,
  asset_tag: string | undefined,
  bin_type: string | undefined,
  bin_volume: string | undefined,
  ){
  const name =
    fill_level === null || 
    filterThresholdMinimum === undefined || 
    filterThresholdMaximum === undefined || 
    alertThreshold === undefined ||
    selectedGroup === undefined ||
    selectedAssetTag === undefined ||
    selectedBinType === undefined ||
    selectedBinVolume === undefined
        ? "error"
        : fill_level < filterThresholdMinimum || 
        fill_level > filterThresholdMaximum ||
        (selectedGroup !== "" && selectedGroup !== group) ||
        (selectedAssetTag !== "" && selectedAssetTag !== asset_tag) ||
        (selectedBinType !== "" && selectedBinType !== bin_type) ||
        (selectedBinVolume !== "" && selectedBinVolume !== bin_volume)
        ? "default"
        : alertThreshold && fill_level > alertThreshold || alertThreshold === 0
        ? "full"
        : "healthy";
  return name
} ;

const SensorMarker: React.FC<Props> = ({
  sensorToMark,
  alertThreshold,
  filterThresholdMaximum,
  filterThresholdMinimum,
  selectedGroup,
  selectedAssetTag, 
  selectedBinType, 
  selectedBinVolume
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
    material_type ,
    asset_tag,
    bin_volume
  } = sensorToMark;
  
  const iconName = getIconName(fill_level,
    filterThresholdMinimum,
    filterThresholdMaximum,
    alertThreshold,
    selectedGroup,
    selectedAssetTag,
    selectedBinType,
    selectedBinVolume,
    group,
    asset_tag,
    bin_type,
    bin_volume);
  
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
  const markerIcon = new L.Icon({
    iconUrl: iconUrl,
    iconSize: [25, 25],
  });


  const fill_pct =  (alertThreshold === undefined || fill_level === null)? null : Math.round(fill_level);
  
  
  return (
    <Marker key={id} position={[lat, long]} icon={markerIcon}>
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
                  <Typography variant="subtitle1"><span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', }}>Asset Tag: </span> {asset_tag} </Typography>
                  <Typography variant="subtitle1"><span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', }}>Bin Type: </span> {bin_type} </Typography>
                  <Typography variant="subtitle1"><span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', }}>Bin Volume Litres: </span> {bin_volume} </Typography>
                  
                 
                 
              </div>
          </div>
      </Popup>
    </Marker>
  );
};

export default SensorMarker;
