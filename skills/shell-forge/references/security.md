# Shell Security Hardening

> Load this file when the script handles user input, credentials, network data,
> web requests, file uploads, or runs with elevated privileges.

## The Core Threats

| Threat | Example | Mitigation |
|---|---|---|
| Command injection | `eval "echo $user_input"` | Never eval user input; use arrays |
| Path traversal | `cat "/data/$user_file"` | Validate and sanitize paths |
| Predictable temp files | `/tmp/myapp.tmp` | Always use `mktemp` |
| Credential leakage | `curl -u user:$PASS "$URL"` | Use `-u user:$(cat passfile)` or netrc |
| World-readable secrets | `echo "$SECRET" > config` | Use `umask 077` before writing |
| Race condition (TOCTOU) | `[ -f "$f" ] && rm "$f"` | Use atomic ops; avoid check-then-act |
| Wildcard injection | `rm -rf $DIR/*` | Quote; check var is set and non-empty |

---

## Input Validation

### Validate before using
```bash
# Only allow alphanumeric + dash + underscore in identifiers
validate_id() {
  local input="$1"
  [[ "$input" =~ ^[A-Za-z0-9_-]+$ ]] || err "Invalid identifier: $input"
  echo "$input"
}

# Validate a file path doesn't escape a base directory
validate_path() {
  local base="$1" path="$2"
  local real_base real_path
  real_base=$(realpath "$base")
  real_path=$(realpath "$base/$path")
  [[ "$real_path" == "$real_base"* ]] || err "Path traversal detected: $path"
  echo "$real_path"
}
```

### Never use `eval` with external input
```bash
# DANGEROUS
eval "process $user_input"

# SAFE: use arrays to pass arguments
args=()
args+=("--name" "$user_name")
args+=("--file" "$user_file")
process "${args[@]}"
```

---

## Secrets Management

### Never hardcode credentials
```bash
# BAD
API_KEY="sk-abc123hardcoded"

# GOOD: read from environment
API_KEY="${API_KEY:?API_KEY must be set in environment}"

# GOOD: read from file (permissions: 600)
API_KEY=$(cat "$HOME/.secrets/api_key")

# GOOD: use a secrets manager
API_KEY=$(aws secretsmanager get-secret-value \
  --secret-id myapp/api-key \
  --query SecretString --output text)
```

### Mask secrets in logs
```bash
# Mask when printing env for debugging
debug_env() {
  env | grep -v -E '(KEY|SECRET|TOKEN|PASS|PWD|CRED)' | sort
}
```

### Credentials in curl
```bash
# BAD: appears in process list
curl -u "user:$PASSWORD" https://api.example.com

# GOOD: use netrc or stdin
curl --netrc-file "$HOME/.netrc" https://api.example.com

# GOOD: use header file (not visible in ps)
printf "Authorization: Bearer %s\n" "$TOKEN" > "$TMP_DIR/headers"
curl -H "@$TMP_DIR/headers" https://api.example.com
```

---

## File Permission Hardening

```bash
# Set restrictive umask before creating any sensitive files
umask 077   # Only owner can read/write new files

# Explicitly set permissions after creation
chmod 600 "$config_file"   # owner read/write only
chmod 700 "$secret_dir"    # owner can enter; others cannot

# Check before trusting a file
if [[ "$(stat -c %a "$config_file")" != "600" ]]; then
  err "Config file has insecure permissions. Run: chmod 600 $config_file"
fi
```

---

## Temp File Safety

```bash
# UNSAFE: predictable name, race condition
tmpfile=/tmp/myapp.tmp

# SAFE: mktemp creates with O_EXCL (atomic, unpredictable name)
tmpfile=$(mktemp)
tmpdir=$(mktemp -d)

# Always clean up in trap
trap 'rm -f "$tmpfile"; rm -rf "$tmpdir"' EXIT
```

---

## Privilege Escalation

```bash
# Drop privileges as early as possible
drop_privs() {
  local user="${1:-nobody}"
  [[ "$(id -u)" -eq 0 ]] || return 0   # Already not root
  exec su -s /bin/sh -c "$0 $*" "$user"
}

# Check if root is required
require_root() {
  [[ "$(id -u)" -eq 0 ]] || err "This script must be run as root"
}

# Avoid running as root when not needed
refuse_root() {
  [[ "$(id -u)" -ne 0 ]] || err "This script must NOT be run as root"
}
```

---

## Safe rm Patterns

```bash
# Guard against empty variable expanding to rm -rf /
safe_rm() {
  local path="$1"
  [[ -n "$path" ]] || err "safe_rm: path is empty"
  [[ "$path" != "/" ]] || err "safe_rm: refusing to remove /"
  [[ "$path" != "/home" ]] || err "safe_rm: refusing to remove /home"
  rm -rf "$path"
}

# Always use -- to prevent paths starting with - being treated as flags
rm -- "$file"
```
