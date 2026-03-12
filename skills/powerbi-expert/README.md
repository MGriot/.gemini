# Power BI Expert Skill v2.0

An AI agent skill for end-to-end Power BI development — modeling, DAX, dashboards, themes, and deployment.

## What's Inside

```
powerbi-expert/
├── SKILL.md                        ← Main skill definition & guidelines
├── README.md                       ← This file
├── scripts/
│   ├── check_bpa_rules.py          ← Best Practice Analyzer audit tool
│   ├── validate_theme.py           ← Theme JSON validator
│   ├── generate_theme.py           ← Theme JSON generator (5 palettes)
│   └── dax_formatter.py            ← DAX measure linter & formatter
├── references/
│   ├── dax-patterns.md             ← Production DAX pattern library
│   ├── bpa-rules.md                ← Full BPA rule catalog (17 rules)
│   └── m-patterns.md               ← Power Query M pattern library
└── evals/
    └── evals.json                  ← 8 test cases across all domains
```

## Quick Start

### Run the BPA Analyzer
```bash
uv run scripts/check_bpa_rules.py --model path/to/model.bim --format text
```

### Validate a Theme
```bash
uv run scripts/validate_theme.py --theme path/to/mytheme.json
```

### Generate a Theme
```bash
# List available palettes
uv run scripts/generate_theme.py --list-palettes

# Generate a theme
uv run scripts/generate_theme.py --name "Finance Corp" --palette finance --output finance-theme.json
```

### Lint a DAX Measure
```bash
uv run scripts/dax_formatter.py --measure "Margin = SUM(Sales[Amt]) / SUM(Cost[Amt])"
```

## Coverage

| Domain | Topics |
|---|---|
| Data Modeling | Star Schema, relationships, storage modes, cardinality |
| DAX | Time intelligence, ranking, Pareto, RFM, semi-additive, variables |
| Dashboard Design | KPI TVGT framework, visual selection, page layout |
| Themes | JSON generation, 5 palettes, accessibility, validation |
| Power Query | Query folding, M patterns, Date table, error handling |
| Security | RLS static/dynamic, OLS, fact vs dimension filtering |
| PBIP | File structure, Git safety, Tabular Editor guidance |
| Deployment | Pre-publish checklist, incremental refresh, sensitivity labels |

## Installation

Place this folder in your agent's skill directory:
```
~/.agentskills/powerbi-expert/
```

The agent will automatically load `SKILL.md` when Power BI topics are detected.
