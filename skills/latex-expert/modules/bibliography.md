# Module: Bibliography Management (biblatex + biber)

`biblatex` with the `biber` backend is the modern standard for bibliography
management in LaTeX. It supersedes the legacy BibTeX + `natbib` workflow with
better Unicode support, flexible styles, and a richer data model.

---

## 1. Setup

```tex
\usepackage[
  backend=biber,
  style=authoryear,    % citation style (see §4)
  sorting=nyt,         % sort: name, year, title
  maxcitenames=2,      % "Smith & Jones" not "Smith, Jones, Brown..."
  giveninits=true,     % use initials in bibliography
  urldate=long,        % how to format URL access dates
]{biblatex}

\addbibresource{references.bib}   % .bib file (extension mandatory!)
```

Place `\printbibliography` where you want the bibliography to appear.

---

## 2. Compilation Sequence

```bash
pdflatex document.tex     # first pass: collects cite keys
biber document            # processes .bib file (no extension!)
pdflatex document.tex     # second pass: resolves references
pdflatex document.tex     # third pass: final cross-references
```

Or just use `latexmk -pdf document.tex` — it handles everything automatically.

---

## 3. The `.bib` Database

### Entry Types

```bib
% Journal article
@article{smith2024ml,
  author    = {Smith, Alice and Jones, Bob},
  title     = {Machine Learning in Practice},
  journal   = {Journal of Artificial Intelligence},
  year      = {2024},
  volume    = {12},
  number    = {3},
  pages     = {100--125},
  doi       = {10.1234/jai.2024.12.100},
}

% Book
@book{knuth1984tex,
  author    = {Knuth, Donald E.},
  title     = {The {\TeX}book},
  publisher = {Addison-Wesley},
  year      = {1984},
  edition   = {1},
}

% Book chapter
@incollection{brown2023chapter,
  author    = {Brown, Carol},
  title     = {Statistical Methods},
  booktitle = {Handbook of Research},
  editor    = {White, David},
  publisher = {Academic Press},
  year      = {2023},
  pages     = {45--67},
}

% Conference paper
@inproceedings{lee2024cvpr,
  author    = {Lee, David and Wang, Ming},
  title     = {Vision Transformers Revisited},
  booktitle = {Proceedings of CVPR},
  year      = {2024},
  pages     = {1234--1243},
}

% PhD thesis
@phdthesis{zhang2022thesis,
  author = {Zhang, Wei},
  title  = {Deep Reinforcement Learning for Robotics},
  school = {MIT},
  year   = {2022},
}

% Online resource
@online{latex2024,
  author  = {{LaTeX Project}},
  title   = {LaTeX Documentation},
  url     = {https://www.latex-project.org},
  urldate = {2024-11-01},
  year    = {2024},
}

% Technical report
@techreport{nist2023,
  author      = {{NIST}},
  title       = {Cybersecurity Framework 2.0},
  institution = {National Institute of Standards and Technology},
  year        = {2023},
  number      = {CSWP 29},
}
```

### Citation Key Convention

Use: `<firstauthor><year><keyword>` — e.g. `smith2024ml`, `knuth1984tex`.  
Avoid: `1`, `temp`, `my_paper`, `article2` — these are unmaintainable.

### Special Characters in Author Names

```bib
author = {von Neumann, John},         % "von" in lowercase
author = {{\relax Jr.}, James Brown}, % suffixes
author = {{European Commission}},     % institutional author (braces prevent splitting)
```

---

## 4. Citation Styles

Set via the `style=` option when loading `biblatex`.

| Style | In-text output | Notes |
|---|---|---|
| `authoryear` | (Smith, 2024) | Harvard-style default |
| `authoryear-comp` | (Smith, 2023, 2024) | Compresses same-author |
| `numeric` | [1] | IEEE-like |
| `numeric-comp` | [1–3] | Compressed numeric ranges |
| `alphabetic` | [Smi24] | Like `alpha` in BibTeX |
| `apa` | (Smith, 2024) | Full APA 7th edition |
| `ieee` | [1] | IEEE transactions format |
| `chicago-authordate` | (Smith 2024) | Chicago style |
| `verbose` | Smith 2024, *Title…* | Full footnote citation |
| `reading` | — | Annotated bibliography |

Separate `citestyle` and `bibstyle` if needed:

```tex
\usepackage[backend=biber, bibstyle=numeric, citestyle=authoryear]{biblatex}
```

---

## 5. Citation Commands

