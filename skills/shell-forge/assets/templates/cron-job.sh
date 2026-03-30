#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SCRIPT:  cron-job.sh
# PURPOSE: Template for a safe, observable scheduled job
# USAGE:   Designed to run via cron. Set LOG_FILE and LOCK_FILE in config.
# CRON:    0 */6 * * * /path/to/cron-job.sh >> /var/log/myjob.log 2>&1
# DEPS:    (list required tools)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
IFS=$'\n\t'

# ── Cron environment hardening ───────────────────────────────────────────────
# Cron runs with a stripped PATH — always set it explicitly
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="${HOME:-/root}"

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"

# ── Config ───────────────────────────────────────────────────────────────────
readonly LOG_DIR="${LOG_DIR:-/var/log/myapp}"
readonly LOG_FILE="${LOG_FILE:-$LOG_DIR/${SCRIPT_NAME%.sh}.log}"
readonly LOCK_FILE="/tmp/${SCRIPT_NAME%.sh}.lock"
readonly MAX_LOG_AGE_DAYS=30

# ── Logging to file ──────────────────────────────────────────────────────────
mkdir -p "$LOG_DIR"
exec >> "$LOG_FILE" 2>&1    # All output goes to log

log() {
  local level="$1"; shift
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [$SCRIPT_NAME] [$level] $*"
}

err()  { log ERROR "$*"; exit 1; }
warn() { log WARN  "$*"; }
info() { log INFO  "$*"; }

# ── Locking (prevent concurrent runs) ────────────────────────────────────────
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  warn "Another instance is running (lock held: $LOCK_FILE). Exiting."
  exit 0
fi

# ── Cleanup ──────────────────────────────────────────────────────────────────
TMP_DIR=""
cleanup() {
  local exit_code=$?
  [[ -n "$TMP_DIR" ]] && rm -rf "$TMP_DIR"
  flock -u 9
  [[ $exit_code -ne 0 ]] && warn "Job exited with code: $exit_code"
  info "─── Job finished ───────────────────────────────"
}
trap cleanup EXIT INT TERM

# ── Dependency check ─────────────────────────────────────────────────────────
require() {
  for cmd in "$@"; do
    command -v "$cmd" &>/dev/null || err "Required command not found: $cmd"
  done
}

# ── Log rotation ─────────────────────────────────────────────────────────────
rotate_logs() {
  find "$LOG_DIR" -name "*.log" -mtime "+$MAX_LOG_AGE_DAYS" -delete || true
}

# ── Main job logic ───────────────────────────────────────────────────────────
main() {
  info "─── Job started ────────────────────────────────"
  require curl jq  # replace with actual deps

  TMP_DIR=$(mktemp -d)
  rotate_logs

  # TODO: implement job logic here

  info "Job completed successfully."
}

main "$@"
