---
name: powerbi-expert
description: >
  Expert Power BI assistant for analyzing, optimizing, designing, and troubleshooting Power BI 
  solutions end-to-end. Use this skill whenever the user mentions Power BI, PBIX, PBIP, DAX, 
  Power Query, M code, semantic models, report themes, KPI dashboards, data models, DirectQuery, 
  Import Mode, VertiPaq, or any Power BI Desktop/Service topic. Trigger even for vague requests 
  like "my dashboard is slow", "fix my DAX formula", "make a better report", "create a theme", 
  "check my data model", "what visuals should I use", or "help me with Power BI". This skill 
  covers: performance tuning, DAX best practices, Star Schema modeling, report theme JSON 
  generation, PBIP project structure, KPI design, Power Query / M optimization, Row-Level 
  Security (RLS), incremental refresh, and deployment pipelines.
---

## Skill Overview

This skill provides production-grade Power BI guidance across five domains:
1. **Data Modeling** — Star Schema, relationships, storage modes
2. **DAX Optimization** — Measures, variables, pattern library
3. **Dashboard & KPI Design** — Visual selection, layout, UX
4. **Themes & PBIP** — JSON theme generation, project structure
5. **Power Query / M** — Query folding, transformation best practices

## Available Scripts

| Script | Purpose | Run With |
|---|---|---|
| `scripts/check_bpa_rules.py` | Audit semantic model for BPA violations | `uv run scripts/check_bpa_rules.py --model <path>` |
| `scripts/validate_theme.py` | Validate report theme JSON structure | `uv run scripts/validate_theme.py --theme <path>` |
| `scripts/generate_theme.py` | Generate a custom report theme JSON | `uv run scripts/generate_theme.py --palette <name>` |
| `scripts/dax_formatter.py` | Format and lint a DAX measure string | `uv run scripts/dax_formatter.py --measure "<DAX>"` |

## Reference Files

- `references/dax-patterns.md` — Common DAX patterns: YTD, MTD, Rolling, Ranking, Pareto
- `references/bpa-rules.md` — Full Best Practice Analyzer rule catalog with severity ratings
- `references/theme-schema.md` — Power BI report theme JSON schema with all fields documented
- `references/m-patterns.md` — Power Query M patterns: query folding, custom functions, error handling

---

## 1. Data Modeling Best Practices

### Star Schema (Non-Negotiable)
- **Always** design around a Star Schema: one or more fact tables at the center, dimension tables surrounding them.
- Avoid Snowflake schemas — they add join complexity with minimal benefit in VertiPaq.
- If you receive a Snowflake model, recommend flattening dimensions with Power Query merges.

### Relationships
- Use **surrogate integer keys** (e.g., `DateKey INT`, `ProductKey INT`) — never string or float keys.
- Set relationships to **single-direction** unless cross-filtering is absolutely required.
- Avoid many-to-many relationships on high-cardinality columns. Use a bridge table instead.
- Check for **inactive relationships** — use `USERELATIONSHIP()` in DAX to activate them selectively.

### Storage Mode Decision Tree
```
Is data > 1 billion rows or requires real-time updates?
  YES → DirectQuery (with aggregations for performance)
  NO  → Import Mode (maximum VertiPaq compression and speed)
        Is the table a large fact table with daily batch refresh?
          YES → Enable Incremental Refresh
          NO  → Standard scheduled refresh
```

### Cardinality Reduction Checklist
- [ ] Disable **Auto Date/Time** (File > Options > Data Load)
- [ ] Create a dedicated **Date table** with `CALENDARAUTO()` or a pre-built template
- [ ] Split DateTime columns into separate **Date** and **Time** columns
- [ ] Replace float/decimal columns with fixed-precision integers where possible
- [ ] Remove unused columns **before** loading (not after — saves VertiPaq memory)
- [ ] Use integer encoding for status/category columns (e.g., `1=Active`, `0=Inactive`)

---

## 2. DAX Optimization

