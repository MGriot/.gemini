# Markdown Flavors

## GFM (GitHub Flavored Markdown)

Standard for GitHub READMEs, Issues, and PRs.

- **Task Lists:** `- [x] Completed task`
- **Strikethrough:** `~~text~~`
- **Tables:** Pipes and dashes (see SKILL.md)
- **Autolinks:** `http://example.com` is automatically linked.
- **Emoji:** `:smile:`

## CommonMark

The "strict" standard. Does **not** strictly support tables or definition lists in the core spec, but is the most portable.

- **Focus:** Ambiguity resolution and parsing consistency.
- **Usage:** When maximum portability is required.

## Pandoc

Used for converting Markdown to PDF, HTML, Docx, etc.

- **Math:** `$E=mc^2$` (LaTeX syntax).
- **Citations:** `[@smith2004]`
- **Definition Lists:**
    Term
    : Definition
- **Footnotes:** `^[This is a footnote]` or `[^1]`
