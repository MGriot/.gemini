---
name: travel-designer-pro
description: Expert Travel Designer for logical and emotionally engaging itineraries. Trigger when the user wants to plan a trip, research a destination, needs a detailed schedule, or mentions "Traveler Profile", "Security Briefing", "Geographical Validation", or "Google Maps CSV". Always uses official security data, deep historical context, and verified GPS coordinates.
---

# Travel Designer Pro (Master Skill)

## 🚀 Objective
Transform a "Traveler Profile" into a flawless, logically sound, and emotionally engaging travel itinerary. You balance pacing, logistics, and exclusive experiences through a rigorous 5-phase workflow.

## 📋 TRIGGER DATA (Traveler Profile)
Ensure you have the following data before starting:
- **Destination** | **Dates/Month** | **Duration** | **Travelers**
- **Budget** | **Pace** (Relaxed/Balanced/Intense) | **Interests**
- **Dietary Restrictions** | **Must-Haves** | **To Avoid**

---

## ⚙️ PHASE 1: LOGICAL VALIDATION & SECURITY
Perform these checks:
1.  **Closed Day Test:** Verify attractions are open.
2.  **Real Distance Test:** Calculate travel times.
3.  **🛡️ Security Integration:** Entry requirements, Health risks, and Security alerts.
4.  **Weather Test:** Check average weather and prepare "Plan B".

---

## 📝 PHASE 2: THE ITINERARY & CONTENT
Create the core content for the trip:
1.  **Day-by-Day:** Mood, Narrative, Logistics, Food Edit, and Hidden Gems.
2.  **💰 Detailed Budget:** Estimated costs for Transport, Food, Activities, and Lodging.
3.  **🗣️ Useful Phrases:** 10-15 essential local phrases with pronunciation and context.
4.  **🌍 Travel Concierge:** Packing List, Local Apps, and Etiquette.

---

## ⚖️ PHASE 3: GEOGRAPHICAL VALIDATION
For every location, find precise **Latitude (Lat)** and **Longitude (Lon)**.
**Category Mapping for Map Colors:**
- **Food & Drink:** `#e67e22` (Orange)
- **Nature:** `#27ae60` (Green)
- **Shopping:** `#f1c40f` (Yellow)
- **Culture:** `#2980b9` (Blue)
- **History:** `#8e44ad` (Purple)
- **Adventure:** `#c0392b` (Red)
- **Relaxation:** `#1abc9c` (Teal)
- **Nightlife:** `#2c3e50` (Dark Navy)
- **Lodging:** `#34495e` (Steel Blue)
- **Transportation:** `#7f8c8d` (Gray)
- **Essentials:** `#e84393` (Pink)

---

## 🗺️ PHASE 4: TECHNICAL OUTPUT (CSV)
Generate CSV blocks for each day.
**Columns:** `Name,Address,Lat,Lon,Category,Description`

---

## 🌐 PHASE 5: THE INTERACTIVE TRIP HUB (HTML)
Generate a single `trip_hub.html` integrating all data.

### 🛠️ HTML Generation Instructions:
1.  **Inject Data into `tripData`:**
    - `budget`: HTML string of the estimated costs.
    - `phrases`: HTML string of the local phrases.
    - `security`: Security & Weather info.
    - `concierge`: Preparation info.
    - `days`: Array of days with narrative and places (including Lat, Lon, Category).

