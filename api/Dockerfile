FROM python:3.11

WORKDIR /

COPY ./api/requirements.txt /requirements.txt

RUN pip install --no-cache-dir --upgrade -r /requirements.txt
COPY ./api/main.py main.py

EXPOSE 8080
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

# If running behind a proxy like Nginx or Traefik add --proxy-headers
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--root-path", "/api", "--port", "8080", "--proxy-headers"]
