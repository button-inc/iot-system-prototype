from dotenv import load_dotenv
import os
from fastapi_mail import FastMail, ConnectionConfig, MessageSchema
from pydantic import BaseModel, EmailStr
from typing import List

load_dotenv()

mailgun_username = os.environ.get("MAILGUN_USERNAME")
mailgun_password = os.environ.get("MAILGUN_PASSWORD")
mail_form = os.environ.get("MAIL_FROM")
mail_port = os.environ.get("MAIL_PORT")
mail_server = os.environ.get("MAIL_SERVER")

conf = ConnectionConfig(
    MAIL_USERNAME=mailgun_username,
    MAIL_PASSWORD=mailgun_password,
    MAIL_FROM=mail_form,
    MAIL_PORT=mail_port,
    MAIL_SERVER=mail_server,
    MAIL_FROM_NAME="WavSmart Notification",
    MAIL_TLS=True,
    MAIL_SSL=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


class EmailSchema(BaseModel):
    recipient_list: List[EmailStr]
    body: str


class AlertEmailSchema(BaseModel):
    recipient_list: List[EmailStr]
    alert_level: int


def get_fm():
    return FastMail(conf)


def get_email_msg(recipients, body):
    return MessageSchema(
        subject="WAVSmart IoT Notify",
        recipients=recipients,
        body=body,
        # subtype=MessageType.html
    )
