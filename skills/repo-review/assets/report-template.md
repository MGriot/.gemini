# 🔍 Repository Review: [PROJECT_NAME]

> **Generated:** [DATE]  
> **Root:** `[ROOT_PATH]`  
> **Branch:** `[BRANCH]`  
> **Last Commit:** `[HASH]` — [MESSAGE] ([RELATIVE_TIME])

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Directory Guide](#directory-guide)
5. [Key Files](#key-files)
6. [Dependencies](#dependencies)
7. [Environment & Configuration](#environment--configuration)
8. [Code Quality](#code-quality)
9. [Security Notes](#security-notes)
10. [Onboarding Checklist](#onboarding-checklist)
11. [Open Questions](#open-questions)

---

## Executive Summary

[PROJECT_NAME] is a [TYPE] that [WHAT_IT_DOES]. It is built with [FRAMEWORK] and [DATABASE], and is primarily used by [WHO].

Current status: [active development / maintenance mode / prototype / etc.]

---

## Tech Stack

| Category | Details |
|----------|---------|
| **Language** | [LANGUAGE] |
| **Framework** | [FRAMEWORK] |
| **Database** | [DATABASE] |
| **Cache** | [CACHE_OR_NONE] |
| **Queue** | [QUEUE_OR_NONE] |
| **CI/CD** | [CI_SYSTEM] |
| **Testing** | [TEST_FRAMEWORK] |
| **Deployment** | [DEPLOY_TARGET] |

---

## Architecture Overview

[Describe the high-level architecture in 2–3 paragraphs, then include a diagram.]

```
[ASCII or Mermaid diagram here]
```

**Main request flow:**
1. Request arrives at [ENTRY_POINT]
2. Passes through [MIDDLEWARE]
3. Handled by [CONTROLLER/HANDLER]
4. Calls [SERVICE]
5. Persists/reads via [REPOSITORY/ORM]
6. Returns [RESPONSE_FORMAT]

---

## Directory Guide

```
[ANNOTATED_TREE_OUTPUT]
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `[DIR1]` | [PURPOSE] |
| `[DIR2]` | [PURPOSE] |
| `[DIR3]` | [PURPOSE] |

---

## Key Files

| File | Role |
|------|------|
| `[FILE1]` | [WHAT_IT_DOES] |
| `[FILE2]` | [WHAT_IT_DOES] |
| `[FILE3]` | [WHAT_IT_DOES] |

---

## Dependencies

### Production ([COUNT] packages)

Notable dependencies:
- `[PACKAGE]` — [PURPOSE]
- `[PACKAGE]` — [PURPOSE]

### Development ([COUNT] packages)

Key dev tools: [LIST]

---

## Environment & Configuration

Required environment variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `[VAR]` | [PURPOSE] | Yes/No |

**Setup:** Copy `[ENV_EXAMPLE]` to `.env` and fill in the required values.

---

## Code Quality

| Metric | Value | Assessment |
|--------|-------|------------|
| Source files | [N] | — |
| Test files | [N] | — |
| Test ratio | [N]% | [Good/Low/None] |
| TODOs/FIXMEs | [N] | [OK/Attention needed] |
| Linting | [Yes/No] | — |
| CI/CD | [Yes/No] | — |

**Strengths:**
- [STRENGTH_1]
- [STRENGTH_2]

**Areas for improvement:**
- [IMPROVEMENT_1]
- [IMPROVEMENT_2]

---

## Security Notes

> ⚠️ This scan is heuristic-based. Use dedicated tools (Semgrep, Snyk, Trivy) for production audits.

| Severity | Count |
|----------|-------|
| 🔴 Critical | [N] |
| 🟠 High | [N] |
| 🟡 Medium | [N] |
| 🔵 Low | [N] |

[List any critical or high findings with context.]

---

## Onboarding Checklist

For a new developer to get started:

- [ ] Clone: `git clone [REPO_URL]`
- [ ] Install dependencies: `[INSTALL_COMMAND]`
- [ ] Configure environment: copy `[ENV_EXAMPLE]` to `.env`
- [ ] Set up database: `[DB_SETUP_COMMAND]`
- [ ] Run locally: `[RUN_COMMAND]`
- [ ] Run tests: `[TEST_COMMAND]`
- [ ] Read `[KEY_DOC]` for [PURPOSE]

---

## Open Questions

- [ ] [UNCLEAR_THING_1]
- [ ] [UNCLEAR_THING_2]
- [ ] [UNCLEAR_THING_3]
