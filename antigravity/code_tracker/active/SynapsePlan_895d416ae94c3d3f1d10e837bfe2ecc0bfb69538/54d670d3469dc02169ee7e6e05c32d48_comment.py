÷from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    subtask_id = Column(Integer, ForeignKey("subtasks.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="comments")
    project = relationship("Project", back_populates="comments")
    task = relationship("Task", back_populates="comments")
    subtask = relationship("Subtask", back_populates="comments")
÷"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Mfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/models/comment.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan