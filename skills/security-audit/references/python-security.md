# Python Security Reference

## Dangerous Built-ins & Functions

### Never use with user input
```python
# ❌ CRITICAL — arbitrary code execution
eval(user_input)
exec(user_input)
compile(user_input, "<string>", "exec")

# ❌ CRITICAL — command injection
import os
os.system(f"convert {user_file}")          # shell injection
os.popen(f"grep {pattern} {filename}")

import subprocess
subprocess.call(user_cmd, shell=True)      # shell=True is dangerous

# ✅ SAFE — use shell=False, pass args as list
subprocess.run(["convert", user_file], shell=False, capture_output=True, timeout=30)
```

### Path traversal
```python
# ❌ Traversal — attacker sends "../../etc/passwd"
filepath = f"/app/uploads/{user_filename}"
open(filepath).read()

# ✅ Safe — resolve and validate
from pathlib import Path

UPLOAD_DIR = Path("/app/uploads").resolve()

def safe_path(filename: str) -> Path:
    safe = (UPLOAD_DIR / filename).resolve()
    if not str(safe).startswith(str(UPLOAD_DIR)):
        raise ValueError("Path traversal detected")
    return safe
```

### Deserialization
```python
# ❌ CRITICAL — pickle executes arbitrary code on load
import pickle
data = pickle.loads(user_bytes)

# ❌ Also dangerous
import yaml
yaml.load(user_data)                       # use yaml.safe_load()

# ✅ Safe alternatives
import json
json.loads(user_data)                      # safe

import yaml
yaml.safe_load(user_data)                  # safe
```

---

## SQL Injection

```python
# ❌ CRITICAL — f-string in query
cursor.execute(f"SELECT * FROM users WHERE name = '{name}'")

# ❌ Also wrong — string concatenation
cursor.execute("SELECT * FROM users WHERE name = '" + name + "'")

# ✅ Parameterized queries
cursor.execute("SELECT * FROM users WHERE name = %s", (name,))

# ✅ SQLAlchemy ORM (preferred)
from sqlalchemy.orm import Session
user = db.query(User).filter(User.name == name).first()

# ✅ SQLAlchemy text() with bindparams if raw SQL needed
from sqlalchemy import text
result = db.execute(text("SELECT * FROM users WHERE name = :name"), {"name": name})
```

---

## Secrets Management

```python
# ❌ Hardcoded
SECRET_KEY = "mysupersecret"
DATABASE_URL = "postgresql://admin:password@localhost/db"

# ✅ Environment variables with validation at startup
import os
from functools import lru_cache

@lru_cache()
def get_settings():
    secret = os.environ.get("SECRET_KEY")
    if not secret or len(secret) < 32:
        raise RuntimeError("SECRET_KEY must be set and at least 32 chars")
    return {"secret_key": secret}

# ✅ Use python-dotenv for local dev only (never commit .env)
from dotenv import load_dotenv
load_dotenv()  # reads .env file — ensure it's in .gitignore
```

### .gitignore essentials
```
.env
.env.*
*.pem
*.key
*_rsa
secrets/
config/local.py
```

---

## Password Hashing

```python
# ❌ NEVER use these for passwords
import hashlib
hashlib.md5(password.encode()).hexdigest()
hashlib.sha256(password.encode()).hexdigest()

# ✅ Use passlib with bcrypt or argon2
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

---

## Logging Security

```python
# ❌ Logging sensitive data
logger.info(f"User login: email={email} password={password}")
logger.debug(f"Request headers: {request.headers}")  # may contain Authorization

# ✅ Log only safe identifiers
logger.info(f"User login attempt: user_id={user_id}")
logger.warning(f"Failed login for user: {user_id} from ip={ip}")

# ✅ Sanitize before logging
def sanitize_log(data: dict) -> dict:
    SENSITIVE = {"password", "token", "secret", "key", "authorization"}
    return {k: "***REDACTED***" if k.lower() in SENSITIVE else v 
            for k, v in data.items()}
```

---

## Timing Attacks

```python
# ❌ Vulnerable to timing attacks — exits early on mismatch
if api_key == stored_key:
    ...

# ✅ Constant-time comparison
import hmac
if hmac.compare_digest(api_key.encode(), stored_key.encode()):
    ...
```

---

## XML & SSRF

```python
# ❌ XXE — External Entity attack
from xml.etree import ElementTree as ET
ET.fromstring(user_xml)  # vulnerable by default in some versions

# ✅ Disable external entities
from defusedxml import ElementTree as ET
ET.fromstring(user_xml)  # safe

# ❌ SSRF — fetching user-supplied URLs
import requests
resp = requests.get(user_supplied_url)

# ✅ Validate URL scheme and host against allowlist
from urllib.parse import urlparse

ALLOWED_HOSTS = {"api.example.com", "cdn.example.com"}

def safe_fetch(url: str):
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only HTTP(S) allowed")
    if parsed.hostname not in ALLOWED_HOSTS:
        raise ValueError(f"Host {parsed.hostname} not in allowlist")
    return requests.get(url, timeout=5)
```

---

## Async / Concurrency Pitfalls

```python
# ❌ Blocking I/O in async context — blocks the event loop
async def get_user(user_id: int):
    return db.query(User).get(user_id)  # sync ORM in async function

# ✅ Use async-compatible DB drivers
import asyncpg  # or SQLAlchemy async
async def get_user(user_id: int):
    async with pool.acquire() as conn:
        return await conn.fetchrow("SELECT * FROM users WHERE id = $1", user_id)

# ❌ Race condition in token validation cache
_token_cache = {}
async def validate_token(token):
    if token not in _token_cache:
        _token_cache[token] = await fetch_token_info(token)
    return _token_cache[token]

# ✅ Use proper cache with TTL (e.g., cachetools or Redis)
from cachetools import TTLCache
_cache = TTLCache(maxsize=1000, ttl=300)
```

---

## Bandit — Automated Python Security Scanner

```bash
pip install bandit
bandit -r ./app -l -ii  # recursive, show only medium+ severity

# Key Bandit rule IDs to know:
# B101 — assert used for security checks (stripped in optimized Python)
# B102 — exec used
# B105/B106/B107 — hardcoded password
# B108 — probable insecure temp file
# B201 — Flask debug=True
# B301 — pickle.loads
# B324 — md5/sha1 used (hashlib)
# B501/B502 — SSL verification disabled
# B602/B603 — subprocess with shell=True
# B608 — SQL injection
```

---

## Additional Tools

```bash
# Static analysis
pip install semgrep
semgrep --config=auto .

# Dependency vulnerabilities
pip install pip-audit
pip-audit

# Secret scanning
pip install detect-secrets
detect-secrets scan > .secrets.baseline
```
