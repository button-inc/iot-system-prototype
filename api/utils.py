def filter_nulls(sensors):
    print(sensors)
    return list(filter(
        lambda sensor: sensor.lat and sensor.long, 
        sensors
        ))