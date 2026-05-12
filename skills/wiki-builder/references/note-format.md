# Note Format Reference

This file defines the canonical structure for all `wiki/` notes. Read it before creating or
updating any note.

---

## Full Template

```markdown
---
aliases: [alias1, alias2]
tags: [primary-tag, secondary-tag]
sources: ["[[processed/filename.pdf]]", "Author, Title, Year"]
created: YYYY-MM-DD
modified: YYYY-MM-DD
status: draft
---

# Concept Name

> [!INFO] Quick Reference
> **Definition**: One crisp sentence defining this concept.
> **Domain**: Statistics / Chemometrics / etc.
> **See also**: [[Related Concept A]], [[Related Concept B]]

Main body — explain the concept clearly and precisely. Use LaTeX for formulas ($$...$$
for display, $...$ for inline). Use Mermaid for diagrams when feasible. Be concise but
complete enough that the note is self-contained.

## Formula / Method (if applicable)

$$
\text{formula here}
$$

Where:
- $X$ = description of variable
- $n$ = description of variable

## Key Assumptions

List preconditions that must hold for this concept/method to apply.

## When to Use

Describe the decision context: when is this concept/method the right choice?

## Limitations

Known failure modes, edge cases, or conditions where this does not apply.

## Related Concepts

- [[Concept A]] — one sentence on the relationship
- [[Concept B]] — one sentence on the relationship

## Sources

1. [[processed/filename.pdf]] — p. 12–15
2. Author, *Title*, Year, §3.2

---
## Changelog
- YYYY-MM-DD: Created from `[[processed/filename.pdf]]`
```

---

## Field Rules

| Field | Rules |
|-------|-------|
| `aliases` | Common alternative names, abbreviations, non-English terms. Lowercase preferred. |
| `tags` | 1–4 tags from the taxonomy below. Always include at least one domain tag. |
| `sources` | At least one entry required. Internal files as `[[processed/filename]]`. |
| `created` | ISO date `YYYY-MM-DD`. Set once on creation, never change. |
| `modified` | ISO date `YYYY-MM-DD`. Update every time the note body changes. |
| `status` | Always `draft` on creation. Only the user sets it to `complete`. |

---

## Tag Taxonomy

Use these tags. Create new ones only when nothing fits — use kebab-case.

### Domain Tags (always include one)
- `statistics` — inferential and descriptive statistics
- `chemometrics` — statistical methods applied to chemical data
- `data-science` — ML, data pipelines, feature engineering
- `chemistry` — chemical concepts, reactions, properties
- `mathematics` — pure mathematical concepts
- `business` — business processes, management, strategy
- `personal` — personal knowledge, self-improvement

### Method/Type Tags
- `hypothesis-testing` — statistical tests and significance
- `probability` — probability theory and distributions
- `regression` — regression methods and models
- `classification` — classification algorithms
- `clustering` — unsupervised grouping methods
- `dimensionality-reduction` — PCA, LDA, etc.
- `preprocessing` — data cleaning, normalization
- `experimental-design` — DOE, sampling strategies
- `visualization` — charts, plots, graphical methods
- `algorithm` — computational procedures
- `formula` — notes centered on a key formula or equation
- `concept` — foundational theoretical concept
- `workflow` — step-by-step process or methodology
- `tool` — software, library, instrument

---

## Sections Guide

### Required sections
- Frontmatter (all fields)
- `[!INFO]` callout (definition + see-also)
- Main body (at minimum 3–5 sentences)
- `## Sources`
- `## Changelog`

### Optional but recommended
- `## Formula / Method` — for quantitative concepts
- `## Key Assumptions` — for methods with preconditions
- `## When to Use` — for decision-relevant concepts
- `## Limitations` — for methods with known failure modes
- `## Related Concepts` — always add if ≥2 links exist

### Callout types available
- `[!INFO]` — general information / quick reference
- `[!WARNING]` — contradiction, caveat, or contested claim
- `[!TIP]` — practical advice or rule of thumb
- `[!EXAMPLE]` — worked example (use sparingly; keep notes concise)

---

## Atomicity Rules

A note is **not atomic** if:
- It covers two distinct mechanisms (e.g., "T-test and ANOVA" in one note)
- It could logically be split and each half still stands alone
- The `[!INFO]` definition contains "and" connecting two separate ideas

When in doubt: split. Link the two halves to each other.

A note **is atomic** if:
- It covers one well-defined concept with a single definition
- Removing any section would leave the note incomplete
- The concept cannot be meaningfully divided

---

## Filename Convention

- Use the canonical English name of the concept
- Title Case, spaces as spaces (Obsidian resolves these correctly)
- Avoid special characters except apostrophes and hyphens
- Examples:
  - `Student's T-Test.md`
  - `F-Test for Variance Equality.md`
  - `Principal Component Analysis.md`
  - `Null Hypothesis.md`
