---
name: latex-expert
description: "Author, debug, and extend LaTeX documents: document classes and page geometry, mathematical typesetting (amsmath, mathtools), tables and figures, bibliographies with BibTeX/BibLaTeX, cross-referencing, TikZ and PGFPlots graphics, chemistry (mhchem, chemfig), and Python integration via PythonTeX. Also diagnoses compilation failures, package clashes, and Overfull hbox warnings, and enforces correct package load order. Use when the user is writing a paper, thesis, report, or CV in LaTeX, asks how to typeset a formula or diagram, hits a compile error, or wants a .tex file created or fixed. Trigger on any mention of LaTeX, .tex, TikZ, BibTeX, Overleaf, or 'typeset this equation'."
---

# LaTeX Expert — Main Agent

## Overview

This is the top-level entry point for the LaTeX skill system. Read this file
first, then navigate to the relevant module for deep guidance.

## Quick Module Routing

| Task | Module to read |
|---|---|
| Draw any diagram, figure, or plot | `modules/tikz.md` |
| Control page size, margins, columns | `modules/geometry.md` |
| Citations, bibliography, `.bib` files | `modules/bibliography.md` |
| Chemistry formulas, molecules, reactions | `modules/chemistry.md` |
| Embed Python code or data in LaTeX | `modules/python-latex.md` |
| Math operators, environments, delimiters | `references/math.md` |
| Choose or debug packages | `references/packages.md` |

---

## Document Structure & Compilation

### Standard Structure

```tex
\documentclass[a4paper,12pt]{article}

% Preamble — packages then macros
\usepackage[style=authoryear,backend=biber]{biblatex}
\addbibresource{references.bib}

\title{Title}
\author{Author}
\date{\today}

\begin{document}
\maketitle

\section{Introduction}
Text.

\printbibliography
\end{document}
```

### Compilation

Always use `latexmk`. It automates all multi-pass compilation.

```bash
latexmk -pdf document.tex   # compile
latexmk -c                  # clean auxiliary files
latexmk -C                  # clean including PDF
```

For PythonTeX documents, use the three-pass sequence:

```bash
pdflatex doc.tex && pythontex doc.tex && pdflatex doc.tex
```

---

## Core Principles

1. **Prefer modern packages** — `biblatex` over BibTeX, `mathtools` over plain
   `amsmath`, `tabularray` over `tabular`, `fontspec` with LuaLaTeX over
   legacy font commands.
2. **Load `hyperref` last** (except `cleveref`, which goes after `hyperref`).
3. **Use `latexmk`** — never manually chain `pdflatex`/`biber` for standard
   documents.
4. **Comment your preamble** — group packages by purpose with section comments.
5. **Use `\newcommand` early** — define all custom macros in the preamble,
   never inline.

---

## Mathematical Typesetting (Summary)

- Use `align` for display math; **avoid `eqnarray`**.
- Use `\DeclareMathOperator` for named operators (e.g., `\Tr`, `\argmax`).
- Use `\lvert`, `\rvert`, `\lVert`, `\rVert` for absolute value and norm.
- See `references/math.md` for the full reference.

---

## Bibliography (Summary)

- Use `biblatex` with `backend=biber`. Never legacy BibTeX for new projects.
- Cite with `\autocite{}` (context-aware) or `\textcite{}` (in-sentence).
- See `modules/bibliography.md` for the full reference.

---

## Package Loading Order

```tex
% 1. Document class
\documentclass{article}

% 2. Encoding (pdflatex only — omit for LuaLaTeX/XeLaTeX)
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}

% 3. Language
\usepackage[english]{babel}
\usepackage{csquotes}         % required by biblatex

% 4. Math
\usepackage{mathtools}        % loads amsmath
\usepackage{amssymb}

% 5. Typography
\usepackage{microtype}
\usepackage[margin=2.5cm]{geometry}

% 6. Domain-specific (tikz, chemistry, etc.)
\usepackage{tikz}

% 7. Bibliography
\usepackage[style=authoryear,backend=biber]{biblatex}

% 8. Graphics
\usepackage{graphicx}
\usepackage{xcolor}

% 9. Tables
\usepackage{booktabs}

% 10. hyperref LAST (except cleveref)
\usepackage{hyperref}
\usepackage{cleveref}
```

---

## Templates

- Standard document → `assets/template.tex`
- Chemistry document → `assets/template-chemistry.tex`
- PythonTeX document → `assets/template-pythontex.tex`
