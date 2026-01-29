–# 06. Web Architecture

This section details the architecture of the modern Web GUI introduced in V2.0.

## Overview
The Web Architecture decouples the frontend user interface from the heavy Python processing backend, allowing for easier deployment and a more modern user experience.

### Backend (Python/FastAPI)
The backend (`src/server.py`) serves as a REST API layer over the existing `ProjectManager` and Analysis Pipelines.

-   **Framework**: FastAPI
-   **Responsibilities**:
    -   Exposing project state (`GET /projects/{id}/files`).
    -   Handling file uploads (`POST /upload` with multipart support).
    -   Running analysis asynchronously (planned).
    -   Serving static reports.

#### Key Endpoints
-   `GET /api/projects/{id}/files`: Returns the status of all config files and lists training images.
-   `POST /api/projects/{id}/files/upload`: Handles file uploads. Supports categories: `ideal_checker`, `training_image`, `drawing_layer`, etc.
-   `DELETE /api/projects/{id}/dataset/images/{filename}`: Removes training images.
-   `GET /api/projects/{id}/dataset/validate-checker`: Runs the `ColorCorrectionPipeline` in validation mode to check patch detection.

### Frontend (React/Vite)
The frontend (`web-gui/`) is a Single Page Application (SPA).

-   **Framework**: React 18, Vite, TypeScript.
-   **Styling**: Tailwind CSS.
-   **State Management**: TanStack Query (React Query) for server state; Zustand for session state.

#### Core Components
-   **`FilePlacer.tsx`**: The main interface for Dataset management. Implements logic to mimic the legacy `file_placer_gui.py`, including immediate validation feedback.
-   **`AnalysisView.tsx`**: The dashboard for running analysis (in development).

## Docker Integration
The application is containerized using `docker-compose`.
-   **Backend**: Python 3.11 slim image.
-   **Frontend**: Node 20 Alpine image (build stage) -> Served via static server or proxy.
-   Current development setup runs the vite dev server inside the container for hot-reloading.
–"(ac18c7c1483078b19900afc78cd7675de4506b332_file:///c:/Users/Admin/Documents/Coding/QualiaQC/docs/system_description/06_web_architecture.md:0file:///c:/Users/Admin/Documents/Coding/QualiaQC