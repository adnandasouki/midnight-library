from .dependencies.deps import user_service, token_required, optional_auth, db, activity_service
from flask import Blueprint, current_app, redirect, session, request, jsonify, g
from datetime import datetime, timezone, timedelta
import jwt

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token

auth_routes = Blueprint("auth_routes", __name__)

# Sign up
@auth_routes.route("/signup", methods=["POST"])
def signup():
    try:
        # SERVICES
        users = user_service(db)
        activities = activity_service(db)
        
        # SIGN UP FORM DATA
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")

        # VALIDATION
        new_user = users.create_new_user(
            username=username,
            email=email,
            password=password
        )

        # REGISTER ACTIVITY
        activities.create_activity(
            activity_type="REGISTER",
            user_id=new_user.id,
        )

        # TOKEN
        payload = {
            "user_id": new_user.id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=2),
            "iat": datetime.now(timezone.utc),
            "iss": "lms-api"
        }
        
        token = jwt.encode(
            payload=payload, 
            key=current_app.config['SECRET_KEY'], 
            algorithm="HS256")
        
        # HTTP RESPONSE BODY (JSON)
        response = jsonify({
            "user": {
                "user_id": new_user.id,
                "username": new_user.username,
            }
        })

        # HTTP RESPONSE HEADER (Set-Cookie)
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60 * 60 * 2
        )

        # HTTP RESPONSE + STATUS CODE
        return response, 201
    
    except ValueError as e:
        return jsonify({"type": "error", "error": str(e)}), 400
    
    except Exception:
        import traceback
        traceback.print_exc()
        current_app.logger.exception("Unexpected error during user creation")
        return jsonify({
            "type": "error",
            "error": "Internal server error"
        }), 500

# Sign in
@auth_routes.route("/signin", methods=["POST"])
def signin():
    try:
        # SERVICE
        service = user_service(db)

        # SIGN IN FORM DATA
        username_or_email = request.form.get("username-or-email")
        password = request.form.get("password")
        
        # VALIDATION
        user = service.check_user_credentials(
            username_or_email=username_or_email,
            password=password
        )

        # TOKEN
        payload = {
            "user_id": user.id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=2),
            "iat": datetime.now(timezone.utc),
            "iss": "lms-api"
        }
        
        token = jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        # HTTP RESPONSE BODY (JSON)
        response = jsonify({
            "user": {
                "id": user.id,
                "username": user.username,
                "is_admin": user.is_admin
            }
        })

        # HTTP RESPONSE HEADER (Set-Cookie)
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60 * 60 * 2
        )

        # HTTP RESPONSE + STATUS CODE
        return response, 200

    except ValueError as e:
        import traceback
        traceback.print_exc()
        return jsonify({"type": "error", "msg": str(e)}), 400
    
    except Exception:
        import traceback
        traceback.print_exc()
        current_app.logger.exception("Unexpected error during signing in")
        return jsonify({
            "type": "Error",
            "msg": "Internal server error"
        }), 500
    
# Google oath signin redirect
@auth_routes.route("/google", methods=["GET"])
def google_signin():
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": current_app.config["GOOGLE_CLIENT_ID"],
                "client_secret": current_app.config["GOOGLE_CLIENT_SECRET"],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=["openid", "email", "profile"],
        redirect_uri=current_app.config["GOOGLE_REDIRECT_URI"]
    )

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true"
    )

    return redirect(authorization_url)

# Sign in with Google
@auth_routes.route("/google/callback")
def google_signin_callback():
    try:
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": current_app.config["GOOGLE_CLIENT_ID"],
                    "client_secret": current_app.config["GOOGLE_CLIENT_SECRET"],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=[
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile"
            ],
            state=session.get("google_oauth_state"),
            redirect_uri=current_app.config["GOOGLE_REDIRECT_URI"]
        )

        flow.fetch_token(authorization_response=request.url)

        credentials = flow.credentials

        idinfo = id_token.verify_oauth2_token(
            credentials.id_token,
            Request(),
            current_app.config["GOOGLE_CLIENT_ID"]
        )

        email = idinfo["email"]
        username = idinfo.get("name", email.split("@")[0])

        service = user_service(db)
        user = service.get_or_create_google_user(
            email=email,
            username=username
        )

        payload = {
            "user_id": user.id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=2),
            "iat": datetime.now(timezone.utc),
            "iss": "lms-api"
        }

        token = jwt.encode(
            payload,
            current_app.config["SECRET_KEY"],
            algorithm="HS256",
        )
    
        response = redirect("http://127.0.0.1:5000/")

        response.set_cookie(
            "access_token",
            token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=7200
        )

        return response, 201
    
    except Exception:
        import traceback
        traceback.print_exc()
        return redirect("http://127.0.0.1:5000/signup?error=google_auth_failed")

# Sign out
@auth_routes.route("/signout", methods=["POST"])
def signout():
    response = jsonify({"msg": "Signed out"})
    response.delete_cookie("access_token")
    return response

# Check if authenticated
@auth_routes.route("/me")
@token_required
def me():
    return jsonify({
        "authenticated": True,
        "user": request.user,
    })

@auth_routes.route("/state")
@optional_auth
def get_auth_state():
    if not g.user:
        return jsonify({
            "authenticated": False,
            "user": None
        })
    
    return jsonify({
        "authenticated": True,
        "user": g.user
    })
