# Game Translation Guide — Reference

## Core Philosophy
Game translation is **functional**, not literary. Priority order:
1. Mechanical accuracy (rules must work correctly)
2. Thematic consistency (preserve game's feel)
3. Readability (natural language in target)

If these conflict, mechanical accuracy wins.

---

## Language-Specific Notes

### Italian → English (Eurogames)
Common Italian gaming terms and standard translations:

| Italian | English Translation | Notes |
|---|---|---|
| turno | turn | |
| fase | phase | |
| mano | hand | (of cards) |
| mazzo | deck | |
| punti vittoria / PV | victory points / VP | |
| pedine | pawns / meeples | use "meeple" for wooden figure |
| tessere | tiles | |
| segnalini | tokens / markers | |
| plancia | board / player board | "plancia giocatore" = player board |
| carte | cards | |
| dado / dadi | die / dice | |
| risorsa | resource | |
| costruire | build | |
| acquistare | buy / purchase | |
| scartare | discard | |
| pescare | draw | (a card) |
| piazzare | place / deploy | worker placement context |
| azione | action | |
| fine turno | end of turn | |
| fine partita | end of game | |
| primo giocatore | first player | |
| senso orario | clockwise | |
| antiorario | counter-clockwise | |
| rivelare | reveal | |
| rimescolare | reshuffle | |
| traccia | track | (scoring track, etc.) |
| valore | value | |
| costo | cost | |
| effetto | effect | |
| bonus | bonus | (same) |
| malus | penalty | |
| espansione | expansion | |
| variante | variant | |

### German → English (German-style / Ameritrash)

| German | English |
|---|---|
| Spieler | player |
| Zug | turn / move |
| Karte | card |
| Würfel | die/dice |
| Siegpunkte | victory points |
| Aktionen | actions |
| Rundenende | end of round |
| Spielende | end of game |
| Ressource | resource |
| Gebäude | building |
| Figur | figure / meeple |
| Plättchen | tile |
| Marker | marker |
| Stapel | deck / pile |
| Ablage | discard pile |
| auslegen | place / deploy |
| kaufen | buy |
| bauen | build |
| ziehen | draw |

### Japanese → English (TCGs / Anime Games)

| Japanese | English |
|---|---|
| ターン (tān) | turn |
| フェイズ (feizu) | phase |
| カード (kādo) | card |
| デッキ (dekki) | deck |
| 手札 (tefuda) | hand |
| 墓地 (bochi) | graveyard |
| 攻撃力 (kōgekiryoku) | attack power |
| 守備力 (shubikiryoku) | defense power |
| 効果 (kōka) | effect |
| 召喚 (shōkan) | summon |
| 破壊 (hakai) | destroy |
| 発動 (hatsudō) | activate |
| コスト (kosuto) | cost |
| トークン (tōkun) | token |

### French → English

| French | English |
|---|---|
| joueur | player |
| tour | turn |
| carte | card |
| dé / dés | die / dice |
| points de victoire | victory points |
| action | action |
| défausser | discard |
| piocher | draw |
| ressource | resource |
| tuile | tile |
| pion | pawn / token |
| plateau | board |

---

## Translation Workflow for Images

When translating from an image of a game component:

1. **Describe the physical card/component:**
   > "This appears to be a [action card / event card / player reference / rulebook page] from [game name if identifiable]."

2. **Transcribe text exactly** (even errors) in the source language:
   > *Original text: "[verbatim text]"*

3. **Translate each functional element:**
   - Card Name
   - Card Type / Category
   - Cost (if applicable)
   - Effect text (most important — must be mechanically precise)
   - Flavor text (if any, mark clearly as non-mechanical)
   - Footnotes / restrictions

4. **Flag any unclear elements:**
   > ⚠️ *Translator's note: The phrase "[X]" is ambiguous. It may mean either [interpretation A] or [interpretation B]. Recommend checking official FAQ or errata.*

5. **Output format for cards:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
[CARD NAME] ([ORIGINAL NAME])
Type: [type]    Cost: [cost]
━━━━━━━━━━━━━━━━━━━━━━━━━━
EFFECT:
[Mechanical effect text — precise]

FLAVOR:
"[Flavor text in italics if present]"

RESTRICTIONS: [Any "cannot", "only if", "once per round" clauses]
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Multi-Card Translation (Tables)

For sets of 5 or more cards, output as a Markdown table:

```markdown
| Card Name (EN) | Original Name | Type | Cost | Effect |
|---|---|---|---|---|
| … | … | … | … | … |
```

---

## Rulebook Section Translation

For multi-page rulebooks:
- Translate heading by heading, preserving all numbering
- Preserve all bold / italic emphasis
- Keep all numbered/bulleted lists in the same format
- Add translator's notes inline: *(TN: …)*
- At end of document, include a **Terminology Glossary** table with all translated terms

---

## Quality Check Before Finalizing Translation

- [ ] All game-specific terms translated consistently throughout
- [ ] Mechanical effects are unambiguous
- [ ] No rule information added that wasn't in the original
- [ ] No rule information removed
- [ ] Ambiguous passages flagged, not silently resolved
- [ ] Flavor text clearly marked as non-mechanical
