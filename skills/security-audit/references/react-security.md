# React / Frontend Security Reference

## XSS — Cross-Site Scripting

### dangerouslySetInnerHTML
```jsx
// ❌ CRITICAL — direct XSS if content is user-controlled
<div dangerouslySetInnerHTML={{ __html: userContent }} />
<div dangerouslySetInnerHTML={{ __html: post.body }} />

// ✅ Sanitize with DOMPurify before rendering
import DOMPurify from "dompurify";

const SafeHTML = ({ html }) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "b", "i", "em", "strong", "a", "ul", "li", "br"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  }) }} />
);

// ✅ Or better — use a Markdown renderer with sanitization
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
<ReactMarkdown remarkPlugins={[remarkGfm]}>{userContent}</ReactMarkdown>
```

### href injection
```jsx
// ❌ javascript: protocol — XSS via link
<a href={user.website}>Profile</a>  // if website = "javascript:alert(1)"

// ✅ Validate protocol
function SafeLink({ href, children }) {
  const safe = href?.startsWith("https://") || href?.startsWith("http://");
  return safe ? <a href={href} rel="noopener noreferrer" target="_blank">{children}</a>
              : <span>{children}</span>;
}
```

---

## Token Storage

```javascript
// ❌ localStorage — accessible by any JS on the page (XSS steals it)
localStorage.setItem("access_token", token);

// ❌ sessionStorage — better but still XSS-accessible
sessionStorage.setItem("token", token);

// ✅ Best option: HttpOnly cookies (server sets them — JS can't read)
// Server sets:  Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict

// ✅ If you must store in JS memory:
// Store in React state / context — lost on refresh (requires silent refresh pattern)
const [token, setToken] = useState(null);

// ✅ If refresh token must persist: HttpOnly cookie only
// Access token: memory/state (short lived, e.g. 15 min)
// Refresh token: HttpOnly Secure SameSite=Strict cookie
```

---

## CSRF Protection

```javascript
// ❌ State-changing requests without CSRF protection
fetch("/api/transfer", {
  method: "POST",
  body: JSON.stringify({ amount: 1000, to: "attacker" })
});

// ✅ Include CSRF token for cookie-based auth
const csrfToken = document.cookie
  .split("; ")
  .find(row => row.startsWith("csrftoken="))
  ?.split("=")[1];

fetch("/api/transfer", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": csrfToken,
  },
  body: JSON.stringify({ amount: 1000, to: recipient }),
});

// ✅ For JWT Bearer tokens — CSRF not required (bearer token IS the proof)
// But ensure your API requires Authorization header, not cookie
fetch("/api/transfer", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ amount: 1000, to: recipient }),
});
```

---

## Content Security Policy (CSP)

Add via HTTP header (preferred) or meta tag:

```html
<!-- Meta tag approach (limited — can't cover all directives) -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'nonce-{RANDOM_NONCE}';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.example.com;
               font-src 'self' https://fonts.gstatic.com;
               frame-ancestors 'none'">
```

```nginx
# ✅ Header approach (preferred — covers all resources)
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
" always;
```

---

## Sensitive Data in Frontend Code

```javascript
// ❌ API keys in frontend code — they are PUBLIC
const STRIPE_SECRET = "sk_live_xxx";     // anyone can view source
const OPENAI_KEY = "sk-xxx";            // bundle is inspectable

// ✅ Public keys only in frontend
const STRIPE_PUBLISHABLE = "pk_live_xxx";  // designed to be public

// ✅ Secret calls must go through your backend
// Frontend → Your Backend (authenticated) → Third-party API
async function callOpenAI(prompt) {
  const res = await fetch("/api/ai/complete", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ prompt }),
  });
  return res.json();
}
```

---

## Environment Variables in React/Vite/Next.js

```bash
# ❌ These are bundled into the client JS — visible in source
REACT_APP_SECRET_KEY=xxx
VITE_SECRET_KEY=xxx
NEXT_PUBLIC_SECRET=xxx

# ✅ Only public config belongs here
REACT_APP_API_URL=https://api.example.com
VITE_APP_NAME=MyApp

# ✅ Secret values live in server-side env only
# .env (server-side, never prefixed with REACT_APP_/VITE_/NEXT_PUBLIC_)
OPENAI_API_KEY=sk-xxx
DATABASE_URL=postgresql://...
```

---

## Dependency Security

```bash
# Audit for known vulnerabilities
npm audit
npm audit --audit-level=high   # fail CI on high/critical

# Auto-fix safe updates
npm audit fix

# Check for outdated packages
npm outdated

# Scan with Snyk
npx snyk test

# Detect typosquatting / malicious packages before install
npx check-is-typosquatted packagename
```

### Lock file hygiene
```bash
# ✅ Always commit package-lock.json or yarn.lock
# This prevents supply chain attacks from floating versions

# ❌ Never use --no-package-lock or --ignore-scripts=false carelessly
# npm install --ignore-scripts  # safer for untrusted packages
```

---

## Open Redirect

```javascript
// ❌ Redirecting to user-supplied URL after login
const redirect = new URLSearchParams(location.search).get("next");
window.location.href = redirect;   // open redirect — attacker sends ?next=https://evil.com

// ✅ Validate redirect is internal
function safeRedirect(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin === window.location.origin) {
      window.location.href = parsed.href;
    } else {
      window.location.href = "/dashboard";  // default fallback
    }
  } catch {
    window.location.href = "/dashboard";
  }
}
```

---

## Clickjacking

```html
<!-- Add X-Frame-Options header server-side -->
<!-- OR use CSP frame-ancestors (preferred) -->

<!-- ❌ Your app can be framed by anyone — clickjacking -->
<!-- ✅ Server header: X-Frame-Options: DENY -->
<!-- ✅ CSP: frame-ancestors 'none' -->
```

---

## React Security Checklist

- [ ] No `dangerouslySetInnerHTML` with unsanitized user content
- [ ] All `href` values from user data validated for protocol
- [ ] Tokens stored in memory or HttpOnly cookies — not localStorage
- [ ] CSP header configured and tested
- [ ] `npm audit` in CI pipeline
- [ ] No secret keys in frontend code or VITE_/REACT_APP_ env vars
- [ ] Open redirect validated before executing
- [ ] `rel="noopener noreferrer"` on all `target="_blank"` links
- [ ] X-Frame-Options or CSP frame-ancestors set
- [ ] Subresource Integrity (SRI) for CDN scripts
