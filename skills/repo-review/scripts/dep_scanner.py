#!/usr/bin/env python3
"""
dep_scanner.py — Phase 2a: Dependency & Tech Stack Analysis
Parses manifest files to extract dependencies, frameworks, and runtime info.
Usage: python3 dep_scanner.py <PROJECT_ROOT>
"""

import os
import sys
import json
from pathlib import Path


def safe_read(path):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception:
        return ""


def parse_package_json(root):
    path = os.path.join(root, "package.json")
    if not os.path.exists(path):
        return None
    try:
        import json as j
        data = j.loads(safe_read(path))
    except Exception:
        return {"error": "Could not parse package.json"}

    deps = data.get("dependencies", {})
    dev_deps = data.get("devDependencies", {})

    # Detect frameworks
    frameworks = []
    if "react" in deps: frameworks.append("React")
    if "vue" in deps: frameworks.append("Vue.js")
    if "svelte" in deps: frameworks.append("Svelte")
    if "@angular/core" in deps: frameworks.append("Angular")
    if "next" in deps: frameworks.append("Next.js")
    if "nuxt" in deps: frameworks.append("Nuxt.js")
    if "express" in deps: frameworks.append("Express")
    if "fastify" in deps: frameworks.append("Fastify")
    if "koa" in deps: frameworks.append("Koa")
    if "hapi" in deps or "@hapi/hapi" in deps: frameworks.append("Hapi")
    if "nestjs" in deps or "@nestjs/core" in deps: frameworks.append("NestJS")
    if "remix" in deps or "@remix-run/node" in deps: frameworks.append("Remix")
    if "astro" in deps: frameworks.append("Astro")
    if "electron" in deps: frameworks.append("Electron")

    return {
        "language": "JavaScript/TypeScript",
        "runtime": "Node.js",
        "package_manager": "npm/yarn/pnpm",
        "name": data.get("name"),
        "version": data.get("version"),
        "description": data.get("description"),
        "main": data.get("main"),
        "scripts": list(data.get("scripts", {}).keys()),
        "frameworks_detected": frameworks,
        "prod_deps_count": len(deps),
        "dev_deps_count": len(dev_deps),
        "prod_deps": deps,
        "dev_deps": dev_deps,
        "engines": data.get("engines", {}),
    }


def parse_python_manifest(root):
    result = {"language": "Python"}

    # pyproject.toml
    pp = os.path.join(root, "pyproject.toml")
    if os.path.exists(pp):
        try:
            import tomllib
        except ImportError:
            try:
                import tomli as tomllib
            except ImportError:
                tomllib = None

        content = safe_read(pp)
        result["manifest"] = "pyproject.toml"

        # Simple regex-based extraction if toml parser unavailable
        if tomllib:
            try:
                data = tomllib.loads(content)
                deps = data.get("project", {}).get("dependencies", [])
                result["prod_deps"] = deps
                result["python_requires"] = data.get("project", {}).get("requires-python", "")
                result["name"] = data.get("project", {}).get("name", "")
                result["build_backend"] = str(data.get("build-system", {}).get("build-backend", ""))
            except Exception:
                pass
        else:
            import re
            deps = re.findall(r'dependencies\s*=\s*\[(.*?)\]', content, re.DOTALL)
            if deps:
                result["prod_deps_raw"] = deps[0]

    # requirements.txt
    req = os.path.join(root, "requirements.txt")
    if os.path.exists(req):
        lines = [l.strip() for l in safe_read(req).splitlines()
                 if l.strip() and not l.startswith("#")]
        result["requirements_txt"] = lines
        result["manifest"] = result.get("manifest", "") + " requirements.txt"

    # Detect frameworks
    all_deps = " ".join(str(result.get("prod_deps", "")) + " " + str(result.get("requirements_txt", "")))
    frameworks = []
    if "django" in all_deps.lower(): frameworks.append("Django")
    if "flask" in all_deps.lower(): frameworks.append("Flask")
    if "fastapi" in all_deps.lower(): frameworks.append("FastAPI")
    if "tornado" in all_deps.lower(): frameworks.append("Tornado")
    if "aiohttp" in all_deps.lower(): frameworks.append("aiohttp")
    if "starlette" in all_deps.lower(): frameworks.append("Starlette")
    if "sqlalchemy" in all_deps.lower(): frameworks.append("SQLAlchemy")
    if "pydantic" in all_deps.lower(): frameworks.append("Pydantic")
    if "celery" in all_deps.lower(): frameworks.append("Celery")
    if "pytest" in all_deps.lower(): frameworks.append("pytest (testing)")
    result["frameworks_detected"] = frameworks

    if result.get("manifest"):
        return result
    return None


