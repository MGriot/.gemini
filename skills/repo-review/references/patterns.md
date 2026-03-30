# Code Patterns Reference

A library of common patterns — good, bad, and context-dependent — for use during
repository reviews. Use this reference when performing Phase 5 (deep file reading)
or writing the quality section of the report.

---

## Anti-Patterns (Code Smells)

### 1. God Object / God Module
A single class or module that knows too much and does too much.

**Signs:**
- Class with 20+ methods
- File over 800 lines
- Name like `Utils`, `Helper`, `Manager`, `Handler` with no domain qualifier
- Module imported by almost every other module

**Impact:** Hard to test, hard to modify, tends to accumulate more debt.

---

### 2. Feature Envy
A function that accesses the data of another class more than its own.

```python
# SMELL — order_report() lives in Invoice but only uses Order data
class Invoice:
    def order_report(self, order):
        return f"{order.id}: {order.items} @ {order.total}"
        # This belongs in Order
```

---

### 3. Long Parameter List
Functions with 5+ parameters are hard to call correctly and indicate unclear boundaries.

```python
# SMELL
def create_user(name, email, age, role, is_active, created_by, team_id, permissions):
    ...

# BETTER — use a dataclass or TypedDict
@dataclass
class UserCreateRequest:
    name: str
    email: str
    role: str
    # ...
```

---

### 4. Magic Numbers / Strings
Unexplained constants in the middle of logic.

```python
# SMELL
if status == 3:
    send_email()

# BETTER
STATUS_CONFIRMED = 3
if status == STATUS_CONFIRMED:
    send_email()
```

---

### 5. Deeply Nested Code (Arrow Anti-Pattern)
```python
# SMELL — hard to reason about at this depth
def process():
    if condition_a:
        for item in items:
            if condition_b:
                try:
                    if condition_c:
                        result = do_thing(item)
                        ...
```

**Better pattern:** Early returns, guard clauses, extract helper functions.

---

### 6. Swallowed Exceptions
```python
# SMELL — silent failure
try:
    risky_operation()
except Exception:
    pass   # or: except Exception: return None

# BETTER — at minimum, log it
except Exception as e:
    logger.error(f"risky_operation failed: {e}", exc_info=True)
    raise
```

---

### 7. Primitive Obsession
Using raw strings/ints where domain types would be clearer.

```python
# SMELL
user_id = "usr_abc123"   # just a string everywhere
money = 1999             # cents? dollars? which currency?

# BETTER
user_id = UserId("usr_abc123")
money = Money(amount=1999, currency="USD")
```

---

### 8. Copy-Paste Programming
Identical or near-identical blocks repeated in multiple places. Signal: if the same
logic needs to change, you'll have to change it in N places.

**Detection:** `grep -n` for common function signatures; look for nearly identical
blocks in the same file.

---

### 9. Shotgun Surgery
A single change requires touching many unrelated files. Sign of poor cohesion.

---

### 10. Boolean Trap
```python
# What does `True` mean here?
render_page(True, False, True, True)

# BETTER — named arguments or enums
render_page(include_sidebar=True, mobile=False, cache=True, minify=True)
```

---

## Good Patterns to Recognize & Praise

### Dependency Injection
Passing dependencies in rather than creating them inside — makes testing easy.

```python
class OrderService:
    def __init__(self, db: Database, mailer: Mailer):
        self.db = db
        self.mailer = mailer
```

### Repository Pattern
Abstracting data access behind an interface — keeps business logic clean.

```python
class UserRepository(ABC):
    @abstractmethod
    def find_by_id(self, user_id: int) -> User: ...

class PostgresUserRepository(UserRepository):
    def find_by_id(self, user_id: int) -> User:
        # actual DB call
```

### Early Return / Guard Clauses
Reduces nesting and makes the happy path clear.

```python
def process(order):
    if not order:
        return None
    if order.is_cancelled:
        raise OrderCancelledException()
    if not order.items:
        return EmptyOrderResult()

    # happy path — now clear and unindented
    return do_processing(order)
```

### Immutable Data / Value Objects
Prefer immutable structures where possible — fewer bugs from accidental mutation.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    amount: int
    currency: str
```

### Configuration Objects
Centralising config (not scattered `os.environ.get()` calls everywhere).

```python
@dataclass
class Config:
    db_url: str = field(default_factory=lambda: os.environ["DATABASE_URL"])
    redis_url: str = field(default_factory=lambda: os.environ.get("REDIS_URL", ""))
    debug: bool = field(default_factory=lambda: os.environ.get("DEBUG") == "1")
```

---

## Architecture Patterns — Recognition Guide

### MVC (Model-View-Controller)
Look for: `models/`, `views/`, `controllers/` or `handlers/` directories.  
Common in: Django, Rails, Laravel, ASP.NET MVC.

### Layered / N-Tier
Look for: `api/` → `services/` → `repositories/` → `models/` hierarchy.  
Entry point calls service, service calls repo, repo talks to DB.

### Event-Driven
Look for: event bus, pub/sub, message queues (`kafka`, `rabbitmq`, `celery`, `sns`).  
Modules communicate via events, not direct calls.

### Microservices
Look for: multiple `Dockerfile`s, separate `package.json`/`requirements.txt` per service,
API gateway config, inter-service HTTP/gRPC calls.

### Hexagonal (Ports and Adapters)
Look for: `domain/`, `ports/`, `adapters/` directories.  
Business logic has no direct framework or DB imports.

### CQRS (Command Query Responsibility Segregation)
Look for: `commands/`, `queries/` split; separate read/write models.

---

## Dependency Health Signals

### Good signals
- `requirements.txt` with pinned versions (`requests==2.31.0`)
- `package-lock.json` or `yarn.lock` committed
- Dependabot / Renovate configured (`.github/dependabot.yml`)
- Regular update commits in git history

### Bad signals
- Unpinned versions (`requests>=2.0`)
- Very old major versions (e.g., Django 1.x, Express 3.x)
- No lock file committed
- Dependencies last updated 2+ years ago
- Known-abandoned packages

---

## Testing Quality Signals

### Good signals
- Test-to-source ratio > 0.5 (at least one test file per two source files)
- Tests use meaningful assertions, not just `assert result is not None`
- Edge cases tested (empty input, None, large values)
- Integration tests present alongside unit tests
- CI runs tests on every PR

### Bad signals
- Zero test files
- Test files that are mostly `pass` or trivial
- Tests that mock everything (not actually testing logic)
- No CI/CD pipeline

---

## Language-Specific Patterns

### Python
- **Good:** Type hints (`def fn(x: int) -> str:`), dataclasses, context managers (`with`)
- **Watch:** `import *`, mutable default arguments (`def f(items=[])`), `bare except`

### JavaScript / TypeScript
- **Good:** TypeScript strict mode, ESLint configured, async/await (vs callback hell)
- **Watch:** `any` types everywhere, `console.log` in production code, no null checks

### Go
- **Good:** Explicit error handling, small interfaces, goroutine cleanup
- **Watch:** Ignored errors (`_ = err`), unbounded goroutines, global state

### Java
- **Good:** Dependency injection (Spring/Guice), proper exception hierarchy
- **Watch:** `System.out.println` in production, catching `Exception` broadly, static state
