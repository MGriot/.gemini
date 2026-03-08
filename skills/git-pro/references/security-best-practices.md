# Git Security & Data Protection

Protecting credentials, keys, and personal data is a critical responsibility. Once pushed, a secret is **compromised** and must be rotated.

## 1. Prevention (First Line of Defense)

### Automated Scanning
Use modern tools to prevent secrets from ever being committed:
- **Gitleaks**: The industry standard for speed and accuracy. Run `gitleaks protect --staged` locally.
- **TruffleHog (v3)**: Highly effective for deep scanning and key verification.
- **pre-commit hooks**: Automate these checks with a `.pre-commit-config.yaml` file.

### Environment Files
Always exclude sensitive config files in `.gitignore`:
- `.env`, `.env.*`, `config/secrets.yml`
- `*.pem`, `*.key`, `*.crt` (Certificates/Keys)
- `node_modules/`, `venv/`, `__pycache__/`
- `credentials.json`, `auth.json`, `token.json`

## 2. Privacy & Identity
- **Private Email**: Use the GitHub "private email" (`ID+username@users.noreply.github.com`) to prevent scraping.
  - `git config --global user.email "your-id+username@users.noreply.github.com"`
- **Commit Signing**: Sign commits using SSH or GPG to prevent identity spoofing.
  - `git config --global commit.gpgsign true`
- **Global Ignore**: Set a global ignore file for OS/IDE junk.
  - `git config --global core.excludesfile ~/.gitignore_global`

## 3. Remediation (When a Secret Leaks)

If you accidentally commit a secret:
1. **ROTATE IMMEDIATELY**: The secret is compromised. Revoke it and generate a new one.
2. **REWRITE HISTORY**: Use **`git-filter-repo`** (modern replacement for BFG/filter-branch) to scrub the secret from all branches/tags.
   - `git filter-repo --path sensitive-file --invert-paths`
3. **DO NOT** just "add to .gitignore" after the fact; it's still in the history.

## 4. Sensitivity Checklist
Before every `git push`, ask:
- [ ] Are there any hardcoded API keys or passwords?
- [ ] Are there any unencrypted `.env` files?
- [ ] Is my real email address exposed in the logs?
- [ ] Have I included personal names/emails of clients/users?
- [ ] Are there large data files (CSV/JSON) that should stay local?
