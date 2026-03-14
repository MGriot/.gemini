# Reference: Plot Gallery — Ready-to-Run Snippets

Copy, paste, and adapt. All snippets use the global style from `SKILL.md`.

---

## Setup (always run first)

```python
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd

plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('colorblind')
plt.rcParams.update({'figure.dpi': 150, 'savefig.dpi': 300,
                     'savefig.bbox': 'tight', 'figure.figsize': (8, 5),
                     'axes.spines.top': False, 'axes.spines.right': False})
```

---

## 1. Distribution

### Histogram + KDE

```python
fig, ax = plt.subplots()
sns.histplot(data, kde=True, bins=30, color='steelblue', ax=ax)
ax.set_xlabel('Value (unit)')
ax.set_ylabel('Count')
ax.set_title('Feature X Is Right-Skewed — Consider Log Transform')
plt.tight_layout()
```

### Violin + Strip

```python
fig, ax = plt.subplots(figsize=(9, 5))
sns.violinplot(data=df, x='group', y='value', palette='colorblind',
               inner='quartile', ax=ax)
sns.stripplot(data=df, x='group', y='value', color='black',
              alpha=0.3, size=3, jitter=True, ax=ax)
ax.set_xlabel('Group')
ax.set_ylabel('Value (unit)')
ax.set_title('Group B Has Higher Median and Wider Spread')
plt.tight_layout()
```

### QQ Plot (normality check)

```python
from scipy import stats
fig, ax = plt.subplots(figsize=(5, 5))
stats.probplot(data, plot=ax)
ax.set_title('QQ Plot — Tails Deviate from Normal')
plt.tight_layout()
```

---

## 2. Comparison

### Grouped Bar with 95% CI

```python
summary = df.groupby('group')['value'].agg(['mean', 'sem']).reset_index()
summary['ci95'] = summary['sem'] * 1.96

fig, ax = plt.subplots(figsize=(7, 5))
bars = ax.bar(summary['group'], summary['mean'],
              yerr=summary['ci95'], capsize=5,
              color=sns.color_palette('colorblind', len(summary)),
              edgecolor='white', linewidth=0.8)
ax.set_ylim(0, summary['mean'].max() * 1.3)
ax.set_xlabel('Group')
ax.set_ylabel('Mean value (unit)')
ax.set_title('Group C Has Significantly Higher Mean Than A (p < 0.01)')
plt.tight_layout()
```

### Paired / Before–After

```python
fig, ax = plt.subplots(figsize=(5, 6))
for i, row in df.iterrows():
    ax.plot([0, 1], [row['before'], row['after']],
            color='steelblue', alpha=0.3, lw=1)
ax.plot([0, 1], [df['before'].mean(), df['after'].mean()],
        'o-', color='darkred', lw=3, ms=8, label='Mean')
ax.set_xticks([0, 1])
ax.set_xticklabels(['Before', 'After'])
ax.set_ylabel('Value (unit)')
ax.set_title('Treatment Reduces Value in 87% of Subjects')
ax.legend()
plt.tight_layout()
```

---

## 3. Relationship

### Scatter + Regression Line + CI

```python
from scipy.stats import linregress

fig, ax = plt.subplots(figsize=(7, 6))
slope, intercept, r, p, _ = linregress(df['x'], df['y'])

ax.scatter(df['x'], df['y'], alpha=0.6, s=50, edgecolor='white')
x_line = np.linspace(df['x'].min(), df['x'].max(), 200)
ax.plot(x_line, slope*x_line + intercept, color='red', lw=2)

# Annotation
ax.text(0.05, 0.95, f'r = {r:.2f}, p = {p:.3f}',
        transform=ax.transAxes, va='top',
        bbox=dict(boxstyle='round', fc='white', alpha=0.8))

ax.set_xlabel('X variable (unit)')
ax.set_ylabel('Y variable (unit)')
ax.set_title(f'X and Y Are Strongly Correlated (r = {r:.2f})')
plt.tight_layout()
```

### Pairplot (multi-feature EDA)

