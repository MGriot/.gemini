# Model-Specific Notes

Quick tips per major model family. Reference in Step 5 of the skill workflow.

---

## Claude (Anthropic)
**Context window**: Up to 200K tokens (Claude 3.x / 4.x)
**Strengths**: Long-context reasoning, nuanced instruction-following, XML parsing, extended thinking

### Tips
- ✅ Use XML tags (`<task>`, `<context>`, `<examples>`) — Claude is trained to parse them
- ✅ Use extended thinking / "think step by step" for hard reasoning tasks
- ✅ Put long documents BEFORE your query
- ✅ System prompt: define persona + rules + output format at the top
- ✅ Few-shot examples work best inside `<examples>` tags
- ❌ Avoid overly long system prompts that bury the task
- ❌ Avoid contradictory instructions across system/user turns

### Model string (latest, April 2026)
- `claude-opus-4-6` — most capable, slower
- `claude-sonnet-4-6` — fast + capable, best default
- `claude-haiku-4-5-20251001` — fast + lightweight

---

## GPT-4 / GPT-4o (OpenAI)
**Context window**: 128K tokens (GPT-4o)
**Strengths**: Instruction following, tool use, multimodal, JSON mode

### Tips
- ✅ Always use a system message — GPT-4 gives it high weight
- ✅ Use `###` headers to separate sections in long prompts
- ✅ Enable `response_format: {"type": "json_object"}` for structured output
- ✅ For reasoning: "Let's think step by step" is highly effective
- ✅ GPT-4o handles images natively — describe what to focus on
- ❌ Don't put all context in the user turn; split between system/user

### o1 / o3 (Reasoning models)
- Minimal system prompt — model does internal CoT automatically
- Don't instruct CoT explicitly; just ask the question directly
- Set `reasoning_effort: "high"` for hard tasks

---

## Gemini (Google)
**Context window**: 1M tokens (Gemini 1.5 / 2.0)
**Strengths**: Massive context, multimodal, code

### Tips
- ✅ Leverage the huge context window — throw in full documents
- ✅ Use explicit section headers for long prompts
- ✅ Great at structured output with a clear schema
- ✅ For multi-modal: describe what aspect to analyze in the image
- ❌ No persistent memory across sessions — inject relevant context each time
- ❌ Less reliable with very complex nested XML compared to Claude

---

## Mistral (Mistral AI)
**Context window**: 32K–128K tokens (Mistral Large/Medium)
**Strengths**: Efficient, good at code, French/multilingual

### Tips
- ✅ Clear, direct instructions work best — less verbose than Claude
- ✅ Use `[INST]` / `[/INST]` markers in raw API calls (chat template)
- ✅ Strong at code — provide language and context explicitly
- ✅ Use few-shot examples for classification tasks
- ❌ Less robust with very long system prompts vs. Claude/GPT-4

---

## Llama 3 / 3.1 (Meta, open-source)
**Context window**: 8K–128K tokens depending on variant
**Strengths**: Open-source, customizable, good for fine-tuning

### Tips
- ✅ Use the correct chat template: `<|begin_of_text|>`, `<|user|>` etc.
- ✅ Keep system prompts concise and direct
- ✅ Few-shot examples strongly improve smaller model performance
- ✅ Chain-of-thought helps significantly — models are less capable zero-shot
- ❌ Smaller variants (8B) need more structured prompts than large models
- ❌ Less instruction-tuned by default; add more constraints

---

## Generic / Unknown Model
When the target model is unknown, use the safest universal defaults:
- Clear role + task + output format
- Positive framing only
- Few-shot examples for structured tasks
- "Think step by step" for reasoning
- Avoid model-specific syntax
- Keep system prompt under 500 words
