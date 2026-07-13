from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database.postgres import get_db
from models.action import Action
from schemas.case import ActionResponse
from core.dependencies import get_current_user
from models.user import User

router = APIRouter()

def _action_to_response(a: Action) -> ActionResponse:
    return ActionResponse(
        id=a.id,
        caseId=a.case_id,
        title=a.title,
        status=a.status,
        progress=a.progress,
        owner=a.owner_label or "System",
        sensitive=a.sensitive,
        createdAt=a.created_at,
        updatedAt=a.updated_at
    )

@router.get("", response_model=List[ActionResponse])
def get_actions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    actions = db.query(Action).filter(
        Action.organization_id == current_user.organization_id,
        Action.archived_at == None
    ).all()
    return [_action_to_response(a) for a in actions]

@router.patch("/{action_id}", response_model=ActionResponse)
def update_action_status(action_id: str, payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    action = db.query(Action).filter(
        Action.id == action_id,
        Action.organization_id == current_user.organization_id
    ).first()
    if action:
        new_status = payload.get("status", action.status)
        action.status = new_status
        action.updated_at = datetime.utcnow()
        if new_status == "Running":
            action.progress = 50
        elif new_status == "Completed":
            action.progress = 100
        db.commit()
        db.refresh(action)
    return _action_to_response(action)

@router.delete("/{action_id}")
def delete_action(action_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    action = db.query(Action).filter(
        Action.id == action_id,
        Action.organization_id == current_user.organization_id
    ).first()
    if action:
        action.archived_at = datetime.utcnow()
        db.commit()
    return {"deleted": True, "actionId": action_id}
