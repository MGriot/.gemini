#!/usr/bin/env python3
"""
call_graph.py — Trace import/call dependencies from an entry file.
Usage: python3 call_graph.py <PROJECT_ROOT> --entry <ENTRY_FILE>
"""

import os
import sys
import re
import json
import argparse
from pathlib import Path
from collections import defaultdict, deque


SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", "target", "vendor"}


def extract_python_imports(content):
    imports = []
    for line in content.splitlines():
        line = line.strip()
        m = re.match(r'^import\s+([\w.]+)', line)
        if m: imports.append(m.group(1))
        m = re.match(r'^from\s+([\w.]+)\s+import', line)
        if m: imports.append(m.group(1))
    return imports


def extract_js_imports(content):
    imports = []
    patterns = [
        r"(?:import|require)\s*\(?['\"]([^'\"]+)['\"]",
        r"from\s+['\"]([^'\"]+)['\"]",
    ]
    for pat in patterns:
        for m in re.finditer(pat, content):
            imports.append(m.group(1))
    return imports


def extract_go_imports(content):
    imports = []
    in_block = False
    for line in content.splitlines():
        stripped = line.strip()
        if stripped == 'import (':
            in_block = True
            continue
        if in_block:
            if stripped == ')':
                in_block = False
                continue
            m = re.search(r'"([^"]+)"', stripped)
            if m: imports.append(m.group(1))
        else:
            m = re.match(r'import\s+"([^"]+)"', stripped)
            if m: imports.append(m.group(1))
    return imports


def resolve_import(imp, current_file, root, ext):
    """Try to resolve an import string to a file path."""
    if imp.startswith(".") or imp.startswith("/"):
        # Relative import
        base_dir = os.path.dirname(current_file)
        candidate = os.path.normpath(os.path.join(base_dir, imp))
        for suffix in [ext, ext.replace(".", ""), ""]:
            for try_ext in [".py", ".js", ".ts", ".jsx", ".tsx"]:
                full = candidate + try_ext
                if os.path.exists(full):
                    return os.path.relpath(full, root)
                index = os.path.join(candidate, "index" + try_ext)
                if os.path.exists(index):
                    return os.path.relpath(index, root)
    return None


def build_import_graph(root, entry_file, max_depth=4):
    """BFS through imports starting from entry file."""
    entry_path = os.path.join(root, entry_file)
    if not os.path.exists(entry_path):
        return {"error": f"Entry file not found: {entry_path}"}

    graph = defaultdict(list)
    visited = set()
    queue = deque([(entry_file, 0)])

    while queue:
        current_rel, depth = queue.popleft()
        if current_rel in visited or depth > max_depth:
            continue
        visited.add(current_rel)

        current_abs = os.path.join(root, current_rel)
        ext = Path(current_abs).suffix.lower()

        try:
            with open(current_abs, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            continue

        if ext == ".py":
            imports = extract_python_imports(content)
        elif ext in {".js", ".ts", ".jsx", ".tsx"}:
            imports = extract_js_imports(content)
        elif ext == ".go":
            imports = extract_go_imports(content)
        else:
            imports = []

        for imp in imports:
            resolved = resolve_import(imp, current_abs, root, ext)
            if resolved and resolved not in visited:
                graph[current_rel].append(resolved)
                queue.append((resolved, depth + 1))
            else:
                # External dependency
                pkg = imp.split("/")[0] if "/" in imp else imp.split(".")[0]
                if pkg and not graph[current_rel] or pkg not in graph[current_rel]:
                    graph[current_rel].append(f"[ext] {pkg}")

    return {
        "entry": entry_file,
        "files_reachable": len(visited),
        "graph": dict(graph),
        "file_list": sorted(visited)
    }


def main():
    parser = argparse.ArgumentParser(description="Trace import call graph from entry point")
    parser.add_argument("project_root")
    parser.add_argument("--entry", required=True, help="Entry file relative to project root")
    parser.add_argument("--max-depth", type=int, default=4)
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"  REPO REVIEW — Call Graph Tracer", file=sys.stderr)
    print(f"  Entry: {args.entry}", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    result = build_import_graph(root, args.entry, args.max_depth)
    print(json.dumps(result, indent=2))
    print(f"\n  ✓ Call graph complete. Files reachable: {result.get('files_reachable', 0)}", file=sys.stderr)


if __name__ == "__main__":
    main()
