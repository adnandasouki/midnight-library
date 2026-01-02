from ..repositories.favorites_repository import FavoritesRepository
from ..repositories.users_repository import UsersRepository
from ..repositories.books_repository import BooksRepository

class FavoriteService:
    def __init__(
            self,
            favorites_repo: FavoritesRepository,
            users_repo:UsersRepository,
            books_repo: BooksRepository
    ):
        self.favorites_repo = favorites_repo
        self.users_repo = users_repo
        self.books_repo = books_repo

    def create_new_favorite(self, user_id, book_id):
        if not self.users_repo.by_id(user_id):
            raise ValueError("User not found")
        
        if not self.books_repo.by_id(book_id):
            raise ValueError("Book not found")

        if self.favorites_repo.exists(user_id, book_id):
            raise ValueError("Already favorited")
        
        return self.favorites_repo.create(user_id, book_id)
    
    def get_all_favorites(self):
        return self.favorites_repo.all()
    
    def get_favorites_by_user(self, user_id):
        if not self.users_repo.by_id(user_id):
            raise ValueError("User not found")
        
        return self.favorites_repo.by_user(user_id)
    
    def get_favorites_by_book(self, book_id):
        if not self.books_repo.by_id(book_id):
            raise ValueError("Book not found")
        
        return self.favorites_repo.by_book(book_id)
    
    def get_favorite_by_id(self, fav_id):
        fav = self.favorites_repo.by_id(fav_id)
        if not fav:
            ValueError("Favorite not found")

        return self.favorites_repo.by_id(fav_id)
    
    def delete_favorite(self, fav_id):
        if not self.favorites_repo.by_id(fav_id):
            raise ValueError("Favorite not found")
        
        return self.favorites_repo.delete(fav_id)
    
    



