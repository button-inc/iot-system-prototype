import type { NextPage } from "next";
import dynamic from "next/dynamic";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import DefaultLayout from "../components/Layout";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Backdrop from "@mui/material/Backdrop";

export interface Sensor {
  id: string;
  fill_level: number | null;
  lat: number;
  long: number;

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
}

const API_URL = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";

const Home: NextPage = () => {
  const Map = useMemo(
    () =>
      dynamic(() => import("../components/map"), {
        ssr: false,
      }),
    []
  );

  const [sensors, setSensors] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [thresholdRange, setThresholdRange] = useState<number[]>([0, 100]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedAssetTag, setSelectedAssetTag] = useState<string>("");
  const [selectedBinType, setSelectedBinType] = useState<string>("");
  const [selectedBinVolume, setSelectedBinVolume] = useState<string>("");

  const sidebarWidth = "220px";

  const getSensors = useCallback(async () => {
    const res = await fetch(`${API_URL}/latest_readings`);
    const responseJson = await res.json();
    let sensorsArray = [];
    for (const sensorId in responseJson.brighterBins) {
      sensorsArray.push(responseJson.brighterBins[sensorId]);
    }
    setSensors(sensorsArray);
  }, []);

  useEffect(() => {
    getSensors().catch(console.error);
  }, [getSensors]);

  const handleThresholdChange = (event: Event, newValue: number | number[]) => {
    setThresholdRange(newValue as number[]);
  };

  const handleGroupChange = (event: SelectChangeEvent<string>) => {
    setSelectedGroup(event.target.value);
  };

  const handleAssetTagChange = (event: SelectChangeEvent<string>) => {
    setSelectedAssetTag(event.target.value);
  };

  const handleBinTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedBinType(event.target.value);
  };

  const handleBinVolumeChange = (event: SelectChangeEvent<string>) => {
    setSelectedBinVolume(event.target.value);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <DefaultLayout>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        variant="persistent"
        className={`drawer ${drawerOpen ? "open" : ""}`}
        PaperProps={{ style: { width: sidebarWidth, zIndex: 20000 } }}
      >
        <div className="drawer-content">
          <Typography variant="h6">Settings</Typography>
          <div className="close-button">
            <Button
              variant="contained"
              color="primary"
              onClick={toggleDrawer(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Drawer>
      <div className="content-wrapper">
        <div className="sidebar">
          <IconButton
            className="menu-button"
            color="primary"
            aria-label="open drawer"
            edge="end"
            onClick={toggleDrawer(!drawerOpen)}
          >
            <MenuIcon />
            <Typography variant="subtitle1">Settings</Typography>
          </IconButton>
          <div className="sidebar-content">
            <Typography variant="h6">Filters</Typography>
            <Typography id="slider-label">Fill Level Threshold</Typography>
            <Slider
              value={thresholdRange}
              onChange={handleThresholdChange}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              valueLabelFormat={(value) => `${value}%`}
              marks={[
                { value: 0, label: "0%" },
                { value: 50, label: "50%" },
                { value: 100, label: "100%" },
              ]}
              step={1}
            />
            <div className="form-control with-margin">
              <FormControl fullWidth>
                <InputLabel id="group-label">Group</InputLabel>
                <Select
                  labelId="group-label"
                  id="group-select"
                  value={selectedGroup}
                  onChange={handleGroupChange}
                >
                  <MenuItem value=""> - </MenuItem>
                  <MenuItem value="Alton North">Alton North</MenuItem>
                  <MenuItem value="Halton West">Halton West</MenuItem>
                  <MenuItem value="Bolton South">Bolton South</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="form-control with-margin">
              <FormControl fullWidth>
                <InputLabel id="asset-tag-label">Asset Tag</InputLabel>
                <Select
                  labelId="asset-tag-label"
                  id="asset-tag-select"
                  value={selectedAssetTag}
                  onChange={handleAssetTagChange}
                >
                  <MenuItem value=""> - </MenuItem>
                  <MenuItem value="up">Up</MenuItem>
                  <MenuItem value="down">Down</MenuItem>
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                  <MenuItem value="strange">Strange</MenuItem>
                  <MenuItem value="charm">Charm</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="form-control with-margin">
              <FormControl fullWidth>
                <InputLabel id="bin-type-label">Bin Type</InputLabel>
                <Select
                  labelId="bin-type-label"
                  id="bin-type-select"
                  value={selectedBinType}
                  onChange={handleBinTypeChange}
                >
                  <MenuItem value=""> - </MenuItem>
                  <MenuItem value="EMW Cathedral Container 10yd">
                    EMW Cathedral Container 10yd
                  </MenuItem>
                  <MenuItem value="EMW Cathedral Container 20yd">
                    EMW Cathedral Container 20yd
                  </MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="form-control with-margin">
              <FormControl fullWidth>
                <InputLabel id="bin-volume-label">Bin Volume</InputLabel>
                <Select
                  labelId="bin-volume-label"
                  id="bin-volume-select"
                  value={selectedBinVolume}
                  onChange={handleBinVolumeChange}
                >
                  <MenuItem value=""> - </MenuItem>
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
        <Map
          sensors={sensors}
          alertThreshold={50}
          filterThresholdMinimum={thresholdRange[0]}
          filterThresholdMaximum={thresholdRange[1]}
          selectedGroup={selectedGroup}
          selectedAssetTag={selectedAssetTag}
          selectedBinType={selectedBinType}
          selectedBinVolume={selectedBinVolume}
        />
        <Backdrop
          open={drawerOpen}
          onClick={toggleDrawer(false)}
          style={{ zIndex: 10000 }}
        />
        <style jsx>
          {`
            .sidebar {
              min-width: ${sidebarWidth};
              max-width: ${sidebarWidth};
              margin-right: 0;
              position: relative;
            }

            .content-wrapper {
              display: flex;
              height: 100vh;
              overflow: hidden;
              position: relative;
            }

            .menu-button {
              position: relative;
              top: 0px;
              left: 0px;
              z-index: 2;
            }

            .drawer {
              width: 300px;
              flex-shrink: 0;
            }

            .drawer.open {
              width: 300px;
            }

            .drawer-content {
              padding: 20px;
              z-index: 20000;
            }
            .sidebar-content {
              padding: 20px;
              z-index: 1;
            }

            .with-margin {
              margin-top: 16px;
            }

            .close-button {
              margin-top: 16px;
            }
          `}
        </style>
      </div>
    </DefaultLayout>
  );
};

export default Home;
