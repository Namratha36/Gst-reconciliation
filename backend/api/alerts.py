from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.postgres import get_db
from models.alert import Alert
from core.dependencies import get_current_user
from models.user import User
from datetime import datetime

router = APIRouter()

@router.get("")
def get_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(
        Alert.organization_id == current_user.organization_id,
        Alert.archived_at == None
    ).order_by(Alert.created_at.desc()).all()
    return [{
        "id": a.id,
        "severity": a.severity,
        "title": a.title,
        "message": a.message,
        "entityId": a.entity_id,
        "entityType": a.entity_type,
        "read": a.read,
        "createdAt": a.created_at
    } for a in alerts]

@router.patch("/{alert_id}/read")
def mark_alert_read(alert_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.organization_id == current_user.organization_id).first()
    if alert:
        alert.read = True
        db.commit()
    return {"id": alert_id, "read": True}

@router.delete("/{alert_id}")
def delete_alert(alert_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.organization_id == current_user.organization_id).first()
    if alert:
        alert.archived_at = datetime.utcnow()
        db.commit()
    return {"deleted": True, "alertId": alert_id}

@router.post("/mark-read")
def mark_all_read(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert_ids = payload.get("alertIds", [])
    alerts = db.query(Alert).filter(
        Alert.id.in_(alert_ids),
        Alert.organization_id == current_user.organization_id
    ).all()
    for a in alerts:
        a.read = True
    db.commit()
    return {"marked": len(alerts)}

@router.post("/delete")
def bulk_delete_alerts(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert_ids = payload.get("alertIds", [])
    now = datetime.utcnow()
    alerts = db.query(Alert).filter(
        Alert.id.in_(alert_ids),
        Alert.organization_id == current_user.organization_id
    ).all()
    for a in alerts:
        a.archived_at = now
    db.commit()
    return {"deleted": len(alerts)}

@router.delete("")
def clear_all_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(
        Alert.organization_id == current_user.organization_id,
        Alert.archived_at == None
    ).all()
    now = datetime.utcnow()
    for a in alerts:
        a.archived_at = now
    db.commit()
    return {"cleared": len(alerts)}
