#!/usr/bin/env python3
"""
coupling_analysis.py — Phase 5: Import graph and coupling metrics.

Usage: python3 coupling_analysis.py <repo_path> [--lang auto] [--output text|json|dot]

Builds a module dependency graph and identifies high-coupling modules.
"""

import os
import re
import sys
import json
import argparse
from pathlib import Path
from collections import defaultdict
from dataclasses import dataclass, asdict
from typing import Dict, List, Set, Tuple


SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".tox", "venv", ".venv",
    "dist", "build", "target", "vendor", "generated", ".cache",
}


@dataclass
class ModuleNode:
    name: str           # module name / relative path
    file: str           # actual file path
    imports: List[str]  # what this module imports
    imported_by: List[str]  # what imports this module
    fan_out: int = 0    # number of modules this depends on
    fan_in: int = 0     # number of modules that depend on this
    is_internal: bool = True


def extract_python_imports(filepath: Path, repo_root: Path) -> List[str]:
    """Extract Python import statements."""
    imports = []
    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
        for line in content.splitlines():
            stripped = line.strip()
            # from X import Y  /  import X
            m = re.match(r'^(?:from\s+([\w\.]+)|import\s+([\w\.,\s]+))', stripped)
            if m:
                mod = m.group(1) or m.group(2).split(",")[0].strip().split(" ")[0]
                imports.append(mod.strip())
    except Exception:
        pass
    return imports


def extract_js_imports(filepath: Path) -> List[str]:
    """Extract JS/TS import statements."""
    imports = []
    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
        # ES6 imports
        for m in re.finditer(r'''(?:import|export)\s+.*?\s+from\s+['"]([^'"]+)['"]''', content):
            imports.append(m.group(1))
        # require()
        for m in re.finditer(r'''require\s*\(\s*['"]([^'"]+)['"]\s*\)''', content):
            imports.append(m.group(1))
    except Exception:
        pass
    return imports


def extract_go_imports(filepath: Path) -> List[str]:
    """Extract Go import statements."""
    imports = []
    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
        in_import = False
        for line in content.splitlines():
            stripped = line.strip()
            if stripped == "import (":
                in_import = True
                continue
            if stripped == ")" and in_import:
                in_import = False
                continue
            if in_import:
                m = re.search(r'"([^"]+)"', stripped)
                if m:
                    imports.append(m.group(1))
            elif stripped.startswith('import "'):
                m = re.search(r'"([^"]+)"', stripped)
                if m:
                    imports.append(m.group(1))
    except Exception:
        pass
    return imports


def normalize_module_name(import_str: str, filepath: Path, repo_root: Path, lang: str) -> Tuple[str, bool]:
    """Return (module_name, is_internal)."""
    # Relative imports are always internal
    if import_str.startswith("."):
        return import_str, True

    # Check if it resolves to an internal file
    if lang == "python":
        parts = import_str.split(".")
        candidate = repo_root / Path(*parts).with_suffix(".py")
        if candidate.exists():
            return str(candidate.relative_to(repo_root)), True
        candidate_init = repo_root / Path(*parts) / "__init__.py"
        if candidate_init.exists():
            return str((repo_root / Path(*parts)).relative_to(repo_root)), True
        return import_str, False

    elif lang in ("js", "ts"):
        if import_str.startswith("/") or import_str.startswith("~"):
            return import_str, True
        if not import_str.startswith(".") and not import_str.startswith("@"):
            return import_str, False  # node_modules
        return import_str, True

    elif lang == "go":
        # Internal if it contains the module path prefix (heuristic)
        return import_str, False  # simplified

    return import_str, False


def build_graph(repo_path: Path, lang: str = "auto") -> Dict[str, ModuleNode]:
    nodes: Dict[str, ModuleNode] = {}
    import_map: Dict[str, List[str]] = defaultdict(list)  # file -> list of imports

    ext_lang = {
        ".py": "python",
        ".js": "js", ".jsx": "js", ".mjs": "js",
        ".ts": "ts", ".tsx": "ts",
        ".go": "go",
    }

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            fpath = Path(root) / fname
            ext = fpath.suffix.lower()
            detected_lang = ext_lang.get(ext)
            if not detected_lang:
                continue
            if lang != "auto" and detected_lang != lang:
                continue

            relative = str(fpath.relative_to(repo_path))

            if detected_lang == "python":
                raw_imports = extract_python_imports(fpath, repo_path)
            elif detected_lang in ("js", "ts"):
                raw_imports = extract_js_imports(fpath)
            elif detected_lang == "go":
                raw_imports = extract_go_imports(fpath)
            else:
                continue

            resolved = []
            for imp in raw_imports:
                name, is_internal = normalize_module_name(imp, fpath, repo_path, detected_lang)
                if is_internal:
                    resolved.append(name)
                    import_map[relative].append(name)

            if relative not in nodes:
                nodes[relative] = ModuleNode(
                    name=relative,
                    file=str(fpath),
                    imports=resolved,
                    imported_by=[],
                    fan_out=len(resolved),
                    is_internal=True,
                )
            else:
                nodes[relative].imports.extend(resolved)
                nodes[relative].fan_out = len(set(nodes[relative].imports))

    # Compute fan-in (reverse edges)
    for source, imports in import_map.items():
        for target in imports:
            if target in nodes:
                nodes[target].imported_by.append(source)

    # Update fan counts
    for node in nodes.values():
        node.fan_out = len(set(node.imports))
        node.fan_in = len(set(node.imported_by))

    return nodes


