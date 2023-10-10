#!/bin/bash

# Define the GCP zone, instance name, and project ID
ZONE="us-central1-a"
INSTANCE_NAME="instance-3"
PROJECT_ID="iot-portal-396300"

# Check if we should update the .env file
read -p "Do you want to update the api/.env file? (y/n): " UPDATE_ENV

# Check if we should clean up Docker
read -p "Do you want to clean up Docker (containers, images, volumes)? (y/n): " DOCKER_CLEANUP

# Copy the .env file to the GCP Compute Engine instance
if [ "$UPDATE_ENV" == "y" ]; then
    echo "copying api/.env..."
    gcloud compute scp ../api/.env mike@instance-3:~ --zone="$ZONE" --project="$PROJECT_ID"
fi

# SSH into the GCP Compute Engine instance
gcloud compute ssh --zone "$ZONE" "$INSTANCE_NAME" --project "$PROJECT_ID" << EOF

# If we are updating the .env file, move it to the correct location
if [ "$UPDATE_ENV" == "y" ]; then
    echo "moving the .env to the correct dir"
    sudo mv /home/mike/.env /home/mike/iot-system-prototype/api/.env
fi

# If we are cleaning up Docker, execute the cleanup command
if [ "$DOCKER_CLEANUP" == "y" ]; then
    echo "Cleaning up Docker..."
    sudo docker system prune -a --volumes -f
fi

# Go to the project directory, lives in Mike's user profile
cd /home/mike/iot-system-prototype

# Must use sudo for git commands on VM
sudo -s

# Pull the latest changes from the main branch
git pull origin main

# Build and start the Docker containers using docker-compose
docker-compose --file prod.docker-compose.yml up --build 

EOF
