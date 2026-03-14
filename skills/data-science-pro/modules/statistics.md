# Module: Statistics — Hypothesis Testing & Distributions

---

## 1. The Test Selection Framework

Before choosing a test, answer three questions:

```
Q1: How many groups are you comparing?
    → 1 group → one-sample tests
    → 2 groups → two-sample tests
    → 3+ groups → ANOVA / Kruskal-Wallis

Q2: Are the groups independent or paired/repeated?
    → Independent → between-subjects tests
    → Paired → within-subjects tests

Q3: Is the data normally distributed?
    → Yes (or n > 30 by CLT) → parametric tests
    → No → non-parametric tests
```

### Decision Table

| Situation | Parametric | Non-parametric |
|---|---|---|
| 1 sample vs. known mean | 1-sample t-test | Wilcoxon signed-rank |
| 2 independent groups | Independent t-test | Mann-Whitney U |
| 2 paired groups | Paired t-test | Wilcoxon signed-rank |
| 3+ independent groups | One-way ANOVA | Kruskal-Wallis |
| 3+ paired groups | Repeated-measures ANOVA | Friedman test |
| Association (2 numeric) | Pearson r | Spearman ρ |
| Association (categorical) | — | Chi-square / Fisher's exact |

---

## 2. Normality Testing

Always check normality **before** choosing parametric vs. non-parametric.

```python
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

def normality_check(data, label='', alpha=0.05):
    """Run multiple normality tests and produce a QQ plot."""
    data = np.asarray(data).flatten()
    
    # Statistical tests
    stat_sw, p_sw = stats.shapiro(data[:5000])  # Shapiro-Wilk (best for n < 5000)
    stat_ks, p_ks = stats.kstest(data, 'norm',
                                  args=(data.mean(), data.std()))
    
    print(f"\n{'='*40}")
    print(f"Normality tests for: {label}")
    print(f"  n = {len(data)}, mean = {data.mean():.4f}, std = {data.std():.4f}")
    print(f"  Skewness: {stats.skew(data):.3f}, Kurtosis: {stats.kurtosis(data):.3f}")
    print(f"  Shapiro-Wilk:  W={stat_sw:.4f}, p={p_sw:.4f}  → {'NORMAL ✓' if p_sw > alpha else 'NOT NORMAL ✗'}")
    print(f"  KS test:       D={stat_ks:.4f}, p={p_ks:.4f}  → {'NORMAL ✓' if p_ks > alpha else 'NOT NORMAL ✗'}")
    
    # QQ plot
    fig, axes = plt.subplots(1, 2, figsize=(10, 4))
    axes[0].hist(data, bins='auto', edgecolor='white', color='steelblue')
    axes[0].set_title(f'Histogram — {label}')
    stats.probplot(data, plot=axes[1])
    axes[1].set_title(f'QQ Plot — {label}')
    plt.tight_layout()
    
    return p_sw > alpha  # True = normally distributed

is_normal = normality_check(data, label='Feature X')
```

> **Note**: For n > 5000 Shapiro-Wilk becomes overly sensitive — trivial
> deviations will be "significant". Visualise the QQ plot and histogram; rely
> less on the p-value for large samples.

---

## 3. Two-Group Comparison

### Independent t-test

```python
from scipy import stats

group_a = df[df['group'] == 'A']['value']
group_b = df[df['group'] == 'B']['value']

# Check equal variance first (Levene's test)
stat_lev, p_lev = stats.levene(group_a, group_b)
equal_var = p_lev > 0.05

t_stat, p_val = stats.ttest_ind(group_a, group_b, equal_var=equal_var)

# Effect size: Cohen's d
pooled_std = np.sqrt((group_a.std()**2 + group_b.std()**2) / 2)
cohens_d   = (group_a.mean() - group_b.mean()) / pooled_std

print(f"t = {t_stat:.3f}, p = {p_val:.4f}, Cohen's d = {cohens_d:.3f}")
print(f"Effect size: {'small' if abs(cohens_d)<0.5 else 'medium' if abs(cohens_d)<0.8 else 'large'}")
```

**Cohen's d interpretation**: < 0.2 negligible, 0.2–0.5 small, 0.5–0.8 medium, > 0.8 large.

### Mann-Whitney U (non-parametric)

```python
u_stat, p_val = stats.mannwhitneyu(group_a, group_b, alternative='two-sided')

# Effect size: rank-biserial correlation
n_a, n_b = len(group_a), len(group_b)
r_rb = 1 - (2 * u_stat) / (n_a * n_b)
print(f"U = {u_stat:.1f}, p = {p_val:.4f}, r_rb = {r_rb:.3f}")
```

### Paired t-test / Wilcoxon

```python
# Parametric
t_stat, p_val = stats.ttest_rel(before, after)

# Non-parametric
w_stat, p_val = stats.wilcoxon(before, after, alternative='two-sided')
```

---

## 4. Multi-Group Comparison (ANOVA)

### One-Way ANOVA

