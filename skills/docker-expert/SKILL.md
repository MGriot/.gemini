---
name: docker-expert
description: "Use this skill for ALL Docker and Docker Compose tasks — writing Dockerfiles, optimizing image size, debugging failed builds or containers that won't start, setting up multi-service dev environments, and hardening containers for production. Trigger on any mention of Docker, Dockerfile, docker-compose, containerize, image, container, or reproducible environment. Also trigger when the user asks to 'set up a dev environment' or 'make this deployable' even without explicitly mentioning Docker."
---

# Docker Expert

Senior DevOps Engineer specializing in containerization. Goal: secure, minimal, reproducible container environments that work the same in dev and production.

---

## Phase 0 — Requirement Analysis (Do This First)

Before writing any Dockerfile, determine:

| Question | Why it matters |
|---|---|
| Language & version (Python 3.11? Node 20?) | Determines base image |
| Framework (FastAPI, Express, Django?) | Determines startup command and port |
| External dependencies (Postgres, Redis, Celery?) | Determines Compose services |
| Native system libraries needed? | Determines whether `slim` or `alpine` is appropriate |
| Target: dev environment or production image? | Determines whether to include dev tools |
| Any compiled extensions? (numpy, scikit-learn, Rust bindings) | Requires multi-stage build |

---

## Phase 1 — Base Image Selection

**Decision table:**

| Runtime | Recommended base | Avoid |
|---|---|---|
| Python (general) | `python:3.11-slim-bookworm` | `python:alpine` (musl/glibc incompatibility with many packages) |
| Python (data science / ML) | `python:3.11-slim-bookworm` + install `libgomp1` | `alpine` (numpy/sklearn binary wheels don't exist for musl) |
| Node.js | `node:20-slim` | `node:latest` (unpinned, fat) |
| Go | `golang:1.22-alpine` as builder → `gcr.io/distroless/static` as final | Full Go image in production |
| Java | `eclipse-temurin:21-jre-alpine` | Full JDK in production |
| Static binary | `gcr.io/distroless/static-debian12` | Any full OS image |

**Always pin to a specific version tag.** Never use `latest`.

---

## Phase 2 — Dockerfile Construction

### Layer Ordering (Cache Efficiency)

Order instructions from **least frequently changed → most frequently changed**:

```
System deps → App deps → Source code
```

This means a code change only invalidates the last layer, not the full dependency install.

### Multi-Stage Build Template

```dockerfile
# ── Stage 1: Builder ──────────────────────────────────────────────
FROM python:3.11-slim-bookworm AS builder

WORKDIR /app

# Install build-time system libraries (won't appear in final image)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest first — cache this layer independently
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Stage 2: Final ────────────────────────────────────────────────
FROM python:3.11-slim-bookworm AS final

WORKDIR /app

# Install only runtime system libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libgomp1 \
 && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy source code (most frequently changed — last layer)
COPY . .

# Security: non-root user
RUN useradd --no-create-home --shell /bin/false appuser
USER appuser

# Signal handling: use exec form so PID 1 receives signals correctly
ENTRYPOINT ["python", "-m", "gunicorn"]
CMD ["--bind", "0.0.0.0:8000", "--workers", "2", "app.main:app"]

EXPOSE 8000

# Health check — lets Docker and orchestrators know when the app is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
```

### Node.js Multi-Stage Template

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-slim AS final
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN useradd --no-create-home --shell /bin/false appuser
USER appuser
ENTRYPOINT ["node"]
CMD ["src/index.js"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "require('http').get('http://localhost:3000/health')"
```

### Critical Rules

```dockerfile
# ✅ Always chain apt commands in ONE RUN to avoid stale cache layers
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
 && rm -rf /var/lib/apt/lists/*

# ❌ Never do this — apt-get update becomes a cached stale layer
RUN apt-get update
RUN apt-get install -y curl

# ✅ Use exec form for ENTRYPOINT (PID 1, receives SIGTERM)
ENTRYPOINT ["python", "app.py"]

# ❌ Shell form — spawns /bin/sh; app won't receive SIGTERM gracefully
ENTRYPOINT python app.py
```

---

## Phase 3 — `.dockerignore`

Always create this before `docker build`. It prevents secrets and large files from entering the build context.

```dockerignore
# Version control
.git
.gitignore

# Python
__pycache__/
*.pyc
*.pyo
.pytest_cache/
.mypy_cache/
venv/
.venv/
*.egg-info/

# Node
node_modules/
npm-debug.log*

# Local env & secrets
.env
.env.*
!.env.example
*.pem
*.key

# Build output
dist/
build/

# Docs & tests (exclude from prod image)
docs/
tests/
*.md

# OS junk
.DS_Store
Thumbs.db
```

---

## Phase 4 — Docker Compose

```yaml
# compose.yaml  (preferred name in 2024+; docker-compose.yml still works)
name: myapp

services:
  app:
    build:
      context: .
      target: final        # Use the "final" multi-stage target
    ports:
      - "8000:8000"        # host:container
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/myapp
    env_file:
      - .env               # Local overrides — never commit this file
    depends_on:
      db:
        condition: service_healthy   # Wait for DB health check before starting
    networks:
      - backend
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data   # Named volume = data persists
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    # ❌ Do NOT expose DB port to host in production
    # ports:
    #   - "5432:5432"   # Only uncomment for local debugging

  redis:
    image: redis:7-alpine
    command: redis-server --save 60 1 --loglevel warning
    volumes:
      - redis_data:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  postgres_data:
  redis_data:

networks:
  backend:
    driver: bridge
```

---

## Phase 5 — Secrets (Never in Dockerfile or Compose)

```bash
# ✅ Pass at runtime via environment variable
docker run -e DATABASE_URL="postgresql://..." myapp

# ✅ Use a .env file for local dev (add to .dockerignore and .gitignore)
# compose.yaml reads it automatically with env_file:

# ✅ Production: use Docker Secrets or your orchestrator's secret store
docker secret create db_password ./db_password.txt
# Then reference in compose.yaml:
# secrets:
#   db_password:
#     external: true
```

---

## Phase 6 — Debugging Workflows

### Build fails

```bash
# See the full build log with no truncation
docker build --progress=plain --no-cache . 2>&1 | tee build.log

# Inspect an intermediate layer interactively
docker build --target builder -t myapp-debug .
docker run -it --rm myapp-debug /bin/bash
```

### Container won't start

```bash
# Check exit code and last logs
docker ps -a                              # Find the container ID
docker logs <container_id>               # Full stdout/stderr
docker inspect <container_id>            # Full config, env, mounts

# Run interactively, override entrypoint to get a shell
docker run -it --rm --entrypoint /bin/bash myapp
```

### Compose service issues

```bash
docker compose up --build                # Rebuild and stream all logs
docker compose logs -f app               # Follow logs for one service
docker compose exec app /bin/bash        # Shell into running service
docker compose ps                        # Check health status of all services
docker compose down -v                   # Tear down + delete volumes (clean slate)
```

### Image is too large

```bash
# Analyze layer sizes
docker image history myapp --human --format "table {{.Size}}\t{{.CreatedBy}}"

# Deep dive with dive (install separately)
dive myapp
```

---

## Common Mistakes & Fixes

| Mistake | Problem | Fix |
|---|---|---|
| `FROM python:latest` | Unpinned; breaks on updates | `FROM python:3.11-slim-bookworm` |
| Running as root | Security vulnerability | `RUN useradd appuser && USER appuser` |
| `RUN apt-get update` alone | Stale cached layer; install fails later | Chain: `apt-get update && apt-get install -y ... && rm -rf /var/lib/apt/lists/*` |
| Build tools in final image | Fat image (gcc, make, headers) | Multi-stage build; copy only artifacts |
| `COPY . .` before deps install | Code changes invalidate dep cache | Copy `requirements.txt` → install → `COPY . .` |
| Shell form `ENTRYPOINT` | App doesn't receive SIGTERM | Exec form: `ENTRYPOINT ["python", "app.py"]` |
| No `.dockerignore` | Secrets and `node_modules` in build context | Always create `.dockerignore` first |
| DB port exposed in production | Attack surface | Remove `ports:` from db service in prod |
| No healthcheck | Orchestrator can't detect crashes | Add `HEALTHCHECK` to Dockerfile and Compose |
