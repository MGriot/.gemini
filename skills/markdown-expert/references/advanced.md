# Advanced Markdown Features

## Mermaid Diagrams

Render flowcharts, sequence diagrams, Gantt charts, etc.

### Flowchart
```mermaid
graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]
```

### Sequence Diagram
```mermaid
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
```

## Footnotes (GFM/Pandoc)

A note[^1] in the text.

[^1]: The footnote text.

## Math (GitHub/Pandoc)

GitHub now supports MathJax in Markdown.

- **Inline:** $x^2 + y^2 = z^2$
- **Block:**
$$
\sum_{i=1}^n i = \frac{n(n+1)}{2}
$$

## HTML Embedding

You can mix HTML for things Markdown doesn't support (e.g., centering, specific image sizing).

```html
<img src="image.png" width="200" alt="Alt text">
<p align="center">Centered text</p>
```
