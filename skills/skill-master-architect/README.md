# Skill Master Architect

A unified, platform-agnostic framework for engineering, evaluating, and optimizing high-performance Agent Skills.

## Overview

This skill is the result of merging and improving three specialized skill-creation tools:
- **Skill Architect**: Procedural TDD for documentation.
- **Skill Creator Pro**: Advanced agentic patterns and tool-gating.
- **Skill Creator**: Comprehensive evaluation and description optimization.

The result is a "Master" skill that works with any LLM-based agent (Gemini, Claude, GPT, etc.) and covers the entire development lifecycle.

## Features

- **Platform Agnostic**: No hardcoded dependencies on specific LLM providers.
- **Agent Adapters**: Modular system to test skills against any CLI-based or API-based agent.
- **Advanced Patterns**: Dynamic Context Injection, Tool-Gating, Agentic Roles, and Slash Command Emulation.
- **Rigorous Evaluation**: Integrated support for automated graders, blind comparators, and quantitative benchmarking.
- **Trigger Optimization**: Automated loop to find the best discovery description for your skill.

## Directory Structure

- `SKILL.md`: The primary instructions for the Master Architect.
- `agents/`: Specialized sub-agents for grading, comparison, and analysis.
- `scripts/`: Modular Python scripts for running evals, loops, and packaging.
- `references/`: Schemas and deep-dive documentation.
- `assets/`: UI templates for the evaluation viewer.

## Getting Started

1.  **Define Intent**: Tell the Agent what capability you want to package.
2.  **Run RED Baseline**: Use `scripts/run_eval.py` to measure current performance.
3.  **Implement**: Follow the `SKILL.md` guidelines to write your skill.
4.  **Optimize**: Use `scripts/run_loop.py` to refine the description and logic.

---
Created by Gemini CLI Master Architect.
