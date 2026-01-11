from . import db
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f"<User {self.username}>"

    def to_json(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Book(db.Model):
    __tablename__ = "books"

    id = db.Column(db.Integer, primary_key=True)
    isbn = db.Column(db.String(255), unique=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255), nullable=True)
    author = db.Column(db.String(255), nullable=False)
    page_count = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=True)
    book_img = db.Column(db.String(255), nullable=True)
    language = db.Column(db.String(50), nullable=False)
    total_copies = db.Column(db.Integer, nullable=False, default=1)    
    publisher = db.Column(db.String(255), nullable=False)
    published_at = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime, 
        onupdate=db.func.now(), 
        server_default=db.func.now()
    )

    def __repr__(self):
        return f"<Book {self.title}>"
    
    def to_json(self):
        data = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        data["available_copies"] = self.available_copies # include available copies
        return data

    @property
    def available_copies(self):
        borrowed_copies = Borrowing.query.filter_by(book_id=self.id, returned_at=None).count()
        return self.total_copies - borrowed_copies
    
    @property
    def is_available(self):
        return self.available_copies > 0

class Borrowing(db.Model):
    __tablename__ = "borrowings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    borrowed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    due_at = db.Column(db.DateTime, nullable=False)
    returned_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User", backref="borrowings")
    book = db.relationship("Book", backref="borrowings")
    
    def __repr__(self):
        return f"<Borrowing user {self.user_id} book {self.book_id}>"
    
    def to_json(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    target_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", backref="activities")
    book = db.relationship("Book", backref="activities")
    
    def to_json(self):
        return {
            "id": self.id,
            "activity_type": self.activity_type,
            "user_id": self.user_id,
            "username": self.user.username,
            "target_id": self.target_id if self.target_id else None,
            "book_title": self.book.title if self.book else None,
            "created_at": self.created_at.isoformat()
        }
        
class Favorite(db.Model):
    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f"<Favorite book {self.book_id} for user {self.user_id}>"
    
    def to_json(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    user = db.relationship("User", backref="favorites")
    book = db.relationship("Book", backref="favorites")