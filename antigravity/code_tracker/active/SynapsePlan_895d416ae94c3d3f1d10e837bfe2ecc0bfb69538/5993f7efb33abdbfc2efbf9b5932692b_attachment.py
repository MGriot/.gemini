àfrom sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False) # Path on the server
    file_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True) # in bytes
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    subtask_id = Column(Integer, ForeignKey("subtasks.id"), nullable=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="attachments")
    task = relationship("Task", back_populates="attachments")
    subtask = relationship("Subtask", back_populates="attachments")
    uploaded_by = relationship("User")
à"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Pfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/models/attachment.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan