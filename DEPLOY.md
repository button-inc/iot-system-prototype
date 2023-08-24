# Temporary deployment instructions

The initial deployment was done on a VM in GCP in a Button project called IoT-portal. To set up a new one, first create a VM.

ssh into the VM, you can do this on in GCE page in the cloud. It will, give you a window or the command to run from your own pc.
`gcloud compute ssh --zone "us-central1-a" "instance-3" --project "iot-portal-396300"`
`sudo -s`
install docker and docker-compose:
`apt update && apt install --yes apt-transport-https ca-certificates curl gnupg2 software-properties-common && curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add - && add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" && apt update && apt install --yes docker-ce && curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose`

`usermod -aG docker $USER`

install compse
`curl -SL https://github.com/docker/compose/releases/download/v2.1.1/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose`

install git:
`sudo apt-get update`
`sudo apt-get install git`

clone the repo
`git clone https://github.com/button-inc/iot-system-prototype.git`

`cd iot-system-prototype`

From here you need to:

- update the url in the get request in `app/pages/index.tsx` to point to the ip
- update `api/main.py` to allow the ip / whatever domain we're using
- update `docker-compose.yml` to map apps port as "80:3000" instead of "3000:3000"

Now from root, `docker-compose up -d`.

## Updating the code to latest:

Since this is just a cloned git repo running docker-compose, you can simply do the following from inside the container
(by running `gcloud compute ssh --zone "us-central1-a" "instance-3" --project "iot-portal-396300"`):

- `docker-compose stop`
- `git pull origin develop`
- update the url in the get request in `app/pages/index.tsx` to point to the ip
- update `api/main.py` to allow the ip / whatever domain we're using
- update `docker-compose.yml` to map apps port as "80:3000" instead of "3000:3000"
- `docker-compose up -d`

## Destroying

### Stop the app but keep the container alive

ssh in and stop the containers:
`gcloud compute ssh --zone "us-central1-a" "instance-3" --project "iot-portal-396300"`
`docker-compose stop`

### Tear down the VM:

Log into GCP and destroy the VM in the GCE tab.

If this deployment is moving, delete the entire project in GCP.
