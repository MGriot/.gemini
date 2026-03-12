---
name: travel-designer-pro
description: >
  Master Travel Designer — triggers when user wants to plan a trip, research a destination, needs a detailed schedule,
  mentions "Traveler Profile", "Security Briefing", "Geographical Validation", "Google Maps CSV", or "GPX track".
  Produces a single mobile-ready Trip Hub HTML with embedded GPX tracks, verified coordinates, cultural depth,
  security briefing, and formal references. All sub-agent logic (Security, Cultural Research, Geographical Validator)
  is embedded directly in this skill.
---

# ✈️ TRAVEL DESIGNER PRO — DEFINITIVE MASTER SKILL v2.0

---

## 🎯 OBJECTIVE
Transform a **Traveler Profile** into a flawless, logically sound, and emotionally engaging itinerary delivered as:

1. **`File 1: Places (CSV)`** — Static POIs, hotels, restaurants with validated coordinates.
2. **`File 2: Tracks (GeoJSON/GPX Source)`** — GeoJSON FeatureCollection for map rendering.
3. **`File 3: GPX Track (XML)`** — Portable `.gpx` for hiking/cycling apps (Komoot, Garmin, AllTrails).
4. **`trip_hub.html`** — A single, self-contained, mobile-first Trip Hub with map, GPX overlay, all tabs.

> **STRICT RULE:** Always produce Files 1, 2, and 3 as separate explicit code blocks BEFORE generating the HTML. Never skip steps.

---

## 📋 PHASE 0 — INTAKE (Traveler Profile Checklist)
Before starting, confirm you have:

| Field | Required | Notes |
|---|---|---|
| Destination(s) | ✅ | List all cities/regions |
| Dates / Month | ✅ | For weather + open days |
| Duration | ✅ | Number of days |
| Travelers | ✅ | Count + type (couple, family, solo) |
| Budget (Total) | ✅ | Currency |
| Pace | ✅ | Relaxed / Balanced / Intense |
| Interests | ✅ | History, Food, Nature, Adventure… |
| Track Generation? | ✅ | Yes/No — required for hike/cycle routes |
| Dietary Restrictions | Optional | Vegetarian, Halal, Gluten-free… |
| Must-Haves | Optional | Specific sites/experiences |
| To Avoid | Optional | Crowded spots, steep terrain… |

---

## ⚙️ PHASE 1 — LOGICAL VALIDATION & SECURITY BRIEFING

### 1a. Logistical Checks
- **Closed Day Test:** Major museums closed Mondays (Louvre, Uffizi). Temples closed during certain festivals. Always verify opening days for every attraction.
- **Real Distance Test:** Calculate travel time between each stop. Flag if two POIs are >45 min apart on the same half-day.
- **Weather Test:** State average temperature, precipitation likelihood, and "Plan B" indoor alternatives.
- **Pace Check:** Max 4–5 POIs per day for Balanced pace. Max 3 for Relaxed. Up to 7 for Intense.

### 1b. 🛡️ EMBEDDED SECURITY ANALYST (5 Pillars)
*Source from: official government advisories (US State Dept, UK FCDO, Italy "Viaggiare Sicuri", Australia DFAT).*

**Pillar 1 — 🛂 Entry Requirements**
- Passport validity required (months remaining)
- Visa type: None / E-Visa / Visa-on-Arrival / Embassy
- Digital authorizations: ESTA (USA), ETA (Canada/UK/AUS), ETIAS (Schengen from 2025)

**Pillar 2 — 🏥 Health & Medical**
- Mandatory vaccines (e.g., Yellow Fever for certain regions)
- Recommended prophylaxis (Malaria, Dengue, Hepatitis A/B)
- Tap water safety / food hygiene rating
- Travel insurance: Mandatory / Strongly Recommended / Optional
- Nearest quality hospital for each destination

**Pillar 3 — 🛡️ Safety & Security**
- Crime: Pickpocket hotspots vs. violent crime zones
- Civil unrest, strikes, protests (check recent advisories)
- Natural disaster risk (earthquake, typhoon, flood season)
- Risk level: 🟢 Low / 🟡 Moderate / 🔴 High

**Pillar 4 — ⚖️ Local Laws & Customs**
- Strict prohibitions (alcohol, drugs, photography bans, drones)
- LGBTQ+ legal status and safety
- Religious etiquette (dress codes for temples/mosques)
- Local tipping culture

**Pillar 5 — 🆘 Emergency Contacts**
- Local emergency number (e.g., 110 Police / 119 Fire+Ambulance in Japan)
- Nearest embassy for the traveler's home country
- 24h medical hotline if available

> **Output format:** Render as a styled HTML string for the `security` tab in the Trip Hub.

---

## 📝 PHASE 2 — ITINERARY & CULTURAL CONTENT

