# Module: Page Layout with `geometry`

The `geometry` package is the standard way to control all aspects of page
dimensions in LaTeX: paper size, margins, header/footer areas, text area,
and multi-column layout.

---

## 1. Basic Setup

```tex
\usepackage[a4paper, margin=2.5cm]{geometry}
```

Options can be passed to `\usepackage` or to `\geometry{}` (which can appear
anywhere in the preamble, or even mid-document for two-sided docs).

---

## 2. Paper Size

| Key | Dimensions |
|---|---|
| `a4paper` | 210 × 297 mm |
| `a5paper` | 148 × 210 mm |
| `letterpaper` | 8.5 × 11 in |
| `legalpaper` | 8.5 × 14 in |
| `b5paper` | 176 × 250 mm |
| `executivepaper` | 7.25 × 10.5 in |

Custom size:

```tex
\usepackage[paperwidth=16cm, paperheight=24cm]{geometry}
```

Landscape mode:

```tex
\usepackage[a4paper, landscape]{geometry}
```

---

## 3. Margin Control

### All margins equal

```tex
\usepackage[margin=2cm]{geometry}
```

### Individual margins

```tex
\usepackage[
  top=3cm,
  bottom=2.5cm,
  left=2cm,
  right=2cm,
]{geometry}
```

### Inner/Outer (for two-sided documents)

```tex
\usepackage[
  inner=3cm,   % binding margin
  outer=2cm,
  top=2.5cm,
  bottom=2.5cm,
  twoside,
]{geometry}
```

---

## 4. Text Area

You can specify the text area dimensions directly instead of margins:

```tex
\usepackage[
  a4paper,
  textwidth=15cm,
  textheight=24cm,
  centering,         % centre the text block on the page
]{geometry}
```

Or use `total` to set `textwidth` and `textheight` together:

```tex
\usepackage[a4paper, total={16cm, 25cm}, centering]{geometry}
```

---

## 5. Header and Footer Areas

```tex
\usepackage[
  a4paper,
  margin=2.5cm,
  includehead,        % include header in the text area
  headheight=15pt,    % required when using fancyhdr
]{geometry}
```

Key options:

| Option | Meaning |
|---|---|
| `includehead` | Include header height in top margin computation |
| `includefoot` | Include footer height in bottom margin computation |
| `headheight=15pt` | Set header height (default is too small for most fonts) |
| `headsep=10pt` | Gap between header and text body |
| `footskip=30pt` | Distance from last text line to footer baseline |

---

## 6. Changing Layout Mid-Document

```tex
% Temporarily switch to landscape for one page
\newgeometry{landscape, margin=1.5cm}
  % wide table or figure here
\restoregeometry
```

`\newgeometry{}` applies from the next page. `\restoregeometry` reverts
to the original settings.

---

## 7. Show the Layout (Debugging)

```tex
\usepackage{geometry}
\usepackage{layout}          % provides \layout command

\begin{document}
\layout                      % prints a diagram of the current layout
\end{document}
```

Or use the `showframe` geometry option for a visual frame overlay:

```tex
\usepackage[showframe, margin=2cm]{geometry}
```

---

## 8. Multi-Column Layout

For two-column documents, use `\twocolumn` or the `multicol` package.

### Two-column via documentclass

```tex
\documentclass[twocolumn]{article}
\usepackage[a4paper, margin=2cm, columnsep=1cm]{geometry}
```

### `multicol` package (more flexible)

```tex
\usepackage{multicol}
\setlength{\columnsep}{1cm}      % gap between columns
\setlength{\columnseprule}{0.4pt} % vertical rule (0pt = no rule)

\begin{multicols}{2}
  Text flows across two balanced columns.
  \columnbreak   % force break to next column
  More text.
\end{multicols}
```

`multicol` supports 2–10 columns and balances them automatically. It cannot
span floats across columns (use `\begin{figure*}` for full-width floats in
`twocolumn` mode instead).

---

## 9. Binding Correction (for Print)

For printed books where the inner margin needs extra space for binding:

```tex
\usepackage[
  a4paper,
  twoside,
  inner=3.5cm,   % extra binding margin
  outer=2cm,
  top=2.5cm,
  bottom=2.5cm,
  bindingoffset=5mm,  % additional constant offset toward spine
]{geometry}
```

---

## 10. Common Presets

### Thesis / book (two-sided)

```tex
\usepackage[
  a4paper, twoside,
  inner=3cm, outer=2.5cm,
  top=3cm, bottom=2.5cm,
  includehead, headheight=15pt,
]{geometry}
```

### IEEE / conference (US Letter, narrow margins)

```tex
\usepackage[
  letterpaper,
  top=0.75in, bottom=1in,
  left=0.625in, right=0.625in,
]{geometry}
```

### A5 booklet

```tex
\usepackage[
  a5paper, margin=1.8cm,
  headheight=14pt,
]{geometry}
```

### Wide text area for drafts

```tex
\usepackage[a4paper, margin=1.5cm]{geometry}
```

---

## 11. `geometry` vs. Alternatives

| Method | When to use |
|---|---|
| `geometry` | Always — it's the standard |
| `\textwidth=...` directly | Only tiny adjustments in a class that sets it |
| `vmargin` | Legacy only |
| `fullpage` | Deprecated — use `geometry` instead |

---

## 12. Key Dimensions Reference

The following dimensions are set by `geometry` and can be read with `\the`:

```tex
\the\textwidth       % main column width
\the\textheight      % main column height
\the\linewidth       % current line width (may differ in lists etc.)
\the\paperwidth
\the\paperheight
\the\topmargin
\the\oddsidemargin
\the\evensidemargin
```

---

## Resources

- CTAN: https://ctan.org/pkg/geometry
- Overleaf guide: https://www.overleaf.com/learn/latex/Page_size_and_margins
