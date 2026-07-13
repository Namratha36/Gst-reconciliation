from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.postgres import get_db
from schemas.reconciliation import RunReconciliationRequest, RunReconciliationResponse
from services import reconciliation_engine
from core.dependencies import get_current_user
from models.user import User

router = APIRouter()

@router.post("/run", response_model=RunReconciliationResponse)
def run_reconciliation(
    req: RunReconciliationRequest, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return reconciliation_engine.run_reconciliation(db, req, current_user)

@router.get("/summary")
def get_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Dummy summary for now, ideally group by exception_type
    return {
        "missingInvoices": 12,
        "valueMismatches": 5,
        "duplicateEntries": 0
    }

@router.get("/exceptions")
def get_exceptions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from models.reconciliation import ReconciliationResult
    return db.query(ReconciliationResult).filter(
        ReconciliationResult.organization_id == current_user.organization_id
    ).all()
