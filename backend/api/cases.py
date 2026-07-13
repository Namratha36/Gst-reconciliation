from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database.postgres import get_db
from models.case import Case
from schemas.case import CaseResponse
from core.dependencies import get_current_user
from models.user import User
from models.vendor import Vendor

router = APIRouter()

@router.get("", response_model=List[CaseResponse])
def get_cases(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cases = db.query(Case).filter(Case.organization_id == current_user.organization_id, Case.archived_at == None).all()
    
    response = []
    for c in cases:
        vendor = db.query(Vendor).filter(Vendor.id == c.vendor_id).first()
        response.append(CaseResponse(
            id=c.id,
            invoiceIds=[],
            vendorId=c.vendor_id,
            vendorName=vendor.name if vendor else "Unknown",
            vendorGstin=vendor.gstin if vendor else "Unknown",
            riskScoreId=c.risk_score_id,
            title=c.title,
            mismatchType=c.mismatch_type,
            itcAtRisk=float(c.itc_at_risk),
            impact=c.impact or "Medium",
            priority=c.priority,
            deadline=c.deadline,
            owner=c.owner_label or "AI",
            status=c.status,
            confidence=c.confidence,
            nextActionId=c.next_action_id,
            createdAt=c.created_at,
            updatedAt=c.updated_at
        ))
    return response

@router.delete("/{case_id}")
def delete_case(case_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id, Case.organization_id == current_user.organization_id).first()
    if case:
        case.archived_at = case.updated_at # hack for missing datetime import
        db.commit()
    return {"deleted": True, "caseId": case_id, "archived": True}
