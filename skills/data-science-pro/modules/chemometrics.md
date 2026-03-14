# Module: Chemometrics (PCA, PLS, Spectral Preprocessing)

Chemometrics applies multivariate statistics to chemical and spectral data.
The challenges are unique: extreme multicollinearity (thousands of correlated
wavelengths), high p/n ratios, and instrument drift. This module covers the
full workflow from raw spectra to validated models.

---

## 1. The Chemometrics Workflow

```
Raw spectra
    ↓
Preprocessing (SNV, MSC, derivatives, smoothing)
    ↓
Outlier detection (Hotelling T², Q residuals)
    ↓
Split: Train / Test
    ↓
Unsupervised: PCA (explore structure, detect outliers)
    ↓
Supervised: PLS-R or PLS-DA (regression / classification)
    ↓
Cross-validation (choose optimal n_components)
    ↓
Test set validation (RMSEP, R²P, RPD)
    ↓
Interpret (loadings, VIP scores)
```

---

## 2. Recommended Libraries

```python
pip install chemotools scikit-learn numpy scipy matplotlib
```

| Library | Use |
|---|---|
| `chemotools` | NIR/IR preprocessing (SNV, MSC, Savitzky-Golay, etc.) |
| `scikit-learn` | PCA, PLSRegression, PLSCanonical, cross-validation |
| `numpy` / `scipy` | Numerical core |
| `pyChemometrics` | Full PLS-DA with VIP, DModX, etc. |

---

## 3. Spectral Preprocessing

### Why preprocess?

Raw spectra contain noise from:
- **Additive scatter** (baseline offset) → remove with MSC or derivatives
- **Multiplicative scatter** (path length variation) → remove with SNV
- **High-frequency noise** → smooth with Savitzky-Golay

**Order of operations:**

```
1. Smoothing (noise)   →  Savitzky-Golay
2. Scatter correction  →  SNV or MSC
3. Derivative          →  1st or 2nd derivative (optional; removes baseline drift)
4. Centering/Scaling   →  Mean-center (for PCA/PLS)
```

### Standard Normal Variate (SNV)

Corrects for multiplicative scatter and particle size effects.
Each spectrum is independently normalised (subtract mean, divide by std).

```python
import numpy as np

def snv(X):
    """Standard Normal Variate — row-wise normalisation."""
    return (X - X.mean(axis=1, keepdims=True)) / X.std(axis=1, keepdims=True)

X_snv = snv(X)
```

Using `chemotools`:

```python
from chemotools.scale import StandardNormalVariate
from sklearn.pipeline import Pipeline

snv = StandardNormalVariate()
X_snv = snv.fit_transform(X)
```

### Multiplicative Scatter Correction (MSC)

Uses a reference spectrum (usually the mean) to correct additive and
multiplicative effects.

```python
def msc(X, reference=None):
    """Multiplicative Scatter Correction."""
    if reference is None:
        reference = X.mean(axis=0)
    X_msc = np.zeros_like(X)
    for i in range(X.shape[0]):
        b, a = np.polyfit(reference, X[i], 1)
        X_msc[i] = (X[i] - a) / b
    return X_msc

X_msc = msc(X_train)
# CRITICAL: use training reference for test set
ref = X_train.mean(axis=0)
X_test_msc = msc(X_test, reference=ref)
```

### Savitzky-Golay Smoothing + Derivatives

```python
from scipy.signal import savgol_filter

# Smooth only (derivative order = 0)
X_smooth = savgol_filter(X, window_length=11, polyorder=3, deriv=0)

# First derivative (removes additive baseline)
X_d1 = savgol_filter(X, window_length=11, polyorder=3, deriv=1)

# Second derivative (removes linear baseline; sharper peaks)
X_d2 = savgol_filter(X, window_length=15, polyorder=3, deriv=2)
```

**Choosing window_length**: must be odd; larger = more smoothing, less
spectral resolution. Start with 11–15 for NIR, 5–9 for Raman.

### Baseline Correction (ALSS)

```python
from scipy.sparse import diags
from scipy.sparse.linalg import spsolve

def als_baseline(y, lam=1e5, p=0.001, niter=10):
    """Asymmetric Least Squares baseline estimation."""
    L = len(y)
    D = diags([1, -2, 1], [0, 1, 2], shape=(L-2, L))
    W = np.ones(L)
    for _ in range(niter):
        w_diag = diags(W, 0)
        Z = w_diag + lam * D.T.dot(D)
        z = spsolve(Z, W * y)
        W = p * (y > z) + (1 - p) * (y < z)
    return z

for i in range(X.shape[0]):
    X[i] -= als_baseline(X[i])
```

---

## 4. PCA — Principal Component Analysis

Use PCA for:
- Visualising dataset structure (score plot)
- Detecting outliers (Hotelling T², Q residuals)
- Understanding variance sources (loading plot)

### Running PCA

```python
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipe_pca = Pipeline([
    ('scaler', StandardScaler()),       # always center for PCA
    ('pca',    PCA(n_components=0.95)), # keep 95% of variance
])

pipe_pca.fit(X_train)
scores = pipe_pca.transform(X_train)   # N × n_components

# Explained variance
pca = pipe_pca.named_steps['pca']
print("Explained variance ratio:", pca.explained_variance_ratio_)
print("Cumulative:", pca.explained_variance_ratio_.cumsum())
```

### Score Plot (PC1 vs PC2)

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 6))
scatter = ax.scatter(scores[:, 0], scores[:, 1],
                     c=y_train,            # colour by target/class
                     cmap='viridis', s=50, alpha=0.8)
plt.colorbar(scatter, ax=ax, label='Target')
ax.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% var)')
ax.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% var)')
ax.set_title('PCA Score Plot')
ax.axhline(0, color='grey', lw=0.5, ls='--')
ax.axvline(0, color='grey', lw=0.5, ls='--')
plt.tight_layout()
```

### Loading Plot

```python
wavelengths = np.arange(X.shape[1])  # or your actual wavelength array

fig, axes = plt.subplots(2, 1, figsize=(10, 6), sharex=True)
for i, ax in enumerate(axes):
    ax.plot(wavelengths, pca.components_[i], color=f'C{i}')
    ax.set_ylabel(f'PC{i+1} loading')
    ax.axhline(0, color='grey', lw=0.5, ls='--')
axes[-1].set_xlabel('Wavelength (nm)')
plt.suptitle('PCA Loadings')
plt.tight_layout()
```

### Hotelling T² and Q Residuals (Outlier Detection)

```python
def pca_outliers(X_scores, X_original, pca, alpha=0.05):
    from scipy.stats import f as f_dist, chi2
    n, k = X_scores.shape
    
    # Hotelling T² (score outliers — outside model)
    T2 = np.sum((X_scores / pca.explained_variance_[:k]**0.5)**2, axis=1)
    T2_limit = k * (n-1) * (n+1) / (n * (n-k)) * f_dist.ppf(1-alpha, k, n-k)
    
    # Q residuals (reconstruction error — orthogonal distance)
    X_recon = pca.inverse_transform(X_scores)
    Q = np.sum((X_original - X_recon)**2, axis=1)
    
    return T2, Q, T2_limit
```

---

## 5. PLS Regression (PLS-R)

Use PLS-R when the target is a continuous variable (concentration, property)
and features are highly collinear (spectra).

```python
from sklearn.cross_decomposition import PLSRegression
from sklearn.model_selection import cross_val_score, KFold
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# --- Step 1: Find optimal number of components via cross-validation ---
cv = KFold(n_splits=10, shuffle=True, random_state=42)
rmsecv_list = []
n_range = range(1, 21)

for n in n_range:
    pls = PLSRegression(n_components=n, scale=True)
    mse_scores = -cross_val_score(pls, X_train, y_train,
                                   cv=cv, scoring='neg_mean_squared_error')
    rmsecv_list.append(np.sqrt(mse_scores.mean()))

optimal_n = n_range[np.argmin(rmsecv_list)]
print(f"Optimal components: {optimal_n} (RMSECV={min(rmsecv_list):.4f})")

# Plot RMSECV curve
fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(list(n_range), rmsecv_list, 'o-', color='steelblue')
ax.axvline(optimal_n, color='red', ls='--', label=f'Optimal: {optimal_n}')
ax.set_xlabel('Number of PLS Components')
ax.set_ylabel('RMSECV')
ax.set_title('Cross-Validation: PLS Component Selection')
ax.legend()
plt.tight_layout()
```

```python
# --- Step 2: Train final model on train set ---
pls_final = PLSRegression(n_components=optimal_n, scale=True)
pls_final.fit(X_train, y_train)

# --- Step 3: Evaluate on test set ---
y_pred_train = pls_final.predict(X_train).ravel()
y_pred_test  = pls_final.predict(X_test).ravel()

def pls_metrics(y_true, y_pred, label=''):
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2   = r2_score(y_true, y_pred)
    rpd  = y_true.std() / rmse   # Residual Predictive Deviation
    bias = (y_pred - y_true).mean()
    print(f"{label}:  RMSE={rmse:.4f}  R²={r2:.4f}  RPD={rpd:.2f}  Bias={bias:.4f}")
    return rmse, r2, rpd

pls_metrics(y_train, y_pred_train, 'TRAIN (RMSEC)')
pls_metrics(y_test,  y_pred_test,  'TEST  (RMSEP)')
```

**RPD interpretation:**
- RPD < 1.5 → model not useful
- 1.5–2.0 → rough screening only
- 2.0–2.5 → acceptable for screening
- 2.5–3.0 → good for most applications
- > 3.0 → excellent / quantitative use

### Predicted vs. Actual Plot

```python
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
for ax, y_true, y_pred, label in [
    (axes[0], y_train, y_pred_train, 'Calibration'),
    (axes[1], y_test,  y_pred_test,  'Prediction'),
]:
    r2 = r2_score(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    ax.scatter(y_true, y_pred, alpha=0.7, s=40)
    lims = [min(y_true.min(), y_pred.min()), max(y_true.max(), y_pred.max())]
    ax.plot(lims, lims, 'r--', lw=1.5, label='1:1 line')
    ax.set_xlabel('Reference value')
    ax.set_ylabel('Predicted value')
    ax.set_title(f'{label}: R²={r2:.3f}, RMSE={rmse:.3f}')
    ax.legend()
plt.suptitle('PLS-R: Predicted vs. Actual', fontsize=13)
plt.tight_layout()
```

---

## 6. PLS-DA (Discriminant Analysis / Classification)

```python
from sklearn.cross_decomposition import PLSRegression
from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()
y_encoded = le.fit_transform(y_classes)

pls_da = PLSRegression(n_components=optimal_n, scale=True)
pls_da.fit(X_train, y_encoded[train_idx])

# Classify by rounding / threshold
y_pred_cont = pls_da.predict(X_test).ravel()
y_pred_class = np.round(y_pred_cont).astype(int).clip(0, len(le.classes_)-1)
y_pred_labels = le.inverse_transform(y_pred_class)
```

---

## 7. VIP Scores (Variable Importance in Projection)

VIP identifies which wavelengths/features contribute most to the PLS model.

```python
def vip_scores(pls_model, X, y):
    """Compute VIP scores for a fitted PLSRegression model."""
    T = pls_model.x_scores_
    W = pls_model.x_weights_
    Q = pls_model.y_loadings_
    n, k = T.shape
    p = W.shape[0]
    
    SS = np.diag(T.T @ T @ Q.T @ Q).reshape(k, -1)
    W_norm = W / np.linalg.norm(W, axis=0, keepdims=True)
    vip = np.sqrt(p * np.sum(SS.T * W_norm**2, axis=1) / SS.sum())
    return vip

vip = vip_scores(pls_final, X_train, y_train)

fig, ax = plt.subplots(figsize=(10, 3))
ax.plot(wavelengths, vip, color='darkred')
ax.axhline(1, color='grey', ls='--', label='VIP = 1 threshold')
ax.fill_between(wavelengths, vip, 1, where=(vip > 1), alpha=0.3, color='red')
ax.set_xlabel('Wavelength (nm)')
ax.set_ylabel('VIP Score')
ax.set_title('Variable Importance in Projection (VIP)')
ax.legend()
plt.tight_layout()
```

---

## 8. Full Pipeline (Production Ready)

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.cross_decomposition import PLSRegression

pipe = Pipeline([
    ('snv',   StandardNormalVariate()),       # from chemotools
    ('sg',    SavitzkyGolay(window=11, poly=3, deriv=1)),
    ('scale', StandardScaler()),
    ('pls',   PLSRegression(n_components=optimal_n)),
])

pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)
```

> **Critical**: fitting SNV inside the pipeline on training data is correct.
> SNV is row-wise and does not leak test information, but MSC does — fit MSC
> on training spectra only and transform test spectra using the training mean.

---

## 9. Metrics Summary

| Metric | Formula | Interpretation |
|---|---|---|
| RMSEC | √(Σ(ŷ-y)²/n) on train | Calibration error |
| RMSECV | Same, cross-validated | Model complexity guide |
| RMSEP | √(Σ(ŷ-y)²/n) on test | Prediction error (key metric) |
| R²P | 1 - SS_res/SS_tot on test | Explained variance in prediction |
| RPD | σ_y / RMSEP | Prediction capability (>2 = useful) |
| Bias | mean(ŷ - y) | Systematic error |
