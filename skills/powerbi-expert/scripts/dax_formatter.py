# /// script
# dependencies = []
# ///
"""
Power BI DAX Measure Linter
Analyzes a DAX expression string for common anti-patterns and style issues,
and returns structured feedback with suggested rewrites.

Usage:
    uv run scripts/dax_formatter.py --measure "Ratio = SUM(Sales[Amt]) / SUM(Cost[Amt])"
    uv run scripts/dax_formatter.py --file measures.txt --format text
"""
import argparse
import json
import re
import sys
from pathlib import Path


# ── Lint Rules ────────────────────────────────────────────────────────────────

LINT_RULES = [
    {
        "id": "DAX-L001",
        "name": "Division operator",
        "severity": "High",
        "pattern": re.compile(r"(?<![=<>!])/(?!/)"),
        "message": "Use DIVIDE(numerator, denominator, 0) instead of '/' to handle divide-by-zero.",
        "example_fix": "DIVIDE([Numerator], [Denominator], 0)",
    },
    {
        "id": "DAX-L002",
        "name": "IFERROR usage",
        "severity": "Medium",
        "pattern": re.compile(r"\bIFERROR\b", re.IGNORECASE),
        "message": "Avoid IFERROR — it evaluates both branches. Use IF(ISERROR(...), alt, expr) or DIVIDE() for division.",
        "example_fix": "IF(ISERROR(<expr>), BLANK(), <expr>)",
    },
    {
        "id": "DAX-L003",
        "name": "INTERSECT used for virtual relationship",
        "severity": "Low",
        "pattern": re.compile(r"\bINTERSECT\b", re.IGNORECASE),
        "message": "Prefer TREATAS() over INTERSECT() for virtual relationships — it's more expressive and performant.",
        "example_fix": "TREATAS(VALUES(TableA[Key]), TableB[Key])",
    },
    {
        "id": "DAX-L004",
        "name": "No variables (VAR) in complex expression",
        "severity": "Medium",
        "pattern": None,  # special logic below
        "message": "Complex expressions should use VAR to cache sub-expressions and improve readability.",
        "example_fix": "VAR x = <expr>\nRETURN IF(x > 0, x, BLANK())",
    },
    {
        "id": "DAX-L005",
        "name": "SUMX/AVERAGEX used on simple column",
        "severity": "Medium",
        "pattern": re.compile(r"\b(SUMX|AVERAGEX|COUNTX)\s*\([^,]+,\s*\w+\[\w+\]\s*\)", re.IGNORECASE),
        "message": "Replace SUMX(Table, Table[Column]) with SUM(Table[Column]) for simple aggregations.",
        "example_fix": "SUM(Table[Column])",
    },
    {
        "id": "DAX-L006",
        "name": "Hardcoded date literal",
        "severity": "Low",
        "pattern": re.compile(r"\bDATE\s*\(\s*\d{4}\s*,", re.IGNORECASE),
        "message": "Avoid hardcoded DATE() literals in measures. Use NOW(), TODAY(), or dynamic parameters.",
        "example_fix": "LASTDATE('Date'[Date])",
    },
    {
        "id": "DAX-L007",
        "name": "SELECT ALL without scope (ALL vs ALLSELECTED)",
        "severity": "Low",
        "pattern": re.compile(r"\bALL\s*\(\s*'?\w+'?\s*\)", re.IGNORECASE),
        "message": "ALL(Table) removes ALL filters including slicers. Use ALLSELECTED(Table) to respect user slicer selections.",
        "example_fix": "CALCULATE([Measure], ALLSELECTED('Table'))",
    },
]


def lint_dax(expression: str) -> list[dict]:
    findings = []

    for rule in LINT_RULES:
        if rule["id"] == "DAX-L004":
            # Trigger if expression is "complex" (>60 chars) and has no VAR
            is_complex = len(expression.strip()) > 60
            has_var = bool(re.search(r"\bVAR\b", expression, re.IGNORECASE))
            if is_complex and not has_var:
                findings.append({
                    "rule_id": rule["id"],
                    "rule_name": rule["name"],
                    "severity": rule["severity"],
                    "message": rule["message"],
                    "example_fix": rule["example_fix"],
                })
        elif rule["pattern"] and rule["pattern"].search(expression):
            findings.append({
                "rule_id": rule["id"],
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "message": rule["message"],
                "example_fix": rule["example_fix"],
            })

    return findings


def format_dax(expression: str) -> str:
    """
    Apply basic DAX formatting:
    - Uppercase keywords
    - Indent RETURN block
    - Newline after VAR declarations
    """
    keywords = [
        "VAR", "RETURN", "CALCULATE", "FILTER", "ALL", "ALLSELECTED",
        "DIVIDE", "IF", "SWITCH", "SUMX", "SUM", "AVERAGE", "COUNT",
        "DISTINCTCOUNT", "DATESINPERIOD", "DATESYTD", "SAMEPERIODLASTYEAR",
        "USERELATIONSHIP", "TREATAS", "SELECTEDVALUE", "BLANK", "TRUE", "FALSE",
    ]
    result = expression
    for kw in keywords:
        result = re.sub(rf"\b{kw}\b", kw, result, flags=re.IGNORECASE)

    # Newline before RETURN
    result = re.sub(r"\bRETURN\b", "\nRETURN", result)
    # Newline after each VAR line
    result = re.sub(r"(VAR\s+\w+\s*=\s*[^\n]+)", r"\1\n", result)

    return result.strip()


def main() -> int:
    parser = argparse.ArgumentParser(description="Lint and format a DAX measure expression.")
    parser.add_argument("--measure", default=None, help="DAX expression string (inline)")
    parser.add_argument("--file", default=None, help="Path to a .dax or .txt file with one measure per line")
    parser.add_argument("--format", choices=["json", "text"], default="text")
    args = parser.parse_args()

    expressions = []
    if args.measure:
        expressions = [args.measure]
    elif args.file:
        path = Path(args.file)
        if not path.exists():
            print(f"ERROR: File not found — {path}", file=sys.stderr)
            return 1
        expressions = [l.strip() for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]
    else:
        print("ERROR: Provide --measure or --file", file=sys.stderr)
        return 1

    all_results = []
    for expr in expressions:
        findings = lint_dax(expr)
        formatted = format_dax(expr)
        all_results.append({
            "original": expr,
            "formatted": formatted,
            "issues_found": len(findings),
            "findings": findings,
        })

    if args.format == "json":
        print(json.dumps(all_results, indent=2))
    else:
        for result in all_results:
            print(f"\n{'─'*55}")
            print(f"  Original : {result['original'][:80]}{'…' if len(result['original'])>80 else ''}")
            print(f"  Formatted:\n    {result['formatted']}")
            print(f"\n  Issues : {result['issues_found']}")
            for f in result["findings"]:
                sev_icon = {"High": "🔴", "Medium": "🟡", "Low": "🔵"}.get(f["severity"], "ℹ")
                print(f"\n  {sev_icon} [{f['rule_id']}] {f['rule_name']}")
                print(f"     {f['message']}")
                print(f"     Fix: {f['example_fix']}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
