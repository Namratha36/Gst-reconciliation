import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

POSTGRES_URL = os.getenv("POSTGRES_URL", "sqlite:///./graphgst.db")

# Create engine (SQLite specific connect_args)
if POSTGRES_URL.startswith("sqlite"):
    engine = create_engine(POSTGRES_URL, connect_args={"check_same_thread": False})
else:
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
