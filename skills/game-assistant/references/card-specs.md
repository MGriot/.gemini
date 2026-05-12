# Game Reference Card — Specifications

## Standard Card Sizes

| Size Name | Dimensions (inches) | Dimensions (mm) | Best For |
|---|---|---|---|
| **Poker / Bridge** | 2.5" × 3.5" | 63.5 × 88.9 mm | Single mechanic, token reminder |
| **Tarot** | 2.75" × 4.75" | 69.9 × 120.7 mm | Standard player aid, one page of rules |
| **Half-Letter** | 5.5" × 8.5" | 139.7 × 215.9 mm | Complex game full turn summary |
| **Full-Letter** | 8.5" × 11" | 215.9 × 279.4 mm | Full reference sheet, rules + strategy |
| **A4** | 8.27" × 11.69" | 210 × 297 mm | European standard, same use as Full-Letter |

## Layout Principles

1. **Hierarchy first** — most-forgotten info at top, fine print at bottom
2. **Group by context** — all combat rules together, all resource rules together
3. **Icons > text** — use emoji or unicode symbols to replace long phrases
4. **Font minimum** — 9pt for printed output (larger is better)
5. **Bleed area** — for poker/tarot size, include 3mm bleed margin
6. **Color-coding** — use the game's thematic palette (ask user or search)
7. **Double-sided** — back of card = ultra-quick summary / game logo

## Content Priority by Card Type

### Rules Summary Card
```
TOP:    Win condition (1 sentence)
        End trigger(s)
MID:    Turn structure (numbered phases)
        Key rules (most forgotten 5–7)
BOT:    Tiebreaker
        Edition note
```

### Tips Card
```
TOP:    #1 Beginner trap to avoid
        Core strategic principle
MID:    3–5 power moves / combos
        Tempo / efficiency tips
BOT:    Advanced note
        Credits / source
```

### Setup Card
```
TOP:    Player count → component counts (table)
MID:    Board layout description
        Starting resources per player
BOT:    First-player determination
        Variant setup notes
```

### Full Reference Card (Half-Letter or larger)
Combine all three above in order: Setup → Turn → Rules → Tips

---

## HTML Card Template

