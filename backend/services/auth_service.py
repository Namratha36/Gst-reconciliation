from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.user import User
from models.organization import Organization
from models.auth_session import AuthSession
from schemas.auth import UserCreate, UserLogin, TokenResponse, UserResponse
from core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from core.errors import APIError
from core.config import settings
import uuid

def register_user(db: Session, user_data: UserCreate) -> TokenResponse:
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise APIError(400, "USER_EXISTS", "A user with this email already exists.")

    # Create Org
    org = Organization(name=user_data.organizationName)
    db.add(org)
    db.commit()
    db.refresh(org)

    # Create User
    new_user = User(
        organization_id=org.id,
        name=user_data.name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return _generate_tokens(db, new_user, org)

def login_user(db: Session, login_data: UserLogin) -> TokenResponse:
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise APIError(401, "AUTH_FAILED", "Invalid email or password.")
    
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    return _generate_tokens(db, user, org)

def _generate_tokens(db: Session, user: User, org: Organization) -> TokenResponse:
    access_token = create_access_token({"sub": user.id, "org": user.organization_id})
    refresh_payload = {"sub": user.id, "type": "refresh", "jti": str(uuid.uuid4())}
    refresh_token = create_refresh_token(refresh_payload)

    expires_at = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Store session
    session = AuthSession(
        user_id=user.id,
        refresh_token_hash=get_password_hash(refresh_token),
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(session)
    db.commit()

    return TokenResponse(
        user=UserResponse(
            id=user.id, name=user.name, email=user.email, role=user.role, 
            organizationId=org.id, organizationName=org.name
        ),
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresAt=expires_at
    )
