¦from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class ProjectShare(Base):
    __tablename__ = "project_shares"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    shared_with_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    permissions = Column(String, default="view") # e.g., "view", "edit", "admin"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project = relationship("Project", back_populates="shared_with")
    shared_with_user = relationship("User", back_populates="project_shares")
¦"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Sfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/models/project_share.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan