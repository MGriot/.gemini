# /// script
# dependencies = []
# ///
"""
Power BI Report Theme Generator
Generates a production-ready report theme JSON for Power BI Desktop.

Usage:
    uv run scripts/generate_theme.py --name "My Brand" --palette corporate
    uv run scripts/generate_theme.py --name "Finance Report" --palette accessible --output theme.json
    uv run scripts/generate_theme.py --list-palettes
"""
import argparse
import json
import sys
from pathlib import Path

# ── Built-in Palettes ──────────────────────────────────────────────────────────

PALETTES = {
    "corporate": {
        "description": "Classic corporate blue/grey palette — safe for all audiences",
        "dataColors": ["#1B6CA8","#4A90D9","#E07B39","#2E8B57","#8B2FC9","#C42B1C","#A67B2C","#5C5C5C"],
        "background": "#FFFFFF",
        "foreground": "#252423",
        "tableAccent": "#1B6CA8",
    },
    "accessible": {
        "description": "Color-blind safe palette — Blue/Orange/Purple, no Red/Green confusion",
        "dataColors": ["#0072B2","#E69F00","#56B4E9","#009E73","#F0E442","#D55E00","#CC79A7","#999999"],
        "background": "#FFFFFF",
        "foreground": "#1C1C1E",
        "tableAccent": "#0072B2",
    },
    "dark": {
        "description": "Dark mode theme — ideal for executive briefings and large screens",
        "dataColors": ["#4FC3F7","#FFB74D","#81C784","#CE93D8","#F48FB1","#80DEEA","#FFD54F","#BCAAA4"],
        "background": "#1C1C1E",
        "foreground": "#F5F5F5",
        "tableAccent": "#4FC3F7",
    },
    "finance": {
        "description": "Finance/banking palette — conservative, high-contrast",
        "dataColors": ["#003366","#336699","#669933","#CC6600","#990000","#666699","#336666","#663300"],
        "background": "#FAFAFA",
        "foreground": "#111111",
        "tableAccent": "#003366",
    },
    "minimal": {
        "description": "Minimal greyscale with one accent color — clean and timeless",
        "dataColors": ["#2D6A9F","#A8A8A8","#C8C8C8","#E0E0E0","#707070","#505050","#909090","#303030"],
        "background": "#FFFFFF",
        "foreground": "#303030",
        "tableAccent": "#2D6A9F",
    },
}


# ── Theme Builder ─────────────────────────────────────────────────────────────

def build_theme(name: str, palette_key: str) -> dict:
    palette = PALETTES[palette_key]
    bg = palette["background"]
    fg = palette["foreground"]
    accent = palette["tableAccent"]
    is_dark = bg in ("#1C1C1E", "#111111", "#000000", "#1a1a2e")
    label_color = "#A8A8A8" if is_dark else "#605E5C"

    return {
        "name": name,
        "dataColors": palette["dataColors"],
        "background": bg,
        "foreground": fg,
        "tableAccent": accent,
        "textClasses": {
            "callout": {
                "fontFace": "Segoe UI",
                "fontSize": 45,
                "fontColor": fg,
                "bold": True
            },
            "title": {
                "fontFace": "Segoe UI",
                "fontSize": 16,
                "fontColor": fg,
                "bold": True
            },
            "header": {
                "fontFace": "Segoe UI",
                "fontSize": 12,
                "fontColor": fg,
                "bold": True
            },
            "label": {
                "fontFace": "Segoe UI",
                "fontSize": 10,
                "fontColor": label_color
            }
        },
        "visualStyles": {
            "*": {
                "*": {
                    "border": [{"show": False}],
                    "background": [{"show": False}],
                    "dropShadow": [{"show": False}],
                    "title": [{"show": True, "fontColor": {"solid": {"color": fg}}}]
                }
            },
            "card": {
                "*": {
                    "labels": [{"color": {"solid": {"color": accent}}, "fontSize": 28}],
                    "categoryLabels": [{"show": True, "fontSize": 11}],
                    "wordWrap": [{"show": True}]
                }
            },
            "KPI": {
                "*": {
                    "indicator": [{"fontSize": 28}],
                    "trendLine": [{"show": True}]
                }
            },
            "tableEx": {
                "*": {
                    "grid": [{"gridVertical": False, "rowPadding": 6, "outlineColor": {"solid": {"color": accent}}}],
                    "columnHeaders": [{"bold": True, "wordWrap": True, "fontSize": 11,
                                       "fontColor": {"solid": {"color": fg}}}],
                    "values": [{"wordWrap": True, "fontSize": 10}],
                    "total": [{"bold": True}]
                }
            },
            "matrix": {
                "*": {
                    "grid": [{"gridVertical": False, "rowPadding": 5}],
                    "columnHeaders": [{"bold": True, "wordWrap": True}],
                    "rowHeaders": [{"bold": True}],
                    "subTotals": [{"rowSubtotals": True, "columnSubtotals": True}]
                }
            },
            "lineChart": {
                "*": {
                    "legend": [{"show": True, "position": "Top"}],
                    "categoryAxis": [{"showAxisTitle": False}],
                    "valueAxis": [{"showAxisTitle": False, "gridlineStyle": "dashed"}]
                }
            },
            "barChart": {
                "*": {
                    "legend": [{"show": True, "position": "Top"}],
                    "categoryAxis": [{"showAxisTitle": False}],
                    "dataLabels": [{"show": False}]
                }
            },
            "columnChart": {
                "*": {
                    "legend": [{"show": True, "position": "Top"}],
                    "categoryAxis": [{"showAxisTitle": False}],
                    "dataLabels": [{"show": False}]
                }
            },
            "slicer": {
                "*": {
                    "data": [{"fontColor": {"solid": {"color": fg}}, "fontSize": 11}],
                    "selection": [{"selectAllCheckboxEnabled": False, "singleSelect": False}]
                }
            }
        },
        "page": {
            "background": {"color": {"solid": {"color": bg}}, "transparency": 0},
            "outspace": {"color": {"solid": {"color": bg}}}
        }
    }


# ── Entry Point ───────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a Power BI report theme JSON.")
    parser.add_argument("--name", default="Custom Theme", help="Theme display name")
    parser.add_argument(
        "--palette",
        choices=list(PALETTES.keys()),
        default="corporate",
        help="Color palette preset (default: corporate)",
    )
    parser.add_argument("--output", default=None, help="Output file path (default: stdout)")
    parser.add_argument("--list-palettes", action="store_true", help="List available palettes and exit")
    args = parser.parse_args()

    if args.list_palettes:
        print("\nAvailable palettes:\n")
        for key, val in PALETTES.items():
            print(f"  {key:12} — {val['description']}")
        print()
        return 0

    theme = build_theme(args.name, args.palette)
    output_json = json.dumps(theme, indent=2)

    if args.output:
        out_path = Path(args.output)
        out_path.write_text(output_json, encoding="utf-8")
        print(f"✓ Theme written to: {out_path}", file=sys.stderr)
    else:
        print(output_json)

    return 0


if __name__ == "__main__":
    sys.exit(main())
