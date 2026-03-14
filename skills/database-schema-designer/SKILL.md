---
name: database-schema-designer
description: Design robust, scalable, production-ready database schemas for SQL and NoSQL databases. Use this skill whenever the user mentions designing a schema, creating tables, modeling data, database architecture, normalization, indexing, migrations, or anything about structuring a database — even if they don't use the word "schema". Trigger on phrases like "I need a database for...", "how should I store...", "what tables do I need...", "help me model...", "design my data model", or any request to think through how to persist data. Covers normalization (1NF–3NF), indexing strategies, constraint design, foreign key patterns, soft deletes, audit trails, multi-tenancy, migration patterns, and performance optimization.
license: MIT
---

# Database Schema Designer

Design production-ready database schemas with best practices built-in.

---

## Quick Start

Just describe your data model:

```
design a schema for an e-commerce platform with users, products, orders
```

**What to include in your request:**
- Entities and their key relationships
- Scale hints (high-traffic, millions of records, multi-tenant)
- Special requirements (soft deletes, audit trail, multi-tenancy)
- Database preference (SQL/NoSQL, MySQL/PostgreSQL) — defaults to PostgreSQL if unspecified

---

## Process Overview

```
Requirements → ANALYZE (entities, access patterns, SQL vs NoSQL)
            → DESIGN  (normalize to 3NF, define keys, constraints, types)
            → OPTIMIZE (indexes, denormalize hot paths, add timestamps)
            → MIGRATE  (reversible scripts, backward-compatible, zero-downtime)
            → Production-Ready Schema
```

---

## Quick Reference

| Task | Approach | Key Consideration |
|------|----------|-------------------|
| New schema | Normalize to 3NF first | Model the domain, not the UI |
| SQL vs NoSQL | Access patterns decide | Read/write ratio + consistency needs |
| Primary keys | `BIGINT` or UUID | UUID / ULID for distributed systems |
| Foreign keys | Always constrain | Define `ON DELETE` strategy explicitly |
| Indexes | FKs + WHERE/ORDER BY cols | Column order in composite indexes matters |
| Migrations | Always reversible | Backward-compatible first |
| Soft deletes | `deleted_at TIMESTAMP` | Filter `WHERE deleted_at IS NULL` |
| Audit trail | `created_by`, `updated_by` | FK to users table |
| Multi-tenancy | `tenant_id` on every table | Index it; enforce in app layer too |

---

## Commands

| Command | Action |
|---------|--------|
| `design schema for {domain}` | Full schema generation |
| `normalize {table}` | Apply normalization rules |
| `add indexes for {query pattern}` | Generate index strategy |
| `migration for {change}` | Create reversible migration |
| `review schema` | Audit existing schema for issues |

---

## Core Principles

| Principle | Why | How |
|-----------|-----|-----|
| Model the Domain | UI changes, domain doesn't | Names reflect business concepts |
| Data Integrity First | Corruption is costly | Constraints at the database level |
| Optimize for Access Pattern | Can't optimize for everything | OLTP: normalized; OLAP: denormalized |
| Plan for Scale | Retrofitting hurts | Index strategy + partitioning plan upfront |
| Soft-Delete by Default | Hard deletes lose history | `deleted_at` + partial index on `NULL` |

---

## Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| `VARCHAR(255)` everywhere | Hides intent, wastes storage | Size fields appropriately |
| `FLOAT` for money | Rounding errors | `DECIMAL(10,2)` |
| Missing FK constraints | Orphaned/corrupt data | Always define foreign keys |
| No indexes on FKs | Slow JOINs | Index every FK |
| Dates as strings | Can't compare or sort | `DATE`, `TIMESTAMP` types |
| `SELECT *` | Fetches unnecessary data | Explicit column lists |
| Non-reversible migrations | Can't rollback | Always write `DOWN` migration |
| `NOT NULL` without default | Breaks existing rows | Add nullable → backfill → constrain |
| `is_deleted BOOLEAN` | Can't tell when or by whom | `deleted_at TIMESTAMP NULL` |
| Multiple boolean status cols | Mutually exclusive states blow up | Single `status ENUM` or lookup table |
| EAV (Entity-Attribute-Value) | Kills query performance and type safety | Dedicated columns or JSONB for truly dynamic attrs |
| `tenant_id`-less tables | Impossible to isolate tenant data later | Add `tenant_id` from day one in SaaS |

