---
name: shell-forge
description: >
  Expert shell and Bash scripting skill. Use this skill whenever the user wants to write,
  fix, review, or understand shell scripts — including Bash, Zsh, POSIX sh, and fish.
  Triggers for: "write a script to...", "make a bash script", "automate this with shell",
  "fix my script", "review this shell code", "cron job", "pipeline", "deploy script",
  "dotfiles", "shell one-liner", "bashrc", "make this portable", or any task where
  the deliverable is a shell script or shell command. Always applies modern safety
  standards, error handling, and portability analysis without being asked.
---

# Shell Forge · Expert Shell Scripting

> Write scripts that survive contact with reality.  
> Safe by default. Debuggable by design. Portable where it counts.

---

## 0. Quick Decision Map

Before writing a single line, classify the request:

| Request Type | Approach |
|---|---|
| One-liner / quick command | Inline with explanation |
| Script < 50 lines | Single file, fully annotated |
| Script > 50 lines | Modular structure (§4), header required (§2) |
| Existing script to fix/review | Audit checklist (§6) first, then patch |
| Cross-platform / portability ask | POSIX-strict mode (§5) |
| Performance / pipeline | Pipeline patterns (references/patterns.md §3) |
| Cron / scheduled task | Cron hardening section (§7) |

---

## 1. The Safety Header (Non-Negotiable)

**Every Bash script starts with this. No exceptions.**

```bash
#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SCRIPT:  script_name.sh
# PURPOSE: One sentence describing what this script does.
# USAGE:   ./script_name.sh [OPTIONS] <required_arg>
# DEPS:    List tools this script requires (curl, jq, aws, etc.)
# AUTHOR:  [name / team]
# UPDATED: YYYY-MM-DD
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
IFS=$'\n\t'
```

**What each flag does — understand it, don't cargo-cult it:**
- `set -e` — exit immediately on any command that fails (non-zero exit code)
- `set -u` — treat unset variables as errors (prevents silent `$UNDEF` → empty string bugs)
- `set -o pipefail` — a pipeline fails if *any* command in it fails, not just the last one
- `IFS=$'\n\t'` — safer word splitting; prevents surprises with spaces in filenames/args

**When NOT to use `set -e`:** Interactive scripts, scripts that intentionally test exit codes (use `cmd || true` for expected failures), legacy code you don't control.

---

## 2. Error Handling & Cleanup

### The `trap` Pattern
Always use `trap` for cleanup when creating temp files or holding locks.

```bash
# Declare temp dir before trap
TMP_DIR=""

cleanup() {
  local exit_code=$?
  [[ -n "$TMP_DIR" ]] && rm -rf "$TMP_DIR"
  exit "$exit_code"
}
trap cleanup EXIT INT TERM

# Now safe to create
TMP_DIR=$(mktemp -d)
```

### Error Reporting Function
Include this in any script > 30 lines:

```bash
err()  { echo "[ERROR] $*" >&2; exit 1; }
warn() { echo "[WARN]  $*" >&2; }
info() { echo "[INFO]  $*"; }
```

### Check Dependencies Early
```bash
require() {
  for cmd in "$@"; do
    command -v "$cmd" &>/dev/null || err "Required command not found: $cmd"
  done
}

# Call at the top of main, before any logic
require curl jq aws
```

---

## 3. Variables & Quoting Rules

The most common source of shell bugs. Apply these rules mechanically.

| Rule | Bad | Good |
|---|---|---|
| Always quote variable expansions | `$file` | `"$file"` |
| Always quote command substitutions | `$(cmd)` | `"$(cmd)"` |
| Use `${var}` for clarity in strings | `$varname_extra` | `${var}name_extra` |
| Default values | `${VAR}` (crashes if unset) | `${VAR:-default}` |
| Required variables | — | `${VAR:?VAR must be set}` |
| Read-only constants | `MY_CONST=value` | `readonly MY_CONST=value` |
| Local variables in functions | `x=5` (global!) | `local x=5` |

**Array quoting:**
```bash
files=("file one.txt" "file two.txt")
# Wrong: for f in ${files[@]}  → breaks on spaces
# Right:
for f in "${files[@]}"; do
  echo "$f"
done
```

---

## 4. Script Structure (> 50 Lines)

Use this layout for any non-trivial script:

```bash
#!/usr/bin/env bash
# [header block — see §1]
set -euo pipefail
IFS=$'\n\t'

# ── Constants ────────────────────────────────────────────────────────────────
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"

# ── Helper functions ─────────────────────────────────────────────────────────
err()     { echo "[$SCRIPT_NAME][ERROR] $*" >&2; exit 1; }
warn()    { echo "[$SCRIPT_NAME][WARN]  $*" >&2; }
info()    { echo "[$SCRIPT_NAME][INFO]  $*"; }
require() { for cmd in "$@"; do command -v "$cmd" &>/dev/null || err "Missing: $cmd"; done; }

# ── Cleanup ──────────────────────────────────────────────────────────────────
TMP_DIR=""
cleanup() { local e=$?; [[ -n "$TMP_DIR" ]] && rm -rf "$TMP_DIR"; exit "$e"; }
trap cleanup EXIT INT TERM

# ── Argument parsing ─────────────────────────────────────────────────────────
usage() {
  cat <<EOF
Usage: $SCRIPT_NAME [OPTIONS] <arg>

Options:
  -h, --help      Show this help
  -v, --verbose   Enable verbose output
  -n, --dry-run   Simulate actions without executing
EOF
}

VERBOSE=false
DRY_RUN=false

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help)    usage; exit 0 ;;
      -v|--verbose) VERBOSE=true ;;
      -n|--dry-run) DRY_RUN=true ;;
      --)           shift; break ;;
      -*)           err "Unknown option: $1" ;;
      *)            break ;;
    esac
    shift
  done
  # Remaining positional args available as "$@"
}

# ── Core logic ───────────────────────────────────────────────────────────────
main() {
  parse_args "$@"
  require [list dependencies]

  $VERBOSE && info "Verbose mode enabled"
  $DRY_RUN && warn "Dry-run mode — no changes will be made"

  # ... your logic here ...
}

# ── Entry point ──────────────────────────────────────────────────────────────
main "$@"
```

---

## 5. Portability: POSIX vs Bash vs Zsh

When the user needs portability, always state the target explicitly:

| Target | Shebang | Key constraints |
|---|---|---|
| Universal (busybox, Alpine, CI) | `#!/bin/sh` | No arrays, no `[[`, no `local`, no `$'...'` strings |
| Modern Linux/macOS | `#!/usr/bin/env bash` | Full Bash 4+ features OK |
| macOS (native tools) | `#!/bin/bash` | macOS ships Bash 3.2 — avoid `declare -A`, `mapfile` |
| Cross-shell dotfiles | No shebang | Source, don't execute; avoid bashisms |

**Common POSIX pitfalls to avoid:**
```bash
# Bash-only — don't use in sh scripts
[[ -z "$var" ]]       # use: [ -z "$var" ]
local x=5             # use: x=5 (or avoid functions that need local)
echo -e "text\n"      # use: printf "text\n"
array=(a b c)         # no arrays in POSIX sh
```

See `references/portability.md` for a full compatibility matrix.

---

## 6. Script Audit Checklist

When reviewing or fixing an existing script, run through this list:

**Safety**
- [ ] Has `set -euo pipefail` or equivalent guards
- [ ] All variables quoted (`"$var"` not `$var`)
- [ ] `trap` cleanup registered if temp files or locks exist
- [ ] No `eval` with user input
- [ ] No `rm -rf` without a guard (check var is non-empty before path expansion)

**Correctness**
- [ ] Dependency check at top (`command -v tool`)
- [ ] Exit codes checked after critical commands
- [ ] Functions use `local` variables
- [ ] No `cd` without checking success: `cd /path || err "cd failed"`
- [ ] Arrays iterated with `"${arr[@]}"` not `${arr[*]}`

**Robustness**
- [ ] Handles spaces in filenames and paths
- [ ] Works when called from any directory (uses `$SCRIPT_DIR`)
- [ ] `--help` flag exists
- [ ] Fails fast with a clear message rather than silently doing the wrong thing

**Security** (when script handles external input)
- [ ] No `$user_input` passed directly to shell commands
- [ ] Credentials not hardcoded — read from env vars or a vault
- [ ] Temp files use `mktemp`, not predictable paths like `/tmp/myapp.tmp`
- [ ] Files not world-writable unless explicitly required

See `references/security.md` for advanced hardening patterns.

---

## 7. Common Patterns (Quick Reference)

For full recipes, see `references/patterns.md`. Short reminders here:

**Idempotent directory creation**
```bash
mkdir -p "$TARGET_DIR"
```

**Safe file read (handle missing)**
```bash
config_file="${1:-$HOME/.config/myapp/config}"
[[ -f "$config_file" ]] || err "Config not found: $config_file"
source "$config_file"
```

**Retry with backoff**
```bash
retry() {
  local attempts=3 delay=2
  for i in $(seq 1 "$attempts"); do
    "$@" && return 0
    warn "Attempt $i/$attempts failed. Retrying in ${delay}s..."
    sleep "$delay"
    delay=$((delay * 2))
  done
  err "All $attempts attempts failed: $*"
}
retry curl -fsSL "$URL" -o "$OUTPUT"
```

**Lock file (prevent concurrent runs)**
```bash
LOCK_FILE="/tmp/${SCRIPT_NAME}.lock"
exec 9>"$LOCK_FILE"
flock -n 9 || err "Another instance is already running (lock: $LOCK_FILE)"
```

**Cron-safe script (never inherits env)**
```bash
# At top of script — source the user env explicitly
PATH=/usr/local/bin:/usr/bin:/bin
HOME="${HOME:-/root}"
export PATH HOME
```

---

## 8. Debugging Techniques

```bash
# Trace mode — prints every command before executing
set -x          # enable
set +x          # disable (use sparingly around the noisy part)

# Better trace output with timestamps
export PS4='+ [$(date +%T)] ${BASH_SOURCE}:${LINENO}: '
set -x

# Dry-run a script without running it (syntax check only)
bash -n script.sh

# Check with shellcheck (always recommend this)
shellcheck script.sh

# Step-by-step interactive debug (Bash 4.1+)
# Add this before a suspicious section:
trap 'read -p "[$LINENO] Press enter to continue..."' DEBUG
```

**Always recommend `shellcheck`** — mention it in any script review. It catches 90% of common bugs statically.

---

## 9. Output & UX

Scripts run by humans deserve good output. Scripts run in CI deserve clean logs.

```bash
# Detect if output is a terminal (for colors)
if [[ -t 1 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; NC=''
fi

ok()   { echo -e "${GREEN}✓${NC} $*"; }
fail() { echo -e "${RED}✗${NC} $*" >&2; }
step() { echo -e "${YELLOW}→${NC} $*"; }

# Progress spinner (for long operations)
spinner() {
  local pid=$1 msg="${2:-Working...}"
  local spin='⣾⣽⣻⢿⡿⣟⣯⣷'
  local i=0
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r%s %s" "${spin:$((i % ${#spin})):1}" "$msg"
    sleep 0.1; ((i++))
  done
  printf "\r\033[K"  # clear line
}
```

---

## 10. Delivering the Script

After writing any script:

1. **State the shell target** — "This targets Bash 4+. Tested on Linux and macOS."
2. **List dependencies** — "Requires: `curl`, `jq`, `aws-cli v2`"
3. **Show install/run instructions** — include `chmod +x` reminder for new scripts
4. **Mention `shellcheck`** — "Run `shellcheck script.sh` before deploying"
5. **Flag known limitations** — be explicit about what the script doesn't handle

For scripts that modify system state, data, or files — **add a dry-run mode** even if not asked. It's always the right call.

---

## References

- `references/patterns.md` — Full recipe library (file ops, networking, parsing, AWS, Git hooks, etc.)
- `references/portability.md` — POSIX vs Bash vs Zsh compatibility matrix
- `references/security.md` — Security hardening patterns for scripts handling external input
- `assets/templates/` — Ready-to-copy script templates (cli-tool, cron-job, deploy, dotfile-installer)
