from ..repositories.borrowings_repository import BorrowingsRepository
from ..repositories.users_repository import UsersRepository
from ..repositories.books_repository import BooksRepository
from datetime import datetime, timezone

class BorrowingService:
    def __init__(
            self, 
            borrowing_repo: BorrowingsRepository, 
            user_repo: UsersRepository, 
            book_repo: BooksRepository
    ):
        self.borrowing_repo = borrowing_repo
        self.user_repo = user_repo
        self.book_repo = book_repo

    # Borrow book
    def create_new_borrowing(self, user_id, book_id, due_at):
        user = self.user_repo.by_id(id=user_id)
        book = self.book_repo.by_id(id=book_id)

        # Internal errors
        if not user or not book:
            raise RuntimeError("Missing user or book")
        
        if not due_at:
            raise RuntimeError("Missing due date")
        
        # Client/business errors
        # No copies left to borrow
        if not book.is_available:
            raise ValueError("No copies left")
        
        # Reaching borrowings limit
        if self.borrowing_repo.limit_reached(user_id=user_id):
            raise ValueError("Borrowings limit reached")
        
        # Check if user has overdue
        if self.borrowing_repo.has_overdue(user_id=user_id):
            raise ValueError("Can't borrow a new book, overdue dates detected")
        
        # Check if book is borrowed by the same user
        if self.borrowing_repo.has_copy(user_id=user_id, book_id=book_id):
            raise ValueError("Book already borrowed!")
        
        return self.borrowing_repo.create(user_id=user_id, book_id=book_id, due_at=due_at)
        
    # get all borrowings
    def get_all(self):
        return self.borrowing_repo.all()

    # get active borrowings
    def get_active(self):
        return self.borrowing_repo.active()
    
    # get returned borrowings
    def get_returned(self):
        return self.borrowing_repo.returned()
    
    def get_overdue(self):
        return self.borrowing_repo.overdue()
    
    def get_borrowing_by_id(self, id):
        b = self.borrowing_repo.by_id(id=id)
        if not b:
            raise ValueError("Borrowing not found")
        return b
    
    def get_active_by_user(self, id):
        user = self.user_repo.by_id(id)
        if not user:
            raise ValueError("User not found")
        return self.borrowing_repo.active_by_user(id)
    
    def get_borrowings_by_user(self, user_id):
        user = self.user_repo.by_id(id=user_id)
        if not user:
            raise ValueError("User not found")
        return self.borrowing_repo.by_user(user_id=user_id)
    
    def get_borrowing_status(self, borrowing_id):
        borrowing = self.borrowing_repo.by_id(borrowing_id)
        if not borrowing:
            raise ValueError("Borrowing not found")
        
        if self.borrowing_repo.is_overdue(borrowing):
            return 'overdue'
        if self.borrowing_repo.is_active(borrowing):
            return 'active'
        return 'returned'

    def get_borrowings_by_book(self, book_id):
        book = self.book_repo.by_id(id=book_id)
        if not book:
            raise ValueError("Book not found")
        return self.borrowing_repo.by_book(book_id=book_id)
    
    def check_overdue_borrowing(self, borrowing):
        return self.borrowing_repo.is_overdue(borrowing=borrowing)
        
    def check_borrowings_limit(self, user_id):
        user = self.user_repo.by_id(id=user_id)
        if not user:
            raise ValueError("User not found")
        return self.borrowing_repo.is_limit_reached(user_id=user_id)
    
    def return_borrowed_book(self, borrowing_id):
        return self.borrowing_repo.return_book(borrowing_id=borrowing_id)
    
    def update_borrowing_due_date(self, id, new_due_date):
        borrowing = self.borrowing_repo.by_id(id=id)
        if not borrowing:
            raise ValueError("Borrowing not found")
        
        # naive datetime (no timezone)
        new_due_date = datetime.strptime(new_due_date, "%a, %d %b %Y %H:%M:%S %Z")
        # aware datetime (timezone)
        new_due_date = new_due_date.replace(tzinfo=timezone.utc)

        if not new_due_date:
            raise ValueError("Missing due date")
        
        # datetime objects comparing error (no timezone < timezone)
        if new_due_date < datetime.now(timezone.utc):
            raise ValueError("Invalid due date")
        
        return self.borrowing_repo.update_due_date(id=id, new_due_date=new_due_date)
    
    def delete_borrowing_by_id(self, id):
        borrowing = self.borrowing_repo.by_id(id=id)
        if not borrowing:
            raise ValueError("Borrowing not found")
        
        return self.borrowing_repo.delete_by_id(id=id)
    
    def delete_borrowing_by_user(self, user_id):
        user = self.user_repo.by_id(id=user_id)
        borrowing = self.borrowing_repo.by_user(user_id=user_id)

        if not user:
            raise ValueError("User not found")
        
        if not borrowing:
            raise ValueError("Borrowing not found")
        
        return self.borrowing_repo.delete_by_user_id(user_id=user_id)
    
    def delete_borrowing_by_book(self, book_id):
        book = self.book_repo.by_id(id=book_id)
        borrowing = self.borrowing_repo.by_book(book_id=book_id)

        if not book:
            raise ValueError("Book not found")
        
        if not borrowing:
            raise ValueError("Borrowing not found")
        
        return self.borrowing_repo.delete_by_book_id(book_id=book_id)