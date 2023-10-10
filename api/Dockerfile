FROM python:3.11

WORKDIR /api

COPY ./api/requirements.txt /api/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /api/requirements.txt

# Copy individual files and directories
COPY ./api/main.py ./api/utils.py /api/
COPY ./api/services/mail.py ./api/services/google_routes.py /api/services/
COPY ./api/manufacturers/basic.py ./api/manufacturers/brighter_bins.py ./api/manufacturers/tekelek.py /api/manufacturers/
COPY ./api/.en[v] ./api/google_sheets_sa_key.jso[n] /api/

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

# If running behind a proxy like Nginx or Traefik add --proxy-headers
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--proxy-headers"]
