from fastapi import APIRouter
from services.reconciliation import get_reconciliation_results
from services.risk_engine import calculate_vendor_risk

router = APIRouter()

@router.get("/results/{buyer_gstin}")
def get_reconciliation(buyer_gstin: str):
    results = get_reconciliation_results(buyer_gstin)
    return {"status": "success", "data": results}

@router.get("/risk/{buyer_gstin}")
def get_risk_analysis(buyer_gstin: str):
    risks = calculate_vendor_risk(buyer_gstin)
    return {"status": "success", "data": risks}
