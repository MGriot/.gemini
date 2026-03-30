# Code Quality Rubric

## Overall Quality Score

| Score | Description |
|-------|-------------|
| ⭐⭐⭐⭐⭐ Excellent | Tests >40%, linting, CI/CD, docs, clean structure |
| ⭐⭐⭐⭐ Good | Tests >20%, some tooling, mostly clean |
| ⭐⭐⭐ Adequate | Tests >5%, basic structure, some tech debt |
| ⭐⭐ Needs Work | Minimal tests, inconsistent structure, many TODOs |
| ⭐ Poor | No tests, no tooling, significant technical debt |

---

## Test Coverage Interpretation

| Test Ratio | Assessment |
|------------|------------|
| >40% | Strong test culture |
| 20–40% | Reasonable coverage |
| 5–20% | Partial coverage — critical paths may be untested |
| <5% | Minimal testing — high risk for changes |
| 0% | No automated tests |

> Note: Test *ratio* (test files / total files) is a proxy, not actual line coverage.
> High test file ratio with trivial tests is not the same as meaningful coverage.

---

## File Size Signals

| File Size | Assessment |
|-----------|------------|
| <100 lines | Healthy, focused |
| 100–300 lines | Normal, acceptable |
| 300–500 lines | Starting to accumulate responsibility |
| 500–1000 lines | Likely candidate for splitting |
| >1000 lines | Strong refactoring candidate ("God file") |

---

## Function Complexity Signals

| Function Length | Assessment |
|-----------------|------------|
| <20 lines | Excellent |
| 20–50 lines | Good |
| 50–100 lines | Getting complex |
| >100 lines | Refactoring recommended |
| >200 lines | High complexity, hard to test |

---

## TODO/FIXME Interpretation

| Count | Assessment |
|-------|------------|
| 0–10 | Healthy |
| 10–30 | Normal accumulated debt |
| 30–100 | Significant tech debt, review priorities |
| >100 | High debt, may indicate rushed development |

**Always check for:**
- TODOs in security-critical paths
- FIXMEs in core business logic
- "HACK" comments near data handling code

---

## Documentation Quality

| Signal | Assessment |
|--------|------------|
| README with setup + architecture | ✅ |
| Docstrings on public functions | ✅ |
| Type annotations (Python/TS) | ✅ |
| Inline comments explaining *why* (not what) | ✅ |
| No README | ⚠️ |
| Outdated README | ⚠️ |
| No docstrings on public API | ⚠️ |
| Comments explaining *what* the code does (redundant) | Neutral |

---

## Dependency Health Signals

| Signal | Assessment |
|--------|------------|
| Lock file present (package-lock.json, poetry.lock) | ✅ Reproducible builds |
| `.nvmrc` / `python-version` file | ✅ Pinned runtime version |
| Very outdated dependencies (>2 major versions behind) | ⚠️ |
| Known vulnerable packages | 🔴 |
| Excessive dependencies for project size | ⚠️ |
| Circular dev/prod dependency confusion | ⚠️ |

---

## CI/CD Quality Signals

| Signal | Assessment |
|--------|------------|
| Tests run on PR | ✅ |
| Linting runs on PR | ✅ |
| Automated deployment | ✅ |
| Security scanning (Snyk, CodeQL, Dependabot) | ✅ |
| Branch protection rules (implied by workflow) | ✅ |
| No CI/CD at all | ⚠️ |
| CI exists but no tests run | 🔴 |

---

## How to Write the Quality Section

**DO:**
- Be specific: "The `UserService` class at 847 lines is a strong refactoring candidate"
- Cite actual files and numbers
- Balance positives and negatives
- Distinguish "bad" from "just different style"

**DON'T:**
- Be vague: "The code could be cleaner"
- Be harsh without context (some tech debt is intentional)
- Assume absence of tests = bad engineer (might be prototype/PoC)
- Grade on aesthetics — judge correctness and maintainability
