from database.postgres import SessionLocal
from models.case import Case
from models.action import Action
from models.vendor import Vendor
from models.invoice import Invoice
from models.approval import Approval
from models.alert import Alert
from models.report import Report

db = SessionLocal()
cases = db.query(Case).filter(Case.archived_at == None).all()
actions = db.query(Action).filter(Action.archived_at == None).all()
vendors = db.query(Vendor).all()
invoices = db.query(Invoice).all()
approvals = db.query(Approval).all()
alerts = db.query(Alert).filter(Alert.archived_at == None).all()
reports = db.query(Report).filter(Report.archived_at == None).all()

print(f'CASES: {len(cases)}')
for c in cases:
    print(f'  {c.id[:8]} | {c.title} | {c.status} | ITC={c.itc_at_risk} | vendor_id={c.vendor_id[:8] if c.vendor_id else "None"}')
print(f'ACTIONS: {len(actions)}')
for a in actions:
    print(f'  {a.id[:8]} | {a.title} | {a.status} | case={a.case_id[:8] if a.case_id else "None"}')
print(f'VENDORS: {len(vendors)}')
for v in vendors:
    print(f'  {v.id[:8]} | {v.name} | {v.gstin} | {v.risk_tier}')
print(f'INVOICES: {len(invoices)}')
print(f'APPROVALS: {len(approvals)}')
for a in approvals:
    print(f'  {a.id[:8]} | status={a.status}')
print(f'ALERTS: {len(alerts)}')
print(f'REPORTS: {len(reports)}')
db.close()
