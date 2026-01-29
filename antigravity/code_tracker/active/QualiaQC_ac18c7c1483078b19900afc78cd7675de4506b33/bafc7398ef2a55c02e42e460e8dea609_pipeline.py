±"""
Sub-pipeline for report generation and archiving.
Coordinates plot generation, data processing, and document building.
"""

import os
from pathlib import Path
from typing import Dict, Optional
from src.utils.logging_utils import setup_logger
from src.exceptions import ResourceError
from src.db import DatabaseManager, SessionLocal
from .generator import ReportGenerator

logger = setup_logger(__name__)

class ReportingPipeline:
    """
    Coordinates the reporting and archiving phase.
    """
    def __init__(self, project_name: str, sample_name: Optional[str] = None, debug_mode: bool = False):
        self.project_name = project_name
        self.debug_mode = debug_mode
        self.generator = ReportGenerator(
            project_name=project_name, 
            sample_name=sample_name, 
            debug_mode=debug_mode
        )
        self.db_manager = DatabaseManager()

    def run(self, 
            analysis_results: Dict, 
            metadata: Dict, 
            debug_data: Optional[Dict] = None, 
            external_pdf_path: Optional[str] = None, 
            masked_image_path: Optional[str] = None, 
            logo_path: Optional[Path] = None) -> Dict:
        """
        Orchestrates the generation of the final report.
        """
        logger.info("Running Reporting sub-pipeline...")
        
        try:
            report_data = self.generator.generate_report(
                analysis_results=analysis_results,
                metadata=metadata,
                debug_data=debug_data,
                external_pdf_path=external_pdf_path,
                masked_image_path=masked_image_path,
                logo_path=logo_path
            )
            
            logger.info("Reporting phase completed.")
            return report_data
            
        except Exception as e:
            logger.error(f"Reporting error: {e}")
            return {}

    def run_from_session(self, session_id: str, db: Optional['SessionLocal'] = None) -> Dict:
        """
        Regenerates a report using data and assets stored in the database.
        """
        logger.info(f"Regenerating report from session: {session_id}")
        
        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True
            
        try:
            session = self.db_manager.get_session(db, session_id)
            if not session:
                raise ResourceError(f"Session {session_id} not found.")
            
            # 1. Rehydrate metadata and results
            metadata = session.metadata_info
            results_snapshot = session.results_snapshot
            
            if not results_snapshot:
                # Fallback to reconstructing from metrics if snapshot is missing (for older sessions)
                results_snapshot = {m.key: m.value for m in session.metrics}
            
            # 2. Identify assets
            masked_img_path = None
            logo_path = None
            for asset in session.assets:
                if asset.role == "masked_image":
                    masked_img_path = asset.file_path
                elif asset.role == "logo":
                    logo_path = Path(asset.file_path)
            
            # 3. Regenerate Report
            report_data = self.generator.generate_report(
                analysis_results=results_snapshot,
                metadata=metadata,
                debug_data=session.pipeline_args,
                masked_image_path=masked_img_path,
                logo_path=logo_path
            )
            
            return report_data
            
        finally:
            if should_close:
                db.close()
            
    def get_step_dir(self, step_name: str) -> str:
        """Proxy to the generator's directory management."""
        return str(self.generator.get_step_output_dir(step_name))
±"(ac18c7c1483078b19900afc78cd7675de4506b332Jfile:///c:/Users/Admin/Documents/Coding/QualiaQC/src/reporting/pipeline.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC