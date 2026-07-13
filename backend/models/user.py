from sqlalchemy import Column, String, DateTime
from database.postgres import Base
from models.mixins import OrgMixin

class User(Base, OrgMixin):
    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Finance Manager")
    status = Column(String, default="Active")
    last_login_at = Column(DateTime(timezone=True), nullable=True)
