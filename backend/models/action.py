from sqlalchemy import Column, String, Integer, DateTime, Boolean
from database.postgres import Base
from models.mixins import OrgMixin, generate_uuid

class Action(Base, OrgMixin):
    __tablename__ = "actions"

    case_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default="Pending")
    progress = Column(Integer, default=0)
    owner_user_id = Column(String, nullable=True)
    owner_label = Column(String, nullable=True)
    sensitive = Column(Boolean, default=False)
    
    # Archive
    archived_at = Column(DateTime(timezone=True), nullable=True)
    archived_by_user_id = Column(String, nullable=True)
    archive_reason = Column(String, nullable=True)

class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    action_id = Column(String, index=True, nullable=False)
    actor = Column(String, nullable=False)
    message = Column(String, nullable=False)
    at = Column(DateTime(timezone=True), nullable=False)
