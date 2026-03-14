# Module: Data Storytelling

Data without narrative is noise. Narrative without data is opinion.
This module teaches how to merge them into stories that change minds.

The three pillars of a data story (Brent Dykes framework):
- **Data** — rigorous, correctly analyzed, cherry-pick-free
- **Narrative** — structure with tension, stakes, and resolution
- **Visuals** — one chart per insight; the visual *is* the argument

---

## 1. The Fundamental Rule

> "A good story recounts an unexpected cause that creates an effect for which
> we already have an explanation." — Davis / Knaflic

**Your job is not to report what the data shows.**
**Your job is to explain *why it matters* and *what to do next*.**

Static reports → show **what** happened.
Data stories → explain **why** it happened + **what** to do about it.

---

## 2. Audience Mapping (Do This First)

Before writing a single word, define your audience. The same insight needs
completely different framing for different readers.

```
┌─────────────────────┬────────────────────────────────────────────┐
│ Audience            │ What they need                             │
├─────────────────────┼────────────────────────────────────────────┤
│ C-Suite / Executive │ Lead with recommendation; financials first; │
│                     │ maximum 3 insights; action-oriented         │
├─────────────────────┼────────────────────────────────────────────┤
│ Domain Expert       │ Lead with context; respect existing         │
│ (scientist, doctor) │ knowledge; include caveats & limitations    │
├─────────────────────┼────────────────────────────────────────────┤
│ Technical Peer      │ Lead with method; show your work;           │
│ (data scientist)    │ reproducibility details; code/appendix OK   │
├─────────────────────┼────────────────────────────────────────────┤
│ General Public      │ Lead with human impact; analogies over      │
│                     │ statistics; one key number; visual-first    │
└─────────────────────┴────────────────────────────────────────────┘
```

**Questions to answer before you start:**
1. Who is my primary audience? (be specific — one person)
2. What do they already know? What do they assume?
3. What decision do I want them to make after reading this?
4. What is their biggest objection to my conclusion?
5. What would make them say "so what?"

---

## 3. Narrative Frameworks

Choose the framework that matches your message type.

### 3.1 The Situation–Complication–Resolution (SCR / McKinsey Pyramid)

Best for: executive briefings, policy recommendations, business decisions.

```
SITUATION:    The context your audience already knows and accepts.
              "Our Q3 conversion rate was 4.2%, consistent with H1."

COMPLICATION: The change, problem, or tension that disrupts the situation.
              "In week 12, conversion dropped 31% overnight and has not recovered."

RESOLUTION:   The insight, recommendation, or action.
              "Root cause is a checkout UX regression in the mobile flow.
               Reverting the Nov 14 deploy would recover ~€180K/month."
```

```
Template:
─────────────
We were on track with [SITUATION].
However, [COMPLICATION] changed that picture.
Our analysis shows [FINDING], which means we should [RECOMMENDATION]
by [DATE] to [QUANTIFIED OUTCOME].
```

### 3.2 The Data Story Arc (Brent Dykes)

Best for: formal reports, presentations, research briefs.

```
1. HOOK        → One striking number/visual that grabs attention
2. CONTEXT     → What was expected / what the baseline is
3. TENSION     → What changed / what the problem is
4. INSIGHT     → What the data reveals (the "aha" moment)
5. IMPLICATION → Why it matters; stakes; what happens if ignored
6. CALL TO ACTION → What to do, by when, by whom
```

```python
# Template as a Python docstring (useful for LLM prompting)
story_arc_template = """
## {story_title}

### Hook
{one_striking_fact_or_visual}

### Context
Before this analysis, we assumed {assumption}. 
Historical baseline: {baseline_metric} = {baseline_value}.

### Tension
However, {what_changed_or_surprised_us}.
The data shows {key_finding} — {x}% {higher/lower/different} than expected.

### Insight
The root cause is {cause}. 
This is driven by {mechanism}, which we confirmed by {evidence}.

### Implication
If unaddressed, this will result in {consequence}.
The opportunity / cost is approximately {quantified_impact}.

### Recommendation
We recommend {action} by {deadline}.
Success metric: {how_we_will_know_it_worked}.
"""
```

