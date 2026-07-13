from sqlalchemy import Column, String, Integer, DateTime
from database.postgres import Base
from models.mixins import OrgMixin, generate_uuid

class Approval(Base, OrgMixin):
    __tablename__ = "approvals"

    case_id = Column(String, index=True, nullable=False)
    action_id = Column(String, index=True, nullable=False)
    requester = Column(String, nullable=False)
    status = Column(String, default="Pending")
    ai_reasoning = Column(String, nullable=True)
    confidence = Column(Integer, default=0)
    decision = Column(String, nullable=True)
    payload_preview = Column(String, nullable=True)
    
    decided_at = Column(DateTime(timezone=True), nullable=True)
    decided_by_user_id = Column(String, nullable=True)

class ApprovalTimeline(Base):
    __tablename__ = "approval_timeline"

    id = Column(String, primary_key=True, default=generate_uuid)
    approval_id = Column(String, index=True, nullable=False)
    actor = Column(String, nullable=False)
    message = Column(String, nullable=False)
    at = Column(DateTime(timezone=True), nullable=False)
