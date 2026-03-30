#!/usr/bin/env python3
"""
generate_report.py — Produces a structured Markdown repo review report.

Usage:
    python3 generate_report.py --repo <REPO_PATH> --output <FILE.md>
    python3 generate_report.py --repo <REPO_PATH>   # prints to stdout

This script gathers key metrics and scaffolds the report. Claude fills in the
qualitative analysis sections by reading the code and scan outputs.
"""

import argparse
import os
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", "vendor", "dist", "build",
    ".venv", "venv", "env", ".tox", "coverage", ".next", ".nuxt",
    "target", "bin", "obj",
}

SOURCE_EXTS = {
    ".py", ".js", ".ts", ".go", ".rs", ".java", ".rb",
    ".cs", ".php", ".swift", ".kt", ".cpp", ".c",
}


def run(cmd: str, cwd=None) -> str:
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True,
            timeout=15, cwd=cwd
        )
        return result.stdout.strip()
    except Exception:
        return ""


def count_lines_by_ext(repo: Path) -> dict:
    counts = {}
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            fp = Path(root) / f
            if fp.suffix in SOURCE_EXTS:
                try:
                    lines = fp.read_text(encoding="utf-8", errors="replace").count("\n") + 1
                    counts[fp.suffix] = counts.get(fp.suffix, 0) + lines
                except Exception:
                    pass
    return counts


def count_test_files(repo: Path) -> int:
    patterns = [
        "test_*.py", "*_test.py", "*_spec.py",
        "*.test.js", "*.spec.js", "*.test.ts", "*.spec.ts",
        "*Test.java", "*_test.go", "*_spec.rb",
    ]
    count = 0
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            fp = Path(root) / f
            for pat in patterns:
                if fp.match(pat):
                    count += 1
                    break
    return count


