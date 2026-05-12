#!/usr/bin/env python3
"""
improve_prompt.py — CLI tool to analyze and improve LLM prompts.

Usage:
    python improve_prompt.py --prompt "Your prompt here" --model claude
    python improve_prompt.py --file my_prompt.txt --model gpt4 --output improved.txt
    echo "Your prompt" | python improve_prompt.py --model generic --score

Options:
    --prompt TEXT       The prompt text to improve (or use --file / stdin)
    --file PATH         Read prompt from a file
    --output PATH       Write improved prompt to a file
    --model MODEL       Target model: claude, gpt4, gemini, mistral, llama, generic
    --task TASK         Task type: reasoning, generation, classification, coding,
                        creative, summarization, agent (auto-detected if omitted)
    --score             Print before/after score comparison
    --techniques LIST   Comma-separated techniques to force (cot, fewshot, xml, role,
                        chain, format, positive, scratchpad, stepback)
    --verbose           Show detailed analysis
    --json              Output as JSON
"""

import argparse
import json
import sys
import re
from dataclasses import dataclass, asdict
from typing import Optional


# ── Scoring ──────────────────────────────────────────────────────────────────

@dataclass
class PromptScore:
    clarity: int
    context: int
    output_format: int
    technique_fit: int
    model_alignment: int

    @property
    def total(self) -> int:
        return self.clarity + self.context + self.output_format + self.technique_fit + self.model_alignment

    @property
    def grade(self) -> str:
        t = self.total
        if t >= 40: return "✅ Excellent"
        if t >= 30: return "🟡 Good"
        if t >= 20: return "🟠 Fair"
        if t >= 10: return "🔴 Poor"
        return "❌ Failing"

    def display(self, label: str = "SCORE") -> str:
        bar = "─" * 40
        return (
            f"\n{label}\n{bar}\n"
            f"  Clarity          : {self.clarity}/10\n"
            f"  Context          : {self.context}/10\n"
            f"  Output format    : {self.output_format}/10\n"
            f"  Technique fit    : {self.technique_fit}/10\n"
            f"  Model alignment  : {self.model_alignment}/10\n"
            f"  {bar}\n"
            f"  Overall          : {self.total}/50  {self.grade}\n"
        )


def score_prompt(prompt: str, model: str = "generic", task: str = "auto") -> PromptScore:
    """Heuristic scoring of a prompt. Returns a PromptScore."""
    p = prompt.lower()
    words = prompt.split()
    length = len(words)

    # ── Clarity ──────────────────────────────────────────────────
    clarity = 5
    action_verbs = ["write", "generate", "summarize", "explain", "create", "analyze",
                    "classify", "extract", "translate", "list", "describe", "compare",
                    "evaluate", "review", "fix", "improve", "convert", "produce"]
    if any(v in p for v in action_verbs):
        clarity += 2
    if length < 5:
        clarity -= 3
    if length > 15:
        clarity += 1
    if "?" in prompt and len(prompt) > 20:
        clarity += 1
    clarity = max(1, min(10, clarity))

    # ── Context ──────────────────────────────────────────────────
    context = 3
    context_signals = ["you are", "act as", "your role", "background:", "context:",
                       "audience:", "purpose:", "system:", "<s>", "persona"]
    context += sum(2 for s in context_signals if s in p)
    if length > 50:
        context += 1
    if any(t in p for t in ["<context>", "###", "<system>"]):
        context += 2
    context = max(1, min(10, context))

    # ── Output Format ────────────────────────────────────────────
    fmt = 2
    format_signals = ["json", "markdown", "bullet", "numbered list", "table", "paragraph",
                      "words", "sentences", "format:", "output:", "respond only",
                      "structure:", "<output>", "schema", "return a", "provide a"]
    fmt += sum(2 for s in format_signals if s in p)
    length_signals = ["short", "brief", "concise", "detailed", "comprehensive",
                      "words", "sentences", "paragraphs", "under ", "at most", "exactly"]
    fmt += sum(1 for s in length_signals if s in p)
    fmt = max(1, min(10, fmt))

    # ── Technique Fit ────────────────────────────────────────────
    tech = 5
    has_examples = bool(re.search(r"example[s]?[:\n]|e\.g\.|for instance|input.*output", p))
    has_cot = any(s in p for s in ["step by step", "think through", "reasoning", "chain of thought", "let's think"])
    has_role = any(s in p for s in ["you are", "act as", "as a ", "as an "])
    has_xml = bool(re.search(r"<\w+>", prompt))
    has_positive = not bool(re.search(r"\bdon'?t\b|\bdo not\b|\bnever\b|\bavoid\b", p))
    tech += 1 if has_examples else 0
    tech += 1 if has_cot else 0
    tech += 1 if has_role else 0
    tech += 1 if has_xml else 0
    tech += 1 if has_positive else 0
    tech = max(1, min(10, tech))

    # ── Model Alignment ──────────────────────────────────────────
    align = 5
    model_hints = {
        "claude": ["<", ">", "xml", "<task>", "<context>", "<examples>"],
        "gpt4":   ["###", "system:", "json_object", "gpt"],
        "gemini": ["document", "long", "multimodal", "image"],
        "mistral":["[inst]", "mistral", "efficient"],
        "llama":  ["[inst]", "llama", "<|"],
        "generic": [],
    }
    hints = model_hints.get(model.lower(), [])
    if hints:
        align += sum(1 for h in hints if h in p)
    if model == "generic":
        align = tech  # generic alignment = technique quality
    align = max(1, min(10, align))

    return PromptScore(clarity, context, fmt, tech, align)


