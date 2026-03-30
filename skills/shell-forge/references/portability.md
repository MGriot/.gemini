# Shell Portability Reference

> Load this file when the user asks about cross-platform scripts, POSIX compatibility,
> macOS vs Linux differences, or "make this work on Alpine/BusyBox".

## Compatibility Matrix

| Feature | POSIX sh | Bash 3.2 (macOS) | Bash 4+ (Linux) | Zsh 5+ |
|---|:---:|:---:|:---:|:---:|
| `[[ ]]` tests | ❌ | ✅ | ✅ | ✅ |
| Arrays `arr=()` | ❌ | ✅ | ✅ | ✅ |
| Associative arrays | ❌ | ❌ | ✅ | ✅ |
| `local` in functions | ⚠️ | ✅ | ✅ | ✅ |
| `<<<` herestring | ❌ | ✅ | ✅ | ✅ |
| Process substitution `<()` | ❌ | ✅ | ✅ | ✅ |
| `mapfile` / `readarray` | ❌ | ❌ | ✅ | ❌ |
| `${var,,}` lowercase | ❌ | ❌ | ✅ | ❌ |
| `$'...'` escape strings | ❌ | ✅ | ✅ | ✅ |
| `declare -A` (assoc) | ❌ | ❌ | ✅ | ✅ |
| `source` (not `.`) | ❌ | ✅ | ✅ | ✅ |
| `set -o pipefail` | ❌ | ✅ | ✅ | ✅ |

⚠️ = technically works but not in POSIX spec

---

## macOS-Specific Gotchas

macOS ships with **Bash 3.2** (GPL2 license limitation). Many Linux scripts break silently.

```bash
# Check which bash you're running
bash --version   # macOS: GNU bash, version 3.2.57

# macOS users can install modern bash:
brew install bash
# Then use: #!/usr/local/bin/bash (or /opt/homebrew/bin/bash on M1)
```

### BSD vs GNU coreutils differences

| Command | GNU (Linux) | BSD (macOS) | Fix |
|---|---|---|---|
| `sed -i ''` | `sed -i ''` (error) | `sed -i '' 's/a/b/'` | Use `sed -i.bak` on both |
| `date -d "yesterday"` | ✅ | ❌ | `date -v-1d` on macOS |
| `stat -c %s file` | ✅ | ❌ | `stat -f %z file` on macOS |
| `readlink -f` | ✅ | ❌ | `greadlink -f` (brew coreutils) |
| `timeout` | ✅ | ❌ | `gtimeout` (brew coreutils) |
| `sort --parallel` | ✅ | ❌ | Remove flag |
| `xargs -r` (no-run-if-empty) | ✅ | ignored | No portable equivalent |

### Cross-platform `sed` edit-in-place
```bash
# Portable: always pass a backup suffix (even empty string differs by OS)
if [[ "$(uname)" == "Darwin" ]]; then
  sed -i '' 's/old/new/g' file
else
  sed -i 's/old/new/g' file
fi

# Better: use perl for truly portable in-place edits
perl -pi -e 's/old/new/g' file
```

### Cross-platform `date`
```bash
# Portable: use Python for date arithmetic
yesterday() {
  python3 -c "from datetime import date, timedelta; print(date.today() - timedelta(1))"
}
```

---

## Alpine / BusyBox Constraints

Alpine uses BusyBox for most utilities — lighter but missing many GNU options.

Common pitfalls on Alpine:
- `bash` may not be installed — default shell is `ash`
- No `{` brace expansion in `sh`
- `wget` instead of `curl` (or install curl explicitly)
- `grep -P` (PCRE) not available — use `-E` (ERE) instead
- `awk` is mawk/gawk-lite — avoid gawk-specific functions

```dockerfile
# If your script needs bash on Alpine:
RUN apk add --no-cache bash
```

---

## Writing Truly Portable Scripts (POSIX sh)

```bash
#!/bin/sh
# ── Things to avoid in POSIX sh ──────────────────────────────────────────────

# Use [ ] not [[ ]]
[ "$var" = "value" ]  # ✅
[[ "$var" == "value" ]]  # ❌

# Use printf not echo -e
printf "line1\nline2\n"  # ✅
echo -e "line1\nline2"   # ❌ (echo -e is not POSIX)

# Use . not source
. ./lib.sh  # ✅
source ./lib.sh  # ❌

# No process substitution — use temp files
tmpfile=$(mktemp)
get_data > "$tmpfile"
process < "$tmpfile"
rm -f "$tmpfile"

# No arrays — use positional params or IFS-separated strings
set -- alpha beta gamma
for item in "$@"; do echo "$item"; done
```
