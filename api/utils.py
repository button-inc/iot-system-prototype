def filter_nulls(sensors):
    return list(filter(
        lambda sensor: sensor.lat and sensor.long, 
        sensors
        ))