### 2a. Day-by-Day Structure
For each day, produce:
```
DAY N — [Title with emotional hook, e.g., "Ancient Kyoto at Dawn"]
🌤️ Weather note | 🚌 Transport method
📖 Narrative (2–3 sentences setting the scene)
📍 Places (ordered chronologically, verified coordinates)
🍽️ Food Edit (1 breakfast + 1 lunch + 1 dinner recommendation)
💎 Hidden Gem (1 non-touristy spot, sourced from district-level research)
🔄 Plan B (if weather is bad or site is closed)
```

### 2b. 🏛️ EMBEDDED CULTURAL RESEARCHER PROTOCOL
*Source from: Wikipedia, Wikivoyage, local tourism boards.*

**Context Generation Rules:**
- Always search `[Destination] + History / Architecture / Culture` for each major site.
- Capture: founding date/era, architectural style, UNESCO status, major historical events.
- Use **Wikipedia district articles** for major cities — never rely only on the main city page.
- Follow "See Also" and "Go Next" links on Wikivoyage for hidden gems.

**For each Place Card, include:**
- 🗓️ **"Did You Know?"** — one surprising fact.
- 📜 **"Context"** — 2 sentences connecting the site to its history.
- 💎 **"Hidden Gem Nearby"** — a specific non-touristy spot found in local district research.

**Gastronomy Research:**
- Search `[Destination] cuisine Wikipedia` for authentic regional dishes.
- Include origin story of at least 2 signature dishes (e.g., Kyoto's kaiseki historical context).
- Note: seasonal availability, allergy info, average price.

**Recency Check:**
- If source is pre-2023, cross-reference with Google Maps for current business status.
- Always note "Last verified: [month/year]" for restaurant recommendations.

### 2c. 💰 Detailed Budget Table
Break down per person and total:

| Category | Per Person/Day | Total (N days) | Notes |
|---|---|---|---|
| Flights | — | $ | Return estimate |
| Accommodation | $/night | $ | Category (Budget/Mid/Luxury) |
| Local Transport | $/day | $ | IC Card, JR Pass, etc. |
| Food | $/day | $ | Budget/Mid/Luxury tier |
| Activities & Entry | $/day | $ | Museums, tours |
| Misc / Shopping | — | $ | Buffer 10% |
| **TOTAL** | | **$** | |

### 2d. 🗣️ Useful Phrases (15 minimum)
Format:
```
| Situation | Original Script | Romanization | Pronunciation tip | English Meaning |
```

### 2e. 🧳 Travel Concierge
- **Packing List:** Climate-specific, activity-specific (include hiking gear if track requested)
- **Local Apps:** Transport, maps, translation, food delivery (with App Store/Play Store names)
- **Etiquette:** 5 critical dos and don'ts with cultural explanation

---

## ⚖️ PHASE 3 — GEOGRAPHICAL VALIDATION

### 3a. EMBEDDED GEOGRAPHICAL VALIDATOR PROTOCOL

**Address Verification Rules:**
- Format: `Street Name, Building Number, Postal Code, City, Country`
- Coordinates must land within **50 meters** of the actual entrance — NOT the city center.
- Use decimal degrees to 4+ decimal places (e.g., `35.6586, 139.7454`).
- If uncertain, state `"Verification Needed"` — never fabricate coordinates.

**Category → Color Mapping (strict):**

| Category | Hex Color | Use for |
|---|---|---|
| Food & Drink | `#e67e22` | Restaurants, cafes, bars, markets |
| Nature | `#27ae60` | Parks, gardens, viewpoints, hikes |
| Shopping | `#f1c40f` | Boutiques, markets |
| Culture | `#2980b9` | Museums, art galleries, theaters |
| History | `#8e44ad` | Temples, castles, monuments |
| Adventure | `#c0392b` | Hiking, cycling, sports |
| Relaxation | `#1abc9c` | Spas, onsen, beaches |
| Nightlife | `#2c3e50` | Bars, clubs, izakayas |
| Lodging | `#34495e` | Hotels, ryokans, hostels |
| Transportation | `#7f8c8d` | Stations, airports, ports |
| Essentials | `#e84393` | Pharmacies, hospitals, embassies |

**Pre-output Checklist (run mentally for every row):**
- [ ] Is the address complete and specific?
- [ ] Do Lat/Lon match the entrance (not the city)?
- [ ] Is the category accurate?
- [ ] Is the description ≤150 characters and helpful?
- [ ] Is the reference URL valid?

---

## 🗺️ PHASE 4 — TECHNICAL DATA EXPORT

### 📍 FILE 1: Places (CSV)
Output as a fenced code block labeled `File 1: Places (CSV)`.

**Columns:**
```
Day,Name,Address,Lat,Lon,Category,Color,Description,Reference,OpeningHours,PriceRange
```

Example row:
```
1,Fushimi Inari Taisha,"68 Fukakusa Yabunouchicho, Fushimi-ku, Kyoto 612-0882",34.9671,135.7727,History,#8e44ad,"Iconic vermillion torii gate tunnel. Arrive before 7am to beat crowds.",https://inari.jp,24h,Free
```

---

### 🛣️ FILE 2: Tracks (GeoJSON/GPX Source)
Output as a fenced code block labeled `File 2: Tracks (GeoJSON/GPX Source)`.

Format: GeoJSON `FeatureCollection` with `LineString` features.

**Required properties per feature:**
```json
{
  "type": "Feature",
  "properties": {
    "day": 5,
    "name": "Hakone Hike — Old Tokaido Trail",
    "description": "Classic volcanic ridge walk via Owakudani",
    "distance_km": 8.5,
    "elevation_gain_m": 420,
    "duration_h": 3.5,
    "difficulty": "Moderate",
    "color": "#c0392b"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [139.0261, 35.2329],
      [139.0280, 35.2350],
      ...minimum 10 waypoints for any hiking track...
    ]
  }
}
```

> ⚠️ **Coordinate Order in GeoJSON is [Longitude, Latitude]** — never reverse this.

---

### 🧭 FILE 3: GPX Track (XML)
Output as a fenced code block labeled `File 3: GPX Track (XML)`.

Generate a valid `.gpx` XML file for **every hiking or cycling track** in the itinerary.

**Full GPX template:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TravelDesignerPro"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>TRACK_NAME</name>
    <desc>TRACK_DESCRIPTION</desc>
    <author><name>Travel Designer Pro</name></author>
    <time>YYYY-MM-DDTHH:MM:SSZ</time>
    <bounds minlat="MIN_LAT" minlon="MIN_LON" maxlat="MAX_LAT" maxlon="MAX_LON"/>
  </metadata>

  <!-- Named waypoints (trailhead, summits, viewpoints) -->
  <wpt lat="35.2329" lon="139.0261">
    <name>Trailhead — Hakone-Yumoto Station</name>
    <desc>Start of the Old Tokaido Trail hike</desc>
    <sym>Trailhead</sym>
  </wpt>
  <wpt lat="35.2507" lon="139.0213">
    <name>Owakudani — Volcanic Valley Viewpoint</name>
    <desc>Active volcanic area. Stay on marked paths.</desc>
    <sym>Summit</sym>
  </wpt>

  <!-- Track -->
  <trk>
    <name>TRACK_NAME</name>
    <desc>TRACK_DESCRIPTION — Distance: X km, Elevation gain: Y m</desc>
    <type>hiking</type>
    <trkseg>
      <!-- Minimum 15 trkpt entries for a realistic track -->
      <trkpt lat="35.2329" lon="139.0261"><ele>110</ele><time>2025-01-01T08:00:00Z</time></trkpt>
      <trkpt lat="35.2341" lon="139.0268"><ele>125</ele><time>2025-01-01T08:10:00Z</time></trkpt>
      <!-- ... continue with realistic elevation progression ... -->
    </trkseg>
  </trk>
</gpx>
```

**GPX Quality Rules:**
- Include realistic `<ele>` (elevation in meters) for every `<trkpt>`.
- Space waypoints ~200–500m apart for hiking tracks.
- Include at minimum: trailhead wpt, summit/peak wpt, endpoint wpt.
- Times should be sequential and realistic (pace: ~3 km/h hiking, ~15 km/h cycling).
- `<bounds>` must reflect actual min/max of all coordinates.

---

## 📚 PHASE 5 — REFERENCES & CITATIONS

Label section: `REFERENCES & CITATIONS`

Organize by category:
```
### 🏨 Accommodation
- [Hotel Name] — Source: [Booking.com / TripAdvisor / Official Site] | Rating: X.X/5 | Reason chosen: [brief note]

### 🍽️ Restaurants
- [Name] — Source: [Michelin Guide / Tabelog / Google Maps 4.5+] | Cuisine: | Avg price: 

### 🏛️ Attractions
- [Name] — Source: [Official tourism site / Wikipedia / Wikivoyage] | URL: 

### 🛡️ Security Sources
- Entry requirements: [Japan Tourism Agency / Official Embassy site] | Last checked: [date]
- Safety advisory: [US State Dept / UK FCDO] | Risk level: 🟢/🟡/🔴

### 🌦️ Weather
- Source: [Japan Meteorological Agency / climate-data.org] | Data period: historical average for [month]

### 🗺️ Maps & GPX
- Coordinates verified via: [Google Maps / OpenStreetMap / official trail map]
- GPX elevation data: [OpenTopoData / official trail authority]
```

---

## 🌐 PHASE 6 — THE UNIFIED TRIP HUB (HTML)

Generate a **single self-contained** `trip_hub.html` file.

### Design Principles (from Frontend Design Skill)
- Choose a **bold, context-specific aesthetic** — not generic blues and whites.
- For Japan: use deep indigo/cream/gold palette with subtle washi paper texture.
- For adventure trips: use dark forest greens with sharp amber accents.
- Typography: import a distinctive Google Font pair. Avoid Inter/Roboto/Arial.
- Animations: subtle card hover lifts, smooth tab transitions, marker pulse on hover.
- The map takes the full right panel on desktop; full screen on mobile with sidebar overlay.

### Required Tabs:
| Tab ID | Content |
|---|---|
| `itinerary` | Day sections with place cards, narrative, hidden gem |
| `budget` | Full budget breakdown table |
| `phrases` | Language guide table |
| `security` | Security briefing (all 5 pillars) |
| `prep` | Packing list + apps + etiquette |
| `gpx` | **NEW:** GPX download section with track stats |
| `refs` | References & citations |

### Map Features:
- **Layer toggle:** Standard (OSM) + Topographic (OpenTopoMap) — essential for hike days
- **Tracks layer:** GeoJSON LineStrings with color coding and popup (distance, elevation gain, difficulty)
- **Markers:** Color-coded circle markers by category with rich popups
- **Fit bounds:** Auto-zoom to fit all markers + tracks on load
- **GPX export button:** Downloads the GPX XML file directly from the browser

---

### 📦 DEFINITIVE TRIP HUB TEMPLATE v2.0

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title id="page-title">Trip Hub</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --ink:     #1a1a2e;
      --deep:    #16213e;
      --mid:     #0f3460;
      --gold:    #e2b96f;
      --cream:   #fdf6ec;
      --muted:   #8a8fa8;
      --card-bg: #ffffff;
      --border:  #e8e4dd;
      --radius:  12px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: var(--cream);
      color: var(--ink);
      display: flex;
      height: 100dvh;
      overflow: hidden;
    }

    /* ── SIDEBAR ── */
    #sidebar {
      width: 460px; min-width: 460px;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--card-bg);
      border-right: 1px solid var(--border);
      box-shadow: 4px 0 20px rgba(0,0,0,0.06);
      z-index: 1000;
      transition: transform 0.35s cubic-bezier(.4,0,.2,1);
    }

    /* ── HERO ── */
    .hero {
      background: linear-gradient(145deg, var(--ink) 0%, var(--mid) 100%);
      color: #fff;
      padding: 28px 24px 22px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .hero-flag { font-size: 2.2rem; margin-bottom: 8px; }
    .hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: 1.55rem; font-weight: 900;
      line-height: 1.2; letter-spacing: -0.5px;
      position: relative;
    }
    .hero-meta {
      margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;
      position: relative;
    }
    .hero-tag {
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.9);
      font-size: 0.72rem; font-weight: 600;
      padding: 3px 10px; border-radius: 20px;
      letter-spacing: 0.5px; text-transform: uppercase;
    }

    /* ── TABS ── */
    .tabs {
      display: flex; gap: 0;
      background: var(--deep);
      overflow-x: auto; scrollbar-width: none;
      flex-shrink: 0;
    }
    .tabs::-webkit-scrollbar { display: none; }
    .tab-btn {
      flex: 1; min-width: 52px;
      background: none; border: none; border-bottom: 3px solid transparent;
      color: rgba(255,255,255,0.45);
      padding: 11px 10px; cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 0.75rem;
      white-space: nowrap; letter-spacing: 0.3px;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: rgba(255,255,255,0.8); }
    .tab-btn.active {
      color: var(--gold);
      border-bottom-color: var(--gold);
      background: rgba(255,255,255,0.04);
    }

    /* ── CONTENT PANES ── */
    .content-pane { display: none; padding: 20px; overflow-y: auto; flex: 1; }
    .content-pane.active { display: block; }

    /* ── DAY SECTIONS ── */
    .day-section {
      margin-bottom: 28px;
      border-left: 3px solid var(--gold);
      padding-left: 16px;
    }
    .day-label {
      font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 2px; color: var(--gold); margin-bottom: 4px;
    }
    .day-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.25rem; color: var(--ink); margin-bottom: 6px;
    }
    .day-narrative { font-size: 0.82rem; color: var(--muted); line-height: 1.65; margin-bottom: 12px; }

    /* ── PLACE CARDS ── */
    .place-card {
      background: var(--cream);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 13px 14px;
      margin: 8px 0;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      position: relative;
      padding-left: 18px;
    }
    .place-card::before {
      content: '';
      position: absolute; left: 0; top: 0; bottom: 0;
      width: 4px; border-radius: 4px 0 0 4px;
      background: var(--cat-color, var(--gold));
    }
    .place-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      border-color: var(--cat-color, var(--gold));
    }
    .place-cat {
      font-size: 0.6rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: 1.2px; color: var(--cat-color, var(--muted));
      margin-bottom: 3px;
    }
    .place-name { font-size: 0.95rem; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
    .place-desc { font-size: 0.78rem; color: var(--muted); line-height: 1.5; }
    .place-meta {
      display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;
    }
    .place-badge {
      font-size: 0.65rem; background: rgba(0,0,0,0.05);
      border-radius: 4px; padding: 2px 7px; color: var(--muted);
    }

    /* ── TABLES ── */
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.85rem; }
    th { background: var(--deep); color: var(--gold); font-weight: 700; padding: 10px 12px; text-align: left; font-size: 0.75rem; letter-spacing: 0.5px; text-transform: uppercase; }
    td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(0,0,0,0.015); }

    /* ── SECTION HEADERS ── */
    .section-header {
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem; font-weight: 700;
      color: var(--ink); margin: 20px 0 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--gold);
      display: flex; align-items: center; gap: 8px;
    }

    /* ── GPX PANEL ── */
    .gpx-card {
      background: linear-gradient(135deg, var(--ink), var(--mid));
      border-radius: var(--radius);
      padding: 20px; color: #fff; margin: 12px 0;
    }
    .gpx-card h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; margin-bottom: 6px; color: var(--gold); }
    .gpx-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
    .gpx-stat { background: rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 12px; }
    .gpx-stat-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.6; }
    .gpx-stat-value { font-size: 1.1rem; font-weight: 700; color: var(--gold); }
    .gpx-download-btn {
      display: block; width: 100%;
      background: var(--gold); color: var(--ink);
      border: none; border-radius: 8px;
      padding: 12px; font-weight: 700; font-size: 0.9rem;
      cursor: pointer; text-align: center; margin-top: 10px;
      transition: opacity 0.2s;
    }
    .gpx-download-btn:hover { opacity: 0.85; }

    /* ── SECURITY BADGES ── */
    .risk-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 12px; border-radius: 20px;
      font-size: 0.75rem; font-weight: 700;
    }
    .risk-low { background: #d4edda; color: #155724; }
    .risk-mod { background: #fff3cd; color: #856404; }
    .risk-high { background: #f8d7da; color: #721c24; }

    .pillar {
      background: var(--cream); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 14px; margin: 10px 0;
    }
    .pillar h4 { font-size: 0.85rem; font-weight: 700; color: var(--mid); margin-bottom: 8px; }
    .pillar ul { padding-left: 18px; font-size: 0.82rem; color: #444; line-height: 1.8; }

    /* ── REFERENCES ── */
    .ref-item {
      font-size: 0.78rem; padding: 8px 0;
      border-bottom: 1px solid var(--border);
      color: #555; line-height: 1.5;
    }
    .ref-item a { color: var(--mid); text-decoration: none; font-weight: 600; }
    .ref-item a:hover { text-decoration: underline; }

    /* ── MAP ── */
    #map { flex: 1; height: 100%; }

    /* ── MOBILE TOGGLE ── */
    #mobile-toggle {
      display: none;
      position: fixed; bottom: 24px; right: 20px; z-index: 2000;
      background: var(--ink); color: var(--gold);
      border: 2px solid var(--gold);
      padding: 12px 24px; border-radius: 30px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 700; font-size: 0.9rem;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      cursor: pointer; letter-spacing: 0.5px;
    }

    /* ── MOBILE ── */
    @media (max-width: 768px) {
      body { flex-direction: column; }
      #sidebar {
        width: 100%; min-width: unset;
        position: absolute; height: 100%;
        transform: translateY(100%);
      }
      #sidebar.active { transform: translateY(0); }
      #map { height: 100dvh; width: 100vw; }
      #mobile-toggle { display: block; }
    }

    /* ── SCROLL ── */
    #itinerary, #budget, #phrases, #security, #prep, #gpx, #refs {
      scroll-behavior: smooth;
    }
  </style>
</head>
<body>

<button id="mobile-toggle" onclick="toggleSidebar()">🗺 View List</button>

<div id="sidebar">
  <div class="hero">
    <div class="hero-flag" id="trip-flag">🌍</div>
    <h1 id="trip-title">Trip Hub</h1>
    <div class="hero-meta" id="trip-meta"></div>
  </div>

  <div class="tabs">
    <button class="tab-btn active" onclick="showTab('itinerary',this)">🗓 Days</button>
    <button class="tab-btn" onclick="showTab('budget',this)">💰 Budget</button>
    <button class="tab-btn" onclick="showTab('phrases',this)">🗣 Phrases</button>
    <button class="tab-btn" onclick="showTab('security',this)">🛡 Safety</button>
    <button class="tab-btn" onclick="showTab('prep',this)">🧳 Prep</button>
    <button class="tab-btn" onclick="showTab('gpx',this)">🧭 GPX</button>
    <button class="tab-btn" onclick="showTab('refs',this)">📚 Refs</button>
  </div>

  <div id="itinerary" class="content-pane active"></div>
  <div id="budget"    class="content-pane"></div>
  <div id="phrases"   class="content-pane"></div>
  <div id="security"  class="content-pane"></div>
  <div id="prep"      class="content-pane"></div>
  <div id="gpx"       class="content-pane"></div>
  <div id="refs"      class="content-pane"></div>
</div>

<div id="map"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
// ═══════════════════════════════════════════════════════
//  INJECT ALL DATA HERE — replace placeholders below
// ═══════════════════════════════════════════════════════
const tripData = {
  flag: "🗾",
  title: "Japan: Tokyo & Kyoto",
  tags: ["7 Days", "2 Travelers", "$5,000", "Balanced Pace"],

  budget: `<div class="section-header">💰 Budget Breakdown</div>
    <table>
      <tr><th>Category</th><th>Per Person</th><th>Total</th><th>Notes</th></tr>
      <!-- FILL IN ROWS -->
    </table>`,

  phrases: `<div class="section-header">🗣️ Essential Japanese</div>
    <table>
      <tr><th>Situation</th><th>Japanese</th><th>Romaji</th><th>Pronunciation</th><th>Meaning</th></tr>
      <!-- FILL IN ROWS -->
    </table>`,

  security: `<div class="section-header">🛡️ Security Briefing</div>
    <!-- FILL IN SECURITY HTML USING PILLAR CLASSES -->`,

  concierge: `<div class="section-header">🧳 Travel Prep</div>
    <!-- FILL IN PACKING LIST, APPS, ETIQUETTE -->`,

  references: `<div class="section-header">📚 References & Citations</div>
    <!-- FILL IN REF ITEMS -->`,

  // GPX data for download
  gpxFiles: [
    {
      name: "Hakone Old Tokaido Hike",
      day: 5,
      distance_km: 8.5,
      elevation_gain_m: 420,
      duration_h: 3.5,
      difficulty: "Moderate",
      // Full GPX XML string
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TravelDesignerPro" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>Hakone Old Tokaido Trail</name></metadata>
  <wpt lat="35.2329" lon="139.0261"><name>Trailhead</name></wpt>
  <trk><name>Hakone Hike</name><trkseg>
    <trkpt lat="35.2329" lon="139.0261"><ele>110</ele></trkpt>
    <!-- ADD MORE TRKPTS -->
  </trkseg></trk>
</gpx>`
    }
  ],

  days: [
    {
      dayLabel: "Day 1",
      title: "Arrival in Tokyo",
      narrative: "Touch down at Narita and ease into the city. Tonight is for noodles and neon.",
      places: [
        {
          name: "Shinjuku Station",
          lat: 35.6896, lon: 139.7006,
          category: "Transportation", color: "#7f8c8d",
          description: "World's busiest station — follow the South Exit signs.",
          hours: "24h", price: "Free",
          ref: "https://www.jreast.co.jp/e/stations/e1130.html",
          didYouKnow: "Shinjuku Station has 200 exits and sees 3.5M passengers daily.",
          hiddenGem: "Kabukicho Ichiban-gai alley — ramen stalls open until 4am."
        }
      ]
    }
  ],

  tracks: {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "name": "Hakone Old Tokaido Trail",
          "day": 5, "distance_km": 8.5,
          "elevation_gain_m": 420, "difficulty": "Moderate",
          "color": "#c0392b"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [139.0261, 35.2329],
            [139.0275, 35.2345],
            [139.0213, 35.2507]
            // ADD MORE COORDS
          ]
        }
      }
    ]
  }
};

