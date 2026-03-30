#!/usr/bin/env bash
# ============================================================
# security_scan.sh — Automated security pattern scanner
# Usage: bash security_scan.sh <REPO_PATH>
# ============================================================

set -euo pipefail

REPO="${1:-.}"
REPO=$(realpath "$REPO")

if [ ! -d "$REPO" ]; then
  echo "Error: '$REPO' is not a directory." >&2
  exit 1
fi

SEP="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0

header() { echo -e "\n$SEP\n  [$1] $2\n$SEP"; }

src_grep() {
  # src_grep PATTERN -- grep across all common source files
  grep -rniE "$1" "$REPO" \
    --include="*.py" --include="*.js" --include="*.ts" \
    --include="*.go" --include="*.java" --include="*.rb" \
    --include="*.php" --include="*.cs" --include="*.swift" \
    --include="*.env" --include="*.yml" --include="*.yaml" \
    --include="*.json" --include="*.conf" --include="*.cfg" \
    --include="*.ini" --include="*.toml" \
    --exclude-dir=".git" --exclude-dir="node_modules" \
    --exclude-dir="vendor" --exclude-dir="__pycache__" \
    --exclude-dir="dist" --exclude-dir="build" \
    2>/dev/null | head -25 || true
}

# ── CRITICAL: Hardcoded credentials ──────────────────────────────────────────
header "CRITICAL" "HARDCODED CREDENTIALS / SECRETS"
CREDS=$(src_grep \
  "(password|passwd|secret|api[_-]?key|apikey|token|private[_-]?key|access[_-]?key|auth[_-]?token|client[_-]?secret)\s*[=:]\s*['\"][^'\"]{6,}" \
  | grep -iv "example\|sample\|test\|placeholder\|your_\|changeme\|todo\|dummy\|fake\|xxx" \
  2>/dev/null || true)
if [ -n "$CREDS" ]; then
  echo "$CREDS"
  CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
else
  echo "  ✓ No obvious hardcoded credentials found."
fi

# ── CRITICAL: Private keys in code ───────────────────────────────────────────
header "CRITICAL" "PRIVATE KEYS / CERTIFICATES IN SOURCE"
KEYS=$(grep -rn \
  "BEGIN\s\(RSA\|EC\|DSA\|OPENSSH\|PGP\)\s*PRIVATE KEY\|BEGIN CERTIFICATE" \
  "$REPO" \
  --exclude-dir=".git" --exclude-dir="node_modules" \
  2>/dev/null | head -10 || true)
if [ -n "$KEYS" ]; then
  echo "$KEYS"
  CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
else
  echo "  ✓ No private key material found in source files."
fi

# ── HIGH: SQL injection patterns ──────────────────────────────────────────────
header "HIGH" "SQL INJECTION RISK PATTERNS"
SQL=$(src_grep \
  "(execute|query|cursor\.execute|db\.query|mysqli_query|pg_query|execute_query)\s*\(.*[+\.\|%]" \
  || true)
if [ -n "$SQL" ]; then
  echo "$SQL"
  HIGH_COUNT=$((HIGH_COUNT + 1))
else
  echo "  ✓ No obvious SQL injection patterns found."
fi

# ── HIGH: Shell/command injection ─────────────────────────────────────────────
header "HIGH" "SHELL / COMMAND INJECTION RISKS"
CMD=$(src_grep \
  "(os\.system\s*\(|subprocess\.call\s*\(|subprocess\.run\s*\(.*shell\s*=\s*True|child_process\.exec\s*\(|exec\(|eval\(|popen\s*\()" \
  | grep -iv "test\|spec\|mock" || true)
if [ -n "$CMD" ]; then
  echo "$CMD"
  HIGH_COUNT=$((HIGH_COUNT + 1))
else
  echo "  ✓ No obvious shell injection patterns found."
fi

# ── HIGH: Path traversal ──────────────────────────────────────────────────────
header "HIGH" "PATH TRAVERSAL PATTERNS"
PATH_T=$(src_grep \
  "(open\s*\(.*request\.|open\s*\(.*user_input|open\s*\(.*params\[|readFile\s*\(.*req\.|send_file\s*\()" \
  || true)
if [ -n "$PATH_T" ]; then
  echo "$PATH_T"
  HIGH_COUNT=$((HIGH_COUNT + 1))
else
  echo "  ✓ No obvious path traversal patterns found."
fi

# ── HIGH: Insecure deserialization ────────────────────────────────────────────
header "HIGH" "INSECURE DESERIALIZATION"
DESER=$(src_grep \
  "(pickle\.load|pickle\.loads|yaml\.load[^s_]|unserialize\s*\(|ObjectInputStream|readObject\s*\(|Marshal\.load)" \
  || true)
if [ -n "$DESER" ]; then
  echo "$DESER"
  HIGH_COUNT=$((HIGH_COUNT + 1))
else
  echo "  ✓ No insecure deserialization patterns found."
fi

# ── HIGH: Authentication bypasses ────────────────────────────────────────────
header "HIGH" "AUTHENTICATION / AUTHORIZATION BYPASS RISKS"
AUTH=$(src_grep \
  "(verify\s*=\s*False|ssl_verify\s*=\s*False|verify_ssl\s*=\s*False|checkAuth\s*=\s*false|skipAuthentication|disable.*auth)" \
  || true)
if [ -n "$AUTH" ]; then
  echo "$AUTH"
  HIGH_COUNT=$((HIGH_COUNT + 1))
else
  echo "  ✓ No obvious auth bypass patterns found."
fi

# ── MEDIUM: Weak cryptography ─────────────────────────────────────────────────
header "MEDIUM" "WEAK CRYPTOGRAPHY"
CRYPTO=$(src_grep \
  "(hashlib\.md5|hashlib\.sha1|new\s*MD5\s*\(|new\s*SHA1\s*\(|\bDES\b|RC4|AES\.MODE_ECB|Math\.random\s*\(\)|random\.random\s*\(\))" \
  || true)
if [ -n "$CRYPTO" ]; then
  echo "$CRYPTO"
  MEDIUM_COUNT=$((MEDIUM_COUNT + 1))
else
  echo "  ✓ No obvious weak crypto patterns found."
fi

# ── MEDIUM: Sensitive data in logs ───────────────────────────────────────────
header "MEDIUM" "SENSITIVE DATA IN LOGS"
LOGS=$(src_grep \
  "(console\.log|print\s*\(|logger\.(info|debug|warning|error))\s*.*?(password|secret|token|key|credit_card|ssn)" \
  || true)
if [ -n "$LOGS" ]; then
  echo "$LOGS"
  MEDIUM_COUNT=$((MEDIUM_COUNT + 1))
else
  echo "  ✓ No obvious credential logging found."
fi

# ── MEDIUM: Debug mode in production ─────────────────────────────────────────
header "MEDIUM" "DEBUG MODE / VERBOSE ERROR EXPOSURE"
DEBUG=$(src_grep \
  "(DEBUG\s*=\s*True|debug\s*=\s*true|app\.run\s*\(.*debug|FLASK_DEBUG|display_errors\s*=\s*On|error_reporting\s*=\s*E_ALL)" \
  || true)
if [ -n "$DEBUG" ]; then
  echo "$DEBUG"
  MEDIUM_COUNT=$((MEDIUM_COUNT + 1))
else
  echo "  ✓ No debug mode flags found."
fi

# ── MEDIUM: CORS misconfiguration ─────────────────────────────────────────────
header "MEDIUM" "CORS / CSRF ISSUES"
CORS=$(src_grep \
  "(Access-Control-Allow-Origin.*\*|cors\s*\(.*\*|csrf.*disabled|CSRF_ENABLED\s*=\s*False)" \
  || true)
if [ -n "$CORS" ]; then
  echo "$CORS"
  MEDIUM_COUNT=$((MEDIUM_COUNT + 1))
else
  echo "  ✓ No obvious CORS misconfigurations found."
fi

# ── LOW: .env files committed ─────────────────────────────────────────────────
header "LOW" ".ENV FILES IN REPOSITORY"
ENV_FILES=$(find "$REPO" \
  -name ".env" -o -name ".env.local" -o -name ".env.production" \
  -o -name ".env.staging" \
  -not -name ".env.example" -not -name ".env.sample" \
  2>/dev/null | grep -v "/.git/" || true)
if [ -n "$ENV_FILES" ]; then
  echo "  ⚠ .env files found (may contain real secrets):"
  echo "$ENV_FILES"
  LOW_COUNT=$((LOW_COUNT + 1))
else
  echo "  ✓ No .env files with live secrets found (examples are fine)."
fi

# ── LOW: .gitignore check ─────────────────────────────────────────────────────
header "LOW" ".GITIGNORE HYGIENE"
if [ -f "$REPO/.gitignore" ]; then
  for pat in ".env" "*.pem" "*.key" "secret*" "*password*" "credentials*"; do
    grep -q "$pat" "$REPO/.gitignore" \
      && echo "  ✓ $pat is gitignored" \
      || echo "  ⚠ $pat is NOT in .gitignore"
  done
else
  echo "  ⚠ No .gitignore found!"
  LOW_COUNT=$((LOW_COUNT + 1))
fi

# ── SUMMARY ───────────────────────────────────────────────────────────────────
echo -e "\n$SEP"
echo "  SECURITY SCAN SUMMARY"
echo "$SEP"
echo "  CRITICAL : $CRITICAL_COUNT finding(s)"
echo "  HIGH     : $HIGH_COUNT finding(s)"
echo "  MEDIUM   : $MEDIUM_COUNT finding(s)"
echo "  LOW      : $LOW_COUNT finding(s)"
echo ""
echo "  NOTE: This is an automated static scan. Manual review is always required."
echo "  False positives are possible; always verify findings in context."
echo "$SEP"
