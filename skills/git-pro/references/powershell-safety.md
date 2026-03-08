# PowerShell Git Safety

PowerShell handles chaining and variables differently than Bash. Follow these patterns to ensure reliable git execution.

## 1. Chaining Commands
- **NEVER use `&&`**: PowerShell (pre-v7) does not support it.
- **Use `;` for simple sequencing**: `git add .; git status`
- **Use `if ($?)` for conditional execution**:
  ```powershell
  git add .; if ($?) { git commit -m "..." }
  ```
- **Prefer separate `run_shell_command` calls**: This allows for better error checking and feedback between steps.

## 2. Environment & Variables
- Use `$env:VARIABLE` for environment variables.
- Use `"` for strings with variables, `'` for literal strings.
- Be careful with pipes (`|`) when using `git log` or `git status` as PowerShell might interpret the output as objects.

## 3. Lock Files
- If a command fails with `Another git process seems to be running in this repository`, it's likely an `index.lock` issue.
- **Do not manually delete `index.lock`** unless you are certain no git process is running.
- **Wait and retry**: Often, a background process (like an IDE or git GUI) is temporarily using it.

## 4. Quoting
- PowerShell requires careful quoting of arguments that contain special characters (like `*`, `?`, `[`, `]`).
- Example: `git log --grep="feat:"` (Double quotes are generally safer for git flags in PowerShell).
