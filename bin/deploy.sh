#!/bin/bash

# Define the GCP zone, instance name, and project ID
ZONE="us-central1-a"
INSTANCE_NAME="instance-3"
PROJECT_ID="iot-portal-396300"

# SSH into the GCP Compute Engine instance
gcloud compute ssh --zone "$ZONE" "$INSTANCE_NAME" --project "$PROJECT_ID" << EOF

# Go to the project directory, lives in Mike's user profile
cd ../mike/iot-system-prototype

# Must use sudo for git commands on VM
sudo -s

# Pull the latest changes from the develop branch
git pull origin develop

# Build and start the Docker containers using docker-compose
docker-compose --file prod.docker-compose.yml up --build 

EOF
