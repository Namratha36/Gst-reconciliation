from sqlalchemy import Column, String
from database.postgres import Base
from models.mixins import OrgMixin

class Buyer(Base, OrgMixin):
    __tablename__ = "buyers"

    name = Column(String, nullable=False)
    gstin = Column(String, index=True, nullable=False)
