"""
Chemometrics Template — PCA + PLS-R
=====================================
CONFIG → LOAD → PREPROCESS → PCA → PLS-R → REPORT
"""

# ── CONFIG ────────────────────────────────────────────────────────────────────
SPECTRA_PATH   = 'data/raw/spectra.csv'   # rows=samples, cols=wavelengths
TARGET_PATH    = 'data/raw/reference.csv' # single column: reference values
TARGET_COL     = 'moisture'
WAVELENGTHS    = None   # list of floats, or None → use column index
TEST_SIZE      = 0.2
CV_FOLDS       = 10
MAX_COMPONENTS = 20
RANDOM_SEED    = 42
OUTPUT_DIR     = 'outputs/chemometrics'
# ──────────────────────────────────────────────────────────────────────────────

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
from scipy.signal import savgol_filter
from sklearn.cross_decomposition import PLSRegression
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

np.random.seed(RANDOM_SEED)
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams.update({'figure.dpi': 150, 'savefig.dpi': 300,
                     'savefig.bbox': 'tight',
                     'axes.spines.top': False, 'axes.spines.right': False})


# ── PREPROCESSING ─────────────────────────────────────────────────────────────
def snv(X):
    """Standard Normal Variate — row-wise."""
    return (X - X.mean(axis=1, keepdims=True)) / X.std(axis=1, keepdims=True)

def sg_deriv(X, window=11, poly=3, deriv=1):
    """Savitzky-Golay smoothing / derivative."""
    return savgol_filter(X, window_length=window, polyorder=poly, deriv=deriv)


# ── METRICS ───────────────────────────────────────────────────────────────────
def pls_metrics(y_true, y_pred, label=''):
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2   = r2_score(y_true, y_pred)
    rpd  = np.std(y_true) / rmse
    bias = np.mean(y_pred.ravel() - y_true.ravel())
    print(f"  {label:10s}  RMSE={rmse:.4f}  R²={r2:.4f}  RPD={rpd:.2f}  Bias={bias:.4f}")
    return rmse, r2, rpd


# ── 1. LOAD DATA ──────────────────────────────────────────────────────────────
X_raw = pd.read_csv(SPECTRA_PATH, index_col=0).values.astype(float)
y     = pd.read_csv(TARGET_PATH, index_col=0)[TARGET_COL].values.astype(float)

wl = WAVELENGTHS if WAVELENGTHS is not None else np.arange(X_raw.shape[1])

print(f"Spectra: {X_raw.shape}  |  Target: {y.shape}")
print(f"Target range: [{y.min():.3f}, {y.max():.3f}], mean={y.mean():.3f}")


# ── 2. RAW SPECTRA PLOT ───────────────────────────────────────────────────────
norm = plt.Normalize(y.min(), y.max())
fig, ax = plt.subplots(figsize=(11, 4))
for i in range(X_raw.shape[0]):
    ax.plot(wl, X_raw[i], lw=0.5, alpha=0.6, color=plt.cm.viridis(norm(y[i])))
plt.colorbar(plt.cm.ScalarMappable(norm=norm, cmap='viridis'), ax=ax,
             label=TARGET_COL)
ax.set(xlabel='Wavelength (nm)', ylabel='Absorbance (A.U.)',
       title='Raw Spectra — Coloured by Target')
plt.tight_layout()
fig.savefig(f'{OUTPUT_DIR}/01_raw_spectra.png')
plt.close()


# ── 3. PREPROCESS ─────────────────────────────────────────────────────────────
X_pre = snv(X_raw)
X_pre = sg_deriv(X_pre, window=11, poly=3, deriv=1)

fig, axes = plt.subplots(2, 1, figsize=(11, 6), sharex=True)
for ax, X, title in [(axes[0], X_raw, 'Raw'),
                      (axes[1], X_pre, 'After SNV + SG 1st derivative')]:
    for i in range(min(30, X.shape[0])):
        ax.plot(wl, X[i], lw=0.4, alpha=0.5)
    ax.set(ylabel='Absorbance (A.U.)', title=title)
axes[-1].set_xlabel('Wavelength (nm)')
plt.tight_layout()
fig.savefig(f'{OUTPUT_DIR}/02_preprocessed.png')
plt.close()


# ── 4. TRAIN / TEST SPLIT ─────────────────────────────────────────────────────
X_tr, X_te, y_tr, y_te = train_test_split(
    X_pre, y, test_size=TEST_SIZE, random_state=RANDOM_SEED)
