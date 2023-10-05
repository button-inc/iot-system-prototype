# 📦 Import necessary modules and packages
from enum import Enum
import re
import time
import requests
from google_routes_services import RouteRequest, get_optimized_routes_response
from mail_services import AlertEmailSchema, EmailSchema, get_email_msg, get_fm
from utils import filter_nulls

import gspread
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi_utils.tasks import repeat_every

from pydantic import BaseModel
import os
from datetime import datetime
from typing import Optional, List, Dict, Union

from starlette.responses import JSONResponse

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

goog_sheet_date_format = "%m/%d/%Y %H:%M:%S"

# 🚀 Initialize FastAPI application
app = FastAPI()

# 🌐 Define CORS origins that are allowed to access the API
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://wav.button.build",
    "http://34.123.69.225/",
    "http://34.123.69.225:80",
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
    address_line1: str | None
    address_line2: str | None
    city: str | None
    province: str | None
    postal_code: str | None
    group: str | None
    bin_type: str
    material_type: str
    asset_tag: str
    bin_volume: str
    fill_level_last_collected: int | None
    fill_level_alert: int | None
    temperature_alert: int | None
    illegal_dumping_alert: bool | None
    contamination_alert: bool | None
    last_collected: datetime | None



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
    row_id: int | None
    readings: list[BrighterBinsSensorReading] | None
    is_extended_uplink: int
    manufacturer: str
    address_line1: str | None
    city: str | None
    province: str | None
    postal_code: str | None
    group: str | None
    bin_type: str
    material_type: str
    asset_tag: str
    bin_volume: str


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


