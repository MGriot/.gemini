# Reference: Python Libraries for Data Science

## Core Data

| Library | Version | Purpose | Install |
|---|---|---|---|
| `pandas` | ≥2.0 | DataFrames, I/O, time series | `pip install pandas` |
| `polars` | ≥0.20 | Fast DataFrames for large data | `pip install polars` |
| `numpy` | ≥1.26 | Numerical arrays | `pip install numpy` |
| `pyarrow` | ≥14 | Columnar storage, Parquet I/O | `pip install pyarrow` |

## Statistics

| Library | Purpose |
|---|---|
| `scipy.stats` | Distributions, hypothesis tests, descriptive stats |
| `statsmodels` | OLS, GLM, time series (ARIMA/SARIMA), diagnostics |
| `pingouin` | User-friendly stats: ANOVA, t-tests, effect sizes, power |
| `researchpy` | APA-style statistical summaries |

```python
# pingouin — cleaner than scipy for effect sizes
import pingouin as pg
result = pg.ttest(group_a, group_b, correction=True)
print(result)  # returns DataFrame with t, dof, p, CI, Cohen's d, power
```

## Machine Learning

| Library | Purpose |
|---|---|
| `scikit-learn` | Classification, regression, clustering, pipelines |
| `imbalanced-learn` | SMOTE, undersampling for class imbalance |
| `xgboost` | Gradient boosting (fast, accurate) |
| `lightgbm` | Gradient boosting (faster on large data) |
| `catboost` | Gradient boosting (handles categoricals natively) |
| `shap` | Model explainability (SHAP values) |
| `optuna` | Hyperparameter optimisation |

## Chemometrics

| Library | Purpose |
|---|---|
| `chemotools` | Spectral preprocessing (SNV, MSC, SG, derivatives) |
| `pyChemometrics` | PLS-DA with VIP, DModX, score/loading plots |
| `rampy` | Raman/FTIR spectral analysis |
| `hyperspy` | Hyperspectral imaging |

```bash
pip install chemotools pyChemometrics
```

## Visualization

| Library | Purpose |
|---|---|
| `matplotlib` | Core plotting; full control |
| `seaborn` | Statistical visualizations; opinionated defaults |
| `plotly` | Interactive charts; HTML/web output |
| `altair` | Declarative grammar-of-graphics charts |
| `bokeh` | Interactive dashboards |
| `pygal` | SVG charts |
| `wordcloud` | Text frequency visualization |

## Time Series

| Library | Purpose |
|---|---|
| `statsmodels` | ARIMA, SARIMA, VAR, state-space models |
| `prophet` | Multi-seasonality forecasting with holidays |
| `sktime` | Unified time series ML API |
| `darts` | Deep learning forecasting (LSTM, N-BEATS, TFT) |
| `pmdarima` | Auto-ARIMA (automatic order selection) |
| `ruptures` | Change point detection |
| `tsfresh` | Automated time series feature extraction |

## Reporting / Output

| Library | Purpose |
|---|---|
| `jupyter` | Interactive notebooks |
| `nbconvert` | Export notebooks to HTML/PDF/slides |
| `papermill` | Parameterised notebook execution |
| `quarto` | Next-gen scientific publishing (md + code → PDF/HTML) |
| `fpdf2` | Generate PDF reports programmatically |
| `jinja2` | HTML/LaTeX template rendering |
| `reportlab` | Full PDF layout engine |

## Data I/O

| Format | Library | Code |
|---|---|---|
| CSV | `pandas` | `pd.read_csv()` |
| Excel | `openpyxl` + `pandas` | `pd.read_excel()` |
| Parquet | `pyarrow` + `pandas` | `pd.read_parquet()` |
| JSON | `pandas` | `pd.read_json()` |
| SQL | `sqlalchemy` + `pandas` | `pd.read_sql()` |
| HDF5 | `h5py` | `h5py.File()` |
| MATLAB | `scipy.io` | `scipy.io.loadmat()` |
| SPC spectra | `spcfile` | `spcfile.SpcFile()` |

## Environment & Reproducibility

| Library | Purpose |
|---|---|
| `mlflow` | Experiment tracking, model registry |
| `dvc` | Data version control |
| `hydra` | Config management for ML experiments |
| `joblib` | Model serialisation, parallel processing |
| `tqdm` | Progress bars |
| `loguru` | Better logging than standard `logging` |

## Installation: Full Science Stack

```bash
# Core science stack
pip install pandas polars numpy scipy statsmodels scikit-learn

# Visualization
pip install matplotlib seaborn plotly

# Chemometrics
pip install chemotools pyChemometrics

# Time series
pip install statsmodels prophet pmdarima ruptures sktime

# ML extras
pip install xgboost lightgbm shap optuna imbalanced-learn

# Reproducibility
pip install mlflow joblib tqdm loguru

# Notebooks / reporting
pip install jupyter nbconvert papermill quarto
```