### Core Rules
| ❌ Avoid | ✅ Use Instead | Reason |
|---|---|---|
| `[Sales] / [Cost]` | `DIVIDE([Sales], [Cost], 0)` | Handles division by zero gracefully |
| `IFERROR(...)` | Preventive logic with `IF(ISBLANK(...))` | IFERROR is expensive; it evaluates both branches |
| `SUMX(Table, ...)` for simple totals | `SUM(Table[Column])` | Iterators have overhead; use aggregators when possible |
| `INTERSECT` for virtual joins | `TREATAS` | TREATAS is more expressive and performant |
| Repeated complex sub-expressions | `VAR x = <expr> RETURN x` | Variables are evaluated once and cached |
| `CALCULATE(SUM(...), ALL(...))` inline | Extract to a named base measure | Readability and reuse |

### Variable Pattern (Always Use)
```dax
Profit Margin % =
VAR TotalSales = [Total Sales]
VAR TotalCosts = [Total Costs]
VAR Margin = DIVIDE(TotalSales - TotalCosts, TotalSales, 0)
RETURN
    IF(TotalSales = 0, BLANK(), Margin)
```

### Time Intelligence Patterns
Always verify a marked Date table exists before applying time intelligence.
```dax
-- Year-to-Date
Sales YTD = CALCULATE([Total Sales], DATESYTD('Date'[Date]))

-- Prior Year Comparison
Sales PY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))

-- Rolling 12 Months
Sales R12M = CALCULATE([Total Sales], DATESINPERIOD('Date'[Date], LASTDATE('Date'[Date]), -12, MONTH))
```

→ For the full pattern library, read `references/dax-patterns.md`

---

## 3. Dashboard & KPI Design

### Page Layout Rules
- **Maximum 8 visuals per page** — every additional visual adds query overhead ("death by a thousand cuts").
- Use **bookmarks** to hide/show panels rather than placing everything on screen simultaneously.
- Reserve **top 15–20%** of the page for a navigation bar and global filters/slicers.
- All visuals on a page must share a coherent **data grain** — avoid mixing order-level and customer-level visuals.

### KPI Card Standard (The "TVGT" Framework)
Every KPI card must include all four elements:

| Element | Description | Example |
|---|---|---|
| **T**arget | The goal/benchmark | Budget: $1.2M |
| **V**alue | Actual current figure | Actual: $1.05M |
| **G**ap | Variance (absolute + %) | -$150K (-12.5%) |
| **T**rend | Direction over time | Sparkline / up-down arrow |

- Limit to **5 KPI cards per page** maximum.
- Color-code with **accessible palettes**: use Blue/Orange instead of Red/Green (color-blind safe).
- Use conditional formatting for gap columns — never rely on the user reading numbers.

### Visual Selection Guide
| Use Case | Recommended Visual | Avoid |
|---|---|---|
| KPI summary | Native KPI, Card (new), Deneb | SVG concatenation hacks |
| Time series | Line chart, Area chart | Pie charts for time data |
| Ranking / Pareto | Bar chart + line combo | 3D charts (any) |
| Geo distribution | Filled map, Azure Maps | Custom map SVGs |
| Table with variance | Matrix with conditional formatting | Plain table without formatting |
| Small multiples | Small multiples (native) | Many individual charts |

### Certified vs. Custom Visuals
- Prefer **native visuals** → **certified AppSource visuals** → **Deneb (Vega-Lite)** in that order.
- Avoid SVG-DAX string concatenation workarounds — unmaintainable and fragile.
- Never use uncertified visuals in production reports (security and refresh risk).

---

## 4. Report Themes & PBIP

### Generating a Report Theme
When asked to create a theme, always output a valid JSON following this structure:

```json
{
  "name": "Custom Theme Name",
  "dataColors": ["#1B6CA8","#E07B39","#2E8B57","#8B2FC9","#C42B1C","#0D7D6C","#A67B2C","#5C5C5C"],
  "background": "#FFFFFF",
  "foreground": "#252423",
  "tableAccent": "#1B6CA8",
  "textClasses": {
    "callout": { "fontFace": "Segoe UI", "fontSize": 45, "fontColor": "#252423", "bold": true },
    "title":   { "fontFace": "Segoe UI", "fontSize": 16, "fontColor": "#252423", "bold": true },
    "header":  { "fontFace": "Segoe UI", "fontSize": 12, "fontColor": "#252423", "bold": true },
    "label":   { "fontFace": "Segoe UI", "fontSize": 10, "fontColor": "#605E5C" }
  },
  "visualStyles": {
    "*": {
      "*": {
        "border": [{ "show": false }],
        "background": [{ "show": false }],
        "dropShadow": [{ "show": false }]
      }
    },
    "tableEx": {
      "*": {
        "grid": [{ "gridVertical": false, "rowPadding": 6 }],
        "columnHeaders": [{ "bold": true, "wordWrap": true }],
        "values": [{ "wordWrap": true }]
      }
    },
    "lineChart": {
      "*": {
        "legend": [{ "position": "Top" }],
        "categoryAxis": [{ "showAxisTitle": false }]
      }
    }
  }
}
```