// ═══════════════════════════════════════════════════════
//  CATEGORY COLORS
// ═══════════════════════════════════════════════════════
const CAT_COLORS = {
  "Food & Drink":"#e67e22","Nature":"#27ae60","Shopping":"#f1c40f",
  "Culture":"#2980b9","History":"#8e44ad","Adventure":"#c0392b",
  "Relaxation":"#1abc9c","Nightlife":"#2c3e50","Lodging":"#34495e",
  "Transportation":"#7f8c8d","Essentials":"#e84393"
};

// ═══════════════════════════════════════════════════════
//  UI INIT
// ═══════════════════════════════════════════════════════
document.title = tripData.title + " — Trip Hub";
document.getElementById('page-title').textContent = tripData.title + " — Trip Hub";
document.getElementById('trip-flag').textContent = tripData.flag;
document.getElementById('trip-title').textContent = tripData.title;

const metaEl = document.getElementById('trip-meta');
(tripData.tags || []).forEach(t => {
  const s = document.createElement('span');
  s.className = 'hero-tag'; s.textContent = t;
  metaEl.appendChild(s);
});

document.getElementById('budget').innerHTML   = tripData.budget;
document.getElementById('phrases').innerHTML  = tripData.phrases;
document.getElementById('security').innerHTML = tripData.security;
document.getElementById('prep').innerHTML     = tripData.concierge;
document.getElementById('refs').innerHTML     = tripData.references;

