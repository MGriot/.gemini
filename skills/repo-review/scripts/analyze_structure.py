#!/usr/bin/env python3
"""
analyze_structure.py — Deep structural analysis of a software repository.

Usage:
    python3 analyze_structure.py <REPO_PATH> [--json] [--output FILE]

Outputs:
    A structured analysis of modules, imports, classes, functions, and coupling.
"""

import argparse
import ast
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", "vendor", "dist", "build",
    ".venv", "venv", "env", ".env", ".tox", "coverage", ".mypy_cache",
    ".pytest_cache", ".next", ".nuxt", "target", "bin", "obj",
}

SOURCE_EXTENSIONS = {
    ".py", ".js", ".ts", ".go", ".rs", ".java", ".rb", ".cs",
    ".php", ".swift", ".kt", ".cpp", ".c", ".h",
}


def should_skip(path: Path) -> bool:
    return any(part in IGNORE_DIRS for part in path.parts)


def iter_source_files(repo: Path):
    for root, dirs, files in os.walk(repo):
        root_path = Path(root)
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            fp = root_path / f
            if fp.suffix in SOURCE_EXTENSIONS:
                yield fp


# ─────────────────────────────────────────────────────────────────────────────
# Python AST analysis
# ─────────────────────────────────────────────────────────────────────────────

def analyze_python_file(filepath: Path) -> dict:
    try:
        source = filepath.read_text(encoding="utf-8", errors="replace")
        tree = ast.parse(source, filename=str(filepath))
    except SyntaxError as e:
        return {"error": f"SyntaxError: {e}", "path": str(filepath)}

    result = {
        "path": str(filepath),
        "lines": source.count("\n") + 1,
        "imports": [],
        "classes": [],
        "functions": [],
        "async_functions": [],
        "has_type_hints": False,
        "has_docstrings": False,
    }

    for node in ast.walk(tree):
        if isinstance(node, (ast.Import,)):
            for alias in node.names:
                result["imports"].append(alias.name)
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            for alias in node.names:
                result["imports"].append(f"{module}.{alias.name}")
        elif isinstance(node, ast.ClassDef):
            bases = [ast.unparse(b) if hasattr(ast, "unparse") else "?" for b in node.bases]
            result["classes"].append({
                "name": node.name,
                "line": node.lineno,
                "bases": bases,
                "methods": [
                    n.name for n in ast.walk(node)
                    if isinstance(n, ast.FunctionDef) and n.col_offset > node.col_offset
                ],
            })
        elif isinstance(node, ast.AsyncFunctionDef):
            result["async_functions"].append({"name": node.name, "line": node.lineno})
        elif isinstance(node, ast.FunctionDef):
            if node.returns or any(a.annotation for a in node.args.args):
                result["has_type_hints"] = True
            result["functions"].append({"name": node.name, "line": node.lineno})
        elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Constant):
            if isinstance(node.value.value, str):
                result["has_docstrings"] = True

    return result


# ─────────────────────────────────────────────────────────────────────────────
# Generic regex-based analysis (JS/TS/Go/Java/etc.)
# ─────────────────────────────────────────────────────────────────────────────

PATTERNS = {
    "js_ts": {
        "imports": re.compile(r"""(?:import|require)\s*[({]?\s*['"]([^'"]+)['"]"""),
        "exports": re.compile(r"""export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)"""),
        "classes": re.compile(r"""class\s+(\w+)"""),
        "functions": re.compile(r"""(?:function|const|let|var)\s+(\w+)\s*[=\(]"""),
        "async": re.compile(r"""async\s+function\s+(\w+)"""),
    },
    "go": {
        "imports": re.compile(r'''"([^"]+)"'''),
        "functions": re.compile(r"""^func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(""", re.MULTILINE),
        "structs": re.compile(r"""^type\s+(\w+)\s+struct""", re.MULTILINE),
        "interfaces": re.compile(r"""^type\s+(\w+)\s+interface""", re.MULTILINE),
    },
    "java": {
        "imports": re.compile(r"""^import\s+([\w.]+);""", re.MULTILINE),
        "classes": re.compile(r"""(?:public|private|protected)?\s*(?:abstract\s+)?class\s+(\w+)"""),
        "interfaces": re.compile(r"""interface\s+(\w+)"""),
        "methods": re.compile(r"""(?:public|private|protected|static)\s+\w[\w<>,\[\] ]+\s+(\w+)\s*\("""),
    },
}


def analyze_generic_file(filepath: Path) -> dict:
    try:
        source = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return {"error": str(e), "path": str(filepath)}

    result = {
        "path": str(filepath),
        "lines": source.count("\n") + 1,
        "raw_findings": {},
    }

    ext = filepath.suffix
    if ext in (".js", ".ts", ".jsx", ".tsx"):
        lang_patterns = PATTERNS["js_ts"]
    elif ext == ".go":
        lang_patterns = PATTERNS["go"]
    elif ext in (".java", ".kt"):
        lang_patterns = PATTERNS["java"]
    else:
        return result

    for label, pat in lang_patterns.items():
        matches = pat.findall(source)
        if matches:
            result["raw_findings"][label] = matches[:20]  # cap at 20

    return result


