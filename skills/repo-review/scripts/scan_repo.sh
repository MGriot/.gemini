#!/usr/bin/env bash
# ============================================================
# scan_repo.sh — Fast initial reconnaissance of a repository
# Usage: bash scan_repo.sh <REPO_PATH>
# ============================================================

set -euo pipefail

REPO="${1:-.}"
REPO=$(realpath "$REPO")

if [ ! -d "$REPO" ]; then
  echo "Error: '$REPO' is not a directory." >&2
  exit 1
fi

SEP="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

header() { echo -e "\n$SEP\n  $1\n$SEP"; }

# ── 1. Project identity ────────────────────────────────────────────────────────
header "1. PROJECT IDENTITY"
echo "Path: $REPO"
echo "Name: $(basename "$REPO")"

# Detect primary language / framework
detect_stack() {
  local repo="$1"
  local found=()

  [ -f "$repo/package.json" ]           && found+=("Node.js/JavaScript")
  [ -f "$repo/tsconfig.json" ]          && found+=("TypeScript")
  [ -f "$repo/requirements.txt" ]       && found+=("Python (requirements.txt)")
  [ -f "$repo/pyproject.toml" ]         && found+=("Python (pyproject.toml)")
  [ -f "$repo/setup.py" ]               && found+=("Python (setup.py)")
  [ -f "$repo/Cargo.toml" ]             && found+=("Rust")
  [ -f "$repo/go.mod" ]                 && found+=("Go")
  [ -f "$repo/pom.xml" ]                && found+=("Java/Maven")
  [ -f "$repo/build.gradle" ]           && found+=("Java/Gradle")
  [ -f "$repo/Gemfile" ]                && found+=("Ruby")
  [ -f "$repo/composer.json" ]          && found+=("PHP")
  [ -f "$repo/mix.exs" ]                && found+=("Elixir")
  [ -f "$repo/build.sbt" ]              && found+=("Scala/SBT")
  [ -f "$repo/Dockerfile" ]             && found+=("Docker")
  [ -f "$repo/docker-compose.yml" ] || [ -f "$repo/docker-compose.yaml" ] \
                                       && found+=("Docker Compose")
  ls "$repo"/*.tf &>/dev/null 2>&1      && found+=("Terraform")
  [ -d "$repo/.github/workflows" ]      && found+=("GitHub Actions")

  if [ ${#found[@]} -eq 0 ]; then
    echo "Stack: Unknown (no common config files found)"
  else
    echo "Stack: ${found[*]}"
  fi
}
detect_stack "$REPO"

# ── 2. Directory tree (2 levels) ───────────────────────────────────────────────
header "2. DIRECTORY TREE (depth 2)"
find "$REPO" -maxdepth 2 \
  -not -path "*/.git/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/__pycache__/*" \
  -not -path "*/vendor/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  | sort | head -80

# ── 3. File count by extension ─────────────────────────────────────────────────
header "3. FILE COUNT BY EXTENSION"
find "$REPO" -type f \
  -not -path "*/.git/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/__pycache__/*" \
  -not -path "*/vendor/*" \
  | grep -oE '\.[a-zA-Z0-9]+$' \
  | sort | uniq -c | sort -rn | head -25

# ── 4. Lines of code by language ───────────────────────────────────────────────
header "4. LINES OF CODE (main languages)"
for ext in py js ts go rs java rb cs php swift kt; do
  count=$(find "$REPO" -name "*.${ext}" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/vendor/*" \
    -not -name "*.min.*" \
    2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
  [ "${count:-0}" -gt 0 ] 2>/dev/null && echo "  .${ext}: ${count} lines" || true
done

# ── 5. Important files present ─────────────────────────────────────────────────
header "5. KEY FILES DETECTED"
for f in README.md README.rst CONTRIBUTING.md CHANGELOG.md LICENSE \
          .gitignore .env.example Makefile Dockerfile docker-compose.yml \
          .github/workflows .travis.yml .circleci Jenkinsfile; do
  [ -e "$REPO/$f" ] && echo "  ✓ $f" || echo "  ✗ $f (missing)"
done

# ── 6. Git history summary ─────────────────────────────────────────────────────
header "6. GIT HISTORY (last 10 commits)"
if [ -d "$REPO/.git" ]; then
  git -C "$REPO" log --oneline --no-decorate -10 2>/dev/null \
    || echo "(git log failed)"
  echo ""
  echo "Contributors:"
  git -C "$REPO" shortlog -sn --no-merges 2>/dev/null | head -10 \
    || echo "(git shortlog failed)"
else
  echo "(No .git directory found)"
fi

# ── 7. TODOs / FIXMEs ─────────────────────────────────────────────────────────
header "7. TODOS / FIXMES / HACKS (first 30)"
grep -rn \
  --include="*.py" --include="*.js" --include="*.ts" --include="*.go" \
  --include="*.rs" --include="*.java" --include="*.rb" --include="*.cs" \
  --include="*.php" --include="*.swift" \
  -iE "(TODO|FIXME|HACK|XXX|NOSONAR|BUG)\s*[:\-]?" \
  "$REPO" \
  --exclude-dir=".git" --exclude-dir="node_modules" --exclude-dir="vendor" \
  2>/dev/null | head -30 || echo "(none found)"

# ── 8. Test file detection ─────────────────────────────────────────────────────
header "8. TEST FILES"
test_count=$(find "$REPO" -type f \( \
  -name "test_*.py" -o -name "*_test.py" -o -name "*_spec.py" \
  -o -name "*.test.js" -o -name "*.spec.js" \
  -o -name "*.test.ts" -o -name "*.spec.ts" \
  -o -name "*Test.java" -o -name "*_test.go" \
  -o -name "*_spec.rb" \
  \) 2>/dev/null | wc -l)
echo "Test files found: $test_count"
find "$REPO" -type f \( \
  -name "test_*.py" -o -name "*_test.py" \
  -o -name "*.test.js" -o -name "*.spec.ts" \
  -o -name "*Test.java" -o -name "*_test.go" \
  \) 2>/dev/null | head -20

# ── 9. Largest files ───────────────────────────────────────────────────────────
header "9. LARGEST SOURCE FILES (top 15)"
find "$REPO" -type f \( \
  -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.go" \
  -o -name "*.rs" -o -name "*.java" -o -name "*.rb" -o -name "*.cs" \
  \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -not -path "*/vendor/*" -not -name "*.min.*" \
  | xargs wc -l 2>/dev/null | sort -rn | head -16

# ── 10. Environment variable usage ────────────────────────────────────────────
header "10. ENVIRONMENT VARIABLES REFERENCED"
grep -rhoE \
  "(os\.environ\[.+?\]|os\.getenv\(.+?\)|process\.env\.[A-Z_]+|ENV\[.+?\])" \
  "$REPO" \
  --include="*.py" --include="*.js" --include="*.ts" --include="*.rb" \
  --exclude-dir=".git" --exclude-dir="node_modules" \
  2>/dev/null | sort -u | head -30

echo -e "\n$SEP\n  Scan complete.\n$SEP\n"