def parse_go_mod(root):
    path = os.path.join(root, "go.mod")
    if not os.path.exists(path):
        return None
    content = safe_read(path)
    lines = content.splitlines()
    module = ""
    go_version = ""
    requires = []
    in_require = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("module "):
            module = stripped[7:].strip()
        elif stripped.startswith("go "):
            go_version = stripped[3:].strip()
        elif stripped == "require (":
            in_require = True
        elif stripped == ")":
            in_require = False
        elif in_require and stripped:
            requires.append(stripped)
        elif stripped.startswith("require ") and not stripped.endswith("("):
            requires.append(stripped[8:].strip())
    return {
        "language": "Go",
        "module": module,
        "go_version": go_version,
        "dependencies": requires,
        "dep_count": len(requires)
    }


def parse_cargo_toml(root):
    path = os.path.join(root, "Cargo.toml")
    if not os.path.exists(path):
        return None
    content = safe_read(path)
    try:
        import tomllib
    except ImportError:
        try:
            import tomli as tomllib
        except ImportError:
            tomllib = None
    result = {"language": "Rust"}
    if tomllib:
        try:
            data = tomllib.loads(content)
            result["name"] = data.get("package", {}).get("name", "")
            result["version"] = data.get("package", {}).get("version", "")
            result["edition"] = data.get("package", {}).get("edition", "")
            result["dependencies"] = data.get("dependencies", {})
            result["dev_dependencies"] = data.get("dev-dependencies", {})
        except Exception:
            pass
    return result


def parse_gemfile(root):
    path = os.path.join(root, "Gemfile")
    if not os.path.exists(path):
        return None
    content = safe_read(path)
    import re
    gems = re.findall(r"gem\s+['\"]([^'\"]+)['\"]", content)
    ruby_version = ""
    rv = re.search(r"ruby\s+['\"]([^'\"]+)['\"]", content)
    if rv:
        ruby_version = rv.group(1)
    frameworks = []
    gems_lower = [g.lower() for g in gems]
    if "rails" in gems_lower: frameworks.append("Ruby on Rails")
    if "sinatra" in gems_lower: frameworks.append("Sinatra")
    if "grape" in gems_lower: frameworks.append("Grape")
    return {
        "language": "Ruby",
        "ruby_version": ruby_version,
        "gems": gems,
        "gem_count": len(gems),
        "frameworks_detected": frameworks
    }


def detect_databases(root):
    """Scan for database indicators across all manifests and config files."""
    databases = []
    content = ""
    for fname in ["package.json", "requirements.txt", "pyproject.toml", "go.mod",
                  "Gemfile", "pom.xml", "build.gradle"]:
        content += safe_read(os.path.join(root, fname))
    content_lower = content.lower()
    if any(k in content_lower for k in ["postgres", "psycopg", "pg ", "asyncpg"]): databases.append("PostgreSQL")
    if any(k in content_lower for k in ["mysql", "mariadb", "mysqlclient"]): databases.append("MySQL/MariaDB")
    if any(k in content_lower for k in ["sqlite", "sqlite3"]): databases.append("SQLite")
    if any(k in content_lower for k in ["mongodb", "mongoose", "pymongo"]): databases.append("MongoDB")
    if any(k in content_lower for k in ["redis", "ioredis", "aioredis"]): databases.append("Redis")
    if any(k in content_lower for k in ["elasticsearch", "opensearch"]): databases.append("Elasticsearch")
    if any(k in content_lower for k in ["cassandra", "astradb"]): databases.append("Cassandra")
    if any(k in content_lower for k in ["dynamodb", "ddb"]): databases.append("DynamoDB")
    if any(k in content_lower for k in ["firestore", "firebase"]): databases.append("Firebase/Firestore")
    if any(k in content_lower for k in ["supabase"]): databases.append("Supabase")
    if any(k in content_lower for k in ["prisma"]): databases.append("Prisma ORM")
    if any(k in content_lower for k in ["sequelize"]): databases.append("Sequelize ORM")
    if any(k in content_lower for k in ["drizzle"]): databases.append("Drizzle ORM")
    return databases


def main():
    if len(sys.argv) < 2:
        print("Usage: dep_scanner.py <PROJECT_ROOT>", file=sys.stderr)
        sys.exit(1)

    root = os.path.abspath(sys.argv[1])

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"  REPO REVIEW — Phase 2a: Dependency Scanner", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    manifests = {}

    npm = parse_package_json(root)
    if npm:
        manifests["node"] = npm

    py = parse_python_manifest(root)
    if py:
        manifests["python"] = py

    go = parse_go_mod(root)
    if go:
        manifests["go"] = go

    cargo = parse_cargo_toml(root)
    if cargo:
        manifests["rust"] = cargo

    gem = parse_gemfile(root)
    if gem:
        manifests["ruby"] = gem

    databases = detect_databases(root)

    result = {
        "manifests_found": list(manifests.keys()),
        "databases_detected": databases,
        "details": manifests
    }

    if not manifests:
        result["warning"] = "No recognized package manifests found. Project may use a custom build system."

    print(json.dumps(result, indent=2))
    print(f"\n  ✓ Dependency scan complete. Languages: {list(manifests.keys())}", file=sys.stderr)


if __name__ == "__main__":
    main()
