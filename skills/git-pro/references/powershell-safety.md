# PowerShell Git Safety

> **This file is PowerShell-specific.** If you are on Bash, Zsh, or Fish, use `&&` for conditional chaining normally — these restrictions do not apply.

PowerShell handles command chaining and variables differently from POSIX shells. Follow these patterns for reliable git execution on Windows.

---

## 1. Command Chaining

| Goal | Bash/Zsh | PowerShell |
|---|---|---|
| Run always (sequence) | `cmd1; cmd2` | `cmd1; cmd2` |
| Run cmd2 only if cmd1 succeeds | `cmd1 && cmd2` | `cmd1; if ($?) { cmd2 }` |
| Run cmd2 only if cmd1 fails | `cmd1 \|\| cmd2` | `cmd1; if (-not $?) { cmd2 }` |

> **Never use `&&` in PowerShell 5.x** — it is not a supported operator and will throw a parse error.  
> PowerShell 7+ does support `&&` and `||`, but `if ($?)` is safer for cross-version scripts.

**Practical examples:**
```powershell
# Stage and commit only if staging succeeds
git add .; if ($?) { git commit -m "feat(auth): add jwt validation" }

# Pull, then push only if pull succeeded
git pull origin main; if ($?) { git push origin feat/my-feature }

# Preferred: separate calls so each result can be checked individually
git add .
git status        # Review before committing
git commit -m "fix(ui): correct mobile alignment"
```

---

## 2. Environment Variables

```powershell
# Set for the current session
$env:GITHUB_TOKEN = "ghp_..."
$env:GIT_AUTHOR_NAME = "Jane Doe"

# Read in a command
git config --global user.email $env:GIT_EMAIL

# Unset
Remove-Item Env:GITHUB_TOKEN
```

---

## 3. String Quoting

PowerShell distinguishes double quotes (interpolated) from single quotes (literal):

```powershell
# Double quotes — variables are expanded
git commit -m "feat: add $featureName"

# Single quotes — literal, no expansion
git log --grep='feat:'

# Escape inner quotes with backtick or nested quotes
git log --format="%H %s"   # works fine
git log --grep="fix(ui)"   # double quotes are generally safer for git flags
```

---

## 4. Handling `index.lock` Errors

If you see:
```
fatal: Unable to create '.git/index.lock': File exists.
Another git process seems to be running in this repository.
```

**Do:**
1. Wait 10–30 seconds — your IDE, a background git process, or an antivirus scan may be using the repo.
2. Close git GUIs or IDE git panels temporarily.
3. Retry the command.

**Do NOT manually delete `index.lock`** unless you are 100% certain no git process is running — doing so while a process is active corrupts the index.

If you are certain no process is running:
```powershell
Remove-Item .git\index.lock
```

---

## 5. Pipes and Output Parsing

PowerShell pipes objects, not text. This occasionally causes issues with git's text output:

```powershell
# Safe: capture as a string first
$status = git status --short | Out-String

# Safe: pipe to string cmdlets
git log --oneline -10 | Select-String "feat"

# If you need to pass git output to another git command, use $() subshell
git rebase -i (git merge-base HEAD main)
```
