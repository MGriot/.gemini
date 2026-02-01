---
name: skill-creator-pro
description: Advanced skill for creating and refining Gemini CLI skills. Incorporates modern patterns like tool-gating, dynamic context injection, and agent-specific roles. Use when designing complex multi-step workflows or enterprise-grade skills.
---

# Skill Creator Pro

You are an expert at designing high-performance agentic skills. This skill extends the standard `skill-creator` with advanced patterns.

## Advanced Design Patterns (Inspired by Claude Code)

### 1. Dynamic Context Injection
Instead of static references, use scripts to inject live data into the context.
- **Pattern**: `references/status_check.md` should link to a script that runs `git status` or `ls -R`.
- **Guideline**: When the skill triggers, run a "reconnaissance" script to gather the current environment state (e.g., project structure, installed dependencies).

### 2. Tool-Gating & Guidance
Explicitly define which tools are "First Class Citizens" for this skill.
- **Example**: For a `test-expert` skill, `run_shell_command` and `read_file` are primary. `google_web_search` is secondary.
- **Guideline**: Add a "Preferred Tools" section in `SKILL.md` to help the agent prioritize actions.

### 3. Agentic Roles & Sub-agents
Skills should define if they are for **Planning**, **Execution**, or **Review**.
- **Execution fork**: If a task is risky, instruct the agent to use `delegate_to_agent` to run the task in an isolated mental model.
- **Quality Gates**: Mandate a "Review" phase using a different perspective (e.g., "Now, act as a Security Reviewer and audit the code you just wrote").

### 4. Slash Command Emulation
Structure skills so they can be "called" like functions.
- **Pattern**: Provide a list of "Triggers" that look like commands (e.g., `/bisect start`, `/bisect status`).
- **Guideline**: Use these triggers in the `description` and the `body` to create a predictable interface.

## Advanced Metadata (Proposed Extensions)
While Gemini CLI uses standard YAML, you can use these conventions for clarity:
- `user-invocable: true/false`: Should the user see this in help?
- `allowed-tools: [tool1, tool2]`: Recommendation for the agent.
- `priority: high`: Used when multiple skills overlap.

## Enhanced Creation Workflow
1. **The Recon Phase**: Use `run_shell_command` to explore the project.
2. **The Blueprint**: Create a `design.md` in the skill folder first.
3. **The Implementation**:
   - `scripts/`: For deterministic logic.
   - `references/`: For static knowledge.
   - `assets/`: For templates.
4. **The Validation**: Use `skill-creator/scripts/validate_skill.cjs`.

## Connectivity Patterns
Skills are stronger when they talk to each other.
- **Upstream/Downstream**: `prd-architect` (upstream) -> `git-bisector` (downstream).
- **Tool Integration**: A skill can "own" a tool (e.g., a Database skill owns the `query_db` tool instructions).
- **Cross-Reference**: Use markdown links between `SKILL.md` files (relative paths work if they are in the same directory).