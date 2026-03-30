#!/usr/bin/env python3
"""
structure_analyzer.py — Phase 1: Structure Analysis
Annotates the directory tree with purpose labels and identifies entry points.
Usage: python3 structure_analyzer.py <PROJECT_ROOT>
"""

import os
import sys
import json
from pathlib import Path
from collections import defaultdict

# Known entry point filenames
ENTRY_POINTS = {
    "main.py", "app.py", "server.py", "wsgi.py", "asgi.py", "run.py", "manage.py",
    "main.go", "main.rs", "main.js", "main.ts", "index.js", "index.ts",
    "app.js", "app.ts", "server.js", "server.ts",
    "Main.java", "Application.java",
    "main.c", "main.cpp",
    "Program.cs",
    "__main__.py"
}

# Known config files
CONFIG_FILES = {
    ".env", ".env.example", ".env.sample", ".env.local",
    "config.yaml", "config.yml", "config.json", "config.toml",
    "settings.py", "settings.yaml", "settings.yml",
    ".eslintrc", ".eslintrc.js", ".eslintrc.json",
    ".prettierrc", ".prettierrc.json",
    "tsconfig.json", "jsconfig.json",
    "webpack.config.js", "vite.config.js", "vite.config.ts",
    "next.config.js", "next.config.ts",
    ".babelrc", "babel.config.js",
    "jest.config.js", "jest.config.ts",
    "pytest.ini", "setup.cfg", "pyproject.toml",
    "ruff.toml", ".ruff.toml",
    ".rubocop.yml",
    "tailwind.config.js", "tailwind.config.ts",
    "rollup.config.js",
    "Makefile", "makefile"
}

# Directory purpose heuristics
DIR_LABELS = {
    "src": "Source code root",
    "lib": "Library / shared utilities",
    "app": "Application layer",
    "core": "Core domain logic",
    "api": "API layer (routes/controllers)",
    "routes": "Route definitions",
    "controllers": "Request handlers",
    "handlers": "Request/event handlers",
    "services": "Business logic / service layer",
    "models": "Data models / ORM entities",
    "schemas": "Data schemas / validation",
    "migrations": "Database migrations",
    "db": "Database utilities / queries",
    "database": "Database layer",
    "repositories": "Data access layer",
    "middleware": "Middleware / interceptors",
    "utils": "Utility / helper functions",
    "helpers": "Helper functions",
    "common": "Shared / common code",
    "shared": "Shared modules",
    "config": "Configuration",
    "settings": "Application settings",
    "static": "Static assets (CSS, JS, images)",
    "public": "Public / served assets",
    "assets": "Project assets",
    "templates": "HTML/view templates",
    "views": "Views / UI components",
    "components": "UI components",
    "pages": "Page-level components",
    "hooks": "React hooks / custom hooks",
    "store": "State management",
    "redux": "Redux state",
    "context": "React context",
    "styles": "Stylesheets",
    "css": "CSS files",
    "test": "Tests",
    "tests": "Tests",
    "__tests__": "Tests (Jest convention)",
    "spec": "Test specs",
    "specs": "Test specs",
    "e2e": "End-to-end tests",
    "integration": "Integration tests",
    "unit": "Unit tests",
    "fixtures": "Test fixtures / factories",
    "mocks": "Mock objects",
    "scripts": "Build / automation scripts",
    "bin": "Executable scripts / binaries",
    "cli": "Command-line interface",
    "cmd": "Command definitions (Go convention)",
    "pkg": "Public packages (Go convention)",
    "internal": "Internal packages (Go convention)",
    "docs": "Documentation",
    "doc": "Documentation",
    "documentation": "Documentation",
    "examples": "Usage examples",
    "demo": "Demo code",
    "dist": "Distribution / compiled output",
    "build": "Build output",
    "out": "Build output",
    ".github": "GitHub config (actions, templates)",
    ".circleci": "CircleCI config",
    "infra": "Infrastructure code (IaC)",
    "terraform": "Terraform configs",
    "k8s": "Kubernetes manifests",
    "deploy": "Deployment configs",
    "docker": "Docker configs",
    "protos": "Protocol Buffer definitions",
    "proto": "Protocol Buffer definitions",
    "graphql": "GraphQL schemas / resolvers",
    "i18n": "Internationalization / translations",
    "locales": "Locale files",
    "types": "TypeScript type definitions",
    "interfaces": "Interface definitions",
    "events": "Event definitions / handlers",
    "jobs": "Background jobs / workers",
    "workers": "Worker processes",
    "tasks": "Scheduled tasks",
    "plugins": "Plugins",
    "extensions": "Extensions",
}


