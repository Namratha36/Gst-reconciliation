from sqlalchemy import Column, String, Integer, DateTime, Numeric
from database.postgres import Base
from models.mixins import OrgMixin, generate_uuid

class Case(Base, OrgMixin):
    __tablename__ = "cases"

    vendor_id = Column(String, index=True, nullable=False)
    risk_score_id = Column(String, nullable=True)
    title = Column(String, nullable=False)
    mismatch_type = Column(String, nullable=False)
    itc_at_risk = Column(Numeric, default=0)
    impact = Column(String, nullable=True)
    priority = Column(String, default="Medium")
    deadline = Column(DateTime(timezone=True), nullable=True)
    owner_user_id = Column(String, nullable=True)
    owner_label = Column(String, nullable=True)
    status = Column(String, default="Queued")
    confidence = Column(Integer, default=0)
    next_action_id = Column(String, nullable=True)
    
    # Archive
    archived_at = Column(DateTime(timezone=True), nullable=True)
    archived_by_user_id = Column(String, nullable=True)
    archive_reason = Column(String, nullable=True)

class CaseInvoiceLink(Base):
    __tablename__ = "case_invoice_links"

    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, index=True, nullable=False)
    invoice_id = Column(String, index=True, nullable=False)

class CaseTimeline(Base):
    __tablename__ = "case_timeline"

    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, index=True, nullable=False)
    actor = Column(String, nullable=False)
    message = Column(String, nullable=False)
    at = Column(DateTime(timezone=True), nullable=False)
