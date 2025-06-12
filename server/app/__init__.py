import pymysql

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from sqlalchemy.orm import DeclarativeBase
from celery import Celery
from flask_apscheduler import APScheduler



from config import Config
from .errors import handle_exception


# Removing the import that causes circular imports
# from .AppConfig.di_setup import init_di

pymysql.install_as_MySQLdb()
class Base(DeclarativeBase):
    pass
db = SQLAlchemy(model_class=Base)
migrate = Migrate()
mail = Mail()
celery = Celery(__name__, broker=Config.CELERY_BROKER_URL)
scheduler = APScheduler()



def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app, resources={r"/*": {
        "origins": "*", 
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": "*",
        "expose_headers": "*"
    }})
    from .utils.blacklist_cleaner import cleanup_expired_tokens
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    celery.conf.update(app.config)
    
    from .baseModel import BaseModel
    from .UserService.model.role import Role, UserRole
    from .UserService.model.user import User
    from .InvitationService.model.guest import Guest, GuestImages
    
    # Import and initialize DI after models are imported
    from .AppConfig.di_setup import init_di
    init_di()
    
    from .AuthService.controller import init_app as auth_api_init
    auth_api = auth_api_init()
    app.register_blueprint(auth_api, url_prefix="/")

    from .UserService.controller import init_app as user_api_init
    user_api = user_api_init()
    app.register_blueprint(user_api, url_prefix="/user")

    from .InvitationService.controller import init_app as guest_api_init
    guest_api = guest_api_init()
    app.register_blueprint(guest_api, url_prefix="/guest")

    app.register_error_handler(Exception, handle_exception)

    scheduler.init_app(app)
    scheduler.start()
    def job_wrapper():
        with app.app_context():
            cleanup_expired_tokens()

    scheduler.add_job(id='cleanup_blacklist_job', func=job_wrapper, trigger='interval', minutes=5)

    return app