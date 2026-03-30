# Security Review Checklist

OWASP-inspired manual checklist for repository security reviews.  
Use this when doing a thorough security audit beyond the automated scan.

---

## A01 — Broken Access Control

- [ ] Are all routes protected with authentication where needed?
- [ ] Is there role-based access control (RBAC)? Is it enforced server-side?
- [ ] Can a user access another user's data by changing an ID in a request?
- [ ] Are admin functions behind separate auth or just hidden from the UI?
- [ ] Is directory listing disabled on web servers?
- [ ] Are file upload paths restricted to prevent path traversal?

**Code patterns to look for:**
```
# Python Flask — missing @login_required
@app.route('/admin/users')
def admin_users():
    ...

# Direct object reference without ownership check
user_data = db.get(request.args['user_id'])
```

---

## A02 — Cryptographic Failures

- [ ] Is sensitive data (passwords, PII, payment info) encrypted at rest?
- [ ] Are passwords hashed with a strong algorithm (bcrypt, argon2, scrypt)?
- [ ] Is TLS enforced? Is HTTPS-only mode enabled?
- [ ] Are encryption keys stored separately from the data they protect?
- [ ] Is MD5 or SHA-1 used for security-sensitive hashing? (use SHA-256+)
- [ ] Is random number generation cryptographically secure?
- [ ] Are JWTs verified? Is `none` algorithm rejected?

**Red flags:**
```python
# Weak hashing
import hashlib
hashlib.md5(password.encode()).hexdigest()   # BAD
hashlib.sha1(password.encode()).hexdigest()  # BAD

# Insecure random
import random
token = random.randint(100000, 999999)       # BAD — use secrets module

# JWT none algorithm
jwt.decode(token, algorithms=["none"])       # BAD
```

---

## A03 — Injection

### SQL Injection
- [ ] Are all SQL queries parameterized / using ORM?
- [ ] Is user input ever directly concatenated into SQL strings?

```python
# VULNERABLE
cursor.execute("SELECT * FROM users WHERE name = '" + name + "'")

# SAFE
cursor.execute("SELECT * FROM users WHERE name = %s", (name,))
```

### Command Injection
- [ ] Is `shell=True` used with subprocess and user input?
- [ ] Is `eval()` called with user-supplied data?

### Template Injection
- [ ] Is user input rendered directly in Jinja2 / Pebble / Handlebars templates?

```python
# VULNERABLE (Server-Side Template Injection)
render_template_string(user_input)
```

### LDAP / XPath / NoSQL Injection
- [ ] Are LDAP filters sanitized?
- [ ] Are MongoDB queries using `$where` with user input?

---

## A04 — Insecure Design

- [ ] Is there a threat model for this application?
- [ ] Are rate limits implemented on auth and sensitive endpoints?
- [ ] Is there account lockout after failed logins?
- [ ] Are security requirements part of the design, not added later?

---

## A05 — Security Misconfiguration

- [ ] Are default credentials changed?
- [ ] Are unnecessary features/services disabled?
- [ ] Are error messages verbose (revealing stack traces to users)?
- [ ] Are security headers set (CSP, HSTS, X-Frame-Options, etc.)?
- [ ] Are cloud storage buckets/blobs private?
- [ ] Are development configs separate from production?

**Check for:**
```
DEBUG = True                    # Should be False in production
ALLOWED_HOSTS = ['*']           # Django — should be restricted
Access-Control-Allow-Origin: * # CORS — should be restricted
display_errors = On             # PHP — should be Off
```

---

## A06 — Vulnerable and Outdated Components

- [ ] Are dependency versions pinned?
- [ ] Are there known CVEs in current dependencies?
- [ ] Are dependencies regularly updated?
- [ ] Is there a `SECURITY.md` or vulnerability disclosure process?

**Automated tools:**
```bash
pip-audit                          # Python
npm audit                          # Node.js
cargo audit                        # Rust
mvn dependency-check:check         # Java
bundle audit                       # Ruby
```

---

## A07 — Identification and Authentication Failures

- [ ] Are passwords subject to complexity requirements?
- [ ] Is multi-factor authentication supported?
- [ ] Are session IDs rotated after login?
- [ ] Is "forgot password" flow secure (tokens expire, single-use)?
- [ ] Are session timeouts implemented?
- [ ] Are failed login attempts logged?

---

## A08 — Software and Data Integrity Failures

- [ ] Are CI/CD pipelines secured (branch protection, signed commits)?
- [ ] Are third-party scripts loaded from trusted, version-pinned CDNs?
- [ ] Is deserialization of untrusted data avoided?
- [ ] Are software updates verified with signatures?

---

## A09 — Security Logging and Monitoring Failures

- [ ] Are authentication events logged (success and failure)?
- [ ] Are authorization failures logged?
- [ ] Are logs stored in a tamper-resistant way?
- [ ] Are sensitive values (passwords, tokens) excluded from logs?
- [ ] Is there alerting on suspicious patterns?

**Check for:**
```python
# Logging credentials — BAD
logger.info(f"User {username} logged in with password {password}")

# Good practice
logger.info(f"Login attempt for {username}: {'success' if ok else 'failure'}")
```

---

## A10 — Server-Side Request Forgery (SSRF)

- [ ] If the app fetches URLs from user input, are they validated?
- [ ] Is the internal network protected from SSRF?

```python
# VULNERABLE
url = request.args['url']
response = requests.get(url)   # Could fetch http://169.254.169.254/...

# SAFE — validate against allowlist
ALLOWED_DOMAINS = ['api.trusted.com']
```

---

## Additional Checks

### File Uploads
- [ ] Are uploaded file types validated (server-side, not just client-side)?
- [ ] Are uploaded files stored outside the web root?
- [ ] Are uploaded file names sanitized?

### API Security
- [ ] Are API keys/tokens rotated regularly?
- [ ] Is there API rate limiting?
- [ ] Are unused API endpoints removed?
- [ ] Is API versioning in place?

### Secrets Management
- [ ] Are secrets in environment variables, not source code?
- [ ] Is `.env` in `.gitignore`?
- [ ] Is `.env.example` (safe template) committed instead?
- [ ] Are production secrets managed by a vault (AWS Secrets Manager, HashiCorp Vault, etc.)?

### Infrastructure
- [ ] Are Dockerfiles running as non-root?
- [ ] Are container images scanned for vulnerabilities?
- [ ] Are Kubernetes configs using least-privilege service accounts?
- [ ] Are network policies restricting pod-to-pod communication?

---

## Severity Rating Guide

| Severity | Description | Example |
|----------|-------------|---------|
| 🔴 Critical | Direct data breach or full system compromise possible | Hardcoded root password, RCE via injection |
| 🟠 High | Significant impact, likely exploitable | SQLi, auth bypass, hardcoded API key |
| 🟡 Medium | Exploitable with effort or partial impact | Weak crypto, CORS misconfiguration |
| 🟢 Low | Minor issue, limited impact | Verbose error messages, missing HSTS |
| ℹ️ Info | Best practice / hygiene | Missing security headers, no rate limiting |
