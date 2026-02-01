# Recommended LaTeX Packages

## Core
- **mathtools**: Improvements to `amsmath`. Essential for math.
- **biblatex**: Modern bibliography management. Use with `backend=biber`.
- **fontspec**: Font selection (requires XeLaTeX or LuaLaTeX).

## Formatting
- **geometry**: Page margins and dimensions.
- **microtype**: Improves spacing and kerning.
- **siunitx**: Consistent unit formatting (e.g., `\qty{10}{\meter}`).
- **csquotes**: Context-sensitive quotation marks.

## Elements
- **graphicx**: Image inclusion.
- **booktabs**: Professional quality tables (avoid vertical lines).
- **tabularray**: Modern, powerful table creation.
- **hyperref**: PDF metadata and clickable links. Load last (usually).
- **cleveref**: Intelligent cross-referencing (e.g., `\cref{eq:1}` -> "Equation (1)"). Load after `hyperref`.
