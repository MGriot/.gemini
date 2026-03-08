# Git Bisect Workflow

`git bisect` is the fastest way to find a regression. It uses binary search through the commit history to find the "first bad commit."

## 1. Reproduce the Failure
- **Verify**: Confirm the bug is present in the current branch.
- **Find a Good State**: Locate a past commit where the feature worked. Use `git checkout <hash>` or `git switch <hash>` and test to verify.

## 2. Initialize Bisect
```powershell
git bisect start
git bisect bad                 # Current version is bad
git bisect good <commit_id>    # The known good version
```

## 3. The Iterative Process
Git will check out a commit in the middle. You must determine if it's "good" or "bad."

### A. Manual (For UI or hard-to-automate bugs)
For each step git checks out:
1. Run the reproduction steps.
2. If it fails: `git bisect bad`.
3. If it passes: `git bisect good`.
4. If it won't build: `git bisect skip`.

### B. Automated (PREFERRED)
If you can write a script (Python, JS, Shell) that exits with:
- `0`: Good
- `1` to `124` (inclusive), `126`, or `127`: Bad
- `125`: Skip (could not be tested)

Run: `git bisect run <command_to_run_script>`
- *Example:* `git bisect run python test_bug.py`
- *Example:* `git bisect run npm test`

## 4. Finality
Once identified, git will print the details of the first bad commit.
**ALWAYS** cleanup after you are done:
```powershell
git bisect reset
```

## Tips
- **Temp Branch**: Bisect on a temporary branch to avoid messing up your feature branch's state.
- **Verification Script**: Spend time making the verification script robust to avoid false results.
- **Reflog**: If you get lost, use `git reflog` to find where you were.