print(f"\nTrain: {X_tr.shape[0]}  |  Test: {X_te.shape[0]}")


# ── 5. PCA ───────────────────────────────────────────────────────────────────
pca_pipe = Pipeline([('sc', StandardScaler()), ('pca', PCA(n_components=10))])
pca_pipe.fit(X_tr)
scores_tr = pca_pipe.transform(X_tr)
scores_te = pca_pipe.transform(X_te)
pca = pca_pipe.named_steps['pca']

ev = pca.explained_variance_ratio_
print(f"\nPCA explained variance (first 5 PCs): {ev[:5].round(3)}")

# Score plot PC1 vs PC2
fig, ax = plt.subplots(figsize=(7, 6))
sc = ax.scatter(scores_tr[:, 0], scores_tr[:, 1], c=y_tr,
                cmap='viridis', s=60, alpha=0.85, edgecolor='white', label='Train')
ax.scatter(scores_te[:, 0], scores_te[:, 1], c=y_te,
           cmap='viridis', s=60, marker='^', edgecolor='black', label='Test')
plt.colorbar(sc, ax=ax, label=TARGET_COL)
ax.set(xlabel=f'PC1 ({ev[0]*100:.1f}% var)',
       ylabel=f'PC2 ({ev[1]*100:.1f}% var)',
       title='PCA Score Plot')
ax.axhline(0, color='grey', lw=0.5, ls='--')
ax.axvline(0, color='grey', lw=0.5, ls='--')
ax.legend()
plt.tight_layout()
fig.savefig(f'{OUTPUT_DIR}/03_pca_scores.png')
plt.close()


# ── 6. PLS — COMPONENT SELECTION BY RMSECV ───────────────────────────────────
cv = KFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_SEED)
rmsecv = []
for n in range(1, MAX_COMPONENTS + 1):
    pls = PLSRegression(n_components=n, scale=True)
    mse = -cross_val_score(pls, X_tr, y_tr, cv=cv,
                           scoring='neg_mean_squared_error')
    rmsecv.append(np.sqrt(mse.mean()))

optimal_n = int(np.argmin(rmsecv)) + 1
print(f"\nOptimal PLS components: {optimal_n}  (RMSECV = {min(rmsecv):.4f})")

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(range(1, MAX_COMPONENTS+1), rmsecv, 'o-', color='steelblue', ms=5)
ax.axvline(optimal_n, color='red', ls='--', label=f'Optimal: {optimal_n}')
ax.set(xlabel='PLS Components', ylabel='RMSECV',
       title='Cross-Validation: PLS Component Selection')
ax.legend()
plt.tight_layout()
fig.savefig(f'{OUTPUT_DIR}/04_rmsecv.png')
plt.close()


# ── 7. FINAL PLS MODEL ───────────────────────────────────────────────────────
pls = PLSRegression(n_components=optimal_n, scale=True)
pls.fit(X_tr, y_tr)

y_pred_tr = pls.predict(X_tr).ravel()
y_pred_te = pls.predict(X_te).ravel()

print("\nPLS Model Performance:")
pls_metrics(y_tr, y_pred_tr, 'TRAIN')
pls_metrics(y_te, y_pred_te, 'TEST ')

# Predicted vs actual
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
for ax, yt, yp, label in [
    (axes[0], y_tr, y_pred_tr, f'Calibration  n={len(y_tr)}'),
    (axes[1], y_te, y_pred_te, f'Prediction   n={len(y_te)}'),
]:
    r2   = r2_score(yt, yp)
    rmse = np.sqrt(mean_squared_error(yt, yp))
    ax.scatter(yt, yp, alpha=0.7, s=50, edgecolor='white')
    lim = [min(yt.min(), yp.min())*0.98, max(yt.max(), yp.max())*1.02]
    ax.plot(lim, lim, 'r--', lw=1.5, label='1:1 line')
    ax.set(xlabel=f'Reference {TARGET_COL}',
           ylabel=f'Predicted {TARGET_COL}',
           title=f'{label}\nR²={r2:.3f}, RMSE={rmse:.3f}')
    ax.legend()
plt.suptitle(f'PLS-R ({optimal_n} components)', fontsize=13)
plt.tight_layout()
fig.savefig(f'{OUTPUT_DIR}/05_predicted_vs_actual.png')
plt.close()

print(f"\nAll figures saved to {OUTPUT_DIR}/")
