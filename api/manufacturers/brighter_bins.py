from manufacturers.basic import BasicSensor, SensorType
from utils import get_goog_sheet_date_format
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from datetime import datetime
import requests
import gspread
import time

# 📚 Authenticate with Google Sheets service account
sa = gspread.service_account(filename="google_sheets_sa_key.json")

load_dotenv()
bb_email = os.environ.get("BB_EMAIL")
bb_password = os.environ.get("BB_PASSWORD")

# 📝 Model to represent a BrighterBinsSensorReading
class BrighterBinsSensorReading(BaseModel):
    epoch_ms: int | None
    rawDistance: int | None
    temperature: int | None
    batteryLevel: int | None
    pickUpEvent: bool | None
    fillLevel: int
    fillError: bool | None
    snr: int | None
    rssi: int | None
    lat: float | None
    long: float | None

# 📝 Model to represent a BrighterBinsSensor
class BrighterBinsSensor(BaseModel):
    id: str
    row_id: int | None
    readings: list[BrighterBinsSensorReading] | None
    is_extended_uplink: int | None
    manufacturer: str | None
    # fields required by BasicSensor
    id: str
    fill_level: int | None
    lat: float | None
    long: float | None
    bin_name: str | None
    address: str | None
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


# 🔧 Function to convert BrighterBinsSensor to BasicSensor with latest reading
def bb_to_bs(
    sensor: BrighterBinsSensor,
) -> BasicSensor:
    return BasicSensor(
        id=sensor.id,
        sensor_type=SensorType.SOLID_BIN_LEVEL,
        fill_level=sensor.readings[-1].fillLevel # get the latest reading
        if (sensor.readings and len(sensor.readings) > 0)
        else None,
        lat=sensor.lat,
        long=sensor.long,
        manufacturer="BrighterBins",
        bin_name=sensor.bin_name,
        address_line1=sensor.address,
        address_line2=None,
        city=sensor.city,
        province=sensor.province,
        postal_code=sensor.postal_code,
        group=sensor.group,
        bin_type=sensor.bin_type,
        material_type=sensor.material_type,
        bin_volume=sensor.bin_volume,
        asset_tag=sensor.asset_tag,
        fill_level_last_collected=sensor.fill_level_last_collected,
        fill_level_alert=sensor.fill_level_alert,
        temperature_alert=sensor.temperature_alert,
        illegal_dumping_alert=sensor.illegal_dumping_alert,
        contamination_alert=sensor.contamination_alert,
        last_collected=sensor.last_collected,
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


#  🤖 Event handler: Fetch BrighterBins historical data and update bb_cache hourly
# The purpose is to maintain a historical record of sensor readings over time.
# This allows the program to access and analyze past readings without repeatedly querying the API for the same data
# event handler continues to run periodically, in the background, due to the @repeat_every decorator    
def update_bb_cache(bb_cache, last_run_timestamp):
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
                    "last_collected": datetime.strptime(record["Last_collected"], get_goog_sheet_date_format())
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
    
    return bb_cache, last_run_timestamp


def get_bb_readings(bb_cache):
    bb_readings = []
    for bb_id, bb_sensor in bb_cache.items():
        bb_obj = BrighterBinsSensor(**bb_sensor)
        bb_readings.append(
            bb_to_bs(bb_obj)
        )
    return bb_readings
