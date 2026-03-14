# Reference: Anti-Patterns — Common Mistakes and Fixes

---

## DATA / PREPROCESSING

### ❌ Data Leakage: Scaling Before Splitting

```python
# WRONG — test info leaks into scaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)                 # uses all data
X_train, X_test = train_test_split(X_scaled, ...)

# CORRECT — scaler sees only training data
X_train, X_test = train_test_split(X, ...)
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)              # transform only, no fit
```

### ❌ Imputing Before Splitting

```python
# WRONG
df['col'] = df['col'].fillna(df['col'].median())   # uses test median
# CORRECT
train_median = X_train['col'].median()
X_train['col'] = X_train['col'].fillna(train_median)
X_test['col']  = X_test['col'].fillna(train_median)
```

### ❌ Dropping Outliers Silently

```python
# WRONG — removes data without explanation
df = df[df['value'] < 1000]

# CORRECT — document and justify
print(f"Removing {(df['value'] >= 1000).sum()} outliers (> 1000)")
print(df[df['value'] >= 1000])   # inspect them first
df_clean = df[df['value'] < 1000].copy()
```

---

## MODELING

### ❌ Using Accuracy for Imbalanced Classes

```python
# WRONG — 95% accuracy means nothing when 95% are class 0
accuracy = (y_pred == y_test).mean()

# CORRECT
from sklearn.metrics import classification_report, roc_auc_score
print(classification_report(y_test, y_pred))
print(f"ROC-AUC: {roc_auc_score(y_test, y_proba):.4f}")
```

### ❌ No Cross-Validation (Single Train/Test Split)

```python
# WRONG — single split has high variance
model.fit(X_train, y_train)
score = model.score(X_test, y_test)   # could be lucky or unlucky

# CORRECT
scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
print(f"{scores.mean():.4f} ± {scores.std():.4f}")
```

### ❌ Not Setting Random Seeds

```python
# WRONG — different results every run
model = RandomForestClassifier()

# CORRECT
model = RandomForestClassifier(random_state=42)
np.random.seed(42)
```

### ❌ Too Many PCA/PLS Components Without Validation

```python
# WRONG — arbitrary component count
pls = PLSRegression(n_components=15)

# CORRECT — validate with RMSECV curve
for n in range(1, 20):
    score = cross_val_score(PLSRegression(n_components=n), ...)
```

---

## STATISTICS

### ❌ Reporting p-value Without Effect Size

```python
# WRONG — says nothing about practical significance
print(f"p = {p:.4f} → statistically significant")

# CORRECT
print(f"t({n-2}) = {t:.3f}, p = {p:.4f}, Cohen's d = {d:.3f} ({label} effect)")
```

### ❌ Multiple Testing Without Correction

```python
# WRONG — 20 tests at α=0.05 → 1 expected false positive
for col in df.columns:
    _, p = stats.ttest_ind(group_a[col], group_b[col])
    if p < 0.05: print(f"{col} is significant")

# CORRECT
from statsmodels.stats.multitest import multipletests
_, p_adj, _, _ = multipletests(p_values, method='fdr_bh')
```

### ❌ Parametric Test on Non-Normal Data (Small n)

```python
# WRONG — assuming normality without checking
t, p = stats.ttest_ind(a, b)

# CORRECT
_, p_norm = stats.shapiro(a)
if p_norm < 0.05:
    u, p = stats.mannwhitneyu(a, b)   # non-parametric
else:
    t, p = stats.ttest_ind(a, b)
```

---

## VISUALIZATION

### ❌ Truncated Y-Axis on Bar Charts

```python
# WRONG — exaggerates small differences
ax.set_ylim(95, 100)   # on a bar chart

# CORRECT — bar charts must start at 0
ax.set_ylim(0, max_val * 1.15)
# If you must zoom in, use a line/dot chart instead of bars
```

### ❌ Pie Chart with Many Slices

```python
# WRONG — unreadable with > 5 categories
plt.pie(values, labels=labels)

# CORRECT — use sorted horizontal bar chart
ax.barh(sorted_labels, sorted_values)
```

### ❌ No Colorblind Safety

```python
# WRONG — red/green distinction only
colors = ['red', 'green', 'blue']

# CORRECT
sns.set_palette('colorblind')
# or: colors = ['#0072B2', '#009E73', '#E69F00']
```

### ❌ Chart Without Title/Labels

```python
# WRONG
plt.plot(x, y)
plt.show()

# CORRECT
fig, ax = plt.subplots()
ax.plot(x, y, label='Feature X over time')
ax.set_xlabel('Time (days)')
ax.set_ylabel('Concentration (mg/L)')
ax.set_title('Feature X Shows a Declining Trend Post-Treatment')
ax.legend()
plt.tight_layout()
```

---

## STORYTELLING

### ❌ Data Dump Without Narrative

```
WRONG:
"Figure 1 shows the distribution of feature X. Figure 2 shows the
correlation matrix. Figure 3 shows the PCA score plot. Figure 4 shows..."

CORRECT:
"Feature X is bimodally distributed (Figure 1), suggesting two distinct
population subgroups. The PCA confirms this: the first two components
explain 78% of variance and cleanly separate the groups along PC1
(Figure 3). The key driver of this separation is [variable] (loading = 0.87),
which aligns with our hypothesis that [domain explanation]."
```

### ❌ Conclusion Buried at the End

```
WRONG (detective story structure):
Page 1: Methods
Page 5: Results
Page 9: "Therefore, we recommend..."

CORRECT (executive structure):
Page 1: "We recommend X because Y. Here is the evidence:"
Page 2: Evidence
Page 5: Methods (appendix)
```

### ❌ Correlation Presented as Causation

```
WRONG:
"Users who use the premium feature have 40% higher retention.
Installing the premium feature causes retention."

CORRECT:
"Users who adopt the premium feature show 40% higher 90-day retention
(r = 0.62, p < 0.001). This association is consistent with the feature
providing value, though confounding (e.g., high-intent users self-select
into premium) cannot be ruled out without an A/B test."
```

### ❌ p < 0.05 Without Context

```
WRONG:
"The treatment group scored 0.003 points higher (p = 0.002)."

CORRECT:
"The treatment group scored 0.003 points higher — statistically significant
(p = 0.002) due to our large sample (n = 50,000), but practically negligible
(Cohen's d = 0.004). We do not recommend acting on this finding."
```
