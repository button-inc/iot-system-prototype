import requests

# print(requests.get("http://127.0.0.1:8000/").json())
# print(requests.get("http://127.0.0.1:8000/sensors/0").json())
print(requests.get("http://127.0.0.1:8000/sensors?min_fill_level=2"))
