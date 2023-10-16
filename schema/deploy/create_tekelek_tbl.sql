-- Deploy wavdb:create_tekelek_tbl to pg
-- requires: create_wav_schema

BEGIN;

CREATE TABLE wav_schema.tekelek (
    asset_name TEXT,
    device_bin_location_description TEXT,
    customer_name TEXT,
    bin_address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    latitude FLOAT,
    longitude FLOAT,
    group_name TEXT,
    material_waste_type TEXT,
    bin_volume TEXT,
    bin_type TEXT,
    bin_manufacturer_description TEXT,
    sensor_id TEXT PRIMARY KEY,
    sensor_manufacturer_description TEXT,
    hauler TEXT,
    task_required TEXT,
    bin_height_in FLOAT,
    bin_diameter_width_in FLOAT,
    sensor_height_in FLOAT,
    from_sensor_to_opening_of_the_bin_in FLOAT,
    image_of_bin TEXT,
    additional_asset_tags TEXT,
    fill_level_last_collected FLOAT,
    fill_level FLOAT,
    fill_level_alert FLOAT,
    temperature_alert FLOAT,
    illegal_dumping_alert BOOLEAN DEFAULT FALSE,
    contamination_alert BOOLEAN DEFAULT FALSE,
    last_collected TIMESTAMP
);


COMMIT;