---

## Common Patterns

### Soft Deletes

```sql
-- Add to any table that should support soft delete
deleted_at  TIMESTAMP NULL DEFAULT NULL,
deleted_by  BIGINT    NULL REFERENCES users(id)

-- PostgreSQL: partial index keeps queries fast
CREATE INDEX idx_orders_active ON orders(customer_id)
  WHERE deleted_at IS NULL;

-- All queries must filter:
SELECT * FROM orders WHERE deleted_at IS NULL;
```

### Audit Trail

```sql
-- Minimal audit columns on every table
created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
created_by  BIGINT    NOT NULL REFERENCES users(id),
updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_by  BIGINT    NULL     REFERENCES users(id)

-- For full change history, use a separate audit table:
CREATE TABLE orders_audit (
  id         BIGINT PRIMARY KEY,
  order_id   BIGINT NOT NULL,
  action     VARCHAR(10) NOT NULL,   -- INSERT / UPDATE / DELETE
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by BIGINT NOT NULL REFERENCES users(id),
  snapshot   JSONB  NOT NULL         -- row state at time of change
);
```

### Multi-Tenancy (Row-Level Isolation)

```sql
-- Every tenant-scoped table carries tenant_id
CREATE TABLE projects (
  id         BIGINT PRIMARY KEY,
  tenant_id  BIGINT NOT NULL REFERENCES tenants(id),
  name       VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_projects_tenant (tenant_id)
);

-- Application layer always scopes queries:
SELECT * FROM projects WHERE tenant_id = ? AND deleted_at IS NULL;

-- PostgreSQL: enforce at DB level with Row-Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
```

### Status / State Machine

```sql
-- Use ENUM or a lookup table — never multiple boolean columns
status VARCHAR(20) NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))

-- PostgreSQL native ENUM (rename is painful — prefer VARCHAR + CHECK)
CREATE TYPE order_status AS ENUM ('pending','processing','shipped','delivered','cancelled');
```

### Primary Key Choice

```sql
-- Auto-increment (simple, opaque, performant)
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY

-- UUID (distributed, globally unique, URL-safe)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()   -- PostgreSQL 13+

-- ULID/KSUID: sortable + unique — best of both worlds (use via app or extension)
```

---

## Verification Checklist

After designing a schema, confirm:

- [ ] Every table has a primary key
- [ ] All FK relationships have constraints + `ON DELETE` strategy
- [ ] Indexes on every FK column
- [ ] Indexes on frequently queried `WHERE`/`ORDER BY` columns
- [ ] `DECIMAL` for monetary values (not `FLOAT`)
- [ ] `NOT NULL` on required fields; `UNIQUE` where needed
- [ ] `CHECK` constraints for validation rules
- [ ] `created_at` / `updated_at` timestamps on every table
- [ ] Soft delete strategy defined (`deleted_at` or hard delete with reason)
- [ ] Audit trail considered (who created/changed each record)
- [ ] `tenant_id` on all tenant-scoped tables (SaaS apps)
- [ ] Migrations are reversible (UP + DOWN scripts)
- [ ] Tested on staging with production-like data

---

<details>
<summary><strong>Deep Dive: Normalization (SQL)</strong></summary>

| Form | Rule | Violation Example |
|------|------|-------------------|
| **1NF** | Atomic values, no repeating groups | `product_ids = '1,2,3'` |
| **2NF** | 1NF + no partial dependencies | `customer_name` in `order_items` |
| **3NF** | 2NF + no transitive dependencies | `country` derived from `postal_code` |

