from sqlalchemy import Column, String, Integer, DateTime, Numeric, UniqueConstraint
from database.postgres import Base
from models.mixins import OrgMixin

class Invoice(Base, OrgMixin):
    __tablename__ = "invoices"

    upload_id = Column(String, index=True, nullable=False)
    canonical_key = Column(String, nullable=False)
    invoice_number = Column(String, nullable=False)
    invoice_date = Column(DateTime(timezone=True), nullable=True)
    financial_year = Column(String, nullable=False)
    doc_type = Column(String, nullable=False)
    vendor_id = Column(String, index=True, nullable=False)
    buyer_id = Column(String, index=True, nullable=False)
    
    taxable_value = Column(Numeric, default=0)
    igst = Column(Numeric, default=0)
    cgst = Column(Numeric, default=0)
    sgst = Column(Numeric, default=0)
    invoice_value = Column(Numeric, default=0)
    
    source = Column(String, nullable=False)
    reconciliation_status = Column(String, default="Pending")

    __table_args__ = (
        UniqueConstraint('organization_id', 'canonical_key', name='_org_canonical_uc'),
    )
