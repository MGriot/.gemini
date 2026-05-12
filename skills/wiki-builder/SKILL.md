---
name: wiki-builder
description: >
  Build and maintain a personal Zettelkasten-style wiki from raw source documents (PDFs, images,
  markdown files). Use this skill whenever the user wants to: digest raw documents into atomic
  concept notes, process files from a raw/ folder into a wiki/, update or improve existing wiki
  notes, create synthesis documents from wiki content, run a health-check (lint) on the wiki,
  or resume an interrupted ingestion session. Trigger on phrases like "process my raw files",
  "add this to the wiki", "digest this document", "build my knowledge base", "ingest this",
  "update the wiki", "create a synthesis on X", or any mention of wiki folders, Obsidian notes,
  or Zettelkasten. Also trigger when the user drops a file and says anything about organizing,
  summarizing, or extracting knowledge from it.
---

# Wiki Builder

A skill for digesting raw source documents into an atomic, interlinked Zettelkasten-style wiki.
Every concept gets its own note. Notes connect via `[[wiki links]]`. The agent does all the
maintenance; the human curates sources and asks questions.

Before starting any operation, read this file fully. For note formatting rules, see
`references/note-format.md`. For the progress tracker schema, see `references/progress-schema.md`.

---

## Folder Layout

```
project-root/
├── raw/              ← Drop new source files here (PDF, MD, images, etc.)
│   └── assets/       ← Locally stored images referenced by raw markdown
├── processing/       ← File currently being digested (one at a time)
├── processed/        ← Finished source files (never delete)
├── wiki/             ← Atomic concept notes (Zettelkasten, agent-maintained)
│   └── assets/       ← Images extracted/described from sources, referenced in notes
├── synthesis/        ← Overarching summaries stitching multiple concepts (user-requested)
└── .wiki/
    ├── progress.json ← Digestion state — survives session interruptions
    ├── index.md      ← Catalog of all wiki notes (agent-maintained)
    └── log.md        ← Append-only digestion log
```

Create any missing folders silently before starting work.

---

## Core Workflows

### 1. Ingest (digesting raw files into wiki notes)

**When to use**: User says "process my raw files", "ingest this", "digest the raw folder",
or drops a file and asks to add it to the wiki.

**Step-by-step**:

1. **Load progress state** — read `.wiki/progress.json`. If it exists and has a `current`
   entry, offer to resume from where the last session stopped, or start fresh.

2. **Scan the queue** — list all files in `raw/` (excluding `raw/assets/`). Supported types:
   `.pdf`, `.md`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.webp`. Update `progress.json` queue.

3. **For each file in the queue** (process one at a time):

   a. **Move to processing/**: `mv raw/filename processing/filename`
      Update `progress.json` → set `current`.

   b. **Read the source**:
      - `.md` / `.txt`: read as text
      - `.pdf`: extract text; note page numbers for citations
      - Images (`.png`, `.jpg`, etc.): describe all visible content verbally; extract any
        text, formulas, tables, or diagrams as structured text; note what cannot be captured

   c. **Identify atomic concepts** — list all distinct concepts in the source. Each concept
      that doesn't already have a wiki note will get one. Apply strict Zettelkasten atomicity:
      **one idea per note**. If a concept already has a note, plan an update instead.

   d. **For each new concept** → run **Create Note** workflow (see §2)

   e. **For each existing concept touched** → run **Update Note** workflow (see §3)

   f. **Update index and log** — add new notes to `.wiki/index.md`; append entry to `.wiki/log.md`

   g. **Move to processed/**: `mv processing/filename processed/filename`
      Update `progress.json` → move `current` to `completed[]`, clear `current`.

4. Repeat until queue is empty. Report a summary: N notes created, M notes updated, files processed.

---

### 2. Create Note

**When to use**: A new atomic concept has been identified during ingestion, or the user explicitly
asks to create a wiki note on a topic.

Read `references/note-format.md` for the exact template and field rules before writing.

**Rules**:
- **One concept only** — if you feel the urge to write two sections covering different ideas,
  split into two notes and link them.
- **Title** = the canonical name of the concept (Title Case). Add common aliases to frontmatter.
- **Tags** — choose from the taxonomy in `references/note-format.md`; create new tags sparingly
  and in kebab-case.
- **Links** — every note must link to at least one other note via `[[Note Title]]`. If no
  note exists yet for a related concept, create a placeholder filename and link it — it will
  be filled in later. Do not leave notes as orphans.
- **Sources** — always cite the originating raw file and any specific page/section.
  Format: `[[processed/filename]]` for internal files, or standard bibliographic format for
  external references.
- **Status** = `draft` on creation. Never set to `complete` yourself — that is the user's call
  after a lint/review pass.
- **Images** — if the source had an image relevant to this concept, save a described version
  in `wiki/assets/` and reference it in the note. For extractable diagrams, recreate them in
  Mermaid or ASCII if feasible.
- **Filename** = concept name in Title Case, spaces as spaces (Obsidian convention).
  Example: `Student's T-Test.md`

