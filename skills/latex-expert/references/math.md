# Mathematical Typesetting Reference

## Environments

### align (Recommended)
Use for almost all display math.
```tex
\begin{align}
    f(x) &= x^2 + 2x + 1 \\
         &= (x+1)^2
\end{align}
```

### subequations
Number equations as (1a), (1b), etc.
```tex
\begin{subequations}
\begin{align}
    a &= b + c \\
    d &= e + f
\end{align}
\end{subequations}
```

## Operators

Define custom operators in the preamble for correct spacing.
```tex
\DeclareMathOperator{\Tr}{Tr}
\DeclareMathOperator*{\argmax}{arg\,max}
```

## Delimiters

| Command | Output |
| :--- | :--- |
| `\lvert x \rvert` | $|x|$ |
| `\lVert x \rVert` | $\|x\|$ |
| `\langle x \rangle` | $\langle x \rangle$ |

```