```sql
-- 1NF violation → fix with a junction table
-- BAD
CREATE TABLE orders (id INT PRIMARY KEY, product_ids VARCHAR(255));
-- GOOD
CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id)
);

-- 3NF violation → fix with a lookup table
-- BAD
CREATE TABLE customers (id INT PRIMARY KEY, postal_code VARCHAR(10), country VARCHAR(50));
-- GOOD
CREATE TABLE postal_codes (code VARCHAR(10) PRIMARY KEY, country VARCHAR(50));
```

### When to Denormalize

| Scenario | Strategy |
|----------|----------|
| Read-heavy reporting | Pre-calculated aggregates / `total_amount` cache |
| Expensive JOINs | Derived columns updated by trigger |
| Analytics dashboards | Materialized views |

</details>

<details>
<summary><strong>Deep Dive: Data Types</strong></summary>

### Strings
| Type | Use Case |
|------|----------|
| `CHAR(n)` | Fixed-length codes (`country_code CHAR(2)`) |
| `VARCHAR(n)` | Variable text (`email VARCHAR(255)`) |
| `TEXT` | Long content (articles, descriptions) |

### Numbers
| Type | Use Case |
|------|----------|
| `TINYINT` / `SMALLINT` | Status codes, small quantities |
| `INT` / `BIGINT` | IDs, counts |
| `DECIMAL(p,s)` | Money — always |
| `FLOAT` / `DOUBLE` | Scientific data only |

### Dates — always store in UTC
```sql
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- PostgreSQL
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

### PostgreSQL Extras
```sql
-- JSONB for dynamic/sparse attributes (indexed, fast)
metadata JSONB DEFAULT '{}'
CREATE INDEX idx_meta ON table USING GIN(metadata);

-- Arrays
tags TEXT[] DEFAULT '{}'

-- Ranges
valid_during TSTZRANGE
```

</details>

<details>
<summary><strong>Deep Dive: Indexing Strategy</strong></summary>

### When to Index
| Always | Reason |
|--------|--------|
| Foreign keys | Speed up JOINs |
| `WHERE` clause columns | Speed up filtering |
| `ORDER BY` columns | Speed up sorting |
| Unique constraints | Enforced uniqueness |

```sql
-- Composite: put most selective column first, match query patterns
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
-- Uses: WHERE customer_id = ?  /  WHERE customer_id = ? AND status = ?
-- Misses: WHERE status = ?  (status alone)

-- Partial (PostgreSQL) — smaller, faster for filtered queries
CREATE INDEX idx_orders_pending ON orders(created_at)
  WHERE status = 'pending';
```

### Index Types
| Type | Best For |
|------|----------|
| B-Tree (default) | Ranges, equality, sorting |
| Hash | Exact equality only |
| Full-text | Text search (`MATCH AGAINST`) |
| GIN / GiST | Arrays, JSONB, geospatial (PostgreSQL) |

### Pitfalls
- **Over-indexing** slows writes — only index what's queried
- **Wrong column order** in composite indexes → unused index
- **Missing FK indexes** → slow JOINs (MySQL won't create them automatically)

</details>

<details>
<summary><strong>Deep Dive: Constraints</strong></summary>

```sql
-- Foreign key strategies
FOREIGN KEY (customer_id) REFERENCES customers(id)
  ON DELETE CASCADE     -- delete children with parent (order_items)
  ON DELETE RESTRICT    -- prevent deletion if referenced (safest default)
  ON DELETE SET NULL    -- optional relationships

-- Check constraints
price   DECIMAL(10,2) CHECK (price >= 0)
discount INT           CHECK (discount BETWEEN 0 AND 100)

-- Composite unique
UNIQUE (tenant_id, slug)   -- slug unique per tenant, not globally
```

</details>

<details>
<summary><strong>Deep Dive: Relationship Patterns</strong></summary>

```sql
-- One-to-Many
CREATE TABLE orders (
  id          BIGINT PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT
);

-- Many-to-Many (junction table)
CREATE TABLE enrollments (
  student_id  BIGINT REFERENCES students(id) ON DELETE CASCADE,
  course_id   BIGINT REFERENCES courses(id)  ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, course_id)
);

-- Self-referencing (hierarchy)
CREATE TABLE employees (
  id         BIGINT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  manager_id BIGINT REFERENCES employees(id)
);