```python
groups = [df[df['group']==g]['value'].values for g in df['group'].unique()]

f_stat, p_val = stats.f_oneway(*groups)
print(f"F = {f_stat:.3f}, p = {p_val:.4f}")

# Effect size: eta-squared η²
grand_mean = df['value'].mean()
ss_between = sum(len(g)*(g.mean()-grand_mean)**2 for g in groups)
ss_total   = sum((df['value'] - grand_mean)**2)
eta2 = ss_between / ss_total
print(f"η² = {eta2:.3f}")
```

**η² interpretation**: < 0.01 small, 0.01–0.06 medium, > 0.14 large.

### Post-hoc: Tukey HSD (after significant ANOVA)

```python
from statsmodels.stats.multicomp import pairwise_tukeyhsd

tukey = pairwise_tukeyhsd(df['value'], df['group'], alpha=0.05)
print(tukey)
tukey.plot_simultaneous(figsize=(8, 4))
plt.title('Tukey HSD — 95% Confidence Intervals')
plt.tight_layout()
```

### Kruskal-Wallis (non-parametric ANOVA)

```python
h_stat, p_val = stats.kruskal(*groups)
print(f"H = {h_stat:.3f}, p = {p_val:.4f}")

# Post-hoc: Dunn's test
import scikit_posthocs as sp
dunn_result = sp.posthoc_dunn(df, val_col='value', group_col='group',
                               p_adjust='bonferroni')
print(dunn_result)
```

---

## 5. Correlation

```python
# Pearson (linear, normal data)
r, p = stats.pearsonr(x, y)

# Spearman (monotonic, ordinal/non-normal)
rho, p = stats.spearmanr(x, y)

# Kendall tau (small samples, many ties)
tau, p = stats.kendalltau(x, y)

print(f"Pearson r = {r:.3f} (p={p:.4f})")
print(f"Spearman ρ = {rho:.3f} (p={p:.4f})")
```

> **Always report**: r value, p-value, n, and 95% confidence interval.

```python
# Bootstrap CI for Pearson r
def bootstrap_r_ci(x, y, n_boot=1000, alpha=0.05, seed=42):
    rng = np.random.default_rng(seed)
    boot_r = []
    for _ in range(n_boot):
        idx = rng.integers(0, len(x), len(x))
        boot_r.append(stats.pearsonr(x[idx], y[idx])[0])
    ci = np.percentile(boot_r, [alpha/2*100, (1-alpha/2)*100])
    return ci

ci = bootstrap_r_ci(x, y)
print(f"95% CI: [{ci[0]:.3f}, {ci[1]:.3f}]")
```

---

## 6. Multiple Comparisons Correction

When running many tests, the probability of at least one false positive grows.
**Always correct when running > 1 test.**

```python
from statsmodels.stats.multitest import multipletests

p_values = [0.01, 0.04, 0.03, 0.20, 0.002]   # raw p-values

# Bonferroni (conservative; good for confirmatory)
reject_bf, p_adj_bf, _, _ = multipletests(p_values, method='bonferroni')

# Benjamini-Hochberg FDR (less conservative; good for exploratory)
reject_bh, p_adj_bh, _, _ = multipletests(p_values, method='fdr_bh')

results = pd.DataFrame({
    'raw_p':         p_values,
    'bonferroni_p':  p_adj_bf,
    'bh_p':          p_adj_bh,
    'reject_bf':     reject_bf,
    'reject_bh':     reject_bh,
})
print(results)
```

---

## 7. Confidence Intervals

```python
import scipy.stats as stats

# 95% CI for a mean
def mean_ci(data, confidence=0.95):
    n  = len(data)
    m  = np.mean(data)
    se = stats.sem(data)
    t  = stats.t.ppf((1 + confidence) / 2, df=n - 1)
    return m, m - t*se, m + t*se

mean, lower, upper = mean_ci(data)
print(f"Mean = {mean:.3f} [{lower:.3f}, {upper:.3f}]")
```

---

## 8. Power Analysis (Sample Size)

```python
from statsmodels.stats.power import TTestIndPower, FTestAnovaPower

# Two-sample t-test: what n do I need?
analysis = TTestIndPower()
n = analysis.solve_power(
    effect_size=0.5,   # Cohen's d (medium effect)
    alpha=0.05,
    power=0.80,        # 80% power
    alternative='two-sided',
)
print(f"Required n per group: {np.ceil(n):.0f}")

# Achieved power given n
power = analysis.solve_power(effect_size=0.5, alpha=0.05, nobs1=30)
print(f"Power with n=30: {power:.3f}")
```

---

## 9. Reporting Results

Always report in this format:

```
[Test name]: [statistic] = [value], p = [value], [effect size] = [value],
95% CI [lower, upper]

Example:
Independent t-test: t(48) = 2.34, p = 0.023, Cohen's d = 0.66,
95% CI [0.05, 0.85]. The difference is statistically significant
(α = 0.05) and represents a medium-to-large effect.
```

**Never write just "p < 0.05 therefore significant."** Always include:
- Test statistic with degrees of freedom
- Exact p-value (not just < 0.05)
- Effect size + its interpretation
- Confidence interval
- Practical significance statement
