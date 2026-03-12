# /// script
# dependencies = ["pydantic>=2.0", "colorama"]
# ///
"""
Power BI Report Theme JSON Validator
Validates a custom theme JSON file against the required structure and
catches common mistakes before importing into Power BI Desktop.

Usage:
    uv run scripts/validate_theme.py --theme path/to/theme.json
    uv run scripts/validate_theme.py --theme path/to/theme.json --format text
"""
import argparse
import json
import sys
from pathlib import Path
from pydantic import BaseModel

try:
    from colorama import Fore, Style, init
    init(autoreset=True)
    HAS_COLOR = True
except ImportError:
    HAS_COLOR = False
    class Fore:
        RED = GREEN = YELLOW = CYAN = ""
    class Style:
        RESET_ALL = BRIGHT = ""


# ── Validation Rules ──────────────────────────────────────────────────────────

class ValidationResult(BaseModel):
    field: str
    status: str        # pass | warn | error
    message: str


class ThemeReport(BaseModel):
    theme_name: str
    status: str        # valid | warnings | invalid
    pass_count: int
    warn_count: int
    error_count: int
    results: list[ValidationResult]


def validate_theme(theme: dict) -> ThemeReport:
    results: list[ValidationResult] = []

    def ok(field, msg):
        results.append(ValidationResult(field=field, status="pass", message=msg))

    def warn(field, msg):
        results.append(ValidationResult(field=field, status="warn", message=msg))

    def err(field, msg):
        results.append(ValidationResult(field=field, status="error", message=msg))

    # Required: name
    if "name" not in theme:
        err("name", "Missing required 'name' property. Theme won't load in Power BI.")
    else:
        ok("name", f"Theme name: '{theme['name']}'")

    # dataColors
    if "dataColors" not in theme:
        warn("dataColors", "No 'dataColors' array. Power BI will use the default palette.")
    else:
        colors = theme["dataColors"]
        if not isinstance(colors, list):
            err("dataColors", "'dataColors' must be an array of hex color strings.")
        elif len(colors) < 2:
            warn("dataColors", f"Only {len(colors)} color(s) defined. Recommend at least 8.")
        elif len(colors) < 8:
            warn("dataColors", f"{len(colors)} colors — consider providing 8 for full series coverage.")
        else:
            ok("dataColors", f"{len(colors)} data colors defined.")

        # Check hex format
        bad = [c for c in colors if not (isinstance(c, str) and c.startswith("#") and len(c) in (4, 7))]
        if bad:
            err("dataColors", f"Invalid color format (expected #RRGGBB or #RGB): {bad[:3]}")

    # textClasses
    if "textClasses" not in theme:
        warn("textClasses", "No 'textClasses' defined. Font styling will use Power BI defaults.")
    else:
        tc = theme["textClasses"]
        for cls in ["title", "header", "label", "callout"]:
            if cls not in tc:
                warn(f"textClasses.{cls}", f"'{cls}' text class not defined.")
            else:
                entry = tc[cls]
                if "fontFace" not in entry:
                    warn(f"textClasses.{cls}.fontFace", "No fontFace specified — will inherit default.")
                if "fontSize" not in entry:
                    warn(f"textClasses.{cls}.fontSize", "No fontSize specified.")
                ok(f"textClasses.{cls}", f"Text class '{cls}' found.")

    # visualStyles
    if "visualStyles" not in theme:
        warn("visualStyles", "No 'visualStyles' defined. Visual-level formatting uses defaults.")
    else:
        vs = theme["visualStyles"]
        if "*" not in vs:
            warn("visualStyles.*", "No wildcard '*' catch-all visual style. Recommended for global defaults.")
        else:
            ok("visualStyles.*", "Wildcard catch-all style present.")

    # background / foreground
    for key in ("background", "foreground"):
        if key not in theme:
            warn(key, f"No '{key}' color defined. Defaults to Power BI built-in.")
        else:
            val = theme[key]
            if not (isinstance(val, str) and val.startswith("#")):
                err(key, f"'{key}' must be a hex color string like '#FFFFFF'.")
            else:
                ok(key, f"'{key}' = {val}")

    # Accessibility check: warn if Green/Red palette (common color-blind issue)
    all_colors = json.dumps(theme).lower()
    red_green_hints = ["#ff0000","#00ff00","#008000","#ff0000","red","green"]
    if any(c in all_colors for c in red_green_hints):
        warn(
            "accessibility",
            "Red/Green colors detected. Consider Blue/Orange palette for color-blind accessibility "
            "(approx. 8% of males are affected by red-green color blindness)."
        )

    passes = sum(1 for r in results if r.status == "pass")
    warns  = sum(1 for r in results if r.status == "warn")
    errors = sum(1 for r in results if r.status == "error")

    if errors > 0:
        overall = "invalid"
    elif warns > 0:
        overall = "warnings"
    else:
        overall = "valid"

    return ThemeReport(
        theme_name=theme.get("name", "<unknown>"),
        status=overall,
        pass_count=passes,
        warn_count=warns,
        error_count=errors,
        results=results,
    )


# ── Entry Point ───────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a Power BI report theme JSON file.")
    parser.add_argument("--theme", required=True, help="Path to the theme .json file")
    parser.add_argument("--format", choices=["json", "text"], default="text")
    args = parser.parse_args()

    theme_path = Path(args.theme)
    if not theme_path.exists():
        print(f"ERROR: File not found — {theme_path}", file=sys.stderr)
        return 1

    try:
        with open(theme_path, encoding="utf-8") as f:
            theme_data = json.load(f)
    except json.JSONDecodeError as exc:
        print(f"ERROR: Invalid JSON — {exc}", file=sys.stderr)
        return 1

    report = validate_theme(theme_data)

    if args.format == "json":
        print(json.dumps(report.model_dump(), indent=2))
    else:
        status_color = {
            "valid": Fore.GREEN,
            "warnings": Fore.YELLOW,
            "invalid": Fore.RED,
        }.get(report.status, "")

        print(f"\n{'='*55}")
        print(f"  Theme Validation — {report.theme_name}")
        print(f"  Status : {status_color}{report.status.upper()}{Style.RESET_ALL}")
        print(f"  Pass: {report.pass_count}  Warn: {report.warn_count}  Error: {report.error_count}")
        print(f"{'='*55}\n")

        for r in report.results:
            if r.status == "pass":
                icon = f"{Fore.GREEN}✓{Style.RESET_ALL}" if HAS_COLOR else "✓"
            elif r.status == "warn":
                icon = f"{Fore.YELLOW}⚠{Style.RESET_ALL}" if HAS_COLOR else "⚠"
            else:
                icon = f"{Fore.RED}✗{Style.RESET_ALL}" if HAS_COLOR else "✗"
            print(f" {icon}  [{r.field}]")
            print(f"      {r.message}\n")

    return 0 if report.error_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