### 3.3 SCQA (Situation–Complication–Question–Answer)

Best for: opening slides, executive summaries, one-pagers.

```
S: Our new product launched on schedule with strong initial reviews.
C: Despite this, 60-day retention is 18% below target.
Q: Why are users not returning, and what can we do about it?
A: Onboarding completion predicts retention (r=0.82). Fixing the tutorial
   flow will recover an estimated 12 points of 60-day retention.
```

### 3.4 AIDA (Attention–Interest–Desire–Action)

Best for: pitches, proposals, change management.

```
ATTENTION:  "We are losing 20% of our high-value customers every year."
INTEREST:   [Show the segmentation data that reveals who is leaving and why]
DESIRE:     [Show the model predicting what would happen with intervention]
ACTION:     "Approve the retention programme pilot — €50K, Q1."
```

### 3.5 The 5 Whys (Causal Chain Storytelling)

Best for: root cause analysis, operational reports.

```
Observation:  Sales dropped 23% in Region 3.
Why 1:        Because order volume fell in key accounts.
Why 2:        Because three key accounts churned to competitors.
Why 3:        Because our pricing was 8% above market in that segment.
Why 4:        Because our cost model hadn't been updated post-supply-chain shift.
Root cause:   Pricing governance lag — no quarterly market comparison process.
```

---

## 4. The Headline Title Technique

Replace descriptive chart titles with **prescriptive headline titles** that
state the finding. Research (Knaflic, CHI 2024) shows this dramatically
improves comprehension speed.

```
❌ "Monthly Revenue by Region, 2023–2024"
✓  "Region 3 Revenue Has Fallen 23% Since March — Driven by Account Churn"

❌ "Distribution of Feature X"
✓  "Feature X Is Bimodal — Two Distinct Customer Segments Exist"

❌ "Correlation Matrix"
✓  "Temperature and Yield Are Strongly Correlated (r = 0.89)"
```

---

## 5. The Insight Sentence

Every key finding should be expressible as a single sentence:

```
[Subject] [verb] [magnitude] [in what context] [which implies action/risk].

Examples:
"Customer churn increased 31% in the premium tier since the pricing change,
 suggesting price sensitivity we had not modelled."

"The NIR model predicts moisture content with RPD = 3.2, sufficient for
 online process monitoring."

"Users who complete the onboarding tutorial retain at 2.4× the rate of
 those who skip it — making tutorial completion the single highest-leverage
 metric to optimise."
```

---

## 6. Choosing and Sequencing Visuals

### The "One Insight, One Chart" Rule

Each chart should communicate exactly one idea. If you need to explain
three things about one chart, you need three charts.

### Chart sequencing for a presentation

```
1. HOOK VISUAL      → The most surprising/striking single number or trend
2. CONTEXT VISUAL   → Baseline or historical comparison
3. EVIDENCE VISUAL  → The data that proves your claim
4. DETAIL VISUAL    → Breakdown, segmentation, root cause
5. OUTCOME VISUAL   → What happens with/without the recommendation
```

### Simplification checklist for each chart

```
[ ] Remove gridlines not needed for reading values
[ ] Remove legend if you can label directly
[ ] Use muted colours for background data; bold colour for key series
[ ] Remove top and right axis spines
[ ] Increase font size (labels ≥ 10pt)
[ ] Add annotation pointing to the key insight on the chart
[ ] Title states the finding, not the description
```

---

## 7. Writing the Narrative Text

### Paragraph structure for analytical writing

