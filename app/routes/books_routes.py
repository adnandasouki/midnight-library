from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
import os

from .dependencies.deps import admin_required
from .dependencies.deps import book_service
from ..extentions import db

books_routes = Blueprint("books_routes", __name__)

@books_routes.route("/create", methods=["POST"])
@admin_required
def Add_book():
    try:
        service = book_service(db)

        isbn = request.form.get("isbn")
        title = request.form.get("title")
        subtitle = request.form.get("subtitle")
        author = request.form.get("author")
        page_count = int(request.form.get("page_count"))
        language = request.form.get("language")
        publisher = request.form.get("publisher")
        published_at = request.form.get("published_at")
        total_copies = int(request.form.get("total_copies"))
        description = request.form.get("description")
        book_img = request.files.get("book_img")

        IMAGES_FOLDER = os.path.join("app/static/assets/images")
        
        img_name = secure_filename(book_img.filename)
        os.makedirs(IMAGES_FOLDER, exist_ok=True)
        book_img.save(os.path.join(IMAGES_FOLDER, img_name))
        
        service.create_book(
            isbn=isbn,
            title=title,
            subtitle=subtitle,
            author=author,
            page_count=page_count,
            language=language,
            publisher=publisher,
            book_img=img_name,
            published_at=published_at,
            description=description,
            total_copies=total_copies
        )
        
        return jsonify({
            "type": "success",
            "msg": "Book created successfully"
         }), 201

    except ValueError as e:
        return jsonify({"type": "error", "msg": str(e)}), 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"type": "error", "msg": str(e)}), 500

# get all books for admin
@books_routes.route("/admin")
def books_for_admin():
    service = book_service(db)

    books = service.get_all_for_admin()

    return jsonify([b.to_json() for b in books])

# get all books (paginated)
@books_routes.route("/all", methods=["GET"])
def get_books():
        try:
            service = book_service(db)
            
            # pagination query
            page = request.args.get("page", type=int)
            per_page = request.args.get("per_page", default=8, type=int)

            # search query
            q = request.args.get("q", type=str)

            books = service.get_all_books(
                page=page,
                per_page=per_page,
                q=q
            )
            
            # with pagination
            if page:
                 return jsonify({
                     "current_page": books.page,
                     "items_per_page": books.per_page,
                     "total_items": books.total,
                     "total_pages": books.pages,
                     "books": [b.to_json() for b in books.items]
                 }), 200
            
            # without pagintation
            return jsonify([
                {
                "id": book.id,
                "isbn": book.isbn,
                "title": book.title,
                "subtitle": book.subtitle,
                "author": book.author,
                "page_count": book.page_count,
                "language": book.language,
                "book_img": book.book_img,
                "description": book.description,
                "publisher": book.publisher,
                "published_at": book.published_at,
                "total_copies": book.total_copies,
                "status": "available" if book.total_copies else "unavailable"
                }
                for book in books
            ]), 200
        
        except ValueError as e:
            return jsonify({"type": "error", "msg": str(e)}), 400
        except Exception as e:
            return jsonify({"type": "error", "msg": str(e)}), 500

# get by id
@books_routes.route("/<int:id>", methods=["GET"])
def get_book_by_id(id):
    try:
        service = book_service(db)
        book = service.get_by_id(id)
        return jsonify(book.to_json()), 200

    except ValueError as e:
            return jsonify({"type": "error", "msg": str(e)}), 400
    except Exception as e:
        return jsonify({"type": "error", "msg": str(e)}), 500

# get by title
@books_routes.route("/<string:title>", methods=["GET"])
def get_book_by_title(title):
    try:
        service = book_service(db)
        book = service.get_by_title(title)
        return jsonify(book.to_json()), 200 

    except ValueError as e:
        return jsonify({"type": "error", "msg": str(e)}), 400
    except Exception as e:
        return jsonify({"type": "error", "msg": str(e)}), 500

# update by id
@books_routes.route("/<int:id>", methods=["PATCH"])
@admin_required
def update_book(id):
    try:
        service = book_service(db)
        updates = {}

        def add_field(key, cast=None):
            value = request.form.get(key)
            if value is not None and value != "":
                updates[key] = cast(value) if cast else value

        add_field("isbn")
        add_field("title")
        add_field("subtitle")
        add_field("author")
        add_field("page_count", int)
        add_field("language")
        add_field("publisher")
        add_field("published_at")
        add_field("total_copies", int)
        add_field("description")

        book_img = request.files.get("book_img")

        IMAGES_FOLDER = os.path.join("app/static/assets/images")
        
        img_name = secure_filename(book_img.filename)
        book_img.save(os.path.join(IMAGES_FOLDER, img_name))

        if not updates:
            return jsonify({
                "type": "error",
                "msg": "No fields provided to update"
            }), 400

        service.update_book_by_id(id, updates)
        
        return jsonify({"type": "success","msg": "book updated"}), 200
    
    except ValueError as e:
        return jsonify({"type": "error", "msg": str(e)}), 400
    except Exception as e:
        return jsonify({"type": "error", "msg": str(e)}), 500

# delete by id
@books_routes.route("/<int:id>", methods=["DELETE"])
@admin_required
def delete_book(id):
    service = book_service(db)
    try:
        service.delete_book(id)
        return jsonify({"type": "success", "msg": "book deleted"}), 200
    
    except ValueError:
        return jsonify({"type": "error", "msg": "book not found"}), 404
    except Exception as e:
         return jsonify({"type":"error", "msg": str(e)}), 500