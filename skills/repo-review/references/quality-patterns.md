# Code Quality Anti-Patterns Reference

A catalog of quality problems to look for during review, with before/after examples.

## Table of Contents
1. Function & Class Design
2. Error Handling
3. Code Duplication
4. Naming
5. Complexity
6. Type Safety
7. Logging & Observability
8. Configuration
9. API Design

---

## 1. Function & Class Design

### Long Function (> 50 lines)

Long functions are hard to test, understand, and change. The fix is extraction.

**Before:**
```python
def process_order(order_id):
    # 1. Validate
    order = db.query(Order).get(order_id)
    if not order:
        raise ValueError("Order not found")
    if order.status != "pending":
        raise ValueError("Order already processed")
    # ... 20 more lines of validation

    # 2. Charge payment
    card = PaymentMethod.query.get(order.payment_id)
    response = stripe.charge(card.token, order.total)
    # ... 15 lines of payment logic

    # 3. Update inventory
    for item in order.items:
        product = Product.query.get(item.product_id)
        product.stock -= item.quantity
    # ... 10 more lines
```

**After:**
```python
def process_order(order_id):
    order = _validate_order(order_id)
    _charge_payment(order)
    _update_inventory(order)
    _send_confirmation(order)
    return order

def _validate_order(order_id): ...
def _charge_payment(order): ...
def _update_inventory(order): ...
```

---

### God Class (> 300 lines, many responsibilities)

**Signs:**
- Class name contains "Manager", "Handler", "Processor", "Service"
- Class has > 20 methods
- Methods don't share any state — they just coexist
- Changing one feature requires touching the same class repeatedly

**Fix:** Apply Single Responsibility Principle. Split by responsibility.

---

### Too Many Arguments (> 5 parameters)

**Before:**
```python
def create_user(name, email, password, role, department, manager_id, start_date, phone):
    ...
```

**After:**
```python
@dataclass
class CreateUserRequest:
    name: str
    email: str
    password: str
    role: str
    department: str
    manager_id: Optional[int] = None
    start_date: Optional[date] = None
    phone: Optional[str] = None

def create_user(request: CreateUserRequest):
    ...
```

---

### Mutable Default Argument (Python)

**Vulnerable:**
```python
def add_item(item, items=[]):  # BUG: [] is shared across all calls
    items.append(item)
    return items
```

**Correct:**
```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

---

## 2. Error Handling

### Swallowed Exceptions

**Bad:**
```python
try:
    result = risky_operation()
except Exception:
    pass  # Silent failure — debugging nightmare

try:
    result = connect_to_db()
except:  # Bare except catches KeyboardInterrupt, SystemExit too
    result = None
```

**Good:**
```python
try:
    result = risky_operation()
except SpecificError as e:
    logger.warning("Operation failed, using default: %s", e)
    result = default_value
except Exception:
    logger.exception("Unexpected error in risky_operation")
    raise  # Re-raise unexpected exceptions
```

---

### Error Messages Without Context

**Bad:**
```python
raise ValueError("Invalid input")
raise Exception("Failed")
```

**Good:**
```python
raise ValueError(f"Expected positive integer, got {value!r}")
raise DatabaseError(f"Failed to insert record for user_id={user_id}: {original_error}")
```

---

## 3. Code Duplication

### Copy-Paste With Variations

**Bad:** Same validation logic in 5 different controllers.

**Signs to look for:**
- Identical 10+ line blocks appearing more than once
- Same error handling pattern copy-pasted
- Magic numbers/strings repeated identically

**Fix:** Extract to a shared function, mixin, or middleware.

---

## 4. Naming

### Vague Names

| Bad         | Good                              |
|-------------|-----------------------------------|
| `data`      | `user_profile`, `order_items`     |
| `result`    | `payment_response`, `search_hits` |
| `tmp`       | `temp_file_path`, `cached_user`   |
| `process()` | `charge_payment()`, `send_email()`|
| `flag`      | `is_active`, `has_permission`     |
| `l`, `ll`   | `user_list`, `line_count`         |
| `n`         | `user_count`, `retry_attempts`    |
| `x`, `y`    | `latitude`, `longitude`           |

---

### Boolean Naming

```python
# Bad
if user.active: ...
if file.flag: ...

