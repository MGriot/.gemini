# Salary Analysis Implementation

## Changes
1.  **New Component**: `SalaryAnalytics.tsx`
    *   Visualizes salary data using `recharts`.
    *   Calculates key statistics on the fly from the `salaries` data prop.
    *   Displays:
        *   **Total Net Income (YTD)**
        *   **Average Monthly Income**
        *   **Total Contract Hours**
        *   **Average Tax Rate**
        *   **Income Trend Chart** (Net Pay over time)
        *   **Gross vs Deductions Chart**
        *   **Hours Worked Chart**

2.  **App Integration**: `App.tsx`
    *   Added "Salary Insights" to the sidebar navigation.
    *   Added routing logic to render `SalaryAnalytics` when the tab is active.
    *   Updated the header to reflect the new section.

## Verification
-   **Docker Status**: Verified `docker-compose ps` shows frontend and backend running.
-   **Access**: The new page is accessible via the "Salary Insights" sidebar item at [http://localhost:5173](http://localhost:5173).

## Notes
-   The "Total Hours" calculation currently relies on `contract_hours` from the salary data. If this field is missing in some templates, the chart will show 0 for those months.
