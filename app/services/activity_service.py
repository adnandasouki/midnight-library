from ..repositories.activities_repository import ActivitiesRepository

class ActivityService:
    def __init__(self, repo: ActivitiesRepository):
        self.repo = repo

    def create_activity(self, activity_type, user_id, target_id=None):
        return self.repo.create(
            activity_type=activity_type,
            user_id=user_id,
            target_id=target_id
        )

    def get_all(self):
        return self.repo.all()
    
    def get_by_id(self, id):
        act = self.repo.by_id(id=id)
        if not act:
            raise ValueError("Activity not found")
        
        return act
    
    def get_by_limit(self, limit=5):
        if limit < 0:
            raise ValueError("Limit cannot be negative")
        
        return self.repo.by_limit(limit=limit)
    
    def get_latest_by_limit(self, limit=6):
        if limit < 0:
            raise ValueError("Limit cannot be negative")

        return self.repo.latest_by_limit(limit)
    
    def delete_activity(self, id):
        act = self.repo.by_id(id=id)
        if not act:
            raise ValueError("Activity not found")
        
        self.repo.delete(id=id)        
        return True
            
    def delete_all_by_user(self, user_id):
        self.repo.delete_by_user(user_id)
        return True