-- Polymorphic (prefer separate FKs for integrity)
CREATE TABLE comments (
  id       BIGINT PRIMARY KEY,
  content  TEXT NOT NULL,
  post_id  BIGINT REFERENCES posts(id),
  photo_id BIGINT REFERENCES photos(id),
  CHECK (
    (post_id IS NOT NULL AND photo_id IS NULL) OR
    (post_id IS NULL     AND photo_id IS NOT NULL)
  )
);
```

</details>

<details>
<summary><strong>Deep Dive: NoSQL Design (MongoDB)</strong></summary>

### Embed vs Reference

| Factor | Embed | Reference |
|--------|-------|-----------|
| Accessed together? | Yes → embed | No → reference |
| Relationship size | 1:few | 1:many |
| Update frequency | Rarely | Frequently |
| Document size concern | Small | Near 16 MB |

```json
// Embedded (order + its items read together)
{ "_id": "order_123", "items": [{ "product_id": "p1", "qty": 2 }], "total": 59.98 }

// Referenced (customer loaded separately)
{ "_id": "order_123", "customer_id": "cust_456", "total": 59.98 }
```

```javascript
// MongoDB indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.orders.createIndex({ customer_id: 1, created_at: -1 });
db.articles.createIndex({ title: "text", body: "text" });
db.stores.createIndex({ location: "2dsphere" });
```

</details>

<details>
<summary><strong>Deep Dive: Migrations</strong></summary>

### Rules
| Practice | Why |
|----------|-----|
| Always reversible | Need to rollback |
| Backward compatible | Zero-downtime deploys |
| Schema change before data change | Separate concerns |
| Test on staging first | Catch issues early |

### Adding a Column (Zero-Downtime)
```sql
-- Step 1: Add nullable (deploy immediately — no lock on large tables)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
-- Step 2: Deploy app code that writes to new column
-- Step 3: Backfill
UPDATE users SET phone = '' WHERE phone IS NULL;
-- Step 4: Add constraint
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
```

### Migration Template
```sql
-- Migration: 20250314120000_add_phone_to_users.sql

-- UP
BEGIN;
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
CREATE INDEX idx_users_phone ON users(phone);
COMMIT;

-- DOWN
BEGIN;
DROP INDEX idx_users_phone;
ALTER TABLE users DROP COLUMN phone;
COMMIT;
```

</details>

<details>
<summary><strong>Deep Dive: Performance Optimization</strong></summary>

```sql
-- Analyze query plan
EXPLAIN ANALYZE SELECT * FROM orders
WHERE customer_id = 123 AND status = 'pending';
```

| `EXPLAIN` output | Meaning |
|-----------------|---------|
| `Seq Scan` | Full table scan — add an index |
| `Index Scan` | Good |
| `Bitmap Index Scan` | Good for low-selectivity |
| `rows=` very high | Many rows examined — refine index |

### N+1 Query Problem
```python
# BAD: 1 query per order
for order in orders:
    customer = db.query("SELECT * FROM customers WHERE id = ?", order.customer_id)

# GOOD: single JOIN
results = db.query("""
    SELECT o.*, c.name AS customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.deleted_at IS NULL
""")
```

### Optimization Toolkit
| Technique | When |
|-----------|------|
| Add indexes | Slow `WHERE`/`ORDER BY` |
| Partial indexes | Queries always filter on a value |
| Denormalize | Expensive multi-table JOINs |
| Materialized views | Heavy analytics queries |
| Pagination (`LIMIT`/`OFFSET` or keyset) | Large result sets |
| Read replicas | Read-heavy load |
| Partitioning | Tables > 100M rows |

</details>

---

## Extension Points

For advanced patterns not covered here, consider adding reference files:
- **Database-specific:** PostgreSQL vs MySQL vs SQLite variations
- **Advanced patterns:** Time-series, event sourcing, CQRS
- **ORM integration:** Prisma, TypeORM, SQLAlchemy
- **Monitoring:** Slow query logs, `pg_stat_statements`, query performance dashboards
