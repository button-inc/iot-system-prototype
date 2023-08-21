from enum import Enum

import requests

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
env = os.environ.get("ENVIRONMENT")

# Set base URLs based on the environment
if env == "prod":
    REAL_FAKE_SENSORS_BASE_URL = "http://real_fake_sensors:8081"
    SENSATIONAL_SENSORS_BASE_URL = "http://sensational_sensors:8082"
else:
    REAL_FAKE_SENSORS_BASE_URL = "http://localhost:8081"
    SENSATIONAL_SENSORS_BASE_URL = "http://localhost:8082"

app = FastAPI()

# whitelist
origins = [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://0.0.0.0:8081",
    "http://0.0.0.0:8082",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SensorType(Enum):
    LIQUID_BIN_LEVEL = "liquid bin level"
    SOLID_BIN_LEVEL = "solid bin level"


class BasicSensor(BaseModel):
    id: int
    sensor_type: SensorType
    fill_level: int | None
    sim: str
    lat: float
    long: float
    manufacturer: str
    bin_name: str
    address_line1: str
    address_line2: str
    group: str
    bin_type: str
    material_type: str
    asset_tag: str
    bin_volume: str


class RealFakeSensor(BaseModel):
    sensorsID: int
    sensorCompany: str
    sensorDeviceID: int
    firmwareVersion: str
    clientId: int
    simCardNumber: str
    connectivityProvider: str
    latest_sensors_data: dict | None
    latitude: float
    longitude: float
    asset_tag: str
    bin_volume: str


def rfs_to_bs(sensor: RealFakeSensor) -> BasicSensor:
    return BasicSensor(
        id=sensor["sensorsID"],
        sensor_type=SensorType.LIQUID_BIN_LEVEL,
        fill_level=sensor["latest_sensors_data"]["level"] if sensor["latest_sensors_data"] else None,
        sim=sensor["simCardNumber"],
        lat=sensor["latitude"],
        long=sensor["longitude"],
        manufacturer=sensor["sensorCompany"],
        bin_name=sensor["bin_name"],
        address_line1=sensor["address_line1"],
        address_line2=sensor["address_line2"],
        group=sensor["group"],
        bin_type=sensor["bin_type"],
        material_type=sensor["material_type"],
        asset_tag=sensor["asset_tag"],
        bin_volume=sensor["bin_volume"],
    )


def rfs_list_to_bs_list(sensors: list[RealFakeSensor]) -> list[BasicSensor]:
    return [rfs_to_bs(sensor) for sensor in sensors]


class SensationalSensor(BaseModel):
    id: int
    sensor_type: SensorType
    fill_level: int
    sim: str
    lat: float
    long: float
    man: str
    asset_tag: str
    bin_volume: str


def sensational_sensor_to_simple_sensor(sensor: SensationalSensor) -> BasicSensor:
    return BasicSensor(
        id=sensor["id"],
        sensor_type=SensorType.SOLID_BIN_LEVEL,
        fill_level=sensor["fill_level"] if sensor["fill_level"] else None,
        sim=sensor["sim"],
        lat=sensor["lat"],
        long=sensor["long"],
        manufacturer=sensor["man"],
        bin_name=sensor["bin_name"],
        address_line1=sensor["address_line1"],
        address_line2=sensor["address_line2"],
        group=sensor["group"],
        bin_type=sensor["bin_type"],
        material_type=sensor["material_type"],
        asset_tag=sensor["asset_tag"],
        bin_volume=sensor["bin_volume"],
    )


def sensational_sensor_list_to_simple_sensor_list(
    sensors: list[SensationalSensor],
) -> list[BasicSensor]:
    return [sensational_sensor_to_simple_sensor(sensor) for sensor in sensors]


@app.get("/sensors")
def get_sensors():
    real_fake_sensors = requests.get(REAL_FAKE_SENSORS_BASE_URL + "/sensors").json()
    rfs_as_simple_sensor_list = rfs_list_to_bs_list(real_fake_sensors["sensors"])

    sensational_sensors = requests.get(SENSATIONAL_SENSORS_BASE_URL + "/sensors").json()
    ss_as_simple_sensor_list = sensational_sensor_list_to_simple_sensor_list(
        sensational_sensors["sensors"]
    )

    all_sensors_list = rfs_as_simple_sensor_list + ss_as_simple_sensor_list
    return {"total": len(all_sensors_list), "sensors": all_sensors_list}


# @app.get("/sensors/{sensor_id}")
# def query_sensor_by_id(sensor_id: int) -> Sensor:
#     if sensor_id not in sensors:
#         raise HTTPException(
#             status_code=404, detail=f"Sensor iwth id {sensor_id} does not exist"
#         )
#     return sensors[sensor_id]


# Selection = dict[str, str | int | SensorType | None]


# @app.get("/sensors/")
# def query_sensor_by_parameters(
#     # sensor_type: SensorType | None = None,
#     min_fill_level: int | None = None,
#     # sim: str | None = None,
# ) -> dict[str, Selection]:
#     def check_sensor(sensor: Sensor) -> bool:
#         return all(
#             (
#                 # sensor_type is None or sensor.sensor_type == sensor_type,
#                 min_fill_level is None or sensor.fill_level >= min_fill_level,
#                 # sim is None or sensor.sim == sim,
#             )
#         )

#     selection = [sensor for sensor in sensors.values() if check_sensor(sensor)]
#     return {"selection": selection}
