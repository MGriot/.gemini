# Implementation Plan - Local Payslip Extractor Integration

The goal is to implement a robust data extraction strategy for Italian payslips using a local LLM (Qwen-2.5-Coder-14B or Llama-3.1-8B) and `pymupdf4llm` for PDF-to-Markdown conversion. This replaces the generic LangChain implementation with a specialized, schema-enforced approach.

## User Review Required
> [!IMPORTANT]
> **Model Requirement**: This implementation assumes you have `ollama` running with `qwen2.5-coder:14b` or `llama3.1:8b`. You must pull the model using `ollama pull qwen2.5-coder:14b` (or your preferred model) before running the application.
> **Dependency**: `pymupdf4llm` and `ollama` python packages will be added.

## Proposed Changes

### Backend Dependencies
#### [MODIFY] [requirements.txt](file:///c:/Users/Admin/Documents/Coding/test/requirements.txt)
- Add `pymupdf4llm`
- Add `ollama`

### Backend Services
#### [NEW] [local_llm_extractor.py](file:///c:/Users/Admin/Documents/Coding/test/backend/services/local_llm_extractor.py)
- Implement `LocalPayslipExtractor` class.
- Use `pymupdf4llm` to convert PDF to Markdown.
- Use `ollama` library to interact with the local model.
- Implement strict JSON schema enforcement and "Critic" validation logic for number formatting.
- Map extracted data to `PayrollEntryCreate` schema.

#### [MODIFY] [main.py](file:///c:/Users/Admin/Documents/Coding/test/backend/main.py)
- Import `LocalPayslipExtractor`.
- Update `/upload` endpoint to use `LocalPayslipExtractor` when `method="llm"` (or add a new method).
- Handle temporary file saving (required for `pymupdf4llm` if it doesn't support bytes directly, or use `fitz` to open stream and pass to `pymupdf4llm` if supported).

## Verification Plan

### Automated Tests
- Create a test script `tests/test_local_extractor_mock.py` to verify the `LocalPayslipExtractor` logic (JSON parsing, number correction) by mocking the `ollama.chat` response. This ensures the logic works even if the local LLM isn't running during development.
    - Command: `python tests/test_local_extractor_mock.py`

### Manual Verification
- Start the backend: `uvicorn main:app --reload`
- Ensure Ollama is running: `ollama serve`
- Upload a sample Italian payslip PDF via the frontend (or Swagger UI).
- Verify that the data is extracted correctly, especially the numbers (e.g., `1.200,50` -> `1200.50`).