def find_cycles(nodes: Dict[str, ModuleNode]) -> List[List[str]]:
    """Simple DFS cycle detection."""
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {n: WHITE for n in nodes}
    cycles = []

    def dfs(node: str, path: List[str]):
        color[node] = GRAY
        path.append(node)
        for neighbor in nodes.get(node, ModuleNode("", "", [], [])).imports:
            if neighbor not in nodes:
                continue
            if color[neighbor] == GRAY:
                # Found a cycle
                cycle_start = path.index(neighbor)
                cycles.append(path[cycle_start:] + [neighbor])
            elif color[neighbor] == WHITE:
                dfs(neighbor, path[:])
        color[node] = BLACK

    for node in list(nodes.keys()):
        if color[node] == WHITE:
            dfs(node, [])

    # Deduplicate cycles
    unique = []
    seen = set()
    for c in cycles:
        key = frozenset(c)
        if key not in seen:
            seen.add(key)
            unique.append(c)
    return unique[:10]  # limit output


def run(repo_path_str: str, lang: str = "auto", output_format: str = "text"):
    repo_path = Path(repo_path_str).resolve()
    if not repo_path.exists():
        print(f"ERROR: {repo_path} does not exist", file=sys.stderr)
        sys.exit(1)

    nodes = build_graph(repo_path, lang)
    cycles = find_cycles(nodes)

    if not nodes:
        print("No source files found or no internal imports detected.")
        return

    # Sort by fan-in (most depended-upon first)
    sorted_by_fan_in = sorted(nodes.values(), key=lambda n: -n.fan_in)
    sorted_by_fan_out = sorted(nodes.values(), key=lambda n: -n.fan_out)

    # Risk modules: high fan-in (central) and/or high fan-out (complex)
    high_fan_in = [n for n in sorted_by_fan_in if n.fan_in > 3][:10]
    high_fan_out = [n for n in sorted_by_fan_out if n.fan_out > 8][:10]

    if output_format == "json":
        print(json.dumps({
            "total_modules": len(nodes),
            "cycles": cycles,
            "high_fan_in": [{"module": n.name, "fan_in": n.fan_in} for n in high_fan_in],
            "high_fan_out": [{"module": n.name, "fan_out": n.fan_out} for n in high_fan_out],
            "graph": {k: {"imports": v.imports, "imported_by": v.imported_by[:10]} for k, v in list(nodes.items())[:50]},
        }, indent=2))
        return

    if output_format == "dot":
        print("digraph G {")
        for name, node in list(nodes.items())[:100]:
            for imp in node.imports[:20]:
                if imp in nodes:
                    print(f'  "{name}" -> "{imp}";')
        print("}")
        return

    print(f"\n{'='*60}")
    print(f"  COUPLING ANALYSIS: {repo_path.name}")
    print(f"{'='*60}")
    print(f"\nModules analyzed: {len(nodes)}")

    if cycles:
        print(f"\n⚠  CIRCULAR DEPENDENCIES ({len(cycles)}):")
        for cycle in cycles[:5]:
            print(f"  → {' → '.join(cycle[:4])}{'...' if len(cycle) > 4 else ''}")
        print("  Circular deps cause tight coupling and initialization order bugs.")

    if high_fan_in:
        print(f"\nHigh Fan-In (most depended-upon modules — high-risk change targets):")
        for n in high_fan_in[:8]:
            print(f"  {n.fan_in:>3} modules depend on  {n.name}")

    if high_fan_out:
        print(f"\nHigh Fan-Out (depends on many modules — potential god modules):")
        for n in high_fan_out[:8]:
            print(f"  {n.name}  → depends on {n.fan_out} modules")

    # Isolated modules (nothing imports them, they import nothing)
    isolated = [n for n in nodes.values() if n.fan_in == 0 and n.fan_out == 0]
    if isolated:
        print(f"\nPossibly dead code ({len(isolated)} unreferenced modules):")
        for n in isolated[:5]:
            print(f"  {n.name}")

    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Coupling analysis")
    parser.add_argument("repo_path")
    parser.add_argument("--lang", default="auto")
    parser.add_argument("--output", choices=["text", "json", "dot"], default="text")
    args = parser.parse_args()
    run(args.repo_path, lang=args.lang, output_format=args.output)
