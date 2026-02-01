---
name: latex-expert
description: Expert guidance on LaTeX document preparation, formatting, mathematical typesetting, and library management. Use when creating or debugging LaTeX documents.
---

# Latex Expert

## Overview

Use this skill to create, format, and debug LaTeX documents. It provides modern best practices for structure, bibliography management (biblatex), and mathematical typesetting (mathtools).

## Document Structure & Compilation

### Standard Structure

Follow this structure for maintainable documents:

```tex
\documentclass{article}
% Preamble: Import packages and define macros
\usepackage[style=authoryear,backend=biber]{biblatex}
\addbibresource{references.bib}

\title{Title}
\author{Author}
\date{\today}

\begin{document}

\maketitle

\section{Introduction}
Text goes here.

\printbibliography

\end{document}
```

### Compilation (latexmk)

Always use `latexmk` for compilation. It automates multiple runs for cross-references and bibliographies.

- **Compile to PDF:** `latexmk -pdf document.tex`
- **Clean build artifacts:** `latexmk -c`

## Mathematical Typesetting

Use the `mathtools` package (an extension of `amsmath`) for all math.

- **Equation Environment:** Use `align` for multi-line equations. **Avoid `eqnarray`.**
- **Sizing:** Manually size delimiters (`\big`, `\Big`) when automatic sizing (`\left`, `\right`) looks poor.
- **Reference:** See `references/math.md` for detailed math commands and environments.

## Bibliography

Use `biblatex` with the `biber` backend. **Avoid legacy `BibTeX`.**

- **Setup:** `\usepackage[backend=biber]{biblatex}`
- **Database:** Keep references in a `.bib` file.
- **Citation:** Use `\autocite{key}` for context-aware citations.

## Packages

- **Common:** `graphicx` (images), `booktabs` (tables), `hyperref` (links), `cleveref` (better references).
- **Reference:** See `references/packages.md` for a curated list of modern packages.

## Templates

- **Standard Template:** Use `assets/template.tex` as a starting point for new documents.