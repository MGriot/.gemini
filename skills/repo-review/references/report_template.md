# Repository Review Report Template

> Copy this template when generating a report manually (not via the generate_report.py script).
> Replace all `[bracketed]` placeholders. Delete sections that don't apply.

---

# Repository Review: `[project-name]`

**Date:** [YYYY-MM-DD]  
**Reviewed by:** Claude  
**Repository:** `[path or URL]`  
**Review type:** [ ] Quick Orientation  [ ] Quality  [ ] Security  [ ] Architecture  [x] Full

---

## 1. Executive Summary

[2–4 sentences: what is this project, what does it do, what is its overall health?
Include a one-line verdict: Healthy / Needs Attention / Requires Immediate Action.]

**Overall Health:** 🟢 Healthy / 🟡 Needs Attention / 🔴 Requires Immediate Action

---

## 2. Repository at a Glance

| Attribute | Value |
|-----------|-------|
| Primary Language(s) | [e.g., Python 3.11, TypeScript 5] |
| Framework(s) | [e.g., FastAPI, React, Django] |
| Total source files | [N] |
| Total lines of code | ~[N,NNN] |
| Test files found | [N] |
| Last commit | [hash + message + date] |
| Active contributors | [N (top: name)] |
| CI/CD | [GitHub Actions / Jenkins / None] |

---

## 3. Architecture Overview

[Describe the high-level structure in prose. Answer:
- What does the directory structure tell us about the design?
- What are the main entry points?
- How do the layers/modules communicate?]

### Directory structure
```
[project-name]/
├── [dir/]    — [what it contains]
├── [dir/]    — [what it contains]
└── ...
```

### Flow / architecture diagram
```
[ASCII or Mermaid diagram — e.g.:]

HTTP Request
    │
    ▼
┌─────────┐     ┌──────────┐     ┌──────────┐
│  Router │────▶│ Service  │────▶│   Repo   │
└─────────┘     └──────────┘     └────┬─────┘
                                      │
                                   ┌──▼──┐
                                   │  DB │
                                   └─────┘
```

---

## 4. Code Quality Findings

### 4.1 Technical Debt

Found **[N]** debt markers (TODOs, FIXMEs, HACKs):

| Type | File | Line | Note |
|------|------|------|------|
| TODO | `[file.py]` | [42] | [description] |
| FIXME | `[file.js]` | [88] | [description] |

[Or: ✓ No technical debt markers found.]

### 4.2 Complexity

**Largest files (potential complexity hotspots):**

| Lines | File | Concern |
|-------|------|---------|
| [NNN] | `[path/to/file.py]` | [Too large / reasonable] |

### 4.3 Code Smells Observed

[List specific observations from reading the code. Reference patterns.md for terminology.]

- [ ] **[Smell name]** — [file.py] — [brief description]
- [ ] **[Smell name]** — [file.js] — [brief description]

[Or: ✓ No significant code smells observed.]

### 4.4 Test Coverage

| Metric | Value |
|--------|-------|
| Test files | [N] |
| Source files | [N] |
| Ratio | [N:1] |
| Test frameworks detected | [pytest / jest / junit] |
| Has integration tests | Yes / No |
| CI runs tests | Yes / No |

**Assessment:** [Thorough / Adequate / Minimal / None]

[Specific gaps: what's not tested that should be?]

---

## 5. Security Findings

> **⚠️ Review required.** Automated scan results + manual analysis below.

| Severity | Finding | File:Line | Recommendation |
|----------|---------|-----------|----------------|
| 🔴 Critical | [description] | `[file:42]` | [action] |
| 🟠 High | [description] | `[file:88]` | [action] |
| 🟡 Medium | [description] | `[file:12]` | [action] |
| 🟢 Low | [description] | `[file:7]` | [action] |
| ℹ️ Info | [description] | — | [action] |

[Or for clean repos: ✓ No security findings identified during this review.]

### 5.1 Secrets Management
- `.gitignore` status: ✓ / ⚠️
- `.env.example` present: Yes / No
- Secrets in environment variables: Yes / No / Partially
- Vault / secrets manager: [name or None]

### 5.2 Authentication & Authorization
[Brief description of how the app handles auth. Gaps?]

---

## 6. Dependency Health

### Direct Dependencies

| Package | Version in Use | Latest | Status | Notes |
|---------|---------------|--------|--------|-------|
| [package] | [x.y.z] | [a.b.c] | 🟢 Current / 🟡 Minor update / 🔴 Major behind / ⚠️ CVE | [notes] |

### Vulnerability Scan Results
```
[Output of pip-audit / npm audit / cargo audit, or "Not run"]
```

**Summary:** [X] vulnerabilities — [N] critical, [N] high, [N] medium, [N] low.

---

## 7. Positive Observations

> What does this project do well?

- ✅ [specific good thing]
- ✅ [specific good thing]
- ✅ [specific good thing]

---

## 8. Recommendations (Ranked by Impact)

| Priority | Action | Effort | Rationale |
|----------|--------|--------|-----------|
| 🔴 Critical | [action] | [Small/Medium/Large] | [why] |
| 🟠 High | [action] | [Small/Medium/Large] | [why] |
| 🟡 Medium | [action] | [Small/Medium/Large] | [why] |
| 🟢 Low | [action] | [Small/Medium/Large] | [why] |

---

## 9. Files Reviewed

The following files were manually read during this review:

| File | Why reviewed |
|------|-------------|
| `[path/to/file]` | Entry point |
| `[path/to/file]` | Auth logic |
| `[path/to/file]` | Data models |
| `[path/to/file]` | API routes |
| `[path/to/file]` | Config |

---

_End of report. Generated by Claude repo-review skill._
