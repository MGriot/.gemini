#!/usr/bin/env python3
"""
Verify the integrity of a uv-managed project.
Checks for src-layout, pyproject.toml configuration, and lockfile synchronization.
"""

import sys
import subprocess
from pathlib import Path
import tomllib

def check_structure():
    print("Checking project structure...")
    root = Path.cwd()
    src = root / "src"
    if not src.is_dir():
        print("❌ Error: 'src' directory not found. Modern Python projects should use the src-layout.")
        return False
    
    # Check for packages inside src
    packages = [p for p in src.iterdir() if p.is_dir() and (p / "__init__.py").exists()]
    if not packages:
        print("❌ Error: No packages found in 'src/'. Ensure your code is inside a sub-package (e.g., src/my_app/).")
        return False
    
    print(f"✅ Found packages: {', '.join(p.name for p in packages)}")
    return True

def check_pyproject():
    print("\nChecking pyproject.toml...")
    path = Path("pyproject.toml")
    if not path.exists():
        print("❌ Error: pyproject.toml not found.")
        return False
    
    with path.open("rb") as f:
        config = tomllib.load(f)
    
    # Check for ruff and mypy config
    tools = config.get("tool", {})
    if "ruff" not in tools:
        print("⚠️ Warning: [tool.ruff] section missing. Highly recommended for linting.")
    if "mypy" not in tools:
        print("⚠️ Warning: [tool.mypy] section missing. Highly recommended for strict typing.")
    
    # Check pytest pythonpath
    pytest = tools.get("pytest", {}).get("ini_options", {})
    if "src" not in pytest.get("pythonpath", []):
        print("⚠️ Warning: 'src' not in [tool.pytest.ini_options].pythonpath. Tests might not find your code.")
    
    print("✅ pyproject.toml looks good.")
    return True

def check_uv():
    print("\nChecking uv synchronization...")
    if not Path("uv.lock").exists():
        print("⚠️ Warning: uv.lock not found. Run 'uv lock' to generate it.")
        return True
    
    try:
        # Check if lockfile is in sync with pyproject.toml
        result = subprocess.run(["uv", "lock", "--check"], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Error: uv.lock is out of sync with pyproject.toml. Run 'uv lock'.")
            return False
        print("✅ uv.lock is synchronized.")
    except FileNotFoundError:
        print("⚠️ Warning: 'uv' command not found. Skipping synchronization check.")
    
    return True

def main():
    success = True
    success &= check_structure()
    success &= check_pyproject()
    success &= check_uv()
    
    if success:
        print("\n✨ Project health: EXCELLENT")
    else:
        print("\n❌ Project health: ISSUES FOUND")
        sys.exit(1)

if __name__ == "__main__":
    main()