def label_directory(dirname):
    lower = dirname.lower()
    return DIR_LABELS.get(lower, DIR_LABELS.get(dirname, None))


def find_entry_points(root):
    found = []
    skip_dirs = {"node_modules", ".git", "__pycache__", ".venv", "venv", "dist", "build", "target", "vendor"}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        for fname in filenames:
            if fname in ENTRY_POINTS:
                rel = os.path.relpath(os.path.join(dirpath, fname), root)
                found.append(rel)
    return sorted(found)


def find_config_files(root):
    found = []
    skip_dirs = {"node_modules", ".git", "__pycache__", ".venv", "venv"}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        # Only look at top 2 levels for config files
        rel_dir = os.path.relpath(dirpath, root)
        depth = len(Path(rel_dir).parts)
        if depth > 2:
            dirnames.clear()
            continue
        for fname in filenames:
            if fname in CONFIG_FILES or fname.startswith(".env"):
                rel = os.path.relpath(os.path.join(dirpath, fname), root)
                found.append(rel)
    return sorted(found)


def find_test_dirs(root):
    test_indicators = {"test", "tests", "__tests__", "spec", "specs", "e2e", "integration"}
    found = []
    skip_dirs = {"node_modules", ".git", "__pycache__", ".venv", "venv", "dist", "build"}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        for d in dirnames:
            if d.lower() in test_indicators:
                found.append(os.path.relpath(os.path.join(dirpath, d), root))
    return sorted(found)


def annotate_tree(root, max_depth=3):
    lines = []

    def recurse(path, prefix="", depth=0):
        if depth > max_depth:
            return
        try:
            entries = sorted(os.scandir(path), key=lambda e: (not e.is_dir(), e.name))
        except PermissionError:
            return
        skip_dirs = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build",
                     ".next", ".nuxt", "coverage", ".pytest_cache", ".mypy_cache", "target", "vendor"}
        for i, entry in enumerate(entries):
            is_last = i == len(entries) - 1
            connector = "└── " if is_last else "├── "
            ext_prefix = prefix + ("    " if is_last else "│   ")

            if entry.is_dir():
                if entry.name in skip_dirs:
                    continue
                label = label_directory(entry.name)
                annotation = f"  # {label}" if label else ""
                lines.append(f"{prefix}{connector}{entry.name}/{annotation}")
                recurse(entry.path, ext_prefix, depth + 1)
            else:
                annotation = ""
                if entry.name in ENTRY_POINTS:
                    annotation = "  ← ENTRY POINT"
                elif entry.name in CONFIG_FILES or entry.name.startswith(".env"):
                    annotation = "  ← config"
                lines.append(f"{prefix}{connector}{entry.name}{annotation}")

    recurse(root)
    return lines


def main():
    if len(sys.argv) < 2:
        print("Usage: structure_analyzer.py <PROJECT_ROOT>", file=sys.stderr)
        sys.exit(1)

    root = os.path.abspath(sys.argv[1])
    if not os.path.isdir(root):
        print(f"Error: {root} is not a directory", file=sys.stderr)
        sys.exit(1)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"  REPO REVIEW — Phase 1: Structure Analysis", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    print("  Building annotated tree...", file=sys.stderr)
    tree = annotate_tree(root)

    print("  Finding entry points...", file=sys.stderr)
    entry_points = find_entry_points(root)

    print("  Finding config files...", file=sys.stderr)
    config_files = find_config_files(root)

    print("  Finding test directories...", file=sys.stderr)
    test_dirs = find_test_dirs(root)

    result = {
        "annotated_tree": "\n".join(tree[:200]),
        "entry_points": entry_points,
        "config_files": config_files,
        "test_directories": test_dirs,
        "notes": []
    }

    if not entry_points:
        result["notes"].append("No standard entry points detected — may be a library, look for __init__.py or index files")
    if not test_dirs:
        result["notes"].append("No dedicated test directories found — tests may be co-located or absent")
    if not config_files:
        result["notes"].append("No config files detected at top level")

    print(json.dumps(result, indent=2))
    print(f"\n  ✓ Structure analysis complete.", file=sys.stderr)


if __name__ == "__main__":
    main()
