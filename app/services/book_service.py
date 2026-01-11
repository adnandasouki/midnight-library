from ..repositories.books_repository import BooksRepository

class BookService:
    def __init__(self, repo: BooksRepository):
        self.repo = repo

    def _validate_book_data(
        self,
        isbn,
        title,
        author,
        page_count,
        language,
        publisher,
        total_copies
    ):
        if not all([isbn, title, author, language, publisher]):
            raise ValueError("Missing required fields")
        
        if page_count is None or page_count <= 0:
            raise ValueError("Page count must be greater than 0")
        
        if total_copies is not None and total_copies <= 0:
            raise ValueError("Invalid copies count")
        
    def create_book(
        self,
        isbn: str,
        title: str,
        subtitle: str,
        author: str,
        page_count: int,
        book_img: str,
        language: str,
        total_copies: int,
        publisher: str,
        published_at: str,
        description: str
    ):
        self._validate_book_data(
            isbn,
            title,
            author,
            page_count,
            language,
            publisher,
            total_copies
        )

        if total_copies is None:
            total_copies = 1

        existing = self.repo.by_isbn(isbn=isbn)
        if existing:
            raise ValueError("Book already exists!")

        book = self.repo.create(
            isbn=isbn,
            title=title,
            subtitle=subtitle,
            author=author,
            page_count=page_count,
            book_img=book_img,
            language=language,
            total_copies=total_copies,
            publisher=publisher,
            published_at=published_at,
            description=description
        )
        return book
    
    def get_all_books(self, page, per_page, q):
        if page is not None and page < 1:
            raise ValueError("Invalid page count")

        return self.repo.all(
            page=page,
            per_page=per_page,
            q=q
        )
    
    def get_all_for_admin(self, q=None):
        return self.repo._base_query(q)
    
    def get_by_id(self, id):
        book = self.repo.by_id(id)
        if not book:
            raise ValueError("Book not found")
        return book
    
    def get_by_title(self, title: str):
        title = title.lower().strip()
        book = self.repo.by_title(title)
        if not book:
            raise ValueError("Book not found")
        return book
    
    def get_by_isbn(self, isbn):
        book = self.repo.by_isbn(isbn)
        if not book:
            raise ValueError("Book not found")
        return book
    
    def search_by_title(self, text):
        return self.repo.search_title(text)
    
    def update_book_by_id(self, id, updates):
        book = self.repo.by_id(id)
        
        if not book:
            raise ValueError("Book not found")
        
        return self.repo.update(id, updates)
    
    def delete_book(self, id):
        book = self.repo.by_id(id)
        if not book:
            raise ValueError("Book not found")
        return self.repo.delete(id)