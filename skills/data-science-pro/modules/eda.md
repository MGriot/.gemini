# Module: Exploratory Data Analysis (EDA)

EDA is the non-negotiable first step. Its purpose is to *understand* the data
before modeling — uncovering shape, quality, distributions, relationships, and
anomalies that would otherwise cause silent failures downstream.

---

## 1. The EDA Checklist

Run these steps in order. Do not skip to modeling until each is complete.

```
[ ] 1. Load and inspect shape
[ ] 2. Check data types and semantics
[ ] 3. Audit missing values
[ ] 4. Check for duplicates
[ ] 5. Descriptive statistics (all columns)
[ ] 6. Distribution of each numeric feature
[ ] 7. Value counts for each categorical feature
[ ] 8. Outlier detection
[ ] 9. Correlation matrix
[ ] 10. Target variable analysis (if supervised)
[ ] 11. Document findings and cleaning decisions
```

---

## 2. Load and Initial Inspection

```python
import pandas as pd
import numpy as np

df = pd.read_csv('data.csv')

# --- Shape and dtypes ---
print(f"Shape: {df.shape}")
print(df.dtypes)
print(df.head())
print(df.tail())

# --- Descriptive statistics ---
print(df.describe(include='all'))

# --- Memory usage ---
print(df.memory_usage(deep=True).sum() / 1e6, "MB")
```

**Red flags at this stage:**
- Columns with `object` dtype that should be `float` (hidden non-numeric values)
- `datetime` stored as `object`
- Column names with spaces or special characters (rename them immediately)

```python
# Clean column names immediately
df.columns = (df.columns
              .str.strip()
              .str.lower()
              .str.replace(' ', '_')
              .str.replace(r'[^\w]', '', regex=True))
```

---

## 3. Missing Value Audit

```python
# Count and percentage
missing = pd.DataFrame({
    'count': df.isnull().sum(),
    'pct':   df.isnull().mean().mul(100).round(2),
}).query('count > 0').sort_values('pct', ascending=False)

print(missing)

# Visual heatmap of missingness
import seaborn as sns
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(12, 4))
sns.heatmap(df.isnull().T, cbar=False, yticklabels=True,
            cmap='viridis', ax=ax)
ax.set_title('Missing Value Map')
plt.tight_layout()
```

### Missing Data Decision Tree

```
< 5% missing → Impute (median for numeric, mode for categorical)
5–20% missing → Impute with algorithm (KNN, IterativeImputer) or flag+impute
20–50% missing → Evaluate: does missingness carry signal? Add indicator column
> 50% missing → Consider dropping the column; justify if keeping
```

```python
from sklearn.impute import SimpleImputer, KNNImputer

# Simple median imputation
imputer = SimpleImputer(strategy='median')
df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

# KNN imputation (better for MAR data)
knn_imp = KNNImputer(n_neighbors=5)
df[numeric_cols] = knn_imp.fit_transform(df[numeric_cols])

# Add missingness indicator column before imputing
df['col_was_missing'] = df['col'].isnull().astype(int)
```

---

## 4. Duplicate Detection

```python
n_dup = df.duplicated().sum()
print(f"Exact duplicates: {n_dup} ({n_dup/len(df)*100:.1f}%)")

# Check for near-duplicates (same ID, different values)
if 'id' in df.columns:
    n_id_dup = df['id'].duplicated().sum()
    print(f"Duplicate IDs: {n_id_dup}")

# Drop exact duplicates
df = df.drop_duplicates().reset_index(drop=True)
```

---

## 5. Distribution Analysis

### Numeric features

```python
import matplotlib.pyplot as plt
import seaborn as sns

numeric_cols = df.select_dtypes(include='number').columns.tolist()

# Grid of histograms + KDE
n_cols = 3
n_rows = -(-len(numeric_cols) // n_cols)  # ceiling division
fig, axes = plt.subplots(n_rows, n_cols, figsize=(n_cols*4, n_rows*3))
axes = axes.flatten()

for i, col in enumerate(numeric_cols):
    sns.histplot(df[col].dropna(), kde=True, ax=axes[i], color='steelblue')
    axes[i].set_title(col)
    axes[i].set_xlabel('')
for j in range(i+1, len(axes)):
    axes[j].set_visible(False)

plt.suptitle('Feature Distributions', y=1.01, fontsize=14)
plt.tight_layout()
```

### Skewness check

```python
skew = df[numeric_cols].skew().sort_values(key=abs, ascending=False)
print("Skewness:")
print(skew)

# Highly skewed features (|skew| > 1) → consider log transform
highly_skewed = skew[skew.abs() > 1].index.tolist()
print(f"\nHighly skewed: {highly_skewed}")
```

### Categorical features

```python
cat_cols = df.select_dtypes(include='object').columns.tolist()

for col in cat_cols:
    vc = df[col].value_counts()
    print(f"\n{col} ({df[col].nunique()} unique values):")
    print(vc.head(10))
    
    # Check for high-cardinality (may need encoding strategy decision)
    if df[col].nunique() > 20:
        print(f"  ⚠️  High cardinality: {df[col].nunique()} categories")
```

