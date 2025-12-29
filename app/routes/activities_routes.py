from .dependencies.deps import activity_service, db
from flask import Blueprint, jsonify, request
import traceback

activities_routes = Blueprint("activities_routes", __name__)

@activities_routes.route("/all")
def get_all_activities():
    service = activity_service(db)
    
    try:
        acts = service.get_all()
        return jsonify([a.to_json() for a in acts]), 200
    
    except ValueError:
        traceback.print_exc()
        return jsonify({"type": "error", "msg": "Value error"}), 400
    except Exception:
        traceback.print_exc()
        return jsonify({"type": "error", "msg": "Internal server error"}), 500

@activities_routes.route("/<int:id>")
def get_activiy_by_id(id):
    service = activity_service(db)

    try:
        act = service.get_by_id(id=id)
        return jsonify({"activity": act.to_json()}), 200
    
    except ValueError:
        return jsonify({"type": "error", "msg": "Value error"}), 400
    except Exception:
        return jsonify({"type": "error", "msg": "Internal server error"}), 500

@activities_routes.route("/limit")
def get_activities_by_limit():
    service = activity_service(db)

    try:
        acts = service.get_by_limit()
        return jsonify([a.to_json() for a in acts])

    except ValueError:
        return jsonify({"type": "error", "msg": "Value error"}), 400
    except Exception:
        return jsonify({"type": "error", "msg": "Internal server error"}), 500
    
@activities_routes.route("/recent")
def get_recent_activities():
    service = activity_service(db)

    try:
        acts = service.get_latest_by_limit()
        return jsonify([a.to_json() for a in acts])
    
    except ValueError:
        return jsonify({"type": "error", "msg": "Value error"}), 400
    except Exception:
        return jsonify({"type": "error", "msg": "Internal server error"}), 500

@activities_routes.route("/<int:id>/delete", methods=["DELETE"])
def delete_activity(id):
    service = activity_service(db)

    try:
        service.delete_activity(id=id)
        return jsonify({"type": "success", "msg": "Activity deleted"}), 200
    
    except ValueError:
        return jsonify({"type": "error", "msg": "Value error"}), 400
    except Exception:
        return jsonify({"type": "error", "msg": "Internal server error"}), 500
