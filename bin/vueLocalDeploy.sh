#!/bin/bash
# What this does:
# This is a bash script for your convenience. 
# It will stop the docker 'app' container, and go to the vue folder and run npm run start
# Idea is that in your local you will utilize the mock docker containers

# How to run: 
# In Terminal #1 -> run the command `docker-compose up --build`
# In Terminal #2 -> run this file by the command `bin/vueLocalDeploy`
# ensure these commands are made at the root level of the project


echo "attempting to load frontend locally for dev environment..."
echo "$PWD"
if [[ $PWD = */iot-system-prototype ]]; 
then
  echo "you're in the right directory"
else
  echo "you're in the wrong directory, execute this in root folder of project--please try again"
  exit 1
fi

sleep .5
echo "looking up docker containers..."
docker container ls -a
sleep .5
if [ "$( docker inspect --format '{{json .State.Running}}' api )" = "true" ];
then 
    echo "docker is running, continuing execution..."
else
    echo "this script depends on you running 'docker-compose up --build' in separate terminal first!--please try again"
    exit 1
fi

echo "stopping docker 'app' container..."
sleep .5
if [ "$( docker inspect --format '{{json .State.Running}}' app )" = "true" ];
then 
    docker-compose stop app
    echo "docker 'app' container stopped! continuing to use mock docker containers..."
    sleep .5
fi


# commands to run vue app
cd app_vue
echo "installing node packages..."
npm install

echo "starting up vue app..."
npm run start