# ─────────────────────────────────────────────────────────────────────────────
# Dependency / coupling graph
# ─────────────────────────────────────────────────────────────────────────────

def build_import_graph(analyses: list) -> dict:
    """Build a simplified internal import graph for Python."""
    internal_modules = set()
    for a in analyses:
        if a.get("path", "").endswith(".py"):
            mod = Path(a["path"]).stem
            internal_modules.add(mod)

    graph = defaultdict(list)
    for a in analyses:
        if not a.get("path", "").endswith(".py"):
            continue
        src = Path(a["path"]).stem
        for imp in a.get("imports", []):
            root = imp.split(".")[0]
            if root in internal_modules and root != src:
                graph[src].append(root)

    return dict(graph)


# ─────────────────────────────────────────────────────────────────────────────
# Summary stats
# ─────────────────────────────────────────────────────────────────────────────

def compute_summary(analyses: list, repo: Path) -> dict:
    total_lines = 0
    total_files = 0
    by_ext = defaultdict(int)
    all_classes = []
    all_functions = []
    type_hinted = 0
    docstrings = 0
    errors = []

    for a in analyses:
        if "error" in a:
            errors.append(a)
            continue
        fp = Path(a["path"])
        lines = a.get("lines", 0)
        total_lines += lines
        total_files += 1
        by_ext[fp.suffix] += 1

        if fp.suffix == ".py":
            all_classes.extend(
                [f"{fp.relative_to(repo)}::{c['name']}" for c in a.get("classes", [])]
            )
            all_functions.extend(
                [f"{fp.relative_to(repo)}::{f['name']}" for f in a.get("functions", [])]
            )
            if a.get("has_type_hints"):
                type_hinted += 1
            if a.get("has_docstrings"):
                docstrings += 1

    largest = sorted(analyses, key=lambda x: x.get("lines", 0), reverse=True)[:10]

    return {
        "total_source_files": total_files,
        "total_lines": total_lines,
        "by_extension": dict(by_ext),
        "python_classes_found": len(all_classes),
        "python_functions_found": len(all_functions),
        "python_files_with_type_hints": type_hinted,
        "python_files_with_docstrings": docstrings,
        "largest_files": [
            {"path": str(Path(a["path"]).relative_to(repo)), "lines": a.get("lines", 0)}
            for a in largest
        ],
        "parse_errors": len(errors),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Analyze repository structure")
    parser.add_argument("repo", help="Path to the repository")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    parser.add_argument("--output", help="Write output to this file")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not repo.is_dir():
        print(f"Error: {repo} is not a directory", file=sys.stderr)
        sys.exit(1)

    print(f"Analyzing: {repo}", file=sys.stderr)

    # Analyze all files
    analyses = []
    for fp in iter_source_files(repo):
        if fp.suffix == ".py":
            analyses.append(analyze_python_file(fp))
        else:
            analyses.append(analyze_generic_file(fp))
        sys.stderr.write(".")
        sys.stderr.flush()
    sys.stderr.write("\n")

    summary = compute_summary(analyses, repo)
    import_graph = build_import_graph(analyses)

    output_data = {
        "repo": str(repo),
        "summary": summary,
        "import_graph": import_graph,
        "files": analyses,
    }

    if args.json:
        out = json.dumps(output_data, indent=2)
    else:
        lines = []
        lines.append(f"\n{'='*60}")
        lines.append(f"  REPOSITORY STRUCTURE ANALYSIS")
        lines.append(f"  {repo.name}")
        lines.append(f"{'='*60}\n")

        s = summary
        lines.append(f"Total source files : {s['total_source_files']}")
        lines.append(f"Total lines        : {s['total_lines']:,}")
        lines.append(f"Parse errors       : {s['parse_errors']}")
        lines.append("")

        lines.append("Files by extension:")
        for ext, cnt in sorted(s["by_extension"].items(), key=lambda x: -x[1]):
            lines.append(f"  {ext:<8} {cnt} files")
        lines.append("")

        if s["python_classes_found"] or s["python_functions_found"]:
            lines.append("Python specifics:")
            lines.append(f"  Classes         : {s['python_classes_found']}")
            lines.append(f"  Functions       : {s['python_functions_found']}")
            lines.append(f"  With type hints : {s['python_files_with_type_hints']} files")
            lines.append(f"  With docstrings : {s['python_files_with_docstrings']} files")
            lines.append("")

        lines.append("Largest source files:")
        for f in s["largest_files"]:
            lines.append(f"  {f['lines']:>6} lines  {f['path']}")
        lines.append("")

        if import_graph:
            lines.append("Internal Python import graph (source → depends on):")
            for mod, deps in sorted(import_graph.items()):
                lines.append(f"  {mod} → {', '.join(sorted(set(deps)))}")
            lines.append("")

        out = "\n".join(lines)

    if args.output:
        Path(args.output).write_text(out)
        print(f"Output written to: {args.output}")
    else:
        print(out)


if __name__ == "__main__":
    main()
