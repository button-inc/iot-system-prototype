from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# whitelist
origins = ["http://localhost:8080", "api:8080"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Sensor(BaseModel):
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


sensors = [
    {
        "sensorsID": 2453473454,
        "sensorCompany": "Real Fake Sensors",
        "sensorDeviceID": 523452,
        "firmwareVersion": "0.1.4",
        "clientId": 1,
        "simCardNumber": "12344423",
        "connectivityProvider": "RFS inc",
        "latest_sensors_data": None,
        "latitude": 49.220314,
        "longitude": -123.152224,
    },
    {
        "sensorsID": 1846567335,
        "sensorCompany": "Real Fake Sensors",
        "sensorDeviceID": 5673546,
        "firmwareVersion": "0.2.1",
        "clientId": 1,
        "simCardNumber": "+5424524555",
        "connectivityProvider": "RFS inc",
        "latest_sensors_data": {"level": 84, "timestamp": 1691381304819},
        "latitude": 49.228314,
        "longitude": -123.092224,
    },
]


@app.get("/")
def index() -> str:
    return "hi"


@app.get("/sensors")
def get_sensors() -> dict[str, str | int | list[Sensor]]:
    return {"total": len(sensors), "sensors": sensors}


@app.get("/sensors/{sensor_id}")
def query_sensor_by_id(sensor_id: int) -> Sensor:
    for sensor in sensors:
        if sensor["sensorsID"] == sensor_id:
            return sensor
    raise HTTPException(status_code=404, detail="Sensor not found")
