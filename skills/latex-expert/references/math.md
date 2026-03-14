# Mathematical Typesetting Reference

Use `mathtools` (which extends `amsmath`) for all math. **Never use `eqnarray`.**

---

## 1. Environments

### `equation` — single numbered equation

```tex
\begin{equation}
  E = mc^2 \label{eq:einstein}
\end{equation}
```

Unnumbered: `equation*` (or `\[...\]`).

### `align` — multi-line, aligned at `&`

```tex
\begin{align}
  f(x) &= x^2 + 2x + 1 \\
       &= (x + 1)^2
\end{align}
```

Unnumbered: `align*`. Number only one line: add `\notag` to the others.

### `subequations` — group with (1a), (1b), ...

```tex
\begin{subequations} \label{eq:system}
\begin{align}
  a &= b + c \label{eq:system-a} \\
  d &= e + f \label{eq:system-b}
\end{align}
\end{subequations}
```

### `gather` — centred, no alignment

```tex
\begin{gather}
  a + b = c \\
  x^2 + y^2 = z^2
\end{gather}
```

### `multline` — break a single long equation

```tex
\begin{multline}
  F = ma + J\dot{\omega} + \frac{1}{2}\rho v^2 C_D A \\
      + \mu_k N + T_{\text{friction}}
\end{multline}
```

### `cases` — piecewise functions

```tex
f(x) = \begin{cases}
  x^2  & \text{if } x \geq 0, \\
  -x^2 & \text{if } x < 0.
\end{cases}
```

### `dcases` (from `mathtools`) — display-size fractions in cases

```tex
f(x) = \begin{dcases}
  \frac{x^2}{2} & x \geq 0, \\
  -\frac{x^2}{2} & x < 0.
\end{dcases}
```

---

## 2. Operators

### Standard named operators

```tex
\sin, \cos, \tan, \exp, \log, \ln, \lim, \max, \min, \sup, \inf
\det, \ker, \dim, \deg, \Pr, \gcd
```

### Custom operators (define in preamble)

```tex
\DeclareMathOperator{\Tr}{Tr}         % trace
\DeclareMathOperator{\rank}{rank}
\DeclareMathOperator*{\argmax}{arg\,max}  % * = subscript below in display
\DeclareMathOperator*{\argmin}{arg\,min}
\DeclareMathOperator{\grad}{\nabla}
```

### Limits and sums

```tex
\lim_{x \to \infty} f(x)
\sum_{k=0}^{n} a_k
\prod_{i=1}^{N} x_i
\int_{-\infty}^{\infty} e^{-x^2} \, dx    % use \, before dx
\iint, \iiint, \oint                        % double/triple/contour
```

---

## 3. Delimiters

### Manual sizing (preferred for inline)

| Command | Output |
|---|---|
| `\lvert x \rvert` | \|x\| (absolute value) |
| `\lVert x \rVert` | ‖x‖ (norm) |
| `\langle x \rangle` | ⟨x⟩ (inner product) |
| `\lceil x \rceil` | ⌈x⌉ (ceiling) |
| `\lfloor x \rfloor` | ⌊x⌋ (floor) |

**Size keywords**: `\big`, `\Big`, `\bigg`, `\Bigg` (apply before left/right):

```tex
\bigl( \frac{a}{b} \bigr)     % use bigl/bigr for paired delimiters
```

### Auto-sizing with `\left` / `\right`

```tex
\left( \frac{a}{b} \right)
\left[ \sum_{k} x_k \right]
\left\{ x \in \mathbb{R} \mid x > 0 \right\}
\left. \frac{df}{dx} \right|_{x=0}   % \right. = invisible right delimiter
```

> Use manual sizing when `\left`/`\right` produces poor results (too large
> or too small). Manual sizing is faster and more predictable.

---

## 4. Matrices

