import uuid
import random
from datetime import datetime
from sqlalchemy.orm import Session
from models.invoice import Invoice
from models.vendor import Vendor
from models.reconciliation import ReconciliationRun, ReconciliationResult
from models.user import User
from schemas.reconciliation import RunReconciliationRequest
from services import case_engine

def run_reconciliation(db: Session, req: RunReconciliationRequest, current_user: User):
    org_id = current_user.organization_id
    
    run = ReconciliationRun(
        organization_id=org_id,
        status="Running",
        period_start=datetime.strptime(req.periodStart, "%Y-%m-%d") if req.periodStart else None,
        period_end=datetime.strptime(req.periodEnd, "%Y-%m-%d") if req.periodEnd else None,
        started_at=datetime.utcnow()
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Fetch invoices for these uploads
    invoices = db.query(Invoice).filter(
        Invoice.organization_id == org_id,
        Invoice.upload_id.in_(req.uploadIds)
    ).all()
    
    exceptions = []
    case_ids = []
    
    # Deterministic dummy logic to generate exceptions for UI demonstration
    # In reality, this would group by canonical_key and compare GSTR-1 vs GSTR-2B
    for i, inv in enumerate(invoices):
        if i % 7 == 0:  # Flag roughly 15% of invoices for demonstration
            exc_type = "Missing" if i % 2 == 0 else "Value Mismatch"
            
            # Ensure vendor exists or create a temp one
            vendor = db.query(Vendor).filter(Vendor.gstin == inv.vendor_id).first()
            if not vendor:
                vendor = Vendor(
                    organization_id=org_id,
                    name=f"Vendor {inv.vendor_id}",
                    gstin=inv.vendor_id,
                    risk_tier="High" if i % 3 == 0 else "Medium"
                )
                db.add(vendor)
                db.commit()
                db.refresh(vendor)
            
            result = ReconciliationResult(
                organization_id=org_id,
                run_id=run.id,
                invoice_id=inv.id,
                vendor_id=vendor.id,
                exception_type=exc_type,
                impacted_amount=float(inv.taxable_value) * 0.18, # Dummy tax amount
                risk_grade="Critical" if exc_type == "Missing" else "Medium",
            )
            db.add(result)
            db.commit()
            db.refresh(result)
            exceptions.append(result)
            
            # Generate Case
            case = case_engine.create_case_from_exception(db, result, current_user)
            case_ids.append(case.id)

    run.status = "Completed"
    run.completed_at = datetime.utcnow()
    db.commit()

    return {
        "runId": run.id,
        "status": "Completed",
        "exceptionCount": len(exceptions),
        "caseIds": case_ids
    }
