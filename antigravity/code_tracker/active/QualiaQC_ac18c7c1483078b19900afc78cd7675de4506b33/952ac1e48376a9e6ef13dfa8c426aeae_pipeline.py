ݣ"""
This module defines the main analysis pipeline for the QualiaQC application.
It acts as a pure orchestrator, coordinating specialized sub-pipelines.
"""

import os
import cv2
import numpy as np
import warnings
import pickle
from pathlib import Path
from typing import Optional, Dict, List

# Suppress NumPy warnings from operations like empty slices
warnings.filterwarnings("ignore", category=RuntimeWarning, module="numpy")

# Core Sub-Pipelines
from src.color_analysis.pipeline import ColorAnalysisPipeline
from src.color_correction.pipeline import ColorCorrectionPipeline
from src.geometric_alignment.pipeline import GeometricAlignmentPipeline
from src.object_alignment.pipeline import ObjectAlignmentPipeline
from src.masking.pipeline import MaskingPipeline
from src.reporting.pipeline import ReportingPipeline
from src.symmetry_analysis.pipeline import SymmetryAnalysisPipeline

# Utilities
from src.project_management.manager import ProjectManager
from src.utils.image_utils import load_image
from src.utils.logging_utils import setup_logger
from src.utils.metadata_utils import extract_metadata_from_filename
from src.reporting.utils import generate_report_folder_name, archive_debug_image
from src.db import DatabaseManager, SessionLocal, SessionStatus, AssetType
from src import config
from src.exceptions import PipelineError, ProjectError, QualiaQCError

logger = setup_logger(__name__)

