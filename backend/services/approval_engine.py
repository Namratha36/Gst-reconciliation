from datetime import datetime
from sqlalchemy.orm import Session
from models.approval import Approval, ApprovalTimeline
from models.case import Case
from models.action import Action
from services import alert_engine

def create_approval_request(db: Session, case: Case, action: Action) -> Approval:
    approval = Approval(
        organization_id=case.organization_id,
        case_id=case.id,
        action_id=action.id,
        requester="AI Copilot",
        ai_reasoning=f"High risk detected: {case.itc_at_risk} ITC at risk.",
        confidence=90,
        payload_preview=action.title
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    
    timeline = ApprovalTimeline(
        approval_id=approval.id,
        actor="System",
        message="Approval requested before executing sensitive action.",
        at=datetime.utcnow()
    )
    db.add(timeline)
    db.commit()
    
    # Emit an alert to the user
    alert_engine.create_alert(
        db, 
        case.organization_id, 
        "critical", 
        "Approval Required", 
        f"Case {case.id} requires human approval before proceeding.",
        approval.id,
        "Approval"
    )
    
    return approval
