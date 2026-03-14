# Module: Chemistry Typesetting

LaTeX has a rich ecosystem for chemistry. This module covers the three main
tools: `mhchem` (formulas and equations), `chemfig` (structural drawings),
and `chemmacros` / `chemformula` (advanced macros and nomenclature).

---

## 1. Package Overview

| Package | Purpose | Use when |
|---|---|---|
| `mhchem` | Chemical formulas and reaction equations | Quick inline formulas, simple equations |
| `chemfig` | 2D structural drawings of molecules | Bond diagrams, ring systems, organic structures |
| `chemmacros` | Complete chemistry macro bundle | Oxidation states, thermodynamic data, IUPAC names |
| `chemformula` | Formula typesetting (part of `chemmacros`) | Faster alternative to `mhchem` |
| `chemgreek` | Upright Greek in chemistry context | Greek letters in chemical contexts |
| `bohr` | Bohr atomic models | Electron shell diagrams |
| `modiagram` | Molecular orbital diagrams | MO theory diagrams |

---

## 2. `mhchem` — Formulas and Equations

### Setup

```tex
\usepackage[version=4]{mhchem}
```

> Always use `version=4`. Older versions have different behaviour.

### The `\ce{}` Command

`\ce{}` handles all chemical typesetting: subscripts, superscripts, charges,
bonds, arrows, and states.

```tex
% Basic formulas
\ce{H2O}          % H₂O
\ce{SO4^2-}       % SO₄²⁻
\ce{NH4+}         % NH₄⁺
\ce{Fe^{II}}      % Fe^II (Roman numeral oxidation)
\ce{^{14}_{6}C}   % isotope notation: ¹⁴₆C

% States of matter
\ce{H2O_{(l)}}    % H₂O(l)
\ce{NaCl_{(aq)}}  % NaCl(aq)

% Bonds
\ce{CH3-CH2-OH}   % ethanol structural
\ce{N#N}          % triple bond
\ce{A=B}          % double bond

% Stoichiometry
\ce{3H2 + N2}
\ce{1/2H2O}       % fractional coefficient
```

### Reaction Equations

```tex
% Forward reaction
\ce{2H2 + O2 -> 2H2O}

% Equilibrium
\ce{N2 + 3H2 <=> 2NH3}

% Reversible (one direction favoured)
\ce{A <--> B}

% With labels above/below arrows
\ce{A ->[\text{cat.}][\Delta] B}

% Resonance
\ce{A <-> B}

% Precipitation and gas
\ce{CaCO3 v}      % precipitate (down arrow)
\ce{CO2 ^}        % gas (up arrow)
```

### Complex Examples

```tex
% Acid-base reaction
\ce{CH3COOH + NaOH -> CH3COO^{-} + Na^{+} + H2O}

% Redox in math mode (for alignment)
\begin{align}
  \ce{&Zn -> Zn^{2+} + 2e^{-}} \\
  \ce{&Cu^{2+} + 2e^{-} -> Cu}
\end{align}

% Nuclear reaction
\ce{^{238}_{92}U -> ^{4}_{2}He + ^{234}_{90}Th}
```

---

## 3. `chemfig` — Structural Drawings

`chemfig` uses TikZ internally to draw 2D molecular structures.

### Setup

```tex
\usepackage{chemfig}
```

### Basic Bond Syntax

```tex
\chemfig{A-B}         % single bond
\chemfig{A=B}         % double bond
\chemfig{A~B}         % triple bond
\chemfig{A-[1]B}      % bond at 45° (predefined unit: 1 = 45°)
\chemfig{A-[:60]B}    % absolute angle 60°
\chemfig{A-[::30]B}   % relative angle +30° from previous bond
```

**Predefined angle units** (0–7, each = 45°):

| Unit | Angle |
|---|---|
| 0 | 0° (right) |
| 1 | 45° |
| 2 | 90° (up) |
| 3 | 135° |
| 4 | 180° (left) |
| 5 | 225° |
| 6 | 270° (down) |
| 7 | 315° |

### Linear Molecules

```tex
\chemfig{H-C(-[2]H)(-[6]H)-C(-[2]H)(-[6]H)-H}  % ethane
```

### Ring Systems

```tex
% Cyclohexane (6-membered ring)
\chemfig{*6(-=-=-=)}

% Benzene with circle
\chemfig{**6(------)}

% Benzene with alternating bonds
\chemfig{*6(-==-==-)}

% Partial ring (5-membered)
\chemfig{*5(-=-=-)}

% Fused rings (naphthalene)
\chemfig{*6(-=*6(-=-=-)-=-=-)}
```

### Named Atoms (Nodes)

```tex
\chemfig{C(-[2]H)(-[6]H)(=[1]O)-[:-30]OH}  % formic acid style
```

### Atom Separation and Bond Length

```tex
\setatomsep{2em}        % distance between atoms (default ~1.7em)
\setbondstyle{thick}    % bond line style
\setdoublesep{0.35ex}   % gap between double bond lines
```

### Arrows for Reaction Schemes

