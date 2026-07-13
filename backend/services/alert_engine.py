from datetime import datetime
from sqlalchemy.orm import Session
from models.alert import Alert

def create_alert(db: Session, org_id: str, severity: str, title: str, message: str, entity_id: str, entity_type: str) -> Alert:
    alert = Alert(
        organization_id=org_id,
        severity=severity,
        title=title,
        message=message,
        entity_id=entity_id,
        entity_type=entity_type,
        created_at=datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
