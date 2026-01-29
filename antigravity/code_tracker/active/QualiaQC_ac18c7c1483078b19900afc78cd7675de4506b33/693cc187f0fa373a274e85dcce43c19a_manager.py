Í<from sqlalchemy.orm import Session
from .models import AnalysisSession, AnalysisAsset, AnalysisMetric, SessionStatus, AssetType, ProjectAsset, AnalysisProject
from .base import engine, Base
import os
from src import config
from src.utils.logging_utils import setup_logger

logger = setup_logger(__name__)

class DatabaseManager:
    def __init__(self):
        # Ensure database is initialized
        Base.metadata.create_all(bind=engine)
        self._migrate_schema()

    def _migrate_schema(self):
        """Simple migration to add missing columns if they don't exist."""
        import sqlite3
        conn = sqlite3.connect(config.DATABASE_PATH)
        cursor = conn.cursor()
        
        # Check for metadata_info
        cursor.execute("PRAGMA table_info(analysis_sessions)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'metadata_info' not in columns:
            logger.info("Migrating: Adding metadata_info to analysis_sessions")
            cursor.execute("ALTER TABLE analysis_sessions ADD COLUMN metadata_info JSON")
            
        if 'results_snapshot' not in columns:
            logger.info("Migrating: Adding results_snapshot to analysis_sessions")
            cursor.execute("ALTER TABLE analysis_sessions ADD COLUMN results_snapshot JSON")
            
        # Check project_id in sessions
        if 'project_id' not in columns:
            logger.info("Migrating: Adding project_id to analysis_sessions")
            cursor.execute("ALTER TABLE analysis_sessions ADD COLUMN project_id TEXT")

        # Check project_id in project_assets
        cursor.execute("PRAGMA table_info(project_assets)")
        pa_columns = [column[1] for column in cursor.fetchall()]
        if 'project_id' not in pa_columns:
            logger.info("Migrating: Adding project_id to project_assets")
            cursor.execute("ALTER TABLE project_assets ADD COLUMN project_id TEXT")

        if 'parent_asset_id' not in pa_columns:
            logger.info("Migrating: Adding parent_asset_id to project_assets")
            cursor.execute("ALTER TABLE project_assets ADD COLUMN parent_asset_id TEXT")

        # Data Migration: Rename training_image to calibration_image
        logger.info("Migrating: Updating asset categories from training_image to calibration_image")
        cursor.execute("UPDATE project_assets SET category = 'calibration_image' WHERE category = 'training_image'")
        
        # Data Migration: Update file paths from training_images/ to calibration_images/
        # Using REPLACE for sqlite compatibility
        cursor.execute("UPDATE project_assets SET file_path = REPLACE(file_path, '/training_images/', '/calibration_images/') WHERE category = 'calibration_image'")
        cursor.execute("UPDATE project_assets SET file_path = REPLACE(file_path, '\\training_images\\', '\\calibration_images\\') WHERE category = 'calibration_image'")

        conn.commit()
        conn.close()

    def create_session(self, db: Session, project_name: str, config_snapshot: dict, pipeline_args: dict, metadata_info: dict) -> AnalysisSession:
        session = AnalysisSession(
            project_name=project_name,
            config_snapshot=config_snapshot,
            pipeline_args=pipeline_args,
            metadata_info=metadata_info
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def update_session_status(self, db: Session, session_id: str, status: SessionStatus) -> AnalysisSession:
        session = self.get_session(db, session_id)
        if session:
            session.status = status
            db.commit()
            db.refresh(session)
        return session

    def update_session_results(self, db: Session, session_id: str, results_snapshot: dict) -> AnalysisSession:
        session = self.get_session(db, session_id)
        if session:
            session.results_snapshot = results_snapshot
            db.commit()
            db.refresh(session)
        return session

    def add_asset(self, db: Session, session_id: str, asset_type: AssetType, role: str, file_path: str, file_hash: str = None) -> AnalysisAsset:
        asset = AnalysisAsset(
            session_id=session_id,
            asset_type=asset_type,
            role=role,
            file_path=file_path,
            file_hash=file_hash
        )
        db.add(asset)
        db.commit()
        db.refresh(asset)
        return asset

    def add_metric(self, db: Session, session_id: str, category: str, key: str, value: float, unit: str = None):
        metric = AnalysisMetric(
            session_id=session_id,
            category=category,
            key=key,
            value=value,
            unit=unit
        )
        db.add(metric)
        db.commit()

    def get_session(self, db: Session, session_id: str) -> AnalysisSession:
        return db.query(AnalysisSession).filter(AnalysisSession.id == session_id).first()

    def list_sessions(self, db: Session, project_name: str = None):
        query = db.query(AnalysisSession)
        if project_name:
            query = query.filter(AnalysisSession.project_name == project_name)
        return query.order_by(AnalysisSession.created_at.desc()).all()

    def add_project_asset(self, db: Session, project_name: str, category: str, filename: str, file_path: str, project_id: str = None, parent_asset_id: str = None) -> ProjectAsset:
        asset = ProjectAsset(
            project_id=project_id,
            project_name=project_name,
            category=category,
            filename=filename,
            file_path=file_path,
            parent_asset_id=parent_asset_id
        )
        db.add(asset)
        db.commit()
        db.refresh(asset)
        return asset

    def list_project_assets(self, db: Session, project_name: str = None, project_id: str = None):
        query = db.query(ProjectAsset)
        if project_id:
            query = query.filter(ProjectAsset.project_id == project_id)
        elif project_name:
            query = query.filter(ProjectAsset.project_name == project_name)
        return query.all()

    # Project Operations
    def create_project(self, db: Session, name: str, config: dict, dataset_processing_config: dict = None) -> AnalysisProject:
        project = AnalysisProject(
            name=name,
            config=config,
            dataset_processing_config=dataset_processing_config or {"image_configs": []}
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    def get_project(self, db: Session, project_id: str = None, name: str = None) -> AnalysisProject:
        if project_id:
            return db.query(AnalysisProject).filter(AnalysisProject.id == project_id).first()
        if name:
            return db.query(AnalysisProject).filter(AnalysisProject.name == name).first()
        return None

    def list_projects(self, db: Session) -> list[AnalysisProject]:
        return db.query(AnalysisProject).order_by(AnalysisProject.name).all()

    def update_project_config(self, db: Session, project_id: str, config: dict = None, dataset_processing_config: dict = None) -> AnalysisProject:
        project = self.get_project(db, project_id=project_id)
        if project:
            if config is not None:
                project.config = config
            if dataset_processing_config is not None:
                project.dataset_processing_config = dataset_processing_config
            db.commit()
            db.refresh(project)
        return project
Í<"(ac18c7c1483078b19900afc78cd7675de4506b332Bfile:///c:/Users/Admin/Documents/Coding/QualiaQC/src/db/manager.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC