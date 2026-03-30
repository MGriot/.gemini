#!/usr/bin/env python3
"""
debt_summary.py — Phase 8: Tech debt aggregation and prioritization matrix.

Usage: python3 debt_summary.py <repo_path> [--quality-report X] [--security-report Y] [--test-report Z]
"""

import sys
import json
import argparse
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List


@dataclass
class DebtItem:
    category: str
    title: str
    description: str
    impact: int      # 1-3 (3=high impact)
    effort: int      # 1-3 (3=high effort)
    priority: float  # impact / effort — higher = do first
    evidence: str
    recommendation: str


IMPACT_LABELS = {1: "Low", 2: "Medium", 3: "High"}
EFFORT_LABELS = {1: "Low", 2: "Medium", 3: "High"}


def load_json_report(path: str) -> dict:
    try:
        return json.loads(Path(path).read_text())
    except Exception:
        return {}


def items_from_security(sec: dict) -> List[DebtItem]:
    items = []
    findings = sec if isinstance(sec, list) else sec.get("findings", [])
    critical = [f for f in findings if f.get("severity") in ("CRITICAL", "HIGH")]
    if critical:
        items.append(DebtItem(
            category="Security",
            title=f"{len(critical)} Critical/High Security Issues",
            description=f"Including: {', '.join(set(f.get('title','') for f in critical[:3]))}",
            impact=3, effort=2,
            priority=1.5,
            evidence=f"{len(critical)} findings at HIGH/CRITICAL severity",
            recommendation="Prioritize security remediation before next release",
        ))
    medium = [f for f in findings if f.get("severity") == "MEDIUM"]
    if medium:
        items.append(DebtItem(
            category="Security",
            title=f"{len(medium)} Medium Security Issues",
            description="Medium severity findings requiring attention",
            impact=2, effort=2,
            priority=1.0,
            evidence=f"{len(medium)} MEDIUM findings",
            recommendation="Address in next 1-2 sprints",
        ))
    return items


def items_from_quality(qual: dict) -> List[DebtItem]:
    items = []
    score = qual.get("score", 3)
    errors = qual.get("errors", 0)
    warnings = qual.get("warnings", 0)
    todos = qual.get("total_todos", 0)

    if errors > 0:
        items.append(DebtItem(
            category="Code Quality",
            title=f"{errors} Code Errors",
            description="Syntax errors or static analysis errors that need immediate fix",
            impact=3, effort=1,
            priority=3.0,
            evidence=f"{errors} errors found",
            recommendation="Fix all errors before merge",
        ))
    if warnings > 20:
        items.append(DebtItem(
            category="Code Quality",
            title=f"High Warning Count ({warnings})",
            description="Large number of code quality warnings indicating maintenance problems",
            impact=2, effort=2,
            priority=1.0,
            evidence=f"{warnings} warnings",
            recommendation="Dedicate 20% of sprint capacity to quality cleanup",
        ))
    if todos > 50:
        items.append(DebtItem(
            category="Code Quality",
            title=f"TODO/FIXME Backlog ({todos} items)",
            description="Large TODO backlog indicates deferred work accumulating",
            impact=1, effort=2,
            priority=0.5,
            evidence=f"{todos} TODO/FIXME comments",
            recommendation="Triage TODOs: close stale ones, create tickets for real work",
        ))
    return items


def items_from_tests(test: dict) -> List[DebtItem]:
    items = []
    test_ratio = test.get("test_ratio", 1.0)
    coverage = test.get("coverage_pct", -1)
    test_count = test.get("total_test_files", 0)

    if test_count == 0:
        items.append(DebtItem(
            category="Testing",
            title="No Tests Found",
            description="The project has no automated tests",
            impact=3, effort=3,
            priority=1.0,
            evidence="0 test files detected",
            recommendation="Start with unit tests for core business logic",
        ))
    elif test_ratio < 0.3:
        items.append(DebtItem(
            category="Testing",
            title=f"Low Test Coverage Ratio ({test_ratio:.0%})",
            description="Very few test files relative to source files",
            impact=2, effort=3,
            priority=0.67,
            evidence=f"Test/source ratio: {test_ratio:.0%}",
            recommendation="Add tests for untested modules, prioritize critical paths",
        ))

    if 0 <= coverage < 40:
        items.append(DebtItem(
            category="Testing",
            title=f"Very Low Line Coverage ({coverage}%)",
            description="Most code paths are untested",
            impact=3, effort=3,
            priority=1.0,
            evidence=f"{coverage}% line coverage",
            recommendation="Set coverage floor in CI, incrementally increase minimum",
        ))
    return items


def run(repo_path_str: str, quality_report: str = None, security_report: str = None, test_report: str = None):
    repo_path = Path(repo_path_str).resolve()

    items: List[DebtItem] = []

    if security_report:
        items.extend(items_from_security(load_json_report(security_report)))
    if quality_report:
        items.extend(items_from_quality(load_json_report(quality_report)))
    if test_report:
        items.extend(items_from_tests(load_json_report(test_report)))

    if not items:
        print("No report files provided. Pass --quality-report, --security-report, --test-report")
        print("Or run the individual scanners first with --output json and pass their output here.")
        return

    # Sort by priority (impact/effort) descending
    items.sort(key=lambda x: -x.priority)

    print(f"\n{'='*60}")
    print(f"  TECH DEBT REGISTER: {repo_path.name}")
    print(f"{'='*60}")
    print(f"\nTotal debt items: {len(items)}")

    print(f"\n{'Priority':>8}  {'Impact':>6}  {'Effort':>6}  {'Category':<15}  Title")
    print("-" * 75)
    for item in items:
        print(f"{item.priority:>8.2f}  {IMPACT_LABELS[item.impact]:>6}  {EFFORT_LABELS[item.effort]:>6}  {item.category:<15}  {item.title}")

    print(f"\n\nTop Priority Actions (do first):")
    for item in items[:3]:
        print(f"\n  [{item.category}] {item.title}")
        print(f"  Evidence: {item.evidence}")
        print(f"  → {item.recommendation}")

    by_category = {}
    for item in items:
        by_category.setdefault(item.category, []).append(item)
    print(f"\n\nDebt by Category:")
    for cat, cat_items in sorted(by_category.items()):
        print(f"  {cat}: {len(cat_items)} item(s)")

    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tech debt summary")
    parser.add_argument("repo_path")
    parser.add_argument("--quality-report", default=None)
    parser.add_argument("--security-report", default=None)
    parser.add_argument("--test-report", default=None)
    args = parser.parse_args()
    run(args.repo_path, args.quality_report, args.security_report, args.test_report)
