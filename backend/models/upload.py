from sqlalchemy import Column, String, Integer, DateTime
from database.postgres import Base
from models.mixins import OrgMixin, generate_uuid

class Upload(Base, OrgMixin):
    __tablename__ = "uploads"

    pipeline_run_id = Column(String, nullable=True)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # GSTR-1, GSTR-2B, etc.
    status = Column(String, default="Uploaded")
    row_count = Column(Integer, default=0)
    uploaded_by_user_id = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True))
    
    # Archiving logic required by spec
    archived_at = Column(DateTime(timezone=True), nullable=True)
    archived_by_user_id = Column(String, nullable=True)
    archive_reason = Column(String, nullable=True)

class UploadFile(Base):
    __tablename__ = "upload_files"

    id = Column(String, primary_key=True, default=generate_uuid)
    upload_id = Column(String, index=True, nullable=False)
    storage_path = Column(String, nullable=False)
    content_type = Column(String, nullable=True)
    size_bytes = Column(Integer, default=0)
    checksum = Column(String, nullable=True)

class PipelineRun(Base, OrgMixin):
    __tablename__ = "pipeline_runs"

    status = Column(String, default="Queued") # Queued, Running, Completed, Failed
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(String, nullable=True)
