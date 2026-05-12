#!/usr/bin/env python3
"""
score_prompt.py — Quickly score a prompt against the rubric.

Usage:
    python score_prompt.py --prompt "Your prompt here"
    python score_prompt.py --file prompt.txt --model claude
    echo "prompt text" | python score_prompt.py
"""

import argparse
import sys
from improve_prompt import score_prompt, detect_issues, PromptScore


def main():
    parser = argparse.ArgumentParser(description="Score a prompt against the rubric.")
    parser.add_argument("--prompt", "-p", help="Prompt text")
    parser.add_argument("--file", "-f", help="Read prompt from file")
    parser.add_argument("--model", "-m", default="generic",
                        choices=["claude", "gpt4", "gemini", "mistral", "llama", "generic"])
    args = parser.parse_args()

    if args.prompt:
        prompt = args.prompt
    elif args.file:
        with open(args.file) as fh:
            prompt = fh.read()
    elif not sys.stdin.isatty():
        prompt = sys.stdin.read()
    else:
        parser.print_help()
        sys.exit(1)

    prompt = prompt.strip()
    score = score_prompt(prompt, args.model)
    print(score.display("PROMPT SCORE"))

    issues = detect_issues(prompt, score)
    if issues:
        print("ISSUES DETECTED")
        for i in issues:
            print(f"  {i}")
    else:
        print("No major issues detected. ✅")


if __name__ == "__main__":
    main()
