# IoT Sensor Management Prototype

This is a prototype for an IoT sensor management system. It includes an app, an API server, and two servers acting as fake IoT sensor manufacturer's APIs.

## Local development

To run this locally, have docker running on your machine and run `docker-compose up --build` from the root (include the `-d` flag if you're not a log reader). In order for the backend to work, all three of the API servers need to be running. Instructions on running any of the API servers outside of docker-compose can be found in their readme files.

To stop, `ctrl`/`cmd` + `c`, or `docker-compose stop` if using the daemon.

When working on the frontend code it can be useful to run `docker-compose stop app` , then `cd ./app`, `yarn dev` for the live changes.

## Application deployment to k8s

1. Get credentials and connect to your cluster. Ensure `helm` is using the proper context.
2. `helm install isp ./deploy/iot-system-prototype`
3. Page available at `{gatewayIP}/iot-system-prototype`
