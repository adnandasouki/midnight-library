from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, or_

from ..models import Book

class BooksRepository:
    def __init__(self, db: SQLAlchemy):
        self.db = db

    def create(
            self,
            isbn: str,
            title: str,
            subtitle: str,
            author: str,
            page_count: int,
            description: str,
            book_img: str,
            language: str,
            total_copies: int,
            publisher: str,
            published_at: str
    ):
        try:
            new_book: Book = Book(
                isbn=isbn,
                title=title,
                subtitle=subtitle,
                author=author,
                page_count=page_count,
                book_img=book_img,
                language=language,
                total_copies=total_copies,
                publisher=publisher,
                description=description,
                published_at=published_at
            )
            self.db.session.add(new_book)
            self.db.session.commit()
            return new_book
        
        except SQLAlchemyError as e:
            self.db.session.rollback()
            raise e
        
    def _base_query(self, q=None):
        query = Book.query

        if q:
            query = query.filter(or_(
                Book.isbn.ilike(f"%{q}%"),
                Book.title.ilike(f"%{q}%"),
                Book.author.ilike(f"%{q}%")
            ))
            
        return query

    def all(self, page=1, per_page=10, q=None):
        query = self._base_query(q)

        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

    def by_id(self, id):
        return Book.query.get(id)
    
    def by_title(self, title):
        return Book.query.filter(func.lower(title) == title).first()
    
    def by_author(self, author):
        return Book.query.filter_by(author=author).all()
    
    def by_isbn(self, isbn):
        return Book.query.filter_by(isbn=isbn).first()

    def search_title(self, text: str):
        return Book.query.filter(Book.title.ilike(f"%{text}%")).all()
    
    def update(self, id: int, updates: dict):
        try:
            book = Book.query.get(id)

            for key, value in updates.items():
                if value is not None:
                    setattr(book, key, value)

            self.db.session.commit()
            return book
        
        except SQLAlchemyError as e:
            self.db.session.rollback()
            raise e

    def delete(self, id):
        book: Book = Book.query.get(id)
        
        try:
            self.db.session.delete(book)
            self.db.session.commit()
            return True
        except SQLAlchemyError:
            self.db.session.rollback()
            return False

    