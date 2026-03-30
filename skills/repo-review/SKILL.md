---
name: repo-review
description: >
  Comprehensive repository and project analysis skill. Use this whenever a user wants to
  understand, review, audit, or get a deep-dive into any codebase, repo, or software project.
  Triggers include: "review this repo", "understand this project", "analyze this codebase",
  "what does this code do", "explain this project", "audit this repo", "walk me through this code",
  "document this project", "what's the architecture of", "give me an overview of this project",
  or when a user uploads or points to any project folder / Git repo. Always use this skill
  for any non-trivial code comprehension task — even if the user doesn't say "review",
  if they want to understand a project holistically, this skill applies.
---

# Repo Review Skill

A systematic approach to fully understand, review, and document any software project or repository.

---

## Phase 0 — Orient & Plan

Before touching any file, run the orientation script:

```bash
python3 <SKILL_DIR>/scripts/orient.py <PROJECT_ROOT>
```

This produces a **Project Snapshot** JSON with:
- Directory tree (depth 3)
- File count by extension
- Total lines of code estimate
- Top-level README presence
- Git metadata (last commit, branch, contributors)
- Package manifest files detected

Use the snapshot to **choose a review depth** (see `references/depth-guide.md`):

| Depth | Use When | Output |
|-------|----------|--------|
| **Quick** | < 500 files, simple script/tool | 1-page summary |
| **Standard** | 500–5000 files, typical app/lib | Full review report |
| **Deep** | 5000+ files, monorepo, complex arch | Deep-dive with sub-reports |

---

## Phase 1 — Structure Analysis

Run the structure analyzer:

```bash
python3 <SKILL_DIR>/scripts/structure_analyzer.py <PROJECT_ROOT>
```

Outputs:
- Annotated directory tree with purpose labels
- Entry points detected (main files, index files, CLI entrypoints)
- Configuration files catalogued
- Test coverage location
- Build artifacts vs source separation

Read `references/structure-patterns.md` for how to interpret common patterns (monorepo, MVC, layered arch, microservices, etc.).

---

## Phase 2 — Dependency & Tech Stack Analysis

Run the dependency scanner:

```bash
python3 <SKILL_DIR>/scripts/dep_scanner.py <PROJECT_ROOT>
```

This scans:
- `package.json`, `pyproject.toml`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`, `.csproj`
- Lock files for actual resolved versions
- Dev vs prod dependency split
- Identifies the primary language(s), frameworks, and runtime

Also run:
```bash
python3 <SKILL_DIR>/scripts/env_scanner.py <PROJECT_ROOT>
```
To detect `.env` files, secrets patterns, and required environment variables.

---

## Phase 3 — Architecture Review

Read `references/architecture-patterns.md` to match the project to known patterns.

Manual steps Claude must perform:
1. Identify the **core data model** — find schema files, ORM models, or database migrations.
2. Trace the **main request/data flow** from entry point → processing → output.
3. Map **module boundaries** — which directories own which responsibilities.
4. Identify **cross-cutting concerns** — logging, auth, error handling, config management.
5. Note **external integrations** — APIs called, services used, webhooks, queues.

For large projects, run the call-graph helper:
```bash
python3 <SKILL_DIR>/scripts/call_graph.py <PROJECT_ROOT> --entry <ENTRY_FILE>
```

---

## Phase 4 — Code Quality Scan

```bash
python3 <SKILL_DIR>/scripts/quality_scan.py <PROJECT_ROOT>
```

Reports on:
- Code duplication hotspots
- Function/file length outliers (complexity signals)
- TODO/FIXME/HACK comment count and locations
- Test file presence and rough coverage ratio
- Linter config presence
- CI/CD pipeline files
- Documentation coverage (JSDoc, docstrings, type hints)

Read `references/quality-rubric.md` for scoring interpretation.

---

## Phase 5 — Security & Secrets Audit

```bash
python3 <SKILL_DIR>/scripts/security_scan.py <PROJECT_ROOT>
```

Scans for:
- Hardcoded secrets / API keys (regex patterns)
- Dangerous function calls (`eval`, `exec`, `system`, `shell=True`, SQL string concat)
- Insecure defaults (debug=True, CORS wildcard, no auth middleware)
- Sensitive files accidentally committed (`.pem`, `.key`, `*.sqlite`)

> ⚠️ Security findings are advisory. Always recommend a dedicated tool (Semgrep, Trivy, Snyk) for production audits.

---

## Phase 6 — Report Generation

Run the report builder:

```bash
python3 <SKILL_DIR>/scripts/report_builder.py \
  --project-root <PROJECT_ROOT> \
  --depth <quick|standard|deep> \
  --output /mnt/user-data/outputs/repo-review-report.md
```

The report follows the template in `assets/report-template.md`.

**Report sections (standard depth):**

1. **Executive Summary** — What is this project? Who is it for? What problem does it solve?
2. **Tech Stack** — Languages, frameworks, databases, infra
3. **Architecture Overview** — Diagram (ASCII or Mermaid) + narrative
4. **Directory Guide** — What each major folder does, annotated
5. **Key Files Reference** — The 10–20 most important files and their roles
6. **Data Flow** — How data moves through the system
7. **External Dependencies** — Third-party services and libraries, with risk notes
8. **Code Quality Assessment** — Strengths and improvement areas
9. **Security Notes** — Flags from Phase 5
10. **Onboarding Checklist** — Steps for a new developer to get up and running
11. **Open Questions** — Things that are unclear and worth investigating

For **deep** depth, also generate sub-reports per major module using `report_builder.py --module <MODULE_DIR>`.

---

## Phase 7 — Interactive Q&A (optional)

After delivering the report, offer to answer follow-up questions:

> "I've completed the review. You can now ask me things like:
> - 'How does authentication work in this project?'
> - 'Where would I add a new API endpoint?'
> - 'What's the test strategy?'
> - 'What are the biggest risks in this codebase?'"

---

## Quick Reference

| Task | Script |
|------|--------|
| First look | `orient.py` |
| Directory map | `structure_analyzer.py` |
| Dependencies | `dep_scanner.py` |
| Env/secrets needed | `env_scanner.py` |
| Code quality | `quality_scan.py` |
| Security flags | `security_scan.py` |
| Call graph | `call_graph.py` |
| Final report | `report_builder.py` |
| Extract archive | `extract_archive.py` |

---

## Reference Files

- `references/depth-guide.md` — How to choose review depth and what to include
- `references/structure-patterns.md` — Common project structures and how to interpret them
- `references/architecture-patterns.md` — Architecture patterns (MVC, hexagonal, event-driven, etc.)
- `references/quality-rubric.md` — How to score and describe code quality
- `references/language-hints.md` — Per-language conventions, entry points, and idioms
- `references/checklist.md` — Master checklist for thorough reviews

---

## Important Notes

- If the project root is a `.zip`, `.tar.gz`, or similar archive, extract it first with `extract_archive.py`
- If only a GitHub URL is given, clone with `git clone --depth=1 <URL> /tmp/project/`
- For very large repos (>50k files), limit the scan to key subdirectories
- Always infer intent: "understand this" or "help me learn this codebase" = deep review request
- `<SKILL_DIR>` refers to the directory where this SKILL.md is located
