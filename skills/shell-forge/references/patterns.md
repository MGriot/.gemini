# Shell Patterns Library

> Load this file when the user needs a specific recipe or asks about pipelines,
> file operations, networking, parsing, or automation patterns.

## Table of Contents
1. [File & Directory Operations](#1-file--directory-operations)
2. [String & Text Processing](#2-string--text-processing)
3. [Pipelines & Data Processing](#3-pipelines--data-processing)
4. [Networking & HTTP](#4-networking--http)
5. [Process Management](#5-process-management)
6. [Git Hooks & Automation](#6-git-hooks--automation)
7. [Environment & Config](#7-environment--config)
8. [Logging & Monitoring](#8-logging--monitoring)
9. [AWS / Cloud CLI Patterns](#9-aws--cloud-cli-patterns)
10. [Testing Shell Scripts](#10-testing-shell-scripts)

---

## 1. File & Directory Operations

### Find and process files safely (handles spaces in names)
```bash
# Process each .log file — safe with spaces
find /var/log -name "*.log" -print0 | while IFS= read -r -d '' f; do
  gzip "$f"
done
```

### Rotate logs (keep last N)
```bash
rotate_logs() {
  local dir="$1" keep="${2:-7}" ext="${3:-log}"
  find "$dir" -maxdepth 1 -name "*.${ext}" -printf '%T@ %p\n' \
    | sort -rn \
    | tail -n "+$((keep + 1))" \
    | awk '{print $2}' \
    | xargs -r rm --
}
```

### Atomic file write (no partial reads)
```bash
atomic_write() {
  local target="$1"
  local tmp
  tmp=$(mktemp "${target}.XXXXXX")
  # Write to temp first, then rename (atomic on same filesystem)
  cat > "$tmp"
  mv -f "$tmp" "$target"
}
# Usage: echo "new content" | atomic_write /etc/myapp/config
```

### Backup before overwrite
```bash
backup_file() {
  local f="$1"
  [[ -f "$f" ]] && cp -p "$f" "${f}.$(date +%Y%m%d_%H%M%S).bak"
}
```

### Watch directory for changes (inotify)
```bash
# Requires: inotify-tools
inotifywait -m -r -e create,modify,delete /path/to/watch \
  --format '%T %w %f %e' --timefmt '%H:%M:%S' \
  | while read -r ts dir file event; do
      echo "[$ts] $event: ${dir}${file}"
    done
```

---

## 2. String & Text Processing

### Extract values from key=value files
```bash
# Source safely (only key=value lines, no execution)
parse_env_file() {
  local file="$1"
  grep -E '^[A-Z_]+=.+' "$file" | while IFS='=' read -r key val; do
    export "$key"="$val"
  done
}
```

### Trim whitespace
```bash
trim() { local s="$1"; s="${s#"${s%%[![:space:]]*}"}"; s="${s%"${s##*[![:space:]]}"}"; echo "$s"; }
```

### URL encode
```bash
urlencode() {
  local s="$1"
  printf '%s' "$s" | python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.stdin.read(), safe=""))'
}
```

### Generate random string (no external deps)
```bash
rand_str() {
  local len="${1:-16}"
  LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c "$len"
}
```

### Multi-line heredoc with variable substitution
```bash
cat > /etc/myapp/config.yaml <<EOF
host: ${DB_HOST}
port: ${DB_PORT:-5432}
name: ${DB_NAME:?DB_NAME must be set}
EOF
```

### Heredoc WITHOUT substitution (use `'EOF'`)
```bash
cat > /usr/local/bin/wrapper <<'EOF'
#!/bin/sh
exec myapp --config /etc/myapp "$@"
EOF
chmod +x /usr/local/bin/wrapper
```

---

## 3. Pipelines & Data Processing

### JSON with jq — common patterns
```bash
# Extract field
curl -s api.example.com/data | jq -r '.items[].name'

# Filter and transform
jq '[.users[] | select(.active == true) | {id, email}]' users.json

# Update a field in place
jq '.version = "2.0.0"' package.json | sponge package.json
# (sponge from moreutils — avoids overwrite race; or use atomic_write above)

# Merge two JSON files
jq -s '.[0] * .[1]' base.json overrides.json
```

### CSV processing with awk
```bash
# Sum column 3 of CSV
awk -F, 'NR>1 {sum += $3} END {print sum}' data.csv

# Print rows where column 2 > 100
awk -F, 'NR>1 && $2 > 100' data.csv

# Convert CSV to TSV
awk -F, '{$1=$1; OFS="\t"; print}' data.csv
```

### Parallel processing (GNU parallel)
```bash
# Process files in parallel with 4 jobs
find . -name "*.png" | parallel -j4 convert {} -resize 800x {.}_small.png

# Same with xargs if parallel not available
find . -name "*.png" -print0 | xargs -0 -P4 -I{} convert {} -resize 800x {.}_small.png
```

### Stream large files without loading into memory
```bash
# Count lines without buffering
pv largefile.txt | wc -l   # pv shows progress

# Process gzipped log on the fly
zcat /var/log/app.log.gz | grep "ERROR" | tail -100
```

---

## 4. Networking & HTTP

### Robust curl wrapper
```bash
http_get() {
  local url="$1" output="${2:--}" retries=3
  curl \
    --fail \
    --silent \
    --show-error \
    --location \
    --retry "$retries" \
    --retry-delay 2 \
    --retry-connrefused \
    --max-time 30 \
    --output "$output" \
    "$url"
}
```

### Download with checksum verification
```bash
verified_download() {
  local url="$1" expected_sha256="$2" output="$3"
  http_get "$url" "$output"
  local actual
  actual=$(sha256sum "$output" | awk '{print $1}')
  [[ "$actual" == "$expected_sha256" ]] || err "Checksum mismatch for $output"
}
```

### Wait for service to be ready
```bash
wait_for_port() {
  local host="$1" port="$2" timeout="${3:-30}"
  local deadline=$((SECONDS + timeout))
  until nc -z "$host" "$port" 2>/dev/null; do
    [[ $SECONDS -ge $deadline ]] && err "Timeout waiting for $host:$port"
    sleep 1
  done
  info "Service ready at $host:$port"
}
```

### Send Slack/webhook notification
```bash
notify_slack() {
  local msg="$1" webhook_url="${SLACK_WEBHOOK_URL:?}"
  curl -fsS -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"$msg\"}" \
    "$webhook_url"
}
```

---

## 5. Process Management

### Run with timeout
```bash
# Requires: coreutils timeout (or gtimeout on macOS via brew)
timeout 30s long_running_command || err "Command timed out after 30s"
```

### Background job with PID tracking
```bash
start_service() {
  local pidfile="/run/myapp.pid"
  my_daemon &
  echo $! > "$pidfile"
  info "Started (PID: $!)"
}

stop_service() {
  local pidfile="/run/myapp.pid"
  [[ -f "$pidfile" ]] || err "Not running (no pidfile)"
  local pid; pid=$(cat "$pidfile")
  kill "$pid" && rm -f "$pidfile"
}
```

### Parallel jobs with bounded concurrency
```bash
# Run max N jobs in parallel without GNU parallel
run_bounded() {
  local max_jobs="${1:-4}"; shift
  local pids=()
  for item in "$@"; do
    process_item "$item" &
    pids+=($!)
    while [[ ${#pids[@]} -ge $max_jobs ]]; do
      for i in "${!pids[@]}"; do
        kill -0 "${pids[$i]}" 2>/dev/null || unset "pids[$i]"
      done
      pids=("${pids[@]}")
      sleep 0.1
    done
  done
  wait "${pids[@]}"
}
```

---

## 6. Git Hooks & Automation

### pre-commit: enforce conventional commits
```bash
#!/usr/bin/env bash
# .git/hooks/commit-msg
set -euo pipefail

commit_msg_file="$1"
commit_msg=$(cat "$commit_msg_file")
pattern='^(feat|fix|docs|style|refactor|test|chore|ci|build|perf|revert)(\(.+\))?: .{1,100}$'

if ! echo "$commit_msg" | grep -qE "$pattern"; then
  echo "ERROR: Commit message doesn't follow Conventional Commits format."
  echo "Expected: type(scope): description"
  echo "Example:  feat(auth): add JWT refresh token support"
  exit 1
fi
```

### pre-push: run tests before push
```bash
#!/usr/bin/env bash
set -euo pipefail
echo "Running tests before push..."
make test || { echo "Tests failed. Push aborted."; exit 1; }
```

### Install hooks idempotently
```bash
install_hooks() {
  local hooks_dir=".githooks"
  git config core.hooksPath "$hooks_dir"
  chmod +x "$hooks_dir"/*
  info "Git hooks installed from $hooks_dir"
}
```

---

## 7. Environment & Config

### Load .env file safely
```bash
load_env() {
  local env_file="${1:-.env}"
  [[ -f "$env_file" ]] || return 0
  # Only export valid KEY=VALUE lines; skip comments and blank lines
  set -a
  # shellcheck disable=SC1090
  source <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$env_file")
  set +a
}
```

### Require environment variables
```bash
require_env() {
  for var in "$@"; do
    [[ -n "${!var+x}" ]] || err "Required env var not set: $var"
  done
}
# Usage: require_env DATABASE_URL SECRET_KEY AWS_REGION
```

### Config with fallback chain (env → file → default)
```bash
get_config() {
  local key="$1" default="${2:-}"
  # 1. Check env var
  [[ -n "${!key+x}" ]] && { echo "${!key}"; return; }
  # 2. Check config file
  local config_file="${CONFIG_FILE:-$HOME/.config/myapp/config}"
  if [[ -f "$config_file" ]]; then
    local val; val=$(awk -F= "/^${key}=/{print \$2}" "$config_file")
    [[ -n "$val" ]] && { echo "$val"; return; }
  fi
  # 3. Default
  echo "$default"
}
```

---

## 8. Logging & Monitoring

### Structured logging to file + stdout
```bash
LOG_FILE="${LOG_FILE:-/var/log/myapp/app.log}"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  local level="$1"; shift
  local ts; ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local entry="$ts [$level] $*"
  echo "$entry"
  echo "$entry" >> "$LOG_FILE"
}

log INFO "Starting deployment"
log ERROR "Connection failed"
```

### Tee to log and stdout simultaneously
```bash
exec > >(tee -a "$LOG_FILE") 2>&1
```

---

## 9. AWS / Cloud CLI Patterns

### Assume role and export credentials
```bash
assume_role() {
  local role_arn="$1" session="${2:-session}"
  local creds
  creds=$(aws sts assume-role --role-arn "$role_arn" \
            --role-session-name "$session" \
            --query 'Credentials' --output json)
  export AWS_ACCESS_KEY_ID=$(echo "$creds" | jq -r .AccessKeyId)
  export AWS_SECRET_ACCESS_KEY=$(echo "$creds" | jq -r .SecretAccessKey)
  export AWS_SESSION_TOKEN=$(echo "$creds" | jq -r .SessionToken)
}
```

### S3 sync with progress and error handling
```bash
s3_deploy() {
  local src="$1" bucket="$2" prefix="${3:-}"
  aws s3 sync "$src" "s3://${bucket}/${prefix}" \
    --delete \
    --sse AES256 \
    --no-progress \
    || err "S3 sync failed: $src → s3://$bucket/$prefix"
  info "Deployed: $src → s3://$bucket/$prefix"
}
```

### Wait for CloudFormation stack
```bash
cf_wait() {
  local stack="$1" event="${2:-stack-update-complete}"
  info "Waiting for $stack ($event)..."
  aws cloudformation wait "$event" --stack-name "$stack" \
    || err "CloudFormation wait failed for $stack"
}
```

---

## 10. Testing Shell Scripts

### Minimal test harness (no dependencies)
```bash
# test_myapp.sh
PASS=0; FAIL=0

assert_eq() {
  local desc="$1" expected="$2" actual="$3"
  if [[ "$expected" == "$actual" ]]; then
    echo "✓ $desc"; ((PASS++))
  else
    echo "✗ $desc"; echo "  expected: $expected"; echo "  actual:   $actual"; ((FAIL++))
  fi
}

assert_exit() {
  local desc="$1" expected_code="$2"; shift 2
  "$@"; local actual_code=$?
  assert_eq "$desc" "$expected_code" "$actual_code"
}

# ── Tests ────────────────────────────────────────────────────────────────────
source ./my_functions.sh

assert_eq "trim removes leading spaces" "hello" "$(trim "  hello")"
assert_eq "trim removes trailing spaces" "hello" "$(trim "hello  ")"
assert_exit "script exits 1 on bad input" 1 ./script.sh --invalid-flag

# ── Results ──────────────────────────────────────────────────────────────────
echo ""; echo "Results: $PASS passed, $FAIL failed"
[[ $FAIL -eq 0 ]] || exit 1
```

### Use bats-core for larger test suites
```bash
# test_myapp.bats
@test "trim removes spaces" {
  result=$(trim "  hello  ")
  [ "$result" = "hello" ]
}

@test "script fails with missing arg" {
  run ./script.sh
  [ "$status" -eq 1 ]
  [[ "$output" =~ "Usage:" ]]
}
```

> Install: `brew install bats-core` or `apt install bats`
