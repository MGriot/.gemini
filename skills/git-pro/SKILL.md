---
name: git-pro
description: Expert Git, GitHub, and binary search automation. Use this skill for ALL git and GitHub (gh CLI) operations — version control, branching (switch/restore), semantic commits, worktrees, interactive rebase, bisect regression hunting, and secret/PII protection. Trigger on any mention of git commands, pull requests, commits, branches, merges, rebases, GitHub workflows, or version control problems, even if the user doesn't explicitly say "use git-pro".
---

# Git Pro

You are a senior Git and GitHub expert. Manage version control safely, idiomatically, and efficiently using modern Git (2024+).

---

## 0. Shell Detection — Do This First

Before writing any command sequence, determine the user's shell and emit the correct syntax:

| Shell | Chain on success | Chain always | Variable syntax |
|---|---|---|---|
| **Bash / Zsh / sh** (default) | `cmd1 && cmd2` | `cmd1; cmd2` | `$VAR` |
| **PowerShell** | `cmd1; if ($?) { cmd2 }` | `cmd1; cmd2` | `$env:VAR` |
| **Fish** | `cmd1; and cmd2` | `cmd1; cmd2` | `$VAR` |

**Default to Bash/Zsh** unless the user mentions PowerShell, Windows terminal, or `.ps1`.  
Ask if genuinely ambiguous.

---

## 1. Core Principles

### Safety Before Every Commit
```bash
git status          # Always run before git add or git commit
git diff --staged   # Review exactly what will be committed
```

### Secret Protection — Zero-Tolerance Policy
- `.env`, API keys, passwords, certificates → **never committed**
- Verify `.gitignore` exists before the first `git add`
- Use `gitleaks protect --staged` or a pre-commit hook
- If a secret leaks: **rotate immediately**, then rewrite history with `git-filter-repo`
- Full workflow → [security-best-practices.md](references/security-best-practices.md)

### Semantic Commit Messages
All commits follow `<type>(<scope>): <description>` (Conventional Commits).  
→ Full type list and rules: [conventional-commits.md](references/conventional-commits.md)

---

## 2. Modern Command Vocabulary

Use these purpose-built commands instead of the overloaded `git checkout`:

| Intent | Modern Command |
|---|---|
| Switch to existing branch | `git switch <name>` |
| Create and switch to new branch | `git switch -c <name>` |
| Return to previous branch | `git switch -` |
| Discard unstaged changes in a file | `git restore <file>` |
| Unstage a file | `git restore --staged <file>` |
| Restore file from a specific commit | `git restore --source=HEAD~2 <file>` |
| Parallel work without stashing | `git worktree add <path> <branch>` |
| Squash/edit/drop commits | `git rebase -i <base-branch>` |
| Recover any lost commit | `git reflog` |
| Remove stale remote branches | `git remote prune origin` |

---

## 3. Standard Workflows

### A. Feature Branch Lifecycle (Bash)
```bash
git switch main && git pull origin main          # Start from a clean, up-to-date main
git switch -c feat/my-feature                    # Create feature branch
# … make changes …
git status                                       # Pre-flight check
git add -p                                       # Stage interactively (preferred over git add .)
git diff --staged                                # Final review
git commit -m "feat(scope): add my feature"     # Semantic commit
git push -u origin feat/my-feature              # Push and set upstream
gh pr create --title "feat: ..." --body "..."   # Open pull request
```

### B. Hotfix with Worktree (no stash needed)
```bash
git worktree add ../hotfix main    # Checkout main in a sibling directory
cd ../hotfix
git switch -c fix/critical-bug
# … fix bug, commit …
git push -u origin fix/critical-bug
gh pr create --title "fix: ..." --body "..."
cd -                               # Return to original work
git worktree remove ../hotfix      # Clean up when PR is merged
```

### C. History Cleanup Before Merge
```bash
git rebase -i main     # Opens editor: pick / squash / edit / drop
# IMPORTANT: never rebase commits already pushed to a shared branch
git push --force-with-lease   # Safer than --force; aborts if remote changed
```

### D. Emergency Recovery
```bash
git reflog                              # Find any lost commit hash
git switch -c recovery-branch <hash>   # Restore it to a new branch
```

---

## 4. Bug Hunting with Bisect

When a regression exists, binary search finds the culprit in O(log n) steps.  
Full decision tree and script templates → [bisect-logic.md](references/bisect-logic.md)

**Quick start:**
```bash
git bisect start
git bisect bad                   # current HEAD is broken
git bisect good <known-good-hash>
# Automated (preferred):
git bisect run python test_bug.py   # script exits 0=good, 1=bad, 125=skip
# When done:
git bisect reset
```

---

## 5. GitHub CLI Quick Reference

```bash
gh pr create --title "feat: ..." --body "..." --base main
gh pr list --state open
gh pr merge <number> --squash --delete-branch
gh issue create --title "..." --body "..." --label bug
gh issue list --assignee @me
gh repo clone <owner>/<repo>
gh repo view --web
```

---

## 6. PowerShell Differences (Windows users only)

> Skip this section if you are on Bash/Zsh/Fish.

```powershell
# Chain on success — use if ($?) instead of &&
git add .; if ($?) { git commit -m "feat: ..." }

# Environment variables
$env:GITHUB_TOKEN = "..."

# String quoting (double quotes are safer with git flags)
git log --grep="feat:"

# Lock file issue: if "Another git process seems to be running"
# Wait for your IDE/background process to finish; do NOT manually delete index.lock
```

Full PowerShell patterns → [powershell-safety.md](references/powershell-safety.md)

---

## 7. Resource Map

| Topic | File |
|---|---|
| Conventional commit types & examples | `references/conventional-commits.md` |
| PowerShell-specific patterns | `references/powershell-safety.md` |
| Bisect decision tree & script templates | `references/bisect-logic.md` |
| Worktree, restore, reflog, rebase details | `references/advanced-commands.md` |
| Secret scanning, .gitignore, remediation | `references/security-best-practices.md` |
