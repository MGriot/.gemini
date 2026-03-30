# Streamlit Security Reference

## Core Risks

Streamlit is often used for internal tools and data apps — but "internal" doesn't mean "secure by default."  
Key risks: no built-in auth, wide-open network binding, secrets in code, session state exposure.

---

## Authentication Patterns

### Option 1 — streamlit-authenticator (recommended for most cases)
```python
# pip install streamlit-authenticator
import streamlit_authenticator as stauth
import yaml
from yaml.loader import SafeLoader

with open("auth_config.yaml") as f:
    config = yaml.load(f, Loader=SafeLoader)

authenticator = stauth.Authenticate(
    config["credentials"],
    config["cookie"]["name"],
    config["cookie"]["key"],   # must come from st.secrets, not hardcoded
    config["cookie"]["expiry_days"],
)

name, authentication_status, username = authenticator.login("Login", "main")

if authentication_status is False:
    st.error("Username/password is incorrect")
    st.stop()
elif authentication_status is None:
    st.warning("Please enter your credentials")
    st.stop()
# Only code below here runs for authenticated users
```

### Option 2 — Reverse proxy auth (production-grade)
Put Streamlit behind nginx/Caddy with HTTP Basic Auth or OAuth2 proxy:
```nginx
location / {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:8501;
}
```
See `references/network-security.md` for full nginx config.

### Option 3 — Streamlit Community Cloud / Enterprise
Use the built-in viewer authentication feature — restrict by email domain.

---

## Secrets Management

```python
# ❌ NEVER hardcode secrets
conn = psycopg2.connect(host="db", user="admin", password="mypassword")
API_KEY = "sk-1234567890abcdef"

# ✅ Use st.secrets (stored in .streamlit/secrets.toml)
# .streamlit/secrets.toml — add to .gitignore!
# [database]
# host = "localhost"
# password = "..."
#
# [api]
# openai_key = "sk-..."

conn = psycopg2.connect(
    host=st.secrets["database"]["host"],
    password=st.secrets["database"]["password"]
)

api_key = st.secrets["api"]["openai_key"]
```

### .gitignore for Streamlit projects
```
.streamlit/secrets.toml
.env
*.pem
*.key
__pycache__/
```

---

## Session State Security

```python
# ❌ Storing sensitive data in session state exposes it in memory
# and potentially in browser dev tools
st.session_state["user_password"] = password
st.session_state["db_credentials"] = {"host": ..., "pass": ...}

# ✅ Store only non-sensitive identifiers
st.session_state["user_id"] = user.id
st.session_state["username"] = user.username
st.session_state["role"] = user.role

# ❌ Trusting session state for authorization
if st.session_state.get("is_admin"):
    show_admin_panel()  # session state can be manipulated

# ✅ Re-validate from DB/token on sensitive operations
if st.session_state.get("user_id"):
    user = db.get_user(st.session_state["user_id"])
    if user and user.role == "admin":
        show_admin_panel()
```

---

## Network Binding

```bash
# ❌ Default — binds to 0.0.0.0 (all interfaces, including public)
streamlit run app.py

# ✅ Bind to localhost only — reverse proxy handles external access
streamlit run app.py --server.address=127.0.0.1 --server.port=8501

# ✅ Production config in .streamlit/config.toml
# [server]
# address = "127.0.0.1"
# port = 8501
# enableCORS = false
# enableXsrfProtection = true
# maxUploadSize = 10
# headless = true
```

---

## File Upload Safety

```python
uploaded_file = st.file_uploader("Upload CSV", type=["csv"])

if uploaded_file:
    # ✅ Check size before reading
    if uploaded_file.size > 10 * 1024 * 1024:  # 10 MB
        st.error("File too large (max 10MB)")
        st.stop()

    # ✅ Validate file type from content, not just extension
    content = uploaded_file.read()
    import magic
    mime = magic.from_buffer(content[:2048], mime=True)
    if mime not in ("text/plain", "text/csv"):
        st.error("Invalid file type")
        st.stop()

    # ✅ Parse safely, catch errors
    import io
    import pandas as pd
    try:
        df = pd.read_csv(io.BytesIO(content), nrows=10000)  # limit rows
    except Exception:
        st.error("Could not parse file")
        st.stop()
```

---

## Code Execution Risks

```python
# ❌ CRITICAL — letting users run code
user_code = st.text_area("Enter Python code")
exec(user_code)                       # arbitrary code execution
eval(user_code)

# ❌ Also dangerous — SQL from text input without parameterization
query = st.text_input("SQL Query")
df = pd.read_sql(query, conn)

# ✅ Offer parameterized options instead
table = st.selectbox("Table", ["users", "orders", "products"])
limit = st.slider("Rows", 10, 1000, 100)
df = pd.read_sql("SELECT * FROM {} LIMIT %s".format(
    # whitelist table name
    table if table in ["users", "orders", "products"] else "users"
), conn, params=(limit,))
```

---

## iframe / Embedding Security

```python
# ❌ Embedding untrusted content
st.components.v1.iframe(user_supplied_url)
st.components.v1.html(user_html)    # XSS risk

# ✅ Only embed trusted, allowlisted URLs
ALLOWED_EMBED_DOMAINS = ["www.youtube.com", "player.vimeo.com"]

def safe_embed(url: str):
    from urllib.parse import urlparse
    host = urlparse(url).netloc
    if host not in ALLOWED_EMBED_DOMAINS:
        st.error("Embedding not allowed for this URL")
        return
    st.components.v1.iframe(url, height=400)
```

---

## Multipage App Authorization

```python
# pages/admin.py
import streamlit as st

def check_auth():
    if "user_id" not in st.session_state:
        st.error("Please log in")
        st.stop()
    user = get_user(st.session_state["user_id"])
    if not user or user.role != "admin":
        st.error("Access denied")
        st.stop()
    return user

# ✅ Call at the top of every restricted page — don't rely on navigation
user = check_auth()
st.write(f"Admin panel for {user.username}")
```

---

## Database Query Security in Streamlit

```python
# ✅ Use st.cache_data with caution — cached data is shared across sessions
@st.cache_data(ttl=60)
def get_public_stats():
    return db.query("SELECT count(*) FROM public_events").fetchone()

# ❌ Never cache user-specific or sensitive data with st.cache_data
@st.cache_data   # WRONG — other users can see this cached result
def get_user_data(user_id: int):
    return db.query("SELECT * FROM users WHERE id = %s", user_id)

# ✅ Use st.cache_resource for connections (not data)
@st.cache_resource
def get_db_connection():
    return psycopg2.connect(host=st.secrets["db"]["host"], ...)
```

---

## Streamlit Security Checklist

- [ ] Auth gate on every page (not just the home page)
- [ ] `server.address = "127.0.0.1"` in config.toml
- [ ] `enableXsrfProtection = true` in config.toml
- [ ] Secrets in `st.secrets`, not in code or env printed to logs
- [ ] `.streamlit/secrets.toml` in `.gitignore`
- [ ] File uploads: size limit + MIME validation
- [ ] No `exec()`/`eval()` on user input
- [ ] No raw SQL from text inputs
- [ ] `st.cache_data` not used for user-specific data
- [ ] Reverse proxy with TLS in front for production
- [ ] Port 8501 not exposed directly to internet
