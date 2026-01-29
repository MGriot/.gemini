‹)"""
This module defines the global configuration and data models for the QualiaQC application.
It uses Pydantic for validation and type safety.
"""

import os
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import numpy as np
from pydantic import BaseModel, Field, ConfigDict

# ==============================================================================
# Global Path Constants
# ==============================================================================

ROOT_DIR = Path(__file__).parent.parent
DATA_DIR = ROOT_DIR / "data"
PROJECTS_DIR = DATA_DIR / "projects"
OUTPUT_DIR = ROOT_DIR / "output"
CACHE_DIR = OUTPUT_DIR / "cache"
REFERENCE_COLOR_CHECKERS_DIR = DATA_DIR / "reference_color_checkers"
HISTORY_DIR = DATA_DIR / "history"
DATABASE_PATH = DATA_DIR / "qualia_qc.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
PROJECT_STORAGE_DIR = DATA_DIR / "storage" / "projects"

# Default Reference Paths
REFERENCE_CHECKER_8X10_PATH = REFERENCE_COLOR_CHECKERS_DIR / "TEOGRIM_8x10_Reference.png"
REFERENCE_CHECKER_DEFAULT_PATH = REFERENCE_CHECKER_8X10_PATH

# Templates and Assets
TEMPLATES_DIR = ROOT_DIR / "src" / "templates"
REFERENCE_IMAGES_DIR = DATA_DIR / "reference_images"
LOGO_DIR = DATA_DIR / "logo"
LOGO_PATH = LOGO_DIR / "logo.png"

# Default Global Reference Paths
GLOBAL_ARUCO_REFERENCE_PATH = REFERENCE_IMAGES_DIR / "global_aruco_reference.png"
GLOBAL_COLOR_CHECKER_REFERENCE_PATH = REFERENCE_IMAGES_DIR / "global_TEOGRIM_reference.png"
GLOBAL_COLOR_CHECKER_JSON_PATH = REFERENCE_IMAGES_DIR / "global_TEOGRIM_reference.json"

# Default Metadata
DEFAULT_AUTHOR = "Griot Matteo"
DEFAULT_DEPARTMENT = "Department"
DEFAULT_REPORT_TITLE = "QualiaQC Analysis Report"

# ==============================================================================
# Data Models
# ==============================================================================

class Point(BaseModel):
    """Represents a coordinate point with an optional sampling radius."""
    x: int
    y: int
    radius: int = 7

class ImageConfig(BaseModel):
    """Configuration for processing a specific image in a dataset."""
    filename: str
    method: str  # e.g., "full_average", "points"
    points: Optional[List[Point]] = None

class DatasetItemProcessingConfig(BaseModel):
    """Configuration for processing multiple images in a dataset."""
    model_config = ConfigDict(extra='allow')
    image_configs: List[ImageConfig] = Field(default_factory=list)

class ColorCorrectionConfig(BaseModel):
    """Paths and settings for color correction."""
    reference_color_checker_path: str
    project_specific_color_checker_path: Optional[str] = None

class GeometricalAlignmentConfig(BaseModel):
    """Settings for ArUco-based geometrical alignment."""
    reference_path: Optional[str] = None
    marker_map: Dict[str, List[List[int]]] = Field(default_factory=dict)
    output_size: Tuple[int, int] = (1000, 1000)

class MaskingConfig(BaseModel):
    """Configuration for drawing layers used in masking."""
    drawing_layers: Dict[str, str] = Field(default_factory=dict)

class ProjectConfig(BaseModel):
    """The master configuration for a QualiaQC project."""
    model_config = ConfigDict(extra='allow')
    
    calibration_path: str = "calibration_images"
    object_reference_path: Optional[str] = None
    logo_path: Optional[str] = None
    
    color_correction: ColorCorrectionConfig
    geometrical_alignment: GeometricalAlignmentConfig = Field(default_factory=GeometricalAlignmentConfig)
    masking: MaskingConfig = Field(default_factory=MaskingConfig)

# ==============================================================================
# Phase Result Models (Standardized IO)
# ==============================================================================

class PhaseResult(BaseModel):
    """Base class for all pipeline phase outputs."""
    model_config = ConfigDict(arbitrary_types_allowed=True)
    success: bool = True
    message: str = ""
    debug_paths: Dict[str, str] | List[Dict] = Field(default_factory=dict)

class ColorCorrectionResult(PhaseResult):
    corrected_image: Optional[np.ndarray] = None
    correction_model: Optional[Dict] = None

class AlignmentResult(PhaseResult):
    image: Optional[np.ndarray] = None
    alignment_data: Optional[Dict] = None

class MaskingResult(PhaseResult):
    image: Optional[np.ndarray] = None
    stats: Optional[Dict] = None
    path: Optional[str] = None

class ColorAnalysisResult(PhaseResult):
    processed_image: Optional[np.ndarray] = None
    processed_image_path: Optional[str] = None
    mask: Optional[np.ndarray] = None
    binary_mask: Optional[np.ndarray] = None
    percentage: float = 0.0
    matched_pixels: int = 0
    total_pixels: int = 0
    lower_limit: Optional[np.ndarray] = None
    upper_limit: Optional[np.ndarray] = None
    center_color: Optional[np.ndarray] = None
    selected_colors: List[Dict] = Field(default_factory=list)
    debug_info: List[Dict] = Field(default_factory=list)

class SymmetryAnalysisResult(PhaseResult):
    results: Dict = Field(default_factory=dict)
    visualizations: List[Dict] = Field(default_factory=list)

# Compatibility aliases
AUTHOR = DEFAULT_AUTHOR
DEPARTMENT = DEFAULT_DEPARTMENT
REPORT_TITLE = DEFAULT_REPORT_TITLE
‹)"(ac18c7c1483078b19900afc78cd7675de4506b332>file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/config.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC