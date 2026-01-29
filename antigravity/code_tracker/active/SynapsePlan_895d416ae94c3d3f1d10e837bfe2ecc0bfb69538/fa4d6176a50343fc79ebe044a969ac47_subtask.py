ƒfrom sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from .tag import subtask_tags # Import the association table
from .topic import subtask_topics # Import the association table

class Subtask(Base):
    __tablename__ = "subtasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True) # Make nullable for nested subtasks
    parent_subtask_id = Column(Integer, ForeignKey("subtasks.id"), nullable=True) # Self-referencing FK
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Float, default=0.0) # 0.0 to 100.0
    status = Column(String, default="Not Started") # e.g., Not Started, In Progress, Completed, On Hold
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    parent_task = relationship("Task", back_populates="subtasks")
    parent_subtask = relationship("Subtask", remote_side=[id], back_populates="nested_subtasks") # Parent subtask
    nested_subtasks = relationship("Subtask", back_populates="parent_subtask") # Children subtasks
    owner = relationship("User")
    comments = relationship("Comment", back_populates="subtask")
    attachments = relationship("Attachment", back_populates="subtask")
    dependencies_as_prerequisite = relationship("Dependency", primaryjoin="Subtask.id == Dependency.prerequisite_subtask_id", back_populates="prerequisite_subtask")
    dependencies_as_dependent = relationship("Dependency", primaryjoin="Subtask.id == Dependency.dependent_subtask_id", back_populates="dependent_subtask")
    tags = relationship("Tag", secondary=subtask_tags, back_populates="subtasks")
    topics = relationship("Topic", secondary=subtask_topics, back_populates="subtasks")
ƒ"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Mfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/models/subtask.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan