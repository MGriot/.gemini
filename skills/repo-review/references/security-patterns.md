# Security Patterns Reference

A catalog of common vulnerability patterns with code examples and mitigations.

## Table of Contents
1. Injection Attacks
2. Authentication & Authorization
3. Cryptography Misuse
4. Secrets Management
5. Insecure Dependencies
6. Data Exposure
7. Infrastructure Misconfig

---

## 1. Injection Attacks

### SQL Injection (CWE-89)

**Vulnerable:**
```python
# String concatenation — classic SQLi
query = "SELECT * FROM users WHERE name = '" + username + "'"
cursor.execute(query)

# f-string — equally vulnerable
query = f"DELETE FROM sessions WHERE token = '{token}'"
```

**Secure:**
```python
# Parameterized query
cursor.execute("SELECT * FROM users WHERE name = %s", (username,))

# ORM (SQLAlchemy)
User.query.filter_by(name=username).first()
```

**Detection grep:** `execute.*["\'].*\+|execute.*f["\']`

---

### Command Injection (CWE-78)

**Vulnerable:**
```python
import subprocess
filename = request.args.get("file")
subprocess.run(f"convert {filename} output.pdf", shell=True)  # DANGEROUS

import os
os.system("grep " + search_term + " /var/log/app.log")
```

**Secure:**
```python
import subprocess
import shlex
subprocess.run(["convert", filename, "output.pdf"])  # list form, no shell
```

---

### Path Traversal (CWE-22)

**Vulnerable:**
```python
filename = request.args.get("file")
with open(f"/uploads/{filename}") as f:  # ../../../../etc/passwd
    return f.read()
```

**Secure:**
```python
import os
base = "/uploads"
filepath = os.path.realpath(os.path.join(base, filename))
if not filepath.startswith(base):
    raise ValueError("Path traversal detected")
```

---

### Template Injection (CWE-94)

**Vulnerable:**
```python
# Flask/Jinja2
template = request.args.get("template", "")
return render_template_string(template)  # allows {{ 7*7 }}, config, etc.
```

**Secure:**
```python
# Never render user input as a template
# Use a whitelist of allowed templates
allowed = {"welcome": "welcome.html", "error": "error.html"}
name = allowed.get(request.args.get("t", ""), "default.html")
return render_template(name)
```

---

## 2. Authentication & Authorization

### Broken Authentication

**Red flags to look for:**
- Passwords stored as MD5/SHA1 (not bcrypt/argon2)
- Session tokens that are predictable (sequential IDs, timestamps)
- No rate limiting on login endpoint
- JWT with `alg: none` accepted
- Hardcoded credentials in code

**JWT Algorithm Confusion:**
```python
# Vulnerable — accepts any algorithm
jwt.decode(token, secret, algorithms=None)

# Secure — explicitly whitelist algorithms
jwt.decode(token, secret, algorithms=["HS256"])
```

---

### Missing Authorization Checks (IDOR)

**Vulnerable:**
```python
@app.route("/api/document/<doc_id>")
def get_document(doc_id):
    # No ownership check — any authenticated user can get any doc
    return Document.query.get(doc_id)
```

**Secure:**
```python
@app.route("/api/document/<doc_id>")
@login_required
def get_document(doc_id):
    doc = Document.query.filter_by(id=doc_id, owner_id=current_user.id).first_or_404()
    return doc
```

---

## 3. Cryptography Misuse

### Weak Hashing for Passwords

**Vulnerable:**
```python
import hashlib
password_hash = hashlib.md5(password.encode()).hexdigest()
password_hash = hashlib.sha256(password.encode()).hexdigest()  # also weak for passwords
```

**Secure:**
```python
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))

# Or argon2
from argon2 import PasswordHasher
ph = PasswordHasher()
hashed = ph.hash(password)
```

---

### ECB Mode (CWE-327)

**Vulnerable:**
```java
Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");  // ECB leaks patterns
```

**Secure:**
```java
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");  // authenticated encryption
byte[] iv = new byte[12];
new SecureRandom().nextBytes(iv);
cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
```

---

### SSL Verification Disabled

**Vulnerable:**
```python
import requests
requests.get("https://api.example.com", verify=False)

import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
```

**Secure:**
```python
requests.get("https://api.example.com")  # verify=True by default
# For custom CA: requests.get(url, verify="/path/to/ca.pem")
```

---

## 4. Secrets Management

### Secrets in Code (CWE-798)

**Red flags:**
```python
API_KEY = "sk-abc123def456..."    # hardcoded
DB_PASSWORD = "supersecret"       # hardcoded
SECRET_KEY = "my-secret-key"      # weak + hardcoded
```

**Secure patterns:**
```python
import os
API_KEY = os.environ["API_KEY"]                    # required — fails if missing
DB_PASSWORD = os.getenv("DB_PASSWORD", None)       # optional with default

# Better: use a secrets manager
import boto3
secret = boto3.client("secretsmanager").get_secret_value(SecretId="prod/db/password")
```

---

### Secrets in Git History

Even if you remove a secret from HEAD, it's still in git history.

**Remediation steps:**
1. Immediately rotate/revoke the secret
2. Use `git-filter-repo` or BFG Repo-Cleaner to purge history
3. Force-push to remote
4. Notify all contributors to re-clone

**Prevention:**
- Pre-commit hook with `detect-secrets` or `gitleaks`
- `.pre-commit-config.yaml` with `detect-secrets` hook

---

## 5. Insecure Dependencies

### Dependency Confusion Attack

**Risk:** Internal package `company-utils` published to public npm/PyPI by attacker.
If pip/npm prefers public registry over private, attacker code gets installed.

**Mitigation:**
- Use scoped npm packages (`@company/utils`)
- Set `--index-url` to private registry only
- Pin exact versions and verify hashes

---

### Supply Chain: Typosquatting

Common typosquatted packages:
- `reqeusts` (requests), `urllib4` (urllib3), `colourama` (colorama)
- `lodahs` (lodash), `axois` (axios), `expres` (express)

**Mitigation:** Always double-check package names before installing.

---

## 6. Data Exposure

### Error Messages Leaking Internals

**Vulnerable:**
```python
try:
    result = db.query(sql)
except Exception as e:
    return jsonify({"error": str(e)})  # leaks DB schema, query, stack trace
```

**Secure:**
```python
try:
    result = db.query(sql)
except Exception as e:
    logger.exception("DB query failed: %s", sql)
    return jsonify({"error": "An internal error occurred"}), 500
```

---

### Logging PII / Secrets

**Vulnerable:**
```python
logger.info(f"User login: email={email}, password={password}")
logger.debug(f"Auth token: {token}")
```

**Secure:**
```python
logger.info(f"User login: user_id={user_id}")
# Never log passwords, tokens, SSNs, credit card numbers
```

---

## 7. Infrastructure Misconfig

### CORS Wildcard

```nginx
# Vulnerable
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Credentials true;  # CRITICAL: wildcard + credentials

# Secure
add_header Access-Control-Allow-Origin "https://app.company.com";
```

### Debug Mode in Production

```python
# Flask — never in production
app.run(debug=True)

# Django — check settings
DEBUG = os.getenv("DJANGO_DEBUG", "false").lower() == "true"
```

### Exposed .env Files

Check that `.env` is in `.gitignore`. Also check that web server doesn't serve `.env`:
```nginx
location ~ /\.env {
    deny all;
}
```
