# Prompt Templates

Copy-paste starting points for common task types.
Replace ALL-CAPS placeholders with your content.

---

## 🤖 System Prompt Template (API)
```
You are ROLE — BRIEF_DESCRIPTION.

Your responsibilities:
- RESPONSIBILITY_1
- RESPONSIBILITY_2
- RESPONSIBILITY_3

Always:
- RULE_1
- RULE_2

Respond in LANGUAGE. Keep answers TONE (e.g., concise, professional, friendly).
Format: PREFERRED_FORMAT.
```

---

## 📝 Generation / Writing Task
```
You are a EXPERT_ROLE with YEARS years of experience in DOMAIN.

Context: BACKGROUND_INFO

Task: Write a DOCUMENT_TYPE about TOPIC for AUDIENCE.

Requirements:
- Tone: TONE (e.g., professional, conversational, persuasive)
- Length: TARGET_LENGTH
- Structure: STRUCTURE (e.g., intro + 3 sections + conclusion)
- Include: INCLUDE_ELEMENTS
- Exclude: EXCLUDE_ELEMENTS

OUTPUT FORMAT:
[Markdown with headers]
```

---

## 🧮 Reasoning / Analysis Task
```
You are an expert analyst specializing in DOMAIN.

Problem:
PROBLEM_DESCRIPTION

Context:
RELEVANT_BACKGROUND

Think step by step:
1. Restate the core question
2. Identify key variables or factors
3. Analyze each factor
4. Draw a conclusion with justification

Final answer format:
- Recommendation: [1–2 sentences]
- Reasoning: [3–5 bullet points]
- Confidence: HIGH / MEDIUM / LOW
- Caveats: [any important limitations]
```

---

## 🗂️ Classification Task
```
Classify the following INPUT into one of these categories:
CATEGORY_1, CATEGORY_2, CATEGORY_3

Rules:
- Use ONLY the categories listed above
- If uncertain between two, pick the most likely
- Base classification on CLASSIFICATION_CRITERIA

Examples:
Input: EXAMPLE_INPUT_1
Output: EXAMPLE_CATEGORY_1

Input: EXAMPLE_INPUT_2
Output: EXAMPLE_CATEGORY_2

Now classify:
Input: {{USER_INPUT}}
Output:
```

---

## 📊 Data Extraction / JSON Output
```
You are a data extraction specialist. Extract the requested information
from the text below and return it ONLY as a JSON object matching this schema.
Do not include any text outside the JSON.

Schema:
{
  "FIELD_1": "<TYPE_AND_DESCRIPTION>",
  "FIELD_2": "<TYPE_AND_DESCRIPTION>",
  "FIELD_3": ["<LIST_OF_TYPE>"]
}

If a field is not present in the text, use null.

Text to extract from:
<document>
{{DOCUMENT_TEXT}}
</document>
```

---

## 💻 Code Generation Task
```
You are a senior SOFTWARE_LANGUAGE developer. Write production-quality code.

Task: CREATE_OR_FIX_DESCRIPTION

Requirements:
- Language/framework: LANGUAGE/FRAMEWORK
- Must handle: EDGE_CASES
- Performance needs: PERFORMANCE_REQUIREMENTS
- Style: follow STYLE_GUIDE (e.g., PEP 8, Airbnb)

Provide:
1. Brief explanation of approach (2–3 sentences)
2. Complete, working code with inline comments
3. Unit test examples
4. Usage example

Context / existing code:
```CODE_HERE```
```

---

## 📄 Document Summarization (Long Context)
```
<document>
{{FULL_DOCUMENT_TEXT}}
</document>

Based on the document above, provide:

1. Executive Summary (2–3 sentences, plain language)
2. Key Findings (5 bullet points max, each ≤ 20 words)
3. Action Items (if any; numbered list)
4. Important Caveats or Limitations

Audience: TARGET_AUDIENCE
Tone: TONE
```

---

## 🤖 Agent / ReAct Template
```
You are an intelligent agent. You have access to these tools:
- TOOL_1: DESCRIPTION
- TOOL_2: DESCRIPTION

For each step, output EXACTLY this format:
Thought: [what you're reasoning]
Action: tool_name("input")
Observation: [result]

After completing research, output:
Final Answer: [your complete answer]

Task: TASK_DESCRIPTION
```
