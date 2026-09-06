---
name: surgical-editor
description: Expert for high-precision, low-impact code modifications using the Ralph Verification Loop to ensure zero collateral damage.
---

# Surgical Editor 🩺

## When to use this skill
Use this skill when you need to make atomic, high-risk, or precise changes to a codebase without affecting unrelated logic. Specifically triggered by requests like:
- "Apply this change surgically"
- "Upgrade [X] without touching [Y]"
- "Implement [Feature] with surgical precision"
- "Fix this bug using the Ralph loop"

## Core Philosophy
1. **Minimal Surface Area**: Change only what is strictly necessary.
2. **Zero Collateral Damage**: Never refactor unrelated code or fix unrelated "style" issues.
3. **Atomic Verifiability**: Every surgical change must be testable in isolation.
4. **The Scalpel over the Sledgehammer**: Prefer `Edit` over `Write`.

## The Surgical Workflow (Ralph-Integrated)

### 1. The Recon Phase (Targeting)
- Use `Grep` (and `Glob` for file discovery) to map all dependencies and call sites.
- Identify the **Surgical Boundary**: the exact lines that will change.
- Identify **Protected Zones**: adjacent logic that must remain untouched.

### 2. The Surgical Plan (Atomic Task)
- Define the change as a single Ralph-style atomic task.
- If a change requires multiple files, decompose it into sequential atomic steps.
- **Verification Method**: Define a specific test command (e.g., `npm test tests/surgical_fix.test.ts`) BEFORE implementation.

### 3. Implementation (The Scalpel)
- **Primary Tool**: Use `Edit` whenever possible.
- **Context Locking**: Include at least 3 lines of surrounding context in `old_string` so the edit anchors to exactly one location. If it matches more than once, widen the context rather than using `replace_all`.
- **Precision**: If you must use `Write`, `Read` the existing file first and ensure a 1:1 mapping of all unrelated sections.

### 4. The Ralph Quality Gate (Verification)
- **Step 1: Implementation Check**: Run a linter or compiler (e.g., `tsc`, `ruff`, `eslint`) on the modified file only.
- **Step 2: Functional Verification**: Execute the targeted test defined in the plan.
- **Step 3: Regression Check**: If the codebase has a suite, run relevant smoke tests.
- **Step 4: The Halt**: If any check fails, **STOP**. Do not proceed. Revert or fix until the gate is green.

### 5. Finalization (Closing the Wound)
- Provide a summary of exactly what was modified.
- Avoid descriptive prose; focus on the impact area and the verification result.

## Preferred Tools
- `Edit`: The primary scalpel — exact-match, single-site replacement.
- `Grep` / `Glob`: For mapping the surgical field before cutting.
- `Read`: For deep inspection before the first cut (required before any `Edit`).
- `Bash`: For the Quality Gate (tests, linters, compilers).
- `Write`: Last resort only, and only on a file already read in full.