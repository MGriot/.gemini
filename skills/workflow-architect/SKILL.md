---
name: workflow-architect
description: Design structured, executable agentic workflows from natural language goals. Use this skill whenever the user wants to automate a process, build a pipeline, map out a sequence of steps, define a repeatable procedure, design an agent loop, or describe what should happen "every time X occurs." Trigger on phrases like "create a workflow for", "automate my", "build a process for", "what steps should happen when", "design a pipeline", "I want an agent that", or any request involving multi-step logic, approvals, retries, or conditional branching — even if they don't say "workflow." Always use this skill when the output should be a structured, machine-readable process definition.
---

# Workflow Architect

Convert natural language goals into precise, executable workflow protocols.

---

## Before You Draft — Clarify First

If the request is broad, ask these before generating:

| Question | Why It Matters |
|----------|----------------|
| Who or what triggers this? | Determines trigger type (event, schedule, manual) |
| What does success look like? | Defines the terminal state |
| Are there manual approval steps? | Introduces Human Gates |
| What can go wrong? | Surfaces failure branches |
| Should any steps run in parallel? | Affects graph structure |
| Are there loops or retries? | Changes step type to Loop/Retry |

Skip questions where context already provides the answer.

---

## Workflow Node Types

Every step in a workflow is one of these node types. Use them precisely.

| Type | Symbol | When to Use |
|------|--------|-------------|
| **Action** | `[A]` | Single executable operation (API call, script, write file) |
| **Verification** | `[V]` | Check that a prior action succeeded |
| **Decision Gate** | `[G]` | IF/THEN branch — exactly one condition per gate |
| **Human Gate** | `[H]` | Pause for human approval or input |
| **Loop** | `[L]` | Repeat until condition is met or max retries hit |
| **Parallel Fork** | `[P→]` | Split into concurrent branches |
| **Parallel Join** | `[→P]` | Wait for all parallel branches to complete |
| **Terminal** | `[✓]` / `[✗]` | Success exit or Failure exit |

---

## Output Schema

Generate a file named `workflow_[name].md` using the schema in `assets/workflow_schema.md`.

**Required sections:**
1. **Header** — Name, Trigger, Owner, Goal, SLA
2. **Context** — All variables the workflow consumes (name + type + source)
3. **Execution Flow** — Numbered nodes using the types above
4. **Failure Map** — Every failure path, what it does, who it alerts
5. **Output Artifacts** — What is produced or changed

---

## Pattern Library

Reference these when building flows. Combine them freely.

### Pattern 1 — Linear (Happy Path)

```
[A1] Fetch data → [V1] Verify non-empty → [A2] Transform → [A3] Write output → [✓]
```

Use for: Simple ETL, file processing, single-purpose automations.

---

### Pattern 2 — Decision Branch

```
[A1] Run checks → [G1] All checks pass?
  YES → [A2] Proceed
  NO  → [A3] Create incident → [✗]
```

**Rule:** Every gate must have an explicit YES and NO path. Never leave a branch dangling.

---

### Pattern 3 — Retry Loop

```
[L1] Attempt action (max 3)
  SUCCESS → continue to [A2]
  FAILURE (attempt < 3) → wait 30s → retry [L1]
  FAILURE (attempt = 3) → [A_ALERT] Notify on-call → [✗]
```

**Required loop fields:** condition, max_attempts, backoff_strategy, exhaustion_action.

---

### Pattern 4 — Human Approval Gate

```
[A1] Prepare request → [H1] Await approval (timeout: 24h)
  APPROVED → [A2] Execute
  REJECTED → [A3] Log reason → [✗]
  TIMEOUT  → [A4] Escalate → [H2] Await escalation (timeout: 4h)
```

**Rule:** Every Human Gate must define a timeout and what happens when it expires.

---

### Pattern 5 — Parallel Fan-Out / Fan-In

```
[A1] Prepare jobs
  → [P→] Fork
       Branch A: [A2a] Run test suite
       Branch B: [A2b] Run security scan
       Branch C: [A2c] Run linter
  → [→P] Join (wait for all)
[G1] All branches passed?
  YES → [A3] Merge
  NO  → [A4] Report failures → [✗]
```

