# Module: TikZ & PGF Graphics

TikZ ("TikZ ist kein Zeichenprogramm") is the primary graphics system for
LaTeX. It sits on top of the lower-level PGF layer and provides a complete
drawing language capable of producing anything from simple arrows to full
scientific illustrations and plots.

---

## 1. Setup

```tex
\usepackage{tikz}

% Load only the libraries you need:
\usetikzlibrary{arrows.meta, calc, positioning, shapes.geometric,
                decorations.pathmorphing, patterns, backgrounds,
                matrix, fit, through, intersections, graphs, trees,
                mindmap, shadows, fadings}
```

> **Rule**: Load `xcolor` (with options) *before* `tikz` if you need named
> colour sets like `dvipsnames`.

```tex
\usepackage[dvipsnames,svgnames]{xcolor}
\usepackage{tikz}
```

---

## 2. The `tikzpicture` Environment

```tex
\begin{tikzpicture}[options]
  % drawing commands here
\end{tikzpicture}
```

Wrap in a `figure` environment for floating, captioned graphics:

```tex
\begin{figure}[htbp]
  \centering
  \begin{tikzpicture}
    % ...
  \end{tikzpicture}
  \caption{A caption.}
  \label{fig:my-figure}
\end{figure}
```

Inline TikZ (sits on text baseline):

```tex
\tikz \draw (0,0) circle (3pt);
```

---

## 3. Coordinate System

All coordinates are in cm by default unless a unit is given.

