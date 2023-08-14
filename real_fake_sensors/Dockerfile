FROM python:3.11

WORKDIR /

COPY ./real_fake_sensors/requirements.txt /requirements.txt

RUN pip install --no-cache-dir --upgrade -r /requirements.txt
COPY ./real_fake_sensors/main.py main.py

EXPOSE 8081
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8081"]

# If running behind a proxy like Nginx or Traefik add --proxy-headers
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80", "--proxy-headers"]
