from sqlalchemy import Column, String, Boolean, DateTime
from database.postgres import Base
from models.mixins import OrgMixin

class Alert(Base, OrgMixin):
    __tablename__ = "alerts"

    severity = Column(String, default="info") # info, warning, critical
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    entity_type = Column(String, nullable=True)
    read = Column(Boolean, default=False)
    
    # Archive
    archived_at = Column(DateTime(timezone=True), nullable=True)
    archived_by_user_id = Column(String, nullable=True)
    archive_reason = Column(String, nullable=True)
