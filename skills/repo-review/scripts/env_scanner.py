#!/usr/bin/env python3
"""
env_scanner.py — Phase 2b: Environment & Secrets Scanner
Finds .env files, required env vars, and potential secrets.
Usage: python3 env_scanner.py <PROJECT_ROOT>
"""

import os
import sys
import json
import re
from pathlib import Path


SECRET_PATTERNS = [
    (r'(?i)(api[_-]?key|apikey)\s*[=:]\s*["\']?([A-Za-z0-9_\-]{16,})["\']?', "API Key"),
    (r'(?i)(secret[_-]?key|secret)\s*[=:]\s*["\']?([A-Za-z0-9_\-]{16,})["\']?', "Secret Key"),
    (r'(?i)(password|passwd|pwd)\s*[=:]\s*["\']?(\S{8,})["\']?', "Password"),
    (r'(?i)(token)\s*[=:]\s*["\']?([A-Za-z0-9_\-\.]{16,})["\']?', "Token"),
    (r'(?i)(private[_-]?key)\s*[=:]\s*["\']?([A-Za-z0-9_\-]{16,})["\']?', "Private Key"),
    (r'(?i)(database[_-]?url|db[_-]?url)\s*[=:]\s*["\']?(\S+)["\']?', "Database URL"),
    (r'AKIA[0-9A-Z]{16}', "AWS Access Key ID"),
    (r'(?i)sk-[A-Za-z0-9]{32,}', "OpenAI-style API Key"),
    (r'ghp_[A-Za-z0-9]{36}', "GitHub Personal Access Token"),
    (r'glpat-[A-Za-z0-9\-_]{20}', "GitLab PAT"),
]

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", "target", "vendor"}
SKIP_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2",
                   ".ttf", ".eot", ".mp4", ".mp3", ".pdf", ".zip", ".tar", ".gz", ".pyc", ".pyo"}


def safe_read(path):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception:
        return ""


def parse_env_file(path):
    """Parse a .env file and extract variable names."""
    vars_found = {}
    sensitive_vars = []
    content = safe_read(path)
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip()
            # Mask value for output
            is_sensitive = any(k in key.lower() for k in
                               ["secret", "password", "key", "token", "pwd", "pass", "auth", "credential"])
            masked_val = "***" if (is_sensitive and val and val not in ("", '""', "''", "your_value_here", "change_me")) else val
            vars_found[key] = masked_val
            if is_sensitive and val and val not in ("", '""', "''", "your_value_here", "change_me", "xxx"):
                sensitive_vars.append(key)
    return vars_found, sensitive_vars


def scan_for_secrets(root):
    """Scan source files for hardcoded secrets."""
    findings = []
    skip_files = {".env.example", ".env.sample", ".env.test"}

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            if fname in skip_files:
                continue
            if Path(fname).suffix.lower() in SKIP_EXTENSIONS:
                continue
            fpath = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(fpath, root)
            # Skip .env files themselves from secret scanning (handled separately)
            if fname.startswith(".env"):
                continue
            content = safe_read(fpath)
            for pattern, label in SECRET_PATTERNS:
                matches = re.finditer(pattern, content)
                for m in matches:
                    line_no = content[:m.start()].count("\n") + 1
                    # Skip comments
                    line_content = content.splitlines()[line_no - 1] if line_no <= len(content.splitlines()) else ""
                    if line_content.strip().startswith(("#", "//", "*", "<!--")):
                        continue
                    findings.append({
                        "file": rel_path,
                        "line": line_no,
                        "type": label,
                        "snippet": line_content.strip()[:80]
                    })
                    if len(findings) >= 50:  # cap
                        return findings
    return findings


def find_env_files(root):
    """Find all .env* files."""
    env_files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        rel_dir = os.path.relpath(dirpath, root)
        depth = len(Path(rel_dir).parts) if rel_dir != "." else 0
        if depth > 3:
            dirnames.clear()
            continue
        for fname in filenames:
            if fname.startswith(".env"):
                rel = os.path.relpath(os.path.join(dirpath, fname), root)
                env_files.append(rel)
    return env_files


def collect_all_env_vars(root):
    """Collect all env var references from source code."""
    patterns = [
        r'process\.env\.([A-Z_][A-Z0-9_]*)',  # JS/TS
        r'os\.environ(?:\.get)?\(["\']([A-Z_][A-Z0-9_]*)',  # Python
        r'os\.Getenv\(["\']([A-Z_][A-Z0-9_]*)',  # Go
        r'ENV\[[\'":]([A-Z_][A-Z0-9_]*)',  # Ruby
        r'System\.getenv\(["\']([A-Z_][A-Z0-9_]*)',  # Java
        r'\$ENV\{([A-Z_][A-Z0-9_]*)\}',  # Perl
        r'getenv\(["\']([A-Z_][A-Z0-9_]*)',  # C/C++
    ]
    combined = "|".join(f"(?:{p})" for p in patterns)
    vars_found = set()
    skip_extensions = SKIP_EXTENSIONS | {".md", ".txt", ".json", ".yaml", ".yml", ".toml"}

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            if Path(fname).suffix.lower() in skip_extensions:
                continue
            fpath = os.path.join(dirpath, fname)
            content = safe_read(fpath)
            for pat in patterns:
                matches = re.findall(pat, content)
                vars_found.update(m for m in matches if m)
    return sorted(vars_found)


def main():
    if len(sys.argv) < 2:
        print("Usage: env_scanner.py <PROJECT_ROOT>", file=sys.stderr)
        sys.exit(1)

    root = os.path.abspath(sys.argv[1])

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"  REPO REVIEW — Phase 2b: Environment Scanner", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    print("  Finding .env files...", file=sys.stderr)
    env_files = find_env_files(root)

    env_file_details = {}
    all_env_vars_defined = {}
    all_sensitive = []
    for ef in env_files:
        full_path = os.path.join(root, ef)
        vars_found, sensitive = parse_env_file(full_path)
        env_file_details[ef] = {
            "var_count": len(vars_found),
            "sensitive_count": len(sensitive),
            "vars": vars_found
        }
        all_env_vars_defined.update(vars_found)
        all_sensitive.extend(sensitive)

    print("  Collecting env var references in source...", file=sys.stderr)
    vars_referenced = collect_all_env_vars(root)

    # Find vars referenced in code but not defined in any .env
    undefined = [v for v in vars_referenced if v not in all_env_vars_defined]

    print("  Scanning for hardcoded secrets...", file=sys.stderr)
    secret_findings = scan_for_secrets(root)

    result = {
        "env_files_found": env_files,
        "env_file_details": env_file_details,
        "sensitive_vars_with_values_set": sorted(set(all_sensitive)),
        "all_vars_defined": sorted(all_env_vars_defined.keys()),
        "vars_referenced_in_code": vars_referenced,
        "vars_referenced_but_not_in_env": undefined,
        "potential_hardcoded_secrets": secret_findings,
        "warnings": []
    }

    if secret_findings:
        result["warnings"].append(f"⚠️  {len(secret_findings)} potential hardcoded secrets found — review carefully")
    if all_sensitive:
        result["warnings"].append(f"⚠️  {len(all_sensitive)} sensitive vars appear to have real values in .env files — ensure these are gitignored")
    if undefined:
        result["warnings"].append(f"ℹ️  {len(undefined)} env vars referenced in code but not found in any .env file — may need to be configured")

    # Check .gitignore for .env
    gitignore_path = os.path.join(root, ".gitignore")
    if os.path.exists(gitignore_path):
        gi_content = safe_read(gitignore_path)
        if ".env" not in gi_content:
            result["warnings"].append("⚠️  .env does not appear in .gitignore — risk of committing secrets")
    else:
        result["warnings"].append("ℹ️  No .gitignore found")

    print(json.dumps(result, indent=2))
    print(f"\n  ✓ Environment scan complete.", file=sys.stderr)


if __name__ == "__main__":
    main()