// ── GPX PANEL ──
const gpxPane = document.getElementById('gpx');
gpxPane.innerHTML = `<div class="section-header">🧭 GPX Tracks</div>`;
(tripData.gpxFiles || []).forEach((g, i) => {
  const card = document.createElement('div');
  card.className = 'gpx-card';
  card.innerHTML = `
    <h3>${g.name}</h3>
    <div style="font-size:0.75rem;opacity:0.65;margin-bottom:8px">Day ${g.day} • ${g.difficulty}</div>
    <div class="gpx-stats">
      <div class="gpx-stat"><div class="gpx-stat-label">Distance</div><div class="gpx-stat-value">${g.distance_km} km</div></div>
      <div class="gpx-stat"><div class="gpx-stat-label">Elevation ↑</div><div class="gpx-stat-value">${g.elevation_gain_m} m</div></div>
      <div class="gpx-stat"><div class="gpx-stat-label">Duration</div><div class="gpx-stat-value">${g.duration_h} h</div></div>
      <div class="gpx-stat"><div class="gpx-stat-label">Difficulty</div><div class="gpx-stat-value">${g.difficulty}</div></div>
    </div>
    <button class="gpx-download-btn" onclick="downloadGPX(${i})">⬇ Download ${g.name}.gpx</button>`;
  gpxPane.appendChild(card);
});