---

### 3. Update Note (improving an existing note)

**When to use**: A new source adds information, corrections, or connections to a concept that
already has a wiki note.

**Rules**:
- Make the improvement in-place (update the relevant section of the note body).
- Append a changelog entry at the **bottom** of the file, below a `## Changelog` section.
  Format: `- YYYY-MM-DD: <what changed> (source: [[processed/filename]])`
- Update `modified` in the frontmatter.
- Do **not** change `status` — leave it as-is.
- Update `sources` frontmatter list if the new file is not already there.
- If the new source contradicts existing content, add a `> [!WARNING]` callout near the
  relevant claim noting the contradiction, and log both views. Do not silently overwrite.

---

### 4. Synthesis (user-requested overarching summaries)

**When to use**: User asks a question like "give me an overview of hypothesis testing" or
"synthesize everything I have on chemometrics". This is **not** an atomic note — it is a
narrative document stitching multiple concepts together.

**Rules**:
- Save in `synthesis/`, not `wiki/`.
- Filename = descriptive title, date-stamped: `Hypothesis Testing Overview - 2026-05-05.md`
- Structure: introduction → linked concept summaries → connections and comparisons → open questions
- Every concept mentioned must be linked: `[[Concept Name]]`
- Include a `## Sources` section listing all wiki notes and raw files drawn upon
- Add an entry to `.wiki/log.md`
- Do **not** touch `wiki/` notes during synthesis (read-only access to wiki during this workflow)

---

### 5. Lint (wiki health check)

**When to use**: User asks to "health-check", "lint", or "clean up" the wiki, or periodically
as the wiki grows.

**Check for and report**:
1. **Orphan notes** — notes with no inbound `[[links]]` from other notes
2. **Broken links** — `[[Note Title]]` references where the target file doesn't exist
3. **Missing sources** — notes with empty `sources` field
4. **Stale drafts** — notes with `status: draft` older than 30 days
5. **Stub notes** — notes with body shorter than 3 sentences (likely placeholders)
6. **Contradictions** — notes with `[!WARNING]` callouts that haven't been resolved
7. **Missing concepts** — concepts mentioned repeatedly in notes but lacking their own note
8. **Index gaps** — wiki notes not listed in `.wiki/index.md`

Produce a lint report as a markdown table. Do not auto-fix — present findings and ask the user
which issues to resolve.

---

## Progress Tracker

The `.wiki/progress.json` file is your session memory. Read it at the start of every session.
Write it after every file movement and after every note created/updated.

See `references/progress-schema.md` for the full schema and examples.

**Critical rule**: Always write `progress.json` before moving a file. If the session ends
mid-processing, the next session must be able to resume from the exact same state.

---

## Index Maintenance

`.wiki/index.md` is the master catalog. Format:

```markdown
# Wiki Index
_Last updated: YYYY-MM-DD | Notes: N_

## Statistics & Data Science
| Note | Summary | Tags | Status |
|------|---------|------|--------|
| [[Student's T-Test]] | Compares means of two independent groups | statistics, hypothesis-testing | draft |

## Chemistry & Chemometrics
...
```

Update the relevant category row whenever a note is created or updated. Add new category
sections as needed. Keep categories consistent with the tag taxonomy.

---

## Log Format

`.wiki/log.md` is append-only. Each entry:

```markdown
## [YYYY-MM-DD HH:MM] ingest | filename.pdf
- Concepts extracted: N
- Notes created: [[Note A]], [[Note B]]
- Notes updated: [[Note C]]
- Notes touched: N total
```

For synthesis:
```markdown
## [YYYY-MM-DD HH:MM] synthesis | Topic Name
- Wiki notes read: N
- Output: [[synthesis/Topic Name - YYYY-MM-DD]]
```

---

## Important Constraints

- **Never modify files in `raw/`** — they are immutable source of truth.
- **Never modify files in `processed/`** — archive only.
- **Never write source summaries into `wiki/`** — summaries go in `synthesis/`.
  Wiki notes are concepts, not document summaries.
- **One file at a time** — never move two files to `processing/` simultaneously.
- **English only** — all note content in English, even if the source is in another language.
  Preserve technical terms in their original language as aliases or inline annotations.
- **Cite always** — a note without a source reference is incomplete.
