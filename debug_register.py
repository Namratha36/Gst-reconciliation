import sys
from sqlalchemy.orm import Session
from database.postgres import SessionLocal
from schemas.auth import UserCreate
from services.auth_service import register_user

db = SessionLocal()
try:
    user_in = UserCreate(name="Test User", email="test3@example.com", password="password", organizationName="Acme")
    register_user(db, user_in)
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
