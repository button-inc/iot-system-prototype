# 📦 Import necessary modules and packages
from enum import Enum
import re
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
from datetime import datetime
from typing import Optional, List, Dict, Union

# 🌐 Load environment variables from .env file
load_dotenv()

# 🛠️ Get environment configurations
env = os.environ.get("ENVIRONMENT")
bb_email = os.environ.get("BB_EMAIL")
bb_password = os.environ.get("BB_PASSWORD")
tkl_client = os.environ.get("TEKELEK_CLIENT")
tkl_password = os.environ.get("TEKELEK_PASSWORD")
tkl_secret = os.environ.get("TEKELEK_TOKEN")
tkl_username = os.environ.get("TEKELEK_USERNAME")

# 📚 Authenticate with Google Sheets service account
sa = gspread.service_account(filename="google_sheets_sa_key.json")

# 🌎 Set base URLs based on the environment
if env == "prod":
    REAL_FAKE_SENSORS_BASE_URL = "http://real-fake-sensors:8081"
    SENSATIONAL_SENSORS_BASE_URL = "http://sensational-sensors:8082"
else:
    REAL_FAKE_SENSORS_BASE_URL = "http://localhost:8081"
    SENSATIONAL_SENSORS_BASE_URL = "http://localhost:8082"

# 🚀 Initialize FastAPI application
app = FastAPI()

# 🌐 Define CORS origins that are allowed to access the API
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://0.0.0.0:8081",
    "http://0.0.0.0:8082",
    "http://wav.button.build",
]

# 🔑 Add CORS middleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 📊 Enum to represent sensor types
class SensorType(Enum):
    LIQUID_BIN_LEVEL = "liquid bin level"
    SOLID_BIN_LEVEL = "solid bin level"


# 📝 Model to represent a basic sensor
class BasicSensor(BaseModel):
    id: str
    sensor_type: SensorType
    fill_level: int | None
    lat: float | None
    long: float | None
    manufacturer: str
    bin_name: str | None
    address_line1: str
    address_line2: str | None
    group: str | None
    bin_type: str
    material_type: str
    asset_tag: str
    bin_volume: str


# 📝 Model to represent a RealFakeSensor
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


# 📝 Model to represent a SensationalSensor
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


# 📝 Model to represent a BrighterBinsSensorReading
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


# 📝 Model to represent a BrighterBinsSensor
class BrighterBinsSensor(BaseModel):
    id: str
    readings: list[BrighterBinsSensorReading] | None
    is_extended_uplink: int
    manufacturer: str
    address: str
    lat: float
    long: float


# 📝 Model to represent a TeklekSensor
class TekelekSensor(BaseModel):
    ID: int
    ModemSerialNo: str
    Name: str
    Shape: str
    TheoreticalCapacity: float
    SafePercentage: int
    NominalCapacity: float
    Diameter: float
    Bund: bool
    Height: float
    Width: float
    Length: float
    SensorOffset: float
    OutletHeight: float
    Make: str
    Model: str
    Substance: str
    Material: str
    AccountNo: Optional[str]
    DateCreated: str
    DateLastModified: Optional[str]
    Note: Optional[str]
    Location: Optional[dict] = None
    ContainerType: str
    OrderTriggerPercentage: str
    Group: Optional[str] = (None,)
    AddressLine1: Optional[str] = (None,)
    AddressLine2: Optional[str] = (None,)
    PercentFull: Optional[float] = None


# 🔧 Function to convert RealFakeSensor to BasicSensor
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


# 🔧 Function to convert RealFakeSensor dictionary to BasicSensor dictionary
def rfs_dict_to_bs_dict(
    sensors: dict[str, RealFakeSensor | None]
) -> dict[str, BasicSensor | None]:
    bs_dict = {}
    for index, sensor_id in enumerate(sensors):
        if sensor_id in sensors:
            bs_dict[sensor_id] = rfs_to_bs(sensors[sensor_id])
    return bs_dict


# 🔧 Function to convert SensationalSensor to BasicSensor
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


# 🔧 Function to convert TekelekSensor to BasicSensor
import re


