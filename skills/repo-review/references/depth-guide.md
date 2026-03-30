# Depth Guide

## Choosing Review Depth

| Signal | Choose |
|--------|--------|
| <500 files, utility script, one-file lib | **Quick** |
| 500–5000 files, typical web app/API/lib | **Standard** |
| 5000+ files, monorepo, platform, framework | **Deep** |
| User says "brief overview" or "quick look" | **Quick** |
| User says "understand fully" or "thorough review" | **Standard** or **Deep** |
| User is onboarding to a new job/team | **Deep** |

---

## Quick Review (< 30 min)

**What to produce:**
- 1-page summary (500–800 words)
- What the project is and who it's for
- Tech stack snapshot
- Top 5 files to know
- One "how to run it" paragraph

**Phases to run:** 0, 1, 2 (skip 3–5)  
**Script:** `report_builder.py --depth quick`

---

## Standard Review (~1–2 hrs of analysis)

**What to produce:**
- Full report (1500–3000 words)
- All 11 sections of the report template
- Architecture diagram or narrative
- Security flags summary
- Onboarding checklist

**Phases to run:** 0–6  
**Script:** `report_builder.py --depth standard`

---

## Deep Review (comprehensive)

**What to produce:**
- Standard report PLUS sub-reports for each major module
- Full dependency risk analysis
- Detailed security findings with remediation suggestions
- Architecture diagram with data flow
- Test strategy evaluation
- Refactoring recommendations with priorities

**Phases to run:** 0–6, plus repeat Phase 1–4 per major module  
**Script:** `report_builder.py --depth deep` + `--module <dir>` per module

**When to suggest Deep:**
- The user is a new developer joining a team
- The user wants to make major architectural changes
- The user is auditing for security/compliance
- The codebase appears particularly complex or undocumented

---

## What to Always Include (any depth)

Regardless of depth, always tell the user:
1. What the project does (1 sentence)
2. The primary language and framework
3. How to run it locally
4. The biggest risk or concern you noticed
