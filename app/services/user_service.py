from ..repositories.users_repository import UsersRepository
from werkzeug.security import check_password_hash, generate_password_hash
from email_validator import validate_email, EmailNotValidError

class UserService:
    def __init__(self, repo: UsersRepository):
        self.repo = repo

    def create_new_user(self, username, email, password):
        if not username:
            raise ValueError("Username is required")
        
        if not email:
            raise ValueError("Email is required")
        
        if not password:
            raise ValueError("Password is required")
        
        if len(username) < 3:
            raise ValueError("Username must be at least 3 characters")
        
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters")
        
        try:
            validated = validate_email(email, check_deliverability=False)
            normalized_email = validated.normalized
        
        except EmailNotValidError as e:
            raise ValueError(str(e))
        
        username_exist = self.repo.by_username(username=username)
        email_exist = self.repo.by_email(email=email)
        
        if username_exist:
            raise ValueError("Username already exists!")
        
        if email_exist:
            raise ValueError("Email already exists")

        return self.repo.create(
            username=username,
            email=normalized_email,
            password=generate_password_hash(password)
        )
    
    def get_or_create_google_user(self, email, username):
        user = self.repo.by_email(email=email)

        if user:
            return user
        
        return self.repo.create(
            username=username,
            email=email,
            password=None
        )

    # get all
    def get_all_users(self):
        return self.repo.all()
    
    # get by id
    def get_user_by_id(self, id):
        user = self.repo.by_id(id=id)

        if not user:
            raise ValueError("User not found")
        
        return user
    
    # get by username
    def get_user_by_username(self, username):
        user = self.repo.by_username(username=username)

        if not username:
            raise ValueError("User not found")
        
        return user
    
    # get by email
    def get_user_by_email(self, email):
        user = self.repo.by_email(email=email)

        if not user:
            raise ValueError("User not found")
        
        return user
    
    def update_by_id(self, user_id: int, updates: dict):
        user = self.repo.by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        if not updates:
            raise ValueError("No updates provided")
        
        return self.repo.update(user_id=user_id, updates=updates)
    
    def update_password(self, user_id, current_pass, new_pass, confirm_pass):
        user = self.repo.by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if current_pass and new_pass and confirm_pass:
            if not check_password_hash(user.password, current_pass):
                raise ValueError("Invalid password for the user")
            
            if new_pass != confirm_pass:
                raise ValueError("Unmatched passwords")
        else:
            raise ValueError("Password cannot be empty")
        
        # if passed hash and update password
        hashed = generate_password_hash(new_pass)

        return self.repo.update(
            user_id=user_id,
            updates={"password": hashed}
        )

    # delete by id
    def delete_user_by_id(self, id):
        user = self.repo.by_id(id)

        if not user:
            raise ValueError("User not found")

        self.repo.delete(id=id)
        return True

    # validate user's credentials
    def check_user_credentials(self, username_or_email, password):
        # if user doesn't enter username and email
        if not username_or_email:
            raise ValueError("Please enter your username or email address")
        
       # check username then email
        user = self.repo.by_username(username=username_or_email)
        if not user:
            user = self.repo.by_email(email=username_or_email)

        # check if exist
        if not user:
            raise ValueError(f"No account found for user: {username_or_email}")
        
        # check password for username
        if not check_password_hash(user.password, password):
            raise ValueError(f"Wrong password for user '{username_or_email}'")
            
        return user

        