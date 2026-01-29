Ìfrom sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from src import config

engine = create_engine(config.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
Ì"(ac18c7c1483078b19900afc78cd7675de4506b332?file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/db/base.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC