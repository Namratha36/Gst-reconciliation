from sqlalchemy import Column, String
from database.postgres import Base
from models.mixins import TimeMixin, generate_uuid

class Organization(Base, TimeMixin):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    gstin = Column(String, nullable=True)
    subscription_status = Column(String, default="active")
