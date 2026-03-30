#!/usr/bin/env python3
"""
dep_scan.py — Phase 3: Dependency analysis and vulnerability detection.

Usage: python3 dep_scan.py <repo_path> [--output text|json]

Detects package manager, extracts deps, checks for known issues.
"""

import os
import re
import sys
import json
import argparse
import subprocess
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional


@dataclass
class Dependency:
    name: str
    version: str
    pinned: bool
    dev: bool
    source_file: str
    issues: List[str]


@dataclass
class DepReport:
    ecosystem: str
    package_file: str
    total: int
    direct: int
    dev_count: int
    pinned_count: int
    dependencies: List[Dependency]
    vulnerabilities: List[dict]
    license_summary: Dict[str, int]
    recommendations: List[str]


# ── Known high-risk packages ─────────────────────────────────────────────────

KNOWN_RISKY = {
    # Python
    "pickle": "Use json or safer serialization instead",
    "marshal": "Insecure deserialization - avoid for untrusted data",
    "shelve": "Uses pickle internally - insecure for untrusted data",
    "pycrypto": "ABANDONED - use pycryptodome or cryptography instead",
    "pycryptodome": "Verify version >= 3.9.8 (CVE-2023-52323 fixed)",
    "PyYAML": "Use yaml.safe_load() - yaml.load() is dangerous",
    "requests": "Ensure >= 2.31.0 for security fixes",
    "urllib3": "Ensure >= 2.0.7 (CVE-2023-45803 fixed)",
    "Pillow": "Ensure >= 10.0.1 for security patches",
    "lxml": "Ensure >= 5.0.0",
    "paramiko": "Ensure >= 3.3.0 (Terrapin attack fix)",
    "cryptography": "Ensure >= 41.0.6 for latest security fixes",
    "django": "Always keep latest minor version",
    "flask": "Ensure >= 3.0.0",
    "jinja2": "Ensure >= 3.1.3 (SSTI fixes)",
    "werkzeug": "Ensure >= 3.0.3",
    "sqlalchemy": "Ensure >= 2.0.0 for modern security",

    # Node.js
    "lodash": "Ensure >= 4.17.21 (prototype pollution)",
    "underscore": "Prefer lodash >= 4.17.21",
    "moment": "DEPRECATED - use date-fns or dayjs",
    "request": "DEPRECATED - use axios, node-fetch, or got",
    "node-uuid": "DEPRECATED - use uuid package instead",
    "minimist": "Ensure >= 1.2.6 (prototype pollution)",
    "path-parse": "Ensure >= 1.0.7",
    "ws": "Ensure >= 8.17.1",
    "jsonwebtoken": "Ensure >= 9.0.0 (algorithm confusion fix)",
    "node-fetch": "Ensure >= 3.3.2",
    "axios": "Ensure >= 1.6.0",
    "express": "Ensure >= 4.19.2",
    "multer": "Validate file types - misconfigured multer allows arbitrary upload",
    "serialize-javascript": "Ensure >= 6.0.2",
    "tar": "Ensure >= 6.1.9 (path traversal)",
    "set-value": "Ensure >= 4.0.1 (prototype pollution)",
    "flat": "Ensure >= 5.0.2 (prototype pollution)",

    # Java
    "log4j-core": "CRITICAL if 2.0-2.14.1: Log4Shell (CVE-2021-44228). Update to 2.17.1+",
    "commons-text": "Ensure >= 1.10.0 (CVE-2022-42889 Text4Shell)",
    "spring-core": "Ensure >= 5.3.18 or 6.0.0 (Spring4Shell CVE-2022-22965)",
    "jackson-databind": "Ensure >= 2.14.0",

    # Ruby
    "devise": "Keep updated - auth library with past CVEs",
    "nokogiri": "Ensure latest - XML parsing CVEs common",
    "rails": "Always use latest patch version",
}

LICENSE_RISK = {
    "GPL-2.0": "COPYLEFT - may require open-sourcing your code",
    "GPL-3.0": "COPYLEFT - may require open-sourcing your code",
    "AGPL-3.0": "COPYLEFT (network) - very restrictive for SaaS",
    "LGPL-2.1": "WEAK COPYLEFT - dynamic linking usually OK",
    "LGPL-3.0": "WEAK COPYLEFT - review carefully",
    "CDDL-1.0": "COPYLEFT - incompatible with GPL",
    "MPL-2.0": "FILE-LEVEL COPYLEFT - modifications must be open-sourced",
    "SSPL-1.0": "COPYLEFT - MongoDB license, very restrictive for services",
    "BUSL-1.1": "BUSINESS SOURCE - non-compete clause on commercial use",
    "CC-BY-NC": "NON-COMMERCIAL only",
    "Proprietary": "PROPRIETARY - check license for allowed use cases",
    "Unknown": "UNKNOWN - must verify before commercial use",
}


# ── Package file parsers ──────────────────────────────────────────────────────

def parse_package_json(path: Path) -> List[Dependency]:
    deps = []
    try:
        data = json.loads(path.read_text())
        for section, is_dev in [("dependencies", False), ("devDependencies", True),
                                  ("peerDependencies", False), ("optionalDependencies", False)]:
            for name, version in data.get(section, {}).items():
                pinned = not any(version.startswith(c) for c in ["^", "~", "*", "x", ">", "<"])
                issues = []
                if name in KNOWN_RISKY:
                    issues.append(KNOWN_RISKY[name])
                deps.append(Dependency(name, version, pinned, is_dev, str(path), issues))
    except Exception:
        pass
    return deps


def parse_requirements_txt(path: Path) -> List[Dependency]:
    deps = []
    try:
        for line in path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or line.startswith("-r") or line.startswith("--"):
                continue
            # Parse name and version
            m = re.match(r'^([A-Za-z0-9_\-\.]+)\s*([=<>!~]{1,3}\s*[\d\.\*]+.*)?$', line)
            if m:
                name = m.group(1)
                version = (m.group(2) or "").strip() or "unspecified"
                pinned = "==" in version
                issues = []
                if name in KNOWN_RISKY:
                    issues.append(KNOWN_RISKY[name])
                deps.append(Dependency(name, version, pinned, False, str(path), issues))
    except Exception:
        pass
    return deps


def parse_pyproject_toml(path: Path) -> List[Dependency]:
    deps = []
    try:
        content = path.read_text()
        # Find dependencies section
        in_deps = False
        for line in content.splitlines():
            stripped = line.strip()
            if stripped in ("[tool.poetry.dependencies]", "[project.dependencies]", "[dependencies]"):
                in_deps = True
                continue
            if stripped.startswith("[") and in_deps:
                in_deps = False
            if in_deps:
                m = re.match(r'^([A-Za-z0-9_\-\.]+)\s*[=:]\s*["\']?(.+?)["\']?\s*$', stripped)
                if m and m.group(1).lower() != "python":
                    name = m.group(1)
                    version = m.group(2).strip()
                    pinned = version.startswith("==") or (re.match(r'^[\d\.]+$', version) is not None)
                    issues = []
                    if name in KNOWN_RISKY:
                        issues.append(KNOWN_RISKY[name])
                    deps.append(Dependency(name, version, pinned, False, str(path), issues))
    except Exception:
        pass
    return deps


def parse_cargo_toml(path: Path) -> List[Dependency]:
    deps = []
    try:
        content = path.read_text()
        in_section = None
        for line in content.splitlines():
            stripped = line.strip()
            if stripped in ("[dependencies]", "[dev-dependencies]", "[build-dependencies]"]:
                in_section = stripped
                continue
            if stripped.startswith("[") and not stripped.startswith("[dependencies"):
                in_section = None
            if in_section:
                m = re.match(r'^([a-z0-9_\-]+)\s*=\s*["\']?([\d\.\*\^~>=<]+)["\']?', stripped)
                if m:
                    is_dev = "dev" in in_section
                    version = m.group(2)
                    pinned = re.match(r'^[\d\.]+$', version) is not None
                    deps.append(Dependency(m.group(1), version, pinned, is_dev, str(path), []))
    except Exception:
        pass
    return deps


def parse_go_mod(path: Path) -> List[Dependency]:
    deps = []
    try:
        content = path.read_text()
        in_require = False
        for line in content.splitlines():
            stripped = line.strip()
            if stripped == "require (":
                in_require = True
                continue
            if stripped == ")" and in_require:
                in_require = False
                continue
            if stripped.startswith("require ") or in_require:
                m = re.match(r'^(?:require\s+)?([^\s]+)\s+(v[\d\.]+)', stripped)
                if m:
                    pinned = True  # Go modules are always pinned
                    deps.append(Dependency(m.group(1), m.group(2), pinned, False, str(path), []))
    except Exception:
        pass
    return deps


def parse_gemfile(path: Path) -> List[Dependency]:
    deps = []
    try:
        for line in path.read_text().splitlines():
            stripped = line.strip()
            if stripped.startswith("gem "):
                m = re.match(r'''gem\s+['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]+)['"])?''', stripped)
                if m:
                    name = m.group(1)
                    version = m.group(2) or "unspecified"
                    issues = []
                    if name in KNOWN_RISKY:
                        issues.append(KNOWN_RISKY[name])
                    deps.append(Dependency(name, version, "==" in version, False, str(path), issues))
    except Exception:
        pass
    return deps


