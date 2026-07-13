from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.case import Case, CaseInvoiceLink, CaseTimeline
from models.reconciliation import ReconciliationResult
from models.user import User
from services import action_engine

def create_case_from_exception(db: Session, exception: ReconciliationResult, current_user: User) -> Case:
    # Basic Case Generation
    title = f"GSTR-1 filing {exception.exception_type.lower()}"
    if exception.exception_type == "Value Mismatch":
        title = "Invoice value mismatch detected"
        
    case = Case(
        organization_id=exception.organization_id,
        vendor_id=exception.vendor_id,
        title=title,
        mismatch_type=exception.exception_type,
        itc_at_risk=exception.impacted_amount,
        impact="Severe Exposure" if exception.risk_grade == "Critical" else "Moderate",
        priority=exception.risk_grade,
        deadline=datetime.utcnow() + timedelta(days=5),
        owner_user_id=current_user.id,
        owner_label=current_user.name,
        status="Escalated" if exception.risk_grade == "Critical" else "Queued",
        confidence=95
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    
    # Update Exception with Case ID
    exception.case_id = case.id
    
    # Link Invoice
    if exception.invoice_id:
        link = CaseInvoiceLink(case_id=case.id, invoice_id=exception.invoice_id)
        db.add(link)
        
    # Timeline
    timeline = CaseTimeline(
        case_id=case.id,
        actor="Reconciliation AI",
        message=f"Case automatically created for {exception.exception_type}",
        at=datetime.utcnow()
    )
    db.add(timeline)
    db.commit()
    
    # Trigger Action Workflow
    action = action_engine.create_action_for_case(db, case)
    case.next_action_id = action.id
    db.commit()
    
    return case
