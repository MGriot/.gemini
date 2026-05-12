# Prompt Engineering Techniques Reference

All techniques are model-agnostic unless noted. Sorted by category.

---

## 🧱 Foundational Techniques

### Zero-Shot Prompting
Give a direct instruction with no examples. Good for simple, well-defined tasks.
```
Summarize the following article in 3 bullet points:
[ARTICLE]
```
**Best for**: Simple tasks where the model's base training suffices.
**Avoid for**: Complex domain-specific tasks, structured output tasks.

---

### Few-Shot Prompting (3–5 examples)
Provide labeled input→output pairs before the actual task. Most impactful single technique.
```
Classify the sentiment:

Input: "The food was cold and the waiter was rude."
Output: NEGATIVE

Input: "Best pizza I've ever had!"
Output: POSITIVE

Input: "It was fine, nothing special."
Output: NEUTRAL

Now classify:
Input: "The ambiance was lovely but the service left much to be desired."
Output:
```
**Best for**: Classification, extraction, structured output, translation, formatting tasks.
**Tips**: Use 3–5 diverse examples. Vary the order to prevent pattern overfitting. Wrap in `<examples>` tags for Claude.

---

### Chain-of-Thought (CoT)
Ask the model to reason step-by-step before answering.

**Zero-shot CoT**: Append `"Think step by step."` or `"Let's work through this carefully."`

**Few-shot CoT**: Include examples that show intermediate reasoning:
```
Q: A store sells 150 items/day, 6 days/week. Items sold in 4 weeks?
A: Weekly items = 150 × 6 = 900. Over 4 weeks: 900 × 4 = 3,600. Answer: 3,600.

Q: [NEW QUESTION]
A:
```
**Best for**: Math, logic, multi-step reasoning, decision-making.
**Research note**: Appending "Let's think step by step" improves accuracy 40–76% on reasoning tasks.

---

### Role / Persona Prompting
Assign a specific expert role before the task.
```
You are a senior data scientist with 10+ years of experience in NLP.
Explain transformer attention mechanisms to a junior developer.
```
**Best for**: All tasks that benefit from a specific expertise, tone, or perspective.
**Tips**: Be specific about seniority, domain, and audience. Combine with context.

---

### Self-Consistency
Run CoT multiple times (or instruct the model to show multiple approaches), then pick the most consistent answer. Useful in APIs — call at temperature 0.7 × 3-5 times, vote on final answer.
**Best for**: High-stakes reasoning tasks where accuracy is critical.

---

### Tree of Thoughts (ToT)
Ask the model to explore multiple reasoning branches before committing.
```
Consider at least 3 different approaches to solve this. For each, evaluate pros/cons.
Then recommend the best approach with justification.
```
**Best for**: Complex problem-solving, architecture decisions, creative tasks with many valid paths.

---

## 🏗️ Structure Techniques

### XML / Delimiter Tagging
Separate logical sections with XML tags or `###`. Prevents the model from mixing instructions with data.
```xml
<system>You are a helpful customer service agent for Acme Corp.</system>

<context>
The customer purchased a product on 2024-12-01. Order #: 99283.
</context>

<task>
Reply to the customer's message below. Be empathetic and offer a solution.
</task>

<customer_message>
My order still hasn't arrived after 3 weeks. I'm very frustrated.
</customer_message>
```
**Best for**: Complex system prompts, multi-part tasks, API calls.
**Note**: Claude responds especially well to XML tags. GPT-4 responds well to `###` headers.

---

### Output Format Specification
Explicitly declare the desired output structure.
```
Respond ONLY with a JSON object using this schema:
{
  "summary": "<2 sentences>",
  "sentiment": "POSITIVE | NEUTRAL | NEGATIVE",
  "confidence": <0.0–1.0>,
  "keywords": ["<word1>", "<word2>", "<word3>"]
}
Do not include any explanation outside the JSON.
```
**Best for**: API integration, structured data extraction, classification.
**Tip**: Include `"Respond ONLY with..."` to suppress prose wrapping.

