from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database.postgres import get_db
from models.approval import Approval
from schemas.case import ApprovalResponse
from core.dependencies import get_current_user
from models.user import User

router = APIRouter()

@router.get("", response_model=List[ApprovalResponse])
def get_approvals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    approvals = db.query(Approval).filter(Approval.organization_id == current_user.organization_id).all()
    
    response = []
    for a in approvals:
        response.append(ApprovalResponse(
            id=a.id,
            caseId=a.case_id,
            actionId=a.action_id,
            requester=a.requester,
            status=a.status,
            aiReasoning=a.ai_reasoning,
            confidence=a.confidence,
            payloadPreview=a.payload_preview,
            createdAt=a.created_at
        ))
    return response

from pydantic import BaseModel
class ApprovalDecisionRequest(BaseModel):
    decision: str

@router.post("/{approval_id}/decision", response_model=ApprovalResponse)
def decide_approval(approval_id: str, request: ApprovalDecisionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    approval = db.query(Approval).filter(Approval.id == approval_id, Approval.organization_id == current_user.organization_id).first()
    if approval:
        approval.status = "Approved" if request.decision == "Approve" else "Rejected"
        db.commit()
        db.refresh(approval)
    
    return ApprovalResponse(
        id=approval.id,
        caseId=approval.case_id,
        actionId=approval.action_id,
        requester=approval.requester,
        status=approval.status,
        aiReasoning=approval.ai_reasoning,
        confidence=approval.confidence,
        payloadPreview=approval.payload_preview,
        createdAt=approval.created_at
    )