def find_todos(repo: Path) -> list:
    results = []
    pattern = re.compile(r"(TODO|FIXME|HACK|XXX|BUG)\s*[:\-]?\s*(.*)", re.IGNORECASE)
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            fp = Path(root) / f
            if fp.suffix in SOURCE_EXTS:
                try:
                    for i, line in enumerate(fp.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
                        m = pattern.search(line)
                        if m:
                            results.append({
                                "file": str(fp.relative_to(repo)),
                                "line": i,
                                "type": m.group(1).upper(),
                                "text": m.group(2).strip()[:80],
                            })
                except Exception:
                    pass
    return results[:50]


def detect_stack(repo: Path) -> list:
    indicators = []
    checks = [
        ("package.json", "Node.js / JavaScript"),
        ("tsconfig.json", "TypeScript"),
        ("requirements.txt", "Python"),
        ("pyproject.toml", "Python (pyproject)"),
        ("Cargo.toml", "Rust"),
        ("go.mod", "Go"),
        ("pom.xml", "Java (Maven)"),
        ("build.gradle", "Java (Gradle)"),
        ("Gemfile", "Ruby"),
        ("composer.json", "PHP"),
        ("Dockerfile", "Docker"),
        ("docker-compose.yml", "Docker Compose"),
        (".github/workflows", "GitHub Actions"),
        ("Makefile", "Make"),
    ]
    for filename, label in checks:
        if (repo / filename).exists():
            indicators.append(label)
    return indicators


def git_info(repo: Path) -> dict:
    info = {}
    info["last_commit"] = run("git log -1 --format='%h %s (%ad)' --date=short", cwd=repo)
    info["total_commits"] = run("git rev-list --count HEAD", cwd=repo)
    info["contributors"] = run("git shortlog -sn --no-merges | head -5", cwd=repo)
    info["branch"] = run("git branch --show-current", cwd=repo)
    return info


def largest_files(repo: Path, n=10) -> list:
    results = []
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            fp = Path(root) / f
            if fp.suffix in SOURCE_EXTS:
                try:
                    lines = fp.read_text(encoding="utf-8", errors="replace").count("\n") + 1
                    results.append((lines, str(fp.relative_to(repo))))
                except Exception:
                    pass
    return sorted(results, reverse=True)[:n]


def generate_report(repo: Path) -> str:
    name = repo.name
    today = date.today().isoformat()
    stack = detect_stack(repo)
    loc_by_ext = count_lines_by_ext(repo)
    total_loc = sum(loc_by_ext.values())
    test_count = count_test_files(repo)
    todos = find_todos(repo)
    git = git_info(repo)
    big_files = largest_files(repo)
    source_files = sum(
        1 for root, dirs, files in os.walk(repo)
        for f in files
        if Path(f).suffix in SOURCE_EXTS
        and not any(d in IGNORE_DIRS for d in Path(root).parts)
    )

    lines = []

    # Header
    lines += [
        f"# Repository Review: `{name}`",
        f"",
        f"**Date:** {today}  ",
        f"**Reviewed by:** Claude  ",
        f"**Repository path:** `{repo}`",
        f"",
        "---",
        "",
    ]

    # 1. Executive Summary
    lines += [
        "## 1. Executive Summary",
        "",
        "> _Claude: Fill in 2–4 sentences summarising what this project does, its primary_",
        "> _purpose, the tech stack, and an overall health rating (Healthy / Needs Attention / Critical)._",
        "",
        "---",
        "",
    ]

    # 2. At a Glance
    lines += ["## 2. Repository at a Glance", ""]
    lines += [f"| Attribute | Value |", f"|-----------|-------|"]
    lines += [f"| Language(s) / Framework(s) | {', '.join(stack) if stack else 'Unknown'} |"]
    lines += [f"| Total source files | {source_files:,} |"]
    lines += [f"| Total lines of code | ~{total_loc:,} |"]
    lines += [f"| Test files found | {test_count} |"]
    if git["last_commit"]:
        lines += [f"| Last commit | {git['last_commit']} |"]
    if git["total_commits"]:
        lines += [f"| Total commits | {git['total_commits']} |"]
    if git["branch"]:
        lines += [f"| Current branch | `{git['branch']}` |"]
    lines += [""]

    if loc_by_ext:
        lines += ["**Lines of code by language:**", ""]
        lines += ["| Extension | Lines |", "|-----------|-------|"]
        for ext, cnt in sorted(loc_by_ext.items(), key=lambda x: -x[1]):
            lines += [f"| `{ext}` | {cnt:,} |"]
    lines += ["", "---", ""]

    # 3. Architecture Overview
    lines += [
        "## 3. Architecture Overview",
        "",
        "> _Claude: Describe the high-level structure. What are the main modules/packages?_",
        "> _What architectural pattern is used (MVC, layered, microservices, monolith)?_",
        "> _Include a simple ASCII or Mermaid diagram if helpful._",
        "",
        "```",
        f"{name}/",
        "├── [Claude: fill in the top-level structure]",
        "```",
        "",
        "---",
        "",
    ]

    # 4. Code Quality
    lines += ["## 4. Code Quality Findings", ""]

    lines += ["### 4.1 Technical Debt (TODOs / FIXMEs)", ""]
    if todos:
        lines += [f"Found **{len(todos)}** debt markers:", ""]
        lines += ["| Type | File | Line | Note |", "|------|------|------|------|"]
        for t in todos[:20]:
            lines += [f"| `{t['type']}` | `{t['file']}` | {t['line']} | {t['text']} |"]
        if len(todos) > 20:
            lines += [f"", f"_... and {len(todos) - 20} more._"]
    else:
        lines += ["✓ No TODO/FIXME markers found."]
    lines += [""]

    lines += ["### 4.2 Complexity — Largest Files", ""]
    if big_files:
        lines += ["| Lines | File |", "|-------|------|"]
        for lc, fp in big_files:
            flag = " ⚠️" if lc > 500 else ""
            lines += [f"| {lc:,} | `{fp}`{flag} |"]
    lines += [""]

    lines += [
        "### 4.3 Code Smells & Duplication",
        "",
        "> _Claude: Note any observed duplication, god objects, deeply nested logic,_",
        "> _missing error handling, or other smells found during file reading._",
        "",
    ]

    lines += [
        "### 4.4 Test Coverage",
        "",
        f"Test files found: **{test_count}**  ",
        f"Source files: **{source_files}**  ",
        "",
        "> _Claude: Describe what is tested vs what is missing. Are there integration tests?_",
        "> _Are tests meaningful or mostly trivial?_",
        "",
        "---",
        "",
    ]

    # 5. Security
    lines += [
        "## 5. Security Findings",
        "",
        "> _Claude: Fill in findings from the security scan (security_scan.sh) and manual review._",
        "> _Use the table below. Mark anything CRITICAL or HIGH prominently._",
        "",
        "| Severity | Finding | File:Line | Recommendation |",
        "|----------|---------|-----------|----------------|",
        "| — | _Run security_scan.sh and fill in results_ | — | — |",
        "",
        "---",
        "",
    ]

    # 6. Dependencies
    lines += [
        "## 6. Dependency Health",
        "",
        "> _Claude: List key dependencies and flag any that are outdated, unmaintained,_",
        "> _or have known CVEs. Run `pip-audit`, `npm audit`, or `cargo audit` if available._",
        "",
        "| Package | Current Version | Status | Notes |",
        "|---------|----------------|--------|-------|",
        "| — | — | — | _Fill in from dependency files_ |",
        "",
        "---",
        "",
    ]

    # 7. Positive Observations
    lines += [
        "## 7. Positive Observations",
        "",
        "> _Claude: Always include this section. What does the project do well?_",
        "> _(e.g., good test coverage, clear module separation, type safety, good docs)_",
        "",
        "- ...",
        "",
        "---",
        "",
    ]

    # 8. Recommendations
    lines += [
        "## 8. Recommendations (Ranked by Impact)",
        "",
        "| Priority | Action | Rationale |",
        "|----------|--------|-----------|",
        "| 🔴 Critical | — | — |",
        "| 🟠 High | — | — |",
        "| 🟡 Medium | — | — |",
        "| 🟢 Low | — | — |",
        "",
        "---",
        "",
    ]

    # 9. Git contributors
    if git["contributors"]:
        lines += [
            "## 9. Contributors",
            "",
            "```",
            git["contributors"],
            "```",
            "",
            "---",
            "",
        ]

    # 10. Files Reviewed
    lines += [
        "## 10. Files Reviewed",
        "",
        "> _Claude: List all files that were manually read during this review._",
        "",
        "- ...",
        "",
        "---",
        "",
        "_End of report._",
    ]

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Generate repo review report scaffold")
    parser.add_argument("--repo", required=True, help="Path to the repository")
    parser.add_argument("--output", help="Write report to this file (default: stdout)")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not repo.is_dir():
        print(f"Error: {repo} is not a directory", file=sys.stderr)
        sys.exit(1)

    report = generate_report(repo)

    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(report)
        print(f"Report scaffolded at: {out}")
    else:
        print(report)


if __name__ == "__main__":
    main()
