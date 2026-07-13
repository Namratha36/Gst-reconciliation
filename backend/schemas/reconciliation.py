from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RunReconciliationRequest(BaseModel):
    uploadIds: List[str]
    periodStart: str
    periodEnd: str

class RunReconciliationResponse(BaseModel):
    runId: str
    status: str
    exceptionCount: int
    caseIds: List[str]

class ReconciliationSummary(BaseModel):
    missingInvoices: int
    valueMismatches: int
    duplicateEntries: int

class ReconciliationException(BaseModel):
    id: str
    vendorId: str
    vendorName: str
    vendorGstin: str
    exceptionType: str
    impactedAmount: float
    riskGrade: str
    mismatchCount: int
    caseId: Optional[str] = None
