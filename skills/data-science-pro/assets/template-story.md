# Data Story Template

*Copy and fill in the brackets. Delete the guidance text before publishing.*

---

## [STORY TITLE — State the finding, not just the topic]
*e.g. "Checkout Drop-Off Costs €180K/Month — Mobile UX is the Root Cause"*

**Author:** [Name] | **Date:** [YYYY-MM-DD] | **Audience:** [Executive / Technical / Mixed]

---

## Executive Summary
*One paragraph. Lead with the recommendation. State the finding, evidence, and action.
Use the SCR structure: Situation → Complication → Resolution.*

We expected [SITUATION]. However, [COMPLICATION]. Analysis of [DATA SOURCE]
reveals that [KEY FINDING] — [X]% [higher/lower/different] than [BASELINE].
We recommend [ACTION] by [DATE], which would [QUANTIFIED OUTCOME].

---

## 1. Background

### Context
*What was the situation before this analysis? What was expected?*

### Objective
*What question does this analysis answer?*

- **Primary question:** [What specific decision does this analysis inform?]
- **Data source:** [Dataset name, date range, collection method]
- **Sample size:** [N observations, N features]

### What We Already Knew
*Briefly state prior knowledge or assumptions being tested.*

---

## 2. Methods

*Keep this brief for executive audiences. Move to Appendix for technical peers.*

| Step | Method | Justification |
|---|---|---|
| Data cleaning | [e.g., median imputation for <5% missing] | [why] |
| Preprocessing | [e.g., SNV + SG derivative] | [why] |
| Analysis | [e.g., PLS-R, 10-fold CV] | [why] |
| Validation | [e.g., independent test set, n=X] | [why] |

---

## 3. Findings

### Finding 1: [Headline — State the finding as a fact]

*[Hook: one striking number or visual]*

[CHART 1]
*Caption: [What the chart shows and what it means.]*

[CLAIM]. [EVIDENCE — specific numbers]. [CONTEXT — compared to what baseline/target].
This matters because [IMPLICATION — what happens if ignored/addressed].

---

### Finding 2: [Headline]

[CHART 2]
*Caption:*

[Claim–Evidence–Context–Implication paragraph]

---

### Finding 3: [Headline]
*(Add or remove Finding sections as needed — 3 is the ideal maximum for executive stories)*

[CHART 3]

---

## 4. Limitations

*This section builds trust. Omitting it destroys it.*

| Limitation | Potential impact | Mitigation |
|---|---|---|
| [e.g., observational data — cannot establish causality] | [Overstating effect] | [Controlled experiment recommended for confirmation] |
| [e.g., sample from single site] | [May not generalise] | [Validate on Site 2 data] |
| [e.g., self-reported target variable] | [Measurement error] | [Cross-check against instrument data] |

---

## 5. Recommendations

*Specific, assigned, time-bound, with success metric.*

| # | Action | Owner | Deadline | Expected Impact |
|---|---|---|---|---|
| 1 | [specific action] | [name/team] | [YYYY-MM-DD] | [quantified outcome] |
| 2 | | | | |
| 3 | | | | |

**Next step if recommendation is adopted:** [what to do immediately after]
**How we will know it worked:** [measurable success metric within timeframe]

---

## Appendix

### A. Full Statistical Results

*Full tables, model diagnostics, test statistics — for technical reviewers.*

| Test | Statistic | p-value | Effect size | CI 95% |
|---|---|---|---|---|
| [test name] | [stat=X.XX] | [p=X.XXXX] | [Cohen's d=X.XX] | [lower, upper] |

### B. Supplementary Figures

*Additional charts that support findings but are too detailed for the main story.*

### C. Data Dictionary

| Column | Description | Units | Range |
|---|---|---|---|
| [col_name] | [description] | [unit] | [min–max] |

### D. Code / Reproducibility

- **Repository:** [link or path]
- **Environment:** Python [version], see `requirements.txt`
- **Random seed:** 42
- **To reproduce:** `python src/analysis.py --config config.yaml`

---

*End of report.*

---

## Self-Review Checklist

Before sharing, verify:

**Accuracy**
- [ ] All numbers match source data
- [ ] Statistical claims include test, statistic, p-value, and effect size
- [ ] Correlation/causation distinction respected
- [ ] Limitations are honestly stated

**Clarity**
- [ ] Non-expert can understand the conclusion without the appendix
- [ ] Every chart has a headline title stating the finding
- [ ] "So what" is explicit for every finding
- [ ] Recommendation is specific: action + owner + deadline + metric

**Narrative**
- [ ] The story has a clear tension/complication — why should anyone care?
- [ ] Conclusion comes before evidence (for executive audience)
- [ ] Call to action is unmistakable

**Visuals**
- [ ] Colorblind-safe palette
- [ ] No truncated y-axis on bar charts
- [ ] Maximum 3 data series per chart
- [ ] Key insight annotated directly on the chart