```tex
% Plain matrix (no delimiters)
\begin{matrix} a & b \\ c & d \end{matrix}

% Parentheses
\begin{pmatrix} a & b \\ c & d \end{pmatrix}

% Brackets
\begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}

% Determinant (pipes)
\begin{vmatrix} a & b \\ c & d \end{vmatrix}

% Double pipes
\begin{Vmatrix} a & b \\ c & d \end{Vmatrix}

% Braces (for piecewise in matrix form)
\begin{Bmatrix} a & b \\ c & d \end{Bmatrix}
```

For large matrices with dots:

```tex
\begin{pmatrix}
  a_{11} & a_{12} & \cdots & a_{1n} \\
  a_{21} & a_{22} & \cdots & a_{2n} \\
  \vdots & \vdots & \ddots & \vdots \\
  a_{m1} & a_{m2} & \cdots & a_{mn}
\end{pmatrix}
```

---

## 5. Fractions

```tex
\frac{a}{b}          % inline: small
\dfrac{a}{b}         % display-size always (mathtools)
\tfrac{a}{b}         % text-size always
\cfrac{a}{b+\cfrac{c}{d}}   % continued fraction
```

---

## 6. Text in Math

```tex
\text{some text}         % upright text in math (from amsmath)
\textit{italic text}
\mathrm{upright roman}   % math roman (for named things like "Re", "Im")
\mathbf{v}               % bold vector
\boldsymbol{\alpha}      % bold Greek
\mathbb{R}               % blackboard bold (reals, complexes, etc.)
\mathcal{F}              % calligraphic (Fourier, Laplace, etc.)
\mathfrak{g}             % Fraktur (Lie algebras, etc.)
```

---

## 7. Accents and Modifiers

```tex
\hat{x}      % x̂
\bar{x}      % x̄
\tilde{x}    % x̃
\dot{x}      % ẋ (time derivative)
\ddot{x}     % ẍ
\vec{x}      % x⃗
\overline{AB}        % line over multiple characters
\underline{y}
\overbrace{a+b+c}^{n \text{ terms}}
\underbrace{a+b+c}_{n \text{ terms}}
\widehat{ABC}        % wide hat
\widetilde{ABC}      % wide tilde
```

---

## 8. Spacing in Math

| Command | Space | Use |
|---|---|---|
| `\,` | thin | Before `dx` in integrals |
| `\:` | medium | Between relation and term |
| `\;` | thick | After punctuation in math |
| `\!` | negative thin | Remove space |
| `\quad` | 1em | Between aligned items |
| `\qquad` | 2em | Larger separation |

```tex
\int f(x) \, dx         % correct spacing
\int f(x)dx             % incorrect — no space before dx
```

---

## 9. Theorems and Proofs

```tex
% In preamble:
\usepackage{amsthm}
\newtheorem{theorem}{Theorem}[section]
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{corollary}[theorem]{Corollary}
\newtheorem{proposition}[theorem]{Proposition}
\theoremstyle{definition}
\newtheorem{definition}[theorem]{Definition}
\newtheorem{example}[theorem]{Example}
\theoremstyle{remark}
\newtheorem{remark}{Remark}

% In document:
\begin{theorem}[Name of theorem]
  If $P$ then $Q$.
\end{theorem}

\begin{proof}
  By contradiction. Assume $\neg Q$. Then \ldots\ $\square$
\end{proof}
```

---

## 10. Common Symbols Quick Reference

| Category | Symbols |
|---|---|
| Relations | `\leq \geq \neq \approx \equiv \sim \simeq \cong \propto \ll \gg` |
| Set theory | `\in \notin \subset \subseteq \supset \cup \cap \setminus \emptyset` |
| Logic | `\forall \exists \nexists \neg \land \lor \implies \iff` |
| Arrows | `\to \leftarrow \leftrightarrow \Rightarrow \Leftrightarrow \mapsto` |
| Greek | `\alpha \beta \gamma \delta \epsilon \theta \lambda \mu \pi \rho \sigma \tau \phi \omega` |
| Greek (upper) | `\Gamma \Delta \Theta \Lambda \Pi \Sigma \Phi \Omega` |
| Misc | `\partial \nabla \infty \pm \mp \times \div \cdot \otimes \oplus` |
| Dots | `\ldots \cdots \vdots \ddots` |
