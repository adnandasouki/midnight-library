from app.repositories.books_repository import BooksRepository
from app.models import Book
from typing import List

def test_get_all_books(session):
    books = Book.query.all()

    assert [b.to_json() for b in books]
    assert books is not None
