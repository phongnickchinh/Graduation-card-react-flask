import os
from dotenv import load_dotenv
from pathlib import Path


env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "secret_key")
    CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL")

    MYSQL_USERNAME = os.environ.get("MYSQL_USER")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD")
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_PORT = os.environ.get("MYSQL_PORT", "3306")
    MYSQL_DBNAME = os.environ.get("MYSQL_DB_NAME")

    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    if not SQLALCHEMY_DATABASE_URI:
        if MYSQL_USERNAME and MYSQL_HOST and MYSQL_DBNAME:
            SQLALCHEMY_DATABASE_URI = (
                f"mysql+pymysql://{MYSQL_USERNAME}:{MYSQL_PASSWORD or ''}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DBNAME}"
            )
        else:
            pass
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # MAIL_SERVER = "smtp.gmail.com"
    # MAIL_PORT = 587
    # MAIL_USE_TLS = True
    # MAIL_USE_SSL = False
    # MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    # MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    # MAIL_DEFAULT_SENDER = "minhnguyenhai26032003@gmail.com"
    # MAIL_SUBJECT_PREFIX = "[Meal Planner]"
    
    FIREBASE_CREDENTIALS_PATH = os.environ.get("FIREBASE_CREDENTIALS_PATH", "secrets/graduation-card-461516-1dd3b689dbd6.json")
    FIREBASE_STORAGE_BUCKET = os.environ.get("FIREBASE_STORAGE_BUCKET")

    ACCESS_TOKEN_EXPIRE_SEC = int(os.environ.get("ACCESS_TOKEN_EXPIRE_SEC", 3600))
    REFRESH_TOKEN_EXPIRE_SEC = int(os.environ.get("REFRESH_TOKEN_EXPIRE_SEC", 604800))


secret_key = Config.SECRET_KEY
access_token_expire_sec = Config.ACCESS_TOKEN_EXPIRE_SEC
refresh_token_expire_sec = Config.REFRESH_TOKEN_EXPIRE_SEC