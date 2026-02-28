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
4. **The Scalpel over the Sledgehammer**: Prefer `replace` over `write_file`.

## The Surgical Workflow (Ralph-Integrated)

### 1. The Recon Phase (Targeting)
- Use `grep_search` to map all dependencies and call sites.
- Identify the **Surgical Boundary**: the exact lines that will change.
- Identify **Protected Zones**: adjacent logic that must remain untouched.

### 2. The Surgical Plan (Atomic Task)
- Define the change as a single Ralph-style atomic task.
- If a change requires multiple files, decompose it into sequential atomic steps.
- **Verification Method**: Define a specific test command (e.g., `npm test tests/surgical_fix.test.ts`) BEFORE implementation.

### 3. Implementation (The Scalpel)
- **Primary Tool**: Use `replace` whenever possible.
- **Context Locking**: Include at least 3 lines of context in `old_string` to ensure the correct location is targeted.
- **Precision**: If you must use `write_file`, read the existing file first and ensure 1:1 mapping of all unrelated sections.

### 4. The Ralph Quality Gate (Verification)
- **Step 1: Implementation Check**: Run a linter or compiler (e.g., `tsc`, `ruff`, `eslint`) on the modified file only.
- **Step 2: Functional Verification**: Execute the targeted test defined in the plan.
- **Step 3: Regression Check**: If the codebase has a suite, run relevant smoke tests.
- **Step 4: The Halt**: If any check fails, **STOP**. Do not proceed. Revert or fix until the gate is green.

### 5. Finalization (Closing the Wound)
- Provide a summary of exactly what was modified.
- Avoid descriptive prose; focus on the impact area and the verification result.

## Preferred Tools
- `replace`: The primary scalpel.
- `grep_search`: For mapping the surgical field.
- `read_file`: For deep inspection before the first cut.
- `run_shell_command`: For the Quality Gate (tests/lint).