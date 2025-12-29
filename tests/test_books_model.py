from app.models import Book

def test_book_creation(session):
    book = Book(
        isbn="12345",
        title="Test Book",
        author="John Doe",
        page_count=100,
        language="English",
        publisher="Publisher",
        published=2025
    )
    session.add(book)
    session.commit()

    assert book.id is not None
    assert book.to_json()["title"] == "Test Book"
    assert book.to_json()