# Module: Visualization Standards

Charts are arguments. Every design decision either strengthens or weakens
the case you're making. This module covers standards, code patterns, and
the chart-selection framework for publication-quality figures.

---

## 1. The Five Non-Negotiables

Every figure must have:
1. **A descriptive title** (or a headline title that states the finding)
2. **Axis labels with units** — `Absorbance (A.U.)`, not just `Absorbance`
3. **A legend** when > 1 series is shown
4. **Colorblind-safe palette**
5. **No unnecessary decoration** (chart junk)

---

## 2. Global Style Setup

Put this in every notebook/script before any plots:

```python
import matplotlib.pyplot as plt
import seaborn as sns

# --- Base style ---
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_context('notebook', font_scale=1.15)
sns.set_palette('colorblind')   # 8-color colorblind-safe palette

# --- Consistent figure defaults ---
plt.rcParams.update({
    'figure.dpi':       150,
    'savefig.dpi':      300,
    'savefig.bbox':     'tight',
    'figure.figsize':   (8, 5),
    'axes.spines.top':  False,
    'axes.spines.right': False,
    'font.family':      'sans-serif',
    'axes.titlesize':   13,
    'axes.labelsize':   11,
    'xtick.labelsize':  10,
    'ytick.labelsize':  10,
    'legend.fontsize':  10,
    'legend.framealpha': 0.8,
    'lines.linewidth':  1.8,
})

# Color palette (reference these by name)
COLORS = {
    'blue':   '#0072B2',
    'orange': '#E69F00',
    'green':  '#009E73',
    'red':    '#D55E00',
    'purple': '#CC79A7',
    'sky':    '#56B4E9',
    'yellow': '#F0E442',
    'black':  '#000000',
}
```

---

## 3. Chart Selection Guide

```
What are you showing?              → Chart type
─────────────────────────────────────────────────────
Distribution of 1 variable        → Histogram + KDE, violin, box
Compare 2+ groups (distribution)  → Violin, box-and-whisker, strip
Trend over time / ordered X       → Line chart
Compare quantities across groups  → Bar chart (horizontal if many categories)
Relationship: 2 numeric vars      → Scatter plot (+ regression line)
Relationship: 3 numeric vars      → Scatter + colour/size encoding
Correlation matrix                → Heatmap (triangular)
Part-of-whole (< 5 parts)         → Stacked bar (NOT pie chart)
Geospatial                        → Choropleth / scatter-geo
High-dimensional (spectra)        → Line plot, PCA score plot
Uncertainty                       → Error bars (95% CI, not SD)
```

**Never use:**
- 3D bar/pie charts — distorts perception
- Pie charts with > 5 slices — use ranked bar instead
- Dual y-axes — misleads relationships
- Truncated y-axis for bar charts — exaggerates differences

---

## 4. Key Chart Patterns

### Bar chart (group comparison)

```python
fig, ax = plt.subplots(figsize=(8, 5))
means  = df.groupby('group')['value'].mean()
errors = df.groupby('group')['value'].sem() * 1.96   # 95% CI

bars = ax.bar(means.index, means.values,
              yerr=errors.values, capsize=4,
              color=[COLORS['blue'], COLORS['orange'], COLORS['green']],
              edgecolor='white', linewidth=0.8, error_kw={'linewidth': 1.5})

# Annotate values on bars
for bar, val in zip(bars, means):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.02,
            f'{val:.2f}', ha='center', va='bottom', fontsize=10)

ax.set_title('Mean Value by Group (±95% CI)')
ax.set_xlabel('Group')
ax.set_ylabel('Value (units)')
ax.set_ylim(0, means.max() * 1.25)   # always start bar chart at 0
plt.tight_layout()
```

### Scatter with regression

```python
from scipy import stats
import numpy as np

fig, ax = plt.subplots(figsize=(7, 6))
ax.scatter(x, y, alpha=0.6, s=50, color=COLORS['blue'], edgecolor='white')

# Regression line + CI
slope, intercept, r, p, se = stats.linregress(x, y)
x_line = np.linspace(x.min(), x.max(), 200)
y_line = slope * x_line + intercept
ax.plot(x_line, y_line, color=COLORS['red'], lw=2,
        label=f'y = {slope:.2f}x + {intercept:.2f}\nr = {r:.3f}, p = {p:.3f}')

ax.set_xlabel('X variable (unit)')
ax.set_ylabel('Y variable (unit)')
ax.set_title('Scatter Plot with Linear Regression')
ax.legend()
plt.tight_layout()
```

### Violin plot (distribution comparison)

```python
fig, ax = plt.subplots(figsize=(9, 5))
sns.violinplot(data=df, x='group', y='value', palette='colorblind',
               inner='quartile', ax=ax)
sns.stripplot(data=df, x='group', y='value', color='black',
              alpha=0.3, size=3, jitter=True, ax=ax)

ax.set_title('Distribution of Value by Group')
ax.set_xlabel('Group')
ax.set_ylabel('Value (unit)')
plt.tight_layout()
```

### Heatmap (correlation matrix)

```python
import numpy as np

corr = df.select_dtypes('number').corr()

fig, ax = plt.subplots(figsize=(10, 8))
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, mask=mask, annot=True, fmt='.2f',
            cmap='RdBu_r', center=0, vmin=-1, vmax=1,
            square=True, linewidths=0.4,
            annot_kws={'size': 9}, ax=ax)
ax.set_title('Pearson Correlation Matrix')
plt.tight_layout()
```

### Time series

```python
fig, ax = plt.subplots(figsize=(12, 4))
ax.plot(df['date'], df['value'], color=COLORS['blue'], label='Observed')
ax.fill_between(df['date'], df['lower_ci'], df['upper_ci'],
                alpha=0.2, color=COLORS['blue'], label='95% CI')

# Annotate a key event
ax.axvline(pd.Timestamp('2024-06-01'), color=COLORS['red'],
           ls='--', lw=1.5, label='Policy change')

ax.set_xlabel('Date')
ax.set_ylabel('Value (unit)')
ax.set_title('Trend Over Time with Key Event')
ax.legend()
fig.autofmt_xdate()
plt.tight_layout()
```

### Spectra / spectral overlay

```python
fig, ax = plt.subplots(figsize=(10, 4))
for i, (spectrum, label) in enumerate(zip(spectra, labels)):
    ax.plot(wavelengths, spectrum, lw=0.8, alpha=0.7,
            color=plt.cm.viridis(i / len(spectra)), label=label)

ax.set_xlabel('Wavelength (nm)')
ax.set_ylabel('Absorbance (A.U.)')
ax.set_title('NIR Spectra — All Samples')
# Only show legend if < 10 items
if len(labels) <= 10:
    ax.legend(loc='upper right')
plt.tight_layout()
```

---

## 5. Annotation — Communicating On the Plot

Direct labelling is almost always better than a legend:

```python
# Label lines directly instead of using a legend
for line, label in zip(lines, labels):
    x_end = line.get_xdata()[-1]
    y_end = line.get_ydata()[-1]
    ax.annotate(label, xy=(x_end, y_end),
                xytext=(5, 0), textcoords='offset points',
                va='center', fontsize=9, color=line.get_color())

# Highlight a region
ax.axvspan(1400, 1600, alpha=0.15, color='yellow',
           label='C–H absorption region')

# Point annotation
ax.annotate('Outlier detected',
            xy=(x_outlier, y_outlier),
            xytext=(x_outlier+10, y_outlier+0.1),
            arrowprops=dict(arrowstyle='->', color='red'),
            color='red', fontsize=9)
```

---

## 6. Subplots and Multi-Panel Figures

```python
fig, axes = plt.subplots(2, 2, figsize=(12, 9),
                          constrained_layout=True)

# or with shared axes
fig, axes = plt.subplots(1, 2, figsize=(12, 5), sharey=True)

# Add a shared title
fig.suptitle('Analysis Overview', fontsize=15, y=1.02)

# Add panel labels (a), (b), (c)
for ax, label in zip(axes.flat, 'abcd'):
    ax.text(-0.08, 1.02, f'({label})', transform=ax.transAxes,
            fontsize=12, fontweight='bold', va='top')
```

---

## 7. Interactive Plots with Plotly

Use Plotly when the reader needs to zoom, hover, or filter.

```python
import plotly.express as px
import plotly.graph_objects as go

# Scatter
fig = px.scatter(df, x='x', y='y', color='group',
                 hover_data=['sample_id'],
                 title='Interactive Scatter',
                 labels={'x': 'X Variable (unit)', 'y': 'Y Variable (unit)'},
                 template='plotly_white',
                 color_discrete_sequence=px.colors.qualitative.Safe)
fig.show()
fig.write_html('scatter.html')   # save for sharing

# Line chart
fig = px.line(df, x='date', y='value', color='category',
              template='plotly_white')
fig.update_traces(mode='lines+markers', marker_size=4)
fig.show()
```

---

## 8. Saving Figures

```python
# Save at publication quality
fig.savefig('figure_01.png', dpi=300, bbox_inches='tight')
fig.savefig('figure_01.pdf', bbox_inches='tight')   # vector for LaTeX
fig.savefig('figure_01.svg', bbox_inches='tight')   # vector for web/editing
```

**Format guide:**
- `.pdf` / `.svg` → vector; scales infinitely; best for papers and presentations
- `.png` at 300 dpi → raster; for Word, web, posters
- `.jpg` → **avoid** for scientific plots (compression artifacts)

---

## 9. Colorblind Safety

**Test your palette**: ~8% of men have red-green colour blindness.
Never rely on red/green distinction alone.

Safe palettes:
```python
sns.set_palette('colorblind')                 # seaborn built-in
px.colors.qualitative.Safe                    # plotly
plt.cm.viridis / plt.cm.cividis               # perceptually uniform sequential
```

Add texture/shape in addition to colour for maximum accessibility:
```python
# Different markers per group
markers = ['o', 's', '^', 'D', 'v', 'P']
for group, marker in zip(groups, markers):
    ax.scatter(x[group], y[group], marker=marker, label=group, s=60)
```
