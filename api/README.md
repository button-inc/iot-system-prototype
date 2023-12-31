# API Server

This API server is used to serve IoT sensor data from various device manufacturers to a common platform (presently found in `/app`).

This is a prototype API server.

## Tools

### FastAPI

https://fastapi.tiangolo.com/

This server is built using FastAPI. It was selected for it's performance, simplicity, and out of the box asynchronous functionality.

### Uvicorn

https://www.uvicorn.org/

Uvicorn is a light-weight Asynchronous Server Gateway Interface (ASGI) adherent web server. It currently suppoerts HTTP and WebSockets.

## Usage

To run this server on it's own, in a terminal:
`uvicorn main:app` with the optional `--port` and `--host` options.
Defult is `localhost:8000` if no options are passed.

## Keys / Secrets

You will need to create a key for sheetssa@iot-portal-396300.iam.gserviceaccount.com and save it locally in api as google_sheets_sa_key.json.

You will also need the `api/.env` file in the 1password vault.