class Pipeline:
    """
    Pure orchestrator for the analysis workflow.
    
    It manages high-level state and delegates all business logic to specialized 
    sub-pipelines. This class follows the Orchestrator pattern to maintain 
    separation of concerns and high-level readability of the analysis lifecycle.

    Attributes:
        args (argparse.Namespace): Runtime arguments and configurations.
        project_manager (ProjectManager): Utility for project data and caching.
        project_data (Optional[Dict]): Cached/calculated project parameters.
        image_path (Optional[str]): Path to the current image being processed.
        image_to_be_processed (Optional[np.ndarray]): The working image state.
        analysis_results (Optional[Dict]): Final statistical and visual results.
        metadata (Dict): Extracted information like Part Number and Thickness.
    """
    def __init__(self, args: 'argparse.Namespace'):
        """
        Initializes the Pipeline with runtime arguments.

        Args:
            args (argparse.Namespace): Command-line arguments.
        """
        self.args = args
        self.project_manager = ProjectManager()
        
        self.project_data: Optional[Dict] = None
        self.image_path: Optional[str] = None
        self.image_to_be_processed: Optional[np.ndarray] = None
        self.analysis_results: Optional[Dict] = None
        self.metadata: Dict = {}
        
        # Database and Persistence
        self.db_manager = DatabaseManager()
        self.db_session = SessionLocal()
        self.analysis_session_id: Optional[str] = None
        
        # Reporting and Debugging State
        self.reporting_pipeline: Optional[ReportingPipeline] = None
        self.debug_data_for_report: Dict = {}
        self.debug_image_pipeline: List[Dict] = []
        self.masked_image_path: Optional[str] = None
        self.report_data: Optional[Dict] = None
        self.pipeline_step_counter = 1

    def load_project_data(self):
        """
        Loads project configuration and derived data via the ProjectManager.

        Retrieves HSV ranges, correction matrices, and dataset info, utilizing
        caching if available.

        Raises:
            ProjectError: If data retrieval or calculation fails.
        """
        try:
            self.project_data = self.project_manager.get_project_data(self.args.project, debug_mode=self.args.debug)
            logger.info(f"Loaded project data for '{self.args.project}'.")
        except Exception as e:
            raise ProjectError(f"Initialization failed: {e}")

    def process_image(self, image_path: str, **overrides):
        """
        Coordinates the full processing chain for a single image.

        Handles initialization, loading, execution of the full pipeline, 
        and optional metadata overrides.

        Args:
            image_path (str): File system path to the image to analyze.
            **overrides: Metadata fields to override filename-based extraction.
        """
        self.image_path = image_path
        
        # 1. Initialization (Delegated to Utils)
        self.metadata = extract_metadata_from_filename(image_path, overrides)
        self._initialize_reporting()
        
        # 2. Loading
        self.image_to_be_processed, _ = load_image(self.image_path)
        
        # 2.5 Persistence: Create Database Session and Archive Original
        self._initialize_db_session()
        self._archive_input_image()
        
        if self.args.debug: self._handle_debug_init()

        # 3. Execution Chain
        self.run_full_pipeline()
        
        # 4. Finalize Session
        self._finalize_db_session()

    def _initialize_reporting(self):
        """
        Initializes the reporting sub-pipeline.

        Sets up sample-specific output directories and naming conventions.
        """
        output_folder_name = generate_report_folder_name(self.metadata)

        self.reporting_pipeline = ReportingPipeline(
            project_name=self.args.project, 
            sample_name=output_folder_name, 
            debug_mode=self.args.debug
        )

    def _handle_debug_init(self):
        """
        Prepares the debug environment for the report.

        Archives the original input image and captures dataset-level debug info.
        """
        res = archive_debug_image(
            self.image_path, 
            self.reporting_pipeline.generator.project_output_dir, 
            self.pipeline_step_counter
        )
        self.debug_image_pipeline.append(res)
        self.pipeline_step_counter += 1
        
        self.debug_data_for_report["dataset_debug_info"] = self.project_data.get("dataset_debug_info")

    def _initialize_db_session(self):
        """Creates a new record for this analysis run in the database."""
        # Standardize args for DB (pydantic model_dump or vars)
        args_dict = vars(self.args)
        
        session = self.db_manager.create_session(
            db=self.db_session,
            project_name=self.args.project,
            config_snapshot=self.project_data.get("config", {}), # Assuming we have config in project_data
            pipeline_args=args_dict,
            metadata_info=self.metadata
        )
        self.analysis_session_id = session.id
        logger.info(f"Initialized Analysis Session: {self.analysis_session_id}")

    def _archive_input_image(self):
        """Copies the original image to a structured history folder for full auditability."""
        if not self.analysis_session_id: return
        
        # Define destination: data/history/YYYY/MM/SESSION_ID/assets/original.png
        now = self.db_manager.get_session(self.db_session, self.analysis_session_id).created_at
        save_path = config.HISTORY_DIR / f"{now.year}" / f"{now.month:02d}" / self.analysis_session_id / "assets"
        save_path.mkdir(parents=True, exist_ok=True)
        
        filename = os.path.basename(self.image_path)
        dest = save_path / f"source_{filename}"
        
        import shutil
        shutil.copy2(self.image_path, dest)
        
        # Track in DB
        self.db_manager.add_asset(
            db=self.db_session,
            session_id=self.analysis_session_id,
            asset_type=AssetType.ORIGINAL_IMAGE,
            role="source_image",
            file_path=str(dest)
        )
        logger.info(f"Archived source image to History: {dest}")

    def _finalize_db_session(self):
        """Updates session status and records final metrics."""
        if not self.analysis_session_id: return
        
        self.db_manager.update_session_status(
            db=self.db_session,
            session_id=self.analysis_session_id,
            status=SessionStatus.COMPLETED
        )
        
        # Record metrics if they exist
        if self.analysis_results:
            results = self.analysis_results
            
            # Save metrics
            self.db_manager.add_metric(
                db=self.db_session,
                session_id=self.analysis_session_id,
                category="color_analysis",
                key="matched_percentage",
                value=results.percentage,
                unit="%"
            )
            self.db_manager.add_metric(
                db=self.db_session,
                session_id=self.analysis_session_id,
                category="color_analysis",
                key="matched_pixels",
                value=float(results.matched_pixels),
                unit="px"
            )
            
            # Save full snapshot for regeneration (converting pydantic to dict if needed)
            res_dict = results.model_dump() if hasattr(results, 'model_dump') else vars(results)
            
            # 1. Remove raw image data from snapshot to save space (since we archive the files)
            # and to avoid serialization errors for large ndarrays
            for large_attr in ['original_image', 'processed_image', 'mask', 'binary_mask']:
                if large_attr in res_dict:
                    res_dict[large_attr] = None
            
            # 2. Convert small ndarray parameters to lists for JSON serialization
            for small_attr in ['lower_limit', 'upper_limit', 'center_color']:
                if small_attr in res_dict and isinstance(res_dict[small_attr], np.ndarray):
                    res_dict[small_attr] = res_dict[small_attr].tolist()
            
            self.db_manager.update_session_results(
                db=self.db_session,
                session_id=self.analysis_session_id,
                results_snapshot=res_dict
            )
        
        logger.info(f"Finalized Analysis Session: {self.analysis_session_id}")

    def _track_debug_step(self, title: str, filename: str):
        """
        Adds a step to the visual pipeline report.

        Args:
            title (str): Descriptive name of the processing step.
            filename (str): Path to the saved image for this step (relative to output root).
        """
        self.debug_image_pipeline.append({
            "title": f"{self.pipeline_step_counter}. {title}",
            "path": filename
        })
        self.pipeline_step_counter += 1

    def run_full_pipeline(self):
        """
        Orchestrates the execution of all enabled sub-pipelines in strict order.

        Transitions the image through correction, alignment, masking, and analysis phases.

        Raises:
            QualiaQCError: If any critical phase fails and halts the pipeline.
        """
        try:
            if self.args.color_alignment: self._do_color_correction()
            if self.args.alignment:       self._do_geometric_alignment()
            if self.args.object_alignment: self._do_object_alignment()
            if self.args.apply_mask:      self._do_masking()
            if self.args.blur:            self._do_blur()
            
            if not self.args.skip_color_analysis: 
                self._do_color_analysis()
                if self.args.symmetry: self._do_symmetry_analysis()

            if not self.args.skip_report_generation:
                self.generate_report()

        except QualiaQCError as e:
            logger.error(f"Pipeline execution halted: {e}")
            raise

    # --- Sub-Pipeline Integration Methods ---

    def _do_color_correction(self):
        step_dir = self.reporting_pipeline.get_step_dir("color_correction")
        cc_pipe = ColorCorrectionPipeline(debug_mode=self.args.debug, output_dir=step_dir)
        
        # Input selection
        photo = self.args.sample_color_checker
        if not photo:
            p_files = self.project_manager.get_project_file_paths(self.args.project)
            photo = p_files.get("project_specific_color_checker")

        if not photo or not os.path.exists(photo): return

        res = cc_pipe.run(self.image_to_be_processed, str(photo), self.args.color_correction_method)
        if res.corrected_image is not None:
            self.image_to_be_processed = res.corrected_image
            if self.args.debug:
                for k, p in res.debug_paths.items():
                    rel = os.path.relpath(p, self.reporting_pipeline.generator.project_output_dir)
                    self._track_debug_step(f"CC: {k}", rel)

    def _do_geometric_alignment(self):
        step_dir = self.reporting_pipeline.get_step_dir("geometrical_alignment")
        ga_pipe = GeometricAlignmentPipeline(debug_mode=self.args.debug, output_dir=step_dir)
        
        p_files = self.project_manager.get_project_file_paths(self.args.project)
        conf = p_files.get("geometrical_alignment_config")
        ref = p_files.get("geometrical_alignment_reference_path")

        res = ga_pipe.run(self.image_to_be_processed, aruco_reference_path=str(ref) if ref else None, 
                          marker_map=conf.marker_map, output_size_wh=conf.output_size)
        if res.image is not None:
            self.image_to_be_processed = res.image
            if self.args.debug:
                for k, p in res.debug_paths.items():
                    rel = os.path.relpath(p, self.reporting_pipeline.generator.project_output_dir)
                    self._track_debug_step(f"GA: {k}", rel)

    def _do_object_alignment(self):
        step_dir = self.reporting_pipeline.get_step_dir("object_alignment")
        oa_pipe = ObjectAlignmentPipeline(debug_mode=self.args.debug, output_dir=step_dir)
        
        p_files = self.project_manager.get_project_file_paths(self.args.project)
        ref_p = p_files.get("object_reference_path")
        if not ref_p or not os.path.exists(ref_p): return
        ref_img, _ = load_image(str(ref_p))

        res = oa_pipe.run(self.image_to_be_processed, ref_img, shadow_removal=self.args.object_alignment_shadow_removal)
        if res.image is not None:
            self.image_to_be_processed = res.image
            if self.args.debug:
                for k, p in res.debug_paths.items():
                    rel = os.path.relpath(p, self.reporting_pipeline.generator.project_output_dir)
                    self._track_debug_step(f"OA: {k}", rel)

    def _do_masking(self):
        step_dir = self.reporting_pipeline.get_step_dir("masking")
        m_pipe = MaskingPipeline(debug_mode=self.args.debug, output_dir=step_dir)
        p_files = self.project_manager.get_project_file_paths(self.args.project)
        
        order = [l for l in self.args.masking_order.split("-") if l] if self.args.masking_order else []
        res = m_pipe.run(self.image_to_be_processed, p_files.get("technical_drawing_paths", {}), 
                         order, self.args.mask_bg_is_white)
        
        if res.image is not None:
            self.image_to_be_processed = res.image
            self.masked_image_path = res.path
            if self.args.debug:
                for d in res.debug_paths: # This was a list in raw but result model might differ?
                    # Let's check config.py for MaskingResult
                    pass
                # Standardize to dict if it was a list of dicts
                if isinstance(res.debug_paths, list):
                    for d in res.debug_paths:
                        rel = os.path.relpath(d['path'], self.reporting_pipeline.generator.project_output_dir)
                        self._track_debug_step(d['title'], rel)
                else:
                    for k, p in res.debug_paths.items():
                        rel = os.path.relpath(p, self.reporting_pipeline.generator.project_output_dir)
                        self._track_debug_step(f"Mask: {k}", rel)

    def _do_blur(self):
        from src.utils.image_utils import blur_image
        res = blur_image(self.image_to_be_processed, self.args.blur_kernel)
        self.image_to_be_processed = res["image"]

    def _do_color_analysis(self):
        step_dir = self.reporting_pipeline.get_step_dir("color_analysis")
        ca_pipe = ColorAnalysisPipeline(debug_mode=self.args.debug)
        
        self.analysis_results = ca_pipe.run(
            self.image_to_be_processed, self.project_data["lower_hsv"], self.project_data["upper_hsv"],
            self.project_data["center_hsv"], step_dir, aggregate_mode=self.args.aggregate,
            agg_kernel_size=self.args.agg_kernel_size, agg_min_area=self.args.agg_min_area,
            agg_density_thresh=self.args.agg_density_thresh
        )
        if self.args.debug:
            for d in self.analysis_results.debug_info:
                rel = os.path.relpath(d['path'], self.reporting_pipeline.generator.project_output_dir)
                self._track_debug_step(f"CA: {d['title']}", rel)

    def _do_symmetry_analysis(self):
        step_dir = self.reporting_pipeline.get_step_dir("symmetry_analysis")
        s_pipe = SymmetryAnalysisPipeline(debug_mode=self.args.debug, output_dir=step_dir)
        
        res = s_pipe.run(self.analysis_results.binary_mask)
        self.debug_data_for_report["symmetry_results"] = res.results
        if self.args.debug:
            for v in res.visualizations:
                rel = os.path.relpath(v['path'], self.reporting_pipeline.generator.project_output_dir)
                self._track_debug_step(v['title'], rel)

    def generate_report(self, external_pdf_path: Optional[str] = None):
        """Delegates final document generation to the reporting pipeline."""
        if not self.reporting_pipeline: return None
        
        self.debug_data_for_report["image_pipeline"] = self.debug_image_pipeline
        
        rel_mask = None
        if self.masked_image_path:
            rel_mask = os.path.relpath(self.masked_image_path, self.reporting_pipeline.generator.project_output_dir)

        p_files = self.project_manager.get_project_file_paths(self.args.project)
        
        self.report_data = self.reporting_pipeline.run(
            self.analysis_results, self.metadata, self.debug_data_for_report,
            external_pdf_path, rel_mask, p_files.get("logo_path")
        )
        
        # Track PDF in DB if session exists
        if self.analysis_session_id and self.report_data and self.report_data.get("pdf_path"):
            pdf_abs_path = self.report_data.get("pdf_path")
            self.db_manager.add_asset(
                db=self.db_session,
                session_id=self.analysis_session_id,
                asset_type=AssetType.REPORT_PDF,
                role="pdf_report",
                file_path=str(pdf_abs_path)
            )
            logger.info(f"PDF report tracked in DB: {pdf_abs_path}")

        return self.report_data

    def save_state(self, path: str):
        """DEPRECATED: Use DB-based history. Retained for CLI compatibility."""
        with open(path, "wb") as f: pickle.dump(self, f)

    @staticmethod
    def load_state(path: str) -> 'Pipeline':
        """DEPRECATED: Use DB-based history. Retained for CLI compatibility."""
        with open(path, "rb") as f: return pickle.load(f)

    def __del__(self):
        """Ensure DB session is closed."""
        if hasattr(self, 'db_session'):
            self.db_session.close()


def run_analysis(args):
    """Main application loop runner."""
    try:
        if args.load_state_from:
            pipeline = Pipeline.load_state(args.load_state_from)
            pipeline.args = args
        else:
            pipeline = Pipeline(args)
            pipeline.load_project_data()

        if args.image:
            if os.path.isdir(args.image):
                for f in os.listdir(args.image):
                    if f.lower().endswith((".png", ".jpg", ".jpeg")):
                        pipeline.process_image(os.path.join(args.image, f))
                return None
            else:
                pipeline.process_image(
                    args.image, 
                    part_number=getattr(args, 'part_number', None),
                    thickness=getattr(args, 'thickness', None),
                    author=getattr(args, 'author', None),
                    department=getattr(args, 'department', None),
                    report_title=getattr(args, 'report_title', None)
                )
                if args.save_state_to: pipeline.save_state(args.save_state_to)
                return pipeline
        return None

    except QualiaQCError as e:
        logger.error(f"QualiaQC Error: {e}")
        return None
    except Exception as e:
        logger.error(f"Critical System Failure: {e}")
        if args.debug:
            import traceback
            traceback.print_exc()
        return Noneݣ"(ac18c7c1483078b19900afc78cd7675de4506b332@file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/pipeline.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC