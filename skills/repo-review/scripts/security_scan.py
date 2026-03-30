#!/usr/bin/env python3
"""
security_scan.py — Phase 6: Security scanning for secrets, injection, and misconfigs.

Usage: python3 security_scan.py <repo_path> [--output json|text] [--severity LOW|MEDIUM|HIGH|CRITICAL]

No external dependencies required. Optionally integrates bandit and semgrep if installed.
"""

import os
import re
import sys
import json
import math
import argparse
import subprocess
from pathlib import Path
from dataclasses import dataclass, asdict, field
from typing import List, Optional


SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".tox", "venv", ".venv",
    "dist", "build", "target", ".gradle", "vendor", "third_party",
    ".cache", "tmp", "temp", "coverage", ".nyc_output",
}

SKIP_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    ".pdf", ".zip", ".tar", ".gz", ".exe", ".dll", ".so", ".dylib",
    ".lock", ".sum",  # lockfiles have hashes, not secrets
}


@dataclass
class Finding:
    severity: str         # CRITICAL, HIGH, MEDIUM, LOW, INFO
    category: str         # secrets, injection, crypto, config, etc.
    title: str
    description: str
    file: str
    line: int
    snippet: str
    recommendation: str
    cwe: Optional[str] = None


# ── Secret patterns ───────────────────────────────────────────────────────────

SECRET_PATTERNS = [
    # Generic high-entropy strings assigned to suspicious variable names
    (r'(?i)(password|passwd|pwd|secret|api_key|apikey|access_key|auth_token|auth_key|private_key|client_secret)\s*[=:]\s*["\']([^"\']{8,})["\']',
     "CRITICAL", "Hardcoded secret", "Potential hardcoded password or secret key", "Use environment variables instead", "CWE-798"),

    # AWS
    (r'AKIA[0-9A-Z]{16}', "CRITICAL", "AWS Access Key ID", "AWS access key ID found in code", "Rotate key, use IAM roles or env vars", "CWE-798"),
    (r'(?i)aws.{0,30}secret.{0,30}["\']([A-Za-z0-9/+=]{40})["\']', "CRITICAL", "AWS Secret Key", "AWS secret access key found", "Rotate key, use IAM roles", "CWE-798"),

    # GitHub / GitLab tokens
    (r'ghp_[A-Za-z0-9]{36,}', "CRITICAL", "GitHub Personal Access Token", "GitHub PAT detected", "Revoke and rotate immediately", "CWE-798"),
    (r'ghs_[A-Za-z0-9]{36,}', "CRITICAL", "GitHub App Token", "GitHub app installation token", "Revoke and rotate immediately", "CWE-798"),
    (r'glpat-[A-Za-z0-9_\-]{20,}', "CRITICAL", "GitLab PAT", "GitLab personal access token", "Revoke and rotate", "CWE-798"),

    # Stripe
    (r'sk_live_[A-Za-z0-9]{24,}', "CRITICAL", "Stripe Live Secret Key", "Stripe live secret key found", "Revoke immediately, rotate", "CWE-798"),
    (r'pk_live_[A-Za-z0-9]{24,}', "HIGH", "Stripe Live Public Key", "Stripe live publishable key found", "Move to environment config", "CWE-798"),

    # Slack
    (r'xox[baprs]-[0-9A-Za-z\-]{10,}', "CRITICAL", "Slack Token", "Slack token found", "Revoke immediately", "CWE-798"),

    # JWT
    (r'eyJ[A-Za-z0-9\-_=]{20,}\.eyJ[A-Za-z0-9\-_=]{20,}', "HIGH", "JWT Token", "Hardcoded JWT found", "Never hardcode JWTs; use auth flow", "CWE-798"),

    # Private keys
    (r'-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----', "CRITICAL", "Private Key", "Private key in source", "Remove immediately, rotate all derived credentials", "CWE-312"),

    # Google
    (r'AIza[0-9A-Za-z\-_]{35}', "CRITICAL", "Google API Key", "Google API key found", "Restrict key, move to env vars", "CWE-798"),

    # Database URLs with credentials
    (r'(?i)(mysql|postgres|postgresql|mongodb|redis|amqp|jdbc)://[^:]+:[^@/\s]{3,}@', "HIGH", "Database connection string with credentials", "DB URL with embedded credentials", "Use secret manager or env vars", "CWE-312"),

    # Generic connection strings
    (r'(?i)connection.string\s*=\s*["\'][^"\']{20,}["\']', "HIGH", "Connection string", "Potential connection string with credentials", "Move to config/env vars", "CWE-312"),

    # Generic Bearer tokens
    (r'(?i)bearer\s+[A-Za-z0-9\-_=.]{20,}', "HIGH", "Bearer Token", "Hardcoded bearer token", "Use dynamic auth", "CWE-798"),
]


# ── Injection patterns ────────────────────────────────────────────────────────

INJECTION_PATTERNS = [
    # SQL injection
    (r'(?i)(execute|query|cursor\.execute)\s*\(\s*["\'][^"\']*\s*\+\s*', "HIGH", "SQL Injection Risk",
     "SQL query built with string concatenation", "Use parameterized queries / prepared statements", "CWE-89"),
    (r'(?i)(execute|query)\s*\(\s*f["\'].*\{', "HIGH", "SQL Injection Risk (f-string)",
     "SQL query built with f-string interpolation", "Use parameterized queries", "CWE-89"),

    # Shell injection
    (r'subprocess\.(call|run|Popen)\s*\([^)]*shell\s*=\s*True', "HIGH", "Shell Injection Risk",
     "subprocess with shell=True enables shell injection", "Use list form: subprocess.run(['cmd', arg])", "CWE-78"),
    (r'os\.system\s*\(', "MEDIUM", "Shell Execution",
     "os.system() passes string to shell", "Use subprocess with list args", "CWE-78"),
    (r'os\.popen\s*\(', "MEDIUM", "Shell Execution",
     "os.popen() passes string to shell", "Use subprocess with list args", "CWE-78"),

    # Path traversal
    (r'open\s*\(\s*[^)]*request\.[a-z_]+', "HIGH", "Path Traversal Risk",
     "File open with user-controlled path", "Validate and sanitize path, use os.path.realpath", "CWE-22"),
    (r'(?i)(readfile|include|require)\s*\(\s*\$_(GET|POST|REQUEST|COOKIE)', "HIGH", "Path Traversal / LFI Risk (PHP)",
     "File operation with unsanitized user input", "Whitelist allowed files, sanitize path", "CWE-22"),

    # Template injection
    (r'render_template_string\s*\(.*request\.|render_template_string\s*\(.*\+', "HIGH", "Template Injection Risk",
     "Flask render_template_string with user input", "Never render user input as a template", "CWE-94"),

    # Eval / exec
    (r'\beval\s*\([^)]*\+', "HIGH", "Code Injection via eval",
     "eval() with string concatenation is dangerous", "Avoid eval; use ast.literal_eval for data", "CWE-95"),
    (r'\bexec\s*\([^)]*request\.|exec\s*\([^)]*\+', "HIGH", "Code Injection via exec",
     "exec() with dynamic content", "Never exec user input", "CWE-95"),
]


# ── Insecure crypto patterns ──────────────────────────────────────────────────

CRYPTO_PATTERNS = [
    (r'(?i)hashlib\.(md5|sha1)\s*\(', "HIGH", "Weak Hash Algorithm",
     "MD5/SHA1 are cryptographically broken", "Use SHA-256 or better; for passwords use bcrypt/argon2", "CWE-327"),
    (r'(?i)(md5|sha1)\s*\(', "MEDIUM", "Weak Hash (generic)",
     "Possible MD5 or SHA1 usage", "Verify context; use SHA-256+ for crypto purposes", "CWE-327"),
    (r'(?i)DES[.\s(]|3DES[.\s(]|RC4[.\s(]|RC2[.\s(]', "HIGH", "Weak Cipher",
     "DES/3DES/RC4/RC2 are insecure", "Use AES-256-GCM or ChaCha20", "CWE-327"),
    (r'Cipher\.getInstance\s*\(\s*["\']AES/ECB', "HIGH", "ECB Mode",
     "AES in ECB mode is semantically insecure", "Use AES-GCM or AES-CBC with random IV", "CWE-327"),
    (r'(?i)(random\.(random|randint|choice|shuffle)|Math\.random\(\))', "MEDIUM", "Weak PRNG",
     "Non-cryptographic random used - may be predictable", "Use secrets module (Python) or crypto.randomBytes (Node)", "CWE-338"),
    (r'(?i)ssl_verify\s*=\s*False|verify\s*=\s*False|CERT_NONE|check_hostname\s*=\s*False', "HIGH", "SSL Verification Disabled",
     "SSL certificate verification disabled", "Never disable SSL verification in production", "CWE-295"),
]


# ── Insecure deserialization ──────────────────────────────────────────────────

DESER_PATTERNS = [
    (r'pickle\.loads?\s*\(', "HIGH", "Insecure Deserialization (pickle)",
     "pickle.load/loads can execute arbitrary code", "Use JSON or safer serialization", "CWE-502"),
    (r'yaml\.load\s*\([^,)]+\)', "HIGH", "Insecure YAML Deserialization",
     "yaml.load without Loader= executes arbitrary code", "Use yaml.safe_load() instead", "CWE-502"),
    (r'marshal\.loads?\s*\(', "HIGH", "Insecure Deserialization (marshal)",
     "marshal can execute arbitrary code on untrusted data", "Avoid deserializing untrusted data", "CWE-502"),
    (r'ObjectInputStream|readObject\s*\(\s*\)', "MEDIUM", "Java Deserialization",
     "Java ObjectInputStream can be exploited", "Use safer formats (JSON) or add deserialization filters", "CWE-502"),
    (r'unserialize\s*\(\s*\$_(GET|POST|REQUEST|COOKIE)', "CRITICAL", "PHP Insecure Deserialization",
     "Unserializing user input is critical vulnerability", "Never unserialize user input", "CWE-502"),
]


# ── Config / access control patterns ─────────────────────────────────────────

CONFIG_PATTERNS = [
    (r'(?i)debug\s*=\s*(True|1|on|yes|true)', "MEDIUM", "Debug Mode",
     "Debug mode may be enabled in production", "Ensure DEBUG=False in production", "CWE-489"),
    (r'(?i)access.control.allow.origin["\s:]*\*', "MEDIUM", "Permissive CORS",
     "CORS allows all origins (*)", "Restrict CORS to specific trusted domains", "CWE-942"),
    (r'(?i)allow_all_hosts\s*=\s*True|ALLOWED_HOSTS\s*=\s*\[\s*["\'\*]', "MEDIUM", "Permissive Host Config",
     "Accepting requests from all hosts", "Restrict ALLOWED_HOSTS to known domains", "CWE-183"),
    (r'(?i)secret_key\s*=\s*["\'][a-z]{5,20}["\']', "HIGH", "Weak Secret Key",
     "Weak or default secret key detected", "Use a cryptographically random 50+ char secret key", "CWE-321"),
    (r'(?i)(admin|root|administrator)\s*[=:]\s*["\'][^"\']{1,20}["\']', "MEDIUM", "Hardcoded Admin Credential",
     "Possible hardcoded admin username/password", "Move credentials to env vars / secrets manager", "CWE-798"),
]


# ── Entropy analysis for secrets ──────────────────────────────────────────────

def shannon_entropy(data: str) -> float:
    if not data:
        return 0
    freq = {}
    for c in data:
        freq[c] = freq.get(c, 0) + 1
    length = len(data)
    return -sum((count / length) * math.log2(count / length) for count in freq.values())


HIGH_ENTROPY_PATTERN = re.compile(r'["\']([A-Za-z0-9+/=_\-]{20,})["\']')
ENTROPY_THRESHOLD = 4.5  # bits per character


def check_high_entropy(line: str, line_num: int, filepath: str) -> Optional[Finding]:
    """Flag high-entropy strings that look like secrets."""
    # Skip lines that are obviously not secrets
    lower = line.lower()
    if any(x in lower for x in ["import ", "from ", "//", "http://", "https://", "example.com", "test", "lorem"]):
        return None
    for m in HIGH_ENTROPY_PATTERN.finditer(line):
        value = m.group(1)
        entropy = shannon_entropy(value)
        if entropy > ENTROPY_THRESHOLD and len(value) >= 20:
            return Finding(
                severity="HIGH",
                category="secrets",
                title="High-Entropy String",
                description=f"High-entropy string (entropy={entropy:.2f}) may be a secret",
                file=filepath,
                line=line_num,
                snippet=line.strip()[:120],
                recommendation="Verify this is not a credential. Move secrets to environment variables.",
                cwe="CWE-312",
            )
    return None


# ── Scanner ───────────────────────────────────────────────────────────────────

def scan_file(filepath: Path, repo_root: Path) -> List[Finding]:
    findings = []
    relative = str(filepath.relative_to(repo_root))

    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return findings

    lines = content.splitlines()
    ext = filepath.suffix.lower()

    # All pattern groups
    all_patterns = []
    all_patterns.extend((p, "secrets") for p, *_ in [x for x in SECRET_PATTERNS])
    all_patterns.extend((p, "injection") for p, *_ in [x for x in INJECTION_PATTERNS])
    all_patterns.extend((p, "crypto") for p, *_ in [x for x in CRYPTO_PATTERNS])
    all_patterns.extend((p, "deserialization") for p, *_ in [x for x in DESER_PATTERNS])
    all_patterns.extend((p, "config") for p, *_ in [x for x in CONFIG_PATTERNS])

    # Collect all pattern tuples
    pattern_groups = [
        (SECRET_PATTERNS, "secrets"),
        (INJECTION_PATTERNS, "injection"),
        (CRYPTO_PATTERNS, "crypto"),
        (DESER_PATTERNS, "deserialization"),
        (CONFIG_PATTERNS, "config"),
    ]

    for line_num, line in enumerate(lines, 1):
        # Skip comments and test lines
        stripped = line.strip()
        if stripped.startswith(("#", "//", "*", "<!--", "--", "'")):
            continue
        if "test" in relative.lower() or "spec" in relative.lower():
            # Still check for real secrets in test files
            pass

        for group, category in pattern_groups:
            for entry in group:
                pattern = entry[0]
                severity = entry[1]
                title = entry[2]
                description = entry[3]
                recommendation = entry[4]
                cwe = entry[5] if len(entry) > 5 else None

                try:
                    if re.search(pattern, line):
                        findings.append(Finding(
                            severity=severity,
                            category=category,
                            title=title,
                            description=description,
                            file=relative,
                            line=line_num,
                            snippet=stripped[:120],
                            recommendation=recommendation,
                            cwe=cwe,
                        ))
                except re.error:
                    pass

        # Entropy check (only on non-config/lock files)
        if ext not in {".json", ".lock", ".sum", ".mod", ".toml"}:
            entropy_finding = check_high_entropy(line, line_num, relative)
            if entropy_finding:
                findings.append(entropy_finding)

    return findings


def run_bandit(repo_path: Path) -> List[Finding]:
    """Run bandit if available."""
    try:
        r = subprocess.run(
            ["bandit", "-r", str(repo_path), "-f", "json", "-q", "--skip", "B101"],
            capture_output=True, text=True, timeout=60,
        )
        data = json.loads(r.stdout)
        findings = []
        severity_map = {"HIGH": "HIGH", "MEDIUM": "MEDIUM", "LOW": "LOW"}
        for issue in data.get("results", []):
            findings.append(Finding(
                severity=severity_map.get(issue["issue_severity"], "LOW"),
                category="bandit",
                title=issue.get("test_id", "") + " " + issue.get("test_name", ""),
                description=issue.get("issue_text", ""),
                file=issue.get("filename", ""),
                line=issue.get("line_number", 0),
                snippet=issue.get("code", "").strip()[:120],
                recommendation="See bandit docs for remediation",
                cwe=issue.get("issue_cwe", {}).get("id", ""),
            ))
        return findings
    except (FileNotFoundError, json.JSONDecodeError, subprocess.TimeoutExpired):
        return []


def run(repo_path_str: str, output_format: str = "text", min_severity: str = "LOW"):
    repo_path = Path(repo_path_str).resolve()
    if not repo_path.exists():
        print(f"ERROR: Path does not exist: {repo_path}", file=sys.stderr)
        sys.exit(1)

    severity_order = {"INFO": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    min_sev = severity_order.get(min_severity.upper(), 1)

    all_findings: List[Finding] = []

    # Scan files
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            fpath = Path(root) / fname
            if fpath.suffix.lower() in SKIP_EXTENSIONS:
                continue
            try:
                if fpath.stat().st_size > 1 * 1024 * 1024:  # skip files > 1MB
                    continue
            except Exception:
                continue
            all_findings.extend(scan_file(fpath, repo_path))

    # Try bandit
    bandit_findings = run_bandit(repo_path)
    all_findings.extend(bandit_findings)

    # Filter and sort
    filtered = [f for f in all_findings if severity_order.get(f.severity, 0) >= min_sev]
    filtered.sort(key=lambda f: (-severity_order.get(f.severity, 0), f.file, f.line))

    # Deduplicate (same file + line + title)
    seen = set()
    deduped = []
    for f in filtered:
        key = (f.file, f.line, f.title)
        if key not in seen:
            seen.add(key)
            deduped.append(f)

    if output_format == "json":
        print(json.dumps([asdict(f) for f in deduped], indent=2))
        return

    # Text output
    counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
    for f in deduped:
        counts[f.severity] = counts.get(f.severity, 0) + 1

    print(f"\n{'='*60}")
    print(f"  SECURITY SCAN RESULTS: {repo_path.name}")
    print(f"{'='*60}")
    print(f"\nSummary: {len(deduped)} findings")
    for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]:
        if counts[sev]:
            print(f"  {sev:<10} {counts[sev]}")

    if bandit_findings:
        print(f"\n  (Bandit: {len(bandit_findings)} additional findings included)")

    if not deduped:
        print("\n  No security issues found at the selected severity level.")
        return

    print()
    for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]:
        group = [f for f in deduped if f.severity == sev]
        if not group:
            continue
        print(f"\n[{sev}] {len(group)} finding(s)")
        print("-" * 50)
        for f in group:
            print(f"  {f.title}")
            print(f"    File: {f.file}:{f.line}")
            print(f"    {f.description}")
            if f.cwe:
                print(f"    CWE: {f.cwe}")
            print(f"    Code: {f.snippet[:80]}")
            print(f"    Fix:  {f.recommendation}")
            print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Security scanner")
    parser.add_argument("repo_path", help="Path to the repository")
    parser.add_argument("--output", choices=["text", "json"], default="text")
    parser.add_argument("--severity", default="LOW", help="Minimum severity (LOW/MEDIUM/HIGH/CRITICAL)")
    args = parser.parse_args()
    run(args.repo_path, output_format=args.output, min_severity=args.severity)