| Command | Output | Use for |
|---|---|---|
| `\autocite{key}` | Context-aware | **Preferred default** |
| `\cite{key}` | (Smith, 2024) | Basic in-text |
| `\parencite{key}` | (Smith, 2024) | Parenthetical |
| `\textcite{key}` | Smith (2024) | Author is subject of sentence |
| `\footcite{key}` | Footnote ¹ | Footnote citation |
| `\citeauthor{key}` | Smith | Author name only |
| `\citeyear{key}` | 2024 | Year only |
| `\citetitle{key}` | *Title* | Title only |
| `\fullcite{key}` | Full entry | For printing individual refs |
| `\nocite{key}` | (nothing) | Include in bibliography without citing |
| `\nocite{*}` | (nothing) | Include all `.bib` entries |

With page numbers:

```tex
\autocite[45]{key}          % (Smith, 2024, p. 45)
\autocite[see also][12]{key}% (see also Smith, 2024, p. 12)
```

Multiple citations:

```tex
\autocite{key1,key2,key3}
```

---

## 6. Printing the Bibliography

### Basic

```tex
\printbibliography
```

### With a title

```tex
\printbibliography[title={Works Cited}]
```

### Filtered by type

```tex
\printbibliography[type=article, title={Journal Articles}]
\printbibliography[type=book, title={Books}]
```

### Filtered by keyword

Add `keywords={primary}` to `.bib` entries, then:

```tex
\printbibliography[keyword=primary, title={Primary Sources}]
\printbibliography[keyword=secondary, title={Secondary Sources}]
```

### Per-chapter bibliographies

```tex
\usepackage[refsection=chapter, style=authoryear, backend=biber]{biblatex}

\begin{document}
\chapter{Introduction}
\begin{refsection}
  ...text with \autocite{ref1}...
  \printbibliography[heading=subbibliography]
\end{refsection}
```

---

## 7. Sorting Options

| `sorting=` | Order |
|---|---|
| `nyt` | Name → Year → Title (default) |
| `nty` | Name → Title → Year |
| `nyvt` | Name → Year → Volume → Title |
| `none` | Citation order (for numeric styles) |
| `anyt` | Alphabetic label → Name → Year → Title |
| `ynt` | Year → Name → Title |

---

## 8. Customisation

### Shorten long author lists

```tex
\usepackage[maxbibnames=5, maxcitenames=2, backend=biber]{biblatex}
```

### Add "et al." after N authors

```tex
\usepackage[maxnames=3, minnames=1, backend=biber]{biblatex}
```

### URL settings

```tex
\usepackage[url=false, backend=biber]{biblatex}  % hide URLs
% Or show only for @online:
% Use \DeclareFieldFormat in custom style
```

### Date format

```tex
\usepackage[date=year, backend=biber]{biblatex}  % show year only
```

### Custom bibliography heading

```tex
\defbibheading{bibliography}[\refname]{%
  \section*{#1}%
  \markboth{#1}{#1}%
}
```

---

## 9. Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| `Citation 'key' undefined` | Key not in `.bib` or biber not run | Run `biber document` |
| `I found no \citation commands` | BibTeX called instead of biber | Configure editor to use biber |
| `empty bibliography` | `.bib` path wrong or `\nocite` missing | Check path; use `\addbibresource{./path/refs.bib}` |
| Garbled author names | Encoding issue | Use UTF-8 `.bib` files; ensure biber is used |
| `Package biblatex Warning: File 'document.bcf' not found` | Stale build | Delete `.bcf`/`.bbl` and recompile |

**Nuclear option** (clears all caches):

```bash
latexmk -C && rm -f *.bbl *.bcf *.blg *.run.xml
```

---

## 10. Reference Managers

| Tool | Platform | Integration |
|---|---|---|
| Zotero | All (free) | Better BibTeX plugin → auto-sync `.bib` |
| JabRef | All (free) | Native BibTeX/BibLaTeX editor |
| Mendeley | All (free) | Export `.bib`, less reliable than Zotero |
| CiteDrive | Web (paid) | Native Overleaf integration |

**Recommended**: Zotero + Better BibTeX plugin → exports a continuously
updated `.bib` file linked to your Overleaf or local project.

---

## Resources

- biblatex CTAN: https://ctan.org/pkg/biblatex
- biber CTAN: https://ctan.org/pkg/biber
- Wikibooks guide: https://en.wikibooks.org/wiki/LaTeX/Bibliographies_with_biblatex_and_biber
