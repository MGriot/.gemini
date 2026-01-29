‘è"""
This module defines the `ProjectManager` class, responsible for handling project-specific
configurations, file paths, and cached analysis data within the Visual Analyzer application.

It provides functionalities to list projects, retrieve project and dataset item processing
configurations, and calculate HSV color ranges and color correction matrices, with caching
mechanisms to optimize performance.
"""

import os
import cv2
import numpy as np
from typing import List, Tuple, Dict, Optional, Any
from pathlib import Path
import json
import time
from pydantic import ValidationError

from src.utils.logging_utils import setup_logger
from src import config
from src.utils.image_utils import load_image
from src.color_correction.corrector import ColorCorrector
from src.sample_manager.dataset_item_processor import DatasetItemProcessor
from src.config import ProjectConfig, DatasetItemProcessingConfig

logger = setup_logger(__name__)
from src.db import DatabaseManager, SessionLocal, AssetType

def get_portable_basename(path_str: str) -> str:
    """Extracts the filename from a path string, handling both Windows and POSIX separators."""
    if not path_str: return ""
    return str(path_str).replace('\\', '/').split('/')[-1]


class ProjectManager:
    """
    Manages Visual Analyzer projects, including listing available projects,
    providing paths to reference color checkers and dataset images, and
    calculating average HSV colors. It also handles caching of calculated
    color correction matrices and HSV ranges to improve performance.
    """

    def __init__(self):
        """
        Initializes the ProjectManager.
        """
        self.projects_root = config.PROJECTS_DIR
        self.managed_root = config.PROJECT_STORAGE_DIR
        self.managed_root.mkdir(parents=True, exist_ok=True)
        
        self.color_corrector = ColorCorrector()
        self.dataset_item_processor = DatasetItemProcessor()
        self.cache_dir = config.OUTPUT_DIR / "cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.debug_mode = False
        self.db_manager = DatabaseManager()
        self._handle_data_migration() # Rename folders
        self.sync_projects_from_disk()

    def _handle_data_migration(self):
        """Rename training_images directories and heal invalid absolute paths in DB and Config."""
        db = SessionLocal()
        try:
            projects = self.db_manager.list_projects(db)
            for project in projects:
                project_id = project.id
                project_path = self.managed_root / project_id
                
                # 1. Folder Migration
                old_dir = project_path / "training_images"
                new_dir = project_path / "calibration_images"
                if old_dir.exists() and not new_dir.exists():
                    logger.info(f"Migrating folder: {old_dir} -> {new_dir}")
                    try: old_dir.rename(new_dir)
                    except Exception as e: logger.error(f"Failed to rename folder {old_dir}: {e}")

                # 2. Asset Path Healing (Database Table)
                assets = self.db_manager.list_project_assets(db, project_id=project_id)
                for asset in assets:
                    if not asset.file_path: continue
                    
                    current_p = Path(asset.file_path)
                    is_invalid = not current_p.exists() or (os.name == 'nt' and asset.file_path.startswith('/app/'))
                    
                    if is_invalid:
                        sub_dir = "assets"
                        if asset.category == "calibration_image": sub_dir = "calibration_images"
                        elif asset.category == "drawing_layer": sub_dir = "drawing_layers"
                        
                        potential_path = project_path / sub_dir / asset.filename
                        if potential_path.exists():
                            logger.info(f"Healing DB asset path for {asset.filename}: {potential_path}")
                            asset.file_path = str(potential_path)

                # 3. Recursive Config Healing (JSON)
                if project.config:
                    def heal_dict(d):
                        modified = False
                        if not isinstance(d, dict): return modified
                        
                        # Handle specific key rename first
                        if 'training_path' in d:
                            d['calibration_path'] = d.pop('training_path').replace('training_images', 'calibration_images')
                            modified = True

                        for k, v in d.items():
                            if isinstance(v, dict):
                                if heal_dict(v): modified = True
                            elif isinstance(v, str):
                                # Check if it looks like a path we need to heal
                                looks_like_absolute = v.startswith('/') or (len(v) > 2 and v[1:3] == ':\\')
                                
                                if looks_like_absolute or not Path(v).exists():
                                    # Try to extract filename robustly
                                    filename = get_portable_basename(v)
                                    sub_dir = "assets"
                                    if "drawing_layers" in v: sub_dir = "drawing_layers"
                                    elif "calibration_images" in v or "training_images" in v: sub_dir = "calibration_images"
                                    
                                    potential = project_path / sub_dir / filename
                                    if potential.exists():
                                        # Prefer relative paths in config for portability
                                        d[k] = f"{sub_dir}/{filename}"
                                        modified = True
                                    elif "/app/data/" in v or looks_like_absolute:
                                        # Force relative for fallback
                                        d[k] = f"{sub_dir}/{filename}"
                                        modified = True
                        return modified

                    config_data = dict(project.config)
                    if heal_dict(config_data):
                        project.config = config_data
                        logger.info(f"Healed config JSON for project: {project.name}")

            db.commit()
        finally:
            db.close()

    def sync_projects_from_disk(self):
        """
        Imports projects from the filesystem into the database and moves them to managed storage if needed.
        """
        if not self.projects_root.exists():
            return

        db = SessionLocal()
        try:
            for project_dir in self.projects_root.iterdir():
                if not project_dir.is_dir():
                    continue
                
                project_name = project_dir.name
                # Skip if already in DB
                existing = self.db_manager.get_project(db, name=project_name)
                if existing:
                    continue

                logger.info(f"Syncing legacy project to DB: {project_name}")
                
                # Load configs
                config_path = project_dir / "project_config.json"
                dataset_config_path = project_dir / "dataset_item_processing_config.json"
                
                project_config = {}
                if config_path.exists():
                    with open(config_path, "r") as f:
                        project_config = json.load(f)
                
                dataset_config = {"image_configs": []}
                if dataset_config_path.exists():
                    with open(dataset_config_path, "r") as f:
                        dataset_config = json.load(f)
                
                # Create project in DB
                project = self.db_manager.create_project(db, name=project_name, config=project_config, dataset_processing_config=dataset_config)
                
                # Register assets and migrate them
                self._migrate_and_register_project_assets(db, project, project_dir)
                
            db.commit()
        except Exception as e:
            logger.error(f"Error syncing projects from disk: {e}")
        finally:
            db.close()

    def _migrate_and_register_project_assets(self, db, project, legacy_dir: Path):
        """Migrates legacy files to managed storage and registers them in DB."""
        import shutil
        
        # Managed storage path
        managed_base = config.DATA_DIR / "storage" / "projects" / project.id
        managed_base.mkdir(parents=True, exist_ok=True)

        def move_and_add(src_rel_path, category, sub_dir="assets"):
            src_path = legacy_dir / src_rel_path
            if not src_path.exists(): return
            
            dest_dir = managed_base / sub_dir
            dest_dir.mkdir(parents=True, exist_ok=True)
            
            if src_path.is_file():
                dest_path = dest_dir / src_path.name
                shutil.copy2(src_path, dest_path) # Using copy for safety during transition
                self.db_manager.add_project_asset(db, project.name, category, src_path.name, str(dest_path), project_id=project.id)
            elif src_path.is_dir():
                for f in src_path.iterdir():
                    if f.is_file() and f.suffix.lower() in [".png", ".jpg", ".jpeg"]:
                        dest_path = dest_dir / f.name
                        shutil.copy2(f, dest_path)
                        self.db_manager.add_project_asset(db, project.name, category, f.name, str(dest_path), project_id=project.id)

        # 1. Calibration Images
        move_and_add("dataset/calibration_images", "calibration_image", "calibration_images")
        move_and_add("dataset/training_images", "calibration_image", "calibration_images") # Also check old location during sync
        
        # 2. Drawing Layers
        move_and_add("dataset/drawing_layers", "drawing_layer", "drawing_layers")
        
        # 3. Main Dataset Assets (Checkers, Refs)
        dataset_path = legacy_dir / "dataset"
        if dataset_path.exists():
            for f in dataset_path.iterdir():
                if f.is_file() and f.suffix.lower() in [".png", ".jpg", ".jpeg"]:
                    category = "unknown"
                    if "aruco" in f.name.lower(): category = "aruco_ref"
                    elif "object" in f.name.lower(): category = "object_ref"
                    elif "checker" in f.name.lower(): 
                        if "reference" in f.name.lower(): category = "ideal_checker"
                        else: category = "project_specific_color_checker"
                    
                    move_and_add(f"dataset/{f.name}", category, "assets")

    def create_project(self, name: str) -> List[str]:
        """
        Scaffolds a new project in the database and managed storage.
        """
        messages = []
        db = SessionLocal()
        try:
            # 1. DB Check
            existing = self.db_manager.get_project(db, name=name)
            if existing:
                return [f"Error: Project '{name}' already exists."]

            # 2. Scaffolding
            # Construct default config
            global_cc_path = str(config.GLOBAL_COLOR_CHECKER_REFERENCE_PATH.resolve()).replace('\\', '/')
            global_aruco_path = str(config.GLOBAL_ARUCO_REFERENCE_PATH.resolve()).replace('\\', '/')

            default_config = {
                "calibration_path": "calibration_images",
                "object_reference_path": "assets/object_reference.png",
                "color_correction": {
                    "reference_color_checker_path": global_cc_path,
                    "project_specific_color_checker_path": "assets/project_color_checker.png"
                },
                "geometrical_alignment": {
                    "reference_path": global_aruco_path,
                    "marker_map": {},
                    "output_size": [1000, 1000]
                },
                "masking": {
                    "drawing_layers": {
                        "1": "drawing_layers/layer1.png",
                        "2": "drawing_layers/layer2.png",
                        "3": "drawing_layers/layer3.png"
                    }
                }
            }

            # 3. Create in DB
            project = self.db_manager.create_project(db, name=name, config=default_config)
            messages.append(f"Registered project '{name}' in database (ID: {project.id}).")

            # 4. Create Directories in Managed Storage
            project_path = self.managed_root / project.id
            (project_path / "calibration_images").mkdir(parents=True, exist_ok=True)
            (project_path / "drawing_layers").mkdir(parents=True, exist_ok=True)
            (project_path / "assets").mkdir(parents=True, exist_ok=True)
            
            messages.append(f"Created managed storage at {project_path}")
            
            # 5. Initialize Assets in DB
            # We add placeholders to DB so resolution works
            self.db_manager.add_project_asset(db, name, "ideal_checker", "global_reference", global_cc_path, project_id=project.id)
            self.db_manager.add_project_asset(db, name, "aruco_ref", "global_reference", global_aruco_path, project_id=project.id)

            db.commit()
            messages.append(f"Project '{name}' initialized successfully.")
            return messages

        except Exception as e:
            logger.error(f"Failed to create project: {e}")
            return [f"Error: {e}"]
        finally:
            db.close()

    def delete_project(self, project_name: str) -> List[str]:
        """
        Deletes a project completely from the database and managed storage.
        """
        messages = []
        db = SessionLocal()
        try:
            project = self.db_manager.get_project(db, name=project_name)
            if not project:
                return [f"Error: Project '{project_name}' not found."]

            project_id = project.id
            
            # 1. Delete Managed Storage
            project_storage = self.managed_root / project_id
            if project_storage.exists():
                import shutil
                try:
                    shutil.rmtree(project_storage)
                    messages.append(f"Deleted managed storage at {project_storage}")
                except Exception as e:
                    messages.append(f"Warning: Failed to delete some files in storage: {e}")

            # 2. Delete from DB (Assets and metrics are cascade deleted by SQLAlchemy)
            db.delete(project)
            db.commit()
            messages.append(f"Deleted project '{project_name}' from database.")
            
            # 3. Clear Cache
            self.clear_cache_for_project(project_name)
            
            return messages
        except Exception as e:
            logger.error(f"Failed to delete project: {e}")
            return [f"Error: {e}"]
        finally:
            db.close()

    def _get_cache_file_path(self, project_name: str) -> Path:
        """
        Constructs the file path for the cache file associated with a given project.
        """
        return self.cache_dir / f"{project_name}_cache.json"

    def clear_cache_for_project(self, project_name: str):
        """
        Deletes the cache file and associated cached images for a specific project.
        """
        cache_file_path = self._get_cache_file_path(project_name)
        if cache_file_path.exists():
            try:
                os.remove(cache_file_path)
                if self.debug_mode:
                    print(f"[DEBUG] Deleted cache file: {cache_file_path}")
            except OSError as e:
                print(f"[ERROR] Could not delete cache file {cache_file_path}: {e}")

        # Also remove any cached corrected calibration images for that project
        try:
            for f in self.cache_dir.glob(f"{project_name}_corrected_calibration_*.png"):
                os.remove(f)
                if self.debug_mode:
                    print(f"[DEBUG] Deleted cached image: {f}")
        except Exception as e:
            print(f"[ERROR] Error deleting cached images for project {project_name}: {e}")

    def list_projects(self) -> List[str]:
        """
        Lists the names of all available projects from the database.
        """
        db = SessionLocal()
        try:
            projects = self.db_manager.list_projects(db)
            return [p.name for p in projects]
        finally:
            db.close()

    def _get_project_config(self, project_name: str) -> ProjectConfig:
        db = SessionLocal()
        try:
            project = self.db_manager.get_project(db, name=project_name)
            if not project:
                raise FileNotFoundError(f"Project '{project_name}' not found in database.")
            
            config_data = project.config or {}
            return ProjectConfig(**config_data)
        except ValidationError as e:
            raise ValueError(f"Invalid project configuration for '{project_name}':\n{e}")
        finally:
            db.close()

    def _get_dataset_item_processing_config(
        self,
        project_name: str
    ) -> DatasetItemProcessingConfig:
        db = SessionLocal()
        try:
            project = self.db_manager.get_project(db, name=project_name)
            if not project:
                return DatasetItemProcessingConfig(image_configs=[])
            
            config_data = project.dataset_processing_config or {"image_configs": []}
            return DatasetItemProcessingConfig(**config_data)
        except ValidationError as e:
            raise ValueError(
                f"Invalid dataset item processing configuration for '{project_name}':\n{e}"
            )
        finally:
            db.close()

    def get_project_file_paths(
        self,
        project_name: str,
        debug_mode: bool = False
    ) -> Dict[str, Path | List[Path] | List[Dict]]:
        db = SessionLocal()
        try:
            project = self.db_manager.get_project(db, name=project_name)
            if not project:
                raise ValueError(f"Project '{project_name}' not found in database.")

            config_data = self._get_project_config(project_name)
            dataset_item_processing_config = self._get_dataset_item_processing_config(project_name)
            
            # Fetch all assets from DB
            assets = self.db_manager.list_project_assets(db, project_id=project.id)
            
            # Helper to find asset by category (and optional sub-key for drawings)
            def find_path(category):
                # For basic singleton assets
                asset = next((a for a in assets if a.category == category), None)
                return Path(asset.file_path) if asset else None

            ref_color_checker_path = find_path("ideal_checker")
            proj_spec_checker_path = find_path("project_specific_color_checker")
            object_ref_path = find_path("object_ref")
            aruco_ref_path = find_path("aruco_ref")
            logo_path = find_path("logo")

            # Technical drawings: Use config mapping as source of truth for keys (1, 2, 3...)
            # These paths should have been healed to absolute during startup migration
            drawing_paths = {}
            if config_data.masking and config_data.masking.drawing_layers:
                for key, p_str in config_data.masking.drawing_layers.items():
                    if p_str:
                        # Robustly decide if absolute or relative
                        # Path(v).is_absolute() is platform-dependent and fails for mixed paths
                        is_win_absolute = (len(p_str) > 2 and p_str[1:3] == ':\\')
                        is_nix_absolute = p_str.startswith('/')
                        
                        if is_win_absolute or is_nix_absolute:
                            # If it's absolute, try to extract just the relative part we care about
                            # or re-resolve it to the current managed storage
                            filename = get_portable_basename(p_str)
                            sub_dir = "drawing_layers"
                            abs_p = self.managed_root / project.id / sub_dir / filename
                        else:
                            abs_p = self.managed_root / project.id / p_str
                        
                        drawing_paths[key] = abs_p

            # Calibration images (augmented with points config and specific checker)
            calibration_image_configs = []
            for asset in assets:
                if asset.category == "calibration_image":
                    item_path = Path(asset.file_path)
                    img_config = next((
                        cfg for cfg in dataset_item_processing_config.image_configs if cfg.filename == asset.filename
                    ), None)
                    
                    method = img_config.method if img_config else "full_average"
                    points = img_config.points if img_config else None
                    points_as_dicts = [p.model_dump() for p in points] if points else None

                    # Resolve specific color checker if linked
                    specific_checker_path = None
                    if asset.parent_asset_id:
                        parent_asset = next((a for a in assets if a.id == asset.parent_asset_id), None)
                        if parent_asset and parent_asset.file_path:
                            specific_checker_path = Path(parent_asset.file_path)

                    calibration_image_configs.append({
                        "filename": asset.filename,
                        "path": item_path,
                        "method": method,
                        "points": points_as_dicts,
                        "specific_checker_path": specific_checker_path
                    })

            return {
                "reference_color_checker": ref_color_checker_path,
                "project_specific_color_checker": proj_spec_checker_path,
                "calibration_image_configs": calibration_image_configs,
                "technical_drawing_paths": drawing_paths,
                "geometrical_alignment_config": config_data.geometrical_alignment,
                "geometrical_alignment_reference_path": aruco_ref_path,
                "object_reference_path": object_ref_path,
                "logo_path": logo_path,
                "config_data": config_data,
                "dataset_processing_config": dataset_item_processing_config,
            }
        finally:
            db.close()

    def calculate_hsv_range_from_dataset(
        self,
        dataset_image_configs: List[Dict],
        correction_matrix: np.ndarray = None,
        reference_checker_path: Path = None,
        debug_mode: bool = False
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, List[Dict]]:
        all_hsv_colors = []
        dataset_debug_info = []

        if not dataset_image_configs:
            raise ValueError("No dataset image configurations provided to calculate HSV range.")

        if debug_mode:
            print(f"[DEBUG] Calculating HSV range from {len(dataset_image_configs)} sample configs.")

        for img_config in dataset_image_configs:
            try:
                image_path = img_config["path"]
                image, _ = load_image(str(image_path))
                if image is None:
                    if debug_mode: print(f"[DEBUG] Skipping {image_path.name}, could not load.")
                    continue

                # Determine correction logic
                current_correction_matrix = correction_matrix
                
                # If specific checker is assigned, calculate on the fly (expensive but accurate)
                if img_config.get("specific_checker_path") and reference_checker_path:
                    try:
                        result = self.color_corrector.calculate_correction_from_images(
                            source_image_path=str(img_config["specific_checker_path"]),
                            reference_image_path=str(reference_checker_path),
                            debug_mode=debug_mode,
                        )
                        current_correction_matrix = result["correction_model"]
                    except Exception as e:
                        if debug_mode:
                            print(f"[DEBUG] Failed to calculate specific correction for {image_path.name}: {e}. Falling back to default.")

                corrected_image = image
                if current_correction_matrix is not None:
                    corrected_image = self.color_corrector.apply_correction_model(
                        image, current_correction_matrix, method='linear'
                    )

                hsv_colors_for_sample = self.dataset_item_processor.extract_hsv_from_image(
                    corrected_image, img_config["method"], img_config.get("points")
                )
                all_hsv_colors.extend(hsv_colors_for_sample)

                if debug_mode:
                    # Save the corrected image for the report to show exactly what was analyzed
                    corrected_image_path = self.cache_dir / f"{img_config['filename']}_corrected_for_report.png"
                    cv2.imwrite(str(corrected_image_path), corrected_image)

                    avg_hsv_colors_for_report = self.dataset_item_processor.extract_average_hsv_from_image(
                        corrected_image, img_config["method"], img_config.get("points")
                    )
                    if avg_hsv_colors_for_report.size > 0:
                        avg_bgr_colors_for_report = [
                            cv2.cvtColor(np.uint8([[hsv]]), cv2.COLOR_HSV2BGR)[0][0] for hsv in avg_hsv_colors_for_report
                        ]
                        dataset_debug_info.append({
                            "path": str(image_path),
                            "corrected_path_for_report": str(corrected_image_path),
                            "method": img_config["method"],
                            "points": img_config.get("points"),
                            "checker_used": str(img_config.get("specific_checker_path").name) if img_config.get("specific_checker_path") else "Global Default",
                            "hsv_colors": [c.tolist() for c in avg_hsv_colors_for_report],
                            "bgr_colors": [c.tolist() for c in avg_bgr_colors_for_report],
                        })
            except Exception as e:
                if debug_mode:
                    print(f"[DEBUG] Warning: Error processing dataset image {img_config['path'].name}: {e}. Skipping.")
                continue

        if not all_hsv_colors:
            raise ValueError(
                "Could not extract any HSV colors from the provided sample images."
            )

        h_values = np.array([c[0] for c in all_hsv_colors])
        s_values = np.array([c[1] for c in all_hsv_colors])
        v_values = np.array([c[2] for c in all_hsv_colors])

        def get_robust_range(values):
            if len(values) == 0: return 0, 0
            q1, q3 = np.percentile(values, [25, 75])
            iqr = q3 - q1
            lower_bound, upper_bound = q1 - 1.5 * iqr, q3 + 1.5 * iqr
            filtered_values = values[(values >= lower_bound) & (values <= upper_bound)]
            return (int(np.min(filtered_values)), int(np.max(filtered_values))) if len(filtered_values) > 0 else (int(np.min(values)), int(np.max(values)))

        lower_h, upper_h = get_robust_range(h_values)
        lower_s, upper_s = get_robust_range(s_values)
        lower_v, upper_v = get_robust_range(v_values)
        center_h, center_s, center_v = (np.mean(h_values), np.mean(s_values), np.mean(v_values))
        lower_limit = np.array([lower_h, lower_s, lower_v], dtype=np.uint8)
        upper_limit = np.array([upper_h, upper_s, upper_v], dtype=np.uint8)
        center_color = np.array([center_h, center_s, center_v], dtype=np.uint8)

        return lower_limit, upper_limit, center_color, dataset_debug_info

    def get_project_data(
        self,
        project_name: str,
        debug_mode: bool = False
    ) -> Dict[str, any]:
        """
        Retrieves project data, using a cache if available and valid.

        Args:
            project_name: The name of the project.
            debug_mode: Whether to print debug information.

        Returns:
            A dictionary containing calculated project data (matrices, HSV ranges, etc.).
        """
        cache_file_path = self._get_cache_file_path(project_name)
        
        # 1. Identify all source files that affect the calculation
        current_source_files = self._get_source_files(project_name)

        # 2. Try to load valid data from cache
        cached_data = self._get_cache_data(cache_file_path, current_source_files, debug_mode)
        if cached_data:
            return cached_data

        # 3. If no valid cache, calculate fresh data
        if debug_mode:
            print(f"[DEBUG] Calculating data for project '{project_name}'...")
        
        calculated_data = self._calculate_project_data(project_name, debug_mode)

        # 4. Save new data to cache
        self._save_cache_data(cache_file_path, calculated_data, current_source_files, debug_mode)

        return calculated_data

    def _get_source_files(self, project_name: str) -> set:
        """Identifies all source file paths that impact project data calculation."""
        # Use internal call (debug=False) to get paths
        file_paths = self.get_project_file_paths(project_name, debug_mode=False)
        
        source_files = set()
        if file_paths.get("reference_color_checker"):
            source_files.add(str(file_paths["reference_color_checker"]))
        if file_paths.get("project_specific_color_checker"):
            source_files.add(str(file_paths["project_specific_color_checker"]))
        
        for img_config in file_paths.get("calibration_image_configs", []):
            source_files.add(str(img_config["path"]))
            if img_config.get("specific_checker_path"):
                source_files.add(str(img_config["specific_checker_path"]))
            
        source_files.add(str(self.projects_root / project_name / "project_config.json"))
        source_files.add(str(self.projects_root / project_name / "dataset_item_processing_config.json"))
        
        return source_files

    def _get_cache_data(self, cache_file_path: Path, current_source_files: set, debug_mode: bool) -> Optional[Dict]:
        """Loads and validates data from the cache file."""
        if not cache_file_path.exists():
            return None

        try:
            with open(cache_file_path, "r") as f:
                loaded_cache = json.load(f)
            
            if not self._is_cache_valid(loaded_cache, current_source_files, debug_mode):
                return None

            # Deserialize numpy arrays
            data = loaded_cache["data"]
            
            # Correction matrix is stored as a list, convert back to dictionary with numpy array
            matrix_list = data["correction_matrix"]
            data["correction_matrix"] = {'matrix': np.array(matrix_list, dtype=np.float32)}
            
            data["lower_hsv"] = np.array(data["lower_hsv"], dtype=np.uint8)
            data["upper_hsv"] = np.array(data["upper_hsv"], dtype=np.uint8)
            data["center_hsv"] = np.array(data["center_hsv"], dtype=np.uint8)
            
            if debug_mode:
                print(f"[DEBUG] Using cached data for project from '{cache_file_path}'.")
            return data

        except Exception as e:
            if debug_mode:
                print(f"[DEBUG] Error reading cache '{cache_file_path}': {e}")
            return None

    def _is_cache_valid(self, loaded_cache: Dict, current_source_files: set, debug_mode: bool) -> bool:
        """Checks if the cached data is still valid based on file timestamps."""
        source_file_timestamps = loaded_cache.get("source_file_timestamps", {})
        cached_files = set(source_file_timestamps.keys())

        if current_source_files != cached_files:
            if debug_mode:
                print("[DEBUG] Cache invalidated: Source file list changed.")
            return False

        for file_path_str, timestamp in source_file_timestamps.items():
            path = Path(file_path_str)
            if not path.exists():
                 if debug_mode: print(f"[DEBUG] Cache invalidated: File {file_path_str} no longer exists.")
                 return False
            
            current_mtime = path.stat().st_mtime
            if current_mtime > timestamp:
                if debug_mode:
                    print(f"[DEBUG] Cache invalidated: {file_path_str} was modified.")
                return False
        
        return True

    def _calculate_project_data(self, project_name: str, debug_mode: bool) -> Dict:
        """Performs the heavy calculation of project data."""
        file_paths = self.get_project_file_paths(project_name, debug_mode=debug_mode)

        # 1. Calculate Correction Matrix (Global Default)
        correction_model = {'matrix': np.eye(3, dtype=np.float32)}
        if file_paths["project_specific_color_checker"] and file_paths["reference_color_checker"]:
            try:
                result = self.color_corrector.calculate_correction_from_images(
                    source_image_path=str(file_paths["project_specific_color_checker"]),
                    reference_image_path=str(file_paths["reference_color_checker"]),
                    debug_mode=debug_mode,
                )
                correction_model = result["correction_model"]
                if debug_mode:
                    print("[DEBUG] Project color alignment matrix calculated.")
            except Exception as e:
                if debug_mode:
                    print(f"[DEBUG] Warning: Could not calculate project color alignment matrix: {e}. Using identity matrix.")

        # 2. Calculate HSV Ranges
        # We pass the reference checker path so individual images can calculate their own correction if linked
        lower_hsv, upper_hsv, center_hsv, dataset_debug_info = (
            self.calculate_hsv_range_from_dataset(
                file_paths["calibration_image_configs"], 
                correction_matrix=correction_model,
                reference_checker_path=file_paths.get("reference_color_checker"),
                debug_mode=debug_mode
            )
        )
        if debug_mode:
            print("[DEBUG] Project HSV range calculated.")

        dataset_processing_config = file_paths["dataset_processing_config"]

        return {
            "config": file_paths["config_data"].model_dump() if hasattr(file_paths["config_data"], "model_dump") else file_paths["config_data"],
            "dataset_processing_config": dataset_processing_config.model_dump() if hasattr(dataset_processing_config, "model_dump") else dataset_processing_config,
            "correction_matrix": correction_model,
            "lower_hsv": lower_hsv,
            "upper_hsv": upper_hsv,
            "center_hsv": center_hsv,
            "dataset_debug_info": dataset_debug_info,
        }

    def _save_cache_data(self, cache_file_path: Path, data: Dict, source_files: set, debug_mode: bool):
        """Serializes and saves the project data to the cache file."""
        try:
            # Gather current timestamps
            source_file_timestamps = {}
            for p_str in source_files:
                p = Path(p_str)
                if p.exists():
                    source_file_timestamps[str(p)] = p.stat().st_mtime

            # Prepare data for JSON serialization (numpy -> list)
            data_to_save = {
                "correction_matrix": data['correction_matrix']['matrix'].tolist(),
                "lower_hsv": data['lower_hsv'].tolist(),
                "upper_hsv": data['upper_hsv'].tolist(),
                "center_hsv": data['center_hsv'].tolist(),
                "dataset_debug_info": data['dataset_debug_info'],
            }

            full_cache_entry = {
                "data": data_to_save,
                "source_file_timestamps": source_file_timestamps,
            }

            with open(cache_file_path, "w") as f:
                json.dump(full_cache_entry, f, indent=4)
            
            if debug_mode:
                print(f"[DEBUG] Cached data saved to {cache_file_path}")
                
        except Exception as e:
            print(f"[ERROR] Failed to save cache to {cache_file_path}: {e}")

    def update_dataset_item_points(self, project_name: str, filename: str, points: List[Dict]):
        """Updates the points for a specific image in the dataset configuration."""
        project_path = self.projects_root / project_name
        config_file_path = project_path / "dataset_item_processing_config.json"
        
        # Load existing or create new
        if config_file_path.exists():
            with open(config_file_path, "r") as f:
                data = json.load(f)
        else:
            data = {"image_configs": []}

        # Update
        updated = False
        for cfg in data.get("image_configs", []):
            if cfg["filename"] == filename:
                cfg["points"] = points
                updated = True
                break
        
        if not updated:
            # If default "points", explicitly set method if missing
            data.setdefault("image_configs", []).append({
                "filename": filename,
                "method": "points",
                "points": points
            })
            
        # Save config
        with open(config_file_path, "w") as f:
            json.dump(data, f, indent=4) # Changed 'config_data' to 'data'
            
        self.clear_cache_for_project(project_name)

    def update_project_asset(self, project_name: str, filename: str, file_content: bytes, category: str, layer_key: Optional[str] = None, parent_asset_id: str = None):
        """
        Updates or adds a project asset file and tracks it in the database.
        """
        db = SessionLocal()
        try:
            project = self.db_manager.get_project(db, name=project_name)
            if not project:
                # Create project if it doesn't exist? (Or fail if we expect project selection)
                project = self.db_manager.create_project(db, name=project_name, config={})
            
            # Managed storage path
            save_dir = config.DATA_DIR / "storage" / "projects" / project.id
            if category == "drawing_layer":
                save_dir = save_dir / "drawing_layers"
            elif category == "calibration_image":
                save_dir = save_dir / "calibration_images"
            else:
                save_dir = save_dir / "assets"
            
            save_dir.mkdir(parents=True, exist_ok=True)
            target_path = save_dir / filename

            # Write file
            with open(target_path, "wb") as f:
                f.write(file_content)

            # Update database record
            existing_assets = self.db_manager.list_project_assets(db, project_id=project.id)
            asset = next((a for a in existing_assets if a.category == category and a.filename == filename), None)
            
            if not asset:
                self.db_manager.add_project_asset(
                    db=db,
                    project_name=project_name,
                    category=category,
                    filename=filename,
                    file_path=str(target_path),
                    project_id=project.id,
                    parent_asset_id=parent_asset_id
                )
            else:
                asset.file_path = str(target_path)
                # Only update link if provided (handles explicit None for unlinking if passed correctly)
                if parent_asset_id is not None:
                    asset.parent_asset_id = None if parent_asset_id.lower() == "none" or parent_asset_id == "" else parent_asset_id
                db.commit()

            # Update project config if necessary (e.g. for color checkers)
            # We use a fresh dict copy to ensure SQLAlchemy detects the change
            proj_config = dict(project.config or {})
            
            if category == "ideal_checker":
                proj_config.setdefault("color_correction", {})["reference_color_checker_path"] = f"assets/{filename}"
            elif category == "project_specific_color_checker":
                proj_config.setdefault("color_correction", {})["project_specific_color_checker_path"] = f"assets/{filename}"
            elif category == "aruco_ref":
                proj_config.setdefault("geometrical_alignment", {})["reference_path"] = f"assets/{filename}"
            elif category == "object_ref":
                proj_config["object_reference_path"] = f"assets/{filename}"
            elif category == "drawing_layer" and layer_key:
                proj_config.setdefault("masking", {}).setdefault("drawing_layers", {})[layer_key] = f"drawing_layers/{filename}"

            project.config = proj_config
            db.commit()
            
            logger.info(f"Updated Project Asset ({category}) in DB and Storage: {filename}")
            self.clear_cache_for_project(project_name)

        finally:
            db.close()

    def remove_calibration_image(self, project_name: str, filename: str):
        """Removes a calibration image from the project."""
        db = SessionLocal()
        try:
            project = self.db_manager.get_project(db, name=project_name)
            if not project:
                raise ValueError("Project not found")

            # Find asset
            assets = self.db_manager.list_project_assets(db, project_id=project.id)
            asset = next((a for a in assets if a.category == "calibration_image" and a.filename == filename), None)
            
            if asset:
                # Remove file
                try:
                    os.remove(asset.file_path)
                except OSError:
                    pass
                
                # Remove from DB
                db.delete(asset)
                
                # Remove from dataset processing config
                if project.dataset_processing_config:
                    cfg = project.dataset_processing_config
                    cfg["image_configs"] = [c for c in cfg.get("image_configs", []) if c["filename"] != filename]
                    project.dataset_processing_config = cfg
                
                db.commit()
                self.clear_cache_for_project(project_name)
        finally:
            db.close()

    def validate_reference_checker(self, project_id: str) -> Dict:
        """
        Validates the 'ideal_checker' asset for a project.
        """
        db = SessionLocal()
        try:
            project = self.db_manager.get_project(db, name=project_id) # ID or name
            if not project:
                return {"success": False, "message": "Project not found"}
            
            assets = self.db_manager.list_project_assets(db, project_id=project.id)
            asset = next((a for a in assets if a.category == "ideal_checker"), None)
            
            if not asset or not os.path.exists(asset.file_path):
                return {"success": False, "message": "Reference checker not found"}

            image = cv2.imread(asset.file_path)
            if image is None:
                return {"success": False, "message": "Could not read image file"}

            # Use the new, simpler pipeline for validation
            from src.color_correction.pipeline import ColorCorrectionPipeline
            pipeline = ColorCorrectionPipeline(debug_mode=False)
            result = pipeline.run_patch_detection_on_image(image)
            
            num_patches = len(result.get("patches", []))
            method = result.get("detection_method", "unknown")

            if num_patches >= 60:
                return {"success": True, "message": f"Success: Found {num_patches} patches via '{method}'."}
            else:
                return {"success": False, "message": f"Warning: Only {num_patches} patches found."}
        except Exception as e:
            return {"success": False, "message": f"Validation error: {e}"}
        finally:
            db.close()

    def update_dataset_item_points(self, project_name: str, filename: str, points: List[Dict]):
        """Updates the points for a specific image in the database-backed dataset configuration."""
        db = SessionLocal()
        try:
            project = self.db_manager.get_project(db, name=project_name)
            if not project:
                return

            data = project.dataset_processing_config or {"image_configs": []}
            
            # Update
            updated = False
            for cfg in data.get("image_configs", []):
                if cfg["filename"] == filename:
                    cfg["points"] = points
                    updated = True
                    break
            
            if not updated:
                data.setdefault("image_configs", []).append({
                    "filename": filename,
                    "method": "points",
                    "points": points
                })
                
            project.dataset_processing_config = data
            db.commit()
            self.clear_cache_for_project(project_name)
        finally:
            db.close()‘è"(ac18c7c1483078b19900afc78cd7675de4506b332Rfile:///c:/Users/Admin/Documents/Coding/QualiaQC/src/project_management/manager.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC