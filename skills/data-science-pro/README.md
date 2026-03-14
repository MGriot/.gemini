# Data Science Pro + Storyteller — Skill Kit

A modular, production-grade skill system for data scientists who need both
rigorous analysis **and** the ability to communicate findings that drive action.

---

## 📁 Structure

```
ds-skill/
├── README.md
├── SKILL.md                        ← Main agent entry point & routing
│
├── modules/
│   ├── eda.md                      ← Exploratory Data Analysis workflow
│   ├── chemometrics.md             ← PCA, PLS, spectral preprocessing
│   ├── statistics.md               ← Hypothesis testing, distributions
│   ├── visualization.md            ← matplotlib / seaborn / plotly standards
│   ├── ml-modeling.md              ← sklearn pipeline, validation, metrics
│   ├── storytelling.md             ← Narrative frameworks, audience, structure
│   ├── reproducibility.md          ← Environments, Docker, notebook hygiene
│   └── time-series.md              ← Time series analysis & forecasting
│
├── references/
│   ├── libraries.md                ← Curated Python library list
│   ├── plot-gallery.md             ← Ready-to-run visualization snippets
│   └── anti-patterns.md           ← Common mistakes & how to fix them
│
└── assets/
    ├── template-eda.py             ← Full EDA script template
    ├── template-chemometrics.py    ← PCA/PLS workflow template
    └── template-story.md           ← Data story narrative template
```

---

## 🚀 Quick Routing

| Task | Module |
|---|---|
| First look at a dataset | `modules/eda.md` |
| Spectral / chemical data, PCA, PLS | `modules/chemometrics.md` |
| t-test, ANOVA, correlation significance | `modules/statistics.md` |
| Make a publication-quality plot | `modules/visualization.md` |
| Train/validate a model | `modules/ml-modeling.md` |
| Turn results into a report or presentation | `modules/storytelling.md` |
| Reproduce the analysis later / share it | `modules/reproducibility.md` |
| Trend forecasting, ARIMA, Prophet | `modules/time-series.md` |
| Pick a library | `references/libraries.md` |
| Copy a plot snippet | `references/plot-gallery.md` |
| Debug something that looks wrong | `references/anti-patterns.md` |

---

## ⚠️ The Three Cardinal Rules

1. **Never scale before splitting.** Fit scaler on train, transform both.
2. **Every plot needs a title, axis labels, and units.**
3. **Every insight needs a "so what".** Analysis without narrative is noise.

---

## 🔧 Environment Quick Start

```bash
# Create reproducible environment
conda create -n ds-project python=3.11
conda activate ds-project
pip install -r requirements.txt

# Freeze for sharing
pip freeze > requirements.txt
```

Standard `requirements.txt` starter:
```
pandas>=2.0
numpy>=1.26
scipy>=1.11
scikit-learn>=1.4
statsmodels>=0.14
matplotlib>=3.8
seaborn>=0.13
plotly>=5.18
jupyter>=1.0
```

---

*Compatible with Python 3.10+. Last updated March 2026.*
