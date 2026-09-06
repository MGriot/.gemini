# Power BI Report Theme JSON — Schema Reference

A report theme is a single JSON file imported via **View → Themes → Browse for themes** in
Power BI Desktop. It sets the palette, typography, and per-visual formatting defaults for the
whole report, so nobody has to restyle 40 visuals by hand.

Generate one with `scripts/generate_theme.py`, then check it with `scripts/validate_theme.py`
before importing — Power BI's own import error messages are close to useless.

```bash
uv run scripts/generate_theme.py --name "My Brand" --palette accessible --output theme.json
uv run scripts/validate_theme.py --theme theme.json
```

---

## Top-level structure

```json
{
  "name": "My Brand Theme",
  "dataColors": ["#0072B2", "#E69F00", "#56B4E9", "#009E73",
                 "#F0E442", "#D55E00", "#CC79A7", "#999999"],
  "background": "#FFFFFF",
  "foreground": "#1C1C1E",
  "tableAccent": "#0072B2",
  "textClasses": { },
  "visualStyles": { }
}
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `name` | **Yes** | string | The only truly required key. Without it the theme silently fails to load. |
| `dataColors` | Recommended | array of hex strings | Series palette. Provide **8** for full coverage; Power BI cycles after that. `#RRGGBB` or `#RGB` only. |
| `background` | Recommended | hex string | Page/canvas background. |
| `foreground` | Recommended | hex string | Default text and icon color. |
| `tableAccent` | Optional | hex string | Table/matrix outline and accent color. |
| `textClasses` | Recommended | object | Named typography classes (see below). |
| `visualStyles` | Optional | object | Per-visual formatting defaults (see below). |

Additional structural colors Power BI accepts: `foregroundNeutralSecondary`,
`backgroundLight`, `backgroundNeutral`, `tableAccent`, `good`, `neutral`, `bad`,
`maximum`, `center`, `minimum`, `null`. The last five drive conditional formatting
and diverging color scales.

---

## `textClasses`

Four classes cover the vast majority of reports. Each accepts `fontFace`, `fontSize`
(points), `fontColor`, `bold`, `italic`, and `underline`.

```json
"textClasses": {
  "callout": { "fontFace": "Segoe UI", "fontSize": 45, "fontColor": "#1C1C1E", "bold": true },
  "title":   { "fontFace": "Segoe UI", "fontSize": 16, "fontColor": "#1C1C1E", "bold": true },
  "header":  { "fontFace": "Segoe UI", "fontSize": 12, "fontColor": "#1C1C1E", "bold": true },
  "label":   { "fontFace": "Segoe UI", "fontSize": 10, "fontColor": "#605E5C" }
}
```

| Class | Drives |
|---|---|
| `callout` | Card and KPI big numbers |
| `title` | Visual titles |
| `header` | Table/matrix column headers, slicer headers |
| `label` | Axis labels, data labels, legend text |

Derived classes (`largeTitle`, `semiboldLabel`, `largeLabel`, `smallLabel`,
`lightLabel`, `boldLabel`) inherit from these and rarely need overriding.

**Font caveat:** `fontFace` must name a font installed on every viewer's machine, and
on the Power BI Service rendering host. Stick to `Segoe UI`, `Segoe UI Light`,
`Arial`, `Calibri`, or `DIN` unless you control every client.

---

## `visualStyles`

Three-level nesting: `visualStyles → <visualType> → <styleName> → <cardName>`.
Use `"*"` as a wildcard at any level. Every property value is an **array of objects**,
even when there is only one — this is the single most common cause of a rejected theme.

```json
"visualStyles": {
  "*": {
    "*": {
      "border":     [{ "show": false }],
      "background": [{ "show": false }],
      "dropShadow": [{ "show": false }],
      "title":      [{ "show": true, "fontColor": { "solid": { "color": "#1C1C1E" } } }]
    }
  },
  "card": {
    "*": {
      "labels":         [{ "color": { "solid": { "color": "#0072B2" } }, "fontSize": 28 }],
      "categoryLabels": [{ "show": true, "fontSize": 11 }],
      "wordWrap":       [{ "show": true }]
    }
  }
}
```

Always define the `"*": { "*": { ... } }` catch-all first — it is what makes the theme
apply to visuals you have not enumerated. `validate_theme.py` warns when it is absent.

### Visual type keys

| Key | Visual |
|---|---|
| `card` | Card |
| `multiRowCard` | Multi-row card |
| `KPI` | KPI |
| `tableEx` | Table (note: **not** `table`) |
| `pivotTable` | Matrix (also accepts `matrix`) |
| `lineChart` | Line chart |
| `barChart` / `columnChart` | Bar / Column |
| `clusteredBarChart` / `clusteredColumnChart` | Clustered variants |
| `lineClusteredColumnComboChart` | Line + clustered column combo |
| `pieChart` / `donutChart` | Pie / Donut |
| `scatterChart` | Scatter |
| `map` / `filledMap` | Maps |
| `slicer` | Slicer |
| `gauge` | Gauge |
| `treemap` | Treemap |
| `waterfallChart` | Waterfall |
| `actionButton` | Button |
| `textbox` / `shape` / `image` | Static elements |

### Color value forms

```json
"fontColor":  { "solid": { "color": "#1C1C1E" } }
"labelColor": { "solid": { "color": { "expr": { "ThemeDataColor": { "ColorId": 0, "Percent": 0 } } } } }
```

The `ThemeDataColor` form references `dataColors` by index (`ColorId`, 0-based) with an
optional lightness `Percent` (-0.5 to 0.5). Prefer it over hard-coded hex inside
`visualStyles` so the whole report re-colors when you swap `dataColors`.

---

## Validation checklist

`scripts/validate_theme.py` enforces all of the following:

- `name` present — **error** if missing; the theme will not load.
- `dataColors` is an array of ≥ 8 valid `#RRGGBB` / `#RGB` strings — warns below 8.
- `background` and `foreground` are hex strings — **error** on any other type.
- All four core `textClasses` present, each with `fontFace` and `fontSize`.
- A `visualStyles["*"]["*"]` wildcard exists.
- Accessibility: warns when a red/green pairing is detected. Roughly 8% of men have
  red-green color blindness, so prefer blue/orange (the `accessible` palette in
  `generate_theme.py` uses the Okabe-Ito safe set).

---

## Common failure modes

| Symptom | Cause |
|---|---|
| "Import failed" with no detail | A property value is a bare object instead of a **one-element array**. |
| Theme loads but nothing changes | No `visualStyles["*"]["*"]` catch-all, and the visuals in use are not enumerated. |
| Table styling ignored | Used `"table"` instead of `"tableEx"`. |
| Fonts look wrong in the Service | `fontFace` names a font not installed on the render host. |
| Colors ignore later palette edits | Hard-coded hex inside `visualStyles` instead of `ThemeDataColor` expressions. |
| Text unreadable in dark themes | `foreground` flipped but `label` `fontColor` left at the light-mode gray. |
