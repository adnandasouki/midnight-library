from .dependencies.deps import user_service, token_required, borrowing_service, db
from .dependencies.deps import admin_required, signin_required
from flask import Blueprint, jsonify, request, g

user_routes = Blueprint("user_routes", __name__)

# Get user by id
@user_routes.route("/current")
@token_required
def get_current_user():
    user_id = request.user["user_id"]
    users = user_service(db)
    user = users.get_user_by_id(user_id)
    return jsonify(user.to_json())

# Profile data
@user_routes.route("/profile", methods=["GET"])
@signin_required
def profile():
    user_id = g.current_user_id

    users = user_service(db)
    user = users.get_user_by_id(user_id)
    
    borrowings = borrowing_service(db)
    all_borrowings = borrowings.get_borrowings_by_user(user_id)

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "joined_date": user.created_at.isoformat(),
        "all_borrowings": [
            {
                "id": b.id,
                "book_id": b.book.id,
                "title": b.book.title,
                "author": b.book.author,
                "borrowed_at": b.borrowed_at,
                "due_at": b.due_at,
                "returned_at": b.returned_at if b.returned_at else None,
                "status": borrowings.get_borrowing_status(b.id)
            }
            for b in all_borrowings
        ]
    }), 200

# Create user with admin
@user_routes.route("/create-with-admin", methods=["POST"])
@admin_required
def create_with_admin():
    try:
        service = user_service(db)

        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")

        service.create_new_user(
            username=username,
            email=email,
            password=password
        )

        return jsonify({
            "type": "success",
            "msg": "User created!"
        }), 201
    
    except ValueError as e:
        return jsonify({
            "type": "error",
            "msg": str(e)
        })
    except Exception as e:
        return jsonify({
            "type": "error",
            "msg": str(e)
        })

# Get all
@user_routes.route("/all", methods=["GET"])
def all_users():
    '''sends a list of all users to the frontend'''
    try:
        s = user_service(db)
        users = s.get_all_users()
        return jsonify([
            {
                "date_joined": user.created_at,
                "email": user.email,
                "is_admin": user.is_admin,
                "username": user.username,
                "id": user.id
            }
            for user in users
        ]), 200
    
    except ValueError as e:
        return jsonify({"type": "error", "msg": str(e)}), 400
    except Exception as e:
        return jsonify({"type": "error", "msg": str(e)}), 500

# Update
@user_routes.route("/update/<int:id>", methods=["PATCH"])
def update_user(id):
    try:
        service = user_service(db)

        updates = {}

        username = request.form.get("username")
        if username:
            updates["username"] = username

        email = request.form.get("email")
        if email:
            updates["email"] = email

        service.update_by_id(user_id=id, updates=updates)

        return jsonify({
            "type": "success",
            "msg": "User updated!"
        }), 200

    except ValueError as e:
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 500

# Delete
@user_routes.route("/delete/<int:id>", methods=["DELETE"])
def delete_user(id):
    try:
        service = user_service(db)
        deleted = service.delete_user_by_id(id)

        if not deleted:
            return jsonify({
                "type": "error",
                "msg": "Failed to delete user"
            }), 409

        return jsonify({
            "type": "success",
            "msg": "User deleted!"
        }), 200
    
    except ValueError as e:
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 500