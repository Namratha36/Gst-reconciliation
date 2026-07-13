from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.postgres import get_db
from core.dependencies import get_current_user
from models.user import User
from services.graph_service import get_graph_data

router = APIRouter()

@router.get("")
def get_graph(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_graph_data(db, current_user.organization_id)
