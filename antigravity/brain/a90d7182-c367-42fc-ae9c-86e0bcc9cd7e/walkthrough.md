# Walkthrough - Fix Upload Failure and Asset 404s

I have implemented the following fixes to resolve the issues reported with the web GUI.

## Changes Made

### 1. Fixed 422 Upload Error
The `apiClient` in the frontend had a global `Content-Type: application/json` header. This was interfering with `multipart/form-data` uploads (used for images and assets), causing the backend to reject the request with a `422 Unprocessable Entity` error.

I removed this global header in [client.ts](file:///c:/Users/Admin/Documents/Coding/QualiaQC/web-gui/src/api/client.ts), allowing Axios to automatically set the correct `Content-Type` based on the request body.

### 3. Enabled PDF Report Generation and Downloads
Aligned the web GUI with the legacy GUI by ensuring PDF reports are created during analysis and can be easily downloaded.

> [!IMPORTANT]
> **Hotfixes Applied**:
> 1. Corrected an `AttributeError: DOCUMENT` in `src/pipeline.py`. Corrected to `AssetType.REPORT_PDF`.
> 2. Fixed a significant bug in the color correction logic where the system tried to access `.colors` instead of the correct `.patch_colors_rgb` on `DetectionResult` objects. This was preventing high-precision color correction from being calculated for individual project assets.

- **Backend**: Updated `ReportGenerator` and `Pipeline` to capture the absolute path of the generated PDF.
- **Data Persistence**: The PDF report is now tracked as a formal **asset** in the database, ensuring it persists across sessions.
- **API**: The `/api/analysis/run` and `/api/history` endpoints now return a `report_url`.
- **Frontend**: 
    - Added a **"DOWNLOAD PDF REPORT"** button to the `AnalysisView` upon successful completion.
    - Updated the `HistoryView` to include functional **Download** and **Regenerate** buttons for every past analysis.

## Verification Results

### Code Review
- Verified `apiClient` no longer forces `application/json`, fixing the 422 upload error.
- Verified `get_portable_basename` correctly extracts filenames from mixed path styles.
- Verified `Pipeline` now stores and tracks the PDF report as a database asset.
- Verified `AnalysisView` and `HistoryView` correctly handle the `report_url` for downloads.

### Manual Verification (Pending User Check)
1. **Successful Upload**: Colorchecker registration should now work.
2. **Restored Pipeline**: The analysis pipeline should complete without path errors.
3. **REPORT DOWNLOAD**: After analysis, a green button should appear to download the PDF.
4. **HISTORY ACCESS**: You can now download or regenerate any past report from the History tab.

render_diffs(file:///c:/Users/Admin/Documents/Coding/QualiaQC/web-gui/src/api/client.ts)
render_diffs(file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/server.py)
render_diffs(file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/project_management/manager.py)
render_diffs(file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/pipeline.py)
render_diffs(file:///c:/Users/Admin/Documents/Coding/QualiaQC/src/reporting/generator.py)
render_diffs(file:///c:/Users/Admin/Documents/Coding/QualiaQC/web-gui/src/features/analysis/AnalysisView.tsx)
render_diffs(file:///c:/Users/Admin/Documents/Coding/QualiaQC/web-gui/src/features/history/HistoryView.tsx)