// ── ITINERARY ──
const itinEl = document.getElementById('itinerary');
const allMarkers = L.featureGroup();

tripData.days.forEach(day => {
  const sec = document.createElement('div');
  sec.className = 'day-section';
  sec.innerHTML = `
    <div class="day-label">${day.dayLabel}</div>
    <div class="day-title">${day.title}</div>
    <div class="day-narrative">${day.narrative}</div>
    <div class="places-list"></div>`;

  const placesList = sec.querySelector('.places-list');
  (day.places || []).forEach(p => {
    const color = p.color || CAT_COLORS[p.category] || "#888";

    // Map marker
    const marker = L.circleMarker([p.lat, p.lon], {
      radius: 9, fillColor: color, color: "#fff",
      weight: 2.5, opacity: 1, fillOpacity: 0.92
    }).bindPopup(`
      <div style="font-family:'DM Sans',sans-serif;min-width:200px">
        <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:1px;color:${color};font-weight:800">${p.category}</div>
        <div style="font-size:1rem;font-weight:700;margin:3px 0">${p.name}</div>
        <div style="font-size:0.8rem;color:#555;margin-bottom:6px">${p.description}</div>
        ${p.hours ? `<div style="font-size:0.75rem">🕐 ${p.hours}</div>` : ''}
        ${p.price ? `<div style="font-size:0.75rem">💰 ${p.price}</div>` : ''}
        ${p.didYouKnow ? `<div style="font-size:0.75rem;margin-top:6px;padding:6px;background:#f9f6f0;border-radius:6px">💡 ${p.didYouKnow}</div>` : ''}
        ${p.ref ? `<a href="${p.ref}" target="_blank" style="font-size:0.75rem;color:#0f3460;font-weight:600;display:block;margin-top:6px">🔗 Source / Reference</a>` : ''}
      </div>`);
    allMarkers.addLayer(marker);

    // Sidebar card
    const card = document.createElement('div');
    card.className = 'place-card';
    card.style.setProperty('--cat-color', color);
    card.innerHTML = `
      <div class="place-cat">${p.category}</div>
      <div class="place-name">${p.name}</div>
      <div class="place-desc">${p.description}</div>
      <div class="place-meta">
        ${p.hours ? `<span class="place-badge">🕐 ${p.hours}</span>` : ''}
        ${p.price ? `<span class="place-badge">💰 ${p.price}</span>` : ''}
        ${p.hiddenGem ? `<span class="place-badge">💎 Gem nearby</span>` : ''}
      </div>`;
    card.onclick = () => {
      map.flyTo([p.lat, p.lon], 16, { duration: 1.2 });
      marker.openPopup();
      if (window.innerWidth <= 768) toggleSidebar();
    };
    placesList.appendChild(card);
  });

  itinEl.appendChild(sec);
});