`chemfig` provides `\schemestart` / `\schemestop` for reaction schemes:

```tex
\schemestart
  \chemfig{CH4}
  \arrow{->[\ce{Cl2}][$h\nu$]}
  \chemfig{CH3Cl}
  \+
  \chemfig{HCl}
\schemestop
```

Arrow types:

| Code | Arrow |
|---|---|
| `->` | Forward |
| `<-` | Backward |
| `<->` | Equilibrium |
| `<=>` | Full equilibrium |
| `-/->` | No-reaction |
| `0` | No arrow (for branching) |

### Lewis Structures

```tex
\usepackage{chemmacros}   % for \charge

\chemfig{\charge{90=\:,270=\:}{O}=C=\charge{90=\:,270=\:}{O}}  % CO2
```

### Complex Example: Glucose

```tex
\chemfig{
  HO-[2]-[:30](-[2]OH)-[:-30]
  (-[6]OH)-[:30](-[2]OH)-[:-30]
  (-[6]OH)-[:30]=O
}
```

---

## 4. `chemmacros` — Advanced Chemistry Macros

### Setup

```tex
\usepackage{chemmacros}
\chemsetup{
  formula = chemformula,   % use chemformula as formula engine (faster)
  modules = all,           % load all modules
}
```

Or load individual modules:

```tex
\chemsetup{modules={reactions, spectroscopy, nomenclature}}
```

### Oxidation States

```tex
\ox{+2,Fe}      % Fe^{+II}   (oxidation number)
\ox*{2,Fe}      % Fe²⁺       (formal charge style)
```

### Thermodynamic Data

```tex
\DeltaH{r}      % ΔH_r
\DeltaG         % ΔG
\DeltaS{f}      % ΔS_f

% Full expression
$\DeltaH{r}^{\circ} = \qty{-286}{\kilo\joule\per\mole}$
```

### Compound Numbering (`chemnum`)

```tex
\cmpd{ethanol}          % first use → (1), subsequent → (1)
\cmpd+{ethanol}         % reset numbering
```

### Newman Projections

```tex
\begin{newman}[angle=60]
  \bond{left} \bond{right} \bond{up}
  \backbond{left} \backbond{right} \backbond{down}
\end{newman}
```

### Spectroscopy Module

```tex
\NMR(400)[H]{1}         % ¹H NMR (400 MHz)
\NMR(100)[C]{13}        % ¹³C NMR (100 MHz)
\IR                     % IR
\MS                     % MS
```

---

## 5. `chemformula` — Faster Formula Engine

As an alternative to `mhchem` inside `chemmacros`, `chemformula`'s `\ch{}`
is faster but slightly different syntax:

```tex
\usepackage{chemformula}

\ch{H2O}
\ch{SO4^2-}
\ch{2 H2 + O2 -> 2 H2O}    % note: spaces required around stoichiometry
\ch{A <=> B}
```

---

## 6. Complete Preamble for Chemistry Documents

```tex
\usepackage[version=4]{mhchem}       % inline formulas and equations
\usepackage{chemfig}                 % structural drawings
\usepackage{chemmacros}              % macros, nomenclature, thermodynamics
\usepackage{siunitx}                 % units (e.g. \unit{\kilo\joule\per\mole})
\usepackage[dvipsnames]{xcolor}      % colour (load before tikz/chemfig)

% chemfig global settings
\setatomsep{1.8em}
\setbondstyle{semithick}
\renewcommand*\printatom[1]{\ensuremath{\mathsf{#1}}}  % sans-serif atoms
```

---

## 7. Physical Units in Chemistry

Use `siunitx` (included in the chemistry preamble above) for all quantities:

```tex
\qty{25}{\degreeCelsius}
\qty{1.5}{\molar}           % if using siunitx-extra
\qty{298.15}{\kelvin}
\qty{-286}{\kilo\joule\per\mole}
\qty{3.5e-4}{\mole\per\litre}
\unit{\kilo\joule\per\mole} % unit only, no number
```

---

## 8. Tips and Best Practices

1. **Use `version=4` with `mhchem`** — older versions have subtle differences.
2. **Add spaces inside `\ce{}`** for complex equations — `mhchem` uses them to
   parse sub-expressions correctly.
3. **Use `chemfig` for structural formulas, `mhchem` for inline text** — they
   complement each other.
4. **Load `xcolor` before `chemfig`** (which loads TikZ internally).
5. **Use `\setatomsep`** to get bond lengths that match your font size.
6. **For reaction schemes, use `\schemestart`/`\schemestop`** — it handles
   alignment and arrow placement automatically.
7. **Combine with `siunitx`** for all numeric quantities and units.
8. **Use `chemgreek`** if you need upright Greek letters in names (e.g. α-helix).

---

## Resources

- mhchem: https://ctan.org/pkg/mhchem
- chemfig: https://ctan.org/pkg/chemfig
- chemmacros: https://ctan.org/pkg/chemmacros
- Overleaf chemistry guide: https://www.overleaf.com/learn/latex/Chemistry_formulae
