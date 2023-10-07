# 📦 Import necessary modules and packages
from manufacturers.brighter_bins import get_bb_readings, update_bb_cache
from manufacturers.tekelek import  get_tkl_readings, update_tkl_cache
from services.google_routes import RouteRequest, get_optimized_routes_response
from services.mail import AlertEmailSchema, EmailSchema, get_email_msg, get_fm
from utils import filter_nulls

from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi_utils.tasks import repeat_every

import os


from starlette.responses import JSONResponse

# 🌐 Load environment variables from .env file
load_dotenv()

# 🛠️ Get environment configurations
env = os.environ.get("ENVIRONMENT")

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

# Caches for sensor data
bb_cache = {}
tkl_cache = {}
last_run_timestamp = 0

#  🤖 Event handler: Populate Tekelek data in tkl_cache with initial data on start up
@app.on_event("startup")
def set_tkl_cache():
    global tkl_cache
    try:
        tkl_cache = update_tkl_cache(tkl_cache)

    except Exception as e:
        print("An unexpected error occurred:", e)


@app.on_event("startup")
@repeat_every(seconds=60 * 60)  # Every 1 hour
def set_bb_cache() -> None:
    global bb_cache
    global last_run_timestamp

    try:
        bb_cache, last_run_timestamp = update_bb_cache(bb_cache, last_run_timestamp)
    except Exception as e:
        print("An unexpected error occurred:", e)


# 🚀 API endpoint: Get the latest readings from all types of sensors
@app.get("/latest_readings")
def get_latest_readings():
    global bb_cache
    global tkl_cache

    bb_readings = get_bb_readings(bb_cache)
    tkl_readings = get_tkl_readings(tkl_cache)

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