def tkl_to_bs(sensor: TekelekSensor) -> BasicSensor:
    lat, long = None, None  # Default values in case of errors

    try:
        location = sensor.Location

        if location:
            well_known_text = location.get("Geography", {}).get("WellKnownText", None)

            if well_known_text and well_known_text.startswith("POINT"):
                pattern = r"POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)"
                match = re.search(pattern, well_known_text)

                if match:
                    lat = float(match.group(1))
                    long = float(match.group(2))

    except (AttributeError, TypeError, ValueError) as e:
        print(f"Error while processing location data: {e}")

    return BasicSensor(
        id=sensor.ModemSerialNo,
        sensor_type=SensorType.LIQUID_BIN_LEVEL,
        fill_level=sensor.PercentFull if sensor.PercentFull is not None else None,
        lat=lat,
        long=long,
        manufacturer=sensor.Make,
        bin_name=sensor.Name,
        address_line1=sensor.AddressLine1,
        address_line2=sensor.AddressLine2,
        group=sensor.Group,
        bin_type=sensor.Material,
        material_type=sensor.Substance,
        asset_tag=sensor.Shape,
        bin_volume=sensor.TheoreticalCapacity,
    )

    lat, long = 0.0, 0.0  # Default values in case of errors

    try:
        well_known_text = sensor.Location.get("Geography", {}).get(
            "WellKnownText", None
        )

        if well_known_text and well_known_text.startswith("POINT"):
            # Define a regular expression pattern to extract latitude and longitude
            pattern = r"POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)"

            # Use re.search to find the latitude and longitude values
            match = re.search(pattern, well_known_text)

            if match:
                # Extract latitude and longitude from the match object
                lat = float(match.group(1))
                long = float(match.group(2))

    except (AttributeError, TypeError, ValueError) as e:
        # Handle missing or incorrectly formatted data here
        print(f"Error while processing location data: {e}")

    return BasicSensor(
        id=sensor.ModemSerialNo,
        sensor_type=SensorType.LIQUID_BIN_LEVEL,
        fill_level=sensor.PercentFull if sensor.PercentFull is not None else None,
        lat=lat,
        long=long,
        manufacturer=sensor.Make,
        bin_name=sensor.Name,
        address_line1=sensor.AddressLine1,
        address_line2=sensor.AddressLine2,
        group=sensor.Group,
        bin_type=sensor.Material,
        material_type=sensor.Substance,
        asset_tag=sensor.Shape,
        bin_volume=sensor.TheoreticalCapacity,
    )


# 🔧 Function to convert TeklekSensor dictionary to BasicSensor dictionary
def tkl_dict_to_bs_dict(sensors: List[Dict[str, Union[str, int, float, None]]]) -> dict:
    bs_dict = {}
    # loop to iterate through each obj in the TekelekSensor list
    for index, sensor_data in enumerate(sensors):
        try:
            # create a TekelekSensor object (sensor_obj) by passing the dictionary sensor_data as keyword argument
            sensor_obj = TekelekSensor(**sensor_data)
            # print(f"sensor_obj : {sensor_obj }")
            # convert the TekelekSensor into a BasicSensor and store it in the bs_dict dictionary.
            bs_dict[sensor_obj.ModemSerialNo] = tkl_to_bs(sensor_obj)
        except (ValueError, KeyError, TypeError) as e:
            print(f"Error processing sensor {sensor_obj.ModemSerialNo}: {e}")
            # Optionally, continue to the next iteration
            continue
    return bs_dict


# 🔧 Function to convert BrighterBinsSensor to BasicSensor with latest reading
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


# 🔧 Function to fetch BrighterBins API token
def get_brighterbins_token():
    global bb_email
    global bb_password
    url = "https://api.brighterbins.com/auth/login"
    payload = {"email": bb_email, "password": bb_password}

    try:
        response = requests.request("POST", url, data=payload)
        response_json = response.json()

        # Check if the response contains the "token" key
        if "token" in response_json:
            return response_json["token"]
        elif "secode" in response_json:
            print(
                "Error in get_brighterbins_token: An error occurred while trying to fetch the token."
            )
            print("Error:", response_json["message"])
            return None
        else:
            # Handle unexpected response format
            print(
                "Error in get_brighterbins_token: An unexpected response format was received."
            )
            print("Response:", response_json)
            return None

    except requests.exceptions.RequestException as e:
        # Handle connection or request errors
        print("Error in get_brighterbins_token: A request error occurred.")
        print("Error:", e)
        return None

    except ValueError as e:
        # Handle JSON decoding error
        print("Error in get_brighterbins_token: A JSON decoding error occurred.")
        print("Error:", e)
        return None


# 🔧 Function to fetch Tekelek API token
def get_tekelek_token():
    url = "https://phoenixidentityserverprod.azurewebsites.net/connect/token"
    payload = {
        "client_id": tkl_client,
        "client_secret": tkl_secret,
        "grant_type": "password",
        "scope": "openid",
        "username": tkl_username,
        "password": tkl_password,
    }

    try:
        # Use the generic request function to make the request
        response_json = make_http_request(url, method="POST", data=payload)

        # Check if the response contains the "access_token" key
        if "access_token" in response_json:
            return response_json["access_token"]
        elif "error" in response_json:
            print(
                "Error in get_tekelek_token: An error occurred while trying to fetch the token."
            )
            print("Error:", response_json["error"])
            return None
        else:
            # Handle unexpected response format
            print(
                "Error in get_tekelek_token: An unexpected response format was received."
            )
            print("Response:", response_json)
            return None

    except Exception as e:
        # Handle any unexpected errors
        print("Error in get_tekelek_token:", e)
        return None


