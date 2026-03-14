# Recommended LaTeX Packages

A curated list of modern, well-maintained packages. Prefer these over legacy
alternatives. All are available in TeX Live 2020+ and MiKTeX.

---

## Core Math

| Package | Purpose | Notes |
|---|---|---|
| `mathtools` | Math environments and commands | Extends `amsmath`; **load this, not `amsmath` directly** |
| `amssymb` | Extra math symbols (`\mathbb`, etc.) | |
| `amsthm` | Theorem environments | |
| `physics` | Bra-ket, derivatives, matrices | Convenience macros; some conflicts with `unicode-math` |
| `siunitx` | Numbers with units | `\qty{9.8}{\metre\per\second\squared}` |

---

## Font & Typography

| Package | Purpose | Notes |
|---|---|---|
| `fontspec` | Font selection | Requires LuaLaTeX or XeLaTeX |
| `unicode-math` | Unicode math fonts | Pairs with `fontspec` for modern math |
| `microtype` | Microtypography | Improves spacing/kerning; always include |
| `lmodern` | Latin Modern fonts | Default upgrade for pdflatex |
| `inputenc` | UTF-8 input encoding | pdflatex only; `[utf8]` option |
| `fontenc` | Font encoding | pdflatex only; `[T1]` option |

---

## Language & Localisation

| Package | Purpose | Notes |
|---|---|---|
| `babel` | Language support | `[english]`, `[italian]`, etc. |
| `polyglossia` | Multilingual (LuaLaTeX/XeLaTeX) | Alternative to `babel` for modern engines |
| `csquotes` | Context-sensitive quotation | Required by `biblatex` |
| `isodate` | Date formatting | |

---

## Page Layout

| Package | Purpose | Notes |
|---|---|---|
| `geometry` | Margins, paper size | **Always use this for layout** |
| `multicol` | Multiple columns | Balanced columns, flexible |
| `pdflscape` | Landscape pages | Rotates content and page |
| `fancyhdr` | Headers and footers | Pairs with `geometry` |
| `titlesec` | Section title formatting | |
| `titling` | `\maketitle` customisation | |

---

## Graphics

| Package | Purpose | Notes |
|---|---|---|
| `graphicx` | Image inclusion | `\includegraphics` |
| `tikz` | Vector graphics and diagrams | See `modules/tikz.md` |
| `pgfplots` | Mathematical plots | Built on TikZ |
| `xcolor` | Colour names and mixing | Load before TikZ; use `dvipsnames` option |
| `tcolorbox` | Coloured framed boxes | Very flexible |
| `mdframed` | Framed environments | Simpler than `tcolorbox` |
| `subcaption` | Sub-figures with (a), (b) labels | Modern alternative to `subfig` |
| `float` | `H` float placement specifier | |

---

## Tables

| Package | Purpose | Notes |
|---|---|---|
| `booktabs` | Professional tables | No vertical lines; `\toprule \midrule \bottomrule` |
| `tabularray` | Modern table creation | Most powerful; replaces `tabular`, `longtable`, etc. |
| `longtable` | Multi-page tables | Legacy but widely used |
| `tabularx` | Tables with auto-width columns | `X` column type |
| `multirow` | Cells spanning multiple rows | |
| `siunitx` | `S` column for aligned numbers | Part of `siunitx` package |

---

## Bibliography

| Package | Purpose | Notes |
|---|---|---|
| `biblatex` | Modern bibliography | **Use with `backend=biber`** |
| `csquotes` | Required by `biblatex` | |

See `modules/bibliography.md` for the full reference.

---

## Chemistry

| Package | Purpose | Notes |
|---|---|---|
| `mhchem` | Chemical formulas and equations | `\ce{H2O}` |
| `chemfig` | Structural molecule drawings | Uses TikZ internally |
| `chemmacros` | Advanced chemistry macros | Includes `chemformula` |
| `chemgreek` | Upright Greek in chemistry | |

See `modules/chemistry.md` for the full reference.

---

## Cross-referencing

| Package | Purpose | Notes |
|---|---|---|
| `hyperref` | Clickable links, PDF metadata | **Load last** (except `cleveref`) |
| `cleveref` | Smart `\cref` (`Equation (1)`) | Load after `hyperref` |
| `varioref` | Page-aware references | `\vref` adds "on page N" |
| `nameref` | Reference by section name | Part of `hyperref` |

---

## Code Listings

| Package | Purpose | Notes |
|---|---|---|
| `listings` | Code blocks | Simple, no extra dependencies |
| `minted` | Syntax highlighting (via Pygments) | Requires `--shell-escape` |
| `pythontex` | Python execution in LaTeX | See `modules/python-latex.md` |

---

## Utilities

| Package | Purpose | Notes |
|---|---|---|
| `todonotes` | `\todo{}` margin notes | Useful during writing |
| `comment` | Comment out large blocks | `\begin{comment}...\end{comment}` |
| `soul` | Highlighting, strikethrough | `\hl{}`, `\st{}` |
| `lipsum` | Lorem ipsum placeholder text | `\lipsum[1-3]` |
| `blindtext` | Multi-language placeholder | |
| `calc` | Arithmetic in LaTeX lengths | `\setlength{\foo}{2\textwidth/3}` |
| `etoolbox` | LaTeX programming tools | |
| `xparse` | Advanced command definition | LaTeX3 command syntax |
| `expl3` | LaTeX3 programming interface | |

---

## Document Classes (Alternatives to `article`)

| Class | Use for |
|---|---|
| `article` | Papers, reports |
| `book` | Books with chapters |
| `report` | Long reports |
| `beamer` | Presentations |
| `scrartcl` / `scrbook` | KOMA-Script alternatives (more flexible) |
| `memoir` | Highly configurable book/article hybrid |
| `amsart` | AMS journal articles |

---

## Deprecated — Do Not Use in New Documents

| Legacy | Modern replacement |
|---|---|
| `BibTeX` / `natbib` | `biblatex` + biber |
| `eqnarray` | `align` (from `mathtools`) |
| `epsfig` | `graphicx` |
| `fullpage` | `geometry` |
| `subfig` / `subfigure` | `subcaption` |
| `tabular` with vertical lines | `booktabs` / `tabularray` |
| `verbatim` for code | `listings` or `minted` |
| `caption2` | `caption` |
| `a4` | `geometry` with `a4paper` |
