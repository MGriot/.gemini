# Skills Registry & Synergy Guide

An overview of the specialized agent skills in this directory and how to combine them.
These skills are portable: they work in Claude Code (`~/.claude/skills/`) and Gemini CLI
(`~/.gemini/skills/`).

**42 skills.** Every skill is a directory containing a `SKILL.md` with YAML frontmatter
(`name`, `description`, optional `allowed-tools`). The `name` always matches its directory.

---

## 🗂️ Skill Catalog

### 🏗️ Strategy, Planning & Project Management
| Skill | Use for |
|---|---|
| `ralph-manager` | Autonomous PM. Atomic tasks, strict turn-taking, Quality Gate before every commit. |
| `prd-architect` | Product Requirements Documents. PM + Principal Engineer dual role, 85% understanding threshold. |
| `project-strategist` | Non-software projects: events, launches, marketing campaigns, logistics. RACI + critical path. |
| `brainstorming` | Turning a vague idea into a validated design **before** implementation. |
| `workflow-architect` | Machine-readable, executable process definitions with branching, retries, and approvals. |

### 💻 Languages & Frameworks
| Skill | Use for |
|---|---|
| `python-pro` | Modern Python: uv, ruff, mypy strict, src-layout, pydantic, asyncio. |
| `react-best-practices` | React/Next.js performance rules from Vercel Engineering (57 rules, 8 categories). |
| `react-native-skills` | React Native + Expo: list performance, animations, native modules. |
| `shadcn-ui` | shadcn/ui component discovery, installation, theming, migration. |
| `shell-forge` | Bash/Zsh/POSIX sh/fish. Safety, error handling, portability analysis. |
| `latex-expert` | Typesetting, math, BibTeX, TikZ, chemistry, Python integration. |
| `markdown-expert` | GFM, CommonMark, Pandoc, Mermaid, frontmatter, linting. |

### 🎨 Design & UI
| Skill | Use for |
|---|---|
| `ui-ux-pro-max` | Design intelligence + auditing. 50 styles, 97 palettes, 57 font pairings, 9 stacks. |
| `stitch-design` | **Unified Google Stitch entry point** — prompt enhancement, `.stitch/DESIGN.md` synthesis, screen generation and editing, anti-generic taste rules. |
| `react-components` | Converting Stitch designs into modular Vite + React components with AST validation. |
| `stitch-loop` | Autonomous baton-passing loop for building a whole site with Stitch. |
| `remotion` | Walkthrough videos from Stitch projects — transitions, zooming, text overlays. |

### 🧪 Quality, Testing & Review
| Skill | Use for |
|---|---|
| `test-expert` | Test generation for Python (pytest), TS/JS (Vitest/Jest), Go. |
| `repo-review` | Holistic codebase comprehension, architecture mapping, audit. |
| `security-audit` | Vulnerability review, auth/rate-limiting/CORS, Docker and dependency safety. |
| `surgical-editor` | Atomic, zero-collateral-damage changes with a verification gate. |
| `webapp-testing` | Playwright-driven testing of local web apps, screenshots, browser logs. |

### 🛠️ Infrastructure & Data
| Skill | Use for |
|---|---|
| `docker-expert` | Dockerfiles, image size, build failures, compose, production hardening. |
| `database-schema-designer` | SQL/NoSQL modeling, normalization, indexing, migrations, multi-tenancy. |
| `mcp-architect` | MCP servers/clients, FastMCP, dynamic tooling, security and testing. |
| `data-science-pro` | EDA, statistics, chemometrics (PCA/PLS), visualization, data storytelling. |
| `powerbi-expert` | DAX, Power Query M, star schema, themes, RLS, VertiPaq performance. |

### 🔄 Version Control
| Skill | Use for |
|---|---|
| `git-pro` | All git + `gh` operations: semantic commits, worktrees, rebase, bisect, secret protection. |

### 📄 Documents & Files
| Skill | Use for |
|---|---|
| `docx` | Word documents — create, read, edit, tracked changes, comments. |
| `xlsx` | Spreadsheets — .xlsx/.xlsm/.csv/.tsv, formulas, charts, data cleaning. |
| `pptx` | Presentations — decks, templates, layouts, speaker notes. |
| `pdf` | PDFs — extract, merge, split, forms, encryption, OCR. |