---

### Prompt Chaining
Break complex tasks into sequential prompts. Each output feeds the next.
```
Step 1: "Extract all action items from the meeting notes below."
Step 2: "Categorize the action items by owner from: [Step 1 output]"
Step 3: "Write a follow-up email template for each owner: [Step 2 output]"
```
**Best for**: Multi-stage workflows, long pipelines, agentic tasks.
**Tip**: Include validation step between chains: "Review and confirm the list above is complete before proceeding."

---

### Query-at-End (for long documents)
When providing long context, put instructions/query AFTER the document, not before.
```
[Long document here — 5,000 words]

Based on the document above, answer this question:
[QUESTION]
```
**Research note**: Queries at the end improve response quality by ~30% for long-context tasks.

---

### Positive Framing
Replace "don't do X" instructions with "do Y instead."
```
❌ "Don't use technical jargon."
✅ "Use plain language suitable for a non-technical audience."

❌ "Don't write more than 3 paragraphs."
✅ "Limit your response to exactly 3 concise paragraphs."
```
**Research note**: LLMs process negated instructions 20–30% less reliably than positive ones.

---

## 🚀 Advanced Techniques

### ReAct Pattern (Reasoning + Acting)
For agents with tools. Instruct the model to think → act → observe in a loop.
```
You have access to: [search], [calculator], [read_file].

For each step, output:
Thought: [what you're thinking]
Action: [tool_name]("[input]")
Observation: [result of action]
...
Final Answer: [your answer]
```

---

### Meta-Prompting
Ask the model to improve its own prompt or generate a better prompt for a task.
```
I want to ask an LLM to [TASK]. Write me an optimized prompt to achieve this.
The prompt should include: role, context, task, output format, and constraints.
```

---

### Step-Back Prompting
Before answering, ask the model to identify the underlying principle or category.
```
Before answering, first identify: what category of problem is this?
What general principles apply? Then apply those principles to answer.
```
**Best for**: Complex questions where the model needs to "zoom out" first.

---

### Calibrated Confidence
Ask the model to flag its own uncertainty.
```
After each claim, rate your confidence: [HIGH / MEDIUM / LOW].
For LOW confidence claims, note what information would resolve the uncertainty.
```

---

### Scratchpad Instruction
Give the model a scratchpad section before the final answer.
```
Use a <scratchpad> section for your working, then provide a clean <answer>.
```
**Note**: For Claude, extended thinking handles this natively. For other models, explicit scratchpad instruction improves reasoning quality.

---

### Retrieval-Augmented Prompting (RAG-style)
Inject retrieved context and instruct the model to ground answers in it.
```
Use ONLY the following documents to answer the question. If the answer is not
in the documents, say "I don't know." Do not use outside knowledge.

<documents>
[DOC 1]
[DOC 2]
</documents>

Question: [QUESTION]
```

---

## 🌡️ Parameter Guidance (when you control the API)

| Setting | Value | Best for |
|---------|-------|----------|
| Temperature | 0.0–0.2 | Factual, deterministic, code, classification |
| Temperature | 0.4–0.6 | Business writing, structured tasks |
| Temperature | 0.7–0.9 | Creative writing, brainstorming |
| Top-p | 0.9–0.95 | Most tasks (leave default) |
| Max tokens | Set explicitly | Prevent runaway outputs |
| System prompt | Always use | Establishes persistent persona + rules |

---

## 🔬 Research-Backed Insights (2025)

- Few-shot improves consistency **40–60%** over zero-shot for structured tasks
- CoT improves accuracy **40–76 points** on reasoning benchmarks
- Queries at the end of long-context prompts improve quality **~30%**
- Role-based prompts reduce errors **~35%** in domain-specific tasks
- Structured JSON output reduces hallucination in data extraction tasks
- Prompt quality variations can create accuracy differences of **up to 76 points**
- Positive framing outperforms negative constraints by **20–30%**
