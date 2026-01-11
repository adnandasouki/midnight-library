from flask import Blueprint, render_template

from .dependencies.deps import signin_required

main = Blueprint("main", __name__)

@main.route('/')
def main_page():
    return render_template("index.html")

@main.route('/browse')
def browse():
    return render_template("browse_books.html")

@main.route('/books/<int:id>')
def book_details_page(id):
    return render_template("book.html")

@main.route('/signin')
def signin_page():
    return render_template("sign_in.html")

@main.route('/signup')
def signup_page():
    return render_template("sign_up.html")

@main.route('/user/profile')
def profile_page():
    return render_template("profile.html")