**Rule:** Every fork must have a matching join. Document what happens if one branch fails mid-parallel.

---

### Pattern 6 — Event Loop (Agent Pattern)

```
[L1] Poll for new events (interval: 60s)
  EVENT FOUND → [A1] Process event → [A2] Mark handled → back to [L1]
  NO EVENT    → back to [L1]
  ERROR       → [A3] Log + alert → back to [L1] (do not halt on single event failure)
```

Use for: Long-running agents, queue processors, monitoring loops.

---

## Anti-Patterns

| Avoid | Why | Fix |
|-------|-----|-----|
| Steps with multiple actions | Untestable, hard to retry | Split into atomic actions |
| Gates with no NO branch | Silent failures | Always define both paths |
| No verification after writes | Assumes success, misses corruption | Add `[V]` after every state change |
| Human gates with no timeout | Workflow stalls forever | Always define timeout + escalation |
| Parallel branches with no join | Race conditions, partial output | Always pair `[P→]` with `[→P]` |
| Infinite loops with no exit | Runaway processes | Set max_attempts or hard timeout |
| Implicit global state | Steps coupled, can't be reordered | Pass all state explicitly as step outputs |
| Vague failure actions ("handle error") | Executor doesn't know what to do | Name the exact action: notify, retry, abort |

---

## Verification Checklist

Before finalizing any workflow:

- [ ] Every step has exactly one action
- [ ] Every step has a defined output
- [ ] Every `[G]` gate has explicit YES and NO paths
- [ ] Every `[H]` human gate has a timeout and escalation
- [ ] Every `[L]` loop has a max_attempts and exhaustion action
- [ ] Every `[P→]` fork has a matching `[→P]` join
- [ ] Every failure path leads to either a retry, an alert, or a `[✗]` terminal
- [ ] All variables in the Context block are consumed by at least one step
- [ ] Output artifacts section lists everything the workflow produces or modifies

---

## Example — Code Release Workflow

```markdown
# Workflow: Code Release

**Trigger:** Pull Request merged to `main`
**Owner:** Platform Team
**Goal:** Deploy to production with zero downtime
**SLA:** Complete within 20 minutes of trigger

## Context
- PR_ID (string) — from GitHub event payload
- ENV_NAME (string) — hardcoded: "production"
- DEPLOY_TIMEOUT (int) — 600 seconds

## Execution Flow

[A1] Checkout merged commit
  Output: COMMIT_SHA

[A2] Run test suite
  [P→] Fork
    Branch A: Unit tests
    Branch B: Integration tests
    Branch C: Security scan
  [→P] Join — wait for all

[G1] All test branches passed?
  YES → continue
  NO  → [A_FAIL] Post failure summary to PR → [✗] Abort

[H1] Await release approval (owner: on-call engineer, timeout: 30 min)
  APPROVED → continue
  REJECTED → [A_LOG] Log rejection reason → [✗] Abort
  TIMEOUT  → [A_ESC] Escalate to team lead → [H2] Await (timeout: 15 min)
    H2 TIMEOUT → [✗] Abort + alert

[L1] Deploy to production (max 2 attempts, backoff: 60s)
  SUCCESS → continue
  EXHAUSTED → [A_ROLL] Trigger rollback → [✗] Abort + page on-call

[V1] Verify deployment health (endpoint smoke test, timeout: 2 min)
  PASS → continue
  FAIL → [A_ROLL] Trigger rollback → [✗] Abort + page on-call

[A3] Post deploy summary to Slack #releases
[✓] Done

## Failure Map
| Step | Failure | Action | Alert |
|------|---------|--------|-------|
| A2 branch | Test fails | Post to PR, abort | PR author |
| H1 | Timeout | Escalate | Team lead |
| L1 | Deploy fails x2 | Rollback | On-call page |
| V1 | Health check fails | Rollback | On-call page |

## Output Artifacts
- GitHub deployment record (status: success/failure)
- Slack message in #releases
- Deploy log stored in S3: `deploys/{COMMIT_SHA}.log`
```

---

> For the full output schema and field definitions, read `assets/workflow_schema.md`.
