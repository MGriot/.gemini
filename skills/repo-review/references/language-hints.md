# Per-Language Hints

## Python

**Entry points:**
- `__main__.py` (module entry: `python -m package`)
- `main.py`, `app.py`, `run.py`
- `manage.py` (Django)
- `wsgi.py` / `asgi.py` (WSGI/ASGI server entry)

**Key patterns:**
- `__init__.py` defines a package — look here for what's exported
- `settings.py` / `config.py` — project configuration
- `models.py` — database models (Django/SQLAlchemy)
- `views.py` — HTTP handlers (Django)
- `serializers.py` — data serialization (DRF)
- `tasks.py` — Celery tasks
- `conftest.py` — pytest fixtures shared across tests

**Conventions:**
- `snake_case` for functions and variables
- `PascalCase` for classes
- `UPPER_CASE` for constants
- Underscored prefix `_name` = private by convention

**Common gotchas:**
- `requirements.txt` may not include dev deps — check `requirements-dev.txt`
- Virtual environment: `.venv/`, `venv/`, `env/`
- Type hints added gradually — absence doesn't mean untyped codebase

---

## JavaScript / TypeScript

**Entry points:**
- `index.js` / `index.ts` — library entry
- `main.js` / `main.ts` — app entry
- `app.js` / `server.js` — Express/Fastify server
- `src/` prefix common for source vs `dist/` for compiled

**Key files:**
- `package.json` → `"scripts"` key shows how to run, build, test
- `tsconfig.json` — TypeScript compiler config (check `paths` for aliases)
- `.env.example` — required env vars
- `next.config.js` — Next.js config

**Conventions:**
- `camelCase` functions/variables, `PascalCase` components/classes
- `types/` or `@types/` for type definitions
- `*.d.ts` = TypeScript declaration files (usually generated)

**Common gotchas:**
- `node_modules` can be huge — don't analyze it
- `dist/` or `build/` is compiled output — analyze `src/` instead
- ESM vs CommonJS: `"type": "module"` in package.json = ESM

---

## Go

**Entry points:**
- `cmd/<name>/main.go` — binary entry point
- `main.go` in root — simple programs

**Key files:**
- `go.mod` — module definition + dependencies
- `go.sum` — dependency checksums (don't edit manually)
- `internal/` — can only be imported by this module
- `pkg/` — intended for external consumption
- `*_test.go` — test files (co-located with source)

**Conventions:**
- No inheritance — composition via interfaces
- Errors returned as values: `func X() (Result, error)`
- `PascalCase` exported, `camelCase` unexported

**Common gotchas:**
- Generated code often in files ending in `_gen.go` — skip these
- `vendor/` = vendored deps copy (may be committed)
- Context (`context.Context`) is usually first arg in functions

---

## Rust

**Entry points:**
- `src/main.rs` — binary
- `src/lib.rs` — library (public API defined here)
- `src/bin/*.rs` — multiple binaries

**Key files:**
- `Cargo.toml` — package manifest
- `Cargo.lock` — lock file (commit for binaries, gitignore for libs)
- `build.rs` — build script (runs before compilation)

**Conventions:**
- `snake_case` everything except types (`PascalCase`)
- `mod.rs` or directory name = module
- `pub` = exported, absence = private

---

## Ruby

**Entry points:**
- `config/application.rb` (Rails)
- `app.rb` (Sinatra)
- `bin/rails`, `bin/rspec`, etc.

**Key files:**
- `Gemfile` — dependencies
- `Gemfile.lock` — locked versions
- `config/routes.rb` — Rails routing
- `db/schema.rb` — database schema
- `app/models/`, `app/controllers/`, `app/views/` — Rails MVC

---

## Java / Kotlin (Spring)

**Entry points:**
- Class with `public static void main` or `@SpringBootApplication`
- Usually named `Application.java` or `*Application.kt`

**Key files:**
- `pom.xml` — Maven config
- `build.gradle` — Gradle config
- `src/main/resources/application.yml` — Spring config
- `src/main/java/` — source
- `src/test/java/` — tests

**Conventions:**
- Package structure mirrors directory: `com.company.project.feature`
- `@Controller`, `@Service`, `@Repository` annotations = Spring layers

---

## How to Use These Hints

1. Identify the primary language from `dep_scanner.py` output
2. Look at the listed "key files" for that language — read them first
3. Follow the "entry point" to understand how the app starts
4. Use "conventions" to interpret naming and structure choices
5. Check "common gotchas" before drawing conclusions
