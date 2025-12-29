from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from flask import jsonify, request, current_app, g
from functools import wraps
import jwt

from ...extentions import db
from app.repositories.borrowings_repository import BorrowingsRepository
from app.repositories.activities_repository import ActivitiesRepository
from app.repositories.books_repository import BooksRepository
from app.repositories.users_repository import UsersRepository
from app.services.borrowing_service import BorrowingService
from app.services.activity_service import ActivityService
from app.services.book_service import BookService
from app.services.user_service import UserService


def book_service(db):
    repo = BooksRepository(db)
    service = BookService(repo)
    return service

def user_service(db):
    repo = UsersRepository(db)
    service = UserService(repo)
    return service

def borrowing_service(db):
    borrowing_repo = BorrowingsRepository(db)
    user_repo = UsersRepository(db)
    book_repo = BooksRepository(db)
    service = BorrowingService(borrowing_repo, user_repo, book_repo)
    return service

def activity_service(db):
    repo = ActivitiesRepository(db)
    service = ActivityService(repo)
    return service

def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.cookies.get("access_token")

        if not token:
            return jsonify({"error": "Unauthorized"}), 401
                
        try:
            payload = jwt.decode(
                token, 
                current_app.config['SECRET_KEY'], 
                algorithms=["HS256"]
            )

            request.user = payload
        
        except ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        
        return fn(*args, **kwargs)
    
    return wrapper

def optional_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        g.user = None
        token = request.cookies.get("access_token")

        if token:
            try:
                g.user = jwt.decode(
                    token, 
                    current_app.config['SECRET_KEY'], 
                    algorithms=["HS256"]
                )

            except (InvalidTokenError, ExpiredSignatureError):
                pass
        
        return fn(*args, **kwargs)
    
    return wrapper

def signin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.cookies.get("access_token")
        if not token:
            return jsonify({"error": "Unauthorized"}), 401
        
        try:
            payload = jwt.decode(
                jwt=token,
                key=current_app.config["SECRET_KEY"],
                algorithms=["HS256"],
                issuer="lms-api"
            )
        
            g.current_user_id = payload["user_id"]
        
        except ExpiredSignatureError:
            return jsonify({"error": "Unauthorized"}), 401
        
        except InvalidTokenError:
            return jsonify({"error": "Unauthorized"}), 401
        
        return fn(*args, **kwargs)
    
    return wrapper

def admin_required(fn):
    @wraps(fn)
    @signin_required
    def wrapper(*args, **kwargs):
        service = user_service(db)
        user = service.get_user_by_id(g.current_user_id)

        if not user or not user.is_admin:
            return jsonify({"error": "Forbidden"}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper

