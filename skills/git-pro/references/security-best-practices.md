# Git Security & Data Protection

A secret committed to a repository is **immediately compromised** — even if you delete it in the next commit. History is permanent until actively rewritten.

---

## 1. Prevention — First Line of Defense

### Automated Pre-Commit Scanning

Install at least one of these tools:

```bash
# Gitleaks — industry standard; fast, accurate
brew install gitleaks                   # macOS
# or: https://github.com/gitleaks/gitleaks/releases

gitleaks protect --staged              # Scan staged files before commit
gitleaks detect --source .             # Full repo scan

# TruffleHog v3 — deep scan with live key verification
pip install trufflehog
trufflehog git file://. --only-verified
```

**Automate via pre-commit hooks (`.pre-commit-config.yaml`):**
```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.2      # pin to a specific version
    hooks:
      - id: gitleaks
```
```bash
pip install pre-commit && pre-commit install   # Install hooks into this repo
```

---

## 2. `.gitignore` — What to Always Exclude

Add these patterns to every project's `.gitignore`:

```gitignore
# Secrets & credentials
.env
.env.*
!.env.example          # Allow the example/template
config/secrets.yml
credentials.json
auth.json
token.json
*.pem
*.key
*.crt
*.p12
*.pfx

# Dependency caches
node_modules/
venv/
.venv/
__pycache__/
.mypy_cache/

# Build output
dist/
build/
*.egg-info/

# OS / IDE junk
.DS_Store
Thumbs.db
.idea/
.vscode/settings.json   # Allow .vscode/ but ignore personal settings
```

**Set a global ignore file:**
```bash
git config --global core.excludesfile ~/.gitignore_global
# Add OS/IDE patterns there so you never need to add them per-repo
```

---

## 3. Privacy & Identity

```bash
# Use GitHub's private no-reply email (prevents address scraping from git log)
git config --global user.email "123456+username@users.noreply.github.com"
# Find your ID at: https://github.com/settings/emails

# Sign commits with SSH (simpler than GPG, equally secure)
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true

# Verify a signed commit
git log --show-signature -1
```

---

## 4. Remediation — When a Secret Leaks

> **Act in this exact order. Speed matters.**

### Step 1 — Rotate the secret immediately
Revoke the leaked key/token/password in the relevant service dashboard *before* anything else. Assume it has already been scraped.

### Step 2 — Rewrite history with `git-filter-repo`
`git-filter-repo` is the official, modern replacement for BFG and `git filter-branch`.

```bash
pip install git-filter-repo

# Remove a specific file from all history
git filter-repo --path secrets.env --invert-paths

# Remove a specific string pattern from all files in history
git filter-repo --replace-text <(echo 'ACTUAL_SECRET_VALUE==>REDACTED')

# After rewriting, force-push all branches
git push origin --force --all
git push origin --force --tags
```

> ⚠️ All collaborators must re-clone or re-fetch after a force-push to rewritten history.

### Step 3 — Rotate again
After the history is clean, rotate a second time in case the first rotation was compromised.

### Common Mistakes to Avoid
| ❌ Wrong | ✅ Right |
|---|---|
| Add the file to `.gitignore` after the commit | Rewrite history with `git-filter-repo` |
| `git rm --cached` the file and commit | Same — the old commit still has it |
| Assume a private repo is safe | Rotate anyway; access control can change |

---

## 5. Pre-Push Checklist

Run through this before every `git push`:

- [ ] `git diff origin/main..HEAD` — scan the diff for hardcoded values
- [ ] No `.env` or secret files appear in `git status`
- [ ] `gitleaks protect --staged` (or equivalent) passed
- [ ] No real email in `git log --format="%ae" -5`
- [ ] No PII (client names, emails, addresses) in large data files being pushed
- [ ] Any large CSV/JSON files that should stay local are in `.gitignore`
