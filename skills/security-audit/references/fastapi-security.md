# FastAPI Security Reference

## Secure Application Bootstrap

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="My API",
    # ❌ Never expose docs in production without auth
    docs_url=None,   # or protect with middleware
    redoc_url=None,
    openapi_url=None,  # completely disable in prod
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ✅ HTTPS redirect in production
if settings.ENV == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

# ✅ Trusted host validation
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["api.example.com", "*.example.com"]
)

# ✅ Restrictive CORS — NOT wildcard on authenticated APIs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],   # ❌ Never ["*"] for auth'd APIs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)
```

---

## Security Headers Middleware

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self'; "
            "frame-ancestors 'none'"
        )
        # Remove server fingerprinting
        response.headers.pop("X-Powered-By", None)
        response.headers.pop("Server", None)
        return response

app.add_middleware(SecurityHeadersMiddleware)
```

---

## Authentication with JWT

```python
from datetime import datetime, timedelta, timezone
from typing import Annotated
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = os.environ["JWT_SECRET_KEY"]      # min 32 chars, random
ALGORITHM = "HS256"                             # or RS256 for asymmetric
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def create_access_token(subject: str, scopes: list[str] = []) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": str(uuid4()),            # unique token ID — enables revocation
        "scopes": scopes,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        # ✅ Check revocation list (Redis or DB)
        if await is_token_revoked(payload.get("jti")):
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).get(user_id)
    if user is None or not user.is_active:
        raise credentials_exception
    return user

# ✅ Protect routes
@app.get("/profile")
async def get_profile(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
```

---

## Rate Limiting

```python
from slowapi.util import get_remote_address
from fastapi import Request

# Per-endpoint rate limits
@app.post("/auth/login")
@limiter.limit("5/minute")               # strict on auth endpoints
async def login(request: Request, credentials: LoginCredentials):
    ...

@app.post("/auth/register")
@limiter.limit("3/hour")
async def register(request: Request, body: RegisterBody):
    ...

@app.get("/api/data")
@limiter.limit("100/minute")             # more generous for normal API
async def get_data(request: Request, user=Depends(get_current_user)):
    ...

# Custom key function — rate limit by user ID when authenticated
def get_user_or_ip(request: Request) -> str:
    token = request.headers.get("Authorization", "")
    if token:
        try:
            payload = jwt.decode(token.replace("Bearer ", ""), SECRET_KEY, algorithms=[ALGORITHM])
            return f"user:{payload['sub']}"
        except Exception:
            pass
    return get_remote_address(request)

user_limiter = Limiter(key_func=get_user_or_ip)
```

---

## Input Validation with Pydantic

```python
from pydantic import BaseModel, EmailStr, Field, field_validator
import re

class UserCreate(BaseModel):
    email: EmailStr                                        # validated email
    password: str = Field(min_length=8, max_length=128)   # length bounds
    username: str = Field(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_-]+$")
    age: int = Field(ge=0, le=150)                        # numeric bounds

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain uppercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain a digit")
        return v

# ❌ Never trust user-supplied IDs for authorization
@app.get("/orders/{order_id}")
async def get_order(order_id: int, user=Depends(get_current_user), db=Depends(get_db)):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user.id   # ✅ Always scope to current user
    ).first()
    if not order:
        raise HTTPException(404)
    return order
```

---

## Error Handling — Avoid Information Leakage

```python
from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# ✅ Generic error handler — never expose stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)  # log full detail internally
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred"},   # ✅ no stack trace to client
    )

# ✅ Validation errors — Pydantic gives helpful but safe messages
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},  # Pydantic errors are safe to return
    )
```

---

## Background Tasks Security

```python
from fastapi import BackgroundTasks

# ❌ Passing unvalidated user data to background tasks
@app.post("/send-email")
async def send_email(email: str, bg: BackgroundTasks):
    bg.add_task(send_notification, email)  # no validation

# ✅ Validate and type everything
@app.post("/send-email")
async def send_email(body: EmailRequest, bg: BackgroundTasks, user=Depends(get_current_user)):
    # body.email is already EmailStr validated
    bg.add_task(send_notification, str(body.email), user.id)
```

---

## Protect OpenAPI Docs in Production

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import hmac

security = HTTPBasic()

def verify_docs_access(credentials: HTTPBasicCredentials = Depends(security)):
    ok_user = hmac.compare_digest(credentials.username, os.environ["DOCS_USER"])
    ok_pass = hmac.compare_digest(credentials.password, os.environ["DOCS_PASSWORD"])
    if not (ok_user and ok_pass):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            headers={"WWW-Authenticate": "Basic"})

app = FastAPI(
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# Protect the docs routes
@app.get("/docs", include_in_schema=False)
async def custom_docs(deps=Depends(verify_docs_access)):
    from fastapi.openapi.docs import get_swagger_ui_html
    return get_swagger_ui_html(openapi_url="/openapi.json", title="API Docs")
```

---

## Database Connection Security

```python
# ✅ SQLAlchemy — connection pool settings
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,          # detect stale connections
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    connect_args={
        "sslmode": "require",    # enforce SSL for PostgreSQL
        "connect_timeout": 10,
    }
)

# ✅ Async version (asyncpg)
from sqlalchemy.ext.asyncio import create_async_engine
engine = create_async_engine(
    DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    pool_pre_ping=True,
)
```

---

## File Upload Security

```python
from fastapi import UploadFile, File, HTTPException
import magic  # python-magic
from pathlib import Path
import uuid

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), user=Depends(get_current_user)):
    content = await file.read()

    # ✅ Check size
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(413, "File too large")

    # ✅ Check MIME type from content, not filename
    mime = magic.from_buffer(content, mime=True)
    if mime not in ALLOWED_TYPES:
        raise HTTPException(415, "Unsupported file type")

    # ✅ Randomize filename — never use user-supplied name
    ext = {"image/jpeg": ".jpg", "image/png": ".png"}.get(mime, ".bin")
    safe_name = f"{uuid.uuid4()}{ext}"
    dest = Path("/app/uploads") / safe_name

    with open(dest, "wb") as f:
        f.write(content)

    return {"filename": safe_name}
```
