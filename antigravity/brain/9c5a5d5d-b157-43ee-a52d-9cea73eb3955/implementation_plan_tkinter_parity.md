# Implementation Plan: Tkinter GUI Parity with Managed Storage

Bring the Tkinter GUI and core project creation logic into alignment with the new database-centric managed storage system.

## Proposed Changes

### [Component] Core Project Management
#### [MODIFY] [creation.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/project_management/creation.py)
- Refactor `create_project()` to:
    - Register the project in the database via `DatabaseManager`.
    - Create the project-specific managed storage directory in `data/storage/projects/[UUID]`.
    - Initialize project assets (config, directories) within the managed storage instead of `data/projects`.
    - Return logs relative to the new structure.

### [Component] Tkinter GUI
#### [MODIFY] [app.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/gui/app.py)
- Update `_scan_and_load_history()` to:
    - Query the database via `self.project_manager.db_manager.list_sessions()`.
    - Support both database records and legacy `.gri` files for backward compatibility (similar to the Web API).
- Update `_recreate_report()` to handle database-backed sessions.

#### [MODIFY] [analysis_tab.py](file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/gui/tabs/analysis_tab.py)
- Ensure project selection and metadata extraction work correctly with the new `ProjectManager` resolution logic.

## Verification Plan

### Manual Verification
1. **Tkinter Creation**: Use the "Projects" tab in the Tkinter GUI to create a new project and verify it appears in the database and `data/storage/projects/`.
2. **Tkinter Analysis**: Run an analysis session from the Tkinter GUI and verify it is recorded in the DB and history view.
3. **Tkinter History**: Verify that both new DB-backed sessions and old `.gri` files appear in the history tab.
4. **File Deletion Safe Test**: Manually delete an entry from `data/projects` and ensure the Tkinter GUI can still list and use it (proving it resolves via DB/Managed Storage).
