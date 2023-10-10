from typing import Optional
from manufacturers.basic import BasicSensor, SensorType
from utils import get_goog_sheet_date_format, make_http_request
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from datetime import datetime
import gspread

# 📚 Authenticate with Google Sheets service account
sa = gspread.service_account(filename="google_sheets_sa_key.json")

load_dotenv()
tkl_client = os.environ.get("TEKELEK_CLIENT")
tkl_password = os.environ.get("TEKELEK_PASSWORD")
tkl_secret = os.environ.get("TEKELEK_TOKEN")
tkl_username = os.environ.get("TEKELEK_USERNAME")

# 📝 Model to represent a TeklekSensor
class TekelekSensor(BaseModel):
    ModemSerialNo: Optional[str]
    Shape: Optional[str]
    TheoreticalCapacity: Optional[float]
    SafePercentage: Optional[int]
    NominalCapacity: Optional[float]
    Diameter: Optional[float]
    Bund: Optional[bool]
    Height: Optional[float]
    Width: Optional[float]
    Length: Optional[float]
    SensorOffset: Optional[float]
    OutletHeight: Optional[float]
    Make: Optional[str]
    Model: Optional[str]
    Substance: Optional[str]
    Material: Optional[str]
    AccountNo: Optional[str]
    DateCreated: Optional[str]
    DateLastModified: Optional[str]
    Note: Optional[str]
    Location: Optional[dict] = None
    ContainerType: Optional[str]
    OrderTriggerPercentage: Optional[str]
    Group: Optional[str] = (None,)
    # fields required by BasicSensor
    id: str
    fill_level: int | None
    lat: float | None
    long: float | None
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


# 🔧 Function to convert TekelekSensor to BasicSensor
def tkl_to_bs(sensor: TekelekSensor) -> BasicSensor:
    #lat, long = None, None  # Default values in case of errors

    # try:
    #     location = sensor.Location

    #     if location:
    #         well_known_text = location.get("Geography", {}).get("WellKnownText", None)

    #         if well_known_text and well_known_text.startswith("POINT"):
    #             pattern = r"POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)"
    #             match = re.search(pattern, well_known_text)

    #             if match:
    #                 lat = float(match.group(1))
    #                 long = float(match.group(2))

    # except (AttributeError, TypeError, ValueError) as e:
    #     print(f"Error while processing location data: {e}")

    bs = BasicSensor(
        id=sensor.id,
        sensor_type=SensorType.LIQUID_BIN_LEVEL,
        fill_level=sensor.fill_level,
        lat=sensor.lat,
        long=sensor.long,
        manufacturer='Tekele',
        bin_name=sensor.bin_name,
        address_line1=sensor.address_line1,
        address_line2=sensor.address_line2,
        city=sensor.city,
        province=sensor.province,
        postal_code=sensor.postal_code,  
        group=sensor.group,
        bin_type=sensor.bin_type,
        material_type=sensor.material_type,
        asset_tag=sensor.asset_tag,
        bin_volume=sensor.bin_volume,
        fill_level_last_collected=sensor.fill_level_last_collected, 
        fill_level_alert=sensor.fill_level_alert,  
        temperature_alert=sensor.temperature_alert,  
        illegal_dumping_alert=sensor.illegal_dumping_alert,  
        contamination_alert=sensor.contamination_alert,  
        last_collected=sensor.last_collected  
    )
    return bs


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


def update_tkl_cache(tkl_cache):
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
                "last_collected": datetime.strptime(record["Last_collected"], get_goog_sheet_date_format())
            }
            tkl_cache[id] = sensor
        print("Tekelek sensor data cache: fetch complete")
    
    return tkl_cache


def get_tkl_readings(tkl_cache):
    tkl_readings = []
    for tkl_id, tkl_sensor in tkl_cache.items():
        tkl_obj = TekelekSensor(**tkl_sensor)
        tkl_readings.append(
            tkl_to_bs(tkl_obj)
            )
    
    return tkl_readings





