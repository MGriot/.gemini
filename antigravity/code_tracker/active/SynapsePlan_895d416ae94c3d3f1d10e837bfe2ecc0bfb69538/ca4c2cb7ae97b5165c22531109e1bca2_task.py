Öfrom sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from .tag import task_tags # Import the association table
from .topic import task_topics # Import the association table

task_assignees = Table(
    "task_assignees",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

task_promoters = Table(
    "task_promoters",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    parent_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Float, default=0.0) # 0.0 to 100.0
    status = Column(String, default="Not Started") # e.g., Not Started, In Progress, Completed, On Hold
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project = relationship("Project", back_populates="tasks")
    owner = relationship("User", foreign_keys=[owner_id], back_populates="tasks_owned")
    promoters = relationship("User", secondary=task_promoters, backref="tasks_promoted")
    assignees = relationship("User", secondary=task_assignees, backref="assigned_tasks")
    parent = relationship("Task", remote_side=[id], backref="children")
    subtasks = relationship("Subtask", back_populates="parent_task")
    comments = relationship("Comment", back_populates="task")
    attachments = relationship("Attachment", back_populates="task")
    dependencies_as_prerequisite = relationship("Dependency", foreign_keys="[Dependency.prerequisite_id]", back_populates="prerequisite")
    dependencies_as_dependent = relationship("Dependency", foreign_keys="[Dependency.dependent_id]", back_populates="dependent")
    tags = relationship("Tag", secondary=task_tags, back_populates="tasks")
    topics = relationship("Topic", secondary=task_topics, back_populates="tasks")
Ö"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Jfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/models/task.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan