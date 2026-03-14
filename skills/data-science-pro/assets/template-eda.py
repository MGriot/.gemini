"""
EDA Template — Data Science Pro Skill Kit
==========================================
Copy this script for any new dataset.
Run top-to-bottom. Fill in the CONFIG section.
"""

# ── CONFIG ────────────────────────────────────────────────────────────────────
DATA_PATH   = 'data/raw/dataset.csv'
TARGET_COL  = 'y'             # set to None for unsupervised
TASK        = 'regression'    # 'regression' | 'classification'
RANDOM_SEED = 42
OUTPUT_DIR  = 'outputs/eda'
# ──────────────────────────────────────────────────────────────────────────────

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from pathlib import Path

# Reproducibility
np.random.seed(RANDOM_SEED)

# Style
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('colorblind')
plt.rcParams.update({
    'figure.dpi': 150, 'savefig.dpi': 300,
    'savefig.bbox': 'tight', 'figure.figsize': (10, 5),
    'axes.spines.top': False, 'axes.spines.right': False,
})

Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)


# ── 1. LOAD ───────────────────────────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)

# Clean column names
df.columns = (df.columns.str.strip().str.lower()
              .str.replace(' ', '_').str.replace(r'[^\w]', '', regex=True))

print(f"\n{'='*60}")
print(f"Dataset: {DATA_PATH}")
print(f"Shape:   {df.shape[0]:,} rows × {df.shape[1]} columns")
print(f"{'='*60}")
print(df.dtypes.to_string())
print(f"\nFirst 3 rows:\n{df.head(3)}")


# ── 2. MISSING VALUES ─────────────────────────────────────────────────────────
missing = pd.DataFrame({
    'count': df.isnull().sum(),
    'pct':   df.isnull().mean().mul(100).round(2),
}).query('count > 0').sort_values('pct', ascending=False)

if len(missing):
    print(f"\nMissing values:\n{missing}")
    fig, ax = plt.subplots(figsize=(12, 4))
    sns.heatmap(df.isnull().T, cbar=False, yticklabels=True, cmap='viridis', ax=ax)
    ax.set_title('Missing Value Map')
    plt.tight_layout()
    fig.savefig(f'{OUTPUT_DIR}/01_missing.png')
    plt.close()
else:
    print("\nNo missing values ✓")


# ── 3. DUPLICATES ─────────────────────────────────────────────────────────────
n_dup = df.duplicated().sum()
print(f"\nDuplicate rows: {n_dup} ({n_dup/len(df)*100:.1f}%)")
if n_dup > 0:
    df = df.drop_duplicates().reset_index(drop=True)
    print(f"  → Dropped. New shape: {df.shape}")


# ── 4. DESCRIPTIVE STATISTICS ─────────────────────────────────────────────────
print(f"\nDescriptive statistics:\n{df.describe(include='all').T.to_string()}")


# ── 5. DISTRIBUTIONS ─────────────────────────────────────────────────────────
numeric_cols = df.select_dtypes(include='number').columns.tolist()
if TARGET_COL in numeric_cols:
    feature_cols = [c for c in numeric_cols if c != TARGET_COL]
else:
    feature_cols = numeric_cols

