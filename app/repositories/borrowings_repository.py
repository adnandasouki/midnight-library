from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

from ..models import Borrowing, Book

class BorrowingsRepository:
    def __init__(self, db: SQLAlchemy):
        self.db = db

    def create(self, user_id, book_id, due_at):
        new_borrowing = Borrowing(
            user_id=user_id,
            book_id=book_id,
            due_at=due_at
        )

        borrowed_book = Book.query.filter_by(id=book_id).first()
        borrowed_book.total_copies -= 1

        self.db.session.add(new_borrowing)
        self.db.session.commit()
        return new_borrowing

    def all(self):
        return Borrowing.query.all()
    
    def active(self):
        return Borrowing.query.filter(Borrowing.returned_at == None).all()
    
    def returned(self):
        return Borrowing.query.filter(Borrowing.returned_at != None).all()
    
    def overdue(self):
        return Borrowing.query.filter(
            Borrowing.returned_at == None,
            Borrowing.due_at > datetime.now(timezone.utc)
        ).all()
        
    def by_id(self, id):
        query = Borrowing.query.get(id)
        if not query:
            raise ValueError("Borrowing not found")
        return query

    def by_user(self, user_id):
        return Borrowing.query.filter_by(user_id=user_id).all()

    def by_book(self, book_id):
        return Borrowing.query.filter_by(book_id=book_id).all()
    
    def active_by_user(self, user_id):
        return Borrowing.query.filter(
            Borrowing.user_id == user_id,
            Borrowing.returned_at == None
        ).all()
    
    def active_by_book(self, book_id):
        return Borrowing.query.filter(
            Borrowing.book_id == book_id,
            Borrowing.returned_at == None
        ).all()
    
    def overdue_by_user(self, user_id):
        return Borrowing.query.filter(
            Borrowing.user_id == user_id,
            Borrowing.returned_at == None,
            Borrowing.due_at > datetime.now(timezone.utc)
        ).all()
                
    def has_copy(self, user_id, book_id):
        book = Borrowing.query.filter(
            Borrowing.user_id == user_id,
            Borrowing.book_id == book_id,
            Borrowing.returned_at == None
        ).first()
        if book:
            return True
        return False

    def has_overdue(self, user_id):
        now = datetime.now(timezone.utc)
        return Borrowing.query.filter(
            Borrowing.user_id == user_id,\
            Borrowing.returned_at == None,\
            Borrowing.due_at < now
        ).count() > 0

    def is_overdue(self, borrowing):
        now = datetime.now(timezone.utc)
        if borrowing.due_at.tzinfo is None:
            due = borrowing.due_at.replace(tzinfo=timezone.utc)
        due = borrowing.due_at.astimezone(timezone.utc)
            
        return (
            borrowing.returned_at is None\
            and now > due
        )

    def is_active(self, borrowing):
        return borrowing.returned_at is None

    def limit_reached(self, user_id):
        return Borrowing.query.filter(
            Borrowing.user_id == user_id, 
            Borrowing.returned_at == None
        ).count() >= 5

    def return_book(self, borrowing_id):
        borrowing = Borrowing.query.filter(
            Borrowing.id == borrowing_id, 
            Borrowing.returned_at == None
        ).first()
        if not borrowing:
            raise ValueError("Book is returned or not found")

        borrowing.returned_at = datetime.now(timezone.utc)

        book_copies = Book.query.filter_by(id=borrowing.book_id).first()
        book_copies.total_copies += 1

        self.db.session.commit()
        return borrowing

    def update_due_date(self, id, new_due_date):
        borrowing = Borrowing.query.get(id)
        if not borrowing:
            raise ValueError("Borrowing not found")

        borrowing.due_at = new_due_date
        self.db.session.commit()
        return borrowing

    def delete_by_id(self, id):
        query = Borrowing.query.get(id)
        if not query:
            raise ValueError("Borrowing not found")

        self.db.session.delete(query)
        self.db.session.commit()
        return True

    def delete_by_user_id(self, user_id):
        borrowings = Borrowing.query.filter_by(user_id=user_id).all()
        for b in borrowings:
            self.db.session.delete(b)
        self.db.session.commit()
        return {"message": f"deleted {len(borrowings)} borrowing records"}

    def delete_by_book_id(self, book_id):
        borrowings = Borrowing.query.filter_by(book_id=book_id).all()
        for b in borrowings:
            self.db.session.delete(b)
        self.db.session.commit()
        return {"message": f"deleted {len(borrowings)} borrowing records"}
