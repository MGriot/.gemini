# Workflow Schema Reference

This file defines the canonical structure for all workflow documents produced by the Workflow Architect skill.
Filename convention: `workflow_[snake_case_name].md`

---

## Header Block (required)

```markdown
# Workflow: [Human-readable name]

**Trigger:**  [What starts this — see Trigger Types below]
**Owner:**    [Team or person responsible for this workflow]
**Goal:**     [One sentence: what "done" looks like]
**SLA:**      [Time budget from trigger to terminal state, e.g. "< 15 minutes"]
**Version:**  [e.g. 1.0 — increment on breaking changes]
```

### Trigger Types
| Type | Example |
|------|---------|
| Event | `Pull Request merged to main` |
| Schedule | `Daily at 02:00 UTC` |
| Manual | `Engineer runs deploy script` |
| Webhook | `POST /webhooks/payment-confirmed` |
| Queue message | `Message received on orders.created queue` |
| Condition | `Disk usage exceeds 85%` |

---

## Context Block (required)

All variables the workflow reads or writes. Executor must supply all inputs before step 1 begins.

```markdown
## Context

### Inputs
| Variable | Type | Source | Required |
|----------|------|--------|----------|
| PR_ID | string | GitHub event payload | yes |
| ENV_NAME | enum(staging, production) | Caller | yes |
| NOTIFY_SLACK | bool | Config — default: true | no |

### Outputs
| Variable | Type | Set By |
|----------|------|--------|
| COMMIT_SHA | string | Step A1 |
| DEPLOY_STATUS | enum(success, failure) | Step V1 |
```

---

## Execution Flow Block (required)

Nodes are numbered sequentially. Use node type symbols as prefixes.
Every node must declare its input(s), action, output(s), and failure handling.

---

### Action Node `[A]`

Single, atomic operation. Must be completable in isolation.

```markdown
### [A1] Checkout merged commit
- **Input:** PR_ID
- **Action:** `git checkout $(git rev-parse PR_ID^{commit})`
- **Output:** COMMIT_SHA
- **On Failure:** Abort → alert owner
```

---

### Verification Node `[V]`

Confirms the prior action produced the expected result. Never combined with an action.

```markdown
### [V1] Confirm service is healthy
- **Input:** DEPLOY_URL
- **Check:** HTTP GET /health → status 200 within 30s
- **Output:** HEALTH_STATUS (pass/fail)
- **On Fail:** trigger rollback → [✗]
```

---

### Decision Gate `[G]`

Exactly one boolean condition. Both branches must be explicit.

```markdown
### [G1] Tests passed?
- **Condition:** TEST_RESULT == "pass"
  - **YES →** [A3] Proceed to staging deploy
  - **NO →**  [A_FAIL] Post failure report → [✗] Abort
```

---

### Human Gate `[H]`

Pause for a human decision. Must define timeout and escalation.

```markdown
### [H1] Await production approval
- **Assignee:** on-call engineer (resolved from PagerDuty)
- **Prompt:** "Deploy {COMMIT_SHA} to production? Review: {DEPLOY_DIFF_URL}"
- **Timeout:** 30 minutes
- **On APPROVED →** [L1] Deploy
- **On REJECTED →** [A_LOG] Log reason → [✗] Abort
- **On TIMEOUT →** [A_ESC] Escalate to team lead → [H2] (timeout: 15 min)
  - **H2 TIMEOUT →** [✗] Abort + alert engineering manager
```

---

### Loop Node `[L]`

Repeating action with bounded iterations.

```markdown
### [L1] Deploy to production (with retry)
- **Action:** Run deploy script for ENV_NAME
- **Success Condition:** Exit code 0
- **Max Attempts:** 3
- **Backoff:** 60s (linear)
- **On Success →** [V1] Verify health
- **On Attempt < Max →** wait backoff → retry
- **On Exhausted →** [A_ROLL] Rollback → [✗] Page on-call
```

---

### Parallel Fork + Join `[P→]` / `[→P]`

Fan-out into concurrent branches; join waits for all to complete.
Every fork must have a matching join. Document partial-failure behavior explicitly.

