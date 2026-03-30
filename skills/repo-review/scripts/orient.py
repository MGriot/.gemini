#!/usr/bin/env python3
"""
orient.py — Phase 0: Project Orientation
Produces a Project Snapshot JSON for the repo-review skill.
Usage: python3 orient.py <PROJECT_ROOT>
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from collections import defaultdict
from datetime import datetime


def count_lines(filepath):
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return sum(1 for _ in f)
    except Exception:
        return 0


def build_tree(root, max_depth=3, current_depth=0, prefix=""):
    if current_depth > max_depth:
        return []
    lines = []
    try:
        entries = sorted(os.scandir(root), key=lambda e: (not e.is_dir(), e.name))
    except PermissionError:
        return []
    skip_dirs = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build",
                 ".next", ".nuxt", "coverage", ".pytest_cache", ".mypy_cache", "target", "vendor"}
    for i, entry in enumerate(entries):
        connector = "└── " if i == len(entries) - 1 else "├── "
        if entry.is_dir():
            if entry.name in skip_dirs:
                lines.append(f"{prefix}{connector}{entry.name}/ (skipped)")
                continue
            lines.append(f"{prefix}{connector}{entry.name}/")
            ext_prefix = prefix + ("    " if i == len(entries) - 1 else "│   ")
            lines.extend(build_tree(entry.path, max_depth, current_depth + 1, ext_prefix))
        else:
            lines.append(f"{prefix}{connector}{entry.name}")
    return lines


def scan_files(root):
    ext_counts = defaultdict(int)
    ext_lines = defaultdict(int)
    total_files = 0
    skip_dirs = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build",
                 ".next", ".nuxt", "coverage", "target", "vendor"}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        for fname in filenames:
            total_files += 1
            ext = Path(fname).suffix.lower() or "(no ext)"
            ext_counts[ext] += 1
            fpath = os.path.join(dirpath, fname)
            n = count_lines(fpath)
            ext_lines[ext] += n
    return total_files, dict(ext_counts), dict(ext_lines)


def detect_manifests(root):
    manifest_files = [
        "package.json", "pyproject.toml", "requirements.txt", "setup.py", "setup.cfg",
        "Cargo.toml", "go.mod", "pom.xml", "build.gradle", "build.gradle.kts",
        "Gemfile", "composer.json", "*.csproj", "Package.swift",
        "mix.exs", "rebar.config", "pubspec.yaml"
    ]
    found = []
    for fname in manifest_files:
        if "*" in fname:
            import glob
            matches = glob.glob(os.path.join(root, "**", fname), recursive=True)
            found.extend([os.path.relpath(m, root) for m in matches[:3]])
        else:
            p = os.path.join(root, fname)
            if os.path.exists(p):
                found.append(fname)
    return found


def get_git_info(root):
    info = {}
    try:
        result = subprocess.run(
            ["git", "-C", root, "log", "-1", "--pretty=format:%H|%an|%ae|%ar|%s"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0 and result.stdout:
            parts = result.stdout.split("|", 4)
            info["last_commit"] = {
                "hash": parts[0][:12],
                "author": parts[1],
                "email": parts[2],
                "relative_time": parts[3],
                "message": parts[4] if len(parts) > 4 else ""
            }
        branch = subprocess.run(
            ["git", "-C", root, "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=5
        )
        if branch.returncode == 0:
            info["branch"] = branch.stdout.strip()
        contributors = subprocess.run(
            ["git", "-C", root, "shortlog", "-sn", "--no-merges", "HEAD"],
            capture_output=True, text=True, timeout=5
        )
        if contributors.returncode == 0:
            lines = contributors.stdout.strip().splitlines()
            info["top_contributors"] = [l.strip() for l in lines[:5]]
        remote = subprocess.run(
            ["git", "-C", root, "remote", "get-url", "origin"],
            capture_output=True, text=True, timeout=5
        )
        if remote.returncode == 0:
            info["remote_origin"] = remote.stdout.strip()
    except Exception as e:
        info["error"] = str(e)
    return info


def find_readme(root):
    for name in ["README.md", "README.rst", "README.txt", "README", "readme.md"]:
        p = os.path.join(root, name)
        if os.path.exists(p):
            return name
    return None


def detect_ci_cd(root):
    indicators = []
    checks = [
        ".github/workflows",
        ".gitlab-ci.yml",
        "Jenkinsfile",
        ".circleci/config.yml",
        ".travis.yml",
        "azure-pipelines.yml",
        "Makefile",
        "Dockerfile",
        "docker-compose.yml",
        "docker-compose.yaml",
        ".drone.yml",
        "bitbucket-pipelines.yml"
    ]
    for c in checks:
        if os.path.exists(os.path.join(root, c)):
            indicators.append(c)
    return indicators


def main():
    if len(sys.argv) < 2:
        print("Usage: orient.py <PROJECT_ROOT>", file=sys.stderr)
        sys.exit(1)

    root = os.path.abspath(sys.argv[1])
    if not os.path.isdir(root):
        print(f"Error: {root} is not a directory", file=sys.stderr)
        sys.exit(1)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"  REPO REVIEW — Phase 0: Orientation", file=sys.stderr)
    print(f"  Target: {root}", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    print("  Scanning files...", file=sys.stderr)
    total_files, ext_counts, ext_lines = scan_files(root)

    print("  Building directory tree...", file=sys.stderr)
    tree_lines = build_tree(root, max_depth=3)

    print("  Detecting manifests...", file=sys.stderr)
    manifests = detect_manifests(root)

    print("  Reading git history...", file=sys.stderr)
    git_info = get_git_info(root)

    readme = find_readme(root)
    ci_cd = detect_ci_cd(root)

    # Sort extensions by line count
    top_exts = sorted(ext_lines.items(), key=lambda x: x[1], reverse=True)[:10]

    snapshot = {
        "project_root": root,
        "project_name": os.path.basename(root),
        "scanned_at": datetime.now().isoformat(),
        "summary": {
            "total_files": total_files,
            "total_lines_estimated": sum(ext_lines.values()),
            "readme_present": readme,
            "manifest_files": manifests,
            "ci_cd_indicators": ci_cd
        },
        "languages_by_lines": [{"ext": e, "lines": l, "files": ext_counts.get(e, 0)} for e, l in top_exts],
        "git": git_info,
        "directory_tree": "\n".join(tree_lines[:120])  # cap at 120 lines
    }

    # Recommend depth
    if total_files < 500:
        snapshot["recommended_depth"] = "quick"
        snapshot["depth_reason"] = f"Small project ({total_files} files)"
    elif total_files < 5000:
        snapshot["recommended_depth"] = "standard"
        snapshot["depth_reason"] = f"Medium project ({total_files} files)"
    else:
        snapshot["recommended_depth"] = "deep"
        snapshot["depth_reason"] = f"Large project ({total_files} files)"

    print(json.dumps(snapshot, indent=2))
    print(f"\n  ✓ Orientation complete. Recommended depth: {snapshot['recommended_depth']}", file=sys.stderr)


if __name__ == "__main__":
    main()
