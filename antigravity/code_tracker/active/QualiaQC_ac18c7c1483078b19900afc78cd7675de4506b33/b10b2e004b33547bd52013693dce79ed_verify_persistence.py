ü(import sys
from pathlib import Path
import os
import shutil
import numpy as np
import cv2

# Ensure we can import from src
sys.path.append(str(Path(__file__).parent.parent))

from src.db.manager import DatabaseManager
from src.db.base import SessionLocal, Base, engine
from src.db.models import AnalysisSession, ProjectAsset, AnalysisAsset, AnalysisMetric, SessionStatus
from src.project_management.manager import ProjectManager
from src import config

def verify_persistence():
    print("--- Starting Persistence Layer Verification ---")
    
    # 1. Initialize DB
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    pm = ProjectManager()
    
    project_name = "VerificationProject"
    project_path = config.PROJECTS_DIR / project_name
    
    try:
        # 2. Cleanup old verification project if exists
        if project_path.exists():
            shutil.rmtree(project_path)
            
        from src.project_management.creation import create_project
        create_project(project_name)
        
        # 3. Simulate Asset Upload
        dummy_content = b"fake image data"
        pm.update_project_asset(project_name, "test_checker.png", dummy_content, "ideal_checker")
        
        # Add a dummy training image
        training_img_path = project_path / "dataset" / "training_images"
        training_img_path.mkdir(parents=True, exist_ok=True)
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        cv2.imwrite(str(training_img_path / "train_01.png"), img)
        
        # Check ProjectAsset record
        asset = db.query(ProjectAsset).filter(ProjectAsset.project_name == project_name).first()
        if asset and asset.category == "ideal_checker":
            print(f"[SUCCESS] ProjectAsset recorded: {asset.filename}")
        else:
            print("[FAILURE] ProjectAsset not recorded.")

        # 4. Simulate Pipeline Run
        # We need a real image for Pipeline to load
        dummy_img_path = Path("test_sample.png")
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        cv2.imwrite(str(dummy_img_path), img)
        
        from src.pipeline import Pipeline
        import argparse
        
        args = argparse.Namespace(
            project=project_name,
            image=str(dummy_img_path),
            color_alignment=False,
            alignment=False,
            object_alignment=False,
            apply_mask=False,
            debug=False,
            skip_color_analysis=False,
            skip_report_generation=True,
            symmetry=False,
            blur=False,
            aggregate=False,
            agg_kernel_size=7,
            agg_min_area=0.0005,
            agg_density_thresh=0.5,
            color_correction_method="linear",
            masking_order="1-2-3",
            mask_bg_is_white=False,
            object_alignment_shadow_removal="clahe",
            sample_color_checker=None,
            save_state_to=None,
            load_state_from=None
        )
        
        pipeline = Pipeline(args)
        pipeline.load_project_data()
        
        # Create a dummy result for metrics
        from src.config import ColorAnalysisResult
        pipeline.analysis_results = ColorAnalysisResult(
            percentage=85.5,
            matched_pixels=8550,
            total_pixels=10000
        )
        
        pipeline.process_image(str(dummy_img_path))
        
        session_id = pipeline.analysis_session_id
        if session_id:
            print(f"[SUCCESS] AnalysisSession created: {session_id}")
            
            # Check Asset Archiving
            archived = db.query(AnalysisAsset).filter(AnalysisAsset.session_id == session_id).first()
            if archived:
                print(f"[SUCCESS] AnalysisAsset archived: {archived.file_path}")
                if os.path.exists(archived.file_path):
                    print("   - Physical file exists in History archive.")
                else:
                    print("   - [FAILURE] Physical file missing in History archive.")
            
            # Check Metrics
            metric = db.query(AnalysisMetric).filter(AnalysisMetric.session_id == session_id, AnalysisMetric.key == "matched_percentage").first()
            if metric:
                print(f"[SUCCESS] Metric recorded: {metric.key} = {metric.value}")
            else:
                print("[FAILURE] Metric not recorded.")
                
            # Check Session Status
            session = db.query(AnalysisSession).filter(AnalysisSession.id == session_id).first()
            if session.status == SessionStatus.COMPLETED:
                print(f"[SUCCESS] Session status: {session.status.value}")
            else:
                print(f"[FAILURE] Session status: {session.status.value}")

        else:
            print("[FAILURE] AnalysisSession ID missing.")

    finally:
        db.close()
        if os.path.exists("test_sample.png"): os.remove("test_sample.png")
        # Optional: cleanup DB or keep for inspection
        print("--- Verification Finished ---")

if __name__ == "__main__":
    verify_persistence()
ü("(ac18c7c1483078b19900afc78cd7675de4506b332Nfile:///c:/Users/Admin/Documents/Coding/QualiaQC/scripts/verify_persistence.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC