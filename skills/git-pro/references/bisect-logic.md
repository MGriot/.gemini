# Git Bisect Workflow

`git bisect` finds the exact commit that introduced a regression using binary search — O(log n) steps through your history.

---

## 1. Reproduce the Failure

Before starting:
- Confirm the bug is present on the current branch (`HEAD`).
- Find a commit where the feature definitely worked (check tags, release notes, or `git log`).

```bash
# Verify a past commit state without leaving a detached HEAD mess
git log --oneline -20              # Scan recent history for a likely good point
git switch --detach <hash>         # Safely detach to inspect an old commit
# … test …
git switch -                       # Return to your branch immediately after
```

---

## 2. Initialize Bisect

```bash
git bisect start
git bisect bad                     # HEAD (current) is broken
git bisect good <commit-hash>      # The last known-good commit
```

Git will immediately check out the midpoint commit and print something like:
```
Bisecting: 23 revisions left to test after this (roughly 5 steps)
```

---

## 3. The Iterative Loop

Git checks out a commit in the middle. Evaluate it, then tell git the result.

### A. Manual (for UI bugs or hard-to-automate checks)

For each commit git presents:
```bash
# Run your reproduction steps, then:
git bisect good    # Bug is NOT present at this commit
git bisect bad     # Bug IS present at this commit
git bisect skip    # Cannot determine (build failure, flaky test, etc.)
```

### B. Automated — Preferred

Write a script that exits with:
- `0` → good (bug absent)
- `1`–`124`, `126`, or `127` → bad (bug present)
- `125` → skip (untestable commit)

```bash
git bisect run <command>
```

**Examples:**
```bash
git bisect run python scripts/test_bug.py
git bisect run npm test -- --testNamePattern="login regression"
git bisect run bash scripts/check_regression.sh
git bisect run go test ./... -run TestLoginFlow
```

**Minimal script template (`scripts/check_regression.sh`):**
```bash
#!/usr/bin/env bash
set -e                       # exit 1 on any error (signals "bad" to bisect)

# Build step — if this fails, the commit is untestable
make build 2>/dev/null || exit 125

# Run the specific test that catches the regression
python -m pytest tests/test_login.py -q
# pytest exits 0 on pass, 1 on failure — perfect for bisect
```

---

## 4. Finalize

When the culprit is found, git prints its full details:
```
<hash> is the first bad commit
Author: ...
Date:   ...
    commit message
```

**Always clean up:**
```bash
git bisect reset     # Returns HEAD to where you started, exits bisect mode
```

---

## 5. Tips

| Tip | Details |
|---|---|
| **Use a temp branch** | `git switch -c bisect/investigation` before starting, to keep your feature branch clean |
| **Robust scripts win** | Flaky tests produce `skip` churn and waste steps — fix the test harness first |
| **Tag your good commit** | `git tag known-good-v1.4.2` so you can re-bisect quickly if needed |
| **Reflog rescue** | If you get lost mid-bisect, `git reflog` shows every step so you can recover |
| **Limit the range** | `git bisect start HEAD v1.4.2` scopes the search to commits between HEAD and the tag |
