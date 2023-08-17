from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# whitelist
origins = [
    "http://localhost:8080",
    "http://0.0.0.0:8081",
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


class Sensor(BaseModel):
    id: int
    sensor_type: SensorType
    fill_level: int
    sim: str
    lat: float
    long: float
    man: str
    bin_name: str


sensors = [
    Sensor(
        id=564746584,
        sensor_type=SensorType.LIQUID_BIN_LEVEL,
        fill_level=80,
        sim="3jdf93deq",
        lat=43.828165, #49.218314,
        long=-80.1, #-123.102224,
        man="Sensational Sensors",
        bin_name='Big Blue Bin'
    ),
    Sensor(
        id=134563456,
        sensor_type=SensorType.LIQUID_BIN_LEVEL,
        fill_level=75,
        sim="asdgdfhfj",
        lat=43.601509,
        long=-79.884398,
        man="Sensational Sensors",
        bin_name='Little Red Bin'
    ),
    Sensor(
        id=265434931,
        sensor_type=SensorType.LIQUID_BIN_LEVEL,
        fill_level=65,
        sim="324dg4gfs",
        lat=43.851197,
        long=-79.747344,
        man="Sensational Sensors",
        bin_name='Small Yellow Bin'
    ),
]


@app.get("/sensors")
def index() -> dict[str, int | list[Sensor]]:
    return {"total": len(sensors), "sensors": sensors}


@app.get("/sensors/{sensor_id}")
def query_sensor_by_id(sensor_id: int) -> Sensor:
    if sensor_id not in sensors:
        raise HTTPException(
            status_code=404, detail=f"Sensor iwth id {sensor_id} does not exist"
        )
    return sensors[sensor_id]


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
