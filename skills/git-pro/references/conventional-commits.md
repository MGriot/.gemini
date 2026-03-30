# Conventional Commits

All commit messages must follow this structure:

```
<type>(<scope>): <description>

[optional body]

[optional footer: BREAKING CHANGE: ..., Closes #123]
```

---

## Types

| Type | When to use |
|---|---|
| `feat` | A new feature visible to the end user |
| `fix` | A bug fix |
| `docs` | Documentation only (README, comments, JSDoc) |
| `style` | Formatting, whitespace — no logic change |
| `refactor` | Code restructure that neither fixes a bug nor adds a feature |
| `perf` | A performance improvement |
| `test` | Adding or correcting tests |
| `build` | Build system or external dependency changes (webpack, npm, pip) |
| `ci` | CI/CD configuration (GitHub Actions, CircleCI, etc.) |
| `chore` | Maintenance tasks that don't touch src or test files |
| `revert` | Reverts a previous commit (`revert: feat(auth): add jwt validation`) |

---

## Rules

- **Imperative mood** — `add`, not `added` or `adds`
- **Lowercase** — description is lowercase; no trailing period
- **Scope is optional** — use the module, file, or domain affected (`auth`, `ui`, `api`, `db`)
- **Breaking changes** — add `!` after the type/scope and a `BREAKING CHANGE:` footer:
  ```
  feat(api)!: remove deprecated /v1/users endpoint

  BREAKING CHANGE: clients must migrate to /v2/users
  ```

---

## Examples

```bash
git commit -m "feat(auth): add jwt token validation"
git commit -m "fix(ui): resolve alignment issue on mobile"
git commit -m "docs: update readme with installation steps"
git commit -m "refactor: simplify database connection logic"
git commit -m "perf(query): add index on users.email column"
git commit -m "test(auth): add coverage for token expiry edge case"
git commit -m "ci: add caching for node_modules in workflow"
git commit -m "chore: bump eslint to v9"
git commit -m "revert: feat(auth): add jwt token validation"
```

---

## Multi-line Commit (Body + Footer)

```bash
git commit -m "fix(payments): handle stripe webhook timeout

Stripe webhooks can arrive out of order when the handler is slow.
Added idempotency key validation to prevent double-processing.

Closes #412"
```