---

## 6. Outlier Detection

### IQR method (robust for most cases)

```python
def detect_outliers_iqr(df, cols, factor=1.5):
    report = {}
    for col in cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - factor * IQR
        upper = Q3 + factor * IQR
        mask = (df[col] < lower) | (df[col] > upper)
        report[col] = {
            'n_outliers': mask.sum(),
            'pct': mask.mean() * 100,
            'lower_bound': lower,
            'upper_bound': upper,
        }
    return pd.DataFrame(report).T

outlier_report = detect_outliers_iqr(df, numeric_cols)
print(outlier_report[outlier_report['n_outliers'] > 0])
```

### Box plots for visual review

```python
fig, axes = plt.subplots(1, len(numeric_cols[:6]), figsize=(14, 4))
for i, col in enumerate(numeric_cols[:6]):
    axes[i].boxplot(df[col].dropna(), vert=True)
    axes[i].set_title(col)
plt.suptitle('Outlier Overview (IQR Fences)', fontsize=12)
plt.tight_layout()
```

### Z-score method (for normally-distributed features)

```python
from scipy import stats
z_scores = np.abs(stats.zscore(df[numeric_cols].dropna()))
outlier_mask = (z_scores > 3).any(axis=1)
print(f"Rows with |z| > 3 in any feature: {outlier_mask.sum()}")
```

### Outlier handling decision

```
Scientific/process data:
  → Investigate first. Outliers may be real signal (contamination, equipment error).
  → Never silently drop without logging.
  → Capping (Winsorization) is safer than dropping.

General ML:
  → Robust scalers (RobustScaler) are more forgiving than StandardScaler.
  → Isolation Forest for multivariate outlier detection.
```

```python
# Winsorization (capping, not dropping)
from scipy.stats import mstats
df[col] = mstats.winsorize(df[col], limits=[0.01, 0.01])  # 1% each tail

# Isolation Forest (multivariate)
from sklearn.ensemble import IsolationForest
iso = IsolationForest(contamination=0.05, random_state=42)
df['outlier_flag'] = iso.fit_predict(df[numeric_cols].fillna(0))
# -1 = outlier, 1 = inlier
```

---

## 7. Correlation Analysis

```python
corr = df[numeric_cols].corr(method='pearson')

fig, ax = plt.subplots(figsize=(10, 8))
mask = np.triu(np.ones_like(corr, dtype=bool))   # upper triangle mask
sns.heatmap(corr, mask=mask, annot=True, fmt='.2f',
            cmap='RdBu_r', center=0, vmin=-1, vmax=1,
            square=True, linewidths=0.5, ax=ax)
ax.set_title('Pearson Correlation Matrix', fontsize=13)
plt.tight_layout()

# Flag high correlations (potential multicollinearity)
high_corr = (corr.abs()
             .where(np.triu(np.ones(corr.shape), k=1).astype(bool))
             .stack()
             .sort_values(ascending=False))
print("Highly correlated pairs (|r| > 0.8):")
print(high_corr[high_corr > 0.8])
```

---

## 8. Target Variable Analysis (Supervised Learning)

```python
target = 'y'   # replace with your target column

# Regression target
if df[target].dtype in ['float64', 'int64']:
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    sns.histplot(df[target], kde=True, ax=axes[0], color='steelblue')
    axes[0].set_title(f'Distribution of {target}')
    stats.probplot(df[target].dropna(), plot=axes[1])  # QQ plot
    axes[1].set_title(f'QQ Plot — {target}')
    plt.tight_layout()

# Classification target
else:
    fig, ax = plt.subplots(figsize=(6, 4))
    df[target].value_counts().plot(kind='bar', ax=ax, color='steelblue',
                                    edgecolor='white')
    ax.set_title(f'Class Distribution — {target}')
    ax.set_xlabel('Class')
    ax.set_ylabel('Count')
    
    imbalance_ratio = df[target].value_counts().max() / df[target].value_counts().min()
    if imbalance_ratio > 3:
        print(f"⚠️  Class imbalance ratio: {imbalance_ratio:.1f}x → consider SMOTE or class_weight='balanced'")
```

---

## 9. EDA Report Template

After running EDA, fill in this template before proceeding:

```markdown
## EDA Summary — [Dataset Name]

**Shape:** N rows × M columns  
**Target:** [column name, type]  
**Date range:** [if applicable]

### Data Quality
- Missing values: [worst offenders and action taken]
- Duplicates: [count, action]
- Type mismatches: [list]

### Key Distributions
- [Feature A]: roughly normal / right-skewed / bimodal
- [Feature B]: high cardinality (N categories)

### Outliers
- [Feature X]: N outliers (IQR method) → [winsorized / flagged / investigated]

### Correlations
- Strong positive: (A, B) r=0.92 → potential multicollinearity
- Strong negative: (C, D) r=-0.78

### Target Analysis
- [Regression: skew, range, normality status]
- [Classification: class balance, minority class %]

### Decisions Made
1. [Action taken and justification]
2. ...

### Next Step
→ [EDA / Preprocessing / Chemometrics / Modeling]
```
