from flask import Blueprint, jsonify, request, g
from datetime import datetime, timezone, timedelta
import traceback

from .dependencies.deps import borrowing_service, signin_required, activity_service
from ..extentions import db

borrowings_routes = Blueprint("borrowings_routes", __name__)

@borrowings_routes.route("/borrow", methods=["POST"])
@signin_required
def borrow_book():
    try:
        # user id
        user_id = g.current_user_id

        # request body
        data = request.get_json()
        
        # services
        borrowings = borrowing_service(db)
        activities = activity_service(db)

        # create borrowing
        borrowings.create_new_borrowing(
            user_id=user_id,
            book_id=data["book_id"],
            due_at=datetime.now(timezone.utc) + timedelta(days=1)
        )
        
        # create activity if book successfully borrowed
        activities.create_activity(
            activity_type="BORROW_BOOK",
            user_id=user_id,
            target_id=data["book_id"]
        )

        return jsonify({
            "type": "success",
            "msg": "You borrowed the book successfully!"
        }), 201
    
    except ValueError as e:
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 400
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 500

@borrowings_routes.route("/return/<int:borrowing_id>", methods=["PUT"])
@signin_required
def return_book(borrowing_id):
    try:
        # get user id
        user_id = g.current_user_id
        
        # request body
        data = request.get_json()
        borrowing_id = data["borrowing_id"]

        # services
        borrowings = borrowing_service(db)
        activities = activity_service(db)

        # borrowing
        borrowing = borrowings.get_borrowing_by_id(borrowing_id)

        # return book
        borrowings.return_borrowed_book(borrowing_id=borrowing_id)

        # register activity
        activities.create_activity(
            activity_type="RETURN_BOOK",
            user_id=user_id,
            target_id=borrowing.book_id
        )

        return jsonify({
            "type": "success",
            "msg": "Book returned!"
        }), 200

    except ValueError as e:
        traceback.print_exc()
        return jsonify({"type": "error", "msg": str(e)}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"type": "error", "msg": str(e)}), 500

@borrowings_routes.route("/all", methods=["GET"])
def get_all_borrowings():
    try:
        service = borrowing_service(db)
        borrowings = service.get_all()

        return jsonify([
            {
                "id": b.id,
                "user": b.user.username,
                "book": b.book.title,
                "borrowed_at": b.borrowed_at,
                "due_at": b.due_at,
                "status": service.get_borrowing_status(b.id),
                "returned_at": b.returned_at if b.returned_at else None
            }
            for b in borrowings
        ]), 200
    
    except ValueError as e:
        return jsonify({"type": "error", "msg": str(e)}), 400
    
    except Exception as e:
        return jsonify({"type": "error", "msg": str(e)}), 500


@borrowings_routes.route("/active", methods=["GET"])
def get_active_borrowings():
    try:
        service = borrowing_service(db)
        borrowings = service.get_active()
        
        return jsonify([
            {
                "id": borrowing.id,
                "user": borrowing.user.username,
                "book": borrowing.book.title,
                "borrowed_at": borrowing.borrowed_at,
                "due_at": borrowing.due_at,
                "status": "Active"
            }
            for borrowing in borrowings
        ]), 200
    
    except ValueError as e:
        return jsonify({"type": "error", "msg": str(e)}), 400
    
    except Exception as e:
        return jsonify({"type": "error", "msg": str(e)}), 500
    
@borrowings_routes.route("/returned", methods=["GET"])
def get_returned_borrowings():
    try:
        service = borrowing_service(db)
        borrowings = service.get_returned()
        
        return jsonify([
            {
                "id": borrowing.id,
                "user": borrowing.user.username,
                "book": borrowing.book.title,
                "borrowed_at": borrowing.borrowed_at,
                "due_at": borrowing.due_at,
                "status": "Returned",
                "returned_at": borrowing.returned_at
            }
            for borrowing in borrowings
        ]), 200
    
    except ValueError as e:
        return jsonify({"type": "error", "msg": str(e)}), 400
    except Exception as e:
        return jsonify({"type": "error", "msg": str(e)}), 500
    
@borrowings_routes.route("/overdue-borrowings")
def get_overdue_borrowings():
    try:
        service = borrowing_service(db)
        overdues = service.get_overdue()
        return jsonify([b.to_json() for b in overdues]), 200
    
    except ValueError as e:
        return jsonify({"type": "error", "msg": str(e)}), 400
    except Exception as e:
        return jsonify({"type": "error", "msg": str(e)}), 500

@borrowings_routes.route("/<user_id>")
def borrowings_by_user(user_id):
    try:
        service = borrowing_service(db)
        borrowings = service.get_borrowings_by_user(user_id)
        return jsonify([b.to_json() for b in borrowings]), 200
    
    except ValueError as e:
        return jsonify({"type": "error", "msg": str(e)}), 400
    except Exception as e:
        return jsonify({"type": "error", "msg": str(e)}), 500

@borrowings_routes.route("/update-borrowing-due-date", methods=["PUT"])
def update_due_date():
    try:
        data = request.get_json()
        service = borrowing_service(db)

        borrowing_id = data['borrowing_id']
        new_due_date = data['new_due_at']

        updated = service.update_borrowing_due_date(id=borrowing_id, new_due_date=new_due_date)
        return jsonify({
            "message": f"due date updated to {new_due_date}",
            "borrowing": updated.to_json()
        }), 200
    
    except ValueError as e:
        return jsonify({"type": "error", "msg": str(e)}), 400
    except Exception as e:
        return jsonify({"type": "error", "msg": str(e)}), 500