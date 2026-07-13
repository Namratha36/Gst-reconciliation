from datetime import datetime
from sqlalchemy.orm import Session
from models.action import Action, ActionLog
from models.case import Case
from services import approval_engine

def create_action_for_case(db: Session, case: Case) -> Action:
    title = "Review Mismatch"
    sensitive = False
    
    if case.priority == "Critical":
        title = "Escalate to Finance Manager"
        sensitive = True
    elif case.mismatch_type == "Missing":
        title = "Draft Vendor Notice"
        sensitive = True
        
    action = Action(
        organization_id=case.organization_id,
        case_id=case.id,
        title=title,
        status="Needs Approval" if sensitive else "Pending",
        owner_user_id=case.owner_user_id,
        owner_label=case.owner_label,
        sensitive=sensitive
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    
    log = ActionLog(
        action_id=action.id,
        actor="System",
        message="Action created based on case routing rules.",
        at=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    
    if sensitive:
        approval_engine.create_approval_request(db, case, action)
        
    return action
