# Module: Time Series Analysis & Forecasting

---

## 1. Time Series Vocabulary

| Term | Meaning |
|---|---|
| Trend | Long-term increase or decrease |
| Seasonality | Periodic fluctuation (daily, weekly, annual) |
| Cyclicity | Irregular long-term oscillation (business cycles) |
| Residual | What's left after decomposition |
| Stationarity | Statistical properties constant over time (required by ARIMA) |
| Autocorrelation | Correlation of series with its past values |

---

## 2. Loading and Indexing

```python
import pandas as pd

df = pd.read_csv('timeseries.csv', parse_dates=['date'], index_col='date')
df = df.sort_index()                         # ensure chronological order
df = df.asfreq('D')                          # set regular frequency ('D'=daily)
df = df.ffill()                              # forward-fill missing dates

# Check for gaps
print(pd.date_range(df.index.min(), df.index.max()).difference(df.index))
```

**CRITICAL for time series**: never use random `train_test_split`.
Always split chronologically:

```python
cutoff = '2024-01-01'
train = df[:cutoff]
test  = df[cutoff:]
```

---

## 3. Decomposition

```python
from statsmodels.tsa.seasonal import seasonal_decompose, STL

# Classical additive/multiplicative decomposition
result = seasonal_decompose(df['value'], model='additive', period=12)
result.plot()
plt.suptitle('Time Series Decomposition')
plt.tight_layout()

# STL (more robust, handles outliers better)
stl = STL(df['value'], period=12, robust=True)
res = stl.fit()
fig = res.plot()
```

---

## 4. Stationarity Testing

```python
from statsmodels.tsa.stattools import adfuller, kpss

def test_stationarity(series, label=''):
    """ADF test: H0 = non-stationary. Reject H0 → stationary."""
    adf_stat, adf_p, _, _, adf_crit, _ = adfuller(series.dropna())
    
    """KPSS test: H0 = stationary. Reject H0 → non-stationary."""
    kpss_stat, kpss_p, _, kpss_crit = kpss(series.dropna(), regression='c')
    
    print(f"\n{label}")
    print(f"  ADF:  stat={adf_stat:.4f}, p={adf_p:.4f} → {'Stationary ✓' if adf_p < 0.05 else 'Non-stationary ✗'}")
    print(f"  KPSS: stat={kpss_stat:.4f}, p={kpss_p:.4f} → {'Stationary ✓' if kpss_p > 0.05 else 'Non-stationary ✗'}")

test_stationarity(df['value'], 'Original')

# If non-stationary: difference
df['value_d1'] = df['value'].diff()
test_stationarity(df['value_d1'].dropna(), '1st difference')
```

---

## 5. Autocorrelation Plots

```python
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

fig, axes = plt.subplots(2, 1, figsize=(12, 6))
plot_acf(df['value'].dropna(), lags=40, ax=axes[0])
axes[0].set_title('ACF — use to identify MA(q) order')

plot_pacf(df['value'].dropna(), lags=40, ax=axes[1])
axes[1].set_title('PACF — use to identify AR(p) order')
plt.tight_layout()
```

**ARIMA order selection from plots:**
- ACF cuts off at lag q, PACF decays → MA(q)
- PACF cuts off at lag p, ACF decays → AR(p)
- Both decay gradually → ARMA(p,q)
- Series non-stationary → integrate: d = number of differences needed

---

## 6. ARIMA / SARIMA

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX

# SARIMA(p,d,q)(P,D,Q)[s]  — seasonal period s=12 for monthly
model = SARIMAX(train['value'],
                order=(1, 1, 1),
                seasonal_order=(1, 1, 1, 12),
                enforce_stationarity=False)
result = model.fit(disp=False)
print(result.summary())

# Diagnostics
result.plot_diagnostics(figsize=(12, 8))
plt.tight_layout()

# Forecast
n_forecast = len(test)
forecast = result.get_forecast(steps=n_forecast)
pred_mean = forecast.predicted_mean
pred_ci   = forecast.conf_int(alpha=0.05)

# Plot
fig, ax = plt.subplots(figsize=(12, 4))
train['value'].plot(ax=ax, label='Train')
test['value'].plot(ax=ax, label='Actual', color='steelblue')
pred_mean.plot(ax=ax, label='Forecast', color='red')
ax.fill_between(pred_ci.index,
                pred_ci.iloc[:, 0], pred_ci.iloc[:, 1],
                alpha=0.2, color='red', label='95% CI')
ax.set_title('SARIMA Forecast')
ax.legend()
plt.tight_layout()
```

### Auto ARIMA (find optimal order automatically)

```python
pip install pmdarima

from pmdarima import auto_arima

model = auto_arima(train['value'],
                   seasonal=True, m=12,
                   stepwise=True, information_criterion='aic',
                   trace=True, error_action='ignore')
print(model.summary())
```

---

## 7. Prophet (Facebook/Meta)

Prophet handles multiple seasonalities, holidays, and missing data with minimal tuning.

```python
pip install prophet

from prophet import Prophet
import pandas as pd

# Prophet requires columns named 'ds' (datetime) and 'y' (value)
df_prophet = df.reset_index().rename(columns={'date': 'ds', 'value': 'y'})

model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,
    seasonality_mode='multiplicative',   # 'additive' if variance is constant
    interval_width=0.95,
)

# Add custom seasonalities or holidays
model.add_country_holidays(country_name='IT')

model.fit(df_prophet[df_prophet['ds'] < '2024-01-01'])

# Forecast
future = model.make_future_dataframe(periods=365, freq='D')
forecast = model.predict(future)

# Plot
fig1 = model.plot(forecast)
fig1.gca().set_title('Prophet Forecast')

fig2 = model.plot_components(forecast)
plt.suptitle('Trend + Seasonality Components')
```

---

## 8. Time Series Cross-Validation

Never use standard k-fold for time series — it leaks the future into training.

```python
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error
import numpy as np

tscv = TimeSeriesSplit(n_splits=5, gap=0)

rmse_scores = []
for fold, (train_idx, val_idx) in enumerate(tscv.split(df)):
    X_tr, X_val = df.iloc[train_idx], df.iloc[val_idx]
    # ... fit model on X_tr, predict X_val ...
    rmse = np.sqrt(mean_squared_error(y_val, y_pred))
    rmse_scores.append(rmse)
    print(f"Fold {fold+1}: RMSE = {rmse:.4f}")

print(f"\nMean RMSE: {np.mean(rmse_scores):.4f} ± {np.std(rmse_scores):.4f}")
```

---

## 9. Forecasting Metrics

```python
import numpy as np

def ts_metrics(actual, predicted, label=''):
    mae   = np.mean(np.abs(actual - predicted))
    rmse  = np.sqrt(np.mean((actual - predicted)**2))
    mape  = np.mean(np.abs((actual - predicted) / actual)) * 100
    smape = np.mean(2*np.abs(actual - predicted) / (np.abs(actual)+np.abs(predicted))) * 100

    print(f"{label}:")
    print(f"  MAE   = {mae:.4f}")
    print(f"  RMSE  = {rmse:.4f}")
    print(f"  MAPE  = {mape:.2f}%  (avoid if values near 0)")
    print(f"  sMAPE = {smape:.2f}% (symmetric, preferred)")
    return mae, rmse, mape, smape
```

**MAPE caveat**: undefined / explodes when actual values are near zero.
Use sMAPE or MAE in that case.

---

## 10. Detecting Change Points

```python
pip install ruptures

import ruptures as rpt

signal = df['value'].values

# PELT algorithm (fast, exact, for many change points)
model = rpt.Pelt(model='rbf').fit(signal)
breakpoints = model.predict(pen=10)

# Display
fig, ax = plt.subplots(figsize=(12, 4))
rpt.display(signal, breakpoints, ax=ax)
ax.set_title('Change Point Detection (PELT)')
plt.tight_layout()
```
