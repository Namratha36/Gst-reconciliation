import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://gst_user:gst_password@localhost:5432/graphgst")

# Create engine
engine = create_engine(POSTGRES_URL)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
