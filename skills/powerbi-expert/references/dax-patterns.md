# DAX Pattern Library

A curated set of production-ready DAX patterns for the most common Power BI scenarios.
All patterns assume a marked Date table named `'Date'` with a `[Date]` column.

---

## Table of Contents
1. [Time Intelligence](#time-intelligence)
2. [Ranking & Top N](#ranking--top-n)
3. [Running Totals & Cumulative](#running-totals--cumulative)
4. [Pareto Analysis](#pareto-analysis)
5. [Budget vs Actual Variance](#budget-vs-actual-variance)
6. [Dynamic Segmentation](#dynamic-segmentation)
7. [What-If Parameters](#what-if-parameters)
8. [Semi-Additive Measures (Inventory/Balance)](#semi-additive-measures)

---

## Time Intelligence

### Year-to-Date (YTD)
```dax
Sales YTD =
CALCULATE(
    [Total Sales],
    DATESYTD('Date'[Date])
)
```

### Month-to-Date (MTD)
```dax
Sales MTD =
CALCULATE(
    [Total Sales],
    DATESMTD('Date'[Date])
)
```

### Prior Year (PY) & Year-over-Year (YoY)
```dax
Sales PY =
CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))

Sales YoY % =
VAR CurrentPeriod = [Total Sales]
VAR PriorPeriod   = [Sales PY]
RETURN
    DIVIDE(CurrentPeriod - PriorPeriod, PriorPeriod, BLANK())
```

### Rolling 12 Months
```dax
Sales R12M =
CALCULATE(
    [Total Sales],
    DATESINPERIOD('Date'[Date], LASTDATE('Date'[Date]), -12, MONTH)
)
```

### Moving Average (3-Month)
```dax
Sales 3M Avg =
VAR LastDate    = LASTDATE('Date'[Date])
VAR RollingDates = DATESINPERIOD('Date'[Date], LastDate, -3, MONTH)
VAR RollingTotal = CALCULATE([Total Sales], RollingDates)
VAR MonthCount   = CALCULATE(DISTINCTCOUNT('Date'[MonthYear]), RollingDates)
RETURN DIVIDE(RollingTotal, MonthCount)
```

---

## Ranking & Top N

### Rank Customers by Sales (dense rank, no gaps)
```dax
Customer Rank =
IF(
    HASONEVALUE(Customer[CustomerName]),
    RANKX(
        ALL(Customer[CustomerName]),
        [Total Sales],
        ,
        DESC,
        Dense
    )
)
```

### Top 10 Flag (for visual filtering)
```dax
Is Top 10 =
IF([Customer Rank] <= 10, 1, 0)
```

### Top N Dynamic (uses What-If parameter [TopN Value])
```dax
Is Top N =
VAR N = [TopN Value]
RETURN IF([Customer Rank] <= N, 1, 0)
```

---

## Running Totals & Cumulative

### Cumulative Sales (by Date)
```dax
Sales Cumulative =
CALCULATE(
    [Total Sales],
    FILTER(
        ALL('Date'[Date]),
        'Date'[Date] <= MAX('Date'[Date])
    )
)
```

### Cumulative % of Total (for Pareto)
```dax
Sales Cumulative % =
DIVIDE([Sales Cumulative], CALCULATE([Total Sales], ALL('Date')))
```

---

## Pareto Analysis

### Customer Pareto (identify the 80% contributors)
```dax
Customer Sales %  =
DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(Customer)))

Customer Cum % =
VAR CurrentCustomer = SELECTEDVALUE(Customer[CustomerName])
RETURN
    CALCULATE(
        [Customer Sales %],
        FILTER(
            ALL(Customer[CustomerName]),
            [Customer Rank] <= [Customer Rank]   -- uses the Customer Rank measure
        )
    )

Is Pareto 80 =
IF([Customer Cum %] <= 0.80, "Top 80%", "Remaining 20%")
```

---

## Budget vs Actual Variance

```dax
Variance Abs =
[Total Sales] - [Budget Sales]

Variance % =
DIVIDE([Variance Abs], [Budget Sales], BLANK())

Variance Status =
SWITCH(
    TRUE(),
    [Variance %] >=  0.05,  "Exceeds Budget",
    [Variance %] >= -0.05,  "On Track",
    [Variance %] >= -0.15,  "Under Budget",
    "Significantly Under"
)
```

---

## Dynamic Segmentation

### ABC Classification (Value-based)
```dax
Customer ABC =
VAR CumPct = [Customer Cum %]
RETURN
    SWITCH(
        TRUE(),
        CumPct <= 0.70, "A",
        CumPct <= 0.90, "B",
        "C"
    )
```

### RFM Score (Recency / Frequency / Monetary)
```dax
-- Assumes measures [Last Purchase Days], [Order Count], [Total Revenue] exist

RFM Score =
VAR R = SWITCH(TRUE(),
    [Last Purchase Days] <= 30,  5,
    [Last Purchase Days] <= 90,  4,
    [Last Purchase Days] <= 180, 3,
    [Last Purchase Days] <= 365, 2, 1)
VAR F = SWITCH(TRUE(),
    [Order Count] >= 20, 5,
    [Order Count] >= 10, 4,
    [Order Count] >= 5,  3,
    [Order Count] >= 2,  2, 1)
VAR M = SWITCH(TRUE(),
    [Total Revenue] >= 10000, 5,
    [Total Revenue] >= 5000,  4,
    [Total Revenue] >= 1000,  3,
    [Total Revenue] >= 500,   2, 1)
RETURN R * 100 + F * 10 + M
```

---

## What-If Parameters

```dax
-- After creating a What-If parameter named "Discount Rate" (0%–50%, step 1%)
-- Power BI auto-creates: [Discount Rate Value] = SELECTEDVALUE('Discount Rate'[Discount Rate], 0)

Discounted Revenue =
VAR DiscountPct = [Discount Rate Value] / 100
RETURN [Total Sales] * (1 - DiscountPct)
```

---

## Semi-Additive Measures

### Last Balance (inventory / account balance — cannot SUM across time)
```dax
Closing Balance =
CALCULATE(
    LASTNONBLANK('Inventory'[BalanceDate], [Stock Level]),
    LASTDATE('Date'[Date])
)
```

### Average Balance (e.g., daily average account balance)
```dax
Average Daily Balance =
AVERAGEX(
    CALENDAR(MIN('Date'[Date]), MAX('Date'[Date])),
    CALCULATE([Closing Balance])
)
```
