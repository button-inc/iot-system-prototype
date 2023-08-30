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
    id: str
    sensor_type: SensorType
    fill_level: int
    sim: str
    lat: float
    long: float
    man: str
    bin_name: str
    address_line1: str
    address_line2: str
    group: str
    bin_type: str
    material_type: str
    asset_tag: str
    bin_volume: str


sensors = {
    "564746584": {
        "id": "564746584",
        "sensor_type": SensorType.LIQUID_BIN_LEVEL,
        "fill_level": 80,
        "sim": "3jdf93deq",
        "lat": 43.828165,
        "long": -80.1,
        "man": "Sensational Sensors",
        "bin_name": "Big Blue Bin",
        "address_line1": "19556 Mississauga Rd",
        "address_line2": "Alton, ON L7K 1M5",
        "group": "Alton North",
        "bin_type": "EMW Cathedral Container 10yd",
        "material_type": "Cardboard",
        "asset_tag": "strange",
        "bin_volume": "medium",
    },
    "134563456": {
        "id": "134563456",
        "sensor_type": SensorType.LIQUID_BIN_LEVEL,
        "fill_level": 75,
        "sim": "asdgdfhfj",
        "lat": 43.601509,
        "long": -79.884398,
        "man": "Sensational Sensors",
        "bin_name": "Little Red Bin",
        "address_line1": "13850 Steeles Ave",
        "address_line2": "Halton Hills, ON L7G 0J1",
        "group": "Halton West",
        "bin_type": "EMW Cathedral Container 10yd",
        "material_type": "Cardboard",
        "asset_tag": "strange",
        "bin_volume": "small",
    },
    "265434931": {
        "id": "265434931",
        "sensor_type": SensorType.LIQUID_BIN_LEVEL,
        "fill_level": 65,
        "sim": "fjaksyr3j",
        "lat": 43.951197,
        "long": -79.947344,
        "man": "Sensational Sensors",
        "bin_name": "Strange Bin",
        "address_line1": "12345 Fake Name Rd",
        "address_line2": "Bolton, ON L7E 0Y2",
        "group": "Halton West",
        "bin_type": "EMW Cathedral Container 10yd",
        "material_type": "Plastic",
        "asset_tag": "charm",
        "bin_volume": "large",
    },
    "265434945": {
        "id": "265434945",
        "sensor_type": SensorType.LIQUID_BIN_LEVEL,
        "fill_level": 25,
        "sim": "86msjg91a",
        "lat": 43.551197,
        "long": -79.547344,
        "man": "Sensational Sensors",
        "bin_name": "Charming Bin",
        "address_line1": "44444 Cow Rd",
        "address_line2": "Bolton, ON L7E 0Y2",
        "group": "Bolton South",
        "bin_type": "EMW Cathedral Container 10yd",
        "material_type": "Plastic",
        "asset_tag": "up",
        "bin_volume": "medium",
    },
    "265434933": {
        "id": "265434933",
        "sensor_type": SensorType.LIQUID_BIN_LEVEL,
        "fill_level": 10,
        "sim": "324dg4gfs",
        "lat": 43.822397,
        "long": -79.647344,
        "man": "Sensational Sensors",
        "bin_name": "Cheddar Bin",
        "address_line1": "41234 Cheese Rd",
        "address_line2": "Bolton, ON L7E 0Y2",
        "group": "Bolton South",
        "bin_type": "EMW Cathedral Container 10yd",
        "material_type": "Plastic",
        "asset_tag": "bottom",
        "bin_volume": "small",
    },
    "265435142": {
        "id": "265435142",
        "sensor_type": SensorType.LIQUID_BIN_LEVEL,
        "fill_level": 40,
        "sim": "9185jak34",
        "lat": 43.451197,
        "long": -80.147344,
        "man": "Sensational Sensors",
        "bin_name": "Small Yellow Bin",
        "address_line1": "626 Caramel Dr",
        "address_line2": "Bolton, ON L7E 0Y2",
        "group": "Bolton South",
        "bin_type": "EMW Cathedral Container 10yd",
        "material_type": "Cardboard",
        "asset_tag": "strange",
        "bin_volume": "medium",
    },
    "265434817": {
        "id": "265434817",
        "sensor_type": SensorType.LIQUID_BIN_LEVEL,
        "fill_level": 40,
        "sim": "81kai41j8",
        "lat": 43.351197,
        "long": -79.347344,
        "man": "Sensational Sensors",
        "bin_name": "Cherry Bin",
        "address_line1": "99473 Fruit Blvd",
        "address_line2": "Bolton, ON L7E 0Y2",
        "group": "Bolton South",
        "bin_type": "EMW Cathedral Container 20yd",
        "material_type": "Compost",
        "asset_tag": "top",
        "bin_volume": "small",
    },
    "265434991": {
        "id": "265434991",
        "sensor_type": SensorType.LIQUID_BIN_LEVEL,
        "fill_level": 90,
        "sim": "01d83nn17",
        "lat": 43.991197,
        "long": -79.887344,
        "man": "Sensational Sensors",
        "bin_name": "Corn Bin",
        "address_line1": "513 Cow Rd",
        "address_line2": "Bolton, ON L7E 0Y2",
        "group": "Bolton South",
        "bin_type": "EMW Cathedral Container 20yd",
        "material_type": "Compost",
        "asset_tag": "top",
        "bin_volume": "large",
    },
}


@app.get("/sensors")
def index() -> dict[str, Sensor]:
    return sensors


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
