from flask import Blueprint, jsonify, request, g

from .dependencies.deps import user_service, token_required, borrowing_service, favorite_service, db
from .dependencies.deps import admin_required, signin_required

user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/current")
@token_required
def get_current_user():
    user_id = request.user["user_id"]
    users = user_service(db)
    user = users.get_user_by_id(user_id)
    return jsonify(user.to_json())

@user_routes.route("/<int:id>")
def get_user_by_id(id):
    users = user_service(db)
    user = users.get_user_by_id(id=id)
    return jsonify(user.to_json())

@user_routes.route("/profile", methods=["GET"])
@signin_required
def profile():
    user_id = g.current_user_id

    users = user_service(db)
    user = users.get_user_by_id(user_id)
    
    borrowings = borrowing_service(db)
    all_borrowings = borrowings.get_borrowings_by_user(user_id)

    fav = favorite_service(db)
    favorites = fav.get_favorites_by_user(user_id)


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
        ],
        "favorites": [
            {
                "id": f.id,
                "title": f.book.title,
            }
            for f in favorites
        ]
    }), 200

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

@user_routes.route("/update", methods=["PATCH"])
@signin_required
def update_user():
    try:
        user_id = g.current_user_id
        service = user_service(db)

        updates = {}

        username = request.form.get("username")
        if username:
            updates["username"] = username

        email = request.form.get("email")
        if email:
            updates["email"] = email

        service.update_by_id(user_id=user_id, updates=updates)

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
        from traceback import print_exc
        print_exc()
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 500
    
@user_routes.route("/update/password", methods=["PATCH"])
@signin_required
def update_user_password():
    users = user_service(db)
    user_id = g.current_user_id
    
    try:
        current_pass = request.form.get("current-password")
        new_pass = request.form.get("new-password")
        confirm_pass = request.form.get("confirm-password")

        users.update_password(
            user_id=user_id,
            current_pass=current_pass,
            new_pass=new_pass,
            confirm_pass=confirm_pass
        )

        return jsonify({
            "type": "success",
            "msg": "Password updated successfuly"
        }), 200
    
    except ValueError as e:
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 400
    
    except Exception as e:
        from traceback import print_exc
        print_exc()
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 500

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