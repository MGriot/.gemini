---
name: python-pro
description: Expert guidance on Modern Python Development. Covers tooling (uv, ruff), strict typing (mypy), project structure (src-layout), modern idioms (pydantic, asyncio), and CI/CD best practices. Use when creating new Python projects, refactoring legacy code, or setting up automation.
---

# Python Pro: Modern Development

This skill defines the gold standard for Python development in the 2024+ era. Move beyond legacy practices (requirements.txt, setup.py, untyped code) to a robust, production-ready workflow.

## 1. Modern Tooling Stack

| Category | Recommended Tool | Why? |
| :--- | :--- | :--- |
| **Package Manager** | **`uv`** | `uv` is 10-100x faster than pip/poetry. Handles python versions + dependencies + venvs. |
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

ALWAYS use the `src` layout. It prevents accidental imports from the project root and ensures testing against the installed package.

```text
my-project/
├── pyproject.toml       # Single config file for EVERYTHING
├── uv.lock              # Lock file (determinism)
├── README.md
├── .python-version      # Managed by uv
├── src/
│   └── my_package/
│       ├── __init__.py
│       └── main.py
└── tests/
    ├── __init__.py
    └── test_main.py
```

## 3. Configuration (`pyproject.toml`)

Centralize config. Avoid redundant `.flake8`, `pytest.ini`, or `.coveragerc`.

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

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B", "T20"] # I=Isort, UP=PyUpgrade, B=Bugbear, T20=Check prints
ignore = []

[tool.mypy]
strict = true
python_version = "3.10"
ignore_missing_imports = true

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
addopts = "-ra -q --cov=my_package --cov-report=term-missing"
```

## 4. Modern Idioms & Best Practices

### A. Strict Typing
Write strict types. Avoid `Any` where possible.
```python
from typing import Sequence, Mapping

def process(items: Sequence[int]) -> Mapping[str, int]:
    return {"total": sum(items)}
```

### B. Pydantic V2
Use `BaseModel` for data structures and `Field` for validation.
```python
from pydantic import BaseModel, Field, EmailStr

class User(BaseModel):
    id: int = Field(gt=0)
    name: str = Field(min_length=2)
    email: EmailStr
```

### C. Resource Management (`pathlib` & `contextlib`)
```python
from pathlib import Path
from contextlib import suppress

data_path = Path("data/raw.json")
with suppress(FileNotFoundError):
    content = data_path.read_text()
```

### D. AsyncIO Patterns
```python
import asyncio
import aiohttp

async def fetch(url: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            return await resp.json()
```

## 5. Testing & CI/CD

### A. Advanced Pytest
Use fixtures and marks.
```python
import pytest

@pytest.fixture
def sample_user():
    return User(id=1, name="Dev", email="dev@example.com")

@pytest.mark.asyncio
async def test_async_fetch():
    # ...
```

### B. CI Pipeline (GitHub Actions)
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install uv
        uses: astral-sh/setup-uv@v3
      - name: Run tests
        run: uv run pytest
```

## Checklist for Implementation
1.  **Typing**: All public APIs fully typed.
2.  **Linting**: `uv run ruff check .` passes.
3.  **Formatting**: `uv run ruff format .` applied.
4.  **Testing**: Minimum 80% coverage recommended.
5.  **Logging**: Use `logging.getLogger(__name__)`.
