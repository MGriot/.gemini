’á""".
QualiaQC API Server
Bridges the React Frontend with the Core Python/OpenCV Logic.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import shutil
import argparse
import pickle
from pathlib import Path
from typing import List, Optional, Dict, Annotated
from datetime import datetime
import cv2
import numpy as np
from PIL import Image

from src.pipeline import Pipeline, run_analysis
from src.project_management.manager import ProjectManager
from src.project_management.creation import create_project
from src.resource_management.pipeline import InitializationPipeline
from src.reporting.pipeline import ReportingPipeline
from src.config import OUTPUT_DIR, PROJECTS_DIR, CACHE_DIR, DATA_DIR
from src.utils.logging_utils import setup_logger
from src.db import get_db, DatabaseManager, AnalysisSession, SessionStatus
from sqlalchemy.orm import Session
from fastapi import Depends

logger = setup_logger(__name__)

# Initialize Global Resources on Startup
try:
    init_pipeline = InitializationPipeline()
    init_messages = init_pipeline.run()
    for msg in init_messages:
        logger.info(msg)
except Exception as e:
    logger.error(f"Initialization Failed: {e}")

app = FastAPI(title="QualiaQC API", version="2.0.0")

# Enable CORS for the React Dev Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Relaxed for debugging, change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
project_manager = ProjectManager()

from src.config import OUTPUT_DIR, PROJECTS_DIR, CACHE_DIR, DATA_DIR

def to_web_url(abs_p):
    """Helper to convert absolute paths to web-accessible URLs."""
    if not abs_p: return None
    try:
        # Standardize path
        s_path = str(abs_p).replace('\\', '/')
        
        # Handle container paths starting with /app
        if s_path.startswith('/app/'):
            s_path = s_path[4:] # Keep the leading slash: /data/... or /output/...
            
        # Check for data or output segments
        if "/data/" in s_path:
            return f"/data/{s_path.split('/data/', 1)[-1]}"
        if "/output/" in s_path:
            return f"/output/{s_path.split('/output/', 1)[-1]}"

        # Fallback to Path.resolve() logic for local development outside Docker
        path_obj = Path(abs_p).resolve()
        
        # Check if in OUTPUT_DIR
        if OUTPUT_DIR in path_obj.parents or path_obj == OUTPUT_DIR:
            rel = path_obj.relative_to(OUTPUT_DIR)
            return f"/output/{rel.as_posix()}"
        
        # Check if in DATA_DIR
        if DATA_DIR in path_obj.parents or path_obj == DATA_DIR:
            rel = path_obj.relative_to(DATA_DIR)
            return f"/data/{rel.as_posix()}"
            
        return s_path # Last resort
    except Exception as e:
        logger.warning(f"Error converting path to URL: {abs_p} - {e}")
        return str(abs_p)

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@api_router.get("/projects")
async def list_projects():
    """Returns a list of available projects."""
    try:
        projects = project_manager.list_projects()
        logger.info(f"API: Discovery Request. Found {len(projects)} projects: {projects}")
        return [{"id": p, "name": p} for p in projects]
    except Exception as e:
        logger.error(f"API: Error listing projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/projects/{project_id}/files")
async def get_project_files(project_id: str):
    """Returns file status and calibration images for a project."""
    try:
        paths = project_manager.get_project_file_paths(project_id)
        
        # Fetch assets to get IDs for linking
        from src.db import SessionLocal
        db = SessionLocal()
        project = project_manager.db_manager.get_project(db, name=project_id)
        if not project:
            db.close()
            raise HTTPException(status_code=404, detail="Project not found")
        all_assets = project_manager.db_manager.list_project_assets(db, project_id=project.id)
        db.close()

        config_files = []
        # Categories to display in config section
        target_categories = ["ideal_checker", "project_specific_color_checker", "aruco_ref", "object_ref", "drawing_layer"]
        
        cat_map = {
            "ideal_checker": "Ideal Reference Color Checker",
            "project_specific_color_checker": "Project-Specific Color Checker",
            "aruco_ref": "ArUco Reference Image",
            "object_ref": "Object Reference Image",
            "drawing_layer": "Drawing Layer"
        }

        for asset in all_assets:
            if asset.category not in target_categories: continue
            
            label = cat_map.get(asset.category, asset.category.replace('_', ' ').title())
            layer_key = None
            if asset.category == "drawing_layer":
                layer_key = asset.filename.split('.')[0]
                label = f"Drawing Layer '{layer_key}'"

            config_files.append({
                "id": asset.id,
                "key": asset.category if asset.category != "drawing_layer" else f"drawing_{asset.filename}",
                "label": label,
                "rel_path": to_web_url(asset.file_path),
                "exists": os.path.exists(asset.file_path),
                "category": asset.category,
                "filename": asset.filename,
                "layer_key": layer_key
            })

        # Clean up display paths
        # No longer needed if we use to_web_url, but keeping for reference if UI expects it
        # project_root_str = str(PROJECTS_DIR / project_id).replace('\\', '/')
        # for cfg in config_files:
        #     p = cfg["rel_path"].replace('\\', '/')
        #     if p.startswith(project_root_str):
        #         try: cfg["rel_path"] = os.path.relpath(p, project_root_str)
        #         except: pass

        calibration_images = []
        for img in paths.get("calibration_image_configs", []):
            url = to_web_url(img["path"])
            # Find the actual asset record to get IDs
            asset_record = next((a for a in all_assets if a.filename == img["filename"] and a.category == "calibration_image"), None)
            
            calibration_images.append({
                "id": asset_record.id if asset_record else None,
                "filename": img["filename"],
                "url": url,
                "thumbnail_url": url,
                "points": img.get("points", []),
                "parent_asset_id": asset_record.parent_asset_id if asset_record else None,
                "specific_checker_path": to_web_url(img.get("specific_checker_path"))
            })

        return {"config_files": config_files, "calibration_images": calibration_images}
    except Exception as e:
        logger.error(f"API: Error fetching project files for {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/projects/{project_id}/dataset/calibration_images/{filename}")
async def api_delete_calibration_image(project_id: str, filename: str):
    """Deletes a calibration image from the project."""
    try:
        project_manager.remove_calibration_image(project_id, filename)
        return {"success": True, "message": f"Deleted {filename}"}
    except Exception as e:
        logger.error(f"Error deleting image {filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/projects/{project_id}/assets/{filename}")
async def api_delete_asset(project_id: str, filename: str):
    """Deletes a configuration asset (checker, reference, etc.)."""
    try:
        from src.db import SessionLocal
        from src.db.models import ProjectAsset
        db = SessionLocal()
        project = project_manager.db_manager.get_project(db, name=project_id)
        if not project:
            db.close()
            raise HTTPException(status_code=404, detail="Project not found")
        
        asset = db.query(ProjectAsset).filter(ProjectAsset.project_id == project.id, ProjectAsset.filename == filename).first()
        if not asset:
            db.close()
            raise HTTPException(status_code=404, detail="Asset not found")

        # Physical file
        if os.path.exists(asset.file_path):
            try: os.remove(asset.file_path)
            except OSError: pass
        
        # Unlink any calibration images
        calib_assets = db.query(ProjectAsset).filter(ProjectAsset.project_id == project.id, ProjectAsset.category == "calibration_image").all()
        for cal in calib_assets:
            if cal.parent_asset_id == asset.id:
                cal.parent_asset_id = None
        
        db.delete(asset)
        db.commit()
        db.close()
        
        project_manager.clear_cache_for_project(project_id)
        return {"success": True, "message": f"Deleted asset {filename}"}
    except Exception as e:
        logger.error(f"Error deleting asset {filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/projects/{project_id}/dataset/calibration_images/{filename}/link")
async def api_link_calibration_image(
    project_id: str, 
    filename: str, 
    parent_asset_id: Annotated[Optional[str], Form()] = None
):
    """Updates the associated color checker for a calibration image."""
    try:
        from src.db import SessionLocal
        db = SessionLocal()
        project = project_manager.db_manager.get_project(db, name=project_id)
        if not project:
            db.close()
            raise HTTPException(status_code=404, detail="Project not found")
        
        all_assets = project_manager.db_manager.list_project_assets(db, project_id=project.id)
        asset = next((a for a in all_assets if a.filename == filename and a.category == "calibration_image"), None)
        
        if not asset:
            db.close()
            raise HTTPException(status_code=404, detail="Calibration image not found")
            
        # target_id can be 'none' or effectively empty from frontend
        val = parent_asset_id
        target_id = None if not val or val.lower() == 'none' or val.strip() == '' else val
        
        asset.parent_asset_id = target_id
        db.commit()
        db.close()
        
        project_manager.clear_cache_for_project(project_id)
        return {"success": True, "message": f"Linked {filename} to checker"}
    except Exception as e:
        logger.error(f"Error linking image {filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/projects/{project_id}/files/upload")
async def api_upload_project_file(
    project_id: str, 
    file: UploadFile = File(...), 
    category: Annotated[str, Form()] = "unknown",
    layer_key: Annotated[Optional[str], Form()] = None,
    parent_asset_id: Annotated[Optional[str], Form()] = None
):
    """Uploads a configuration file (asset) to the project."""
    try:
        content = await file.read()
        # Robustly handle form strings
        l_key = layer_key if layer_key and layer_key.strip() != "" else None
        p_id = parent_asset_id if parent_asset_id and parent_asset_id.strip() != "" else None
        
        project_manager.update_project_asset(project_id, file.filename, content, category, l_key, p_id)
        return {"success": True, "message": f"Uploaded {file.filename} as {category}"}
    except Exception as e:
        logger.error(f"Error uploading file {category}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/projects/{project_id}/dataset/validate-checker")
async def api_validate_checker(project_id: str):
    """Validates the Ideal Reference Color Checker."""
    try:
        return project_manager.validate_reference_checker(project_id)
    except Exception as e:
        logger.error(f"Error validating checker for {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/history")
async def get_history(db: Session = Depends(get_db)):
    """Queries the database for analysis history with legacy fallback."""
    history = []
    
    # 1. Database Query
    try:
        sessions = project_manager.db_manager.list_sessions(db)
        logger.info(f"API: History request. Found {len(sessions)} sessions in DB.")
        for s in sessions:
            # Extract common metrics for fast listing
            perc = 0.0
            # Guard against None metadata_info
            metadata = s.metadata_info or {}
            pn = metadata.get('part_number', 'N/A')
            thick = metadata.get('thickness', 'N/A')
            
            # Find the percentage metric if session is completed
            if s.status == SessionStatus.COMPLETED:
                for m in s.metrics:
                    if m.key == "matched_percentage":
                        perc = m.value
                        break
            
            # Find PDF report asset
            report_url = None
            for asset in s.assets:
                if asset.role == "pdf_report":
                    report_url = to_web_url(asset.file_path)
                    break
            
            # Fallback for sessions that have a PDF but not tracked in DB yet
            if not report_url:
                # Search in output dir logically if we know where things go
                try:
                    # Logic to find the report folder based on common patterns
                    search_dir = Path(OUTPUT_DIR) / s.project_name
                    if search_dir.exists():
                        pdfs = list(search_dir.glob(f"**/*{pn}*reportlab.pdf"))
                        if pdfs:
                            # Use most recent if multiple
                            pdfs.sort(key=os.path.getmtime, reverse=True)
                            report_url = to_web_url(str(pdfs[0]))
                except: pass

            history.append({
                "id": s.id,
                "date": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "N/A",
                "project": s.project_name,
                "partNumber": pn,
                "thickness": thick,
                "result": perc,
                "status": s.status.value,
                "report_url": report_url
            })
    except Exception as e:
        logger.error(f"API: DB History retrieval failed: {e}")

    # 2. Legacy Archive Scanning (.gri files)
    try:
        output_dir = Path(OUTPUT_DIR)
        if output_dir.exists():
            for gri_file in output_dir.glob("**/*.gri"):
                try:
                    session_id = gri_file.stem
                    # Skip if already in history from DB
                    if any(h['id'] == session_id for h in history):
                        continue
                        
                    stat = gri_file.stat()
                    dt = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M")
                    
                    # Project name logic
                    project_name = gri_file.parent.parent.name if "history" in str(gri_file) else gri_file.parent.name
                    
                    # Search for PDF next to .gri
                    report_url = None
                    parent_dir = gri_file.parent.parent # archives is parent, session root is parent.parent
                    pdfs = list(parent_dir.glob("*reportlab.pdf"))
                    if not pdfs:
                         # try deeper?
                         pdfs = list(parent_dir.glob("**/*reportlab.pdf"))
                    
                    if pdfs:
                        pdfs.sort(key=os.path.getmtime, reverse=True)
                        report_url = to_web_url(str(pdfs[0]))

                    history.append({
                        "id": session_id,
                        "date": dt,
                        "project": project_name,
                        "partNumber": "Legacy (Pickle)",
                        "thickness": "N/A",
                        "result": 0.0, 
                        "status": "LEGACY",
                        "is_legacy": True,
                        "file_path": str(gri_file),
                        "report_url": report_url
                    })
                except Exception as file_err:
                    logger.debug(f"Skipping legacy file {gri_file}: {file_err}")
    except Exception as e:
        logger.error(f"API: Legacy scanning failed: {e}")

    logger.info(f"API: Returning {len(history)} total history entries.")
    return history

@api_router.post("/history/{session_id}/regenerate")
async def api_regenerate_report(session_id: str, db: Session = Depends(get_db)):
    """Regenerates a report for an existing analysis session."""
    try:
        # We need the project name from the session to initialize ReportingPipeline
        session = project_manager.db_manager.get_session(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        reporting_pipe = ReportingPipeline(
            project_name=session.project_name,
            sample_name=None, # It will use session_id or from metadata if we enhance it
            debug_mode=True   # Typically regeneration is for debug/audit
        )
        
        report_data = reporting_pipe.run_from_session(session_id, db=db)
        if not report_data:
            raise HTTPException(status_code=500, detail="Report regeneration failed")
            
        return {
            "success": True,
            "message": "Report regenerated successfully",
            "report_url": to_web_url(report_data.get("html_path")) # Handle if generator returns this
        }
    except Exception as e:
        logger.error(f"API: Error regenerating report for {session_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/projects/create")
async def api_create_project(name: str = Form(...)):
    """Scaffolds a new project."""
    messages = create_project(name)
    if any("Error" in m for m in messages):
        raise HTTPException(status_code=400, detail="\n".join(messages))
    return {"message": "Project created", "logs": messages}

@api_router.delete("/projects/{project_id}")
async def api_delete_project(project_id: str):
    """Deletes a project completely."""
    try:
        messages = project_manager.delete_project(project_id)
        if any("Error" in m for m in messages):
            raise HTTPException(status_code=400, detail="\n".join(messages))
        return {"message": "Project deleted", "logs": messages}
    except Exception as e:
        logger.error(f"API Error deleting project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analysis/run")
async def api_run_analysis(
    project: str = Form(...),
    image: UploadFile = File(...),
    part_number: Optional[str] = Form(None),
    thickness: Optional[str] = Form(None),
    color_alignment: bool = Form(True),
    alignment: bool = Form(True),
    object_alignment: bool = Form(True),
    apply_mask: bool = Form(True),
    debug: bool = Form(True),
    # Advanced Params
    symmetry: bool = Form(True),
    blur: bool = Form(True),
    aggregate: bool = Form(True),
    blur_kernel_size: int = Form(5),
    agg_kernel_size: int = Form(7),
    agg_min_area: float = Form(0.0005),
    agg_density_thresh: float = Form(0.5),
    shadow_removal_method: str = Form("clahe"),
    color_correction_method: str = Form("linear"),
    masking_order: str = Form("1-2-3"),
    mask_bg_is_white: bool = Form(False),
    color_checker: Optional[UploadFile] = File(None)
):
    """Executes the full analysis pipeline on an uploaded image."""
    temp_dir = CACHE_DIR / "uploads"
    temp_dir.mkdir(exist_ok=True)
    temp_path = temp_dir / image.filename
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    color_checker_path = None
    if color_checker:
        color_checker_path = temp_dir / color_checker.filename
        with open(color_checker_path, "wb") as buffer:
            shutil.copyfileobj(color_checker.file, buffer)

    blur_kernel = [blur_kernel_size, blur_kernel_size]

    args = argparse.Namespace(
        project=project, image=str(temp_path), part_number=part_number, thickness=thickness,
        color_alignment=color_alignment, alignment=alignment, object_alignment=object_alignment,
        apply_mask=apply_mask, debug=debug, color_correction_method=color_correction_method,
        sample_color_checker=str(color_checker_path) if color_checker_path else None, 
        object_alignment_shadow_removal=shadow_removal_method,
        mask_bg_is_white=mask_bg_is_white, masking_order=masking_order, symmetry=symmetry, blur=blur,
        blur_kernel=blur_kernel, aggregate=aggregate, agg_kernel_size=agg_kernel_size, agg_min_area=agg_min_area,
        agg_density_thresh=agg_density_thresh, skip_color_analysis=False, skip_report_generation=False,
        load_state_from=None, save_state_to=None, camera=False, video=None
    )

    try:
        pipeline = run_analysis(args)
        if not pipeline or not pipeline.analysis_results:
            raise HTTPException(status_code=500, detail="Pipeline failed.")

        results = pipeline.analysis_results
        return {
            "success": True,
            "percentage": results.percentage,
            "matched_pixels": results.matched_pixels,
            "total_pixels": results.total_pixels,
            "processed_image_url": to_web_url(results.processed_image_path),
            "report_url": to_web_url(pipeline.report_data.get("pdf_path")) if pipeline.report_data else None,
            "debug_images": [{"title": d['title'], "url": to_web_url(d['path'])} for d in results.debug_info]
        }
    except Exception as e:
        logger.error(f"API: Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path.exists(): os.remove(temp_path)

from pydantic import BaseModel

class DatasetToolRequest(BaseModel):
    project_id: str
    filename: str
    roi: List[int] # [x1, y1, x2, y2]
    k: Optional[int] = 10

@api_router.post("/dataset/tools/cluster")
async def api_dataset_cluster(req: DatasetToolRequest):
    """Performs K-Means clustering on ROI to find dominant points."""
    try:
        # Resolve path using project manager (robust to storage location)
        paths = project_manager.get_project_file_paths(req.project_id)
        image_config = next((c for c in paths.get("calibration_image_configs", []) if c["filename"] == req.filename), None)
        
        if not image_config:
             raise HTTPException(status_code=404, detail="Image not found in project calibration images")
             
        image_path = image_config["path"]
        if not image_path.exists():
            raise HTTPException(status_code=404, detail="Image file missing")

        # Load image with OpenCV
        img = cv2.imread(str(image_path))
        if img is None:
             raise HTTPException(status_code=500, detail="Failed to load image")

        x1, y1, x2, y2 = req.roi
        # Clamp coordinates
        h, w = img.shape[:2]
        x1, x2 = max(0, min(x1, w)), max(0, min(x2, w))
        y1, y2 = max(0, min(y1, h)), max(0, min(y2, h))

        if x2 <= x1 or y2 <= y1:
             return {"points": []}

        roi = img[y1:y2, x1:x2]
        if roi.size == 0: return {"points": []}

        pixels = roi.reshape(-1, 3).astype(np.float32)
        
        K = req.k
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        # Handle case where pixels < K
        if len(pixels) < K:
             K = len(pixels)

        _, labels, centers = cv2.kmeans(pixels, K, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        new_points = []
        for center_color in centers:
            distances = np.linalg.norm(pixels - center_color, axis=1)
            closest_pixel_index = np.argmin(distances)
            y_in_roi, x_in_roi = np.unravel_index(closest_pixel_index, (roi.shape[0], roi.shape[1]))
            # Returns {x, y} relative to full image
            new_points.append({
                "x": int(x_in_roi + x1), 
                "y": int(y_in_roi + y1), 
                "radius": 7
            })
            
        return {"points": new_points, "count": len(new_points)}

    except Exception as e:
        logger.error(f"Cluster error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/dataset/tools/colors")
async def api_dataset_colors(req: DatasetToolRequest):
    """Finds all unique colors in ROI."""
    try:
        # Resolve path using project manager (robust to storage location)
        paths = project_manager.get_project_file_paths(req.project_id)
        image_config = next((c for c in paths.get("calibration_image_configs", []) if c["filename"] == req.filename), None)
        
        if not image_config:
             raise HTTPException(status_code=404, detail="Image not found in project calibration images")
             
        image_path = image_config["path"]
        if not image_path.exists():
            raise HTTPException(status_code=404, detail="Image not found")

        # Load with OpenCV for consistency then convert to PIL
        img = cv2.imread(str(image_path))
        if img is None:
             raise HTTPException(status_code=500, detail="Failed to load image")

        x1, y1, x2, y2 = req.roi
        h, w = img.shape[:2]
        x1, x2 = max(0, min(x1, w)), max(0, min(x2, w))
        y1, y2 = max(0, min(y1, h)), max(0, min(y2, h))

        if x2 <= x1 or y2 <= y1:
             return {"points": []}

        roi_bgr = img[y1:y2, x1:x2]
        roi_rgb = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(roi_rgb)

        max_colors = 30000
        colors = pil_img.getcolors(maxcolors=max_colors)

        if colors is None:
            return {"points": [], "error": f"Too many colors > {max_colors}"}

        # Map colors to coordinates
        # Optimization: Map unique colors to first found coordinate
        # This double loop is heavy in Python. 
        # Optimized approach: Use numpy unique with index
        
        # Flatten: (N, 3)
        pixels = roi_rgb.reshape(-1, 3)
        # specific view for structured array to handle rows as elements
        dtype = [('r', np.uint8), ('g', np.uint8), ('b', np.uint8)]
        pixels_struct = np.ascontiguousarray(pixels).view(dtype).reshape(-1)
        
        _, unique_indices = np.unique(pixels_struct, return_index=True)
        
        new_points = []
        for idx in unique_indices:
            # idx is into the flattened array
            y_in_roi, x_in_roi = np.unravel_index(idx, (roi_rgb.shape[0], roi_rgb.shape[1]))
            new_points.append({
                "x": int(x_in_roi + x1), 
                "y": int(y_in_roi + y1), 
                "radius": 7
            })
            
        return {"points": new_points, "count": len(new_points)}

    except Exception as e:
        logger.error(f"Colors error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class DatasetPointsSaveRequest(BaseModel):
    filename: str
    points: List[Dict]

@api_router.post("/projects/{project_id}/dataset/save")
async def api_save_dataset_points(project_id: str, req: DatasetPointsSaveRequest):
    """Saves the sampling points for a specific image."""
    try:
        project_manager.update_dataset_item_points(project_id, req.filename, req.points)
        return {"success": True, "message": "Points saved"}
    except Exception as e:
        logger.error(f"Error saving points for {project_id}/{req.filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Register the API Router
app.include_router(api_router)

app.mount("/output", StaticFiles(directory=str(OUTPUT_DIR)), name="output")
app.mount("/data", StaticFiles(directory=str(DATA_DIR)), name="data")

# Serve Frontend LAST (as catch-all)
FRONTEND_DIR = Path(__file__).parent.parent / "web-gui" / "dist"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    logger.warning(f"Frontend directory not found at {FRONTEND_DIR}. API only mode.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)’á"(ac18c7c1483078b19900afc78cd7675de4506b332>file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/server.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC