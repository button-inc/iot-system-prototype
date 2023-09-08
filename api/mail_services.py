from dotenv import load_dotenv
import os
from fastapi_mail import FastMail, ConnectionConfig
from pydantic import BaseModel, EmailStr
from typing import List

load_dotenv()

mailgun_username = os.environ.get("MAILGUN_USERNAME")
mailgun_password = os.environ.get("MAILGUN_PASSWORD")
mail_form = os.environ.get("MAIL_FROM")
mail_port = os.environ.get("MAIL_PORT")
mail_server = os.environ.get("MAIL_SERVER")

conf = ConnectionConfig(
    MAIL_USERNAME = mailgun_username,
    MAIL_PASSWORD = mailgun_password,
    MAIL_FROM = mail_form,
    MAIL_PORT = mail_port,
    MAIL_SERVER = mail_server,
    MAIL_FROM_NAME="WavSmart Notification", # Replace with a name you'd like the email to be sent from
    MAIL_TLS = True,
    MAIL_SSL = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)


class EmailSchema(BaseModel):
    email: List[EmailStr]

def get_fm():
    return FastMail(conf)
