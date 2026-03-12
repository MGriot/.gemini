# Power BI Best Practice Analyzer — Full Rule Catalog

This reference lists all BPA rules enforced by the `check_bpa_rules.py` script,
organized by category and severity.

| ID | Category | Severity | Rule |
|---|---|---|---|
| MDL001 | Modeling | High | Bi-directional relationship detected |
| MDL002 | Modeling | Critical | Many-to-many relationship on high-cardinality column |
| MDL003 | Modeling | High | Float/double data type used as relationship key |
| MDL004 | Modeling | Medium | Auto Date/Time is enabled |
| MDL005 | Modeling | High | No dedicated marked Date table found |
| MDL006 | Modeling | Medium | DateTime column not split into Date + Time |
| DAX001 | DAX | High | Division '/' operator used instead of DIVIDE() |
| DAX002 | DAX | Medium | IFERROR() used in measure |
| DAX003 | DAX | Medium | Iterator (SUMX/AVERAGEX) used for simple column aggregation |
| DAX004 | DAX | Low | Implicit measure (direct column reference) detected |
| DAX005 | DAX | High | Complex sub-expression repeated without VAR |
| DAX006 | DAX | Low | INTERSECT used for virtual relationship (prefer TREATAS) |
| PQ001 | Power Query | High | Custom column step breaks query folding |
| PQ002 | Power Query | Medium | Folding-breaking step placed before filter step |
| SEC001 | Security | Medium | RLS filter applied directly on fact table |
| PERF001 | Performance | Medium | More than 10 visuals on a single report page |
| PERF002 | Modeling | Low | Foreign key column not hidden from Report view |

---

## Detailed Rule Descriptions

### MDL001 — Bi-directional Relationship
**Why it matters:** Bi-directional cross-filtering creates ambiguous filter paths and can cause unexpected calculation results. It also introduces performance overhead because VertiPaq must evaluate filters in both directions.
**When it's OK:** Bridging tables in many-to-many relationships may need bi-directional filtering. Use `CROSSFILTER()` in targeted DAX measures instead.

### MDL002 — Many-to-Many on High-Cardinality
**Why it matters:** Many-to-many relationships with millions of rows on both sides create Cartesian-product-like join semantics internally. This can cause query times to balloon from milliseconds to minutes.
**Resolution:** Introduce a bridge table and decompose into two one-to-many relationships.

### MDL005 — No Date Table
**Why it matters:** All DAX time intelligence functions (DATESYTD, SAMEPERIODLASTYEAR, etc.) require a properly marked Date table with contiguous date rows and no gaps.
**Resolution:** Create with `CALENDARAUTO()` or from a template. Right-click table → Mark as Date Table → select the Date column.

### DAX001 — Division Operator
**Why it matters:** `Ratio = A / B` throws a hard divide-by-zero error when B = 0, crashing the visual. `DIVIDE(A, B, 0)` returns the alternate result silently.

### DAX005 — No Variables (Complex Expression)
**Why it matters:** Without `VAR`, the DAX engine may evaluate a sub-expression multiple times for each row in the filter context. Variables are evaluated once and cached in memory for the duration of the measure evaluation.

**Before:**
```dax
Margin % = ([Total Sales] - [Total Cost]) / [Total Sales]
```
**After:**
```dax
Margin % =
VAR Sales = [Total Sales]
VAR Cost  = [Total Cost]
VAR Gap   = Sales - Cost
RETURN DIVIDE(Gap, Sales, 0)
```

### PERF002 — Unhidden Foreign Keys
**Why it matters:** Foreign key columns (e.g., `Sales[ProductKey]`) pollute the field list and confuse report authors. They should never appear in visuals — users should use the related dimension attribute instead (e.g., `Product[ProductName]`).
