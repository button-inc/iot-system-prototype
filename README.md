# IoT Sensor Management Prototype

This is a prototype for an IoT sensor management system. It includes an app, an API server, and two servers acting as fake IoT sensor manufacturer's APIs.

## Local development

To run this locally, have docker running on your machine and run `docker-compose up --build` from the root (include the `-d` flag if you're not a log reader). In order for the backend to work, all three of the API servers need to be running. Instructions on running any of the API servers outside of docker-compose can be found in their readme files.

To stop, `ctrl`/`cmd` + `c`, or `docker-compose stop` if using the daemon.

When working on the frontend code it can be useful to run `docker-compose stop app` , then `cd ./app`, `yarn dev` for the live changes.

## For backend reload on change

Need to have three terminals open:

- `cd api` then `uvicorn main:app --host 0.0.0.0 --port 8080 --reload`
- `cd real-fake-sensors` then `uvicorn main:app --host 0.0.0.0 --port 8081 --reload`
- `cd sensational-sensors` then `uvicorn main:app --host 0.0.0.0 --port 8082 --reload`
