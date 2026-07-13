from sqlalchemy import Column, String, DateTime, JSON
from database.postgres import Base
from models.mixins import OrgMixin, generate_uuid

class CopilotConversation(Base, OrgMixin):
    __tablename__ = "copilot_conversations"

    user_id = Column(String, index=True, nullable=False)

class CopilotMessage(Base):
    __tablename__ = "copilot_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False) # user, assistant, system
    content = Column(String, nullable=False)
    source_entity_ids_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
