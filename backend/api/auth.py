from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.postgres import get_db
from schemas.auth import UserCreate, UserLogin, TokenResponse, UserResponse
from services import auth_service
from core.dependencies import get_current_user
from models.user import User
from models.organization import Organization

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, user_in)

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    return auth_service.login_user(db, login_in)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        organizationId=org.id,
        organizationName=org.name
    )
