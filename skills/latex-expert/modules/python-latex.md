# Module: Python Integration — PythonTeX & Automation

This module covers two distinct but related topics:

1. **PythonTeX** — run Python code *inside* a `.tex` file and embed results.
2. **LaTeX from Python** — generate or populate `.tex` files from external
   Python scripts using templates and variable injection.

---

## 1. PythonTeX Overview

PythonTeX executes Python code blocks embedded in your LaTeX document and
includes their output directly in the compiled PDF. Code is only re-executed
when it changes, making re-compilation fast.

**Supported languages**: Python (primary), Bash, Julia, R, Ruby, Rust,
JavaScript, Octave, and more.

---

## 2. PythonTeX Setup

### Requirements

- TeX Live 2020+ or MiKTeX (PythonTeX is included)
- Python 3.x installed
- `pygments` Python package: `pip install pygments`

### Preamble

```tex
\usepackage{pythontex}
```

### Compilation Sequence

```bash
pdflatex document.tex      # pass 1: write .pytxcode
pythontex document.tex     # run Python, write output files
pdflatex document.tex      # pass 2: include Python output
```

Or automate with `latexmk`:

```ini
# In .latexmkrc
add_cus_dep('pytxcode', 'pytxminted', 0, 'pythontex');
sub pythontex {
  system("pythontex \"$_[0]\"");
}
```

---

## 3. Core Environments and Commands

### Inline `\py{}` — evaluate an expression

```tex
% In document body:
The square root of 2 is $\py{2**0.5:.4f}$.

% Python format spec works:
Pi to 6 places is $\py{3.14159265358979:.6f}$.
```

### `pycode` — execute a block, capture print output

```tex
\begin{pycode}
import math
result = math.factorial(10)
print(f"$10! = {result}$")    % print() sends LaTeX to document
\end{pycode}
```

To include printed output in the document, `print()` output is automatically
inserted after the environment.

### `pyblock` — execute and typeset the code (with highlighting)

```tex
\begin{pyblock}
x = [i**2 for i in range(5)]
print(x)
\end{pyblock}

\printpythontex   % inserts the output of the above block
```

### `pyconsole` — emulate an interactive Python session

```tex
\begin{pyconsole}
x = 42
x * 3
import math
math.sqrt(x)
\end{pyconsole}
```

### `\pyc{}` — execute a statement (no output)

```tex
\pyc{import numpy as np; data = [1,2,3,4,5]}
The mean is $\py{np.mean(data)}$.
```

---

## 4. Passing Variables

### Defining in Python, using in LaTeX

```tex
\begin{pycode}
speed_of_light = 299792458     # m/s
planck_h       = 6.626e-34     # J·s
avogadro       = 6.022e23
\end{pycode}

The speed of light is $c = \py{speed_of_light:,}$ m/s.

Planck's constant: $h = \py{planck_h:.3e}$ J$\cdot$s.
```

### Persistent sessions

By default, all `pycode` / `py` commands share the same session within
a document. Variables set in one block are available in all later blocks.

Named sessions allow isolated namespaces:

```tex
\begin{pycode}[session=analysis]
data = [10, 20, 30]
\end{pycode}

\py[analysis]{sum(data)}    % uses the 'analysis' session
```

### Passing LaTeX values to Python

```tex
\setpythontexcontext{pagewidth=\the\textwidth, fontsize=12}

\begin{pycode}
ctx = pytex.context
width = float(ctx.pagewidth.replace('pt',''))
\end{pycode}
```

---

## 5. SymPy Integration

PythonTeX provides special `sympy`-prefixed environments that auto-format
mathematical expressions via SymPy's LaTeX printer:

```tex
\usepackage{pythontex}

\begin{sympycode}
from sympy import *
x = symbols('x')
f = x**3 - 2*x + 1
\end{sympycode}

The derivative of $\sympy{f}$ is $\sympy{diff(f, x)}$.

The integral is:
\[
  \int \sympy{f} \, dx = \sympy{integrate(f, x)} + C
\]

Solving $\sympy{f} = 0$:
\[
  x \in \sympy{solve(f, x)}
\]
```

### Step-by-step solutions

```tex
\begin{sympyblock}
from sympy import *
x = symbols('x')
expr = x**2 + 3*x + 2
step1 = factor(expr)
roots = solve(expr)
\end{sympyblock}

Factoring: $\sympy{expr} = \sympy{step1}$

Roots: $x = \sympy{roots}$
```

---

## 6. Matplotlib Plots

