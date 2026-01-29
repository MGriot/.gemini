# Task: Debugging Pipeline Failure (Path Issue)

- [x] Investigate pipeline failure log <!-- id: 10 -->
    - [x] Analyze error message and incorrect path structure <!-- id: 11 -->
    - [x] Trace path generation in `manager.py` <!-- id: 12 -->
    - [x] Identify platform-dependent bugs in `heal_dict` and `get_project_file_paths` <!-- id: 13 -->
- [x] Implement robust path handling <!-- id: 14 -->
    - [x] Fix `os.path.basename` usage for Windows paths on Linux <!-- id: 15 -->
    - [x] Update `heal_dict` to favor relative paths within project folders <!-- id: 16 -->
    - [x] Fix `is_absolute` check in `get_project_file_paths` for Windows paths <!-- id: 17 -->
- [x] Verify fix and re-run analysis <!-- id: 18 -->
- [x] Implement PDF report generation and download button <!-- id: 19 -->
    - [x] Update `ReportGenerator` to return PDF path <!-- id: 20 -->
    - [x] Update `Pipeline` to store report info <!-- id: 21 -->
    - [x] Update `server.py` to expose report URL <!-- id: 22 -->
    - [x] Add download button to `AnalysisView.tsx` <!-- id: 23 -->
    - [x] **Hotfix**: Fix `AttributeError: DOCUMENT` in `Pipeline` <!-- id: 24 -->
- [x] Debug Color Correction `AttributeError` <!-- id: 25 -->
    - [x] Update `corrector.py` to use `patch_colors_rgb` <!-- id: 26 -->
    - [x] Verify fix in both project and image-specific correction flows <!-- id: 27 -->
