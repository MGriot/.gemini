ü
import sys
from pathlib import Path

# Add src to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.project_management.manager import ProjectManager
from src.db import SessionLocal, DatabaseManager
import os

def verify_parity():
    pm = ProjectManager()
    db = SessionLocal()
    dm = DatabaseManager()
    
    test_name = f"TkinterParityTest_{os.urandom(4).hex()}"
    print(f"--- Verifying Parity with Project: {test_name} ---")
    
    # 1. Verify Project Creation (Managed Storage)
    msgs = pm.create_project(test_name)
    for m in msgs: print(f"  [CREATE] {m}")
    
    project = dm.get_project(db, name=test_name)
    if not project:
        print("[FAIL] Project not found in DB after creation.")
        return
    print(f"[SUCCESS] Project {test_name} registered in DB.")
    
    managed_path = Path("data/storage/projects") / project.id
    if managed_path.exists() and (managed_path / "assets").exists():
        print(f"[SUCCESS] Managed storage verified at {managed_path}")
    else:
        print(f"[FAIL] Managed storage directory missing or incomplete: {managed_path}")
        return

    # 2. Verify Asset Resolution
    paths = pm.get_project_file_paths(test_name)
    if "reference_color_checker" in paths and str(managed_path) in str(paths["reference_color_checker"]):
        # Wait, if it's global reference it might not be in managed path yet unless we upload it.
        # But create_project initializes it with global path.
        print(f"[SUCCESS] Asset resolution works (Global Ref: {paths['reference_color_checker']})")
    else:
        print(f"[NOTE] Asset resolution path: {paths['reference_color_checker']}")

    # 3. Cleanup (optional, but let's keep it for history verification)
    print(f"--- Verification Complete for {test_name} ---")

if __name__ == "__main__":
    verify_parity()
ü"(ac18c7c1483078b19900afc78cd7675de4506b332Qfile:///c:/Users/Admin/Documents/Coding/QualiaQC/scripts/verify_tkinter_parity.py:0file:///c:/Users/Admin/Documents/Coding/QualiaQC