# Common Project Structure Patterns

## Web Backend Patterns

### MVC (Model-View-Controller)
```
app/
├── models/       ← Data layer (ORM entities, DB schemas)
├── views/        ← Templates / response formatting
├── controllers/  ← Request handling logic
└── routes/       ← URL routing
```
**Seen in:** Rails, Django, Laravel, Express+MVC, Spring MVC  
**Key insight:** Follow data from route → controller → model → response

### Layered / Clean Architecture
```
src/
├── domain/       ← Core business logic (no deps on frameworks)
├── application/  ← Use cases / service layer
├── infrastructure/ ← DB, external APIs, messaging
└── presentation/ ← HTTP controllers, GraphQL resolvers
```
**Seen in:** NestJS, modern Spring, .NET Clean Arch  
**Key insight:** Dependencies point inward — domain knows nothing about infra

### Hexagonal / Ports & Adapters
```
src/
├── core/         ← Domain + application (the hexagon)
│   ├── domain/
│   └── ports/    ← Interfaces (input/output ports)
└── adapters/     ← Implementations (HTTP, DB, queues)
```
**Key insight:** Look for interface definitions in `ports/` and their implementations in `adapters/`

### Feature-sliced / Modular
```
src/
├── features/
│   ├── auth/         ← All auth-related code
│   ├── users/        ← All user-related code
│   └── payments/     ← All payment-related code
└── shared/           ← Truly cross-cutting utilities
```
**Seen in:** Large React apps, Django apps pattern, NestJS modules  
**Key insight:** Each feature is self-contained — look inside each feature folder for its own models/services/routes

---

## Frontend Patterns

### Component-based (React/Vue/Svelte)
```
src/
├── components/   ← Reusable UI pieces
├── pages/        ← Route-level components
├── hooks/        ← Custom logic hooks
├── store/        ← State management
└── utils/        ← Helpers
```

### Next.js / Nuxt.js
```
app/ or pages/    ← File-based routing (each file = a route)
components/       ← Shared components
lib/ or utils/    ← Shared logic
public/           ← Static assets served at /
```
**Key insight:** Routing is filesystem-based — `pages/api/` = API routes

---

## Monorepo Patterns

### Turborepo / Nx style
```
apps/
├── web/           ← Frontend app
├── api/           ← Backend service
└── mobile/        ← Mobile app
packages/
├── ui/            ← Shared component library
├── config/        ← Shared tooling config
└── types/         ← Shared TypeScript types
```
**Key insight:** `packages/` are internal libraries consumed by `apps/`

### Go-style
```
cmd/
├── server/        ← Main server binary
└── cli/           ← CLI tool
pkg/               ← Exported, reusable packages
internal/          ← Private packages (can't be imported externally)
```

---

## Microservices / Services
```
services/
├── auth-service/
├── user-service/
└── payment-service/
infra/             ← Docker, K8s, Terraform
proto/ or contracts/ ← API contracts (gRPC, OpenAPI)
```
**Key insight:** Each service is its own deployable unit — treat each subdirectory as a separate project

---

## Library / Package
```
src/ or lib/       ← The library code itself
examples/ or demo/ ← Usage examples
tests/ or spec/    ← Tests
docs/              ← Documentation
```
**Key insight:** The README usually explains the public API; look at `examples/` for how to use it

---

## CLI Tool
```
cmd/               ← Command definitions (cobra, click, commander)
├── root.go
└── subcommand.go
internal/ or lib/  ← Business logic
```
**Key insight:** Trace from command entry point → handler → core logic

---

## How to Identify the Pattern

1. Look at top-level directories — do they match any pattern above?
2. Check the primary framework (from dep_scanner) — it often dictates structure
3. Check the README for architecture notes
4. Look at the entry point and trace imports one level deep
5. If unsure, describe what you see without forcing a label
