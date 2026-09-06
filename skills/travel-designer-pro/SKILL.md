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

The full template lives in **`assets/trip-hub-template.html`** — read it when you are ready to
generate the Hub, not before. It is a complete self-contained page: Leaflet map, sidebar with
seven tabs (Days, Budget, Phrases, Safety, Prep, GPX, Refs), category-coloured markers, GeoJSON
tracks, and working GPX download buttons.

**How to use it**

1. Read `assets/trip-hub-template.html`.
2. Everything you fill in goes into the single `const tripData = { ... }` object marked
   `INJECT ALL DATA HERE`. Nothing else in the file needs to change — the CSS, the tab
   switching, the map wiring, and the GPX export all read from that object.
3. Fill each field:

   | Field | Contents |
   |:---|:---|
   | `flag`, `title`, `tags` | Header emoji, trip name, and the meta chips (duration, travellers, budget, pace). |
   | `budget` | HTML string — complete the `<table>` rows. |
   | `phrases` | HTML string — one row per phrase, minimum 15. |
   | `security` | HTML string — the 5-pillar briefing, using the pillar CSS classes. |
   | `concierge` | HTML string — packing list, local apps, etiquette. |
   | `references` | HTML string — one item per source. |
   | `gpxFiles[]` | One entry per track: name, day, distance, elevation, difficulty, and the full GPX XML in `xml`. |
   | `days[]` | One entry per day: `dayLabel`, `title`, `narrative`, and a `places[]` array. |
   | `days[].places[]` | `name`, `lat`, `lon`, `category`, `description`, `hours`, `price`, `ref`, `didYouKnow`, `hiddenGem`. |
   | `tracks` | A GeoJSON `FeatureCollection` whose LineString coordinates are `[lon, lat]`. |

4. Replace every `<!-- FILL IN ... -->` and `// ADD MORE ...` comment. Leaving one in ships a
   visibly broken Hub.
5. `category` must be one of the keys in `CAT_COLORS` (Food & Drink, Nature, Shopping, Culture,
   History, Adventure, Relaxation, Nightlife, Lodging, Transportation, Essentials), or the
   marker falls back to grey.
6. Watch the coordinate order: markers take `lat, lon`; GeoJSON coordinates take `[lon, lat]`.
   Reversing them puts the trip in the wrong hemisphere — see PHASE 3.

**Do not** paste the template into your reply. Write it to a file.

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
