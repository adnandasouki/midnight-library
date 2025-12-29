from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from ..models import User

class UsersRepository:
    def __init__(self, db: SQLAlchemy):
        self.db = db

    def create(self, username, email, password):
        new_user: User = User(
            username=username,
            email=email,
            password=password
        )
        self.db.session.add(new_user)
        self.db.session.commit()
        return new_user
        
    def all(self):
        return User.query.all()
        
    def by_id(self, id):
        user = User.query.get(id)
        if not user:
            return None

        return user
    
    def by_username(self, username):
        user = User.query.filter_by(username=username).first()
        
        if not user:
            return None
        
        return user
    
    def by_email(self, email):
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return None
        
        return user
    
    def update(self, user_id: int, updates: dict):
        try:
            user = User.query.get(user_id)

            for key, value in updates.items():
                if value is not None:
                    setattr(user, key, value)
            
            self.db.session.commit()
            return user
        
        except SQLAlchemyError as e:
            self.db.session.rollback()
            raise e
    
    def delete(self, id):
        user = User.query.get(id)

        if not user:
            raise ValueError("User not found")

        try:
            self.db.session.delete(user)
            self.db.session.commit()
            return True
        except SQLAlchemyError as e:
            self.db.session.rollback()
            raise e

