from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CaseTimelineItem(BaseModel):
    id: str
    actor: str
    message: str
    at: datetime

class CaseResponse(BaseModel):
    id: str
    invoiceIds: List[str]
    vendorId: str
    vendorName: str
    vendorGstin: str
    riskScoreId: Optional[str]
    title: str
    mismatchType: str
    itcAtRisk: float
    impact: str
    priority: str
    deadline: Optional[datetime]
    owner: str
    status: str
    confidence: int
    nextActionId: Optional[str]
    timeline: List[CaseTimelineItem] = []
    createdAt: datetime
    updatedAt: datetime

class ActionLogItem(BaseModel):
    id: str
    actor: str
    message: str
    at: datetime

class ActionResponse(BaseModel):
    id: str
    caseId: str
    title: str
    status: str
    progress: int
    owner: str
    logs: List[ActionLogItem] = []
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    sensitive: bool

class ApprovalResponse(BaseModel):
    id: str
    caseId: str
    actionId: str
    requester: str
    status: str
    aiReasoning: Optional[str]
    confidence: int
    payloadPreview: Optional[str]
    timeline: List[CaseTimelineItem] = []
    createdAt: datetime
