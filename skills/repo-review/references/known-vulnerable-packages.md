# Known Vulnerable & High-Risk Packages

A reference of packages with known CVEs, abandoned status, or known misuse patterns.
Update this list periodically — check https://osv.dev and https://snyk.io/vuln for latest.

---

## Python

| Package | Issue | Action |
|---------|-------|--------|
| `PyYAML` < 6.0 | `yaml.load()` executes code | Use `yaml.safe_load()` |
| `Pillow` < 10.0.1 | Multiple image parsing CVEs | Update to latest |
| `requests` < 2.31.0 | Proxy header injection (CVE-2023-32681) | Update |
| `urllib3` < 2.0.7 | Header injection (CVE-2023-45803) | Update |
| `cryptography` < 41.0.6 | Various crypto weaknesses | Update |
| `paramiko` < 3.3.0 | Terrapin SSH attack (CVE-2023-48795) | Update |
| `pycrypto` | ABANDONED (since 2014), use pycryptodome | Replace |
| `django` | Always patch minor versions | Keep latest |
| `jinja2` < 3.1.3 | Sandbox escape (CVE-2024-22195) | Update |
| `werkzeug` < 3.0.3 | DoS via malformed content (CVE-2024-34069) | Update |
| `lxml` < 5.1.1 | XXE via default parser | Update + disable DTD |
| `sqlalchemy` < 1.4.49 | DoS via malformed SQL (CVE-2023-30608) | Update |
| `python-jose` | JWT algorithm confusion | Use `python-jwt` or `authlib` |
| `itsdangerous` < 2.1.2 | Timing attack in HMAC (CVE-2022-2068) | Update |
| `bleach` | ABANDONED — HTML sanitization gaps | Use `nh3` or `html-sanitizer` |
| `pickle` / `marshal` | Remote code execution if deserializing untrusted data | Never use on untrusted input |

---

## Node.js / npm

| Package | Issue | Action |
|---------|-------|--------|
| `lodash` < 4.17.21 | Prototype pollution (CVE-2021-23337) | Update |
| `minimist` < 1.2.6 | Prototype pollution | Update |
| `node-forge` < 1.3.1 | Signature bypass (CVE-2022-24773) | Update |
| `jsonwebtoken` < 9.0.0 | Algorithm confusion / key confusion | Update to 9.x |
| `express` < 4.19.2 | HTTP response splitting | Update |
| `ws` < 8.17.1 | DoS via malformed headers (CVE-2024-37890) | Update |
| `axios` < 1.6.0 | CSRF bypass (CVE-2023-45857) | Update |
| `got` < 12.1.0 | Open redirect (CVE-2022-33987) | Update |
| `tar` < 6.1.9 | Path traversal (CVE-2021-37713) | Update |
| `request` | DEPRECATED (2020), no security fixes | Migrate to `axios`, `got`, or `node-fetch` |
| `moment` | DEPRECATED (maintenance mode), large bundle | Migrate to `date-fns` or `dayjs` |
| `node-uuid` | DEPRECATED | Use `uuid` package |
| `colors` / `faker` | Sabotaged by author in 2022 | Pin versions, use forks |
| `event-stream` | Sabotaged in 2018 supply chain attack | Historical — audit deps for similar patterns |
| `serialize-javascript` < 6.0.2 | XSS via regex (CVE-2022-21709) | Update |
| `sharp` | Regularly patched for libvips CVEs | Keep updated |
| `multer` | File upload without type validation — misconfiguration risk | Validate MIME types manually |

---

## Java

| Package/Framework | Issue | Action |
|-------------------|-------|--------|
| `log4j-core` 2.0–2.14.1 | **Log4Shell** — remote code execution (CVE-2021-44228) | Update to 2.17.1+ IMMEDIATELY |
| `log4j-core` 2.15.0 | Partial fix bypass (CVE-2021-45046) | Update to 2.17.1+ |
| `commons-text` 1.5–1.9 | Text4Shell (CVE-2022-42889) | Update to 1.10.0+ |
| `spring-core` < 5.3.18 | Spring4Shell (CVE-2022-22965) | Update to 5.3.18+ or 6.x |
| `spring-security` < 5.7.5 | Authorization bypass | Update |
| `jackson-databind` < 2.14 | Polymorphic deserialization RCE | Update + disable default typing |
| `xstream` < 1.4.20 | Arbitrary code execution | Update or migrate |
| `org.yaml:snakeyaml` < 2.0 | Billion laughs / RCE | Update to 2.0+ |
| `commons-collections` < 3.2.2 | Deserialization gadget | Update |
| `struts2` < 6.3.0 | Multiple RCE CVEs historically | Always keep patched |
| `netty` < 4.1.94 | HTTP/2 rapid reset (CVE-2023-44487) | Update |

---

## Ruby

| Gem | Issue | Action |
|-----|-------|--------|
| `rails` | Critical CVEs regularly — always patch | Keep on latest minor |
| `devise` | Auth bypass if misconfigured | Keep updated, review config |
| `nokogiri` < 1.15.4 | libxml2/libxslt CVEs | Update |
| `rack` < 3.0.8 | Header injection (CVE-2023-44487) | Update |
| `omniauth` < 2.0 | CSRF in OAuth callback | Update to 2.x + add CSRF protection |

---

## Go

| Module | Issue | Action |
|--------|-------|--------|
| `golang.org/x/crypto` | SSH and TLS vulnerabilities periodically | Keep updated |
| `golang.org/x/net` | HTTP/2 CVEs, header injection | Keep updated |
| `github.com/dgrijalva/jwt-go` | ABANDONED | Migrate to `github.com/golang-jwt/jwt` |
| `github.com/ghodss/yaml` | Inactive | Use `sigs.k8s.io/yaml` |

---

## How to Automate This Check

```bash
# Python
pip install pip-audit
pip-audit -r requirements.txt

# Node.js
npm audit
npx audit-ci --high

# Java (Maven)
mvn dependency-check:check

# Multi-language
docker run --rm -v $(pwd):/repo aquasec/trivy:latest fs /repo

# Snyk CLI
npx snyk test
```

---

## Supply Chain Red Flags

- Package not updated in > 2 years but widely used
- Owner account transfered recently
- Sudden large PR from new contributor
- Package name very similar to popular package (typosquatting)
- Package with hundreds of reverse dependencies but maintained by 1 person
- No tests, no CI in the package's own repository
- Package uses `install` script in `package.json` (runs at install time)
