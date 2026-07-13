from sqlalchemy import Column, String, JSON
from database.postgres import Base
from models.mixins import OrgMixin

class AuditLog(Base, OrgMixin):
    __tablename__ = "audit_logs"

    actor_user_id = Column(String, index=True, nullable=True)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, index=True, nullable=False)
    event_type = Column(String, nullable=False) # CREATE, UPDATE, DELETE, ARCHIVE
    before_json = Column(JSON, nullable=True)
    after_json = Column(JSON, nullable=True)
