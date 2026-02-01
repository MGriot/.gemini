# Gemini CLI: Skills Registry & Synergy Guide

This guide provides an overview of your specialized agent skills and how to combine them for high-performance autonomous workflows.

## 🗂️ Skill Catalog

### 🏗️ Management & Strategy
*   **`ralph-manager`**: The autonomous PM. Enforces Atomic Tasks and Quality Gates. Use for complex, multi-step projects.
*   **`prd-architect`**: Product management and full-stack architecture. Use to define new projects and PRDs.
*   **`project-strategist`**: Strategic planning and logistics. Use for marketing, business launches, or complex initiatives.
*   **`brainstorming`**: Creative ideation and requirement exploration. Use **before** implementation to refine intent.

### 💻 Development & Languages
*   **`python-pro`**: Modern Python development (uv, ruff, pydantic). Use for backend logic and data tools.
*   **`react-best-practices`**: Vercel-standard Next.js and React performance patterns.
*   **`react-native-skills`**: Mobile app performance and native module implementation.
*   **`latex-expert`**: Advanced typesetting for academic papers and complex formulas.
*   **`markdown-expert`**: GFM, CommonMark, and Pandoc mastery, including Mermaid diagrams.
*   **`ui-ux-pro-max`**: UI/UX design intelligence and auditing. Comprehensive design system builder + Web Interface Guidelines compliance auditor.

### 🧪 Quality & Testing
*   **`test-expert`**: High-quality test generation for Python, JS/TS, and Go.
*   **`writing-clearly-and-concisely`**: Strunkian audit for documentation, UI text, and reports.

### 🛠️ Infrastructure & DevOps
*   **`docker-expert`**: Containerization, Dockerfile optimization, and multi-container orchestration.
*   **`database-schema-designer`**: Scalable SQL/NoSQL modeling and migration patterns.
*   **`mcp-architect`**: Model Context Protocol (MCP) server/client design and debugging.

### 🔄 Git & Version Control
*   **`git-expert`**: Semantic commits, PR management, and repository automation.
*   **`git-bisector`**: Binary search logic to find the specific commit that introduced a bug.

### 🛠️ Meta (Skill Building)
*   **`skill-architect`**: Expert design of the `SKILL.md` structure and anatomy.
*   **`skill-creator-pro`**: Advanced patterns for tool-gating and context injection.
*   **`workflow-architect`**: Designing rigid, step-by-step agentic protocols and logic gates.
*   **`repo-doc-expert`**: Implementation of Diátaxis documentation (README, CONTRIBUTING, etc.).

---

## ⚡ Power Synergies (How to combine skills)

### 1. The "Quality-First" Development Loop
**Workflow:** `ralph-manager` → `test-expert` → `python-pro` (or `react-*`)
*   **How to use:** Tell the agent: *"Use Ralph to manage this task. Have the Test Expert define the quality gate first, then implement using the language-specific skill."*

### 2. The "Design-to-Docs" Pipeline
**Workflow:** `ui-ux-pro-max` → `repo-doc-expert` → `writing-clearly-and-concisely`
*   **How to use:** *"Build the UI components with UI/UX Pro, then use Repo-Doc Expert to structure the documentation and Writing Clearly to polish the tone."*

### 3. The "Scientific Research" Suite
**Workflow:** `data-science-pro` → `latex-expert` → `markdown-expert`
*   **How to use:** *"Analyze this dataset with Data Science Pro, draft the web summary with Markdown Expert, and typeset the final paper with LaTeX Expert."*

### 4. The "Infrastructure Architect" Stack
**Workflow:** `database-schema-designer` → `mcp-architect` → `docker-expert`
*   **How to use:** *"Design the persistence layer with Database Designer, implement the MCP server tools, and containerize the whole stack with Docker Expert."*

### 5. The "Bug Hunter" Workflow
**Workflow:** `test-expert` → `git-bisector` → `git-expert`
*   **How to use:** *"Use Test Expert to create a failing reproduction case, then use Git Bisector to find the regression commit, and Git Expert to fix it with a semantic commit."*

---

## 🚀 Getting Started

1.  **Reload:** After adding or changing skills, always run:
    ```bash
    /skills reload
    ```
2.  **Verify:** Check your active skills with:
    ```bash
    /skills list
    ```
3.  **Invoke:** You don't need special commands to trigger them; just mention the context (e.g., *"I need a LaTeX formula"* or *"Let's plan the PRD"*), and the agent will automatically activate the relevant skill.
