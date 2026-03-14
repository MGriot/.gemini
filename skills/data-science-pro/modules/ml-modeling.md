# Module: Machine Learning Modeling

---

## 1. The Golden Rule: Split Before Everything

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y   # for classification: maintain class proportions
)
# STOP. Never touch X_test again until final evaluation.
```

**Data leakage checklist:**
- [ ] Is the scaler fit only on `X_train`?
- [ ] Is imputation fit only on `X_train`?
- [ ] Is feature selection done only on `X_train`?
- [ ] Are there any time-aware splits needed (time series)?

---

## 2. The sklearn Pipeline Pattern

Always use a `Pipeline`. It prevents leakage, simplifies cross-validation,
and makes deployment trivial.

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier

pipe = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler',  StandardScaler()),
    ('model',   RandomForestClassifier(n_estimators=200, random_state=42)),
])

# Fit on train only
pipe.fit(X_train, y_train)

# Evaluate on test
y_pred = pipe.predict(X_test)
```

---

## 3. Cross-Validation

```python
from sklearn.model_selection import (
    cross_val_score, StratifiedKFold, KFold,
    RepeatedStratifiedKFold
)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(pipe, X_train, y_train,
                          cv=cv, scoring='roc_auc', n_jobs=-1)

print(f"CV ROC-AUC: {scores.mean():.4f} ± {scores.std():.4f}")
```

**Choosing CV strategy:**

| Data | Strategy |
|---|---|
| Standard | `StratifiedKFold(5)` or `KFold(5)` |
| Small dataset (n < 200) | `LeaveOneOut()` or `KFold(10)` |
| Imbalanced classes | `StratifiedKFold` (always) |
| Time series | `TimeSeriesSplit` |
| Groups/batches | `GroupKFold` |

---

## 4. Hyperparameter Tuning

### RandomizedSearchCV (preferred for most cases)

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

param_dist = {
    'model__n_estimators':   randint(100, 500),
    'model__max_depth':      [None, 5, 10, 20],
    'model__min_samples_leaf': randint(1, 10),
    'model__max_features':   ['sqrt', 'log2', 0.5],
}

search = RandomizedSearchCV(
    pipe, param_dist,
    n_iter=50, cv=5, scoring='roc_auc',
    n_jobs=-1, random_state=42, verbose=1
)
search.fit(X_train, y_train)

print("Best params:", search.best_params_)
print(f"Best CV score: {search.best_score_:.4f}")

best_pipe = search.best_estimator_
```

---

## 5. Classification Metrics

```python
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_auc_score, roc_curve, average_precision_score,
    ConfusionMatrixDisplay
)

y_pred  = best_pipe.predict(X_test)
y_proba = best_pipe.predict_proba(X_test)[:, 1]   # positive class

# Full report
print(classification_report(y_test, y_pred))

# ROC-AUC
auc = roc_auc_score(y_test, y_proba)
print(f"ROC-AUC = {auc:.4f}")

# Confusion matrix (normalised)
fig, ax = plt.subplots(figsize=(5, 4))
ConfusionMatrixDisplay.from_predictions(
    y_test, y_pred, normalize='true', ax=ax, cmap='Blues'
)
ax.set_title(f'Confusion Matrix (normalised)\nROC-AUC = {auc:.3f}')
plt.tight_layout()

# ROC curve
fpr, tpr, _ = roc_curve(y_test, y_proba)
fig, ax = plt.subplots(figsize=(6, 5))
ax.plot(fpr, tpr, lw=2, label=f'Model (AUC = {auc:.3f})')
ax.plot([0,1],[0,1], 'k--', lw=1, label='Random')
ax.set_xlabel('False Positive Rate')
ax.set_ylabel('True Positive Rate')
ax.set_title('ROC Curve')
ax.legend()
plt.tight_layout()
```

**Metric selection guide:**

| Situation | Primary metric |
|---|---|
| Balanced classes | Accuracy, F1 |
| Imbalanced (rare positive) | ROC-AUC, PR-AUC, F1 |
| High cost of FP (spam filter) | Precision |
| High cost of FN (disease) | Recall |
| Multiclass | Macro F1 |

---

## 6. Regression Metrics

```python
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error,
    r2_score, mean_absolute_percentage_error
)
import numpy as np

y_pred = best_pipe.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae  = mean_absolute_error(y_test, y_pred)
r2   = r2_score(y_test, y_pred)
mape = mean_absolute_percentage_error(y_test, y_pred) * 100

print(f"RMSE = {rmse:.4f}")
print(f"MAE  = {mae:.4f}")
print(f"R²   = {r2:.4f}")
print(f"MAPE = {mape:.2f}%")

# Residual plot — must look like noise
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
residuals = y_test - y_pred
axes[0].scatter(y_pred, residuals, alpha=0.5, s=30)
axes[0].axhline(0, color='red', ls='--')
axes[0].set_xlabel('Predicted')
axes[0].set_ylabel('Residuals')
axes[0].set_title('Residual Plot')

axes[1].scatter(y_test, y_pred, alpha=0.5, s=30)
lim = [min(y_test.min(), y_pred.min()), max(y_test.max(), y_pred.max())]
axes[1].plot(lim, lim, 'r--')
axes[1].set_xlabel('Actual')
axes[1].set_ylabel('Predicted')
axes[1].set_title(f'Predicted vs Actual (R²={r2:.3f})')
plt.tight_layout()
```

---

## 7. Feature Importance

```python
import pandas as pd

# For tree-based models
importances = best_pipe.named_steps['model'].feature_importances_
feat_names  = X_train.columns

imp_df = (pd.DataFrame({'feature': feat_names, 'importance': importances})
           .sort_values('importance', ascending=False)
           .head(20))

fig, ax = plt.subplots(figsize=(8, 6))
ax.barh(imp_df['feature'][::-1], imp_df['importance'][::-1],
        color='steelblue')
ax.set_xlabel('Importance')
ax.set_title('Top 20 Feature Importances')
plt.tight_layout()

# SHAP (model-agnostic, preferred)
import shap
explainer = shap.TreeExplainer(best_pipe.named_steps['model'])
shap_values = explainer.shap_values(X_test_scaled)
shap.summary_plot(shap_values, X_test_scaled, feature_names=feat_names)
```

---

## 8. Model Persistence

```python
import joblib

# Save
joblib.dump(best_pipe, 'model_v1.pkl')

# Load
pipe_loaded = joblib.load('model_v1.pkl')
y_pred = pipe_loaded.predict(X_new)
```

Always version your models: `model_v{date}_{score}.pkl`.

---

## 9. Class Imbalance

```python
# Option 1: class_weight in model
model = RandomForestClassifier(class_weight='balanced', random_state=42)

# Option 2: SMOTE oversampling (fit on train only!)
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

pipe = ImbPipeline([
    ('imputer', SimpleImputer()),
    ('scaler',  StandardScaler()),
    ('smote',   SMOTE(random_state=42)),
    ('model',   RandomForestClassifier(random_state=42)),
])

# Option 3: Threshold tuning
from sklearn.metrics import precision_recall_curve
precisions, recalls, thresholds = precision_recall_curve(y_test, y_proba)
# Pick threshold that balances precision/recall for your use case
```
