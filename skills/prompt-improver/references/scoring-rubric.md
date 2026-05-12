# Prompt Scoring Rubric

Score each dimension 1–10. Max total: 50.

---

## 1. Clarity (0–10)
Is the task unambiguously stated?

| Score | Meaning |
|-------|---------|
| 1–3 | Task is vague; model must guess intent |
| 4–6 | Task is partially clear; some ambiguity remains |
| 7–9 | Task is clear with minor room for interpretation |
| 10 | Task is crystal-clear with no ambiguity |

**Red flags**: Single-word prompts, missing verb, "write something about X", rhetorical questions

---

## 2. Context (0–10)
Does the prompt supply sufficient background?

| Score | Meaning |
|-------|---------|
| 1–3 | No role, no background, no constraints |
| 4–6 | Some context but missing audience/purpose |
| 7–9 | Good context; minor gaps |
| 10 | Full role + background + audience + constraints |

**Red flags**: No system prompt, no persona, no audience specification, no constraints given

---

## 3. Output Format (0–10)
Is the desired output format explicitly specified?

| Score | Meaning |
|-------|---------|
| 1–3 | No format specified at all |
| 4–6 | Partial format spec (e.g., "a list" but no length) |
| 7–9 | Clear format with most details |
| 10 | Complete spec: format + length + structure + examples |

**Red flags**: No mention of length, no schema for structured output, no example output

---

## 4. Technique Fit (0–10)
Are the right prompting techniques applied for this task type?

| Score | Meaning |
|-------|---------|
| 1–3 | Zero-shot on a complex task that needs examples/CoT |
| 4–6 | Some technique applied but not optimal |
| 7–9 | Good technique choice; minor improvements possible |
| 10 | Best-fit technique(s) perfectly applied |

**Common mismatches**:
- Classification without examples → needs few-shot
- Math/logic without step-by-step → needs CoT
- Long document task without structure → needs XML + query-at-end
- Creative task without tone/style spec → needs persona

---

## 5. Model Alignment (0–10)
Does the prompt leverage the target model's strengths?

| Score | Meaning |
|-------|---------|
| 1–3 | Generic prompt ignoring model-specific features |
| 4–6 | Somewhat aligned but missing model-specific optimizations |
| 7–9 | Good alignment; uses model-specific syntax/features |
| 10 | Fully optimized for the target model |

**Examples**:
- Claude: no XML tags used → -2 points
- GPT-4: not using system message → -3 points
- Gemini: not leveraging long context window → -1 point

---

## Score Interpretation

| Total | Grade | Action |
|-------|-------|--------|
| 40–50 | ✅ Excellent | Minor polish only |
| 30–39 | 🟡 Good | Apply 2–3 targeted fixes |
| 20–29 | 🟠 Fair | Major restructure needed |
| 10–19 | 🔴 Poor | Rebuild from template |
| 0–9  | ❌ Failing | Start over with a template |
