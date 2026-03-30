#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SCRIPT:  cli-tool.sh
# PURPOSE: Template for a well-structured CLI tool with flags and subcommands
# USAGE:   ./cli-tool.sh [OPTIONS] <command> [args]
# DEPS:    (list required external tools here)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
IFS=$'\n\t'

# ── Constants ────────────────────────────────────────────────────────────────
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"
readonly VERSION="0.1.0"

# ── Colors (disabled if not a TTY) ──────────────────────────────────────────
if [[ -t 1 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
  BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; NC=''
fi

# ── Logging ──────────────────────────────────────────────────────────────────
err()  { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $*" >&2; }
info() { echo -e "${GREEN}[INFO]${NC}  $*"; }
step() { echo -e "${BLUE}  →${NC} $*"; }

# ── Dependency check ─────────────────────────────────────────────────────────
require() {
  for cmd in "$@"; do
    command -v "$cmd" &>/dev/null || err "Required command not found: $cmd"
  done
}

# ── Cleanup ──────────────────────────────────────────────────────────────────
TMP_DIR=""
cleanup() {
  local exit_code=$?
  [[ -n "$TMP_DIR" ]] && rm -rf "$TMP_DIR"
  exit "$exit_code"
}
trap cleanup EXIT INT TERM

# ── Global flags ─────────────────────────────────────────────────────────────
VERBOSE=false
DRY_RUN=false

# ── Usage ────────────────────────────────────────────────────────────────────
usage() {
  cat <<EOF
${BOLD}${SCRIPT_NAME}${NC} v${VERSION}

USAGE:
  ${SCRIPT_NAME} [OPTIONS] <command> [args]

COMMANDS:
  run       Run the main action
  status    Show current status
  clean     Remove generated files

OPTIONS:
  -h, --help       Show this help and exit
  -v, --verbose    Enable verbose output
  -n, --dry-run    Simulate actions, no changes made
  --version        Print version and exit

EXAMPLES:
  ${SCRIPT_NAME} run --input data.csv
  ${SCRIPT_NAME} --dry-run clean
EOF
}

# ── Subcommands ──────────────────────────────────────────────────────────────
cmd_run() {
  info "Running..."
  $VERBOSE && step "Verbose output enabled"

  TMP_DIR=$(mktemp -d)

  if $DRY_RUN; then
    warn "DRY RUN — no changes made"
    return
  fi

  # TODO: implement
  info "Done."
}

cmd_status() {
  info "Status: OK"
  # TODO: implement
}

cmd_clean() {
  if $DRY_RUN; then
    warn "DRY RUN — would clean generated files"
    return
  fi
  info "Cleaning..."
  # TODO: implement
}

# ── Argument parsing ─────────────────────────────────────────────────────────
main() {
  [[ $# -eq 0 ]] && { usage; exit 0; }

  # Parse global flags
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help)    usage; exit 0 ;;
      --version)    echo "$SCRIPT_NAME v$VERSION"; exit 0 ;;
      -v|--verbose) VERBOSE=true ;;
      -n|--dry-run) DRY_RUN=true ;;
      --)           shift; break ;;
      -*)           err "Unknown option: $1. Use --help for usage." ;;
      *)            break ;;
    esac
    shift
  done

  [[ $# -eq 0 ]] && err "No command given. Use --help for usage."

  local cmd="$1"; shift

  case "$cmd" in
    run)    cmd_run "$@" ;;
    status) cmd_status "$@" ;;
    clean)  cmd_clean "$@" ;;
    *)      err "Unknown command: $cmd. Use --help for usage." ;;
  esac
}

main "$@"
