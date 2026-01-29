Êfrom sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    surname = Column(String, nullable=True)
    nickname = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    projects_owned = relationship("Project", back_populates="owner")
    tasks_owned = relationship("Task", back_populates="owner", foreign_keys="[Task.owner_id]")
    comments = relationship("Comment", back_populates="owner")
    project_shares = relationship("ProjectShare", back_populates="shared_with_user")
Ê"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Jfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/models/user.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan