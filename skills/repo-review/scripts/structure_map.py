#!/usr/bin/env python3
"""
structure_map.py — Phase 2: Directory structure mapping with annotations.

Usage: python3 structure_map.py <repo_path> [--depth 3] [--output tree|json|md] [--ignore dirs]
"""

import os
import sys
import json
import argparse
from pathlib import Path
from collections import defaultdict


SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".tox", "venv", ".venv",
    "env", ".env", "dist", "build", "target", ".gradle", ".idea",
    ".vscode", "coverage", ".nyc_output", "vendor", "third_party",
    ".cache", "tmp", "temp", "logs", ".pytest_cache", ".mypy_cache",
    ".eggs", "*.egg-info", ".DS_Store",
}

# Annotations for well-known directories
DIR_ANNOTATIONS = {
    "src": "source root",
    "lib": "library/shared code",
    "app": "application code",
    "api": "API layer",
    "controllers": "request handlers",
    "handlers": "request handlers",
    "routes": "routing definitions",
    "middleware": "middleware layer",
    "services": "business logic layer",
    "models": "data models / entities",
    "schemas": "validation schemas",
    "repositories": "data access layer",
    "database": "database layer",
    "db": "database layer",
    "migrations": "database migrations",
    "queries": "SQL/ORM queries",
    "utils": "utility functions",
    "helpers": "helper functions",
    "common": "shared code",
    "shared": "shared code",
    "core": "core domain logic",
    "domain": "domain logic (DDD)",
    "infrastructure": "infrastructure/adapters",
    "adapters": "external system adapters",
    "config": "configuration",
    "settings": "application settings",
    "env": "environment config",
    "tests": "test suite",
    "test": "test suite",
    "__tests__": "Jest tests",
    "spec": "test specifications",
    "specs": "test specifications",
    "fixtures": "test fixtures/data",
    "mocks": "test mocks",
    "e2e": "end-to-end tests",
    "integration": "integration tests",
    "unit": "unit tests",
    "docs": "documentation",
    "doc": "documentation",
    "wiki": "wiki / docs",
    "scripts": "build/utility scripts",
    "tools": "developer tools",
    "bin": "executables/binaries",
    "cmd": "CLI commands (Go convention)",
    "internal": "internal packages (Go convention)",
    "pkg": "reusable packages (Go convention)",
    "public": "public/static assets",
    "static": "static assets",
    "assets": "assets (images, fonts, etc.)",
    "images": "image assets",
    "styles": "stylesheets",
    "css": "stylesheets",
    "components": "UI components",
    "pages": "page components (Next.js, etc.)",
    "views": "view templates",
    "templates": "HTML/email templates",
    "hooks": "React hooks / git hooks",
    "store": "state management",
    "redux": "Redux store",
    "context": "React context",
    "types": "TypeScript type definitions",
    "interfaces": "interface definitions",
    "proto": "Protobuf definitions",
    "grpc": "gRPC definitions",
    "openapi": "OpenAPI/Swagger specs",
    "swagger": "Swagger specs",
    "jobs": "background jobs",
    "workers": "worker processes",
    "tasks": "task queue jobs",
    "cron": "scheduled tasks",
    "events": "event definitions/handlers",
    "listeners": "event listeners",
    "queues": "message queue handlers",
    "plugins": "plugin system",
    "extensions": "extension points",
    "vendor": "vendored 3rd-party code",
    "third_party": "third-party dependencies",
    "generated": "auto-generated code (do not edit)",
    "gen": "auto-generated code",
    ".github": "GitHub config (Actions, PR templates)",
    ".gitlab": "GitLab CI config",
    "k8s": "Kubernetes manifests",
    "kubernetes": "Kubernetes manifests",
    "helm": "Helm charts",
    "terraform": "Terraform IaC",
    "ansible": "Ansible playbooks",
    "charts": "Helm charts",
    "deploy": "deployment configs",
    "infra": "infrastructure code",
    "devops": "DevOps configurations",
    "monitoring": "monitoring/observability",
    "metrics": "metrics configuration",
    "logs": "log files (should be gitignored)",
}

FILE_ANNOTATIONS = {
    "Dockerfile": "container definition",
    "docker-compose.yml": "multi-container orchestration",
    "docker-compose.yaml": "multi-container orchestration",
    ".env": "environment variables (never commit secrets!)",
    ".env.example": "env variable template",
    ".env.template": "env variable template",
    "Makefile": "build automation",
    "justfile": "task runner (Just)",
    "package.json": "Node.js project manifest",
    "package-lock.json": "npm lockfile",
    "yarn.lock": "Yarn lockfile",
    "pnpm-lock.yaml": "pnpm lockfile",
    "pyproject.toml": "Python project config (PEP 517/518)",
    "setup.py": "Python package setup",
    "requirements.txt": "Python dependencies",
    "requirements-dev.txt": "Python dev dependencies",
    "Pipfile": "Pipenv dependencies",
    "Cargo.toml": "Rust project manifest",
    "Cargo.lock": "Rust lockfile",
    "go.mod": "Go module definition",
    "go.sum": "Go dependency checksums",
    "pom.xml": "Maven project (Java)",
    "build.gradle": "Gradle build (Java/Kotlin)",
    "Gemfile": "Ruby dependencies",
    "Gemfile.lock": "Ruby lockfile",
    "composer.json": "PHP dependencies",
    "tsconfig.json": "TypeScript configuration",
    ".eslintrc.js": "ESLint rules",
    ".eslintrc.json": "ESLint rules",
    ".prettierrc": "Prettier formatting rules",
    ".babelrc": "Babel transpiler config",
    "jest.config.js": "Jest test config",
    "vite.config.ts": "Vite build config",
    "webpack.config.js": "Webpack bundler config",
    ".gitignore": "git ignore rules",
    ".gitattributes": "git attributes",
    "CODEOWNERS": "code ownership",
    "CHANGELOG.md": "version history",
    "CONTRIBUTING.md": "contribution guide",
    "LICENSE": "license terms",
    ".pre-commit-config.yaml": "pre-commit hooks",
    "sonar-project.properties": "SonarQube config",
    "codecov.yml": "Codecov config",
    ".travis.yml": "Travis CI config",
    "Procfile": "Heroku process config",
    "fly.toml": "Fly.io config",
    "vercel.json": "Vercel config",
    "netlify.toml": "Netlify config",
}


def build_tree(path: Path, depth: int, max_depth: int, ignore_dirs: set, prefix: str = "", is_last: bool = True) -> list:
    lines = []
    connector = "└── " if is_last else "├── "
    ext = "    " if is_last else "│   "

    name = path.name
    annotation = ""

    if path.is_dir():
        annotation = DIR_ANNOTATIONS.get(name.lower(), DIR_ANNOTATIONS.get(name, ""))
        annotation_str = f"  # {annotation}" if annotation else ""
        lines.append(f"{prefix}{connector}{name}/{annotation_str}")
        if depth < max_depth:
            try:
                children = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
                children = [c for c in children if c.name not in ignore_dirs and not c.name.startswith(".git")]
                for i, child in enumerate(children):
                    is_last_child = (i == len(children) - 1)
                    lines.extend(build_tree(child, depth + 1, max_depth, ignore_dirs, prefix + ext, is_last_child))
            except PermissionError:
                lines.append(f"{prefix}{ext}└── (permission denied)")
    else:
        annotation = FILE_ANNOTATIONS.get(name, "")
        annotation_str = f"  # {annotation}" if annotation else ""
        size = ""
        try:
            sz = path.stat().st_size
            if sz > 1024 * 1024:
                size = f" ({sz // (1024*1024)}MB)"
            elif sz > 1024:
                size = f" ({sz // 1024}KB)"
        except Exception:
            pass
        lines.append(f"{prefix}{connector}{name}{size}{annotation_str}")

    return lines


def analyze_patterns(repo_path: Path, ignore_dirs: set) -> dict:
    """Detect high-level structural patterns."""
    findings = []

    # Monorepo detection
    for d in ["packages", "apps", "services", "modules", "projects"]:
        p = repo_path / d
        if p.is_dir():
            subdirs = [x for x in p.iterdir() if x.is_dir()]
            if len(subdirs) > 1:
                findings.append(f"MONOREPO: Found '{d}/' with {len(subdirs)} sub-packages: {', '.join(x.name for x in subdirs[:5])}")

    # Architecture layers
    has_controllers = any((repo_path / d).is_dir() for d in ["controllers", "handlers"])
    has_services = any((repo_path / d).is_dir() for d in ["services", "service"])
    has_repositories = any((repo_path / d).is_dir() for d in ["repositories", "repository", "repo", "db"])
    has_models = any((repo_path / d).is_dir() for d in ["models", "entities", "domain"])

    if has_controllers and has_services and (has_repositories or has_models):
        findings.append("LAYERED ARCHITECTURE: controllers → services → data layer detected")
    elif has_models and not has_controllers:
        findings.append("DOMAIN MODEL: Strong model layer, likely DDD or data-centric design")

    # Test structure
    test_dirs = [d for d in ["tests", "test", "__tests__", "spec", "specs"] if (repo_path / d).is_dir()]
    if test_dirs:
        findings.append(f"TESTS: Separate test directory: {', '.join(test_dirs)}")
    else:
        # Check for colocation
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for f in files:
                if ".test." in f or ".spec." in f or f.startswith("test_"):
                    findings.append("TESTS: Colocated tests (test files next to source)")
                    break
            else:
                continue
            break

    # Config centralization
    config_dir = repo_path / "config"
    if config_dir.is_dir():
        findings.append("CONFIG: Centralized in config/")
    else:
        config_files = list(repo_path.glob("*.config.*")) + list(repo_path.glob(".env*"))
        if len(config_files) > 3:
            findings.append(f"CONFIG SPRAWL: {len(config_files)} config files scattered at root")

    # CI/CD
    if (repo_path / ".github" / "workflows").is_dir():
        workflows = list((repo_path / ".github" / "workflows").glob("*.yml")) + list((repo_path / ".github" / "workflows").glob("*.yaml"))
        findings.append(f"CI/CD: GitHub Actions ({len(workflows)} workflow(s))")
    if (repo_path / ".gitlab-ci.yml").exists():
        findings.append("CI/CD: GitLab CI")

    # IaC
    for d in ["terraform", "k8s", "kubernetes", "helm", "charts", "ansible"]:
        if (repo_path / d).is_dir():
            findings.append(f"INFRA AS CODE: {d}/ directory")

    # Documentation
    doc_dirs = [d for d in ["docs", "doc", "documentation", "wiki"] if (repo_path / d).is_dir()]
    if doc_dirs:
        findings.append(f"DOCUMENTATION: {', '.join(doc_dirs)}/")

    return findings


def run(repo_path_str: str, max_depth: int = 3, output_format: str = "tree", ignore_extra: list = None):
    repo_path = Path(repo_path_str).resolve()
    if not repo_path.exists():
        print(f"ERROR: Path does not exist: {repo_path}", file=sys.stderr)
        sys.exit(1)

    ignore_dirs = SKIP_DIRS.copy()
    if ignore_extra:
        ignore_dirs.update(ignore_extra)

    patterns = analyze_patterns(repo_path, ignore_dirs)

    if output_format == "json":
        # Build simple JSON tree
        def to_dict(p, depth, max_d):
            if p.name in ignore_dirs:
                return None
            node = {"name": p.name, "type": "dir" if p.is_dir() else "file"}
            if annotation := (DIR_ANNOTATIONS.get(p.name.lower(), "") if p.is_dir() else FILE_ANNOTATIONS.get(p.name, "")):
                node["annotation"] = annotation
            if p.is_dir() and depth < max_d:
                try:
                    children = [to_dict(c, depth + 1, max_d) for c in sorted(p.iterdir(), key=lambda x: (x.is_file(), x.name))]
                    node["children"] = [c for c in children if c]
                except PermissionError:
                    node["children"] = []
            return node

        result = {"tree": to_dict(repo_path, 0, max_depth), "patterns": patterns}
        print(json.dumps(result, indent=2))
        return

    # Tree output
    print(f"\nREPOSITORY STRUCTURE: {repo_path.name}/")
    print("=" * 60)

    lines = [f"{repo_path.name}/"]
    try:
        children = sorted(repo_path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        children = [c for c in children if c.name not in ignore_dirs]
        for i, child in enumerate(children):
            is_last = (i == len(children) - 1)
            lines.extend(build_tree(child, 1, max_depth, ignore_dirs, "", is_last))
    except PermissionError:
        lines.append("  (permission denied)")

    print("\n".join(lines))

    if patterns:
        print("\n" + "=" * 60)
        print("STRUCTURAL PATTERNS DETECTED:")
        for p in patterns:
            print(f"  ● {p}")
    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Repository structure mapper")
    parser.add_argument("repo_path", help="Path to the repository")
    parser.add_argument("--depth", type=int, default=3, help="Max directory depth (default: 3)")
    parser.add_argument("--output", choices=["tree", "json", "md"], default="tree")
    parser.add_argument("--ignore", default="", help="Comma-separated extra dirs to ignore")
    args = parser.parse_args()

    extra = [d.strip() for d in args.ignore.split(",") if d.strip()]
    run(args.repo_path, max_depth=args.depth, output_format=args.output, ignore_extra=extra)
