# Advanced Git Commands

Modern Git (2024+) emphasizes specialized commands over the multi-purpose `git checkout`.

## 1. Switching Branches
- **Use `git switch`**: It's safer and clearer.
- **Switch to existing branch**: `git switch <name>`
- **Create and switch**: `git switch -c <new-branch>`
- **Switch back**: `git switch -`

## 2. Restoring Files
- **Use `git restore`**: It's specifically for undoing changes.
- **Discard unstaged changes**: `git restore <file>`
- **Unstage a file**: `git restore --staged <file>`
- **Restore from a previous commit**: `git restore --source=HEAD~2 <file>`

## 3. Simultaneous Work (Worktrees)
- **Use `git worktree`**: Avoid stashing "WIP" code just to fix an urgent bug.
- **Add worktree**: `git worktree add <path> <branch>`
  - *Example:* `git worktree add ../hotfix main`
- **List worktrees**: `git worktree list`
- **Remove worktree**: `git worktree remove <path>`

## 4. History Cleanup (Interactive Rebase)
- **Squash, Edit, or Drop commits**:
  ```powershell
  git rebase -i main
  ```
- Use `pick` to keep, `squash` (or `s`) to merge into the previous commit, `edit` (or `e`) to stop and amend, and `drop` (or `d`) to remove.
- **IMPORTANT**: Never rebase commits that have been pushed to a shared branch unless you are the only one working on it.

## 5. Emergency Recovery (Reflog)
- `git reflog` shows every action you've taken (even deleted commits).
- If you lose a commit: Find the hash in `reflog` and run `git switch -c recovery-branch <hash>`.

## 6. Maintenance & Pruning
- `git remote prune origin`: Remove stale remote tracking branches.
- `git gc`: Manual garbage collection (git usually handles this automatically).
- `git maintenance run`: Run manual maintenance tasks.
