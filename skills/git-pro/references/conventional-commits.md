# Conventional Commits

Enforce this structure for all commit messages:
`<type>(<scope>): <description>`

## Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Rules
- **Imperative Mood**: Use "add" instead of "added" or "adds".
- **Lowercase**: The description should be lowercase and not end with a period.
- **Scope**: (Optional) The module or file affected (e.g., `auth`, `ui`, `api`).

## Examples
- `feat(auth): add jwt token validation`
- `fix(ui): resolve alignment issue on mobile`
- `docs: update readme with installation steps`
- `refactor: simplify database connection logic`
