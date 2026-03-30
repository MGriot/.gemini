---
name: security-audit
description: >
  Comprehensive application security audit skill. Use this whenever a user asks to:
  audit, review, check, scan, or assess the security of their code or application;
  find vulnerabilities, security issues, or attack vectors; harden their app;
  implement authentication, authorization, rate limiting, or CORS; check for exposed
  ports, open endpoints, or insecure configurations; review Docker/compose setups for
  security; check dependency safety; or asks anything like "is my app secure?",
  "how do I protect my API?", "what are the security risks in my code?".
  Covers Python, FastAPI, React, Streamlit, Docker, and general network/infrastructure
  security. Always use this skill proactively when the user shares code and security
  could be a concern — even if they didn't explicitly ask for a security review.
---

# Application Security Audit Skill

You are performing a **structured, thorough security audit**. Follow this skill fully — do not skip sections relevant to the user's stack.

---

## 1. Triage & Scope

Before diving in, identify:
- **Stack**: Python / FastAPI / Streamlit / React / Docker / other?
- **Exposure**: local dev only, internal network, or public internet?
- **Auth model**: none, session, JWT, OAuth2, API key?
- **Data sensitivity**: PII, financial, health data?

Load the relevant reference files based on the stack detected:

| Stack component | Reference file |
|---|---|
| Python (general) | `references/python-security.md` |
| FastAPI | `references/fastapi-security.md` |
| Streamlit | `references/streamlit-security.md` |
| React / frontend | `references/react-security.md` |
| Network / ports / infra | `references/network-security.md` |
| Docker & containers | `references/docker-security.md` |
| Dependencies & supply chain | `references/dependency-security.md` |

**Always load `references/network-security.md`** regardless of stack — port exposure and network hygiene apply universally.

---

## 2. Audit Workflow

Run the audit in this exact order. Each phase feeds into the next.

### Phase 1 — Secrets & Credentials Scan
**This is always first.** Leaked credentials are the most common and most critical issue.

- Search for hardcoded secrets: API keys, passwords, tokens, private keys
- Check `.env` files — are they in `.gitignore`?
- Check environment variable usage — are they validated on startup?
- Look for secrets in logs, error messages, or HTTP responses
- Check for debug routes that expose config

```bash
# Run if you have filesystem access
grep -rn --include="*.py" --include="*.ts" --include="*.tsx" --include="*.js" \
  -E "(password|secret|api_key|token|private_key)\s*=\s*['\"][^'\"]{6,}" .
grep -rn "os.environ.get" . --include="*.py" | grep -v ".env"
```

### Phase 2 — Authentication & Authorization
- Is there authentication? If not on a public endpoint, flag it immediately
- JWT: check algorithm (never `alg: none`), expiry, secret strength
- Session: secure flags, SameSite, HttpOnly
- Are all sensitive routes protected? Check for missing auth decorators/middleware
- Is authorization checked (not just authentication)? IDOR vulnerabilities?
- Password hashing: bcrypt/argon2 only — never md5/sha1/plain

### Phase 3 — Input Validation & Injection
- SQL injection: raw queries with f-strings? Use parameterized queries or ORM
- Command injection: `subprocess`, `os.system` with user input?
- Path traversal: file operations with user-supplied paths?
- XSS: user content rendered without sanitization?
- SSRF: user-supplied URLs fetched server-side?
- Schema validation: are all incoming payloads validated with Pydantic/Zod/etc.?

### Phase 4 — Network & Exposure Audit
**Always run this.** Read `references/network-security.md` for the full checklist.

Key items:
- What ports are open and who can reach them?
- Is the database port (5432, 3306, 27017, 6379) exposed publicly?
- Is the admin interface (Flower, pgAdmin, Grafana) behind auth?
- Are debug/profiler ports exposed (8080, 5678, 4444)?
- CORS: is `*` allowed on authenticated endpoints?
- HTTP vs HTTPS — is HTTP being used in production?

### Phase 5 — Framework-Specific Checks
Load and apply the relevant reference files. Each has a detailed checklist.

### Phase 6 — Dependencies & Supply Chain
Read `references/dependency-security.md`. Key checks:
- Run `pip audit` / `npm audit` / `safety check`
- Pinned versions or floating ranges?
- Abandoned or unmaintained packages?
- Typosquatting risk in recently added deps?

### Phase 7 — Data Handling & Privacy
- PII logging: are names/emails/IPs written to logs?
- Error responses: do they leak stack traces, DB schema, file paths?
- Data at rest: are sensitive fields encrypted in the DB?
- Data in transit: TLS everywhere?
- Retention: is stale sensitive data cleaned up?

---

## 3. Output Format

Structure your audit report as follows:

```
## Security Audit Report

### 🔴 Critical (fix immediately)
[Issues that allow auth bypass, RCE, data exfiltration]

### 🟠 High (fix before production)
[Issues that significantly raise attack surface]

### 🟡 Medium (fix in next sprint)
[Defense-in-depth improvements, hardening]

### 🟢 Low / Best Practices
[Nice-to-haves, logging improvements, minor hygiene]

### ✅ What's already good
[Acknowledge secure patterns already in place]

### 📋 Remediation Checklist
[Prioritized, copy-paste-ready action items]
```

For each finding, provide:
1. **What**: what the vulnerability is
2. **Where**: file/line/endpoint if known
3. **Why it matters**: realistic attack scenario
4. **Fix**: concrete code example showing the secure version

---

## 4. Quick-Reference Severity Guide

| Severity | Examples |
|---|---|
| 🔴 Critical | Hardcoded secrets, auth bypass, SQLi, RCE, open DB to internet |
| 🟠 High | Missing auth on sensitive endpoints, weak JWT, CORS `*` on auth'd routes, no rate limiting on login |
| 🟡 Medium | Missing HTTPS redirect, verbose error responses, no CSP, session without HttpOnly |
| 🟢 Low | Missing security headers, overly permissive file permissions, no dependency pinning |

---

## 5. Proactive Hardening Recommendations

After the audit, always include a **Hardening Roadmap** section covering:
- Rate limiting strategy (see `references/network-security.md`)
- Secrets management upgrade path (env vars → vault)
- Dependency update cadence
- Security scanning in CI (Bandit, Semgrep, Trivy, npm audit)
- Monitoring & alerting for suspicious activity

---

## Reference Files Summary

- **`references/python-security.md`** — Bandit rules, dangerous functions, async pitfalls, deserialization
- **`references/fastapi-security.md`** — Middleware stack, OAuth2, rate limiting, CORS, background tasks
- **`references/streamlit-security.md`** — Auth patterns, secrets, iframe risks, multipage apps
- **`references/react-security.md`** — XSS, dangerouslySetInnerHTML, token storage, CSP, dependency audit
- **`references/network-security.md`** — Port exposure, firewall rules, Docker networking, reverse proxy config
- **`references/docker-security.md`** — Non-root users, image scanning, secrets, resource limits
- **`references/dependency-security.md`** — pip audit, npm audit, SBOM, supply chain hardening
