•# Developer's Guide

This guide provides instructions for setting up a local development environment to contribute to the Visual Analyzer project.

---

## 1. Setting up the Development Environment

### Prerequisites

*   Python 3.9 or higher
*   Git

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd QualiaQC
    ```

2.  **Create and activate a virtual environment:**

    *   On Windows:
        ```bash
        python -m venv .venv
        .venv\Scripts\activate.bat
        ```
    *   On macOS/Linux:
        ```bash
        python3 -m venv .venv
        source .venv/bin/activate
        ```

3.  **Install dependencies:**
    All required packages are listed in `requirements.txt`. Install them using pip:
    ```bash
    pip install -r requirements.txt
    ```

---

## 2. Running the Application

The main graphical user interface (GUI) is the primary entry point for the application.

*   **To run the Legacy GUI:**
    ```bash
    python -m src.gui
    ```
*   **To run in debug mode** (which exposes more options in the GUI):
    ```bash
    python -m src.gui --debug
    ```

## 3. Architecture Overview

### Backend (FastAPI)
The modern backend is located in `src/server.py`. It uses:
- **FastAPI**: For high-performance async API endpoints.
- **SQLAlchemy**: For database ORM.
- **SQLite**: Default local database for project and asset tracking.

Key modules:
- `Pipeline` (`src/pipeline.py`): Orchestrates all analysis steps.
- `ReportGenerator` (`src/reporting/generator.py`): Generates HTML/PDF reports using ReportLab.
- `ProjectManager` (`src/project_management/manager.py`): Handles file I/O and cross-platform path resolution.

### Frontend (React)
The Web GUI is a Vite-powered React application in the `web-gui/` directory. It uses **TanStack Query** for reliable data fetching and **Lucide React** for icons.

---

## 4. Running Tests

This project uses `pytest` for testing. To run the test suite, simply execute the following command from the root of the project:

```bash
pytest
```

Make sure to write new tests for any new features or bug fixes you introduce.

---

## 4. Code Style and Linting

To maintain a consistent code style, this project uses a standard code formatter and linter. It is recommended to use a tool like `black` for formatting and `ruff` or `flake8` for linting.

*   **To format your code (using black):**
    ```bash
    pip install black
    black src/
    ```
*   **To check for linting errors (using a linter like ruff):**
    ```bash
    pip install ruff
    ruff check src/
    ```
˚ ˚˛*cascade08
˛ˇ ˇÉ	*cascade08
É	Ü	 Ü	ä	*cascade08
ä	å	 å	í	*cascade08
í	ñ	 ñ	ô	*cascade08
ô	ö	 ö	û	*cascade08
û	ü	 ü	°	*cascade08
°	¢	 ¢	•	*cascade08
•	ß	 ß	≠	*cascade08
≠	∑	 ∑	∏	*cascade08
∏	∫	 ∫	ª	*cascade08
ª	º	 º	æ	*cascade08
æ	ø	 ø	¡	*cascade08
¡	√	 √	≈	*cascade08
≈	∆	 ∆	ÿ	*cascade08
ÿ	Ÿ	 Ÿ	›	*cascade08
›	ﬁ	 ﬁ	‡	*cascade08
‡	·	 ·	Ë	*cascade08
Ë	Î	 Î	Ì	*cascade08
Ì	Ó	 Ó	˚	*cascade08
˚	˝	 ˝	É
*cascade08
É
Ñ
 Ñ
à
*cascade08
à
ã
 ã
è
*cascade08
è
ê
 ê
ï
*cascade08
ï
ò
 ò
´
*cascade08
´
¨
 ¨
Æ
*cascade08
Æ
∞
 ∞
±
*cascade08
±
≤
 ≤
µ
*cascade08
µ
∂
 ∂
∫
*cascade08
∫
Ω
 Ω
√
*cascade08
√
ƒ
 ƒ
≈
*cascade08
≈
∆
 ∆
—
*cascade08
—
“
 “
Ÿ
*cascade08
Ÿ
⁄
 ⁄
ﬂ
*cascade08
ﬂ
·
 ·
Í
*cascade08
Í
Ï
 Ï
Ì
*cascade08
Ì
Ó
 Ó
Ô
*cascade08
Ô

 
˚
*cascade08
˚
˝
 ˝
˛
*cascade08
˛
ˇ
 ˇ
ç*cascade08
çé éë*cascade08
ëì ìñ*cascade08
ñó óò*cascade08
òô ô£*cascade08
£§ §•*cascade08
•¶ ¶µ*cascade08
µ∂ ∂∏*cascade08
∏π πº*cascade08
ºæ æ¿*cascade08
¿¡ ¡¬*cascade08
¬ƒ ƒ≈*cascade08
≈∆ ∆«*cascade08
«À ÀÃ*cascade08
ÃÕ Õ–*cascade08
–— —“*cascade08
“” ”‘*cascade08
‘’ ’€*cascade08
€› ›ﬂ*cascade08
ﬂ· ·Ë*cascade08
ËÈ ÈÍ*cascade08
ÍÎ Î*cascade08
Ò Ò˘*cascade08
˘˙ ˙ä*cascade08
äã ãç*cascade08
çé éê*cascade08
êë ëî*cascade08
îñ ñó*cascade08
óò òù*cascade08
ùû û†*cascade08
†° °¶*cascade08
¶ß ß®*cascade08
®© ©±*cascade08
±≥ ≥∂*cascade08
∂∑ ∑∏*cascade08
∏∫ ∫ª*cascade08
ªº ºƒ*cascade08
ƒ» »…*cascade08
…   Ã*cascade08
ÃŒ Œ◊*cascade08
◊ÿ ÿÒ*cascade08
ÒÙ Ù˚*cascade08
˚¸ ¸Ä*cascade08
ÄÅ ÅÑ*cascade08
ÑÖ Öà*cascade08
àâ âë*cascade08
ëì ìó*cascade08
óò òô*cascade08
ôö öû*cascade08
ûü ü¢*cascade08
¢£ £§*cascade08
§ß ß≠*cascade08
≠Æ ÆØ*cascade08
Ø∞ ∞≥*cascade08
≥¥ ¥∂*cascade08
∂∑ ∑π*cascade08
πª ªæ*cascade08
æø ø¬*cascade08
¬√ √∆*cascade08
∆« « *cascade08
 À ÀÕ*cascade08
ÕŒ Œœ*cascade08
œ– –‹*cascade08
‹› ›·*cascade08
·‚ ‚„*cascade08
„‰ ‰Í*cascade08
ÍÎ ÎÏ*cascade08
ÏÓ ÓÚ*cascade08
ÚÛ ÛÙ*cascade08
Ù˛ ˛ã*cascade08
ãå åé*cascade08
éè èì*cascade08
ìî îò*cascade08
òô ôö*cascade08
öú ú≠*cascade08
≠Æ Æ±*cascade08
±≤ ≤≥*cascade08
≥¥ ¥∏*cascade08
∏π πø*cascade08
ø¿ ¿¡*cascade08
¡¬ ¬√*cascade08
√ƒ ƒ≈*cascade08
≈∆ ∆Ã*cascade08
ÃŒ Œ·*cascade08
·Î ÎÏ*cascade08
Ï• "(ac18c7c1483078b19900afc78cd7675de4506b332Hfile:///c:/Users/Admin/Documents/Coding/QualiaQC/docs/DEVELOPER_GUIDE.md:0file:///c:/Users/Admin/Documents/Coding/QualiaQC