def detect_and_parse(repo_path: Path) -> List[DepReport]:
    reports = []

    parsers = [
        ("package.json", "npm/yarn", parse_package_json),
        ("requirements.txt", "pip", parse_requirements_txt),
        ("requirements-dev.txt", "pip-dev", parse_requirements_txt),
        ("pyproject.toml", "pip/poetry", parse_pyproject_toml),
        ("Cargo.toml", "cargo", parse_cargo_toml),
        ("go.mod", "go modules", parse_go_mod),
        ("Gemfile", "bundler", parse_gemfile),
    ]

    for filename, ecosystem, parser_fn in parsers:
        # Check root and common subdirs
        for search_root in [repo_path] + [repo_path / d for d in ["backend", "frontend", "server", "client", "app", "src"]]:
            pfile = search_root / filename
            if pfile.exists():
                deps = parser_fn(pfile)
                if deps:
                    risky = [d for d in deps if d.issues]
                    pinned = sum(1 for d in deps if d.pinned)
                    dev_count = sum(1 for d in deps if d.dev)
                    reports.append(DepReport(
                        ecosystem=ecosystem,
                        package_file=str(pfile.relative_to(repo_path)),
                        total=len(deps),
                        direct=len(deps),
                        dev_count=dev_count,
                        pinned_count=pinned,
                        dependencies=deps,
                        vulnerabilities=[{"name": d.name, "issue": d.issues[0]} for d in risky],
                        license_summary={},
                        recommendations=_make_recommendations(deps, pinned, len(deps)),
                    ))

    return reports


def _make_recommendations(deps: List[Dependency], pinned: int, total: int) -> List[str]:
    recs = []
    if total == 0:
        return recs
    pin_rate = pinned / total
    if pin_rate < 0.5:
        recs.append(f"Only {pinned}/{total} dependencies are pinned to exact versions. Pin all production deps for reproducibility.")
    risky = [d for d in deps if d.issues]
    if risky:
        recs.append(f"{len(risky)} known-risky package(s) detected: {', '.join(d.name for d in risky[:5])}")
    if total > 100:
        recs.append(f"Large dependency count ({total}). Consider auditing for unused packages.")
    return recs


def try_npm_audit(repo_path: Path) -> List[dict]:
    """Run npm audit if available."""
    pj = repo_path / "package.json"
    if not pj.exists():
        return []
    try:
        r = subprocess.run(["npm", "audit", "--json"], cwd=repo_path, capture_output=True, text=True, timeout=60)
        data = json.loads(r.stdout)
        vulns = []
        for name, info in data.get("vulnerabilities", {}).items():
            vulns.append({
                "name": name,
                "severity": info.get("severity", "unknown"),
                "via": [v if isinstance(v, str) else v.get("title", "") for v in info.get("via", [])],
                "fix": info.get("fixAvailable", False),
            })
        return vulns
    except Exception:
        return []


def try_pip_audit(repo_path: Path) -> List[dict]:
    """Run pip-audit if available."""
    req = repo_path / "requirements.txt"
    if not req.exists():
        return []
    try:
        r = subprocess.run(["pip-audit", "-r", str(req), "--format=json"], capture_output=True, text=True, timeout=120)
        data = json.loads(r.stdout)
        return [{"name": v.get("name"), "version": v.get("version"), "vulns": v.get("vulns", [])} for v in data]
    except Exception:
        return []


def run(repo_path_str: str, output_format: str = "text"):
    repo_path = Path(repo_path_str).resolve()
    if not repo_path.exists():
        print(f"ERROR: {repo_path} does not exist", file=sys.stderr)
        sys.exit(1)

    reports = detect_and_parse(repo_path)
    npm_vulns = try_npm_audit(repo_path)
    pip_vulns = try_pip_audit(repo_path)

    if output_format == "json":
        out = {
            "reports": [asdict(r) for r in reports],
            "npm_audit": npm_vulns,
            "pip_audit": pip_vulns,
        }
        print(json.dumps(out, indent=2))
        return

    print(f"\n{'='*60}")
    print(f"  DEPENDENCY ANALYSIS: {repo_path.name}")
    print(f"{'='*60}")

    if not reports:
        print("\nNo recognized package files found.")
        return

    for report in reports:
        print(f"\nEcosystem: {report.ecosystem}")
        print(f"File:      {report.package_file}")
        print(f"Total:     {report.total} deps  ({report.dev_count} dev, {report.pinned_count} pinned)")

        pin_rate = (report.pinned_count / report.total * 100) if report.total else 0
        print(f"Pinning:   {pin_rate:.0f}% pinned {'✓' if pin_rate > 80 else '⚠ low'}")

        if report.vulnerabilities:
            print(f"\n  ⚠ Known-risky packages ({len(report.vulnerabilities)}):")
            for v in report.vulnerabilities:
                print(f"    - {v['name']}: {v['issue']}")

        if report.recommendations:
            print(f"\n  Recommendations:")
            for rec in report.recommendations:
                print(f"    → {rec}")

    if npm_vulns:
        print(f"\nnpm audit: {len(npm_vulns)} vulnerable package(s)")
        for v in npm_vulns[:10]:
            fix = "fixable" if v.get("fix") else "no auto-fix"
            print(f"  [{v['severity'].upper():<8}] {v['name']} — {fix}")

    if pip_vulns:
        print(f"\npip-audit: results available")
        for v in pip_vulns[:10]:
            if v.get("vulns"):
                print(f"  {v['name']} {v['version']}: {len(v['vulns'])} vulnerabilit(ies)")

    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dependency scanner")
    parser.add_argument("repo_path")
    parser.add_argument("--output", choices=["text", "json"], default="text")
    args = parser.parse_args()
    run(args.repo_path, args.output)