# 🔧 Function to convert TekelekSensor to BasicSensor
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

    bs = BasicSensor(
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
    return bs


# 🔧 Function to convert TeklekSensor dictionary to BasicSensor dictionary
# def tkl_dict_to_bs_dict(sensors: List[Dict[str, Union[str, int, float, None]]]) -> dict:
#     bs_dict = {}
#     # loop to iterate through each obj in the TekelekSensor list
#     for sensor_data in sensors:
#         try:
#             # create a TekelekSensor object (sensor_obj) by passing the dictionary sensor_data as keyword argument
#             sensor_obj = TekelekSensor(**sensor_data)

#             # print(f"sensor_obj : {sensor_obj }")
#             # convert the TekelekSensor into a BasicSensor and store it in the bs_dict dictionary.
#             bs_dict[sensor_obj.ModemSerialNo] = tkl_to_bs(sensor_obj)
#         except (ValueError, KeyError, TypeError) as e:
#             print(f"Error processing sensor {sensor_obj.ModemSerialNo}: {e}")
#             # Optionally, continue to the next iteration
#             continue
#     return bs_dict


# 🔧 Function to convert BrighterBinsSensor to BasicSensor with latest reading
def brighterbins_sensor_to_basic_sensor_with_reading(
    sensor: BrighterBinsSensor,
) -> BasicSensor:
    return BasicSensor(
        id=sensor["id"],
        sensor_type=SensorType.SOLID_BIN_LEVEL,
        fill_level=sensor["readings"][-1]["fillLevel"] # get the latest reading
        if (sensor["readings"] and len(sensor["readings"]) > 0)
        else None,
        lat=sensor["lat"],
        long=sensor["long"],
        manufacturer="BrighterBins",
        bin_name=sensor["bin_name"],
        address_line1=sensor["address"],
        address_line2=None,
        city=sensor["city"],
        province=sensor["province"],
        postal_code=sensor["postal_code"],
        group=sensor["group"],
        bin_type=sensor["bin_type"],
        material_type=sensor["material_type"],
        bin_volume=sensor["bin_volume"],
        asset_tag=sensor["asset_tag"],
        fill_level_last_collected=sensor["fill_level_last_collected"],
        fill_level_alert=sensor["fill_level_alert"],
        temperature_alert=sensor["temperature_alert"],
        illegal_dumping_alert=sensor["illegal_dumping_alert"],
        contamination_alert=sensor["contamination_alert"],
        last_collected=sensor["last_collected"],
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
bb_cache = {}
tkl_cache = {}
last_run_timestamp = 0


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
        # tanks_url = base_url + "tanks"
        # tanks_response = make_http_request(
        #     tanks_url,
        #     method="GET",
        #     headers={"Authorization": "Bearer " + tekelek_api_token},
        # )
        sheet = sa.open("Mississauga_mock_data")
        worksheet = sheet.worksheet("Asset-Bin Information-TekelekTA")
        records = worksheet.get_all_records()

        if records:
            # Iterate asset records to get additional information from related API endpoints
            for index, record in enumerate(records):
                id = record["Sensor ID"]
                print("fetching Tekelek id", id) 
                # get the latest sensor fill reading
                latest_reading_url = base_url + "latestReading/" + str(id)
                reading_response = make_http_request(
                    latest_reading_url,
                    method="GET",
                    headers={"Authorization": "Bearer " + tekelek_api_token},
                )

                if not (reading_response):
                    print("failed to get response from id ", id)

                sensor = {
                    "id": id,
                    "row_id": index + 2,
                    "bin_name": record["Asset - Name"],
                    "address_line1": record["Address"],
                    "address_line2": None,
                    "city": record["City"],
                    "province": record["Province"],
                    "postal_code": record["Postal code"],
                    "lat": record["Latitude"],
                    "long": record["Longitude"],
                    "bin_volume": record["Bin Volume"],
                    "bin_type": record["Bin Type"],
                    "material_type": record["Material/Waste Type"],
                    "asset_tag": record["Addiontal Asset Tags"],
                    "group": record["Group"],
                    "fill_level_last_collected": record["Fill_level_last_collected"],
                    "fill_level": reading_response["PercentFull"] if reading_response else None,
                    "fill_level_alert": record["Fill_level_alert"],
                    "temperature_alert": record["Temperature_alert"],
                    "illegal_dumping_alert": record["Illegal_dumping_alert"].upper() == "YES",
                    "contamination_alert": record["Contamination_alert"].upper() == "YES",
                    "last_collected": datetime.strptime(record["Last_collected"], goog_sheet_date_format)
                }
                tkl_cache[id] = sensor
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
        print("BrighterBins cache: Fetching initial data...")
        readingsEndTime = round(time.time() * 1000)
        # start around July 28, for no particular reason
        readingsStartTime = 1690592310000
        last_run_timestamp = readingsEndTime + 1
        # get all the sensors data from the google sheet
        sheet = sa.open("Mississauga_mock_data")
        worksheet = sheet.worksheet("Asset-Bin Information-BBTA")
        records = worksheet.get_all_records()

        for index, record in enumerate(records):
            id = record["Sensor ID"]
            print("fetching BrighterBin id", id)
            try:
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
                # Check if the response is successful
                if response.get('success'):
                    readings = (
                        []
                        if len(response["data"]["series"]) == 0
                        else response["data"]["series"]
                    )
                else:
                    print(f"Error fetching data for sensor {id}. Response: {response}")
                    readings = ([{"fillLevel": -1}])
                
                sensor = {
                    "id": id,
                    "row_id": index + 2,
                    "bin_name": record["Asset - Name"],
                    "address": record["Address"],
                    "city": record["City"],
                    "province": record["Province"],
                    "postal_code": record["Postal code"],
                    "lat": record["Latitude"],
                    "long": record["Longitude"],
                    "bin_volume": record["Bin Volume"],
                    "bin_type": record["Bin Type"],
                    "material_type": record["Material/Waste Type"],
                    "asset_tag": record["Addiontal Asset Tags"],
                    "group": record["Group"],
                    "readings": readings,
                    "fill_level_last_collected": record["Fill_level_last_collected"],
                    "fill_level_alert": record["Fill_level_alert"],
                    "temperature_alert": record["Temperature_alert"],
                    "illegal_dumping_alert": record["Illegal_dumping_alert"].upper() == "YES",
                    "contamination_alert": record["Contamination_alert"].upper() == "YES",
                    "last_collected": datetime.strptime(record["Last_collected"], goog_sheet_date_format)
                }
                bb_cache[id] = sensor
            except Exception as e:
                print(f"Error fetching data for sensor {id}. Exception: {e}")

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
    global bb_cache
    global tkl_cache

    bb_readings = []
    for index, sensor in enumerate(bb_cache):
        bb_readings.append(
            brighterbins_sensor_to_basic_sensor_with_reading(bb_cache[sensor])
        )

    tkl_readings = []
    for index, sensor in enumerate(tkl_cache):
        tkl_readings.append(tkl_cache[sensor])

    latest_readings = bb_readings + tkl_readings
    # latest_readings = filter_nulls(latest_readings)
    return {"sensors": latest_readings}


@app.post("/email")
async def send_email(email: EmailSchema) -> JSONResponse:
    msg = get_email_msg(
        recipients=email.dict().get("recipient_list"), body=email.dict().get("body")
    )

    fm = get_fm()

    await fm.send_message(msg)
    return JSONResponse(status_code=200, content={"message": "email has been sent"})


@app.post("/send_alerts")
async def send_alerts(email: AlertEmailSchema) -> JSONResponse:
    alert_level = email.dict().get("alert_level")
    sensors_latest_readings = get_latest_readings()["sensors"]
    recipient_list = email.dict().get("recipient_list")

    # 1. Filter sensors with fill_level > a threshold
    high_filled_sensors = [
        sensor for sensor in sensors_latest_readings if sensor.fill_level > alert_level
    ]
    if not high_filled_sensors:
        email_schema = EmailSchema(
            recipient_list=recipient_list,
            body="no sensors with fill level above " + str(alert_level),
        )

        response = await send_email(email_schema)
        return response

    # 2. Format the data for the email
    body = "Sensors with fill level above " + str(alert_level) + "%:\n\n"
    for sensor in high_filled_sensors:
        sensor_data = "\n".join(
            [f"{key}: {value}" for key, value in sensor.dict().items()]
        )
        body += f"{sensor_data}\n\n"

    # 3. Send the email
    email_schema = EmailSchema(recipient_list=recipient_list, body=body)

    response = await send_email(email_schema)

    return response


# alert every 24 hours
@app.on_event("startup")
@repeat_every(seconds=60 * 60 * 24)
async def automatic_alerts():
    if env != "prod":
        print("Not in 'prod' environment. Skipping alerts.")
        return

    alert_email_data = AlertEmailSchema(
        recipient_list=[
            "lin.yaokun1@gmail.com",
            "patrick@button.is",
            "elliott@button.is",
        ],
        alert_level=75,
    )

    print("sending out alerts on over filled sensors")
    response = await send_alerts(alert_email_data)
    return response


@app.post("/getOptimizedRoute")
async def get_optimized_route(request: RouteRequest):
    if not request.selectedRouteList:
        raise HTTPException(status_code=400, detail="selectedRouteList cannot be empty")

    if len(request.selectedRouteList) > 25:
        raise HTTPException(
            status_code=400, detail="selectedRouteList cannot be more than 25 in size"
        )

    response = await get_optimized_routes_response(request)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


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