Use this base HTML template for all card outputs. Replace variables in [BRACKETS].

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>[GAME_NAME] Reference Card</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;700&display=swap');

  :root {
    --primary: [THEME_COLOR_1];      /* e.g. #1a472a for green games */
    --secondary: [THEME_COLOR_2];    /* accent color */
    --bg: [BACKGROUND_COLOR];       /* card background */
    --text: [TEXT_COLOR];           /* main text */
    --border: [BORDER_COLOR];       /* dividers */
    --card-w: [CARD_WIDTH];         /* e.g. 2.5in for poker */
    --card-h: [CARD_HEIGHT];        /* e.g. 3.5in for poker */
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px;
    font-family: 'Inter', sans-serif;
  }

  .card {
    width: var(--card-w);
    height: var(--card-h);
    background: var(--bg);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    padding: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  /* For screen preview, scale up poker/tarot cards */
  .card.poker { width: 300px; height: 420px; }
  .card.tarot { width: 330px; height: 570px; }
  .card.half-letter { width: 660px; min-height: 800px; height: auto; }
  .card.full-letter { width: 850px; min-height: 1100px; height: auto; }

  .card-header {
    background: var(--primary);
    color: white;
    text-align: center;
    padding: 6px 4px;
    border-radius: 4px 4px 0 0;
    margin: -8px -8px 6px -8px;
  }

  .card-header h1 {
    font-family: 'Crimson Pro', serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .card-header .subtitle {
    font-size: 8px;
    opacity: 0.85;
    margin-top: 2px;
  }

  .section {
    margin-bottom: 6px;
  }

  .section-title {
    font-size: 7px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--secondary);
    border-bottom: 1px solid var(--border);
    padding-bottom: 2px;
    margin-bottom: 4px;
  }

  .rule-row {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    margin-bottom: 3px;
  }

  .rule-icon {
    font-size: 10px;
    min-width: 14px;
    text-align: center;
  }

  .rule-text {
    font-size: 8px;
    line-height: 1.35;
    color: var(--text);
  }

  .rule-text strong {
    color: var(--primary);
  }

  .turn-flow {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .turn-step {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .step-num {
    background: var(--primary);
    color: white;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .step-text {
    font-size: 8px;
    color: var(--text);
    line-height: 1.3;
  }

  table.ref-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.5px;
  }

  table.ref-table th {
    background: var(--primary);
    color: white;
    padding: 2px 4px;
    text-align: left;
    font-weight: 600;
  }

  table.ref-table td {
    border-bottom: 1px solid var(--border);
    padding: 2px 4px;
    color: var(--text);
  }

  table.ref-table tr:nth-child(even) td {
    background: rgba(0,0,0,0.04);
  }

  .highlight-box {
    background: var(--secondary);
    color: white;
    border-radius: 4px;
    padding: 4px 6px;
    font-size: 8px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 6px;
  }

  .tip-box {
    background: rgba(255, 200, 0, 0.15);
    border-left: 3px solid var(--secondary);
    padding: 3px 5px;
    font-size: 7.5px;
    color: var(--text);
    border-radius: 0 3px 3px 0;
    margin-bottom: 4px;
  }

  .card-footer {
    margin-top: auto;
    border-top: 1px solid var(--border);
    padding-top: 3px;
    font-size: 6.5px;
    color: #999;
    text-align: center;
  }

  @media print {
    body { background: white; padding: 0; }
    .card { box-shadow: none; }
    .card.poker { width: 2.5in; height: 3.5in; }
    .card.tarot { width: 2.75in; height: 4.75in; }
    .card.half-letter { width: 5.5in; height: 8.5in; }
    .card.full-letter { width: 8.5in; height: 11in; }
  }
</style>
</head>
<body>

<div class="card [SIZE_CLASS]">
  <div class="card-header">
    <h1>[GAME_NAME]</h1>
    <div class="subtitle">[CARD_TYPE] · [EDITION_INFO]</div>
  </div>

  <!-- WIN CONDITION HIGHLIGHT -->
  <div class="highlight-box">
    🏆 [WIN_CONDITION]
  </div>

  <!-- TURN STRUCTURE SECTION -->
  <div class="section">
    <div class="section-title">⚡ Turn Structure</div>
    <div class="turn-flow">
      <div class="turn-step">
        <div class="step-num">1</div>
        <div class="step-text"><strong>[Phase 1 name]</strong> — [brief description]</div>
      </div>
      <div class="turn-step">
        <div class="step-num">2</div>
        <div class="step-text"><strong>[Phase 2 name]</strong> — [brief description]</div>
      </div>
      <div class="turn-step">
        <div class="step-num">3</div>
        <div class="step-text"><strong>[Phase 3 name]</strong> — [brief description]</div>
      </div>
    </div>
  </div>

  <!-- KEY RULES SECTION -->
  <div class="section">
    <div class="section-title">📖 Key Rules</div>
    <div class="rule-row">
      <span class="rule-icon">[ICON]</span>
      <span class="rule-text"><strong>[Rule title]:</strong> [Rule text]</span>
    </div>
    <!-- repeat .rule-row for each rule -->
  </div>

  <!-- SCORING SECTION (if applicable) -->
  <div class="section">
    <div class="section-title">🎯 Scoring</div>
    <table class="ref-table">
      <tr><th>Source</th><th>Points</th></tr>
      <tr><td>[Item]</td><td>[N]</td></tr>
    </table>
  </div>

  <!-- TIP BOX -->
  <div class="tip-box">
    💡 <strong>Top Tip:</strong> [Most important strategic tip in ≤ 20 words]
  </div>

  <div class="card-footer">
    [GAME_NAME] · [PUBLISHER] · [YEAR] · Generated by Game Assistant
  </div>
</div>

</body>
</html>
```

---

## Color Palette Guidelines by Game Genre

| Genre | Primary | Secondary | Background | Text |
|---|---|---|---|---|
| Fantasy / Medieval | `#2c1810` dark brown | `#8b6914` gold | `#f5e8c8` parchment | `#1a0d00` |
| Sci-Fi / Space | `#0a1628` navy | `#00d4ff` cyan | `#0d1f3c` dark blue | `#e8f4f8` |
| Nature / Ecology | `#1a472a` forest | `#f4a261` amber | `#f0f7ee` mint white | `#1a2e1a` |
| Horror / Dark | `#1a0a0a` near-black | `#8b0000` blood red | `#f5f0e8` aged paper | `#2a0a0a` |
| Abstract / Modern | `#2c3e50` slate | `#e74c3c` red | `#ffffff` white | `#2c3e50` |
| Family / Colorful | `#3498db` blue | `#f39c12` yellow | `#fefefe` white | `#2c3e50` |
| Economic / Euro | `#5d4037` wood | `#c0392b` resource red | `#f9f3e3` cream | `#3e2723` |

---

## Card Generation Script

For batch card generation or custom layouts, use `scripts/card_generator.py`:
```
python scripts/card_generator.py --game "Catan" --type rules --size tarot --theme economic
```
