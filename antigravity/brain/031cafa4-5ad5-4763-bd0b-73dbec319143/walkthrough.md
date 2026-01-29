# Walkthrough - PaddleOCR Integration

I have successfully integrated PaddleOCR into the backend and resolved several dependency conflicts.

## Changes

### Backend Dependencies
I updated `requirements.txt` to include PaddleOCR and fix version conflicts:
- Added `paddlepaddle`, `paddleocr`, `opencv-python`.
- Pinned `numpy<2.0` to resolve PaddlePaddle compatibility issues.
- Pinned `langchain<0.2.0` and `langchain-community<0.2.0` to resolve a conflict where PaddleOCR (via PaddleX) was using a deprecated LangChain import.

### Backend Code
I updated `services/ocr_service.py`:
- Changed default language from Italian (`'it'`) to English (`'en'`).
- Removed the `show_log=False` argument which is no longer supported in the installed version of PaddleOCR.

## Verification Results

### Automated Verification
I ran a Python script to verify that `PaddleOCR` can be imported and initialized successfully.
```bash
python -c "from paddleocr import PaddleOCR; ocr = PaddleOCR(use_angle_cls=True, lang='en'); print('PaddleOCR initialized successfully')"
```
**Result**: `PaddleOCR initialized successfully` (after downloading models).

### Manual Verification Steps
To fully verify the integration:
1.  **Restart Backend**: Stop and restart your uvicorn server to load the new dependencies.
    ```bash
    cd backend
    uvicorn main:app --reload
    ```
2.  **Upload PDF**:
    - Go to the frontend (`http://localhost:5173`).
    - Navigate to "Upload & Extract".
    - Select "Use PaddleOCR".
    - Upload a PDF file.
    - Verify that the extraction proceeds without errors.

> [!NOTE]
> The first time you run OCR, it might take a few seconds to initialize the models if they weren't fully cached during my verification.