### ✍️ Writing & Research
| Skill | Use for |
|---|---|
| `writing-clearly-and-concisely` | Strunk's rules + AI-tell removal for any prose humans will read. |
| `repo-doc-expert` | Diátaxis-framework project docs: README, CONTRIBUTING, CHANGELOG, SECURITY. |
| `wikipedia-expert` | Deep research and fact-verification across the Wikimedia ecosystem. |
| `wiki-builder` | Zettelkasten wiki from raw PDFs/images/markdown; synthesis and lint. |

### 🧠 Meta (Prompts & Skills)
| Skill | Use for |
|---|---|
| `skill-master-architect` | Creating, modifying, and benchmarking agent skills. RED-baseline testing. |
| `prompt-improver` | Critiquing and rewriting prompts for any LLM. |

### 🎲 Personal & Domain
| Skill | Use for |
|---|---|
| `travel-designer-pro` | Trip planning → mobile Trip Hub HTML with GPX, verified coordinates, security briefing. |
| `game-assistant` | Board/card/RPG/video games: rules, strategy, player aids, guides, translation. |
| `caveman` | Ultra-terse response mode. Explicit opt-in only — never auto-activates. |

---

## ⚡ Power Synergies

### 1. Quality-First Development Loop
`ralph-manager` → `test-expert` → `python-pro` (or `react-best-practices`) → `git-pro`

> "Use Ralph to manage this task. Have Test Expert define the quality gate first, then
> implement with the language skill, and commit with git-pro."

### 2. Idea → Shipped Feature
`brainstorming` → `prd-architect` → `database-schema-designer` → `ui-ux-pro-max` → `ralph-manager`

> "Brainstorm the design, turn it into a PRD, model the data, spec the UI, then execute."

### 3. Design-to-Code Pipeline
`stitch-design` → `react-components` → `ui-ux-pro-max` → `webapp-testing`

> "Generate the screens in Stitch, convert them to React components, audit the result
> against the Web Interface Guidelines, then verify it in a real browser."

### 4. Codebase Onboarding & Hardening
`repo-review` → `security-audit` → `surgical-editor` → `repo-doc-expert`

> "Understand the project, audit it for vulnerabilities, fix the findings surgically
> without collateral damage, then document what changed."

### 5. Scientific Research Suite
`data-science-pro` → `latex-expert` → `markdown-expert`

> "Analyze the dataset, typeset the paper in LaTeX, draft the web summary in Markdown."

### 6. Infrastructure Stack
`database-schema-designer` → `mcp-architect` → `docker-expert` → `security-audit`

> "Design persistence, implement the MCP server, containerize it, then harden it."

### 7. Bug Hunt
`test-expert` → `git-pro` (bisect) → `surgical-editor`

> "Write a failing reproduction, bisect to the regression commit, then fix it surgically."

### 8. Documentation Polish
`repo-doc-expert` → `markdown-expert` → `writing-clearly-and-concisely`

> "Structure the docs with Diátaxis, format them correctly, then strip the AI tells."

---

## 🚀 Using Skills

**Claude Code** — skills live in `~/.claude/skills/<name>/SKILL.md`. They load automatically
based on the `description` field, so just describe your task in context
(*"I need a LaTeX formula"*, *"let's plan the PRD"*). Invoke one explicitly with `/<name>`.
Run `/skill-doctor` to check that a skill's description triggers reliably.

**Gemini CLI** — skills live in `~/.gemini/skills/`. Reload with `/skills reload`,
list with `/skills list`.

### Writing or editing a skill

Use `skill-master-architect`. The essentials:

- `name` must be lowercase, hyphen-separated, and **identical to the directory name**.
  A colon or underscore makes the skill fail to load.
- `description` is the only thing the model sees before deciding to load the skill —
  put concrete trigger phrases in it, not a summary of the contents.
- Keep `SKILL.md` under ~500 lines. Push detail into `references/`, `workflows/`,
  `scripts/`, and `examples/`, and link to them.
- `allowed-tools` is a whitelist. Omit it unless the skill genuinely needs sandboxing —
  an incomplete list silently strips tools the skill needs. Tool names are
  platform-specific (`WebFetch` on Claude, `web_fetch` on Gemini); list both for portability.
