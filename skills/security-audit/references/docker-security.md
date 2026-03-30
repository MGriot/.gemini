# Docker & Container Security Reference

## Run as Non-Root User

```dockerfile
# ❌ Default — runs as root inside container
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["uvicorn", "main:app"]

# ✅ Create and use non-root user
FROM python:3.12-slim

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup -m appuser

WORKDIR /app

# Install deps as root, then drop privileges
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY --chown=appuser:appgroup . .

# Switch to non-root
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"]
```

---

## Minimal Base Images

```dockerfile
# ❌ Large image = large attack surface
FROM python:3.12        # includes compilers, tools, unnecessary packages
FROM ubuntu:22.04       # full OS

# ✅ Slim or distroless
FROM python:3.12-slim               # stripped down
FROM gcr.io/distroless/python3      # no shell at all — minimal attack surface

# ✅ Multi-stage build — separate build from runtime
FROM python:3.12-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS runtime
RUN groupadd -r app && useradd -r -g app app
WORKDIR /app
COPY --from=builder /install /usr/local
COPY --chown=app:app . .
USER app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Secrets in Docker — Never Use ENV for Secrets

```dockerfile
# ❌ Secrets baked into image (visible in docker inspect and image layers)
ENV DATABASE_URL=postgresql://admin:password@db/myapp
ENV SECRET_KEY=mysecretkey123

# ❌ ARG also leaks into image history
ARG SECRET_KEY
ENV SECRET_KEY=$SECRET_KEY

# ✅ Use Docker secrets (Swarm) or runtime env injection
# docker-compose.yml — secrets from host env, not hardcoded
services:
  api:
    image: myapp
    environment:
      - SECRET_KEY      # reads from host shell environment
      - DATABASE_URL    # NOT hardcoded here

# ✅ Or mount from file at runtime
# docker run --env-file .env myapp
# (but never commit .env)
```

---

## docker-compose.yml Security

```yaml
version: "3.9"

services:
  api:
    build: .
    restart: unless-stopped
    environment:
      - SECRET_KEY         # from host env
      - DATABASE_URL       # from host env
    ports:
      - "127.0.0.1:8000:8000"   # ✅ Bind to localhost only
    networks:
      - internal
    read_only: true              # ✅ Read-only filesystem
    tmpfs:
      - /tmp                     # ✅ Writable temp only
    security_opt:
      - no-new-privileges:true   # ✅ Prevent privilege escalation
    cap_drop:
      - ALL                      # ✅ Drop all Linux capabilities
    cap_add:
      - NET_BIND_SERVICE         # add back only what's needed
    mem_limit: 512m              # ✅ Resource limits
    cpus: "0.5"
    user: "1000:1000"            # ✅ Non-root UID:GID

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_PASSWORD        # from host env
      - POSTGRES_USER=appuser
      - POSTGRES_DB=myapp
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - internal                 # ✅ Not exposed to host at all
    # ❌ No ports: section — DB unreachable from outside
    security_opt:
      - no-new-privileges:true

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}     # ✅ Auth required
      --bind 0.0.0.0
      --protected-mode yes
    networks:
      - internal
    # ❌ No ports: — not accessible from host

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "0.0.0.0:80:80"          # ✅ Only nginx has public ports
      - "0.0.0.0:443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro   # :ro = read-only mount
      - ./certs:/etc/nginx/certs:ro
    networks:
      - internal
    security_opt:
      - no-new-privileges:true

networks:
  internal:
    driver: bridge
    internal: false              # set true if no external access needed from containers

volumes:
  db_data:
    driver: local
```

---

## .dockerignore

```
# ✅ Always have a thorough .dockerignore
.git
.env
.env.*
*.pem
*.key
*_rsa
secrets/
node_modules/
__pycache__/
*.pyc
.pytest_cache/
.coverage
htmlcov/
dist/
build/
*.log
README.md
Makefile
docker-compose*.yml    # don't need these inside the image
.dockerignore
```

---

## Image Scanning

```bash
# Scan for vulnerabilities in your image
docker scout cves myapp:latest

# Trivy (excellent free scanner)
trivy image myapp:latest
trivy image --severity HIGH,CRITICAL myapp:latest

# Grype (Anchore)
grype myapp:latest

# In CI/CD (GitHub Actions example)
# uses: aquasecurity/trivy-action@master
# with:
#   image-ref: myapp:latest
#   exit-code: 1         # fail pipeline on critical vulns
#   severity: CRITICAL,HIGH

# Scan filesystem (not image)
trivy fs --security-checks vuln,secret .
```

---

## Healthcheck

```dockerfile
# ✅ Add healthcheck so orchestrators know when container is ready/degraded
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
```

---

## Container Security Checklist

- [ ] Non-root user in Dockerfile (`USER` instruction)
- [ ] Minimal base image (slim, alpine, or distroless)
- [ ] Multi-stage build to exclude build tools from final image
- [ ] `.dockerignore` excludes `.env`, secrets, `.git`
- [ ] No secrets in `ENV` or `ARG` in Dockerfile
- [ ] `docker-compose.yml` uses `127.0.0.1:PORT:PORT` for app ports
- [ ] Database/Redis ports NOT exposed in compose (no `ports:` section)
- [ ] `security_opt: no-new-privileges:true`
- [ ] `cap_drop: ALL` with only needed caps added back
- [ ] `read_only: true` where possible
- [ ] Memory and CPU limits set
- [ ] Image scanned with Trivy or similar in CI
- [ ] Base image pinned to digest or specific tag (not `latest`)
- [ ] Docker socket not mounted in containers (allows full host escape)
