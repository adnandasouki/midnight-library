from datetime import datetime, timedelta, timezone
from flask_sqlalchemy import SQLAlchemy
from ..models import Activity

class ActivitiesRepository:
    def __init__(self, db: SQLAlchemy):
        self.db = db

    def create(self, activity_type, user_id, target_id):
        new = Activity(
            activity_type=activity_type,
            user_id=user_id,
            target_id=target_id
        )
        self.db.session.commit()

        self.db.session.add(new)        
        return new
    
    # get all activities
    def all(self):
        return (
            Activity.query
            .order_by(Activity.created_at.desc())
            .all()
        )
    
    # get acitivity by id
    def by_id(self, id):
        return Activity.query.get(id)
    
    # get activities by a specific limit
    def by_limit(self, limit):
        return (
            Activity.query
            .order_by(Activity.created_at.desc())
            .limit(limit=limit)
            .all()
        )
    
    # get activities in the last 24 hours by a specific limit
    def latest_by_limit(self, limit):
        since = datetime.now(timezone.utc) - timedelta(hours=24)

        return (
            Activity.query\
            .filter(Activity.created_at >= since)\
            .order_by(Activity.created_at.desc())\
            .limit(limit=limit)\
            .all()
        )
        
    def delete(self, id):
        query = Activity.query.get(id)

        try:
            self.db.session.delete(query)
            self.db.session.commit()
            return True
        except:
            return False