import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase


# Load variables from .env
load_dotenv()


# Get PostgreSQL connection URL
DATABASE_URL = os.getenv("DATABASE_URL")


# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL
)


# Create database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Database dependency for FastAPI
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()