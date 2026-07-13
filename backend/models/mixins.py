from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class TimeMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class OrgMixin(TimeMixin):
    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, index=True, nullable=False)
