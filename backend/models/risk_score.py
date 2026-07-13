from sqlalchemy import Column, String, Integer, DateTime, JSON
from database.postgres import Base
from models.mixins import OrgMixin

class RiskScore(Base, OrgMixin):
    __tablename__ = "risk_scores"

    entity_id = Column(String, index=True, nullable=False)
    entity_type = Column(String, nullable=False) # Vendor | Case | Invoice
    score = Column(Integer, default=0)
    tier = Column(String, default="Low")
    reasons_json = Column(JSON, nullable=True)
    calculated_at = Column(DateTime(timezone=True), nullable=True)