// ═══════════════════════════════════════════════════════
//  MAP
// ═══════════════════════════════════════════════════════
const osm   = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' });
const topo  = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',  { attribution: '© OpenTopoMap' });

const map = L.map('map', {
  center: [35.6762, 139.6503], zoom: 10,
  layers: [osm], preferCanvas: true
});

L.control.layers({ "🗺 Standard": osm, "⛰ Topographic": topo }, {}, { position: 'topright' }).addTo(map);

allMarkers.addTo(map);

const tracksLayer = L.geoJSON(tripData.tracks, {
  style: f => ({ color: f.properties.color || "#c0392b", weight: 4, opacity: 0.8, dashArray: null }),
  onEachFeature: (feature, layer) => {
    const p = feature.properties;
    layer.bindPopup(`
      <b style="font-family:'DM Sans',sans-serif">${p.name}</b><br>
      <small>📏 ${p.distance_km} km &nbsp;|&nbsp; ↑ ${p.elevation_gain_m} m &nbsp;|&nbsp; ${p.difficulty}</small>`);
  }
}).addTo(map);

// Fit all bounds
const combined = L.featureGroup([allMarkers, tracksLayer]);
if (combined.getBounds().isValid()) {
  map.fitBounds(combined.getBounds().pad(0.15));
}

