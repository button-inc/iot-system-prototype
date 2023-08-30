from enum import Enum
import time
import requests

import gspread
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi_utils.session import FastAPISessionMaker
from fastapi_utils.tasks import repeat_every

from pydantic import BaseModel
import os

load_dotenv()
env = os.environ.get("ENVIRONMENT")
bb_email = os.environ.get("BB_EMAIL")
bb_password = os.environ.get("BB_PASSWORD")
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
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://0.0.0.0:8081",
    "http://0.0.0.0:8082",
    "http://wav.button.build",
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


# This is our mock generic type.
# A real generic type is still needed, and this format is unlikely to be the final format.
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


# Fake sensors (mock data)
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


# Fake sensors (mock data)
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


# BrighterBins are real.
class BrighterBinsSensorReading(BaseModel):
    epoch_ms: int
    rawDistance: int
    temperature: int
    batteryLevel: int
    pickUpEvent: bool
    fillLevel: int
    fillError: bool
    snr: int
    rssi: int


class BrighterBinsSensor(BaseModel):
    id: str
    readings: list[BrighterBinsSensorReading] | None
    is_extended_uplink: int
    manufacturer: str
    address: str
    lat: float
    long: float


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


def rfs_dict_to_bs_dict(
    sensors: dict[str, RealFakeSensor | None]
) -> dict[str, BasicSensor | None]:
    bs_dict = {}
    for index, sensor_id in enumerate(sensors):
        if sensor_id in sensors:
            bs_dict[sensor_id] = rfs_to_bs(sensors[sensor_id])

    return bs_dict


def sensational_sensor_to_basic_sensor(sensor: SensationalSensor) -> BasicSensor:
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


def sensational_sensor_list_to_basic_sensor_list(
    sensors: list[SensationalSensor],
) -> list[BasicSensor]:
    return [sensational_sensor_to_basic_sensor(sensor) for sensor in sensors]


def brighterbins_sensor_to_basic_sensor_with_reading(
    sensor: BrighterBinsSensor,
) -> BasicSensor:
    return BasicSensor(
        id=sensor["id"],
        sensor_type=SensorType.SOLID_BIN_LEVEL,
        fill_level=sensor["readings"][-1]["fillLevel"]
        if (sensor["readings"] and len(sensor["readings"]) > 0)
        else None,
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


def get_brighterbins_token():
    global bb_email
    global bb_password
    url = "https://api.brighterbins.com/auth/login"
    payload = {"email": bb_email, "password": bb_password}
    response = requests.request("POST", url, data=payload).json()
    return response["token"]


rfs_cache = {}
ss_cache = []
bb_cache = []
last_run_timestamp = 0


@app.on_event("startup")
def set_rfs_and_ss_cache():
    global rfs_cache
    global ss_cache

    # Convert the sensors to the common "BasicSensor" type and cache their values
    # rfs and ss are mock so they have a simplecase, we can fetch once and never again, they won't change.
    rfs_response = requests.get(REAL_FAKE_SENSORS_BASE_URL + "/sensors").json()
    rfs_as_bs = rfs_list_to_bs_list(rfs_response["sensors"])
    rfs_cache = rfs_as_bs
    ss_response = requests.get(SENSATIONAL_SENSORS_BASE_URL + "/sensors").json()
    ss_cache = sensational_sensor_list_to_basic_sensor_list(ss_response["sensors"])
    return


# For BrighterBins, we need to fetch all of the historical data at server start,
# and then append the latest readings from each sensor once per hour.
@app.on_event("startup")
@repeat_every(seconds=60 * 60)  # 1 hour
def update_bb_cache() -> None:
    global bb_cache
    global last_run_timestamp
    brighterbins_api_token = get_brighterbins_token()
    url = "https://api.brighterbins.com/bins/timeseries"

    # fully populate bb_cache if this is the first time this is being run
    if last_run_timestamp == 0:
        print("Fetching initial data...")
        readingsEndTime = round(time.time() * 1000)
        # start around July 28, for no particular reason
        readingsStartTime = 1690592310000
        last_run_timestamp = readingsEndTime + 1
        # get all the sensors data from the google sheet
        sheet = sa.open("BrighterBins_mock_data")
        worksheet = sheet.worksheet("bins_data")
        records = worksheet.get_all_records()

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
            readings = (
                []
                if len(response["data"]["series"]) == 0
                else response["data"]["series"]
            )
            sensor = {
                "id": id,
                "row_id": index + 2,
                "bin_name": record["name"],
                "address": record["address"],
                "lat": record["lat"],
                "long": record["long"],
                "bin_volume": record["bin_volume"],
                "asset_tag": record["tags"],
                "readings": readings,
            }
            bb_cache[id] = sensor
        print("Initial fetch complete")
    else:
        print("Fetching latest data...")
        for id in bb_cache:
            readingsEndTime = round(time.time() * 1000)
            readingsStartTime = last_run_timestamp + 1
            last_run_timestamp = readingsEndTime + 1
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
            bb_cache[id]["readings"] = (
                bb_cache[id]["readings"] + response["data"]["series"]
            )
        print("Latest fetch complete")
    return


@app.get("/latest_readings")
def get_latest_readings():
    global rfs_cache
    global ss_cache

    bb_readings = []
    for id in bb_cache:
        bb_readings.append(
            brighterbins_sensor_to_basic_sensor_with_reading(bb_cache[id])
        )

    latest_readings = bb_readings + rfs_cache + ss_cache
    return {"sensors": latest_readings}


# @app.put("/update_bb_name/{row_id}/")
# def update_name(row_id: int, name: str):
#     sheet = sa.open("BrighterBins_mock_data")
#     worksheet = sheet.worksheet("bins_data")
#     worksheet.update_cell(row_id, 2, name)
#     # update the cache here maybe? else fetch latest.
#     return {"success": True}
