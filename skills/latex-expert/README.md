# LaTeX Expert Skill Kit

A comprehensive, modular skill system for LaTeX document preparation.  
Each module is a self-contained reference covering a major domain of LaTeX usage.

---

## 📁 Structure

```
latex-skill/
├── README.md               ← You are here
├── SKILL.md                ← Main agent entry point (overview + routing)
│
├── modules/
│   ├── tikz.md             ← TikZ & PGF graphics (detailed)
│   ├── geometry.md         ← Page layout with the geometry package
│   ├── bibliography.md     ← Bibliography management (biblatex + biber)
│   ├── chemistry.md        ← Chemistry typesetting (mhchem, chemfig, chemmacros)
│   └── python-latex.md     ← Python integration (PythonTeX, automation)
│
├── references/
│   ├── math.md             ← Math typesetting quick reference
│   └── packages.md         ← Curated package list
│
└── assets/
    ├── template.tex             ← Standard document template
    ├── template-chemistry.tex   ← Chemistry document template
    └── template-pythontex.tex   ← PythonTeX document template
```

---

## 🚀 Quick Start

| Task | Module |
|---|---|
| Draw diagrams, flowcharts, plots | `modules/tikz.md` |
| Set margins, columns, paper size | `modules/geometry.md` |
| Manage citations & bibliography | `modules/bibliography.md` |
| Typeset molecules & reactions | `modules/chemistry.md` |
| Use Python data/code in LaTeX | `modules/python-latex.md` |
| Math environments & operators | `references/math.md` |
| Pick the right package | `references/packages.md` |

---

## 🔧 Compilation Reference

| Goal | Command |
|---|---|
| Compile PDF (standard) | `latexmk -pdf document.tex` |
| Compile with PythonTeX | `pdflatex doc.tex && pythontex doc.tex && pdflatex doc.tex` |
| Clean build artifacts | `latexmk -c` |
| Full clean (including PDF) | `latexmk -C` |

---

## 📚 Authoritative External Resources

- **TikZ manual**: https://tikz.dev/
- **TikZ examples gallery**: https://texample.net/tikz/
- **CTAN package search**: https://ctan.org/
- **Overleaf documentation**: https://www.overleaf.com/learn
- **PythonTeX on GitHub**: https://github.com/gpoore/pythontex
- **biblatex on CTAN**: https://ctan.org/pkg/biblatex

---

*Last updated: 2026. Compatible with TeX Live 2023+, MiKTeX, and Overleaf.*
