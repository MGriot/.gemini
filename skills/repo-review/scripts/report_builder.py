#!/usr/bin/env python3
"""
report_builder.py — Phase 6: Report Generation
Assembles all scan outputs into a comprehensive Markdown report.
Usage: python3 report_builder.py --project-root <ROOT> --depth <quick|standard|deep> --output <OUT.md>
"""

import os
import sys
import json
import subprocess
import argparse
from datetime import datetime
from pathlib import Path


SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS_DIR = os.path.join(SKILL_DIR, "scripts")


def run_script(script_name, args_list):
    """Run a scan script and return parsed JSON output."""
    script_path = os.path.join(SCRIPTS_DIR, script_name)
    try:
        result = subprocess.run(
            [sys.executable, script_path] + args_list,
            capture_output=True, text=True, timeout=120
        )
        if result.stdout.strip():
            return json.loads(result.stdout)
    except Exception as e:
        return {"error": str(e)}
    return {}


def render_section(title, content, level=2):
    hashes = "#" * level
    return f"\n{hashes} {title}\n\n{content}\n"


def fmt_list(items, prefix="- "):
    if not items:
        return "_None detected._\n"
    return "\n".join(f"{prefix}{item}" for item in items) + "\n"


def severity_emoji(sev):
    return {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🔵"}.get(sev, "⚪")


def build_quick_report(root, orient, structure, deps, quality):
    name = orient.get("project_name", os.path.basename(root))
    summary = orient.get("summary", {})
    langs = orient.get("languages_by_lines", [])
    lang_str = ", ".join(f"{l['ext']} ({l['lines']:,} lines)" for l in langs[:3]) if langs else "Unknown"

    manifests = deps.get("manifests_found", [])
    frameworks = []
    for lang_data in deps.get("details", {}).values():
        frameworks.extend(lang_data.get("frameworks_detected", []))

    q_summary = quality.get("summary", {})
    signals = quality.get("quality_signals", [])
    positive = [s for s in signals if s.get("positive") is True]
    negative = [s for s in signals if s.get("positive") is False]

    lines = [
        f"# 📦 {name} — Quick Review\n",
        f"> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}  |  Files: {summary.get('total_files', '?')}  |  Lines: {summary.get('total_lines_estimated', '?'):,}\n",
        "---\n",
        "## What is this?\n",
        f"_{name}_ is a software project with **{summary.get('total_files', '?')} files** and approximately "
        f"**{summary.get('total_lines_estimated', '?'):,} lines of code**.\n",
        f"Primary languages: **{lang_str}**\n",
        f"Detected frameworks: {', '.join(frameworks) if frameworks else 'None identified'}\n",
        "\n## Structure\n",
        f"```\n{structure.get('annotated_tree', 'N/A')[:2000]}\n```\n",
        "\n## Entry Points\n",
        fmt_list(structure.get("entry_points", [])),
        "\n## Tech Stack\n",
        fmt_list([f"`{m}`" for m in manifests]) if manifests else "_No manifests found._\n",
        "\n## Quality Signals\n",
        "**✅ Strengths:**\n" + fmt_list([s["signal"] for s in positive]),
        "**⚠️ Areas to improve:**\n" + fmt_list([s["signal"] for s in negative]),
        "\n---\n",
        f"_For a full review, run with `--depth standard`._\n"
    ]
    return "\n".join(lines)


def build_standard_report(root, orient, structure, deps, env, quality, security):
    name = orient.get("project_name", os.path.basename(root))
    summary = orient.get("summary", {})
    git = orient.get("git", {})
    langs = orient.get("languages_by_lines", [])
    q_summary = quality.get("summary", {})

    # Frameworks
    all_frameworks = []
    all_databases = deps.get("databases_detected", [])
    for lang_data in deps.get("details", {}).values():
        all_frameworks.extend(lang_data.get("frameworks_detected", []))

    # Security summary
    sec_summary = security.get("summary", {})
    sec_by_sev = sec_summary.get("by_severity", {})

    report = []

    # Header
    report.append(f"# 🔍 Repository Review: {name}\n")
    report.append(f"> **Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}  \n")
    report.append(f"> **Root:** `{root}`  \n")
    if git.get("branch"):
        report.append(f"> **Branch:** `{git['branch']}`  \n")
    if git.get("last_commit"):
        lc = git["last_commit"]
        report.append(f"> **Last Commit:** `{lc['hash']}` — {lc['message'][:60]} ({lc['relative_time']})  \n")
    report.append("\n---\n")

    # Table of Contents
    report.append("## Table of Contents\n")
    report.append("1. [Executive Summary](#executive-summary)\n")
    report.append("2. [Tech Stack](#tech-stack)\n")
    report.append("3. [Architecture Overview](#architecture-overview)\n")
    report.append("4. [Directory Guide](#directory-guide)\n")
    report.append("5. [Key Files](#key-files)\n")
    report.append("6. [Dependencies](#dependencies)\n")
    report.append("7. [Environment & Configuration](#environment--configuration)\n")
    report.append("8. [Code Quality](#code-quality)\n")
    report.append("9. [Security Notes](#security-notes)\n")
    report.append("10. [Onboarding Checklist](#onboarding-checklist)\n")
    report.append("11. [Open Questions](#open-questions)\n")
    report.append("\n---\n")

    # 1. Executive Summary
    lang_str = ", ".join(f"**{l['ext']}** ({l['lines']:,} lines)" for l in langs[:4])
    report.append("## Executive Summary\n\n")
    report.append(f"**{name}** is a {len(deps.get('manifests_found', []))+1}-language project with ")
    report.append(f"**{summary.get('total_files', '?')} files** and approximately ")
    report.append(f"**{summary.get('total_lines_estimated', '?'):,} lines of code**.\n\n")
    report.append(f"Primary languages: {lang_str or 'Unknown'}\n\n")
    if all_frameworks:
        report.append(f"Frameworks detected: {', '.join(all_frameworks)}\n\n")
    if all_databases:
        report.append(f"Databases/ORMs: {', '.join(all_databases)}\n\n")
    report.append(f"> ⚠️ _Fill in: What problem does this project solve? Who uses it? What is its current status?_\n\n")
    report.append("---\n")

    # 2. Tech Stack
    report.append("## Tech Stack\n\n")
    report.append("| Category | Details |\n|---|---|\n")
    for lang, data in deps.get("details", {}).items():
        report.append(f"| **{lang.title()} Runtime** | {data.get('runtime', lang)} |\n")
        fws = data.get("frameworks_detected", [])
        if fws:
            report.append(f"| **Frameworks** | {', '.join(fws)} |\n")
        if data.get("name"):
            report.append(f"| **Package Name** | `{data['name']}` |\n")
    for db in all_databases:
        report.append(f"| **Database** | {db} |\n")
    ci_systems = list(quality.get("ci_cd_systems", {}).keys())
    if ci_systems:
        report.append(f"| **CI/CD** | {', '.join(ci_systems)} |\n")
    linters = list(quality.get("linter_configs", {}).keys())
    if linters:
        report.append(f"| **Linters** | {', '.join(linters)} |\n")
    report.append("\n---\n")

    # 3. Architecture Overview
    report.append("## Architecture Overview\n\n")
    report.append("> ⚠️ _Claude: Fill in after analyzing entry points and major modules. Include ASCII/Mermaid diagram._\n\n")
    report.append("```\n[Placeholder — trace the main request/data flow here]\n```\n\n")
    report.append("---\n")

    # 4. Directory Guide
    report.append("## Directory Guide\n\n")
    report.append("```\n")
    report.append(structure.get("annotated_tree", "N/A")[:3000])
    report.append("\n```\n\n")
    report.append("---\n")

    # 5. Key Files
    report.append("## Key Files\n\n")
    entry_points = structure.get("entry_points", [])
    config_files = structure.get("config_files", [])
    report.append("### Entry Points\n\n")
    if entry_points:
        for ep in entry_points:
            report.append(f"- `{ep}` — _describe purpose_\n")
    else:
        report.append("_No standard entry points detected._\n")
    report.append("\n### Configuration Files\n\n")
    for cf in config_files[:15]:
        report.append(f"- `{cf}`\n")
    report.append("\n> ⚠️ _Claude: Add the 10–20 most important files with one-line descriptions._\n\n")
    report.append("---\n")

    # 6. Dependencies
    report.append("## Dependencies\n\n")
    for lang, data in deps.get("details", {}).items():
        report.append(f"### {lang.title()}\n\n")
        prod = data.get("prod_deps", data.get("gems", data.get("dependencies", [])))
        dev = data.get("dev_deps", {})
        if isinstance(prod, dict):
            prod_count = len(prod)
        elif isinstance(prod, list):
            prod_count = len(prod)
        else:
            prod_count = 0
        dev_count = len(dev) if isinstance(dev, dict) else 0
        report.append(f"- **Production deps:** {prod_count}\n")
        if dev_count:
            report.append(f"- **Dev deps:** {dev_count}\n")
        report.append("\n")
    report.append("---\n")

    # 7. Environment & Configuration
    report.append("## Environment & Configuration\n\n")
    env_files = env.get("env_files_found", [])
    vars_defined = env.get("all_vars_defined", [])
    vars_undefined = env.get("vars_referenced_but_not_in_env", [])
    env_warnings = env.get("warnings", [])

    if env_files:
        report.append(f"**Env files found:** {', '.join(f'`{e}`' for e in env_files)}\n\n")
    if vars_defined:
        report.append(f"**Variables defined:** {len(vars_defined)}\n\n")
    if vars_undefined:
        report.append("**Variables used in code but not in .env files:**\n")
        for v in vars_undefined[:20]:
            report.append(f"- `{v}`\n")
        report.append("\n")
    for w in env_warnings:
        report.append(f"> {w}\n")
    report.append("\n---\n")

    # 8. Code Quality
    report.append("## Code Quality\n\n")
    report.append(f"| Metric | Value |\n|---|---|\n")
    report.append(f"| Source files | {q_summary.get('source_files', '?')} |\n")
    report.append(f"| Test files | {q_summary.get('test_files', '?')} |\n")
    report.append(f"| Test ratio | {q_summary.get('test_ratio_percent', '?')}% |\n")
    report.append(f"| Doc coverage | {q_summary.get('doc_coverage_percent', '?')}% |\n")
    report.append(f"| TODO/FIXME items | {q_summary.get('todo_fixme_count', '?')} |\n")
    report.append(f"| Files >500 lines | {q_summary.get('large_files_count', '?')} |\n\n")

    signals = quality.get("quality_signals", [])
    positive = [s for s in signals if s.get("positive") is True]
    negative = [s for s in signals if s.get("positive") is False]
    neutral = [s for s in signals if s.get("positive") is None]

    if positive:
        report.append("**✅ Strengths:**\n")
        for s in positive:
            val = f" ({s['value']})" if s.get('value') else ""
            report.append(f"- {s['signal']}{val}\n")
        report.append("\n")
    if negative:
        report.append("**⚠️ Areas for improvement:**\n")
        for s in negative:
            val = f" ({s['value']})" if s.get('value') else ""
            report.append(f"- {s['signal']}{val}\n")
        report.append("\n")

    large_files = quality.get("large_files_top10", [])
    if large_files:
        report.append("**Largest files:**\n")
        for f in large_files[:5]:
            report.append(f"- `{f['file']}` — {f['lines']} lines\n")
        report.append("\n")
    report.append("---\n")

    # 9. Security Notes
    report.append("## Security Notes\n\n")
    report.append(f"> {security.get('disclaimer', '')}\n\n")
    report.append(f"| Severity | Count |\n|---|---|\n")
    for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
        count = sec_by_sev.get(sev, 0)
        emoji = severity_emoji(sev)
        report.append(f"| {emoji} {sev} | {count} |\n")
    report.append("\n")

    critical = security.get("critical_findings", [])
    if critical:
        report.append("### 🔴 Critical Findings\n\n")
        for f in critical[:10]:
            report.append(f"- **{f['label']}** in `{f['file']}` (line {f['line']})\n")
            if f.get("snippet"):
                report.append(f"  ```\n  {f['snippet']}\n  ```\n")
        report.append("\n")

    sensitive_files = security.get("sensitive_files", [])
    if sensitive_files:
        report.append("### Sensitive Files in Repo\n\n")
        for sf in sensitive_files:
            report.append(f"- `{sf['file']}` — {sf['type']}\n")
        report.append("\n")
    report.append("---\n")

    # 10. Onboarding Checklist
    report.append("## Onboarding Checklist\n\n")
    report.append("For a new developer to get started:\n\n")
    report.append("- [ ] Clone the repository\n")
    if "node" in deps.get("manifests_found", []):
        report.append("- [ ] Run `npm install` (or `yarn` / `pnpm install`)\n")
    if "python" in deps.get("manifests_found", []):
        report.append("- [ ] Create a virtual environment: `python -m venv .venv && source .venv/bin/activate`\n")
        report.append("- [ ] Install dependencies: `pip install -e .` or `pip install -r requirements.txt`\n")
    if "go" in deps.get("manifests_found", []):
        report.append("- [ ] Run `go mod download`\n")
    if env_files:
        report.append(f"- [ ] Copy `{env_files[0]}` to `.env` and fill in required values\n")
    elif vars_undefined:
        report.append("- [ ] Set required environment variables (see Environment section)\n")
    if ci_systems:
        report.append(f"- [ ] Review CI/CD config: {', '.join(ci_systems)}\n")
    report.append("- [ ] Read through the README\n")
    report.append("- [ ] Run the test suite\n")
    report.append("> ⚠️ _Claude: Expand with project-specific steps._\n\n")
    report.append("---\n")

    # 11. Open Questions
    report.append("## Open Questions\n\n")
    report.append("> ⚠️ _Claude: Fill in based on findings — things that are unclear or worth investigating._\n\n")
    if structure.get("notes"):
        for note in structure["notes"]:
            report.append(f"- {note}\n")
    if not entry_points:
        report.append("- What is the main entry point of this project?\n")
    if q_summary.get("test_ratio_percent", 100) < 10:
        report.append("- Is there a test strategy? Tests appear minimal.\n")
    if sec_by_sev.get("CRITICAL", 0) > 0:
        report.append(f"- There are {sec_by_sev['CRITICAL']} critical security findings — are these false positives?\n")
    report.append("\n")

    return "".join(report)


def main():
    parser = argparse.ArgumentParser(description="Generate repo review report")
    parser.add_argument("--project-root", required=True)
    parser.add_argument("--depth", choices=["quick", "standard", "deep"], default="standard")
    parser.add_argument("--output", default="/mnt/user-data/outputs/repo-review-report.md")
    parser.add_argument("--module", help="For deep reviews: analyze a specific submodule")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"  REPO REVIEW — Phase 6: Report Generation", file=sys.stderr)
    print(f"  Depth: {args.depth}", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    print("  Running orientation...", file=sys.stderr)
    orient = run_script("orient.py", [root])

    print("  Running structure analysis...", file=sys.stderr)
    structure = run_script("structure_analyzer.py", [root])

    print("  Running dependency scan...", file=sys.stderr)
    deps = run_script("dep_scanner.py", [root])

    env = {}
    quality = {}
    security = {}

    if args.depth in ("standard", "deep"):
        print("  Running environment scan...", file=sys.stderr)
        env = run_script("env_scanner.py", [root])

        print("  Running quality scan...", file=sys.stderr)
        quality = run_script("quality_scan.py", [root])

        print("  Running security scan...", file=sys.stderr)
        security = run_script("security_scan.py", [root])

    print("  Building report...", file=sys.stderr)

    if args.depth == "quick":
        report = build_quick_report(root, orient, structure, deps, quality)
    else:
        report = build_standard_report(root, orient, structure, deps, env, quality, security)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\n  ✓ Report written to: {args.output}", file=sys.stderr)
    print(args.output)


if __name__ == "__main__":
    main()
