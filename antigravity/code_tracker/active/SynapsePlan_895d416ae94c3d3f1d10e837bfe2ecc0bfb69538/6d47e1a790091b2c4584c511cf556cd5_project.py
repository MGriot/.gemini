øfrom sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from .tag import project_tags # Import the association table
from .topic import project_topics # Import the association table

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Float, default=0.0) # 0.0 to 100.0
    status = Column(String, default="Not Started") # e.g., Not Started, In Progress, Completed, On Hold
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="projects_owned")
    tasks = relationship("Task", back_populates="project")
    comments = relationship("Comment", back_populates="project")
    attachments = relationship("Attachment", back_populates="project")
    shared_with = relationship("ProjectShare", back_populates="project")
    tags = relationship("Tag", secondary=project_tags, back_populates="projects")
    topics = relationship("Topic", secondary=project_topics, back_populates="projects")
ø"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Mfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/models/project.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan