from sqlalchemy.orm import Session
from models.case import Case
from models.vendor import Vendor
from models.action import Action
from models.invoice import Invoice
from models.approval import Approval
import json

def build_context(db: Session, org_id: str) -> str:
    cases = db.query(Case).filter(Case.organization_id == org_id, Case.archived_at == None).all()
    vendors = db.query(Vendor).filter(Vendor.organization_id == org_id).all()
    actions = db.query(Action).filter(Action.organization_id == org_id, Action.archived_at == None).all()
    invoices = db.query(Invoice).filter(Invoice.organization_id == org_id).order_by(Invoice.created_at.desc()).limit(50).all()
    approvals = db.query(Approval).filter(Approval.organization_id == org_id, Approval.status == "Pending").all()

    if not cases and not vendors and not invoices:
        return ""

    total_itc = sum(float(c.itc_at_risk or 0) for c in cases)
    high_risk_vendors = [v.gstin for v in vendors if v.risk_tier in ["High", "Critical"]]

    context = {
        "invoices": [{
            "id": i.id,
            "vendorGstin": i.vendor_id,
            "invoiceNumber": i.invoice_number,
            "invoiceValue": str(i.invoice_value),
            "taxableValue": str(i.taxable_value),
            "igst": str(i.igst),
            "cgst": str(i.cgst),
            "sgst": str(i.sgst),
            "financialYear": i.financial_year,
            "docType": i.doc_type
        } for i in invoices],
        "vendors": [{
            "id": v.id,
            "name": v.name,
            "gstin": v.gstin,
            "riskTier": v.risk_tier,
            "complianceScore": v.compliance_score,
            "itcExposure": str(v.itc_exposure),
            "pendingCases": v.pending_case_count
        } for v in vendors],
        "cases": [{
            "id": c.id,
            "title": c.title,
            "vendorId": c.vendor_id,
            "itcAtRisk": str(c.itc_at_risk),
            "priority": c.priority,
            "status": c.status,
            "mismatchType": c.mismatch_type
        } for c in cases],
        "actions": [{
            "id": a.id,
            "title": a.title,
            "status": a.status,
            "caseId": a.case_id,
            "progress": a.progress
        } for a in actions],
        "approvals": [{
            "id": a.id,
            "status": a.status,
            "aiReasoning": a.ai_reasoning,
            "confidence": a.confidence
        } for a in approvals],
        "graphSummary": f"{len(vendors)} vendors tracked. {len(high_risk_vendors)} high-risk GSTINs: {', '.join(high_risk_vendors[:5])}.",
        "riskSummary": f"Total ITC at risk: Rs.{total_itc:,.2f}. {len(cases)} open cases. {len([c for c in cases if c.priority == 'Critical'])} critical priority."
    }

    return json.dumps(context)
