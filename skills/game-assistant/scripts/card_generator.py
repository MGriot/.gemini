#!/usr/bin/env python3
"""
Game Reference Card Generator
game-assistant skill — scripts/card_generator.py

Usage:
    python card_generator.py --game "Catan" --type rules --size tarot --theme economic
    python card_generator.py --input card_data.json --output output/catan_card.html
    python card_generator.py --interactive

Generates print-ready HTML reference cards for board games.
"""

import argparse
import json
import os
import sys
from datetime import datetime

# ─── Card Sizes (screen px for preview, print units in CSS) ────────────────
CARD_SIZES = {
    "poker":       {"class": "poker",       "w": "2.5in",  "h": "3.5in",  "px_w": 300, "px_h": 420},
    "tarot":       {"class": "tarot",       "w": "2.75in", "h": "4.75in", "px_w": 330, "px_h": 570},
    "half-letter": {"class": "half-letter", "w": "5.5in",  "h": "8.5in",  "px_w": 660, "px_h": 1020},
    "full-letter": {"class": "full-letter", "w": "8.5in",  "h": "11in",   "px_w": 850, "px_h": 1100},
    "a4":          {"class": "a4",          "w": "210mm",  "h": "297mm",  "px_w": 794, "px_h": 1123},
}

# ─── Color Themes ──────────────────────────────────────────────────────────
THEMES = {
    "fantasy":   {"primary": "#2c1810", "secondary": "#8b6914", "bg": "#f5e8c8", "text": "#1a0d00", "border": "#c8b080"},
    "scifi":     {"primary": "#0a1628", "secondary": "#00d4ff", "bg": "#0d1f3c", "text": "#e8f4f8", "border": "#1e3a5a"},
    "nature":    {"primary": "#1a472a", "secondary": "#f4a261", "bg": "#f0f7ee", "text": "#1a2e1a", "border": "#a8d5a2"},
    "horror":    {"primary": "#1a0a0a", "secondary": "#8b0000", "bg": "#f5f0e8", "text": "#2a0a0a", "border": "#8b6060"},
    "abstract":  {"primary": "#2c3e50", "secondary": "#e74c3c", "bg": "#ffffff", "text": "#2c3e50", "border": "#bdc3c7"},
    "family":    {"primary": "#3498db", "secondary": "#f39c12", "bg": "#fefefe", "text": "#2c3e50", "border": "#d5dbdb"},
    "economic":  {"primary": "#5d4037", "secondary": "#c0392b", "bg": "#f9f3e3", "text": "#3e2723", "border": "#bcaaa4"},
    "mystery":   {"primary": "#2e2b3d", "secondary": "#9b59b6", "bg": "#f8f5ff", "text": "#1a1a2e", "border": "#c39bd3"},
}

CARD_TYPE_LABELS = {
    "rules":   "Rules Summary",
    "tips":    "Strategy Tips",
    "setup":   "Setup Guide",
    "full":    "Full Reference",
    "solo":    "Solo Mode Reference",
    "scoring": "Scoring Guide",
}


def build_turn_steps_html(steps: list, theme: dict) -> str:
    html = '<div class="turn-flow">'
    for i, step in enumerate(steps, 1):
        name = step.get("name", f"Phase {i}")
        desc = step.get("desc", "")
        html += f"""
        <div class="turn-step">
          <div class="step-num">{i}</div>
          <div class="step-text"><strong>{name}</strong>{' — ' + desc if desc else ''}</div>
        </div>"""
    html += '</div>'
    return html


def build_rules_html(rules: list) -> str:
    html = ''
    for rule in rules:
        icon = rule.get("icon", "▪")
        title = rule.get("title", "")
        text = rule.get("text", "")
        html += f"""
        <div class="rule-row">
          <span class="rule-icon">{icon}</span>
          <span class="rule-text">{"<strong>" + title + ":</strong> " if title else ""}{text}</span>
        </div>"""
    return html


def build_table_html(headers: list, rows: list) -> str:
    th = "".join(f"<th>{h}</th>" for h in headers)
    trs = ""
    for row in rows:
        trs += "<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>"
    return f'<table class="ref-table"><tr>{th}</tr>{trs}</table>'


def generate_card_html(data: dict) -> str:
    """Generate complete HTML for a reference card from data dict."""
    game_name    = data.get("game", "Game Name")
    card_type    = data.get("type", "rules")
    size_key     = data.get("size", "tarot")
    theme_key    = data.get("theme", "family")
    publisher    = data.get("publisher", "")
    year         = data.get("year", "")
    edition      = data.get("edition", "")
    win_cond     = data.get("win_condition", "Accumulate the most Victory Points")
    end_trigger  = data.get("end_trigger", "")
    turn_steps   = data.get("turn_steps", [])
    key_rules    = data.get("key_rules", [])
    scoring_rows = data.get("scoring", [])
    tips         = data.get("tips", [])
    top_tip      = data.get("top_tip", "")
    footer_note  = data.get("footer_note", "")

    size  = CARD_SIZES.get(size_key, CARD_SIZES["tarot"])
    theme = THEMES.get(theme_key, THEMES["family"])
    type_label = CARD_TYPE_LABELS.get(card_type, "Reference")

    meta_parts = [p for p in [edition, publisher, year] if p]
    meta_str = " · ".join(meta_parts) if meta_parts else ""

    # Build sections dynamically
    sections_html = ""

    # Win condition highlight
    sections_html += f'<div class="highlight-box">🏆 {win_cond}</div>\n'

    # End trigger
    if end_trigger:
        sections_html += f'<div class="tip-box">⏱ <strong>Game ends when:</strong> {end_trigger}</div>\n'

    # Turn structure
    if turn_steps:
        sections_html += f"""
    <div class="section">
      <div class="section-title">⚡ Turn Structure</div>
      {build_turn_steps_html(turn_steps, theme)}
    </div>"""

    # Key rules
    if key_rules:
        sections_html += f"""
    <div class="section">
      <div class="section-title">📖 Key Rules</div>
      {build_rules_html(key_rules)}
    </div>"""

    # Scoring
    if scoring_rows:
        sections_html += f"""
    <div class="section">
      <div class="section-title">🎯 Scoring</div>
      {build_table_html(["Source", "Points"], scoring_rows)}
    </div>"""

    # Tips
    if tips:
        sections_html += f"""
    <div class="section">
      <div class="section-title">💡 Tips</div>"""
        for tip in tips:
            sections_html += f'<div class="tip-box">{tip}</div>\n'
        sections_html += "</div>"

    # Top tip
    if top_tip:
        sections_html += f'<div class="tip-box">💡 <strong>Top Tip:</strong> {top_tip}</div>\n'

    # Footer
    footer_content = footer_note if footer_note else f"{game_name}"
    if meta_str:
        footer_content += f" · {meta_str}"
    footer_content += " · Game Assistant"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{game_name} — {type_label}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;700&display=swap');
  :root {{
    --primary: {theme['primary']};
    --secondary: {theme['secondary']};
    --bg: {theme['bg']};
    --text: {theme['text']};
    --border: {theme['border']};
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ background: #e8e8e8; display: flex; justify-content: center; align-items: flex-start; padding: 24px; font-family: 'Inter', sans-serif; }}
  .card {{ width: {size['px_w']}px; background: var(--bg); border-radius: 10px; box-shadow: 0 6px 30px rgba(0,0,0,0.25); padding: 10px; display: flex; flex-direction: column; overflow: hidden; }}
  .card-header {{ background: var(--primary); color: white; text-align: center; padding: 8px 6px; border-radius: 6px 6px 0 0; margin: -10px -10px 8px -10px; }}
  .card-header h1 {{ font-family: 'Crimson Pro', serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }}
  .card-header .subtitle {{ font-size: 9px; opacity: 0.85; margin-top: 2px; }}
  .section {{ margin-bottom: 8px; }}
  .section-title {{ font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--secondary); border-bottom: 1px solid var(--border); padding-bottom: 2px; margin-bottom: 5px; }}
  .rule-row {{ display: flex; align-items: flex-start; gap: 5px; margin-bottom: 4px; }}
  .rule-icon {{ font-size: 11px; min-width: 16px; text-align: center; }}
  .rule-text {{ font-size: 9px; line-height: 1.4; color: var(--text); }}
  .rule-text strong {{ color: var(--primary); }}
  .turn-flow {{ display: flex; flex-direction: column; gap: 4px; }}
  .turn-step {{ display: flex; align-items: flex-start; gap: 6px; }}
  .step-num {{ background: var(--primary); color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }}
  .step-text {{ font-size: 9px; color: var(--text); line-height: 1.35; }}
  table.ref-table {{ width: 100%; border-collapse: collapse; font-size: 8.5px; }}
  table.ref-table th {{ background: var(--primary); color: white; padding: 3px 5px; text-align: left; font-weight: 600; }}
  table.ref-table td {{ border-bottom: 1px solid var(--border); padding: 3px 5px; color: var(--text); }}
  table.ref-table tr:nth-child(even) td {{ background: rgba(0,0,0,0.04); }}
  .highlight-box {{ background: var(--primary); color: white; border-radius: 5px; padding: 5px 8px; font-size: 9px; font-weight: 600; text-align: center; margin-bottom: 8px; }}
  .tip-box {{ background: rgba(255,200,0,0.12); border-left: 3px solid var(--secondary); padding: 4px 6px; font-size: 8.5px; color: var(--text); border-radius: 0 4px 4px 0; margin-bottom: 5px; }}
  .card-footer {{ margin-top: auto; border-top: 1px solid var(--border); padding-top: 4px; font-size: 7px; color: #999; text-align: center; }}
  @media print {{
    body {{ background: white; padding: 0; }}
    .card {{ box-shadow: none; width: {size['w']}; height: {size['h']}; }}
  }}
</style>
</head>
<body>
<div class="card">
  <div class="card-header">
    <h1>{game_name}</h1>
    <div class="subtitle">{type_label}{' · ' + meta_str if meta_str else ''}</div>
  </div>
  {sections_html}
  <div class="card-footer">{footer_content}</div>
</div>
</body>
</html>"""


def interactive_mode():
    """Prompt user interactively to build a card."""
    print("\n🎲 Game Reference Card Generator — Interactive Mode\n")
    data = {}
    data["game"]          = input("Game name: ").strip()
    data["publisher"]     = input("Publisher (optional): ").strip()
    data["year"]          = input("Year (optional): ").strip()
    data["edition"]       = input("Edition (optional): ").strip()

    print("\nCard type options: rules / tips / setup / full / solo / scoring")
    data["type"]          = input("Card type [rules]: ").strip() or "rules"

    print("Size options: poker / tarot / half-letter / full-letter / a4")
    data["size"]          = input("Card size [tarot]: ").strip() or "tarot"

    print("Theme options: fantasy / scifi / nature / horror / abstract / family / economic / mystery")
    data["theme"]         = input("Theme [family]: ").strip() or "family"

    data["win_condition"] = input("\nWin condition (1 sentence): ").strip()
    data["end_trigger"]   = input("Game end trigger: ").strip()
    data["top_tip"]       = input("Top tip (≤20 words): ").strip()

    # Turn steps
    data["turn_steps"] = []
    print("\nEnter turn phases (press Enter with empty name to stop):")
    while True:
        name = input(f"  Phase {len(data['turn_steps'])+1} name (or Enter to stop): ").strip()
        if not name:
            break
        desc = input(f"  Phase {len(data['turn_steps'])+1} description: ").strip()
        data["turn_steps"].append({"name": name, "desc": desc})

    # Key rules
    data["key_rules"] = []
    print("\nEnter key rules (press Enter with empty text to stop):")
    icons = ["📌", "⚔️", "🛡️", "💰", "🃏", "🏗️", "🔄", "⏩", "🎯", "🚫"]
    while True:
        text = input(f"  Rule {len(data['key_rules'])+1} (or Enter to stop): ").strip()
        if not text:
            break
        icon = icons[len(data['key_rules']) % len(icons)]
        data["key_rules"].append({"icon": icon, "text": text})

    return data


def main():
    parser = argparse.ArgumentParser(description="Generate game reference cards")
    parser.add_argument("--game",        help="Game name")
    parser.add_argument("--type",        default="rules", choices=list(CARD_TYPE_LABELS.keys()))
    parser.add_argument("--size",        default="tarot", choices=list(CARD_SIZES.keys()))
    parser.add_argument("--theme",       default="family", choices=list(THEMES.keys()))
    parser.add_argument("--input",       help="JSON file with card data")
    parser.add_argument("--output",      help="Output HTML file path")
    parser.add_argument("--interactive", action="store_true", help="Interactive mode")
    args = parser.parse_args()

    # Load data
    if args.interactive:
        data = interactive_mode()
    elif args.input:
        with open(args.input) as f:
            data = json.load(f)
    elif args.game:
        data = {"game": args.game, "type": args.type, "size": args.size, "theme": args.theme}
    else:
        parser.print_help()
        sys.exit(1)

    # Override with CLI args if provided
    if args.game  and not args.input: data["game"]  = args.game
    if args.type  and not args.input: data["type"]  = args.type
    if args.size  and not args.input: data["size"]  = args.size
    if args.theme and not args.input: data["theme"] = args.theme

    # Generate
    html = generate_card_html(data)

    # Output
    game_slug = data.get("game", "card").lower().replace(" ", "_")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    out_path = args.output or f"{game_slug}_reference_card_{timestamp}.html"

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"\n✅ Card generated: {out_path}")
    print(f"   Open in browser to preview, Ctrl+P to print at {CARD_SIZES[data.get('size','tarot')]['w']} × {CARD_SIZES[data.get('size','tarot')]['h']}")


if __name__ == "__main__":
    main()