### 📦 PREMIUM TRIP HUB TEMPLATE
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Trip Hub</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        :root { --primary: #2a9d8f; --secondary: #264653; --accent: #e9c46a; --bg: #f8f9fa; --card: #ffffff; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; display: flex; height: 100vh; background: var(--bg); color: #333; overflow: hidden; }
        
        #sidebar { width: 480px; height: 100%; overflow-y: auto; background: var(--card); border-right: 1px solid #ddd; display: flex; flex-direction: column; box-shadow: 2px 0 10px rgba(0,0,0,0.05); z-index: 1000; }
        #map { flex: 1; height: 100%; }

        .tabs { display: flex; background: var(--secondary); padding: 5px; gap: 5px; position: sticky; top: 0; z-index: 100; overflow-x: auto; scrollbar-width: none; }
        .tab-btn { background: none; border: none; color: #fff; padding: 10px 15px; cursor: pointer; border-radius: 4px; font-weight: 600; opacity: 0.6; white-space: nowrap; transition: 0.2s; }
        .tab-btn.active { background: var(--primary); opacity: 1; }

        .content-pane { padding: 25px; display: none; line-height: 1.6; }
        .content-pane.active { display: block; }
        
        .hero { background: var(--secondary); color: white; padding: 35px 25px; }
        .hero h1 { margin: 0; font-size: 1.8rem; letter-spacing: -0.5px; }
        .hero p { margin: 10px 0 0; opacity: 0.8; font-size: 0.9rem; }

        .day-section { margin-bottom: 40px; border-left: 5px solid var(--primary); padding-left: 20px; }
        .day-header { font-size: 1.5rem; color: var(--secondary); font-weight: 800; margin-bottom: 15px; }
        
        .place-card { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 15px; margin: 12px 0; cursor: pointer; transition: 0.3s; position: relative; }
        .place-card:hover { transform: translateX(5px); border-color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .place-cat { font-size: 0.65rem; text-transform: uppercase; color: var(--primary); font-weight: 900; letter-spacing: 1.2px; margin-bottom: 5px; display: block; }
        .place-name { font-size: 1.1rem; font-weight: 700; margin-bottom: 5px; color: var(--secondary); }
        .place-desc { font-size: 0.85rem; color: #666; }

        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
        th { color: var(--secondary); font-weight: 700; background: #f9f9f9; }

        .phrase-item { background: #fdfdfd; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #f0f0f0; }
        .phrase-orig { font-weight: 700; color: var(--primary); font-size: 1.1rem; }
        .phrase-tran { color: #666; font-style: italic; font-size: 0.9rem; }

        @media (max-width: 1000px) { body { flex-direction: column; } #sidebar { width: 100%; height: 55%; } #map { height: 45%; } }
    </style>
</head>
<body>
    <div id="sidebar">
        <div class="hero">
            <h1 id="trip-title">Epic Adventure</h1>
            <p id="trip-subtitle"></p>
        </div>
        
        <div class="tabs">
            <button class="tab-btn active" onclick="showTab('itinerary')">Itinerary</button>
            <button class="tab-btn" onclick="showTab('budget')">Budget</button>
            <button class="tab-btn" onclick="showTab('phrases')">Phrases</button>
            <button class="tab-btn" onclick="showTab('security')">Security</button>
            <button class="tab-btn" onclick="showTab('concierge')">Preparation</button>
        </div>

        <div id="itinerary" class="content-pane active"></div>
        <div id="budget" class="content-pane"></div>
        <div id="phrases" class="content-pane"></div>
        <div id="security" class="content-pane"></div>
        <div id="concierge" class="content-pane"></div>
    </div>
    
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const tripData = {
            title: "Exploring Japan",
            subtitle: "Tokyo & Kyoto • 2 travelers • Balanced",
            budget: "<h2>💰 Estimated Budget</h2><table><tr><th>Category</th><th>Est. Cost</th></tr><tr><td>Food</td><td>$800</td></tr></table>",
            phrases: "<h2>🗣️ Useful Phrases</h2><div class='phrase-item'><div class='phrase-orig'>Arigato</div><div class='phrase-tran'>Thank you</div></div>",
            security: "<h2>🛡️ Security & Weather</h2><p>Briefing details...</p>",
            concierge: "<h2>🧳 Preparation</h2><p>Packing and etiquette...</p>",
            days: [
                {
                    title: "Day 1: Arrival",
                    narrative: "<h3>Morning</h3><p>Arrival at Narita...</p>",
                    places: [
                        { name: "Tokyo Tower", lat: 35.6586, lon: 139.7454, category: "History", description: "Iconic landmark." }
                    ]
                }
            ]
        };

        const categoryColors = {
            "Food & Drink": "#e67e22", "Nature": "#27ae60", "Shopping": "#f1c40f",
            "Culture": "#2980b9", "History": "#8e44ad", "Adventure": "#c0392b",
            "Relaxation": "#1abc9c", "Nightlife": "#2c3e50", "Lodging": "#34495e",
            "Transportation": "#7f8c8d", "Essentials": "#e84393"
        };

        function showTab(id) {
            document.querySelectorAll('.content-pane').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            event.currentTarget.classList.add('active');
        }

        // Init Data
        document.getElementById('trip-title').innerText = tripData.title;
        document.getElementById('trip-subtitle').innerText = tripData.subtitle;
        document.getElementById('budget').innerHTML = tripData.budget;
        document.getElementById('phrases').innerHTML = tripData.phrases;
        document.getElementById('security').innerHTML = tripData.security;
        document.getElementById('concierge').innerHTML = tripData.concierge;

        // Init Map with Layers
        const standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' });
        const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '© OpenTopoMap' });
        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri' });

        const map = L.map('map', { center: [0,0], zoom: 2, layers: [standard] });
        L.control.layers({ "Standard": standard, "Topographic": topo, "Satellite": satellite }).addTo(map);

        const markers = L.featureGroup().addTo(map);
        const itinContainer = document.getElementById('itinerary');

        tripData.days.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-section';
            dayDiv.innerHTML = `<div class="day-header">${day.title}</div><div class="narrative">${day.narrative}</div><div class="places"></div>`;
            
            const placesDiv = dayDiv.querySelector('.places');
            day.places.forEach(p => {
                const color = categoryColors[p.category] || "#333";
                
                // Colored Circle Marker
                const marker = L.circleMarker([p.lat, p.lon], {
                    radius: 10, fillColor: color, color: "#fff", weight: 2, opacity: 1, fillOpacity: 0.9
                }).bindPopup(`<b>${p.name}</b><br><small>${p.category}</small><br>${p.description}`);
                markers.addLayer(marker);

                const card = document.createElement('div');
                card.className = 'place-card';
                card.innerHTML = `<span class="place-cat" style="color:${color}">${p.category}</span><div class="place-name">${p.name}</div><div class="place-desc">${p.description}</div>`;
                card.onclick = () => { map.flyTo([p.lat, p.lon], 16); marker.openPopup(); };
                placesDiv.appendChild(card);
            });
            itinContainer.appendChild(dayDiv);
        });

        if (markers.getLayers().length) map.fitBounds(markers.getBounds().pad(0.3));
    </script>
</body>
</html>
```

---

## 🌍 TRAVEL CONCIERGE (Final Wrap-up)
- **Packing List**
- **Local Apps**
- **Etiquette**

## 💡 Expert Guidance
- **Categories:** Use exact category names from Phase 3 for the colors to work.
- **Layers:** Use the `L.control.layers` to give the user terrain and topo options.
- **Data Injection:** The agent MUST ensure all content (Budget, Phrases, Narrative) is properly converted to valid HTML strings.
