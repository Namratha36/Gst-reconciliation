from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.postgres import get_db
from core.dependencies import get_current_user
from models.user import User
from services.copilot_context_service import build_context
from services.gemini_service import generate_answer
import json
from datetime import datetime

router = APIRouter()

@router.get("/conversation")
def get_conversation(current_user: User = Depends(get_current_user)):
    return {
        "id": "conv-1",
        "userId": current_user.id,
        "messages": []
    }

@router.get("/context")
def get_context(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ctx_str = build_context(db, current_user.organization_id)
    if ctx_str:
        return json.loads(ctx_str)
    return {
        "invoices": [], "vendors": [], "cases": [],
        "actions": [], "approvals": [], "graphSummary": "", "riskSummary": ""
    }

@router.post("/chat")
def chat(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ctx = build_context(db, current_user.organization_id)
    question = payload.get("question", payload.get("message", ""))
    answer = generate_answer(question, ctx)
    return {
        "id": f"MSG-{int(datetime.utcnow().timestamp())}",
        "role": "assistant",
        "content": answer,
        "createdAt": datetime.utcnow().isoformat()
    }
