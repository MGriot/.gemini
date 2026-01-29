# Persistence Layer Restructuring: Design RFC

## 1. Objective
Replace the fragile `pickle`-based (`.gri`) persistence with a robust, structured, and queryable system. The goal is to separate **Metadata** (searchable) from **Heavy Assets** (images/masks), ensuring full capability to regenerate reports at any time.

## 2. Architecture Overview

-   **Database (SQLite)**: Stores structured metadata, session configurations, and metrics.
-   **Asset Store (File System)**: Stores binary blobs (Images, PDFs) in an immutable, content-addressable or session-scoped structure.
-   **Persistence Manager**: A new Python module (`src/persistence`) to mediate all reads/writes.

## 3. Database Schema (SQLAlchemy Models)

### `AnalysisSession`
Represents a single execution of the pipeline.
-   `id`: UUID (Primary Key)
-   `project_id`: String (Foreign Key to Project)
-   `created_at`: DateTime
-   `status`: Enum (RUNNING, COMPLETED, FAILED)
-   `config_snapshot`: JSON (Copy of `project_config.json` used)
-   `pipeline_args`: JSON (CLI arguments used)
-   `metadata`: JSON (Part Number, Thickness, Author, etc.)

### `AnalysisAsset`
Tracks binary files associated with a session.
-   `id`: UUID (PK)
-   `session_id`: UUID (FK to Session)
-   `asset_type`: Enum (ORIGINAL_IMAGE, MASKED_IMAGE, STEP_DEBUG_IMAGE, REPORT_PDF)
-   `role`: String (e.g., "color_correction_debug_step_1", "final_mask")
-   `file_path`: String (Relative path in Asset Store)
-   `hash`: String (SHA256 for integrity)

### `AnalysisMetric`
Stores numeric results for trending and querying.
-   `id`: UUID (PK)
-   `session_id`: UUID (FK)
-   `category`: String (e.g., "color_analysis", "symmetry")
-   `key`: String (e.g., "delta_e_mean", "symmetry_score")
-   `value`: Float
-   `unit`: String (optional)

## 4. Asset Store Structure

Files will be stored in `data/history/{year}/{month}/{session_id}/`.

```
data/history/2025/12/550e8400-e29b-41d4-a716-446655440000/
├── original.png            # The raw input image (CRITICAL for regeneration)
├── masked.png              # The final masked image
├── report.pdf              # The generated report
└── debug/                  # Folder for intermediate steps
    ├── 01_color_correction.png
    └── 02_alignment.png
```

## 5. Migration Strategy
1.  **Phase A**: Implement `src/persistence` module and DB migrations.
2.  **Phase B**: Update `Pipeline.py` to write to DB instead of `.gri`.
    -   *Checkpoint*: Pipeline runs should populate the DB.
3.  **Phase C**: Update `ReportingPipeline` to read from DB.
4.  **Phase D**: Create API capabilities to query history (`GET /api/history`) using SQL instead of file scanning.

## 6. Regeneration Logic
To regenerate a report:
1.  Load `AnalysisSession` by ID.
2.  Retrieve `AnalysisAsset` where `role='original_image'`.
3.  Re-hydrate `Pipeline` with `config_snapshot`.
4.  Re-run analysis OR simply re-assemble the report using stored `AnalysisMetric` and `AnalysisAsset` images if the goal is just *reprinting* vs *recalculating*. 
    -   *Note*: The user request implies re-generating the PDF, which might just mean re-running the `ReportGenerator` with the stored data, not necessarily re-running OpenCV logic. This design supports both.
