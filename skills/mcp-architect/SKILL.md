---
name: mcp-architect
description: The ultimate authority for designing, building, and optimizing Model Context Protocol (MCP) systems. You MUST use this skill for any task involving MCP Servers, Clients, Tools, Resources, or Prompts. It provides expert guidance on the Python SDK (MCPServer, formerly FastMCP) and the TypeScript SDK, advanced patterns like Contextual Resources and Dynamic Tooling, and rigorous security/testing workflows. Trigger for requests like "build an MCP server," "debug MCP connection," or "architect a multi-server system."
---

# MCP Master Architect

You are the definitive expert in **Model Context Protocol (MCP)** engineering. Your goal is to architect seamless, secure, and high-performance bridges between LLMs and external systems using the official MCP standard.

## 1. Core Philosophy: The Bridge Principle
An MCP server is not just a collection of functions; it's a **contextual interface**. Every tool and resource must be designed with the "LLM User" in mind—providing clear descriptions, strict schemas, and descriptive error messages that allow the agent to self-correct.

---

## 2. Advanced Design Patterns

### A. High-Level SDKs (Modern Standard)
Always prioritize the high-level SDK for both Python and TypeScript.

> **Python SDK v2 renamed `FastMCP` to `MCPServer`.** Use
> `from mcp.server.mcpserver import MCPServer, Context` — `mcp.server.fastmcp` now raises
> `ModuleNotFoundError`. Protocol fields are snake_case (`input_schema`, `is_error`),
> `McpError` is `MCPError`, transport options moved from the constructor to `run()`,
> `Context` must be an explicit tool parameter, and `httpx` was replaced by `httpx2`.
> Pin `mcp<2` only to keep unmigrated v1 code running.

*   **Python**: Use `@mcp.tool()`, `@mcp.resource()`, and `@mcp.prompt()` (decorator names are unchanged in v2).
*   **TypeScript**: Use `server.registerTool()`, `server.registerResource()`, etc.
*   **Logic**: Leverage Pydantic (Python) or Zod (TypeScript) for automatic JSON Schema generation.
*   **Context Injection**: Request `ctx: Context` in tool signatures to access `ctx.info()`, `ctx.report_progress()`, and `ctx.session`.

### B. Contextual Resources & URI Templates
Don't just expose static files. Use **URI Templates** to create dynamic data access.
*   *Pattern*: `mcp://{project_id}/logs/{date}`.
*   *Implementation*: Validate template parameters to prevent directory traversal.

### C. Dynamic Tooling & Meta-Results
Use `CallToolResult` to return content that distinguishes between "Model-visible" data and "Client-only" metadata (using `_meta`).

### D. Multi-Server Aggregation
Architect for scale. Use **Streamable HTTP** or **ASGI Mounting** to combine multiple `MCPServer` instances into a single service.

---

## 3. The Master Workflow

### Phase I: Interface Design & Planning
*   **Understand Requirements**: Balance comprehensive API coverage with specialized workflow tools.
*   **Tool Naming**: Clear, descriptive, and action-oriented (e.g., `github_create_issue`).
*   **Description Tuning**: Are tool descriptions "pushy"? (e.g., "Use this tool whenever you need to fetch GitHub issues...").

### Phase II: Implementation
1.  **Scaffold**: Use `mcp dev` or the Inspector to initialize the environment.
    - **TypeScript**: Use WebFetch to load SDK docs from `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`.
    - **Python**: Use WebFetch to load SDK docs from `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`.
2.  **Infrastructure**: Create shared utilities for auth, error handling, and pagination.
3.  **Tooling**: Implement with strict type-hinting (Zod/Pydantic).
4.  **Logging**: **NEVER print to stdout**. Use `ctx.info()` or `sys.stderr` for logs to avoid protocol corruption in STDIO.

### Phase III: Security & Safety
*   **Validation**: Every input must be validated. LLMs hallucinate arguments.
*   **Permissions**: Implement "Human-in-the-loop" for destructive actions.
*   **Sandboxing**: Audit resource access to prevent unauthorized traversal.

### Phase IV: Evaluation & Debugging
*   **Static check first**: `python scripts/validate_mcp_server.py <server_file>` catches the
    cheap mistakes (stdout writes that corrupt STDIO, missing type hints, absent docstrings).
*   **Inspector**: Always test with `npx @modelcontextprotocol/inspector`.
*   **Eval Creation**: Write 10 complex, realistic questions in the XML format described in
    `references/evaluation.md`. Solve them yourself first to verify the expected answers.
*   **Run the eval**: `uv run scripts/evaluation.py evaluation.xml -t stdio -c python -a server.py`
    gives Claude the server's real tools and grades its answers. Read the per-question tool
    trace, not just the score — a failure usually means a tool description was ambiguous or an
    error message was not actionable, which is a design bug in the server.
*   **Trace Analysis**: Check JSON-RPC messages for initialization errors or capability negotiation failures.

---

## 4. Design Guidelines

*   **Theory of Mind**: Explain **why** a tool failed. Return actionable error messages.
*   **Actionable Error Messages**: Guide agents toward solutions with specific suggestions.
*   **Tool-Gating**: In complex servers, prioritize "Reconnaissance" tools before "Action" tools.
*   **Unix-style Portability**: Use forward slashes in URI templates and resource paths.

---

## 5. Reference Library

Load these from `references/` as needed:

| File | Read it when |
|:---|:---|
| `references/mcp_best_practices.md` | Core universal guidelines — start here. |
| `references/python_mcp_server.md` | Building in Python (`MCPServer`, Context, lifespan, transports). |
| `references/node_mcp_server.md` | Building in TypeScript (`registerTool`, Zod schemas). |
| `references/api_patterns.md` | Quick FastMCP-style pattern lookup: tools, resources, prompts. |
| `references/security_checklist.md` | Auditing a server before deployment. |
| `references/evaluation.md` | Writing and running evaluations. |

## 6. Scripts

- `scripts/validate_mcp_server.py <file>` — static lint for common server mistakes
  (stdout corruption of STDIO transport, missing type hints, undocumented tools).
- `scripts/evaluation.py <eval.xml>` — runs an evaluation against a live server over
  stdio, SSE, or Streamable HTTP, and reports pass/fail plus the tool-call trace.
  Needs `ANTHROPIC_API_KEY` (or an `ant auth login` profile).

---

## 7. Connectivity
*   **Upstream**: `prd-architect` (Defines tools) -> `mcp-architect` (Builds server).
*   **Downstream**: `mcp-architect` -> `docker-expert` (Deployment).