n_cols = 3
n_rows = -(-len(feature_cols) // n_cols)
fig, axes = plt.subplots(n_rows, n_cols, figsize=(n_cols*4, n_rows*3))
axes = axes.flatten() if n_rows > 1 else [axes] if n_cols == 1 else axes.flatten()

for i, col in enumerate(feature_cols):
    sns.histplot(df[col].dropna(), kde=True, ax=axes[i], color='steelblue')
    skew = df[col].skew()
    axes[i].set_title(f'{col}\nskew={skew:.2f}')
    axes[i].set_xlabel('')
for j in range(i+1, len(axes)):
    axes[j].set_visible(False)

plt.suptitle('Feature Distributions', y=1.01, fontsize=13)
plt.tight_layout()
fig.savefig(f'{OUTPUT_DIR}/02_distributions.png')
plt.close()


# ── 6. SKEWNESS REPORT ───────────────────────────────────────────────────────
skew = df[numeric_cols].skew().sort_values(key=abs, ascending=False)
print(f"\nSkewness (top 10):\n{skew.head(10)}")
highly_skewed = skew[skew.abs() > 1].index.tolist()
if highly_skewed:
    print(f"\n⚠️  Highly skewed (|skew|>1): {highly_skewed}")
    print("   → Consider log1p or Box-Cox transform before modeling.")


# ── 7. OUTLIERS (IQR) ────────────────────────────────────────────────────────
outlier_report = []
for col in feature_cols:
    Q1, Q3 = df[col].quantile([0.25, 0.75])
    IQR = Q3 - Q1
    n_out = ((df[col] < Q1-1.5*IQR) | (df[col] > Q3+1.5*IQR)).sum()
    if n_out > 0:
        outlier_report.append({'col': col, 'n_outliers': n_out,
                                'pct': n_out/len(df)*100})

if outlier_report:
    print(f"\nOutliers (IQR method):")
    print(pd.DataFrame(outlier_report).to_string(index=False))
else:
    print("\nNo IQR outliers detected ✓")


# ── 8. NORMALITY (Shapiro-Wilk) ───────────────────────────────────────────────
print("\nNormality (Shapiro-Wilk, p < 0.05 = not normal):")
for col in feature_cols[:10]:  # cap at 10 to avoid spam
    data_clean = df[col].dropna().values
    if len(data_clean) < 5000:
        _, p = stats.shapiro(data_clean)
        flag = '✓ normal' if p > 0.05 else '✗ not normal'
        print(f"  {col:30s} p={p:.4f}  {flag}")


# ── 9. CORRELATION ────────────────────────────────────────────────────────────
if len(numeric_cols) > 1:
    corr = df[numeric_cols].corr(method='pearson')
    mask = np.triu(np.ones_like(corr, dtype=bool))

    fig, ax = plt.subplots(figsize=(max(8, len(numeric_cols)), max(6, len(numeric_cols)-1)))
    sns.heatmap(corr, mask=mask, annot=True, fmt='.2f',
                cmap='RdBu_r', center=0, vmin=-1, vmax=1,
                square=True, linewidths=0.4, annot_kws={'size': 8}, ax=ax)
    ax.set_title('Pearson Correlation Matrix')
    plt.tight_layout()
    fig.savefig(f'{OUTPUT_DIR}/03_correlation.png')
    plt.close()

    # Flag high correlations
    high = (corr.abs().where(np.triu(np.ones(corr.shape), k=1).astype(bool))
            .stack().sort_values(ascending=False))
    print(f"\nHigh correlations (|r| > 0.8):")
    print(high[high > 0.8])


# ── 10. TARGET ANALYSIS ───────────────────────────────────────────────────────
if TARGET_COL and TARGET_COL in df.columns:
    print(f"\nTarget: '{TARGET_COL}'")
    if TASK == 'regression':
        fig, axes = plt.subplots(1, 2, figsize=(12, 4))
        sns.histplot(df[TARGET_COL].dropna(), kde=True, ax=axes[0])
        axes[0].set_title(f'Distribution of {TARGET_COL}')
        stats.probplot(df[TARGET_COL].dropna(), plot=axes[1])
        axes[1].set_title(f'QQ Plot — {TARGET_COL}')
    else:
        vc = df[TARGET_COL].value_counts()
        fig, ax = plt.subplots(figsize=(7, 4))
        vc.plot(kind='bar', ax=ax, color=sns.color_palette('colorblind', len(vc)))
        ax.set_title(f'Class Distribution — {TARGET_COL}')
        ax.set_xlabel('')
        imbalance = vc.max() / vc.min()
        if imbalance > 3:
            print(f"  ⚠️  Class imbalance: {imbalance:.1f}x → use class_weight='balanced' or SMOTE")
    plt.tight_layout()
    fig.savefig(f'{OUTPUT_DIR}/04_target.png')
    plt.close()


# ── SUMMARY ───────────────────────────────────────────────────────────────────
print(f"""
{'='*60}
EDA COMPLETE — fill in this summary before modeling
{'='*60}
Shape:          {df.shape}
Target:         {TARGET_COL} ({TASK})
Missing:        {len(missing)} column(s) with nulls
Duplicates:     {n_dup} (removed)
Highly skewed:  {highly_skewed}
High corr:      [see correlation plot]
Outputs saved to: {OUTPUT_DIR}/
{'='*60}
""")
