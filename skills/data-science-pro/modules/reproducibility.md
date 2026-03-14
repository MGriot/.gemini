# Module: Reproducibility — Environments, Docker, Notebooks

---

## 1. Why Reproducibility Fails

The five most common causes:
1. No seed set → different random results every run
2. Package versions not pinned → code breaks after `pip install --upgrade`
3. Data preprocessing done outside the pipeline → order-sensitive bugs
4. Notebook cells run out of order → different outputs than apparent
5. No version control on data → "which CSV was this again?"

---

## 2. Seed Everything

```python
import numpy as np
import random
import os

SEED = 42

random.seed(SEED)
np.random.seed(SEED)
os.environ['PYTHONHASHSEED'] = str(SEED)

# PyTorch (if used)
import torch
torch.manual_seed(SEED)
torch.backends.cudnn.deterministic = True

# TensorFlow (if used)
import tensorflow as tf
tf.random.set_seed(SEED)
```

---

## 3. Environment Management

### Conda (recommended for scientific Python)

```bash
# Create
conda create -n project-name python=3.11
conda activate project-name

# Install
pip install -r requirements.txt

# Freeze exact environment
conda env export > environment.yml
# Or just pip:
pip freeze > requirements.txt
```

`environment.yml` example:

```yaml
name: chemometrics-project
channels:
  - conda-forge
  - defaults
dependencies:
  - python=3.11
  - numpy=1.26
  - pandas=2.1
  - scipy=1.11
  - pip:
    - scikit-learn==1.4.0
    - chemotools==0.2.0
    - matplotlib==3.8.0
    - seaborn==0.13.0
    - plotly==5.18.0
```

### venv (lighter, built-in)

```bash
python -m venv .venv
source .venv/bin/activate          # macOS/Linux
.venv\Scripts\activate             # Windows
pip install -r requirements.txt
```

---

## 4. Docker

Docker gives you a complete, frozen environment that runs identically
on any machine — no "works on my machine" problems.

### Minimal Data Science Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (for scipy, matplotlib)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (Docker cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Default command: run Jupyter
EXPOSE 8888
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--no-browser", "--allow-root"]
```

```bash
# Build
docker build -t ds-project:v1 .

# Run with Jupyter
docker run -p 8888:8888 -v $(pwd)/data:/app/data ds-project:v1

# Run a script
docker run ds-project:v1 python analysis/run_eda.py
```

### docker-compose.yml (for multi-service setups)

```yaml
version: '3.8'
services:
  notebook:
    build: .
    ports:
      - "8888:8888"
    volumes:
      - ./data:/app/data
      - ./notebooks:/app/notebooks
      - ./outputs:/app/outputs
    environment:
      - JUPYTER_TOKEN=mysecrettoken
```

---

## 5. Project Structure

```
project/
├── data/
│   ├── raw/            ← original data, NEVER modified
│   ├── interim/        ← intermediate transformed data
│   └── processed/      ← final data used for modeling
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_preprocessing.ipynb
│   └── 03_modeling.ipynb
├── src/
│   ├── __init__.py
│   ├── data_utils.py   ← data loading/cleaning functions
│   ├── features.py     ← feature engineering
│   └── models.py       ← model training/evaluation
├── outputs/
│   ├── figures/
│   └── models/
├── tests/
│   └── test_features.py
├── Dockerfile
├── requirements.txt
├── environment.yml
└── README.md
```

---

## 6. Notebook Hygiene

### The restart-and-run-all test

Before sharing any notebook:
1. `Kernel → Restart & Clear Output`
2. `Cell → Run All`
3. Check all outputs are correct

If it fails: the notebook has hidden state.

### Notebook structure

```python
# Cell 1: Imports and config
import pandas as pd
import numpy as np
...
RANDOM_STATE = 42
DATA_PATH = '../data/raw/dataset.csv'

# Cell 2: Data loading
df = pd.read_csv(DATA_PATH)
print(df.shape)

# Cell 3+: Analysis sections, clearly titled with markdown headers
```

### nbconvert — export to HTML/PDF

```bash
# Clean HTML report from notebook
jupyter nbconvert --to html notebooks/03_modeling.ipynb --output reports/

# Execute and export in one step
jupyter nbconvert --to html --execute notebooks/03_modeling.ipynb
```

### Papermill — parameterised notebook execution

```python
# Run a notebook with different parameters
import papermill as pm

pm.execute_notebook(
    'template_analysis.ipynb',
    'outputs/analysis_2024_Q4.ipynb',
    parameters={'data_path': 'data/q4.csv', 'target': 'revenue'}
)
```

---

## 7. Data Versioning with DVC

For datasets that change:

```bash
pip install dvc

# Initialise
dvc init

# Track a data file
dvc add data/raw/dataset.csv
git add data/raw/dataset.csv.dvc .gitignore
git commit -m "Track dataset with DVC"

# Push data to remote storage (S3, GCS, local)
dvc remote add -d myremote s3://mybucket/data
dvc push
```

---

## 8. Logging Analysis Runs (MLflow)

```python
import mlflow
import mlflow.sklearn

mlflow.set_experiment('chemometrics-moisture')

with mlflow.start_run(run_name='pls_snv_sg_d1'):
    # Log parameters
    mlflow.log_param('n_components', optimal_n)
    mlflow.log_param('preprocessing', 'snv+sg_d1')
    mlflow.log_param('cv_folds', 10)
    
    # Log metrics
    mlflow.log_metric('rmsecv',  rmsecv)
    mlflow.log_metric('rmsep',   rmsep)
    mlflow.log_metric('r2_test', r2_test)
    mlflow.log_metric('rpd',     rpd)
    
    # Log model
    mlflow.sklearn.log_model(pipe, 'pls_pipeline')
    
    # Log figure
    fig.savefig('/tmp/predicted_vs_actual.png')
    mlflow.log_artifact('/tmp/predicted_vs_actual.png')
```

```bash
# View results in browser
mlflow ui
```

---

## 9. README Template for Analysis Projects

```markdown
# Project Name

One-sentence description.

## Setup

```bash
conda env create -f environment.yml
conda activate project-name
```

## Data

- Source: [where it came from]
- Raw data: `data/raw/` — do not modify
- To reproduce processing: `python src/data_utils.py`

## Run Analysis

```bash
jupyter nbconvert --execute --to html notebooks/01_eda.ipynb
```

## Results

| Model | RMSEP | R² | RPD |
|-------|-------|-----|-----|
| PLS (SNV+SG-D1) | 0.12 | 0.97 | 3.4 |

## Reproducibility

Python 3.11, see `environment.yml`. Seed = 42.
```
