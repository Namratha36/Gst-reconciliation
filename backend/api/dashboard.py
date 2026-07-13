from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.postgres import get_db
from core.dependencies import get_current_user
from models.user import User
from models.case import Case
from models.action import Action
from models.alert import Alert
from models.vendor import Vendor

router = APIRouter()

@router.get("")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org_id = current_user.organization_id

    # Pull LIVE counts from database
    total_cases = db.query(Case).filter(Case.organization_id == org_id, Case.archived_at == None).count()
    critical_cases = db.query(Case).filter(Case.organization_id == org_id, Case.priority == "Critical", Case.archived_at == None).count()
    total_actions = db.query(Action).filter(Action.organization_id == org_id, Action.archived_at == None).count()
    pending_actions = db.query(Action).filter(Action.organization_id == org_id, Action.status.in_(["Queued", "Needs Approval"]), Action.archived_at == None).count()
    vendors = db.query(Vendor).filter(Vendor.organization_id == org_id).all()
    high_risk_vendors = sum(1 for v in vendors if v.risk_tier in ["High", "Critical"])
    total_itc = sum(float(v.itc_exposure or 0) for v in vendors)
    recovered = total_itc * 0.172  # 17.2% recovered simulation

    # Fetch current action IDs and alert IDs for dashboard
    current_action_ids = [a.id for a in db.query(Action).filter(
        Action.organization_id == org_id, Action.status.in_(["Running", "Needs Approval"]), Action.archived_at == None
    ).limit(5).all()]
    recent_alert_ids = [a.id for a in db.query(Alert).filter(
        Alert.organization_id == org_id, Alert.archived_at == None
    ).order_by(Alert.created_at.desc()).limit(5).all()]

    return {
        "mission": {
            "id": "MIS-001",
            "title": "Recover blocked ITC before July 20 filing",
            "targetDate": "2026-07-20",
            "itcTarget": max(int(total_itc), 1860000),
            "recoveredToday": int(recovered)
        },
        "metrics": [
            {
                "id": "MET-CASES",
                "title": "Active Cases",
                "value": str(total_cases),
                "trend": f"{critical_cases} critical priority",
                "severity": "critical" if critical_cases > 0 else "normal"
            },
            {
                "id": "MET-ACTIONS",
                "title": "Pending Actions",
                "value": str(pending_actions),
                "trend": f"{total_actions} total actions",
                "severity": "warning" if pending_actions > 0 else "normal"
            },
            {
                "id": "MET-VENDORS",
                "title": "High Risk Vendors",
                "value": str(high_risk_vendors),
                "trend": f"{len(vendors)} total vendors tracked",
                "severity": "critical" if high_risk_vendors > 0 else "normal"
            }
        ],
        "currentActionIds": current_action_ids,
        "recentAlertIds": recent_alert_ids
    }
