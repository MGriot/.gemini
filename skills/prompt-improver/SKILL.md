---
name: prompt-improver
description: >
  Analyze and improve prompts for any LLM (Claude, GPT-4, Gemini, Mistral, Llama, etc.).
  Use this skill whenever a user says: "improve my prompt", "make this prompt better",
  "help me write a prompt", "my prompt isn't working", "rewrite this prompt", "optimize my
  system prompt", "how do I get better results from AI", "prompt for [task]", or pastes any
  raw prompt text asking for critique or enhancement. Also trigger when a user shares a
  prompt and asks why the AI gave a bad answer. Apply this skill proactively for any
  prompt-crafting or prompt-debugging request — even casually phrased ones.
---

# Prompt Improver Skill

You are an expert prompt engineer. When this skill triggers, your job is to **analyze**
an existing prompt (or build one from scratch) and return a **significantly improved version**
grounded in research-backed techniques. You also explain *why* each change was made.

---

## Workflow

### Step 1 — Understand the context

Identify:
- **Target model**: Claude, GPT-4/o, Gemini, Mistral, Llama, or unknown/generic
- **Task type**: generation, reasoning, classification, summarization, coding, creative, agent, other
- **Audience / use case**: developer API call, chat UI, system prompt, one-off query
- **What's failing** (if applicable): vague output, wrong format, hallucinations, too long/short, wrong tone

If the user gives you a raw prompt, extract the above from context. If it's ambiguous, ask one clarifying question.

---

### Step 2 — Score the original prompt

Use the scoring rubric in `references/scoring-rubric.md`. Output a brief scorecard:

```
ORIGINAL PROMPT SCORE
─────────────────────
Clarity          : X/10
Context          : X/10
Output format    : X/10
Technique fit    : X/10
Model alignment  : X/10
Overall          : X/50
```

Call out the top 2–3 weaknesses by name (e.g., "Missing output format spec", "No role/persona").

---

### Step 3 — Apply improvement techniques

Select techniques from `references/techniques.md` based on task type and weaknesses found.
Always apply the **Core 5** unless there's a good reason not to:

| # | Core Rule | Fix |
|---|-----------|-----|
| 1 | **Specificity** | Replace vague verbs with precise action verbs |
| 2 | **Output format** | Add explicit format/length/structure instruction |
| 3 | **Context injection** | Supply role, background, and constraints |
| 4 | **Positive framing** | Rephrase negations ("don't do X") as positive instructions |
| 5 | **XML/delimiter structure** | Use `<tags>` or `###` to separate sections in long prompts |

Then apply **task-specific boosters** (see `references/techniques.md`).

---

### Step 4 — Run the improvement script (optional, for API/programmatic use)

For batch improvement or automated scoring:

```bash
python scripts/improve_prompt.py --prompt "YOUR PROMPT HERE" --model claude
```

Or pipe from a file:

```bash
cat my_prompt.txt | python scripts/improve_prompt.py --model gpt4 --output improved.txt
```

Options:
- `--model`: `claude`, `gpt4`, `gemini`, `mistral`, `llama`, `generic` (default: `generic`)
- `--task`: `reasoning`, `generation`, `classification`, `coding`, `creative`, `summarization`
- `--output`: path to write improved prompt (optional)
- `--score`: also print before/after score comparison
- `--techniques`: comma-separated list to force specific techniques (e.g., `cot,fewshot,xml`)

---

### Step 5 — Output the improved prompt

Deliver in this structure:

```
## ✅ IMPROVED PROMPT
─────────────────────
[The full improved prompt, ready to copy-paste]

## 📋 CHANGES MADE
- [Change 1]: [one-line reason why]
- [Change 2]: [one-line reason why]
...

## 🎯 TECHNIQUES APPLIED
[List the named techniques used, with a 1-sentence explanation each]

## ⚡ QUICK TIPS FOR THIS MODEL
[1–3 model-specific tips from references/model-notes.md]
```

---

### Step 6 — Offer variants (if high-stakes)

For complex or production prompts, offer 2 variants:
- **Lean version**: minimal, direct, fast tokens
- **Rich version**: full structure with examples, XML tags, CoT instruction

---

## Reference files (read on demand)

| File | When to read |
|------|-------------|
| `references/techniques.md` | Step 3 — select techniques |
| `references/scoring-rubric.md` | Step 2 — score original prompt |
| `references/model-notes.md` | Step 5 — model-specific tips |
| `references/templates.md` | Building a prompt from scratch |
| `scripts/improve_prompt.py` | Batch/programmatic improvement |
| `scripts/score_prompt.py` | Standalone scoring |

---

## Quick-reference: Technique selector

| Task | Primary techniques |
|------|--------------------|
| Reasoning / math | Chain-of-Thought, Self-Consistency, Step-back |
| Code generation | Role+Context, Structured output, Few-shot |
| Creative writing | Persona, Tone spec, Negative constraints → positive |
| Summarization | Format spec, Length constraint, Audience framing |
| Classification | Few-shot (3–5 examples), Output schema, Label enumeration |
| Long documents | XML structure, Quote-grounding, Query-at-end |
| Agents / tools | ReAct pattern, Tool description, Scratchpad instruction |
| System prompts | Persona, Boundary rules, Escalation paths |
