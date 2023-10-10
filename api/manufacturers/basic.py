from pydantic import BaseModel
from enum import Enum
from datetime import datetime

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
    bin_type: str | None
    material_type: str
    asset_tag: str
    bin_volume: str
    fill_level_last_collected: int | None
    fill_level_alert: int | None
    temperature_alert: int | None
    illegal_dumping_alert: bool | None
    contamination_alert: bool | None
    last_collected: datetime | None