```markdown
### [P→] Fork: run checks in parallel
- Branch A: [A2a] Run unit tests
- Branch B: [A2b] Run integration tests  
- Branch C: [A2c] Run security scan

### [→P] Join: wait for all branches
- **If any branch fails:** collect all failures, proceed to [G1]
- **If all pass:** proceed to [G1]

### [G1] All branches passed?
- **YES →** [A3] Continue
- **NO →**  [A_FAIL] Summarize failures → [✗]
```

---

### Terminal Nodes

```markdown
### [✓] Success
- **Action:** Update status record to "complete", emit success event

### [✗] Failure
- **Action:** Update status record to "failed", emit failure event, log run ID
```

---

## Failure Map Block (required)

Consolidates all failure paths. Must have a row for every non-trivial failure in the flow.

```markdown
## Failure Map

| Step | Failure Condition | Action | Notify |
|------|-------------------|--------|--------|
| A1 | Checkout fails | Abort | PR author |
| L1 | Deploy exhausted | Rollback | On-call (PagerDuty) |
| V1 | Health check fails | Rollback | On-call (PagerDuty) |
| H1 | Approval timeout | Escalate → H2 | Team lead (Slack) |
| H2 | Escalation timeout | Abort | Engineering manager |
```

---

## Output Artifacts Block (required)

Everything this workflow produces, creates, or modifies.

```markdown
## Output Artifacts

| Artifact | Location | Format |
|----------|----------|--------|
| Deploy log | S3: `deploys/{COMMIT_SHA}.log` | plaintext |
| GitHub deployment | GitHub API: deployment status | JSON |
| Slack notification | #releases | message |
| Status record | DB: `deployments.status` | enum |
```

---

## Full Minimal Example

```markdown
# Workflow: Nightly Data Export

**Trigger:** Schedule — daily at 01:00 UTC
**Owner:** Data Engineering
**Goal:** Export previous day's orders to S3 for the analytics team
**SLA:** Complete within 10 minutes
**Version:** 1.0

## Context

### Inputs
| Variable | Type | Source | Required |
|----------|------|--------|----------|
| EXPORT_DATE | date | Computed: yesterday's date | yes |
| S3_BUCKET | string | Config | yes |

### Outputs
| Variable | Type | Set By |
|----------|------|--------|
| EXPORT_PATH | string | A2 |
| ROW_COUNT | int | V1 |

## Execution Flow

### [A1] Query orders for EXPORT_DATE
- **Input:** EXPORT_DATE
- **Action:** `SELECT * FROM orders WHERE DATE(created_at) = EXPORT_DATE`
- **Output:** RESULT_SET
- **On Failure:** Abort → alert Data Engineering

### [V1] Verify result set is non-empty
- **Input:** RESULT_SET
- **Check:** row count > 0
- **Output:** ROW_COUNT
- **On Fail:** [A_WARN] Post warning to #data-alerts → [✓] (empty export is not a hard failure)

### [A2] Write CSV to S3
- **Input:** RESULT_SET, S3_BUCKET, EXPORT_DATE
- **Action:** Upload to `s3://{S3_BUCKET}/exports/{EXPORT_DATE}.csv`
- **Output:** EXPORT_PATH
- **On Failure:** Retry once → if still failing, alert + [✗]

### [V2] Confirm file exists in S3
- **Input:** EXPORT_PATH
- **Check:** S3 HeadObject returns 200
- **On Fail:** Alert Data Engineering → [✗]

### [A3] Post completion summary to #data-pipeline
- **Input:** EXPORT_PATH, ROW_COUNT, EXPORT_DATE
- **Action:** Slack message: "Export for {EXPORT_DATE}: {ROW_COUNT} rows → {EXPORT_PATH}"

### [✓] Done

## Failure Map

| Step | Failure | Action | Notify |
|------|---------|--------|--------|
| A1 | Query fails | Abort | Data Engineering (#data-alerts) |
| A2 | Upload fails x2 | Abort | Data Engineering (#data-alerts) |
| V2 | File missing | Abort | Data Engineering (#data-alerts) |

## Output Artifacts

| Artifact | Location | Format |
|----------|----------|--------|
| Orders export | `s3://{S3_BUCKET}/exports/{EXPORT_DATE}.csv` | CSV |
| Slack summary | #data-pipeline | message |
```
