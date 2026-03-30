#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SCRIPT:  deploy.sh
# PURPOSE: Zero-downtime deployment with rollback support
# USAGE:   ./deploy.sh [--env staging|production] [--dry-run]
# DEPS:    git, rsync (or aws cli for S3 deploys)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"
readonly DEPLOY_TS=$(date +%Y%m%d_%H%M%S)

# ── Colors ───────────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; NC=''
fi

err()  { echo -e "${RED}[DEPLOY ERROR]${NC} $*" >&2; exit 1; }
warn() { echo -e "${YELLOW}[DEPLOY WARN]${NC}  $*" >&2; }
info() { echo -e "${GREEN}[DEPLOY]${NC} $*"; }
step() { echo -e "${BLUE}  [$((++STEP_NUM))]${NC} $*"; }
STEP_NUM=0

# ── Cleanup & rollback ───────────────────────────────────────────────────────
ROLLBACK_NEEDED=false
PREV_RELEASE=""

rollback() {
  warn "Deployment failed. Rolling back to: ${PREV_RELEASE:-none}"
  if [[ -n "$PREV_RELEASE" ]]; then
    # TODO: implement rollback specific to your deploy strategy
    warn "Rollback: restoring $PREV_RELEASE"
  fi
}

cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]] && $ROLLBACK_NEEDED; then
    rollback
  fi
}
trap cleanup EXIT

# ── Config ───────────────────────────────────────────────────────────────────
ENV="staging"
DRY_RUN=false
SKIP_TESTS=false

# ── Args ─────────────────────────────────────────────────────────────────────
usage() {
  cat <<EOF
Usage: $SCRIPT_NAME [OPTIONS]

Options:
  --env <env>      Target environment: staging|production (default: staging)
  --dry-run        Simulate deployment without making changes
  --skip-tests     Skip pre-deploy test run (not recommended)
  -h, --help       Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)         ENV="$2"; shift ;;
    --dry-run)     DRY_RUN=true ;;
    --skip-tests)  SKIP_TESTS=true ;;
    -h|--help)     usage; exit 0 ;;
    *)             err "Unknown argument: $1" ;;
  esac
  shift
done

[[ "$ENV" =~ ^(staging|production)$ ]] || err "Invalid env: $ENV. Must be staging or production."

# ── Pre-flight ───────────────────────────────────────────────────────────────
preflight() {
  step "Pre-flight checks"

  command -v git &>/dev/null || err "git not found"

  local git_status
  git_status=$(git status --porcelain)
  [[ -z "$git_status" ]] || warn "Uncommitted changes detected:\n$git_status"

  PREV_RELEASE=$(git rev-parse HEAD)
  info "Current commit: $PREV_RELEASE"
  info "Target env: ${ENV}"
  $DRY_RUN && warn "DRY RUN MODE — no actual changes will be made"
}

# ── Tests ────────────────────────────────────────────────────────────────────
run_tests() {
  $SKIP_TESTS && { warn "Skipping tests (--skip-tests flag set)"; return; }
  step "Running tests"
  # TODO: replace with your test command
  make test || err "Tests failed — deployment aborted"
  info "Tests passed."
}

# ── Build ────────────────────────────────────────────────────────────────────
build() {
  step "Building"
  $DRY_RUN && { info "[DRY RUN] Would build here"; return; }
  # TODO: replace with your build command
  # make build
  info "Build complete."
}

# ── Deploy ───────────────────────────────────────────────────────────────────
deploy() {
  step "Deploying to $ENV"
  ROLLBACK_NEEDED=true

  $DRY_RUN && { info "[DRY RUN] Would deploy here"; ROLLBACK_NEEDED=false; return; }

  # TODO: implement your deploy strategy
  # e.g., rsync, S3 sync, kubectl apply, systemctl restart, etc.

  ROLLBACK_NEEDED=false
  info "Deploy complete."
}

# ── Smoke test ───────────────────────────────────────────────────────────────
smoke_test() {
  step "Smoke test"
  $DRY_RUN && { info "[DRY RUN] Would smoke test here"; return; }

  # TODO: ping health endpoint or run basic sanity checks
  # curl -fsS "https://$ENV.example.com/health" | jq -e '.status == "ok"'

  info "Smoke test passed."
}

# ── Main ─────────────────────────────────────────────────────────────────────
main() {
  info "═══ Deploy started · $DEPLOY_TS ══════════════════"
  preflight
  run_tests
  build
  deploy
  smoke_test
  info "═══ Deploy finished successfully ═════════════════"
  info "Release: $(git rev-parse HEAD)"
}

main
