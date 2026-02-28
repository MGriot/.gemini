# The Surgical Manifesto

## 1. The Principle of Locality
A change should be as local as possible. If a bug is in `compute_total()`, don't refactor `UserSession`. If `UserSession` needs a change to support `compute_total()`, that is a separate surgical procedure.

## 2. Respect the Original Author
Preserve the existing indentation, naming conventions, and architectural patterns. A surgical editor is a ghost; the code should look like it was written by the person who wrote the surrounding lines.

## 3. The Ralph Guarantee
Verification is not optional. Every "cut" (change) must be followed by a "check" (test). If you can't test it, you shouldn't cut it.

## 4. Anti-Patterns to Avoid
- **The "While I'm here" Refactor**: Changing a variable name in a function you aren't fixing.
- **The "Library Swap"**: Switching from `axios` to `fetch` because it's "better", unless explicitly requested.
- **The "Formatting Nuke"**: Running an auto-formatter that changes 500 lines when you only meant to change 5.
