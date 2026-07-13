from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.postgres import get_db
from models.report import Report
from models.case import Case
from models.vendor import Vendor
from core.dependencies import get_current_user
from models.user import User
from datetime import datetime
import uuid, json

router = APIRouter()

@router.get("")
def get_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = db.query(Report).filter(
        Report.organization_id == current_user.organization_id,
        Report.archived_at == None
    ).order_by(Report.generated_at.desc()).all()

    # If no reports exist yet, auto-generate one from current data
    if not reports:
        cases = db.query(Case).filter(Case.organization_id == current_user.organization_id, Case.archived_at == None).all()
        vendors = db.query(Vendor).filter(Vendor.organization_id == current_user.organization_id).all()

        if cases or vendors:
            total_itc = sum(float(c.itc_at_risk or 0) for c in cases)
            high_risk = sum(1 for v in vendors if v.risk_tier in ["High", "Critical"])
            now = datetime.utcnow()

            report = Report(
                id=str(uuid.uuid4()),
                organization_id=current_user.organization_id,
                title=f"GST Compliance Executive Report – {now.strftime('%B %Y')}",
                period_start=datetime(2026, 4, 1),
                period_end=datetime(2026, 6, 30),
                generated_at=now,
                summary=(
                    f"Auto-generated from {len(cases)} active compliance cases across {len(vendors)} vendors. "
                    f"Total ITC at risk: ₹{total_itc:,.2f}. "
                    f"High-risk vendors: {high_risk}. "
                    f"Immediate action required on Critical cases."
                ),
                metrics_json=json.dumps([
                    {"label": "Active Cases", "value": len(cases)},
                    {"label": "Total Vendors", "value": len(vendors)},
                    {"label": "ITC At Risk (₹)", "value": round(total_itc, 2)},
                    {"label": "High Risk Vendors", "value": high_risk},
                ]),
                case_ids_json=json.dumps([c.id for c in cases]),
                vendor_ids_json=json.dumps([v.id for v in vendors]),
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            reports = [report]

    return [{
        "id": r.id,
        "title": r.title,
        "periodStart": r.period_start,
        "periodEnd": r.period_end,
        "generatedAt": r.generated_at,
        "summary": r.summary,
        "metrics": json.loads(r.metrics_json) if isinstance(r.metrics_json, str) else (r.metrics_json or []),
        "caseIds": json.loads(r.case_ids_json) if isinstance(r.case_ids_json, str) else (r.case_ids_json or []),
        "vendorIds": json.loads(r.vendor_ids_json) if isinstance(r.vendor_ids_json, str) else (r.vendor_ids_json or [])
    } for r in reports]

@router.post("")
def generate_report(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cases = db.query(Case).filter(Case.organization_id == current_user.organization_id, Case.archived_at == None).all()
    vendors = db.query(Vendor).filter(Vendor.organization_id == current_user.organization_id).all()
    total_itc = sum(float(c.itc_at_risk or 0) for c in cases)
    high_risk = sum(1 for v in vendors if v.risk_tier in ["High", "Critical"])
    now = datetime.utcnow()

    report = Report(
        id=str(uuid.uuid4()),
        organization_id=current_user.organization_id,
        title=f"GST Compliance Report – {now.strftime('%d %B %Y %H:%M')}",
        period_start=datetime(2026, 4, 1),
        period_end=datetime(2026, 6, 30),
        generated_at=now,
        summary=(
            f"{len(cases)} compliance cases detected. Total ITC at risk: ₹{total_itc:,.2f}. "
            f"High-risk vendors: {high_risk} of {len(vendors)}."
        ),
        metrics_json=json.dumps([
            {"label": "Active Cases", "value": len(cases)},
            {"label": "Total Vendors", "value": len(vendors)},
            {"label": "ITC At Risk (₹)", "value": round(total_itc, 2)},
            {"label": "High Risk Vendors", "value": high_risk},
        ]),
        case_ids_json=json.dumps([c.id for c in cases]),
        vendor_ids_json=json.dumps([v.id for v in vendors]),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return {"id": report.id, "title": report.title, "generatedAt": report.generated_at}

@router.delete("/{report_id}")
def delete_report(report_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id, Report.organization_id == current_user.organization_id).first()
    if report:
        report.archived_at = datetime.utcnow()
        db.commit()
    return {"deleted": True, "reportId": report_id}
