#!/usr/bin/env python3
"""
quality_scan.py — Phase 4: Code Quality Scan
Analyzes code quality signals: complexity, TODOs, test coverage, docs.
Usage: python3 quality_scan.py <PROJECT_ROOT>
"""

import os
import sys
import json
import re
from pathlib import Path
from collections import defaultdict


SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build",
             ".next", ".nuxt", "coverage", ".pytest_cache", ".mypy_cache", "target", "vendor"}
CODE_EXTENSIONS = {".py", ".js", ".ts", ".jsx", ".tsx", ".go", ".rs", ".java", ".cs",
                   ".rb", ".php", ".cpp", ".c", ".h", ".swift", ".kt", ".scala", ".ex", ".exs"}
TEST_PATTERNS = re.compile(
    r'(test_|_test\.|\.test\.|\.spec\.|_spec\.|__tests__|/test/|/tests/|/spec/)',
    re.IGNORECASE
)


def safe_read(path):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception:
        return ""


def count_function_lines(content, ext):
    """Rough estimate of largest function/method size."""
    if ext in {".py"}:
        pattern = r'^(def |async def )'
        func_starts = [i for i, l in enumerate(content.splitlines()) if re.match(pattern, l.strip())]
    elif ext in {".js", ".ts", ".jsx", ".tsx"}:
        pattern = r'(function |=> \{|async function )'
        func_starts = [i for i, l in enumerate(content.splitlines()) if re.search(pattern, l)]
    elif ext in {".go", ".java", ".cs", ".cpp", ".c"}:
        pattern = r'\)\s*\{'
        func_starts = [i for i, l in enumerate(content.splitlines()) if re.search(pattern, l)]
    else:
        return []

    lines = content.splitlines()
    sizes = []
    for i in range(len(func_starts)):
        start = func_starts[i]
        end = func_starts[i + 1] if i + 1 < len(func_starts) else len(lines)
        sizes.append(end - start)
    return sizes


def scan_todos(content, filepath):
    """Find TODO/FIXME/HACK/NOTE comments."""
    pattern = re.compile(r'(TODO|FIXME|HACK|XXX|BUG|NOTE|OPTIMIZE|REFACTOR)[:\s]*(.*)', re.IGNORECASE)
    results = []
    for i, line in enumerate(content.splitlines(), 1):
        m = pattern.search(line)
        if m:
            results.append({
                "file": filepath,
                "line": i,
                "type": m.group(1).upper(),
                "message": m.group(2).strip()[:100]
            })
    return results


def has_docstring(content, ext):
    """Check if file has module-level documentation."""
    if ext == ".py":
        stripped = content.strip()
        return stripped.startswith('"""') or stripped.startswith("'''")
    if ext in {".js", ".ts", ".jsx", ".tsx"}:
        return content.strip().startswith("/**") or content.strip().startswith("/*")
    return False


def detect_linter_configs(root):
    """Check for linter/formatter config files."""
    linter_configs = {
        "ESLint": [".eslintrc", ".eslintrc.js", ".eslintrc.json", ".eslintrc.yml", ".eslintrc.yaml"],
        "Prettier": [".prettierrc", ".prettierrc.js", ".prettierrc.json"],
        "Ruff": ["ruff.toml", ".ruff.toml"],
        "Flake8": [".flake8", "setup.cfg"],
        "Pylint": [".pylintrc"],
        "Black": ["pyproject.toml"],  # check content separately
        "RuboCop": [".rubocop.yml"],
        "StyleCop": [".editorconfig"],
        "Clippy": ["Cargo.toml"],  # Rust
        "Golangci": [".golangci.yml", ".golangci.yaml"],
        "Biome": ["biome.json"],
        "OxLint": ["oxlintrc.json"],
    }
    found = {}
    for tool, files in linter_configs.items():
        for f in files:
            if os.path.exists(os.path.join(root, f)):
                found[tool] = f
                break
    return found


def detect_ci_cd(root):
    """Check for CI/CD configuration."""
    indicators = {}
    checks = {
        "GitHub Actions": ".github/workflows",
        "GitLab CI": ".gitlab-ci.yml",
        "Jenkins": "Jenkinsfile",
        "CircleCI": ".circleci/config.yml",
        "Travis CI": ".travis.yml",
        "Azure Pipelines": "azure-pipelines.yml",
        "Drone CI": ".drone.yml",
        "Bitbucket Pipelines": "bitbucket-pipelines.yml",
    }
    for name, path in checks.items():
        if os.path.exists(os.path.join(root, path)):
            indicators[name] = path
    return indicators


