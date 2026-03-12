# Power Query M Patterns

A library of reusable, folding-aware Power Query M patterns for common ETL scenarios.

---

## Table of Contents
1. [Query Folding Patterns](#query-folding-patterns)
2. [Date Table Generation](#date-table-generation)
3. [Error Handling](#error-handling)
4. [Custom Functions](#custom-functions)
5. [Dynamic Parameters](#dynamic-parameters)
6. [Unpivoting & Pivoting](#unpivoting--pivoting)

---

## Query Folding Patterns

### Folding-Safe Pipeline (SQL Server)
```m
let
    Source        = Sql.Database("server.database.windows.net", "SalesDB"),
    SalesTable    = Source{[Schema="dbo", Item="FactSales"]}[Data],
    // ✅ These steps fold to SQL:
    FilterYear    = Table.SelectRows(SalesTable, each [SalesYear] = 2024),
    RemoveCols    = Table.SelectColumns(FilterYear, {"OrderDate","Amount","ProductKey","CustomerKey"}),
    TypedCols     = Table.TransformColumnTypes(RemoveCols, {
                        {"OrderDate", type date},
                        {"Amount", type number}
                    }),
    // ⚠ These steps break folding — place last:
    AddedQtr      = Table.AddColumn(TypedCols, "Quarter", each "Q" & Text.From(Date.QuarterOfYear([OrderDate])))
in
    AddedQtr
```

### Verify Folding
Right-click any step in the Applied Steps pane → **View Native Query**.
- If you see a SQL statement → folding is active ✅
- If the option is greyed out → folding is broken at or before this step ❌

---

## Date Table Generation

### Robust Date Table (M)
```m
let
    StartDate  = #date(2018, 1, 1),
    EndDate    = Date.EndOfYear(Date.From(DateTime.LocalNow())),
    DayCount   = Duration.Days(EndDate - StartDate) + 1,
    DateList   = List.Dates(StartDate, DayCount, #duration(1, 0, 0, 0)),
    DateTable  = Table.FromList(DateList, Splitter.SplitByNothing(), {"Date"}),
    TypedDate  = Table.TransformColumnTypes(DateTable, {{"Date", type date}}),
    AddYear    = Table.AddColumn(TypedDate,  "Year",        each Date.Year([Date]),                   Int64.Type),
    AddQtr     = Table.AddColumn(AddYear,    "Quarter",     each "Q" & Text.From(Date.QuarterOfYear([Date])), type text),
    AddMonth   = Table.AddColumn(AddQtr,     "MonthNum",    each Date.Month([Date]),                  Int64.Type),
    AddMonthNm = Table.AddColumn(AddMonth,   "MonthName",   each Date.ToText([Date], "MMMM"),         type text),
    AddMonthSh = Table.AddColumn(AddMonthNm, "MonthShort",  each Date.ToText([Date], "MMM"),          type text),
    AddWeek    = Table.AddColumn(AddMonthSh, "WeekNum",     each Date.WeekOfYear([Date]),             Int64.Type),
    AddDOW     = Table.AddColumn(AddWeek,    "DayOfWeek",   each Date.DayOfWeekName([Date]),          type text),
    AddDOWNum  = Table.AddColumn(AddDOW,     "DayOfWeekN",  each Date.DayOfWeek([Date], Day.Monday) + 1, Int64.Type),
    AddIsWE    = Table.AddColumn(AddDOWNum,  "IsWeekend",   each Date.DayOfWeek([Date]) >= 5,         type logical),
    AddDateKey = Table.AddColumn(AddIsWE,    "DateKey",
                    each Date.Year([Date]) * 10000 + Date.Month([Date]) * 100 + Date.Day([Date]),
                    Int64.Type)
in
    AddDateKey
```

---

## Error Handling

### Safe Type Conversion (no errors on nulls)
```m
// Instead of: Table.TransformColumnTypes (hard errors on bad data)
// Use this pattern to replace errors with null:
SafeIntColumn = Table.TransformColumns(Source, {
    {"Amount", each try Number.From(_) otherwise null, type nullable number}
})
```

### Replace Errors Globally
```m
CleanTable = Table.TransformColumns(
    Source,
    {},
    each try _ otherwise null
)
```

### Error Log Pattern
```m
let
    Source        = ...,
    TryTransform  = Table.AddColumn(Source, "ParseResult", each try Number.From([RawAmount])),
    Errors        = Table.SelectRows(TryTransform, each [ParseResult][HasError]),
    Successes     = Table.SelectRows(TryTransform, each not [ParseResult][HasError]),
    CleanValues   = Table.AddColumn(Successes, "Amount", each [ParseResult][Value], type number),
    FinalTable    = Table.RemoveColumns(CleanValues, {"ParseResult", "RawAmount"})
in
    FinalTable
```

---

## Custom Functions

### Parameterized Source (reusable across queries)
```m
// Create a new blank query named "fnGetTableFromDB"
(tableName as text) as table =>
let
    Source    = Sql.Database("server", "db"),
    TableData = Source{[Schema="dbo", Item=tableName]}[Data]
in
    TableData

// Usage:
// SalesData = fnGetTableFromDB("FactSales")
// ProductData = fnGetTableFromDB("DimProduct")
```

### Fiscal Year Calculation
```m
// Adjust FYStartMonth to your fiscal year start (e.g., 7 = July for FY starting in July)
(dateValue as date, FYStartMonth as number) as number =>
let
    CalendarYear = Date.Year(dateValue),
    CalendarMonth = Date.Month(dateValue),
    FiscalYear = if CalendarMonth >= FYStartMonth then CalendarYear + 1 else CalendarYear
in
    FiscalYear
```

---

## Dynamic Parameters

### Date Range Parameter (from Power BI Parameter)
```m
// Create Parameters: StartDateParam (Date type), EndDateParam (Date type)
let
    Source       = Sql.Database("server", "db"),
    SalesTable   = Source{[Schema="dbo", Item="FactSales"]}[Data],
    // Parameters are automatically available in M by name:
    FilteredRows = Table.SelectRows(SalesTable, each
                       [OrderDate] >= StartDateParam and
                       [OrderDate] <= EndDateParam)
in
    FilteredRows
```

---

## Unpivoting & Pivoting

### Unpivot Month Columns (wide → tall)
```m
// Input: columns Year, Jan, Feb, Mar, ..., Dec
// Output: Year, Month, Value
let
    Source     = Excel.Workbook(File.Contents("data.xlsx")){0}[Data],
    Unpivoted  = Table.UnpivotOtherColumns(Source, {"Year"}, "Month", "Value"),
    TypedCols  = Table.TransformColumnTypes(Unpivoted, {
                     {"Year", Int64.Type}, {"Value", type number}
                 })
in
    TypedCols
```

### Pivot with Aggregation
```m
// Input: Category, Month, Amount
// Output: Category | Jan | Feb | Mar ...
Pivoted = Table.Pivot(
    Source,
    List.Distinct(Source[Month]),
    "Month",
    "Amount",
    List.Sum
)
```
