from flask import Flask

from .extentions import db, migrate, bcrypt
from .models import *

from .routes.borrowings_routes import borrowings_routes
from .routes.activities_routes import activities_routes
from .routes.favorites_routes import favorites_routes
from .routes.books_routes import books_routes
from .routes.user_routes import user_routes
from .routes.auth_routes import auth_routes
from .routes.admin_routes import admin
from .routes.main_routes import main

def create_app(config_name="config.Config"):
    app = Flask(__name__)
    app.config.from_object(config_name)

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    # login_manager.init_app(app)

    app.register_blueprint(main)
    app.register_blueprint(admin, url_prefix="/admin")
    app.register_blueprint(auth_routes, url_prefix="/api/auth")
    app.register_blueprint(books_routes, url_prefix="/api/books")
    app.register_blueprint(user_routes, url_prefix="/api/user")
    app.register_blueprint(borrowings_routes, url_prefix="/api/borrowings")
    app.register_blueprint(activities_routes, url_prefix="/api/activities")
    app.register_blueprint(favorites_routes, url_prefix="/api/favorites")
    
    return app