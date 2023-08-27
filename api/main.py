from enum import Enum
import time
import requests

import gspread
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

load_dotenv()
env = os.environ.get("ENVIRONMENT")
brighterbins_api_token = os.environ.get("BRIGHTERBINS_TOKEN")
sa = gspread.service_account(filename="google_sheets_sa_key.json")

# Set base URLs based on the environment
if env == "prod":
    REAL_FAKE_SENSORS_BASE_URL = "http://real-fake-sensors:8081"
    SENSATIONAL_SENSORS_BASE_URL = "http://sensational-sensors:8082"
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
    id: str
    sensor_type: SensorType
    fill_level: int | None
    lat: float
    long: float
    manufacturer: str
    bin_name: str | None
    address_line1: str
    address_line2: str | None
    group: str | None
    bin_type: str
    material_type: str
    asset_tag: str
    bin_volume: str


class RealFakeSensor(BaseModel):
    sensorsID: str
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
        fill_level=sensor["latest_sensors_data"]["level"]
        if sensor["latest_sensors_data"]
        else None,
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
    id: str
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


# Brighter Bins
class BrighterBinsSensorRaw(BaseModel):
    epoch_ms: int
    rawDistance: int
    temperature: int
    batteryLevel: int
    pickUpEvent: bool
    fillLevel: int
    fillError: bool
    snr: int
    rssi: int
    is_extended_uplink: int


class BrighterBinsSensor(BaseModel):
    epoch_ms: int
    rawDistance: int
    temperature: int
    batteryLevel: int
    pickUpEvent: bool
    fillLevel: int
    fillError: bool
    snr: int
    rssi: int
    is_extended_uplink: int
    manufacturer: str
    address: str
    lat: float
    long: float


def brighterbins_sensor_to_simple_sensor(sensor: BrighterBinsSensor) -> BasicSensor:
    return BasicSensor(
        id=sensor["id"],
        sensor_type=SensorType.SOLID_BIN_LEVEL,
        fill_level=sensor["fillLevel"] if "fillLevel" in sensor else None,
        lat=sensor["lat"],
        long=sensor["long"],
        manufacturer="BrighterBins",
        bin_name=sensor["bin_name"],
        address_line1=sensor["address"],
        address_line2=None,
        group=None,
        bin_type="Standard park bin",
        material_type="Mixed waste",
        bin_volume=sensor["bin_volume"],
        asset_tag=sensor["asset_tag"],
    )


def bb_list_to_simple_sensor_list(
    sensors: list[BrighterBinsSensor],
) -> list[BasicSensor]:
    return [brighterbins_sensor_to_simple_sensor(sensor) for sensor in sensors]


@app.get("/brighter")
def get_brighterbin_sensors():
    url = "https://api.brighterbins.com/bins/timeseries"
    # get the readings from the past 24 hors
    readingsEndTime = round(time.time() * 1000)
    readingsStartTime = readingsEndTime - 86400000

    # get all of the records from the BB mock data sheet
    sheet = sa.open("BrighterBins_mock_data")
    worksheet = sheet.worksheet("bins_data")
    records = worksheet.get_all_records()

    bins = []

    for index, record in enumerate(records):
        id = record["id"]
        response = requests.request(
            "POST",
            url,
            headers={"Authorization": "Bearer " + brighterbins_api_token},
            data={
                "from": readingsStartTime,
                "to": readingsEndTime,
                "id": id,
            },
        ).json()
        reading = (
            {}
            if len(response["data"]["series"]) == 0
            else response["data"]["series"][0]
        )
        sensor = reading
        sensor.update(
            {
                "id": id,
                "row_id": index + 2,
                "bin_name": record["name"],
                "address": record["address"],
                "lat": record["lat"],
                "long": record["long"],
                "bin_volume": record["bin_volume"],
                "asset_tag": record["tags"],
            }
        )
        bins.append(sensor)

    return bins


@app.put("/update_name/{row_id}/")
def update_name(row_id: int, name: str):
    sheet = sa.open("BrighterBins_mock_data")
    worksheet = sheet.worksheet("bins_data")
    worksheet.update_cell(row_id, 2, name)
    return {"success": True}


# combined
@app.get("/sensors")
def get_sensors():
    real_fake_sensors = requests.get(REAL_FAKE_SENSORS_BASE_URL + "/sensors").json()
    rfs_as_simple_sensor_list = rfs_list_to_bs_list(real_fake_sensors["sensors"])

    sensational_sensors = requests.get(SENSATIONAL_SENSORS_BASE_URL + "/sensors").json()
    ss_as_simple_sensor_list = sensational_sensor_list_to_simple_sensor_list(
        sensational_sensors["sensors"]
    )

    brighterbins = get_brighterbin_sensors()
    bb_as_ss_list = bb_list_to_simple_sensor_list(brighterbins)

    all_sensors_list = (
        rfs_as_simple_sensor_list + ss_as_simple_sensor_list + bb_as_ss_list
    )
    return {"total": len(all_sensors_list), "sensors": all_sensors_list}


# @app.get("/sensors/{sensor_id}")
# def query_sensor_by_id(sensor_id: str) -> Sensor:
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
