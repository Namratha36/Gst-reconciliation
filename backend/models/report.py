from sqlalchemy import Column, String, DateTime, JSON
from database.postgres import Base
from models.mixins import OrgMixin, generate_uuid

class Report(Base, OrgMixin):
    __tablename__ = "reports"

    title = Column(String, nullable=False)
    period_start = Column(DateTime(timezone=True), nullable=True)
    period_end = Column(DateTime(timezone=True), nullable=True)
    generated_at = Column(DateTime(timezone=True), nullable=True)
    summary = Column(String, nullable=True)
    metrics_json = Column(JSON, nullable=True)
    case_ids_json = Column(JSON, nullable=True)
    vendor_ids_json = Column(JSON, nullable=True)
    
    # Archive
    archived_at = Column(DateTime(timezone=True), nullable=True)
    archived_by_user_id = Column(String, nullable=True)
    archive_reason = Column(String, nullable=True)

class ReportExport(Base):
    __tablename__ = "report_exports"

    id = Column(String, primary_key=True, default=generate_uuid)
    report_id = Column(String, index=True, nullable=False)
    format = Column(String, nullable=False) # pdf, csv
    storage_path = Column(String, nullable=True)
    download_url = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_by_user_id = Column(String, nullable=True)
