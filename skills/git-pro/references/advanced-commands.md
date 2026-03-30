# Advanced Git Commands

Modern Git (2024+) provides focused, purpose-built commands. Prefer these over the overloaded `git checkout`.

---

## 1. Switching Branches — `git switch`

```bash
git switch <branch-name>          # Switch to existing branch
git switch -c <new-branch>        # Create and switch in one step
git switch -                      # Return to the previous branch
git switch --orphan <name>        # Create a branch with no history (e.g., for gh-pages)
```

> **Never use `git checkout <branch>`** for branch navigation in new scripts — it's ambiguous and error-prone.

---

## 2. Restoring Files — `git restore`

```bash
git restore <file>                       # Discard unstaged changes (replaces from index)
git restore --staged <file>              # Unstage a file (keep working-tree changes)
git restore --staged --worktree <file>   # Fully undo: unstage AND discard changes
git restore --source=HEAD~2 <file>       # Restore file to the state from 2 commits ago
git restore --source=<hash> <file>       # Restore from any specific commit
```

> **Never use `git checkout -- <file>`** — `git restore` is explicit and safer.

---

## 3. Simultaneous Work — `git worktree`

Avoid stashing "WIP" code just to fix an urgent bug. Check out a second branch into a sibling directory instead.

```bash
# Add a new worktree pointing to an existing or new branch
git worktree add <path> <branch>
git worktree add ../hotfix main        # Example: main → ../hotfix

# Create a new branch directly in the worktree
git worktree add -b fix/urgent ../hotfix main

# List all active worktrees
git worktree list

# Remove a worktree when done (branch must be merged/deleted first)
git worktree remove <path>
git worktree prune                     # Clean up stale worktree metadata
```

**Typical workflow:**
```bash
# You are mid-feature; urgent bug reported
git worktree add ../hotfix main && cd ../hotfix
git switch -c fix/critical-login-bug
# … fix, commit, push, open PR …
cd - && git worktree remove ../hotfix
```

---

## 4. History Cleanup — Interactive Rebase

```bash
git rebase -i main            # Rebase current branch onto main, open editor
git rebase -i HEAD~4          # Edit the last 4 commits only
```

**Editor actions:**

| Action | Shortcut | Effect |
|---|---|---|
| `pick` | `p` | Keep commit as-is |
| `reword` | `r` | Keep commit, edit message |
| `edit` | `e` | Pause to amend commit contents |
| `squash` | `s` | Merge into previous commit (combine messages) |
| `fixup` | `f` | Merge into previous commit (discard this message) |
| `drop` | `d` | Delete the commit entirely |

**After rebase, push safely:**
```bash
git push --force-with-lease   # Aborts if someone else pushed; safer than --force
```

> ⚠️ **Never rebase commits already on a shared/remote branch** unless you are the sole contributor.

---

## 5. Emergency Recovery — `git reflog`

`git reflog` records every `HEAD` movement, including deleted commits and reset operations.

```bash
git reflog                              # Show full history of HEAD positions
git reflog show <branch>                # Show reflog for a specific branch
git switch -c recovery/<hash> <hash>   # Restore a "lost" commit to a new branch
git reset --hard HEAD@{3}              # Jump HEAD back to 3 positions ago
```

---

## 6. Maintenance & Pruning

```bash
git remote prune origin    # Remove stale remote-tracking branches (after merges)
git fetch --prune          # Fetch + prune in one command (preferred)
git gc                     # Manual garbage collection (rarely needed; git auto-runs this)
git maintenance run        # Run full maintenance suite (packing, loose objects, etc.)
git clean -fd              # Remove untracked files and directories (dry-run: -fdn)
```