```
CLAIM:     State the finding as a fact.
EVIDENCE:  The number that proves it.
CONTEXT:   Compare to baseline, target, or alternative.
SO WHAT:   The implication for the audience's decision.

Example:
"Customer acquisition cost has risen sharply this quarter [CLAIM].
CAC reached €142 in Q3, up from €97 in Q2 [EVIDENCE].
This is 47% above the €97 benchmark we used in the annual plan [CONTEXT].
At this rate, our payback period extends to 14 months — beyond the 12-month
threshold at which cohorts historically become unprofitable [SO WHAT]."
```

### Precision in language

```
❌ "Sales went up significantly."
✓  "Sales grew 18% year-over-year (from €2.1M to €2.5M)."

❌ "The model is quite accurate."
✓  "The model achieves R² = 0.94 and RMSEP = 0.12% moisture on the test set."

❌ "There is a correlation between X and Y."
✓  "X and Y are strongly positively correlated (r = 0.87, p < 0.001, n = 312)."

❌ "Some customers churn."
✓  "17% of premium customers churned within 90 days of the price increase."
```

---

## 8. Common Narrative Mistakes

| Mistake | Why it fails | Fix |
|---|---|---|
| **Data dump** | Overwhelms; no signal vs. noise separation | Max 3 key findings per story |
| **Correlation presented as cause** | Misleads; erodes trust | Always caveat; use "associated with" |
| **No "so what"** | Audience doesn't know what to do | End every section with implication |
| **Wrong audience register** | Technical story to executives = confusion | Map audience first (§2) |
| **Cherry-picking** | Destroys credibility when discovered | Show disconfirming evidence proactively |
| **Burying the lead** | Busy audience stops reading | State conclusion first, evidence second |
| **Jargon overload** | Excludes non-experts | Define every acronym; use analogies |
| **No uncertainty** | Overconfident; unsound | Include CIs, caveats, assumptions |

---

## 9. Presentation Structure Templates

### 5-Minute Executive Brief

```
Slide 1: Title + One-sentence conclusion
Slide 2: The problem (situation + complication, with 1 chart)
Slide 3: The finding (evidence, with 1 chart)
Slide 4: The recommendation (action + quantified outcome)
Slide 5: Appendix (methodology, data sources — for questions)
```

### 20-Minute Technical Presentation

```
1. Objective (1 slide)
2. Data & Methods (2 slides)
3. Key findings (3–5 slides, 1 insight per slide)
4. Limitations & caveats (1 slide)
5. Recommendation / next steps (1 slide)
6. Appendix: code, full results, validation details
```

### Written Report Structure

```markdown
## Executive Summary (1 paragraph)
[Conclusion first — the SCR in 3 sentences]

## Background
[Context, data source, objective]

## Methods
[What you did and why]

## Results
### Finding 1: [Headline title]
[Chart] + [Claim–Evidence–Context–So What paragraph]

### Finding 2: [Headline title]
...

## Limitations
[Honest caveats — increases trust]

## Recommendations
| Action | Owner | Deadline | Expected Impact |
|--------|-------|----------|-----------------|
| ...    | ...   | ...      | ...             |

## Appendix
[Detailed tables, code, supplementary figures]
```

---

## 10. The Review Checklist

Before publishing any data story:

```
ACCURACY
[ ] All numbers verified against source data
[ ] Statistical claims have correct test, statistic, and p-value
[ ] Correlation/causation distinction respected
[ ] Confidence intervals or uncertainty ranges shown

CLARITY
[ ] Non-expert can understand the conclusion without reading the methods
[ ] Every chart has a headline title that states the finding
[ ] Technical terms are defined on first use
[ ] "So what" is explicit for every major finding

NARRATIVE
[ ] Tension/complication is clear — why should the audience care?
[ ] Conclusion comes before evidence (for executive audience)
[ ] The story has a protagonist (the audience) and a decision to make
[ ] Call to action is specific (action + owner + deadline + metric)

VISUALS
[ ] Colorblind-safe palette
[ ] No truncated y-axis on bar charts
[ ] No 3D charts
[ ] Max 3 data series per chart (more = separate charts)
[ ] Key insight annotated directly on the chart
```
