FROM python:3.11

WORKDIR /

# it should be uncommented for docker-compose usage.
#COPY ./sensational_sensors/requirements.txt /requirements.txt
COPY ./requirements.txt /requirements.txt

RUN pip install --no-cache-dir --upgrade -r /requirements.txt

# it should be uncommented for docker-compose usage.
#COPY ./sensational_sensors/main.py main.py
COPY ./main.py /main.py

EXPOSE 8082
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8082"]

# If running behind a proxy like Nginx or Traefik add --proxy-headers
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--proxy-headers"]