# ── Issue Detection ───────────────────────────────────────────────────────────

def detect_issues(prompt: str, score: PromptScore) -> list[str]:
    """Return a list of human-readable issues found in the prompt."""
    issues = []
    p = prompt.lower()

    if score.clarity < 6:
        issues.append("❌ CLARITY: Task is vague — add a clear action verb and specific goal")
    if score.context < 5:
        issues.append("❌ CONTEXT: No role/persona or background — add 'You are...' and relevant constraints")
    if score.output_format < 5:
        issues.append("❌ FORMAT: No output format specified — add length, structure, and format requirements")
    if re.search(r"\bdon'?t\b|\bdo not\b|\bnever\b", p):
        issues.append("⚠️  FRAMING: Negative instructions detected — rephrase as positive directives")
    if len(prompt.split()) < 10:
        issues.append("⚠️  LENGTH: Prompt is very short — add more context and constraints")
    if score.technique_fit < 6:
        issues.append("⚠️  TECHNIQUE: No advanced techniques detected — consider few-shot, CoT, or role prompting")
    if not re.search(r"<\w+>|###|\*\*", prompt) and len(prompt.split()) > 60:
        issues.append("💡 STRUCTURE: Long prompt without delimiters — use XML tags or ### to organize sections")

    return issues


# ── Auto Task Detection ────────────────────────────────────────────────────────

def detect_task(prompt: str) -> str:
    p = prompt.lower()
    if any(w in p for w in ["code", "function", "script", "debug", "program", "python", "javascript"]):
        return "coding"
    if any(w in p for w in ["classify", "categorize", "label", "sentiment", "detect"]):
        return "classification"
    if any(w in p for w in ["summarize", "summary", "tldr", "key points", "brief"]):
        return "summarization"
    if any(w in p for w in ["story", "poem", "creative", "write a ", "imagine", "character"]):
        return "creative"
    if any(w in p for w in ["calculate", "solve", "math", "reason", "logic", "analyze", "explain why"]):
        return "reasoning"
    if any(w in p for w in ["agent", "tool", "search", "browse", "action", "workflow"]):
        return "agent"
    return "generation"


# ── Improvement Engine ────────────────────────────────────────────────────────

