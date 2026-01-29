# Walkthrough - Payroll Data Extraction App

## Overview
I have built a full-stack application to manage payroll documents.
- **Frontend**: React (Vite) with a premium dark-themed UI.
- **Backend**: Python (FastAPI) with SQLite database.
- **AI**: Integration with Local LLM (via LangChain/Ollama) for data extraction.

## Features
1. **Dashboard**: View summary statistics and recent uploads.
2. **Upload**: Drag & drop PDF files.
3. **Extraction**: Automatically extracts Employee Name, Period, Salary, etc.
4. **Review**: Edit extracted data before saving.
5. **Duplicate Prevention**: Prevents uploading the same file or same data twice.

## How to Run

### Prerequisites
1. **Node.js** and **Python 3.10+**.
2. **Ollama** installed and running (with `llama3` or similar model pulled).
   ```bash
   ollama pull llama3
   ```

### Backend
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Activate virtual environment:
   ```bash
   .\venv\Scripts\activate
   ```
3. Run server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Run development server:
   ```bash
   npm run dev
   ```

## Verification
- Open `http://localhost:5173`.
- Upload a PDF.
- Verify data is extracted.
- Confirm and save.
- Check Dashboard for updates.