# 🔧 Function for making HTTP requests
def make_http_request(url, method="GET", headers=None, params=None, data=None):
    try:
        response = requests.request(
            method, url, headers=headers, params=params, data=data
        )
        response.raise_for_status()  # Check for HTTP errors
        return response.json()
    except requests.exceptions.RequestException as request_err:
        print("An error occurred while making the request:", request_err)
        return None
    except ValueError as value_err:
        print("An error occurred while parsing JSON response:", value_err)
        return None
    except Exception as e:
        print("An unexpected HTTP request error occurred:", e)
        return None


# Caches for sensor data
rfs_cache = {}
ss_cache = []
bb_cache = []
last_run_timestamp = 0
tkl_cache = {}


#  🤖 Event handler: Populate rfs_cache and ss_cache with initial data on start up
@app.on_event("startup")
def set_rfs_and_ss_cache():
    global rfs_cache
    global ss_cache
    # Convert the sensors to the common "BasicSensor" type and cache their values
    # rfs and ss are mock so they have a simple case, we can fetch once and never again, they won't change.
    rfs_response = requests.get(REAL_FAKE_SENSORS_BASE_URL + "/sensors").json()
    rfs_as_bs = rfs_list_to_bs_list(rfs_response["sensors"])
    rfs_cache = rfs_as_bs
    # print(f"rfs_cache: {rfs_cache}")
    ss_response = requests.get(SENSATIONAL_SENSORS_BASE_URL + "/sensors").json()
    ss_cache = sensational_sensor_list_to_basic_sensor_list(ss_response["sensors"])
    return


#  🤖 Event handler: Populate Tekelek data in tkl_cache with initial data on start up
@app.on_event("startup")
def set_tkl_cache():
    global tkl_cache
    try:
        print("Tekelek sensor data cache: fetching sensor data...")
        # get api token
        tekelek_api_token = get_tekelek_token()

        # Define the base URL
        base_url = "https://phoenixapiprod.azurewebsites.net/api/"

        # Make a request to get all sensor data from tank records
        tanks_url = base_url + "tanks"
        tanks_response = make_http_request(
            tanks_url,
            method="GET",
            headers={"Authorization": "Bearer " + tekelek_api_token},
        )

        if tanks_response:
            records = tanks_response

            # Iterate tank records to get additional information from related API endpoints
            for index, record in enumerate(records):
                serialNo = record["ModemSerialNo"]

                # get the sensor address, etc. details
                details_url = base_url + "modems/details/" + serialNo
                details_response = make_http_request(
                    details_url,
                    method="GET",
                    headers={"Authorization": "Bearer " + tekelek_api_token},
                )

                record["Group"] = (
                    details_response["Group"] if details_response is not None else ""
                )
                record["AddressLine1"] = (
                    details_response["AddressLine1"]
                    if details_response is not None
                    else ""
                )
                record["AddressLine2"] = (
                    details_response["AddressLine2"]
                    if details_response is not None
                    else ""
                )

                # get the latest sensor fill reading
                latest_reading_url = base_url + "latestReading/" + serialNo
                reading_response = make_http_request(
                    latest_reading_url,
                    method="GET",
                    headers={"Authorization": "Bearer " + tekelek_api_token},
                )

                record["PercentFull"] = (
                    reading_response["PercentFull"]
                    if reading_response is not None
                    else None
                )

            # Convert TekelekSensor list to BasicSensor objects dictionary
            tkl_cache = tkl_dict_to_bs_dict(records)
            print("Tekelek sensor data cache: fetch complete")

    except Exception as e:
        print("An unexpected error occurred:", e)


#  🤖 Event handler: Fetch BrighterBins historical data and update bb_cache hourly
# The purpose is to maintain a historical record of sensor readings over time.
# This allows the program to access and analyze past readings without repeatedly querying the API for the same data
# event handler continues to run periodically, in the background, due to the @repeat_every decorator
@app.on_event("startup")
@repeat_every(seconds=60 * 60)  # Every 1 hour
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


# 🚀 API endpoint: Get the latest readings from all types of sensors
@app.get("/latest_readings")
def get_latest_readings():
    global rfs_cache
    global ss_cache

    bb_readings = []
    for id in bb_cache:
        bb_readings.append(
            brighterbins_sensor_to_basic_sensor_with_reading(bb_cache[id])
        )

    latest_readings = bb_readings + rfs_cache + ss_cache + tkl_cache
    return {"sensors": latest_readings}


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
