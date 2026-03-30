#!/usr/bin/env python3
"""
orientation.py — Phase 1: Project orientation and metadata extraction.

Usage: python3 orientation.py <repo_path> [--json]

Detects: language, framework, entry points, license, LOC, git metadata.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from collections import Counter, defaultdict
import re
import argparse


# ── Language detection ────────────────────────────────────────────────────────

LANGUAGE_EXTENSIONS = {
    ".py": "Python", ".pyi": "Python",
    ".js": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript",
    ".ts": "TypeScript", ".tsx": "TypeScript",
    ".jsx": "JavaScript",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java", ".kt": "Kotlin",
    ".rb": "Ruby",
    ".php": "PHP",
    ".c": "C", ".h": "C",
    ".cpp": "C++", ".cc": "C++", ".cxx": "C++", ".hpp": "C++",
    ".cs": "C#",
    ".swift": "Swift",
    ".scala": "Scala",
    ".ex": "Elixir", ".exs": "Elixir",
    ".hs": "Haskell",
    ".sh": "Shell", ".bash": "Shell", ".zsh": "Shell",
    ".sql": "SQL",
    ".html": "HTML", ".htm": "HTML",
    ".css": "CSS", ".scss": "CSS", ".sass": "CSS",
    ".vue": "Vue",
    ".svelte": "Svelte",
    ".r": "R", ".R": "R",
    ".lua": "Lua",
    ".dart": "Dart",
    ".elm": "Elm",
    ".clj": "Clojure", ".cljs": "Clojure",
    ".tf": "Terraform", ".tfvars": "Terraform",
    ".yaml": "YAML", ".yml": "YAML",
    ".json": "JSON",
    ".md": "Markdown",
    ".toml": "TOML",
}

SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".tox", "venv", ".venv",
    "env", ".env", "dist", "build", "target", ".gradle", ".idea",
    ".vscode", "coverage", ".nyc_output", "vendor", "third_party",
    ".cache", "tmp", "temp", "logs", ".pytest_cache", ".mypy_cache",
}

FRAMEWORK_SIGNALS = {
    # Python
    "django": "Django", "flask": "Flask", "fastapi": "FastAPI",
    "tornado": "Tornado", "aiohttp": "aiohttp", "starlette": "Starlette",
    "celery": "Celery", "sqlalchemy": "SQLAlchemy", "alembic": "Alembic",
    "pytest": "pytest", "pydantic": "Pydantic",
    # JS/TS
    "react": "React", "vue": "Vue", "angular": "@angular",
    "next": "Next.js", "nuxt": "Nuxt", "svelte": "Svelte",
    "express": "Express", "fastify": "Fastify", "nestjs": "NestJS",
    "webpack": "Webpack", "vite": "Vite", "jest": "Jest",
    "vitest": "Vitest", "prisma": "Prisma", "typeorm": "TypeORM",
    # Java
    "spring": "Spring", "quarkus": "Quarkus", "micronaut": "Micronaut",
    # Go
    "gin": "Gin", "echo": "Echo", "fiber": "Fiber",
    # Rust
    "actix": "Actix", "axum": "Axum", "rocket": "Rocket",
    # Ruby
    "rails": "Rails", "sinatra": "Sinatra",
    # PHP
    "laravel": "Laravel", "symfony": "Symfony",
    # Cloud / infra
    "aws-cdk": "AWS CDK", "pulumi": "Pulumi", "terraform": "Terraform",
    "kubernetes": "Kubernetes", "helm": "Helm",
    # Data
    "pandas": "Pandas", "numpy": "NumPy", "pytorch": "PyTorch",
    "tensorflow": "TensorFlow", "scikit": "scikit-learn",
}


def count_loc(repo_path: Path) -> dict:
    """Count non-empty, non-comment lines by language."""
    loc = defaultdict(int)
    file_counts = defaultdict(int)
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            ext = Path(f).suffix.lower()
            lang = LANGUAGE_EXTENSIONS.get(ext)
            if lang:
                try:
                    filepath = Path(root) / f
                    with open(filepath, encoding="utf-8", errors="ignore") as fh:
                        lines = [l.strip() for l in fh.readlines()]
                        non_empty = sum(1 for l in lines if l and not l.startswith(("#", "//", "/*", "*", "--", "'")))
                        loc[lang] += non_empty
                        file_counts[lang] += 1
                except Exception:
                    pass
    return {"loc": dict(loc), "files": dict(file_counts)}


def detect_frameworks(repo_path: Path) -> list:
    """Detect frameworks from package files and imports."""
    frameworks = set()

    def scan_file_for_signals(content: str):
        content_lower = content.lower()
        for signal, name in FRAMEWORK_SIGNALS.items():
            if signal in content_lower:
                frameworks.add(name)

    package_files = [
        "package.json", "requirements.txt", "pyproject.toml", "setup.py",
        "Cargo.toml", "go.mod", "Gemfile", "composer.json", "pom.xml",
        "build.gradle", "build.gradle.kts",
    ]
    for pf in package_files:
        p = repo_path / pf
        if p.exists():
            try:
                scan_file_for_signals(p.read_text(errors="ignore"))
            except Exception:
                pass

    return sorted(frameworks)


def find_entry_points(repo_path: Path) -> list:
    """Find likely entry points for the project."""
    candidates = [
        "main.py", "app.py", "server.py", "run.py", "__main__.py",
        "index.js", "index.ts", "server.js", "server.ts", "app.js",
        "main.go", "cmd/main.go",
        "src/main.rs", "src/lib.rs",
        "Main.java", "Application.java",
        "main.c", "main.cpp",
        "Program.cs",
        "app.rb", "config.ru",
        "index.php", "public/index.php",
        "Makefile", "justfile",
        "docker-compose.yml", "docker-compose.yaml",
        "Dockerfile",
    ]
    found = []
    for c in candidates:
        p = repo_path / c
        if p.exists():
            found.append(str(p.relative_to(repo_path)))
    return found


def get_license(repo_path: Path) -> str:
    """Detect license type."""
    for name in ["LICENSE", "LICENSE.md", "LICENSE.txt", "LICENCE", "COPYING"]:
        p = repo_path / name
        if p.exists():
            try:
                content = p.read_text(errors="ignore")[:500].upper()
                if "MIT" in content:
                    return "MIT"
                if "APACHE" in content:
                    return "Apache 2.0"
                if "GPL" in content:
                    if "LESSER" in content or "LGPL" in content:
                        return "LGPL"
                    return "GPL"
                if "BSD" in content:
                    return "BSD"
                if "MOZILLA" in content or "MPL" in content:
                    return "MPL"
                if "ISC" in content:
                    return "ISC"
                if "UNLICENSED" in content or "CC0" in content:
                    return "Unlicensed / Public Domain"
                return "Custom / Unknown"
            except Exception:
                pass
    return "No license file found"


def get_git_info(repo_path: Path) -> dict:
    """Get git metadata if available."""
    git_dir = repo_path / ".git"
    if not git_dir.exists():
        return {}
    try:
        def run(cmd):
            r = subprocess.run(cmd, cwd=repo_path, capture_output=True, text=True, timeout=5)
            return r.stdout.strip() if r.returncode == 0 else ""

        last_commit = run(["git", "log", "-1", "--format=%ci %s"])
        total_commits = run(["git", "rev-list", "--count", "HEAD"])
        contributors_raw = run(["git", "shortlog", "-sn", "--no-merges", "HEAD"])
        contributors = []
        for line in contributors_raw.splitlines()[:5]:
            parts = line.strip().split("\t", 1)
            if len(parts) == 2:
                contributors.append({"commits": int(parts[0].strip()), "name": parts[1].strip()})
        branch = run(["git", "rev-parse", "--abbrev-ref", "HEAD"])

        return {
            "last_commit": last_commit,
            "total_commits": total_commits,
            "top_contributors": contributors,
            "current_branch": branch,
        }
    except Exception:
        return {}


def get_readme_summary(repo_path: Path, lines: int = 30) -> str:
    """Return the first N lines of the README."""
    for name in ["README.md", "README.rst", "README.txt", "README", "readme.md"]:
        p = repo_path / name
        if p.exists():
            try:
                content = p.read_text(errors="ignore").splitlines()
                return "\n".join(content[:lines])
            except Exception:
                pass
    return "(No README found)"


def infer_deployment_model(repo_path: Path) -> str:
    """Infer deployment model from files present."""
    signals = {
        (repo_path / "Dockerfile").exists(): "Containerized",
        (repo_path / "docker-compose.yml").exists() or (repo_path / "docker-compose.yaml").exists(): "Docker Compose",
        (repo_path / "serverless.yml").exists() or (repo_path / "serverless.yaml").exists(): "Serverless (Serverless Framework)",
        (repo_path / "template.yaml").exists() or (repo_path / "template.yml").exists(): "Serverless (AWS SAM)",
        (repo_path / "fly.toml").exists(): "Fly.io",
        (repo_path / "vercel.json").exists() or (repo_path / ".vercel").exists(): "Vercel",
        (repo_path / "netlify.toml").exists(): "Netlify",
        (repo_path / "render.yaml").exists(): "Render",
        any((repo_path / k).exists() for k in ["k8s", "kubernetes", "helm", "charts"]): "Kubernetes",
        (repo_path / ".github" / "workflows").exists(): "GitHub Actions CI/CD",
    }
    found = [v for k, v in signals.items() if k]
    return ", ".join(found) if found else "Unknown / bare"


def infer_maturity(repo_path: Path, git_info: dict, loc_data: dict) -> str:
    """Rough maturity heuristic."""
    total_loc = sum(loc_data.get("loc", {}).values())
    total_commits = int(git_info.get("total_commits", 0))
    has_tests = any(
        (repo_path / d).exists()
        for d in ["tests", "test", "__tests__", "spec", "specs"]
    )
    has_ci = (repo_path / ".github" / "workflows").exists() or (repo_path / ".gitlab-ci.yml").exists()

    if total_loc > 50000 and total_commits > 500 and has_tests and has_ci:
        return "mature / active"
    if total_loc > 10000 and total_commits > 100:
        return "active development"
    if total_loc < 2000 or total_commits < 20:
        return "prototype / early stage"
    return "in development"


def run(repo_path_str: str, as_json: bool = False):
    repo_path = Path(repo_path_str).resolve()
    if not repo_path.exists():
        print(f"ERROR: Path does not exist: {repo_path}", file=sys.stderr)
        sys.exit(1)

    print("Scanning...", file=sys.stderr)

    loc_data = count_loc(repo_path)
    frameworks = detect_frameworks(repo_path)
    entry_points = find_entry_points(repo_path)
    license_type = get_license(repo_path)
    git_info = get_git_info(repo_path)
    readme = get_readme_summary(repo_path)
    deployment = infer_deployment_model(repo_path)
    maturity = infer_maturity(repo_path, git_info, loc_data)

    # Dominant languages
    sorted_langs = sorted(loc_data["loc"].items(), key=lambda x: -x[1])
    primary_language = sorted_langs[0][0] if sorted_langs else "Unknown"

    result = {
        "project_name": repo_path.name,
        "path": str(repo_path),
        "primary_language": primary_language,
        "languages": sorted_langs,
        "file_counts": loc_data["files"],
        "frameworks": frameworks,
        "entry_points": entry_points,
        "license": license_type,
        "deployment_model": deployment,
        "maturity": maturity,
        "git": git_info,
        "readme_preview": readme,
    }

    if as_json:
        print(json.dumps(result, indent=2))
        return

    # Human-readable output
    print(f"\n{'='*60}")
    print(f"  PROJECT ORIENTATION: {result['project_name']}")
    print(f"{'='*60}")
    print(f"\nPath:              {result['path']}")
    print(f"Primary Language:  {result['primary_language']}")
    print(f"License:           {result['license']}")
    print(f"Deployment:        {result['deployment_model']}")
    print(f"Maturity:          {result['maturity']}")

    print(f"\nLanguages (non-empty lines of code):")
    for lang, loc in sorted_langs[:8]:
        files = loc_data["files"].get(lang, 0)
        print(f"  {lang:<20} {loc:>8,} LOC  ({files} files)")

    if frameworks:
        print(f"\nFrameworks/Libraries detected:")
        for fw in frameworks:
            print(f"  - {fw}")

    if entry_points:
        print(f"\nEntry Points:")
        for ep in entry_points:
            print(f"  - {ep}")

    if git_info:
        print(f"\nGit Info:")
        print(f"  Branch:         {git_info.get('current_branch', 'N/A')}")
        print(f"  Last commit:    {git_info.get('last_commit', 'N/A')}")
        print(f"  Total commits:  {git_info.get('total_commits', 'N/A')}")
        if git_info.get("top_contributors"):
            print(f"  Top contributors:")
            for c in git_info["top_contributors"]:
                print(f"    {c['commits']:>5} commits  {c['name']}")

    print(f"\nREADME Preview:")
    print("-" * 40)
    print(readme[:600])
    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Repo orientation scanner")
    parser.add_argument("repo_path", help="Path to the repository")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()
    run(args.repo_path, as_json=args.json)
