from flask_sqlalchemy import SQLAlchemy
from ..models import Favorite

class FavoritesRepository():
    def __init__(self, db: SQLAlchemy):
        self.db = db

    def create(self, user_id, book_id):
        new = Favorite(
            user_id=user_id,
            book_id=book_id
        )

        self.db.session.add(new)
        self.db.session.commit()
        return new

    def all(self):
        return Favorite.query.all()
    
    def by_user(self, user_id):
        return (
            Favorite.query
            .filter(Favorite.user_id == user_id)
            .all()
        )

    def by_book(self, book_id):
        return (
            Favorite.query
            .filter(Favorite.book_id == book_id)
            .all()
        )
    
    def by_id(self, fav_id):
        return Favorite.query.get(fav_id)
    
    def exists(self, user_id, book_id):
        return Favorite.query.filter(
            Favorite.user_id == user_id,
            Favorite.book_id == book_id
        ).first() is not None
    
    def delete(self, fav_id):
        query = Favorite.query.get(fav_id)

        try:
            self.db.session.delete(query)
            self.db.session.commit()
            return True
        except:
            return False