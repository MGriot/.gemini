# ✈️ travel-designer-pro — Skill Package v2.0

A master AI skill for generating complete, mobile-ready travel itineraries with GPX tracks, verified coordinates, cultural depth, and security briefings.

---

## 📦 Package Contents

| File | Role |
|---|---|
| `SKILL.md` | **Master skill** — all logic embedded. This is the primary file. |
| `best_practices.md` | Data architecture, responsive UI/UX, and map integration guidelines |
| `cultural_research_guide.md` | Wikipedia/Wikivoyage research protocols for cultural depth |
| `geographical_validator.md` | Coordinate verification rules and category mapping |
| `security_protocols.md` | 5-pillar security briefing framework using official gov sources |
| `evals.json` | Test assertions to validate skill output quality |

---

## 🚀 What This Skill Produces

1. **File 1: Places (CSV)** — All POIs with validated lat/lon, category, description, references
2. **File 2: Tracks (GeoJSON)** — Route FeatureCollection for map rendering
3. **File 3: GPX Track (XML)** — Portable `.gpx` for Komoot, Garmin, AllTrails
4. **`trip_hub.html`** — Single self-contained file with:
   - Interactive Leaflet map (Standard + Topographic layers)
   - Color-coded markers with rich popups
   - GPX track overlay with distance/elevation stats
   - In-browser GPX download button
   - 7 tabs: Days · Budget · Phrases · Safety · Prep · GPX · Refs
   - Fully responsive (desktop sidebar + mobile overlay toggle)

---

## 📋 Required Traveler Profile Inputs

- Destination(s), Dates/Month, Duration, Travelers
- Total Budget, Pace (Relaxed/Balanced/Intense), Interests
- Track Generation needed? (Yes/No — for hike/cycle GPX)
- Dietary restrictions, Must-haves, To avoid

---

## 🏁 Quality Gates (auto-checked before output)

- [ ] CSV block labeled `File 1: Places (CSV)`
- [ ] GeoJSON block labeled `File 2: Tracks (GeoJSON/GPX Source)`
- [ ] GPX XML block labeled `File 3: GPX Track (XML)` (if hiking/cycling)
- [ ] `trip_hub.html` with all 7 tabs populated
- [ ] `REFERENCES & CITATIONS` section present
- [ ] GPX has ≥15 trkpt entries + named wpt for trailhead/summit
- [ ] All 5 security pillars addressed with official sources cited

---

## ⚠️ Critical Coordinate Order

| Context | Order |
|---|---|
| GeoJSON geometry | `[longitude, latitude]` |
| Leaflet / CSV | `latitude, longitude` |

These are **opposite** — always double-check.