```python
g = sns.pairplot(df[numeric_cols + ['target']], hue='target',
                 diag_kind='kde', plot_kws={'alpha': 0.5, 's': 20},
                 palette='colorblind')
g.fig.suptitle('Pairwise Relationships — Two Clusters Visible', y=1.01)
plt.tight_layout()
```

---

## 4. Correlation Heatmap

```python
corr = df.select_dtypes('number').corr()
mask = np.triu(np.ones_like(corr, dtype=bool))

fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(corr, mask=mask, annot=True, fmt='.2f',
            cmap='RdBu_r', center=0, vmin=-1, vmax=1,
            square=True, linewidths=0.4, annot_kws={'size': 9}, ax=ax)
ax.set_title('Feature Correlations — A & C Are Collinear (r = 0.91)')
plt.tight_layout()
```

---

## 5. Time Series

### Line + Confidence Band + Event

```python
fig, ax = plt.subplots(figsize=(12, 4))
ax.plot(df.index, df['value'], lw=1.5, color='steelblue', label='Observed')
ax.fill_between(df.index, df['lower'], df['upper'],
                alpha=0.2, color='steelblue', label='95% CI')
ax.axvline(pd.Timestamp('2024-06-01'), color='red', ls='--',
           lw=1.5, label='Policy change')
ax.annotate('Policy introduced', xy=(pd.Timestamp('2024-06-01'), df['value'].max()),
            xytext=(10, 5), textcoords='offset points', color='red', fontsize=9)
ax.set_xlabel('Date')
ax.set_ylabel('Value (unit)')
ax.set_title('Value Declined 18% After Policy Change in June 2024')
ax.legend()
fig.autofmt_xdate()
plt.tight_layout()
```

---

## 6. Chemometrics / Spectral

### Spectral Overlay Coloured by Target

```python
import matplotlib.cm as cm

fig, ax = plt.subplots(figsize=(11, 4))
norm   = plt.Normalize(y.min(), y.max())
cmap   = cm.viridis
for i in range(X.shape[0]):
    ax.plot(wavelengths, X[i], lw=0.5, alpha=0.6, color=cmap(norm(y[i])))

sm = plt.cm.ScalarMappable(cmap=cmap, norm=norm)
plt.colorbar(sm, ax=ax, label='Moisture (%)')
ax.set_xlabel('Wavelength (nm)')
ax.set_ylabel('Absorbance (A.U.)')
ax.set_title('NIR Spectra Coloured by Moisture — Clear Spectral Gradient')
plt.tight_layout()
```

### PCA Score Plot

```python
fig, ax = plt.subplots(figsize=(7, 6))
sc = ax.scatter(scores[:, 0], scores[:, 1], c=y, cmap='viridis',
                s=60, alpha=0.8, edgecolor='white')
plt.colorbar(sc, ax=ax, label='Target')
ax.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% var)')
ax.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% var)')
ax.axhline(0, color='grey', lw=0.5, ls='--')
ax.axvline(0, color='grey', lw=0.5, ls='--')
ax.set_title('PCA Score Plot — Two Groups Separated on PC1')
plt.tight_layout()
```

---

## 7. Model Evaluation

### Confusion Matrix

```python
from sklearn.metrics import ConfusionMatrixDisplay

fig, ax = plt.subplots(figsize=(5, 4))
ConfusionMatrixDisplay.from_predictions(
    y_test, y_pred, normalize='true', cmap='Blues', ax=ax)
ax.set_title(f'Confusion Matrix — {accuracy*100:.1f}% Accuracy on Test Set')
plt.tight_layout()
```

### Feature Importance

```python
imp_df = (pd.DataFrame({'feature': X.columns, 'importance': importances})
           .sort_values('importance', ascending=True)
           .tail(15))

fig, ax = plt.subplots(figsize=(7, 6))
ax.barh(imp_df['feature'], imp_df['importance'], color='steelblue')
ax.set_xlabel('Importance')
ax.set_title('Top 15 Features — Temperature Dominates Model')
plt.tight_layout()
```

---

## 8. Saving

```python
# After any figure:
fig.savefig('outputs/figures/fig_01_eda_distributions.png', dpi=300)
fig.savefig('outputs/figures/fig_01_eda_distributions.pdf')  # for papers
```
