# PowerShell Git Safety

## The `&&` Operator Problem
Older PowerShell versions (5.1 and below) DO NOT support `&&` for command chaining.
- **Error:** `The token '&&' is not a valid statement separator in this version.`
- **Solution:** Use `;` for sequential execution or `$?` for conditional execution.

## Idiomatic PowerShell Git Patterns

### 1. Conditional Commit
```powershell
git add .
if ($?) { git commit -m "feat: safe commit" }
```

### 2. Simple Chaining (Unsafe if first fails, but accepted for trivial tasks)
```powershell
git add .; git commit -m "wip"
```

### 3. Push with Upstream
```powershell
git push -u origin (git branch --show-current)
```

### 4. Stashing
```powershell
git stash push -m "temp backup"
```
