from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from database.postgres import get_db
from models.vendor import Vendor
from models.approval import Approval
from models.action import Action
from core.dependencies import get_current_user
from models.user import User

router = APIRouter()

def _vendor_dict(v: Vendor) -> dict:
    return {
        "id": v.id,
        "name": v.name,
        "gstin": v.gstin,
        "email": v.email,
        "complianceScore": v.compliance_score,
        "riskTier": v.risk_tier,
        "itcExposure": v.itc_exposure,
        "pendingCaseCount": v.pending_case_count,
        "lateFilingFrequency": v.late_filing_frequency,
        "trend": v.trend
    }

@router.get("")
def get_vendors(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vendors = db.query(Vendor).filter(Vendor.organization_id == current_user.organization_id).all()
    return [_vendor_dict(v) for v in vendors]

@router.get("/{vendor_id}")
def get_vendor(vendor_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    v = db.query(Vendor).filter(
        Vendor.id == vendor_id,
        Vendor.organization_id == current_user.organization_id
    ).first()
    if not v:
        return None
    return _vendor_dict(v)

@router.post("/{vendor_id}/notice-approval")
def create_notice_approval(vendor_id: str, payload: dict = {}, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id,
        Vendor.organization_id == current_user.organization_id
    ).first()
    if not vendor:
        return {"error": "Vendor not found"}

    # Find a related action for this vendor
    action = db.query(Action).filter(Action.organization_id == current_user.organization_id).first()
    action_id = action.id if action else str(uuid.uuid4())
    case_id = action.case_id if action else str(uuid.uuid4())

    # Create approval request for the compliance notice email
    approval = Approval(
        id=str(uuid.uuid4()),
        organization_id=current_user.organization_id,
        case_id=case_id,
        action_id=action_id,
        requester=current_user.name,
        status="Pending",
        ai_reasoning=(
            f"Compliance notice for vendor {vendor.gstin} with {vendor.risk_tier} risk tier. "
            f"ITC exposure: {vendor.itc_exposure}. Requires human approval before sending."
        ),
        confidence=88,
        payload_preview=payload.get("body", f"Send compliance email to {vendor.email or vendor.gstin} regarding GST reconciliation discrepancy."),
        created_at=datetime.utcnow()
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)

    return {
        "id": approval.id,
        "caseId": approval.case_id,
        "actionId": approval.action_id,
        "requester": approval.requester,
        "status": approval.status,
        "aiReasoning": approval.ai_reasoning,
        "confidence": approval.confidence,
        "payloadPreview": approval.payload_preview,
        "createdAt": approval.created_at,
        "timeline": []
    }
