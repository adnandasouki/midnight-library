from flask import Blueprint, render_template

from .dependencies.deps import admin_required

admin = Blueprint("admin", __name__)

@admin.route("/", methods=["GET"])
@admin_required
def overview(): 
    return render_template("admin.html")

@admin.route("/manage-books")
@admin_required
def manage_books():
    return render_template("manage_books.html")

@admin.route("/manage-users")
@admin_required
def manage_users():
    return render_template("manage_users.html")

@admin.route("/manage-borrowings")
@admin_required
def manage_borrowings():
    return render_template("manage_borrowings.html")

@admin.route("/activities")
@admin_required
def all_activity():
    return render_template("all_activity.html")