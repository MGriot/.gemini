±from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey, Enum, Integer
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from .base import Base

class SessionStatus(enum.Enum):
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class AssetType(enum.Enum):
    ORIGINAL_IMAGE = "ORIGINAL_IMAGE"
    CORRECTED_IMAGE = "CORRECTED_IMAGE"
    ALIGNED_IMAGE = "ALIGNED_IMAGE"
    MASKED_IMAGE = "MASKED_IMAGE"
    DEBUG_STEP = "DEBUG_STEP"
    REPORT_PDF = "REPORT_PDF"
    REPORT_JSON = "REPORT_JSON"

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("analysis_projects.id"), nullable=True) # Linked to AnalysisProject
    project_name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(SessionStatus), default=SessionStatus.RUNNING)
    
    # Store configurations and metadata as JSON
    config_snapshot = Column(JSON)
    pipeline_args = Column(JSON)
    metadata_info = Column(JSON)
    results_snapshot = Column(JSON, nullable=True)
    
    # Relationships
    assets = relationship("AnalysisAsset", back_populates="session", cascade="all, delete-orphan")
    metrics = relationship("AnalysisMetric", back_populates="session", cascade="all, delete-orphan")
    project = relationship("AnalysisProject")

class AnalysisProject(Base):
    __tablename__ = "analysis_projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Combined configurations
    config = Column(JSON) 
    dataset_processing_config = Column(JSON)
    
    # Relationships
    assets = relationship("ProjectAsset", back_populates="project", cascade="all, delete-orphan")

class ProjectAsset(Base):
    __tablename__ = "project_assets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("analysis_projects.id"), nullable=True) # Linked to AnalysisProject
    project_name = Column(String, index=True) # Keep for compatibility during migration
    category = Column(String)  # e.g., "ideal_checker", "drawing_layer"
    filename = Column(String)
    file_path = Column(String)
    parent_asset_id = Column(String, ForeignKey("project_assets.id"), nullable=True) # Linked to another ProjectAsset (e.g. calibration image -> checker)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("AnalysisProject", back_populates="assets")
    
class AnalysisAsset(Base):
    __tablename__ = "analysis_assets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("analysis_sessions.id"))
    asset_type = Column(Enum(AssetType))
    role = Column(String)  # e.g., "input_image", "mask_drawing_1"
    file_path = Column(String)
    file_hash = Column(String, nullable=True)
    
    session = relationship("AnalysisSession", back_populates="assets")

class AnalysisMetric(Base):
    __tablename__ = "analysis_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("analysis_sessions.id"))
    category = Column(String) # e.g., "color_analysis"
    key = Column(String)      # e.g., "delta_e_mean"
    value = Column(Float)
    unit = Column(String, nullable=True)
    
    session = relationship("AnalysisSession", back_populates="metrics")
±"(ac18c7c1483078b19900afc78cd7675de4506b332Afile:///c:/Users/Admin/Documents/Coding/QualiaQC/src/db/models.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC