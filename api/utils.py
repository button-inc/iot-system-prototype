import requests

def filter_nulls(sensors):
    return list(filter(
        lambda sensor: sensor.lat and sensor.long, 
        sensors
        ))

# 🔧 Function for making HTTP requests
def make_http_request(url, method="GET", headers=None, params=None, data=None):
    try:
        response = requests.request(
            method, url, headers=headers, params=params, data=data
        )
        response.raise_for_status()  # Check for HTTP errors
        return response.json()
    except requests.exceptions.RequestException as request_err:
        print("An error occurred while making the request:", request_err)
        return None
    except ValueError as value_err:
        print("An error occurred while parsing JSON response:", value_err)
        return None
    except Exception as e:
        print("An unexpected HTTP request error occurred:", e)
        return None
    

def get_goog_sheet_date_format():
    return "%m/%d/%Y %H:%M:%S"
