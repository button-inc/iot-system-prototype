#!/bin/bash
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
if [ "$( docker inspect --format '{{json .State.Running}}' real-fake-sensors )" = "true" ] && [ "$( docker inspect --format '{{json .State.Running}}' sensational-sensors )" = "true" ];
then 
    echo "docker is running, continuing execution..."
else
    echo "this script depends on you running 'docker-compose up --build' in separate terminal first!--please try again"
    exit 1
fi

echo "stopping docker app..."
sleep .5
if [ "$( docker inspect --format '{{json .State.Running}}' app )" = "true" ];
then 
    docker-compose stop app
fi

echo "starting up vue app..."
# commands to run vue app
cd app_vue
npm run start