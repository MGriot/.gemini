#!/usr/bin/env python3
"""
Quick Security Pre-Scan Script
Scans the current directory for common security red flags.
Run from your project root: python scripts/quick_scan.py

This is a complement to proper tools (bandit, semgrep, pip-audit) — not a replacement.
"""

import os
import re
import sys
from pathlib import Path
from dataclasses import dataclass, field

@dataclass
class Finding:
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    file: str
    line: int
    message: str
    snippet: str

findings: list[Finding] = []

# ──────────────────────────────────────────────────────────────────────────────
# Patterns to search for
# ──────────────────────────────────────────────────────────────────────────────

CRITICAL_PATTERNS = [
    (r"(password|secret|api_key|private_key|token)\s*=\s*['\"][^'\"]{6,}['\"]",
     "Possible hardcoded secret"),
    (r"\beval\s*\(", "eval() usage — potential code execution"),
    (r"\bexec\s*\(", "exec() usage — potential code execution"),
    (r"pickle\.loads?\s*\(", "pickle deserialization — potential RCE"),
    (r"subprocess\.\w+\([^)]*shell\s*=\s*True", "subprocess with shell=True — injection risk"),
    (r"os\.system\s*\(", "os.system() — shell injection risk"),
    (r"yaml\.load\s*\([^,)]*\)", "yaml.load() without Loader — use yaml.safe_load()"),
]

HIGH_PATTERNS = [
    (r"(md5|sha1)\s*\([^)]*password", "Weak hash for password"),
    (r"hashlib\.(md5|sha1)\s*\(", "MD5/SHA1 — use SHA-256+ or bcrypt for passwords"),
    (r"DEBUG\s*=\s*True", "DEBUG mode enabled"),
    (r"verify\s*=\s*False", "SSL verification disabled"),
    (r"ALLOWED_HOSTS\s*=\s*\[[\s'\"\*,]+\]", "ALLOWED_HOSTS = ['*'] — too permissive"),
    (r'allow_origins\s*=\s*\[[\s"\']\*[\s"\']\]', "CORS allow_origins=['*'] — too permissive"),
    (r"cursor\.execute\s*\([^,]*%\s*\(", "Possible SQL injection — string formatting in query"),
    (r'cursor\.execute\s*\(f["\']', "Possible SQL injection — f-string in query"),
]

MEDIUM_PATTERNS = [
    (r"print\s*\([^)]*password", "Possible password in print statement"),
    (r"logger\.\w+\([^)]*password", "Possible password in log statement"),
    (r"localhost|127\.0\.0\.1", "Hardcoded localhost — check if intentional"),
    (r"0\.0\.0\.0", "Binding to all interfaces — verify intentional"),
    (r"http://(?!localhost|127)", "Plain HTTP URL — should this be HTTPS?"),
    (r"\.decode\s*\(\s*['\"]utf-8['\"]\s*\)\s*#.*nosec", "nosec comment — review"),
]

LOW_PATTERNS = [
    (r"TODO.*security|FIXME.*security|HACK.*auth", "Security TODO/FIXME comment"),
    (r"#\s*nosec", "Bandit nosec suppression — verify it's justified"),
    (r"pragma:\s*no cover.*auth", "Auth code excluded from coverage"),
]

SENSITIVE_FILES = [
    ".env", ".env.local", ".env.production", ".env.staging",
    "secrets.yaml", "secrets.json", "credentials.json",
    "private_key.pem", "*.pem", "*.p12", "*.pfx",
    "id_rsa", "id_ed25519",
]

# ──────────────────────────────────────────────────────────────────────────────

EXCLUDE_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", 
                "dist", "build", ".pytest_cache", "htmlcov"}
INCLUDE_EXTS = {".py", ".js", ".ts", ".tsx", ".jsx", ".env", ".yaml", ".yml", 
                ".json", ".toml", ".cfg", ".ini", ".sh"}

def scan_file(path: Path):
    if path.suffix not in INCLUDE_EXTS:
        return
    try:
        content = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return

    lines = content.splitlines()
    for i, line in enumerate(lines, 1):
        for pattern, msg in CRITICAL_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                findings.append(Finding("CRITICAL", str(path), i, msg, line.strip()[:100]))
        for pattern, msg in HIGH_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                findings.append(Finding("HIGH", str(path), i, msg, line.strip()[:100]))
        for pattern, msg in MEDIUM_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                findings.append(Finding("MEDIUM", str(path), i, msg, line.strip()[:100]))
        for pattern, msg in LOW_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                findings.append(Finding("LOW", str(path), i, msg, line.strip()[:100]))


def check_sensitive_files(root: Path):
    for item in root.rglob("*"):
        if any(part in EXCLUDE_DIRS for part in item.parts):
            continue
        name = item.name
        if name.startswith(".env") or name in ("secrets.yaml", "secrets.json", 
                                                "credentials.json", "id_rsa", "id_ed25519"):
            findings.append(Finding("CRITICAL", str(item), 0,
                f"Sensitive file found: {name} — ensure it's in .gitignore and not committed",
                ""))


def check_gitignore(root: Path):
    gi = root / ".gitignore"
    if not gi.exists():
        findings.append(Finding("HIGH", ".gitignore", 0, 
            "No .gitignore found — secrets may be committed accidentally", ""))
        return
    content = gi.read_text()
    for pattern in [".env", "*.pem", "secrets.toml", "*.key"]:
        if pattern not in content:
            findings.append(Finding("MEDIUM", ".gitignore", 0,
                f"'{pattern}' not in .gitignore — add it", ""))


def check_requirements(root: Path):
    req = root / "requirements.txt"
    if req.exists():
        content = req.read_text()
        unpinned = [l.strip() for l in content.splitlines()
                    if l.strip() and not l.startswith("#") and "==" not in l and not l.startswith("-")]
        if unpinned:
            findings.append(Finding("LOW", "requirements.txt", 0,
                f"Unpinned dependencies: {', '.join(unpinned[:5])}{'...' if len(unpinned) > 5 else ''}",
                "Use pip-compile to pin all dependencies"))


def main():
    root = Path(".")
    print("🔍 Quick Security Scan\n" + "="*50)

    check_sensitive_files(root)
    check_gitignore(root)
    check_requirements(root)

    for path in root.rglob("*"):
        if path.is_file() and not any(p in EXCLUDE_DIRS for p in path.parts):
            scan_file(path)

    if not findings:
        print("✅ No obvious issues found. Run bandit, semgrep, and pip-audit for thorough scanning.")
        return

    for severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
        group = [f for f in findings if f.severity == severity]
        if not group:
            continue
        icons = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}
        print(f"\n{icons[severity]} {severity} ({len(group)} findings)")
        print("-" * 40)
        for f in group:
            loc = f"{f.file}:{f.line}" if f.line else f.file
            print(f"  [{loc}] {f.message}")
            if f.snippet:
                print(f"    → {f.snippet}")

    totals = {s: len([f for f in findings if f.severity == s]) 
              for s in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]}
    print(f"\n📊 Summary: {totals['CRITICAL']} critical, {totals['HIGH']} high, "
          f"{totals['MEDIUM']} medium, {totals['LOW']} low")
    print("\n⚠️  This is a fast heuristic scan. Always run:")
    print("   pip-audit  |  bandit -r .  |  semgrep --config=auto .")


if __name__ == "__main__":
    main()