def main():
    if len(sys.argv) < 2:
        print("Usage: quality_scan.py <PROJECT_ROOT>", file=sys.stderr)
        sys.exit(1)

    root = os.path.abspath(sys.argv[1])

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"  REPO REVIEW — Phase 4: Code Quality Scan", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    total_source_files = 0
    total_test_files = 0
    total_lines = 0
    total_test_lines = 0
    large_files = []  # files > 500 lines
    large_functions = []  # functions > 100 lines
    all_todos = []
    files_with_docs = 0
    files_checked_for_docs = 0

    ext_stats = defaultdict(lambda: {"files": 0, "lines": 0})

    print("  Scanning source files...", file=sys.stderr)

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            ext = Path(fname).suffix.lower()
            if ext not in CODE_EXTENSIONS:
                continue

            fpath = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(fpath, root)
            content = safe_read(fpath)
            lines = content.count("\n") + 1

            is_test = bool(TEST_PATTERNS.search(rel_path))

            if is_test:
                total_test_files += 1
                total_test_lines += lines
            else:
                total_source_files += 1
                total_lines += lines
                ext_stats[ext]["files"] += 1
                ext_stats[ext]["lines"] += lines

                # Large file check
                if lines > 500:
                    large_files.append({"file": rel_path, "lines": lines})

                # Large function check
                func_sizes = count_function_lines(content, ext)
                for size in func_sizes:
                    if size > 100:
                        large_functions.append({"file": rel_path, "function_lines": size})

                # TODO/FIXME scan
                todos = scan_todos(content, rel_path)
                all_todos.extend(todos)

                # Documentation check
                files_checked_for_docs += 1
                if has_docstring(content, ext):
                    files_with_docs += 1

    # Sort large files
    large_files.sort(key=lambda x: x["lines"], reverse=True)
    large_functions.sort(key=lambda x: x["function_lines"], reverse=True)

    # Group todos by type
    todo_by_type = defaultdict(list)
    for t in all_todos:
        todo_by_type[t["type"]].append(t)

    # Calculate test ratio
    total_code_files = total_source_files + total_test_files
    test_ratio = (total_test_files / total_code_files * 100) if total_code_files > 0 else 0
    doc_ratio = (files_with_docs / files_checked_for_docs * 100) if files_checked_for_docs > 0 else 0

    linter_configs = detect_linter_configs(root)
    ci_cd = detect_ci_cd(root)

    # Quality score signals
    signals = []
    if test_ratio > 30:
        signals.append({"signal": "Good test coverage ratio", "positive": True, "value": f"{test_ratio:.0f}% test files"})
    elif test_ratio > 10:
        signals.append({"signal": "Moderate test coverage ratio", "positive": None, "value": f"{test_ratio:.0f}% test files"})
    else:
        signals.append({"signal": "Low test coverage ratio", "positive": False, "value": f"{test_ratio:.0f}% test files"})

    if linter_configs:
        signals.append({"signal": "Linting configured", "positive": True, "value": list(linter_configs.keys())})
    else:
        signals.append({"signal": "No linter configuration found", "positive": False, "value": None})

    if ci_cd:
        signals.append({"signal": "CI/CD configured", "positive": True, "value": list(ci_cd.keys())})
    else:
        signals.append({"signal": "No CI/CD configuration found", "positive": False, "value": None})

    if len(large_files) > 10:
        signals.append({"signal": "Many large files (>500 lines)", "positive": False, "value": f"{len(large_files)} files"})
    elif large_files:
        signals.append({"signal": "Some large files exist", "positive": None, "value": f"{len(large_files)} files"})

    if len(all_todos) > 50:
        signals.append({"signal": "High TODO/FIXME count", "positive": False, "value": f"{len(all_todos)} items"})
    elif all_todos:
        signals.append({"signal": "Some TODO/FIXME items", "positive": None, "value": f"{len(all_todos)} items"})

    result = {
        "summary": {
            "source_files": total_source_files,
            "test_files": total_test_files,
            "test_ratio_percent": round(test_ratio, 1),
            "total_source_lines": total_lines,
            "total_test_lines": total_test_lines,
            "doc_coverage_percent": round(doc_ratio, 1),
            "todo_fixme_count": len(all_todos),
            "large_files_count": len(large_files),
            "large_functions_count": len(large_functions),
        },
        "linter_configs": linter_configs,
        "ci_cd_systems": ci_cd,
        "quality_signals": signals,
        "large_files_top10": large_files[:10],
        "large_functions_top10": large_functions[:10],
        "todos_by_type": {k: v[:5] for k, v in todo_by_type.items()},  # top 5 per type
        "todos_total_by_type": {k: len(v) for k, v in todo_by_type.items()},
        "language_breakdown": [
            {"ext": ext, "files": stats["files"], "lines": stats["lines"]}
            for ext, stats in sorted(ext_stats.items(), key=lambda x: x[1]["lines"], reverse=True)
        ]
    }

    print(json.dumps(result, indent=2))
    print(f"\n  ✓ Quality scan complete. Test ratio: {test_ratio:.0f}%, TODOs: {len(all_todos)}", file=sys.stderr)


if __name__ == "__main__":
    main()