def improve_prompt(
    original: str,
    model: str = "generic",
    task: str = "auto",
    force_techniques: Optional[list[str]] = None,
) -> dict:
    """
    Analyze and improve a prompt. Returns a dict with:
      - original, improved, changes, techniques_applied, score_before, score_after
    """
    if task == "auto":
        task = detect_task(original)

    score_before = score_prompt(original, model, task)
    issues = detect_issues(original, score_before)

    improved = original
    changes = []
    techniques_used = []

    # ── Role injection ────────────────────────────────────────────
    p = improved.lower()
    add_role = force_techniques and "role" in force_techniques
    add_role = add_role or (score_before.context < 6 and "you are" not in p and "act as" not in p)
    if add_role:
        role_by_task = {
            "coding":         "You are an expert software engineer with deep knowledge of clean code, testing, and performance optimization.",
            "classification": "You are an expert data analyst skilled in text classification and structured output.",
            "summarization":  "You are a professional editor who writes clear, accurate summaries for busy professionals.",
            "creative":       "You are a skilled creative writer known for vivid imagery and compelling narratives.",
            "reasoning":      "You are a rigorous analytical thinker who works through problems step-by-step.",
            "agent":          "You are an intelligent AI agent with access to tools. You think before acting.",
            "generation":     "You are a knowledgeable assistant who gives clear, accurate, and well-structured answers.",
        }
        role = role_by_task.get(task, role_by_task["generation"])
        improved = f"{role}\n\n{improved}"
        changes.append(("Role/Persona added", f"Injected domain-specific role for '{task}' tasks"))
        techniques_used.append("Role Prompting")

    # ── CoT injection ────────────────────────────────────────────
    needs_cot = force_techniques and "cot" in (force_techniques or [])
    needs_cot = needs_cot or (task in ("reasoning", "coding") and "step by step" not in improved.lower())
    if needs_cot:
        improved = improved.rstrip() + "\n\nThink through this step by step before giving your final answer."
        changes.append(("Chain-of-Thought added", "Instructs model to reason before answering — improves accuracy 40–76% on reasoning tasks"))
        techniques_used.append("Chain-of-Thought (CoT)")

    # ── Positive framing ─────────────────────────────────────────
    negations = re.findall(r"\b(don'?t|do not|never|avoid)\b[^.!?\n]{1,60}", improved, re.IGNORECASE)
    if negations:
        changes.append(("Negative → Positive framing", "Negative instructions are 20–30% less reliable; rewrote as positive directives"))
        techniques_used.append("Positive Framing")
        improved = re.sub(r"\bdon'?t use\b", "use only", improved, flags=re.IGNORECASE)
        improved = re.sub(r"\bdo not use\b", "use only", improved, flags=re.IGNORECASE)
        improved = re.sub(r"\bnever include\b", "exclude", improved, flags=re.IGNORECASE)
        improved = re.sub(r"\bavoid using\b", "instead use", improved, flags=re.IGNORECASE)

    # ── Output format injection ───────────────────────────────────
    has_format = any(kw in improved.lower() for kw in
                     ["json", "bullet", "numbered", "table", "format:", "respond only",
                      "structure:", "words", "paragraphs", "sentences"])
    needs_format = (force_techniques and "format" in force_techniques) or (score_before.output_format < 5 and not has_format)
    if needs_format:
        format_by_task = {
            "coding":         "\n\nRespond with:\n1. A brief explanation of the approach\n2. The complete, working code with comments\n3. Example usage",
            "classification": '\n\nRespond ONLY with a JSON object:\n{"label": "<CATEGORY>", "confidence": <0.0-1.0>, "reason": "<1 sentence>"}',
            "summarization":  "\n\nProvide:\n- A 2-sentence executive summary\n- 3–5 key bullet points\n- One recommended action (if applicable)",
            "creative":       "\n\nTarget length: 200–400 words. Use vivid sensory details and an engaging opening line.",
            "reasoning":      "\n\nStructure your answer as:\n1. Restate the problem\n2. Step-by-step reasoning\n3. Final answer (clearly labeled)",
            "generation":     "\n\nFormat: clear paragraphs, plain language, no jargon. Length: 150–300 words unless specified.",
        }
        fmt_instruction = format_by_task.get(task, format_by_task["generation"])
        improved = improved.rstrip() + fmt_instruction
        changes.append(("Output format specified", "Added explicit format, length, and structure requirements"))
        techniques_used.append("Output Format Specification")

    # ── XML structure for long prompts ────────────────────────────
    needs_xml = (force_techniques and "xml" in force_techniques) or (
        model in ("claude",) and len(improved.split()) > 60 and "<" not in improved
    )
    if needs_xml and "\n\n" in improved:
        # Only wrap if there are multiple clear sections
        if improved.count("\n\n") >= 2:
            parts = improved.split("\n\n", 2)
            if len(parts) == 3:
                improved = f"<role>\n{parts[0]}\n</role>\n\n<context>\n{parts[1]}\n</context>\n\n<task>\n{parts[2]}\n</task>"
                changes.append(("XML structure added", "Claude parses XML-tagged sections most reliably"))
                techniques_used.append("XML / Delimiter Tagging")

    # ── Model-specific tips ───────────────────────────────────────
    model_tips = {
        "claude":  "💡 Claude tip: Wrap examples in <examples> tags and queries at end of long documents.",
        "gpt4":    "💡 GPT-4 tip: Split persona into system message; use 'response_format: json_object' for structured output.",
        "gemini":  "💡 Gemini tip: You can inject entire documents — put them before your query.",
        "mistral": "💡 Mistral tip: Keep system prompt concise; use [INST]/[/INST] in raw API calls.",
        "llama":   "💡 Llama tip: Use correct chat template markers; few-shot examples strongly help smaller variants.",
        "generic": "💡 Universal tip: Always test at least 3 prompt variants and compare outputs.",
    }
    quick_tip = model_tips.get(model.lower(), model_tips["generic"])

    score_after = score_prompt(improved, model, task)

    return {
        "original": original,
        "improved": improved,
        "changes": changes,
        "techniques_applied": techniques_used,
        "issues_found": issues,
        "quick_tip": quick_tip,
        "score_before": asdict(score_before),
        "score_after": asdict(score_after),
        "task_detected": task,
    }


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Analyze and improve LLM prompts.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--prompt", "-p", help="Prompt text to improve")
    parser.add_argument("--file", "-f", help="Path to file containing the prompt")
    parser.add_argument("--output", "-o", help="Write improved prompt to this file")
    parser.add_argument("--model", "-m", default="generic",
                        choices=["claude", "gpt4", "gemini", "mistral", "llama", "generic"],
                        help="Target model (default: generic)")
    parser.add_argument("--task", "-t", default="auto",
                        choices=["reasoning", "generation", "classification", "coding",
                                 "creative", "summarization", "agent", "auto"],
                        help="Task type (default: auto-detect)")
    parser.add_argument("--score", "-s", action="store_true", help="Show before/after scores")
    parser.add_argument("--techniques", help="Comma-separated techniques to force")
    parser.add_argument("--verbose", "-v", action="store_true", help="Detailed output")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    # Read prompt
    prompt = None
    if args.prompt:
        prompt = args.prompt
    elif args.file:
        with open(args.file, "r") as fh:
            prompt = fh.read()
    elif not sys.stdin.isatty():
        prompt = sys.stdin.read()
    else:
        parser.print_help()
        sys.exit(1)

    prompt = prompt.strip()
    if not prompt:
        print("Error: prompt is empty.", file=sys.stderr)
        sys.exit(1)

    force_techniques = [t.strip() for t in args.techniques.split(",")] if args.techniques else None

    result = improve_prompt(prompt, model=args.model, task=args.task, force_techniques=force_techniques)

    if args.json:
        print(json.dumps(result, indent=2))
        return

    # Pretty print
    sep = "═" * 60

    if args.score or args.verbose:
        sb = PromptScore(**result["score_before"])
        sa = PromptScore(**result["score_after"])
        print(sb.display("📊 ORIGINAL PROMPT SCORE"))

    if args.verbose:
        print("\n🔍 ISSUES FOUND")
        for issue in result["issues_found"]:
            print(f"   {issue}")

    print(f"\n{sep}")
    print("✅  IMPROVED PROMPT")
    print(sep)
    print(result["improved"])
    print(sep)

    print("\n📋 CHANGES MADE")
    for change, reason in result["changes"]:
        print(f"   • {change}: {reason}")

    print("\n🎯 TECHNIQUES APPLIED")
    for tech in result["techniques_applied"]:
        print(f"   • {tech}")

    print(f"\n{result['quick_tip']}")
    print(f"\n🔍 Task detected: {result['task_detected']}")

    if args.score or args.verbose:
        sa = PromptScore(**result["score_after"])
        print(sa.display("📈 IMPROVED PROMPT SCORE"))

    # Write output file
    if args.output:
        with open(args.output, "w") as fh:
            fh.write(result["improved"])
        print(f"\n✅ Improved prompt saved to: {args.output}")


if __name__ == "__main__":
    main()
