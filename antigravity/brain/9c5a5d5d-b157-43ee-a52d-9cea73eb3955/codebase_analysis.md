# QualiaQC Codebase Analysis

## 1. System Overview
QualiaQC is a computer vision quality control system transitioning from a legacy Tkinter desktop application to a modern Web-based architecture.

-   **Backend**: Python (FastAPI) acting as both the API server and the heavy-lifting orchestration engine for image processing pipelines.
-   **Frontend**: React (Vite + Tailwind CSS) providing a responsive modern interface.
-   **Deployment**: Dockerized services (Backend + Frontend served via Nginx or similar, currently dev setup via `npm run dev` in container).

## 2. Backend Architecture (`src/`)
The backend is structured around a central **Orchestrator Pattern**.

### Core Components
-   **`pipeline.py` (The Orchestrator)**:
    -   Central entry point for analysis.
    -   Manages state (`image_to_be_processed`, `metadata`, `project_data`).
    -   Sequentially executes sub-pipelines:
        1.  `ColorCorrectionPipeline`: Normalizes colors using reference charts.
        2.  `GeometricAlignmentPipeline`: Aligns images using ArUco markers.
        3.  `ObjectAlignmentPipeline`: Fine-tunes alignment based on object reference.
        4.  `MaskingPipeline`: Segments the object from background/drawings.
        5.  `ColorAnalysisPipeline`: Extracts color metrics (HSV, delta-E).
        6.  `SymmetryAnalysisPipeline`: Checks object symmetry.
        7.  `ReportingPipeline`: Generates PDF/JSON reports.

-   **`project_management/manager.py`**:
    -   Handles file system operations for projects.
    -   Manages `project_config.json` and `dataset_item_processing_config.json`.
    -   **Key Feature**: Recent updates ensured complete parity with legacy GUI for file asset management (uploads/validation).

-   **`server.py`**:
    -   FastAPI application exposing the pipelines to the web.
    -   Manages asynchronous tasks (though mostly synchronous in current implementation).
    -   Endpoints for Project management (`GET /projects`), File management (`POST /upload`), and Analysis execution.

### Logic State
-   **Strengths**: Modular pipeline design allows easy testing of individual steps. "Pure" Python implementation implies easy porting to other interfaces.
-   **Weaknesses**: Heavy reliance on file-system state (JSONs) rather than a database. Caching logic in `ProjectManager` handles some performance issues but concurrency could be a challenge.

## 3. Frontend Architecture (`web-gui/src/`)
The frontend is a Single Page Application (SPA) tracking the backend's "Project" model.

### Feature Map
-   **Navigation (`App.tsx`)**:
    -   **Analysis**: Main dashboard for running new QC checks.
    -   **History**: Review past analysis reports.
    -   **Projects**: Create/Switch projects.
    -   **Dataset**: Configuration hub (`FilePlacer.tsx`).

-   **Components**:
    -   **`FilePlacer.tsx`**: Fully implemented Parity with Legacy GUI.
        -   Uploads Config files (Reference Images, Color Checkers).
        -   Manages Training Images (Bulk Upload, Delete).
        -   Real-time validation of Reference Color Checkers (patch counting).
    -   **State Management**: Uses `TanStack Query` (React Query) for efficient server state syncing and caching.

## 4. Parity Status (Web vs Legacy Tkinter)
| Feature | Legacy (Tkinter) | Web (React) | Status |
| :--- | :--- | :--- | :--- |
| **Project Creation** | Functional | Implemented | ✅ Good |
| **File Placer** | Drag/Drop, Path Selection | Upload/Delete/Validate | ✅ **Complete** |
| **Analysis Config** | ROI selectors, Threshold sliders | *Partially Implemented* | 🚧 In Progress |
| **Run Analysis** | Real-time visual feedback | *Basic Implementation* | 🚧 Needs Polish |
| **Results Viewer** | Matplotlib windows | Web Dashboard | 🚧 Needs Polish |

## 5. Recommendations
1.  **Analysis Configuration**: The Web GUI needs rich interactive tools (ROI selectors on canvas) to fully replace the Tkinter ROI configuration steps.
2.  **Real-Time Feedback**: Implement WebSocket or Server-Sent Events (SSE) in `server.py` to stream pipeline progress (e.g. "Step 1/7: Detecting Colors...") to the Frontend.
3.  **Database**: Considerations for moving from `json` configs to SQLite/PostgreSQL for robust history tracking.
