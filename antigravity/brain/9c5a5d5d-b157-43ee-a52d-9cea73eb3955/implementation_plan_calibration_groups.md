# Implementation Plan: Calibration Groups & Terminology Refactor

Refactor the system to use "Calibration Images" instead of "Training Images" and implement a group-based association system where specific images can be paired with individual color checkers.

## Proposed Changes

### [Component] Database Schema
#### [MODIFY] [models.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/db/models.py)
- **`ProjectAsset`**:
    - Add `parent_asset_id = Column(String, ForeignKey("project_assets.id"), nullable=True)` to allow linking a calibration image to a specific color checker.
    - Update category types in documentation/enums.

#### [MODIFY] [manager.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/db/manager.py)
- Update `_migrate_schema` to add the `parent_asset_id` column.
- Update `add_project_asset` to support the new link.

### [Component] Project Management
#### [MODIFY] [manager.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/project_management/manager.py)
- **Rename**: Refactor all methods and variables containing `training_image` to `calibration_image`.
- **Logic**: Update `get_project_file_paths` to resolve the specific color checker associated with a calibration image if a `parent_asset_id` is present.
- **Directory**: Update managed storage subfolder name from `training_images` to `calibration_images` (handle migration).

### [Component] Pipeline & Reporting
#### [MODIFY] [pipeline.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/pipeline.py)
- Update code to reflect the new "Calibration" terminology.
- Ensure the pipeline requests the specific checker for the image being processed during the calibration phase.

### [Component] UI & API
#### [MODIFY] [server.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/server.py)
- Update endpoints to use `/api/projects/{id}/calibration/...` instead of `/training/...`.
- Update the file listing to include association metadata.

## Verification Plan

### Manual Verification
1. **Renaming Check**: Verify that "Training Images" is nowhere to be found in the Web and Tkinter GUIs.
2. **Pairwise Calibration**:
    - Upload two different color checkers.
    - Upload two calibration images.
    - Associate Image A with Checker A, and Image B with Checker B.
    - Verify that the pipeline correctly uses the chosen checker for each image.
3. **Managed Storage migration**: Verify that files are moved from `training_images/` to `calibration_images/` automatically during migration.
