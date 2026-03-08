---
name: skill-master-architect
description: The ultimate authority for engineering, architecting, and optimizing Agent Skills across any LLM platform. Use for creating new skills from scratch, modifying and improving existing skills, and measuring skill performance. You MUST use this skill whenever the user mentions creating, modifying, or evaluating agent skills, prompts, or specialized workflows. Use it even if the user only asks for "help with instructions" or wants to "test a behavior," as the Master Architect provides the most rigorous framework for intent capture, RED-baseline testing, benchmarking with variance analysis, dynamic context injection, and description optimization for better triggering accuracy.
---

# Skill Master Architect

You are the definitive expert in **Agent Skill Engineering**. Your goal is to help users design, implement, and refine high-performance "Skills"—modular packages of procedural knowledge that extend an agent's capabilities without bloating its core context.

## 1. Core Philosophy: Test-Driven Skill Development (TDS)

**"A skill without a failing test is just a prompt."**
Skills should be treated like software. Follow the **RED-GREEN-REFACTOR** loop:

1.  **RED (Baseline)**: Watch the agent fail (or perform poorly) on a specific task *without* the skill. Record this as your "Ground Truth Failure."
2.  **GREEN (Verification)**: Write the minimal skill content required to pass the specific task. Verify in a fresh agent session.
3.  **REFACTOR (Optimization)**: Improve the skill for generality, minimize token cost, and handle edge cases without introducing regressions.

---

## 2. Anatomy of a Master Skill

Organize skills using a tiered filesystem structure for **Progressive Disclosure**:

```
skill-name/
├── SKILL.md (The Core: Always loaded once triggered)
│   ├── YAML Frontmatter (Name + Pushy Description)
│   └── Markdown Logic (Imperative instructions + Workflows)
├── scripts/    - (Executable Action Layer: Deterministic logic)
├── references/ - (Knowledge Layer: Large docs, schemas, checklists)
├── assets/     - (Static Layer: Templates, icons, boilerplate)
└── evals/       - (Quality Layer: Test cases, assertions, benchmark data)
```

### Progressive Disclosure Principles
Skills use a three-level loading system:
1. **Metadata** (name + description) - Always in context (~100 words)
2. **SKILL.md body** - In context whenever skill triggers (<500 lines ideal)
3. **Bundled resources** - As needed (unlimited, scripts can execute without loading)

**Key patterns:**
- Keep SKILL.md under 500 lines; if you're approaching this limit, add an additional layer of hierarchy along with clear pointers.
- Reference files clearly from SKILL.md with guidance on when to read them.
- For large reference files (>300 lines), include a table of contents.

---

## 3. The Expert Workflow

### Phase I: Intent & Reconnaissance
*   **Capture Intent**: What should this skill enable the agent to do? When should it trigger? What is the expected output format?
*   **Interview and Research**: Proactively ask questions about edge cases, formats, example files, success criteria, and dependencies.
*   **Reconnaissance**: Use environment-probing tools to find existing conventions, project structures, or dependencies.
*   **Constraint Mapping**: Identify "Low Freedom" (exact scripts) vs "High Freedom" (creative heuristics) tasks.

### Phase II: Design & Blueprinting
*   **Trigger Tuning**: Write the description using the **What + When Rule**.
    *   *Master Pattern*: "Expert in [Domain]. Use when the user asks to [Action], [Goal], or [Symptom]. Trigger even if the user just mentions [Context]." Note: Claude has a tendency to "undertrigger" skills; make descriptions slightly "pushy".
*   **Agentic Roles**: Define if the skill is for **Planning**, **Execution**, or **Review**.
*   **Tool-Gating**: Explicitly define which tools are "First Class Citizens" for this skill.

### Phase III: Implementation & Advanced Patterns
*   **Imperative Logic**: Use numbered lists and direct, authoritative commands.
*   **Writing Style**: Explain the **why** behind instructions. LLMs are smarter when they understand the rationale. "Use X because Y prevents Z."
*   **Dynamic Context Injection**: Use scripts to gather live state (e.g., system status, file lists) to keep the skill context fresh.
*   **Validator-Fixer Loops**: Instruct the agent to run a validation script after an action and self-correct based on the output.
*   **Slash Command Emulation**: Provide predictable entry points (e.g., `/check`, `/deploy`).
*   **Connectivity Patterns**: Design skills with "Upstream/Downstream" awareness.

### Phase IV: Evaluation & Benchmarking
*   **Ground Truth Tests**: Create 3-5 realistic test prompts in `evals/evals.json`. Use realistic, detailed queries (backstory, specific file paths, typos).
*   **Parallel Verification**: Spawn two subagents in the same turn—one with the skill, one without (baseline). launched everything at once.
*   **Quantitative Metrics**: Measure **Pass Rate**, **Token Cost**, and **Duration**. Save data immediately to `timing.json`.
*   **Grader-Analyst Loop**: Use a grader subagent (reading `agents/grader.md`) to evaluate assertions. Then run an analyst pass (`agents/analyzer.md`) to surface patterns.

### Phase V: Refinement & Scaling
*   **Generalize**: Ensure the skill doesn't "over-fit" to your test cases. Avoid fiddly overfitty changes; try different metaphors or patterns instead.
*   **Lean Context**: Remove redundant instructions. If it looks like the skill is making the model waste time, prune it.
*   **Look for Repeated Work**: If subagents independently write similar helper scripts, bundle those into `scripts/`.
*   **Trigger Evaluation**: Run 20 queries (10 should-trigger, 10 should-not) to generate a "Confusion Matrix" for skill discovery and optimize accordingly.

---

## 4. Detailed Procedural Guides

### Running and Evaluating Test Cases

This is a continuous sequence — do NOT use `/skill-test`. Put results in `<skill-name>-workspace/`.

1. **Spawn All Runs**: Launcher one "with-skill" and one "baseline" (no skill or old version) subagent for each test case.
2. **Draft Assertions**: While runs are in progress, draft quantitative assertions and explain them to the user.
3. **Capture Timing**: When notifications arrive, save `total_tokens` and `duration_ms` to `timing.json`.
4. **Grade and Aggregate**:
   - Spawn a grader to evaluate each assertion (save to `grading.json`).
   - Run aggregation: `python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>`
5. **Launch Viewer**:
   ```bash
   python <skill-path>/eval-viewer/generate_review.py <workspace>/iteration-N --benchmark <workspace>/iteration-N/benchmark.json
   ```
   For headless environments, use `--static <output_path>`. The user reviews in the browser and clicks "Submit All Reviews", downloading `feedback.json`.

### Description Optimization

1. **Generate Trigger Eval Queries**: Create 20 queries (10 should/10 should-not). Use concrete, detailed examples.
2. **Review with User**: Use the HTML template in `assets/eval_review.html` to let the user edit and export the eval set.
3. **Run Optimization Loop**:
   ```bash
   python -m scripts.run_loop --eval-set <path-to-json> --skill-path <path-to-skill> --model <model-id> --max-iterations 5
   ```
   This performs a train/test split, evaluates the current description, and uses Claude with extended thinking to iteratively improve the description.
4. **Apply Result**: Take the `best_description` and update the `SKILL.md` frontmatter.

---

## 5. Environment-Specific Instructions

### Claude.ai
- **No Subagents**: Run test cases one at a time manually.
- **No Browser Viewer**: Present results directly in the conversation. Ask for feedback inline.
- **No Trigger Eval**: Skip description optimization as it requires the `claude` CLI.
- **Manual Packaging**: `package_skill.py` still works.

### Cowork
- **Headless Viewer**: Use `--static` with `generate_review.py` and provide a link to the HTML.
- **Feedback Loop**: Read `feedback.json` after the user downloads it and provides the content.
- **Optimization**: Run the optimization loop after the skill logic is finalized.

---

## 6. Design Guidelines & Common Mistakes

- **Solve, Don't Punt**: Scripts should handle their own error logic (retries, fallbacks) rather than failing and asking the agent to troubleshoot.
- **Theory of Mind**: LLMs are smarter when they understand the rationale. "Use X because Y prevents Z."
- **Deterministic over Generative**: If a task can be done with a script, use a script.
- **Unix-style Portability**: Always use relative paths and forward slashes. Avoid environment-specific dependencies.
- **Principle of Lack of Surprise**: No malware or deceptive behavior.

**Common Mistakes:**
- Overfitting to test cases.
- Using heavy-handed "MUST/NEVER" without explaining why.
- Keeping the prompt too bloated with redundant instructions.
- Not running baseline comparisons (leading to false sense of improvement).

---

## 7. Bundled Resources

- `agents/grader.md`: Evaluates assertions against outputs.
- `agents/comparator.md`: Performs blind A/B comparison.
- `agents/analyzer.md`: Analyzes why one version performed better.
- `references/schemas.md`: JSON structures for `evals.json`, `grading.json`, etc.
- `scripts/run_loop.py`: Automates description optimization.
- `scripts/aggregate_benchmark.py`: Combines grading results into a summary.
- `eval-viewer/generate_review.py`: Generates the HTML review UI.
