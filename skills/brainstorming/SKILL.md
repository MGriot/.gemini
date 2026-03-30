---
name: brainstorming
description: "Use this skill when the user wants to design, plan, or think through a non-trivial feature, component, system, or behavior change before writing code. Trigger on phrases like 'I want to build', 'let's add', 'how should I design', 'help me think through', 'I'm thinking of adding', or whenever a request involves enough unknowns that jumping straight to implementation would be premature. Skip for obvious one-liner fixes or purely mechanical tasks."
---

# Brainstorming Ideas Into Designs

Turn vague ideas into validated, documented designs through structured collaborative dialogue — before a single line of code is written.

---

## Phase 0 — Read Context First (Silent Step)

Before asking anything, orient yourself:

```
Read in this order:
1. README or docs/README — understand the project's purpose and tech stack
2. docs/plans/ or docs/architecture/ — any prior design decisions
3. Recent git log (last 5–10 commits) — understand current momentum
4. The file(s) most likely affected by the proposed change
```

Extract from this reading:
- **Tech stack** (language, framework, DB, infra)
- **Existing patterns** (how similar features are currently built)
- **Constraints** (anything that narrows the solution space)

Do not summarize this to the user. Use it silently to ask better questions.

---

## Phase 1 — Understand the Idea

Ask one question per message. Wait for the answer before asking the next.

**Question order (adapt as needed):**

1. **Purpose** — Why does this need to exist? What problem does it solve for which user?
2. **Success criteria** — How will you know when this is done and working correctly?
3. **Scope boundaries** — What is explicitly out of scope for this version?
4. **Constraints** — Any performance, security, backwards-compatibility, or deadline requirements?
5. **Edge cases** — What are the failure modes? What happens when inputs are invalid or the network is down?

**Question style:**
- Prefer multiple-choice when the answer space is bounded:
  > "Should this be synchronous (user waits) or asynchronous (job runs in background)?"
  > a) Synchronous — simpler, but blocks the UI
  > b) Asynchronous — better UX, more infrastructure
  > c) Not sure — let's discuss
- Use open-ended only when the answer is genuinely unconstrained.

**When to stop questioning:** Move to Phase 2 when you can answer all of these:
- [ ] What is being built and why
- [ ] Who uses it and how
- [ ] What the happy path looks like end-to-end
- [ ] At least one non-obvious failure mode
- [ ] What is explicitly not included

---

## Phase 2 — Explore Approaches

Propose exactly **2–3 approaches**. No more.

For each approach, state:
- **Name** (one short label, e.g. "Polling", "Webhooks", "Event Bus")
- **How it works** (2–3 sentences)
- **Tradeoffs** across these dimensions:
  - Complexity (implementation effort, operational burden)
  - Performance / scalability
  - Maintainability
  - Time to ship

Then give your **recommendation** and the single most important reason for it.

> ✅ Lead with your recommendation: "I'd go with Option B because..."  
> ❌ Don't present all options neutrally and make the user choose blindly.

**YAGNI checkpoint:** Before finalizing approaches, explicitly ask:
> "Is there anything in this design we're adding 'just in case' that we don't need for this version?"
Remove anything that doesn't serve the stated success criteria.

---

## Phase 3 — Present the Design

Present the design in sections of **200–300 words each**, in this order:

1. **Summary** — One paragraph: what this is, what it does, what it does not do.
2. **Architecture / Component Overview** — How the pieces fit together. Include a simple text diagram if helpful.
3. **Data Model / API Contract** — Key data structures, schemas, or API endpoints. Concrete field names and types.
4. **Control Flow** — Step-by-step description of the happy path, then the primary error path.
5. **Error Handling & Edge Cases** — What can fail, how it's detected, and how it recovers.
6. **Testing Strategy** — Unit, integration, and/or E2E tests. What the test inputs and expected outputs look like.

After each section, ask:
> "Does this section look right, or do you want to adjust anything before I continue?"

**Scope creep rule:** If the user adds new requirements during design, pause and say:
> "That sounds useful — should we add it to this design, or log it as a follow-up so we don't expand scope right now?"

---

## Phase 4 — Document and Hand Off

### Write the design document

```
docs/plans/YYYY-MM-DD-<topic>-design.md
```

Structure it exactly as the sections above. Write in clear prose — no bullet soup.

Commit the file:
```bash
git add docs/plans/YYYY-MM-DD-<topic>-design.md
git commit -m "docs(plans): add design for <topic>"
```

### Hand off to implementation

Ask the user:
> "Ready to move to implementation? I can set up a structured implementation plan."

If they say yes:
- Check if a `writing-plans` or `prd-architect` skill is available and invoke it
- If not, create a `docs/plans/YYYY-MM-DD-<topic>-plan.md` with ordered implementation tasks, each scoped to a single, testable unit of work

---

## Key Principles

| Principle | What it means in practice |
|---|---|
| **One question at a time** | Never ask two questions in one message, even if they're related |
| **Multiple choice preferred** | Bounded options are faster to answer than blank fields |
| **YAGNI ruthlessly** | Before finalizing the design, explicitly cut anything not needed for this version |
| **Explore before deciding** | Always surface 2–3 approaches; never jump to implementation of the first idea |
| **Validate incrementally** | Present design in sections; don't dump the entire spec at once |
| **Control scope creep** | Name it explicitly when it happens; give the user a clear choice to include or defer |
| **Silent context read** | Gather project context before asking anything; don't make the user repeat themselves |