| Syntax | Meaning |
|---|---|
| `(2, 1)` | Cartesian: 2cm right, 1cm up |
| `(45:2)` | Polar: 2cm at 45° |
| `+(1,0)` | Relative to last point (doesn't update current) |
| `++(1,0)` | Relative to last point (updates current position) |
| `(A)` | Named coordinate / node anchor |
| `(A.north)` | Named anchor of node A |
| `([xshift=3mm]A)` | Shifted named coordinate |

Change default unit:

```tex
\begin{tikzpicture}[x=1cm, y=0.5cm]
```

---

## 4. Drawing Commands

### 4.1 Lines and Paths

```tex
\draw (0,0) -- (2,0) -- (2,2) -- cycle;  % triangle
\draw[->] (0,0) -- (3,0);                % arrow
\draw[<->] (0,0) -- (0,3);               % double arrow
\draw[dashed] (0,0) -- (2,2);
\draw[dotted, thick] (1,0) -- (1,2);
\draw[ultra thick, red] (0,0) -- (2,0);
```

**Line width keywords**: `ultra thin`, `very thin`, `thin` (default), `thick`,
`very thick`, `ultra thick`.

### 4.2 Curves

```tex
% Bezier curve with control points
\draw (0,0) .. controls (1,2) and (3,2) .. (4,0);

% Smooth curve through points
\draw plot[smooth, tension=0.7] coordinates {(0,0)(1,2)(3,1)(4,3)};
```

### 4.3 Shapes

```tex
\draw (0,0) circle (1cm);
\draw (0,0) ellipse (2cm and 1cm);
\draw (0,0) rectangle (3,2);
\draw (0,0) arc (0:90:1cm);        % arc from 0° to 90°, radius 1cm
```

### 4.4 Fill, Filldraw, Shade

```tex
\fill[blue!30] (0,0) rectangle (2,1);
\filldraw[fill=yellow, draw=black, thick] (0,0) circle (1);
\shade[left color=blue, right color=red] (0,0) rectangle (3,1);
```

---

## 5. Nodes

Nodes are the primary way to place text or labelled shapes.

```tex
\node[options] (name) at (coordinate) {text};
\node[draw, circle] (A) at (0,0) {$A$};
\node[draw, rectangle, rounded corners] (B) at (3,0) {Hello};
```

### Node Anchors

```tex
\draw (A.east) -- (B.west);           % connect by anchor
\draw (A) -- (B);                     % connects centre to centre
\node[above] at (1,1) {label above};
\node[anchor=south west] at (0,0) {corner};
```

Standard anchors: `north`, `south`, `east`, `west`, `north east`,
`north west`, `south east`, `south west`, `center`.

### Node Styles (Common Options)

| Option | Effect |
|---|---|
| `draw` | Draw node border |
| `fill=red!20` | Fill node background |
| `circle` | Circular shape |
| `rectangle` | Default rectangular shape |
| `rounded corners` | Rounded corners |
| `minimum width=2cm` | Force minimum width |
| `minimum height=1cm` | Force minimum height |
| `inner sep=5pt` | Padding inside node |
| `text width=3cm` | Wrap text at given width |
| `align=center` | Text alignment inside node |

---

## 6. Styles: Reusing Appearance Definitions

Define styles in the `tikzpicture` options or globally in the preamble.

```tex
\begin{tikzpicture}[
  mybox/.style  = {draw, rectangle, rounded corners, fill=blue!10,
                   minimum height=8mm, minimum width=2cm},
  myarrow/.style = {-Stealth, thick, blue},
  every node/.style = {font=\small},
]
  \node[mybox] (A) at (0,0) {Start};
  \node[mybox] (B) at (4,0) {End};
  \draw[myarrow] (A) -- (B);
\end{tikzpicture}
```

Define globally in preamble:

```tex
\tikzset{
  decision/.style = {diamond, draw, fill=orange!20,
                     text width=4em, text badly centered,
                     node distance=3cm, inner sep=0pt},
  block/.style    = {rectangle, draw, fill=blue!20,
                     text width=5em, text centered,
                     rounded corners, minimum height=4em},
}
```

---

## 7. Arrows

Load `arrows.meta` for modern arrow tips.

```tex
\usetikzlibrary{arrows.meta}

\draw[-{Stealth}] (0,0) -- (2,0);
\draw[-{Latex[round]}] (0,0) -- (2,0);
\draw[-{Triangle[open]}] (0,0) -- (2,0);
\draw[{Bar[width=3mm]}-{Stealth}] (0,0) -- (2,0);
```

**Common tips**: `Stealth`, `Latex`, `Triangle`, `Bar`, `Bracket`,
`Circle`, `Diamond`, `Rays`.

Scale a tip: `Stealth[length=8pt, width=4pt]`.

---

## 8. The `positioning` Library

```tex
\usetikzlibrary{positioning}

\node (A) {First};
\node[right=2cm of A] (B) {Second};   % 2cm to the right of A
\node[below=1cm of A] (C) {Third};    % 1cm below A
\node[above right=5mm and 1cm of A] (D) {Diagonal};
```

---

## 9. The `calc` Library

```tex
\usetikzlibrary{calc}

% Midpoint of two nodes
\coordinate (M) at ($(A)!0.5!(B)$);

% Point 1cm from A toward B
\coordinate (P) at ($(A)!1cm!(B)$);

% Perpendicular offset: point at 0.5 along A-B, then 1cm perpendicular
\coordinate (Q) at ($(A)!0.5!(B)!1cm!90:(B)$);

% Arithmetic on coordinates
\draw ($(A) + (1,0.5)$) -- ($(B) - (0.3,0)$);
```

---

## 10. Loops: `\foreach`

```tex
% Draw five equally-spaced dots
\foreach \x in {0,1,2,3,4} {
  \filldraw (\x,0) circle (2pt);
}

% Nested loop for a grid
\foreach \x in {0,...,3}
  \foreach \y in {0,...,3}
    \draw (\x,\y) circle (1pt);

% Loop with pairs
\foreach \label/\x in {A/0, B/1.5, C/3} {
  \node[draw,circle] at (\x,0) {\label};
}
```

---

## 11. Clipping

```tex
\begin{scope}
  \clip (0,0) circle (1.5cm);
  \fill[blue!30] (-2,-2) rectangle (2,2);  % only visible inside clip
  \draw[red, thick] (-2,0) -- (2,0);
\end{scope}
```

---

## 12. Transformations

```tex
\begin{scope}[xshift=2cm, yshift=1cm, rotate=30, scale=1.5]
  \draw (0,0) rectangle (1,1);
\end{scope}

% Reflect
\begin{scope}[xscale=-1]
  \draw (0,0) -- (1,0) -- (0.5,1) -- cycle;
\end{scope}
```

---

## 13. Flowcharts

```tex
\usetikzlibrary{shapes.geometric, arrows.meta, positioning}

\tikzset{
  process/.style = {rectangle, draw, fill=blue!15, rounded corners,
                    minimum height=1cm, text width=3cm, align=center},
  decision/.style = {diamond, draw, fill=orange!20,
                     minimum height=1cm, text width=2cm, align=center,
                     inner sep=0pt},
  arrow/.style = {-Stealth, thick},
}

\begin{tikzpicture}[node distance=1.5cm]
  \node[process] (start) {Start};
  \node[process, below=of start] (step1) {Process data};
  \node[decision, below=of step1] (check) {Valid?};
  \node[process, below=of check] (end) {Output result};
  \node[process, right=2cm of check] (error) {Handle error};

  \draw[arrow] (start) -- (step1);
  \draw[arrow] (step1) -- (check);
  \draw[arrow] (check) -- node[right]{Yes} (end);
  \draw[arrow] (check) -- node[above]{No} (error);
  \draw[arrow] (error) |- (step1);
\end{tikzpicture}
```

---

## 14. Trees

```tex
\usetikzlibrary{trees}

\begin{tikzpicture}[
  level distance=1.5cm,
  level 1/.style={sibling distance=4cm},
  level 2/.style={sibling distance=2cm},
  every node/.style={draw, circle},
]
  \node {Root}
    child { node {A}
      child { node {A1} }
      child { node {A2} }
    }
    child { node {B}
      child { node {B1} }
      child { node {B2} }
    };
\end{tikzpicture}
```

---

## 15. Matrices of Nodes

```tex
\usetikzlibrary{matrix}

\begin{tikzpicture}
  \matrix[matrix of nodes, nodes={draw, minimum size=8mm},
          column sep=-\pgflinewidth,
          row sep=-\pgflinewidth] (m) {
    1 & 2 & 3 \\
    4 & 5 & 6 \\
    7 & 8 & 9 \\
  };
  \draw[red, thick] (m-1-1.north west) rectangle (m-2-2.south east);
\end{tikzpicture}
```

---

## 16. Plots with PGFPlots

For mathematical plots, use the separate `pgfplots` package (built on TikZ):

```tex
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}   % always set compatibility

\begin{tikzpicture}
  \begin{axis}[
    xlabel={$x$}, ylabel={$f(x)$},
    xmin=-3, xmax=3,
    grid=major,
    title={Gaussian Curve},
  ]
    \addplot[blue, thick, samples=100, domain=-3:3]
      {exp(-x^2/2) / sqrt(2*pi)};
    \addplot[red, dashed, samples=50, domain=-3:3]
      {x^2/4};
    \legend{$\mathcal{N}(0,1)$, $x^2/4$}
  \end{axis}
\end{tikzpicture}
```

**PGFPlots axis types**: `axis`, `semilogxaxis`, `semilogyaxis`,
`loglogaxis`, `polaraxis` (with `\usetikzlibrary{pgfplots.polar}`).

---

## 17. Externalization (Speed Up Compilation)

For documents with many complex TikZ figures:

```tex
\usetikzlibrary{external}
\tikzexternalize[prefix=tikz-cache/]   % put in preamble
```

Run with: `pdflatex -shell-escape document.tex`

Each TikZ picture is compiled to a separate PDF and cached. Only recompiled
when the picture changes.

---

## 18. TikZ Best Practices

1. **Always comment complex figures** — your collaborators (and future self)
   will thank you.
2. **Define styles, don't repeat options** — use `\tikzset{}` in the preamble.
3. **Use `positioning` library** — `right=of A` is cleaner than manual
   coordinates.
4. **Use `calc` for derived coordinates** — avoids fragile hardcoded values.
5. **Externalise for large documents** — prevents timeouts on Overleaf and
   speeds up local builds.
6. **Keep TikZ code in `\input{}`-able files** — one figure per `.tex` file
   for maintainability.
7. **Use `pgfplots` for data plots** — don't plot data by hand in raw TikZ.
8. **Scale with `[x=..., y=...]`** — never use `\scalebox` around a
   `tikzpicture`.
9. **Load `arrows.meta`** — the old arrow syntax (e.g. `->`) still works, but
   `{Stealth}` from `arrows.meta` is more flexible and better-looking.
10. **Test complex figures standalone** — use `\documentclass{standalone}` to
    iterate quickly.

---

## 19. Standalone Compilation

For fast iteration on a single figure:

```tex
\documentclass[tikz, border=4pt]{standalone}
\usetikzlibrary{positioning, arrows.meta}

\begin{document}
\begin{tikzpicture}
  % your figure here
\end{tikzpicture}
\end{document}
```

Compile with: `pdflatex figure.tex`

---

## 20. Key TikZ Libraries Reference

| Library | Provides |
|---|---|
| `arrows.meta` | Modern, configurable arrow tips |
| `calc` | Coordinate arithmetic |
| `positioning` | Relative node placement (`right=of`) |
| `shapes.geometric` | Diamond, ellipse, cylinder, etc. |
| `shapes.symbols` | Clouds, forbidden signs, etc. |
| `decorations.pathmorphing` | Zigzag, snake, bumps on paths |
| `decorations.markings` | Arrows/marks along paths |
| `patterns` | Hatch, crosshatch, dots fill patterns |
| `shadows` | Drop shadows on nodes |
| `backgrounds` | Background rectangles over groups |
| `matrix` | Grid of nodes |
| `trees` | Tree layouts |
| `graphs` | Graph drawing (needs LuaLaTeX) |
| `mindmap` | Mind map layouts |
| `fadings` | Transparency gradients |
| `spy` | Magnification loupe effect |
| `3d` | 3D coordinate system |
| `perspective` | 3D perspective drawings |

---

## Resources

- Official manual: https://tikz.dev/
- Examples gallery: https://texample.net/tikz/
- PGFPlots manual: https://pgfplots.sourceforge.net/