// ═══════════════════════════════════════════════════════
//  INTERACTIONS
// ═══════════════════════════════════════════════════════
function showTab(id, btn) {
  document.querySelectorAll('.content-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (btn) btn.classList.add('active');
}

function toggleSidebar() {
  const sb  = document.getElementById('sidebar');
  const btn = document.getElementById('mobile-toggle');
  sb.classList.toggle('active');
  btn.textContent = sb.classList.contains('active') ? '🗺 View Map' : '🗺 View List';
}

function downloadGPX(index) {
  const g = tripData.gpxFiles[index];
  if (!g || !g.xml) return alert('GPX data not available.');
  const blob = new Blob([g.xml], { type: 'application/gpx+xml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = g.name.replace(/\s+/g, '_') + '.gpx';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
</body>
</html>
```

---

## 🌍 TRAVEL CONCIERGE — FINAL WRAP-UP

### Packing List Template
- **Documents:** Passport, travel insurance print, emergency contacts card, IC card / transport card
- **Electronics:** Universal adapter, portable battery (≥20,000mAh), earbuds, camera
- **Clothing:** Layers for shrine/temple visits (covered shoulders + knees), comfortable walking shoes, rain jacket
- **Hiking specific (if Track requested):** Trail shoes with grip, trekking poles, blister plasters, electrolyte sachets, headlamp
- **Health:** Prescription meds (+ copy of prescription), hand sanitizer, N95 mask (Japan context), basic first aid

### Local Apps Template (Japan example)
| App | Purpose | Platform |
|---|---|---|
| Suica / Pasmo | IC transport card | iOS/Android |
| Google Maps | Navigation + transit | iOS/Android |
| Google Translate | Camera + voice translation | iOS/Android |
| Tabelog | Restaurant discovery & reviews | iOS/Android |
| Japan Official Travel App | Real-time disaster alerts | iOS/Android |
| Komoot / AllTrails | GPX navigation for hikes | iOS/Android |

### Etiquette Highlights Template
1. 🚇 **Trains:** No phone calls, speak quietly, give up priority seats
2. 🏯 **Temples/Shrines:** No loud conversations, shoes off where indicated, rinse hands at temizuya
3. 🍜 **Restaurants:** Slurping noodles is polite; tipping is offensive in Japan
4. 🗑 **Waste:** No public bins — carry a small bag for trash
5. 📸 **Photography:** Always ask permission for portraits; some shrines ban photos of main hall

---

## 💡 EXPERT GUIDANCE — QUALITY GATES

Before outputting, run this final checklist:

| Gate | Check |
|---|---|
| ✅ File 1 present | CSV block labeled `File 1: Places (CSV)` exists |
| ✅ File 2 present | GeoJSON block labeled `File 2: Tracks (GeoJSON/GPX Source)` exists |
| ✅ File 3 present | GPX XML block labeled `File 3: GPX Track (XML)` exists (if hiking/cycling) |
| ✅ trip_hub.html | HTML file generated with all tabs populated |
| ✅ References | `REFERENCES & CITATIONS` section present |
| ✅ GPX quality | ≥15 trkpt entries, realistic elevation, wpt for trailhead + summit |
| ✅ GeoJSON order | Coordinates are [Lon, Lat] order (GeoJSON standard) |
| ✅ Leaflet order | L.marker uses [Lat, Lon] order (Leaflet standard) |
| ✅ Security | All 5 pillars addressed with official source cited |
| ✅ Cultural depth | Every place has "Did You Know" + "Hidden Gem" |
| ✅ Mobile ready | toggleSidebar() logic preserved, tab scrolling works |
| ✅ GPX download | downloadGPX() function wired to button in GPX tab |

> **Coordinate Order Warning (common LLM error):**
> - GeoJSON geometry: `[longitude, latitude]` (e.g., `[139.7454, 35.6586]`)
> - Leaflet/CSV: `latitude, longitude` (e.g., `35.6586, 139.7454`)
> These are OPPOSITE — always double-check before outputting.
