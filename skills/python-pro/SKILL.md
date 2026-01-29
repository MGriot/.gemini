---
name: python-pro
description: Expert guidance on Modern Python Development. Covers tooling (uv, ruff), strict typing (mypy), project structure (src-layout), and modern idioms (pydantic, asyncio). Use when creating new Python projects or refactoring legacy code.
---

# Python Pro: Modern Development

This skill defines the gold standard for Python development in the 2024+ era. Move beyond legacy practices (requirements.txt, setup.py, untyped code) to a robust, production-ready workflow.

## 1. Modern Tooling Stack

| Category | Recommended Tool | Why? |
| :--- | :--- | :--- |
| **Package Manager** | **`uv`** (or Poetry) | `uv` is 10-100x faster than pip/poetry. Handles python versions + dependencies. |
| **Linter / Formatter** | **`ruff`** | Replaces Black, Isort, Flake8, Pylint. One tool, instant speed. |
| **Type Checker** | **`mypy`** (strict) | Static analysis to catch bugs before runtime. |
| **Testing** | **`pytest`** | The industry standard. See `test-expert` skill. |

### Setup Command (The "Holy Trinity")
```bash
# Initialize with uv
uv init my-project
cd my-project

# Add standard dev dependencies
uv add --dev ruff mypy pytest pytest-cov
```

## 2. Project Structure (The `src` Layout)

ALWAYS use the `src` layout. It prevents import errors and ensures you test against the installed package, not local files.

```text
my-project/
├── pyproject.toml       # Single config file for EVERYTHING
├── uv.lock              # Lock file (determinism)
├── README.md
├── src/
│   └── my_package/
│       ├── __init__.py
│       └── main.py
└── tests/
    ├── __init__.py
    └── test_main.py
```

## 3. Configuration (`pyproject.toml`)

Centralize config. Do not use `.flake8`, `pytest.ini`, or `.coveragerc`.

```toml
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = [
    "pydantic>=2.0",
]

[tool.ruff]
line-length = 88
target-version = "py310"
select = ["E", "F", "I", "UP", "B"] # I=Isort, UP=PyUpgrade, B=Bugbear

[tool.mypy]
strict = true
ignore_missing_imports = true

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
addopts = "-ra -q --cov=my_package"
```

## 4. Modern Idioms & Best Practices

### A. Typing is NOT Optional
Write strict types. It documents your code and catches 40% of bugs.
```python
# BAD
def process(data):
    return data['items']

# GOOD
from typing import List, Dict
def process(data: Dict[str, List[int]]) -> List[int]:
    return data["items"]
```

### B. Use `Pydantic` for Data Validation
Don't pass raw dictionaries around.
```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str

def create_user(user: User) -> None:
    print(f"Creating {user.name}")
```

### C. Path Handling (`pathlib`)
Stop using `os.path`.
```python
# BAD
import os
path = os.path.join(os.getcwd(), "data", "file.txt")

# GOOD
from pathlib import Path
path = Path.cwd() / "data" / "file.txt"
text = path.read_text(encoding="utf-8")
```

### D. AsyncIO
Use `async`/`await` for I/O bound tasks.
```python
import asyncio

async def fetch_data():
    await asyncio.sleep(1)
    return "data"

async def main():
    # Run concurrently
    results = await asyncio.gather(fetch_data(), fetch_data())
```

## Checklist for New Files
1.  **Imports**: Standard lib $\rightarrow$ Third party $\rightarrow$ Local (`ruff` handles this).
2.  **Typing**: All function arguments and return values typed.
3.  **Docstrings**: Google or Numpy style for complex logic.
4.  **No Prints**: Use `logging` or `structlog`.

```