Use `scripts/generate_theme.py` to produce full themes programmatically.

### PBIP Project Structure
```
MyReport.pbip
├── MyReport.Report/
│   ├── report.json            ← Visual layout (DO NOT hand-edit)
│   ├── definition.pbir        ← Report metadata
│   └── StaticResources/
│       └── RegisteredResources/
│           └── theme.json     ← ✅ Safe to edit: your custom theme goes here
└── MyReport.SemanticModel/
    ├── definition.pbism       ← Model metadata
    ├── model.bim              ← ✅ Safe to edit: tables, measures, relationships
    └── .pbi/
        └── localSettings.json ← ❌ Do NOT commit: user-local settings
```

**PBIP Safety Rules:**
- `report.json` and `diagramLayout.json` — **never edit manually**, high corruption risk.
- Add `.pbi/localSettings.json` to `.gitignore`.
- `model.bim` is safe to edit for adding measures, updating expressions, changing formatting.
- Use **Tabular Editor 3** or **ALM Toolkit** for programmatic model changes.

---

## 5. Power Query / M Optimization

### Query Folding (Critical)
Query folding pushes transformations back to the data source (SQL Server, etc.), dramatically reducing load on the Power BI engine.

**Folding-safe transformations:**
- Filter rows, remove columns, rename columns, change data types (native)
- Group by, sort, merge (inner/left joins on indexed columns)

**Folding-breaking transformations (use sparingly, move to end):**
- Custom columns with M functions, `List.Generate`, `Table.AddColumn` with complex logic
- Always check: right-click a step → "View Native Query" — if grayed out, folding is broken.

### M Best Practices
```m
// Good: Folding preserved — filter early
let
    Source = Sql.Database("server", "db"),
    Sales = Source{[Schema="dbo", Item="Sales"]}[Data],
    FilteredRows = Table.SelectRows(Sales, each [Year] = 2024),  // ← folds
    RemovedCols = Table.SelectColumns(FilteredRows, {"Date","Amount","ProductKey"})
in
    RemovedCols

// Bad: Custom column breaks folding for all subsequent steps
AddedColumn = Table.AddColumn(Sales, "Custom", each Text.Upper([Status]))  // ← breaks fold
```

→ For reusable M patterns, read `references/m-patterns.md`

---

## 6. Row-Level Security (RLS)

### Static RLS
```dax
// In the Region dimension table filter
[RegionCode] = USERNAME()
```

### Dynamic RLS (Recommended for production)
```dax
// User mapping table approach
[Email] = USERPRINCIPALNAME()
```

**RLS Checklist:**
- [ ] Test with "View as Role" in Power BI Desktop before publishing.
- [ ] Ensure RLS filters propagate correctly across **all** relationships from the filtered table.
- [ ] Do not apply RLS on the fact table directly — filter via dimension tables to leverage relationship propagation.
- [ ] Use Object-Level Security (OLS) in Tabular Editor to hide sensitive columns entirely.

---

## 7. Deployment Checklist

Before publishing to Power BI Service, verify:
- [ ] All measures use `VAR` for complex expressions
- [ ] `DIVIDE()` used everywhere instead of `/`
- [ ] No bi-directional relationships on high-cardinality columns
- [ ] Date table is marked as a Date table (`Mark as Date Table`)
- [ ] Auto Date/Time is disabled
- [ ] Report theme JSON is embedded or linked from `StaticResources/`
- [ ] All visuals are certified or native
- [ ] RLS roles tested with "View as Role"
- [ ] Incremental refresh configured for tables > 1M rows
- [ ] Sensitivity labels applied (if using Microsoft Purview / Information Protection)
- [ ] Gateway configured for on-premises data sources

