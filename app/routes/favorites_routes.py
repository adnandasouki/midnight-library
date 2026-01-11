from flask import Blueprint, request, g, jsonify
from traceback import print_exc

from .dependencies.deps import favorite_service, signin_required, db

favorites_routes = Blueprint("favorites_routes", __name__)

@favorites_routes.route("/create", methods=["POST"])
@signin_required
def create_favorite():
    try:
        book_id = request.json.get("book_id")
        user_id = g.current_user_id
        service = favorite_service(db)
        service.create_new_favorite(user_id, book_id)

        if not book_id:
            return jsonify({
                "type": "error",
                "msg": "book_id is missing"
            }), 400

        return jsonify({
            "type": "success",
            "msg": "Added to favorites successfully"
        }), 201

    except ValueError as e:
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 400
    except Exception:
        print_exc()
        return jsonify({
            "type": "error",
            "msg": "Internal server error"
        }), 500

@favorites_routes.route("/all", methods=["GET"])
@signin_required
def get_favorites():
    service = favorite_service(db)
    favorites = service.get_all_favorites()

    return jsonify([f.to_json() for f in favorites]), 200

@favorites_routes.route("/user", methods=["GET"])
@signin_required
def favorites_by_user():
    user_id = g.current_user_id
    service = favorite_service(db)
    favorites = service.get_favorites_by_user(user_id)

    return jsonify([f.to_json() for f in favorites]), 200

@favorites_routes.route("/delete", methods=["DELETE"])
@signin_required
def delete_favorite():
    try:
        fav_id = request.json.get("fav_id")
        service = favorite_service(db)

        if not fav_id:
            return jsonify({
                "type": "error",
                "msg": "fav_id is missing"
            }), 400

        service.delete_favorite(fav_id)

        return jsonify({
            "type": "success",
            "msg": "Removed from favorites successfully"
        }), 200

    except ValueError as e:
        return jsonify({
            "type": "error",
            "msg": str(e)
        }), 400
    except Exception:
        print_exc()
        return jsonify({
            "type": "error",
            "msg": "Internal server error"
        }), 500