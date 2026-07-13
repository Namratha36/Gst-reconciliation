from sqlalchemy import Column, String, Integer, DateTime, Numeric, JSON
from database.postgres import Base
from models.mixins import OrgMixin, generate_uuid

class ReconciliationRun(Base, OrgMixin):
    __tablename__ = "reconciliation_runs"

    pipeline_run_id = Column(String, nullable=True)
    status = Column(String, default="Queued")
    period_start = Column(DateTime(timezone=True), nullable=True)
    period_end = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class ReconciliationResult(Base, OrgMixin):
    __tablename__ = "reconciliation_results"

    run_id = Column(String, index=True, nullable=False)
    invoice_id = Column(String, index=True, nullable=True)
    vendor_id = Column(String, index=True, nullable=True)
    exception_type = Column(String, nullable=False)
    impacted_amount = Column(Numeric, default=0)
    risk_grade = Column(String, nullable=False)
    case_id = Column(String, nullable=True)
    details_json = Column(JSON, nullable=True)
