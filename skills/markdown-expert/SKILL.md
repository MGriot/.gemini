---
name: markdown-expert
description: "Write, format, lint, and debug Markdown across flavors — GitHub Flavored Markdown, CommonMark, and Pandoc. Covers tables, task lists, footnotes, math, YAML frontmatter, Mermaid diagrams, reference links, and collapsible sections, plus prettier and markdownlint configuration. Use when the user asks how to do something in Markdown, why their Markdown renders wrong, or wants a document formatted, linted, or converted between flavors. Trigger on 'markdown table', 'mermaid diagram', 'why isn't this rendering', 'format this README', 'add a table of contents', or any .md syntax question."
---

# Markdown Expert

## Overview

Use this skill to create, format, and debug Markdown documents. It covers GitHub Flavored Markdown (GFM), CommonMark, and Pandoc, along with tools for linting and formatting.

## Best Practices

- **Headings:** Use ATX style (`# Heading`) instead of Setext (`Heading\n===`). Limit to 3 levels.
- **Lists:** Use hyphens `-` for unordered lists.
- **Code Blocks:** Always specify the language in fenced code blocks (e.g., ` ```python `).
- **Line Length:** Wrap text at 80 characters for readability (unless using a renderer that doesn't support soft breaks, but GFM does).
- **Formatting:** Use `prettier` for automatic formatting.
- **Linting:** Use `markdownlint` to catch structure and style issues.

## Flavors & Syntax

Different platforms use different Markdown "flavors".

- **GFM (GitHub):** The standard for developers. Supports tables, task lists, strikethrough.
- **CommonMark:** The strictly standardized base.
- **Pandoc:** Extended features for document conversion (citations, definition lists).
- **Reference:** See `references/flavors.md` for specific syntax comparisons.

## Advanced Features

### Mermaid Diagrams
Embed diagrams directly in Markdown.

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

### Tables (GFM)
```markdown
| Header 1 | Header 2 |
| :------- | :------- |
| Cell 1   | Cell 2   |
```

### Frontmatter
Use YAML frontmatter for metadata at the top of the file.

```yaml
---
title: My Document
date: 2024-01-01
tags: [markdown, guide]
---
```

- **Reference:** See `references/advanced.md` for detailed examples of diagrams, footnotes, and math.