```tex
\begin{pycode}
import matplotlib
matplotlib.use('pgf')    # use PGF backend for native LaTeX fonts
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2*np.pi, 200)

fig, ax = plt.subplots(figsize=(4, 2.5))
ax.plot(x, np.sin(x), label=r'$\sin(x)$')
ax.plot(x, np.cos(x), label=r'$\cos(x)$')
ax.set_xlabel(r'$x$')
ax.legend()
ax.grid(True, alpha=0.3)
fig.tight_layout()
fig.savefig('plot.pdf')
plt.close()
\end{pycode}

\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.7\linewidth]{plot.pdf}
  \caption{Sine and cosine functions.}
  \label{fig:sincos}
\end{figure}
```

**Tip**: Use `matplotlib.use('pgf')` with a pgf configuration block in the
preamble to match your document's fonts exactly:

```tex
\usepackage{pgf}
```

```python
matplotlib.rcParams.update({
    "pgf.texsystem": "pdflatex",
    "font.family": "serif",
    "text.usetex": True,
    "pgf.rcfonts": False,
})
```

---

## 7. Automated Document Generation from Python

When you don't need code execution inside LaTeX but want to *generate* `.tex`
files programmatically from Python data.

### Method 1: f-strings / string formatting

```python
# generate_report.py
data = {
    "title": "Annual Report 2024",
    "author": "Alice Smith",
    "value": 1_234_567,
    "pct_change": 12.3,
}

template = r"""
\documentclass{{article}}
\title{{{title}}}
\author{{{author}}}
\begin{{document}}
\maketitle

Total revenue: \${value:,}
\\
Year-on-year change: {pct_change:.1f}\%

\end{{document}}
""".format(**data)

with open("report.tex", "w") as f:
    f.write(template)
```

Note: double braces `{{` escape to `{` in Python format strings.

### Method 2: Jinja2 Templates (Recommended for Complex Documents)

Install: `pip install Jinja2`

```python
# template.tex.j2
\documentclass{article}
\title{ {{- title -}} }
\author{ {{- author -}} }
\begin{document}
\maketitle

\begin{itemize}
{% for item in items %}
  \item {{ item.name }}: \${{ "%.2f"|format(item.value) }}
{% endfor %}
\end{itemize}

\end{document}
```

```python
# render.py
from jinja2 import Environment, FileSystemLoader
import subprocess

env = Environment(
    loader=FileSystemLoader('.'),
    block_start_string=r'\BLOCK{',    # avoid clash with LaTeX braces
    block_end_string='}',
    variable_start_string=r'\VAR{',
    variable_end_string='}',
    comment_start_string=r'\#{',
    comment_end_string='}',
    line_statement_prefix='%%',
    trim_blocks=True,
    autoescape=False,
)

template = env.get_template('template.tex.j2')
output = template.render(
    title="Product Report",
    author="Alice",
    items=[
        {"name": "Widget A", "value": 49.99},
        {"name": "Widget B", "value": 129.00},
    ]
)

with open("output.tex", "w") as f:
    f.write(output)

subprocess.run(["pdflatex", "output.tex"])
```

---

## 8. Reading Data Files into LaTeX

### CSV data via Python + PythonTeX

```tex
\begin{pycode}
import csv

with open('data.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Build a LaTeX table
print(r'\begin{tabular}{lrr}')
print(r'\toprule')
print(r'Name & Value & Unit \\')
print(r'\midrule')
for row in rows:
    print(f"{row['name']} & {float(row['value']):.2f} & {row['unit']} \\\\")
print(r'\bottomrule')
print(r'\end{tabular}')
\end{pycode}
```

### JSON configuration file

```tex
\begin{pycode}
import json

with open('config.json') as f:
    cfg = json.load(f)

author   = cfg['author']
version  = cfg['version']
\end{pycode}

This is version \py{version} of the software.
```

---

## 9. `depythontex` — Journal Submission

For journal submission (which typically requires pure LaTeX), `depythontex`
converts a PythonTeX document into a standalone `.tex` file with all Python
output inlined:

```bash
depythontex document.tex
```

This produces `document-depythontex.tex` — a plain LaTeX file suitable for
submission.

---

## 10. Security Note

> **Warning**: PythonTeX executes arbitrary Python code on your computer.
> Only compile PythonTeX documents you trust. Do NOT compile documents
> received from unknown sources with PythonTeX enabled.

Enable `\restoredefaults` or `autoprint=false` to limit automatic output.

---

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| `??` appears in output | Run `pythontex` step; code not yet executed |
| `ModuleNotFoundError: pygments` | `pip install pygments` |
| Plot not showing | Check file path; run all three compilation steps |
| Variable undefined | Make sure it's in the same session |
| Stale output after code change | Delete `pythontex-files-*/` directory and recompile |
| Conflict with `minted` | Load packages in correct order; see `minted` docs |

---

## Resources

- PythonTeX GitHub: https://github.com/gpoore/pythontex
- PythonTeX gallery (examples): included in TeX Live at
  `texdoc pythontex-gallery`
- Jinja2 for Python: https://jinja.palletsprojects.com/
