from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(user_id: str, type: str, payload: dict, db: Session) -> Notification:
    """Add a Notification to the session. Caller is responsible for commit."""
    notif = Notification(user_id=user_id, type=type, payload=payload)
    db.add(notif)
    return notif
