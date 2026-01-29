# Implementation Plan: Pure DB Storage & Calibration Refactor

Transition to a professional "No-Folder" architecture where all assets are stored as DB Blobs, and refactor the color calibration logic for image-specific pairings.

## Proposed Changes

### [Component] Database Schema
#### [MODIFY] [models.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/db/models.py)
- **`ProjectAsset`**:
    - Add `content = Column(LargeBinary)` to store image/file data.
    - Add `calibration_color_checker_id = Column(String, ForeignKey("project_assets.id"))` to link images to specific checkers.
    - Rename categories: `training_image` -> `calibration_image`.
- **`AnalysisAsset`**:
    - Add `content = Column(LargeBinary)`.
- **`AssetType`**:
    - Add/Update types if necessary.

#### [MODIFY] [manager.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/db/manager.py)
- Update `add_project_asset` and `create_analysis_asset` to accept `content: bytes`.
- Implement `_migrate_schema` updates for the new columns.

### [Component] Project Management
#### [MODIFY] [manager.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/project_management/manager.py)
- Update `update_project_asset` to write to the DB Blob instead of the filesystem.
- Update `get_project_file_paths` to indicate that content is available in DB (or return BytesIO wrappers).
- Refactor all "training" terminology to "calibration".
- Update asset resolution to check for `calibration_color_checker_id`.

### [Component] API Server
#### [MODIFY] [server.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/server.py)
- **[NEW]** Add `/api/assets/{asset_id}` endpoint to serve binary content from DB (with appropriate MIME types).
- Update frontend-facing URLs to point to this new dynamic endpoint.
- Update `/api/projects/{project_id}/files/upload` to handle the new associations.

### [Component] Pipeline Logic
#### [MODIFY] [pipeline.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/pipeline.py)
- Update image loading to use memory-based decoding (`cv2.imdecode`) from DB content instead of `cv2.imread` from paths.

## Verification Plan

### Automated Tests
- **Migration Script**: Create `scripts/migrate_to_blobs.py` to move all files from `data/storage` into the DB and verify integrity.
- **Headless Verification**: Run a pipeline using only DB-stored assets and verify results.

### Manual Verification
- **Web GUI**: Verify that images still render correctly in the browser via the new `/api/assets` endpoint.
- **Calibration Pairing**: Upload two different reference images and two different checkers, associate them, and verify that the pipeline uses the correct pairings.