# Good
if user.is_active: ...
if file.is_deleted: ...
if order.has_payment_method: ...
```

---

## 5. Complexity

### Deeply Nested Code (> 3 levels)

**Bad:**
```python
def process(items):
    if items:
        for item in items:
            if item.is_valid():
                if item.status == "ready":
                    if not item.is_locked():
                        # finally doing something 5 levels deep
                        item.process()
```

**Good — Early returns (Guard Clauses):**
```python
def process(items):
    if not items:
        return
    for item in items:
        if not item.is_valid():
            continue
        if item.status != "ready":
            continue
        if item.is_locked():
            continue
        item.process()
```

---

### Magic Numbers

**Bad:**
```python
if user.age < 18:
    return "not_allowed"
if score > 0.85:
    send_alert()
time.sleep(30)
```

**Good:**
```python
MINIMUM_AGE = 18
ALERT_THRESHOLD = 0.85
RETRY_DELAY_SECONDS = 30

if user.age < MINIMUM_AGE:
    return "not_allowed"
```

---

## 6. Type Safety

### Missing Type Annotations (Python)

```python
# Bad — reader must trace through code to understand types
def calculate(a, b, flag):
    ...

# Good
def calculate(price: float, quantity: int, apply_discount: bool) -> float:
    ...
```

### TypeScript `any`

```typescript
// Bad — defeats the entire point of TypeScript
const processData = (data: any): any => { ... }

// Good
interface UserData {
  id: number;
  email: string;
  createdAt: Date;
}
const processData = (data: UserData): ProcessedUser => { ... }
```

---

## 7. Logging & Observability

### No Logging in Critical Paths

Every external call, payment, state transition, and error should be logged.

```python
# Minimum logging for a critical operation
logger.info("Starting payment charge", extra={"user_id": user_id, "amount": amount})
try:
    result = stripe.charge(token, amount)
    logger.info("Payment successful", extra={"charge_id": result.id})
except stripe.CardError as e:
    logger.warning("Card declined", extra={"user_id": user_id, "code": e.code})
    raise
except Exception:
    logger.exception("Unexpected payment error", extra={"user_id": user_id})
    raise
```

### Using Print Instead of Logging

```python
# Bad in production code
print(f"Processing order {order_id}")
print("ERROR: something went wrong")

# Good
import logging
logger = logging.getLogger(__name__)
logger.info("Processing order", extra={"order_id": order_id})
logger.error("Processing failed", extra={"order_id": order_id}, exc_info=True)
```

---

## 8. Configuration

### Hardcoded Config Values

**Bad:**
```python
DB_HOST = "postgres.prod.internal"
MAX_RETRIES = 3
TIMEOUT_SECONDS = 30
FEATURE_FLAG_X = True
```

**Good:**
```python
import os

DB_HOST = os.environ["DATABASE_HOST"]
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
TIMEOUT_SECONDS = float(os.getenv("TIMEOUT_SECONDS", "30"))
FEATURE_FLAG_X = os.getenv("FEATURE_FLAG_X", "false").lower() == "true"
```

---

## 9. API Design

### Inconsistent Response Shapes

Bad: some endpoints return `{"data": {...}}`, others return `{...}` directly, errors as `{"message": "..."}` or `{"error": {...}}`.

Good: establish and enforce a consistent envelope:
```json
{
  "data": {...},
  "error": null,
  "meta": {"page": 1, "total": 100}
}
```

### Missing Pagination

Any endpoint that returns a list must be paginated. Returning unbounded lists will eventually crash in production.

```python
# Always paginate lists
@app.route("/api/orders")
def list_orders():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    return Order.query.paginate(page=page, per_page=per_page)
```
