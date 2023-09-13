#!/bin/bash

# Define the GCP zone, instance name, and project ID
ZONE="us-central1-a"
INSTANCE_NAME="instance-3"
PROJECT_ID="iot-portal-396300"

# Check if we should update the .env file
read -p "Do you want to update the api/.env file? (y/n): " UPDATE_ENV
if [ "$UPDATE_ENV" == "y" ]; then
    echo "copying api/.env..."
    # Copy the .env file to the GCP Compute Engine instance
    gcloud compute scp ./api/.env mike@instance-3:~ --zone="$ZONE" --project="$PROJECT_ID"
fi

# SSH into the GCP Compute Engine instance
gcloud compute ssh --zone "$ZONE" "$INSTANCE_NAME" --project "$PROJECT_ID" << EOF

# If we are updating the .env file, move it to the correct location
if [ "$UPDATE_ENV" == "y" ]; then
    sudo mv /home/mike/.env /home/mike/iot-system-prototype/api/.env
fi

# Go to the project directory, lives in Mike's user profile
cd /home/mike/iot-system-prototype

# Must use sudo for git commands on VM
sudo -s

# Pull the latest changes from the develop branch
git pull origin develop

# Build and start the Docker containers using docker-compose
docker-compose --file prod.docker-compose.yml up --build 

EOF
