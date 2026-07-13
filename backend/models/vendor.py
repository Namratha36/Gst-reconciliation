from sqlalchemy import Column, String, Integer
from database.postgres import Base
from models.mixins import OrgMixin

class Vendor(Base, OrgMixin):
    __tablename__ = "vendors"

    name = Column(String, nullable=False)
    gstin = Column(String, index=True, nullable=False)
    email = Column(String, nullable=True)
    state = Column(String, nullable=True)
    compliance_score = Column(Integer, default=0)
    risk_tier = Column(String, default="Low") # Low, Medium, High, Critical
    itc_exposure = Column(Integer, default=0)
    pending_case_count = Column(Integer, default=0)
    late_filing_frequency = Column(Integer, default=0)
    trend = Column(String, default="flat") # up, down, flat
