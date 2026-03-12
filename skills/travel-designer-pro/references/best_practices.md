# Best Practices for AI Travel Planning & Responsive Visualization

## 1. Data Architecture
- **JSON-First:** AI should produce structured JSON as the source of truth.
- **GeoJSON for Mapping:** Convert locations to `Feature` objects.
- **GPX for Portability:** Export tracks as `<trk>` and waypoints as `<wpt>`.
- **Separation of Concerns:** Keep "Places" (static points) and "Tracks" (linear paths) in separate data arrays/files during generation to avoid coordinate confusion.

## 2. Responsive UI/UX (Mobile & PC)
- **Fluid Layout:** Use `display: flex` or `grid` with media queries.
- **Mobile First:** On small screens, the map and sidebar should stack or use a toggle (e.g., "List View" vs "Map View").
- **Touch Targets:** Ensure buttons and cards have at least 44x44px clickable areas.
- **Leaflet Performance:** Use `preferCanvas: true` for rendering many points on mobile devices.

## 3. Map & GPX Integration
- **Leaflet-GPX:** Use for parsing and displaying tracks with metadata (distance, elevation).
- **LineStrings:** If GPX is not available, use GeoJSON `LineString` for simplified tracks.
- **Categorized Styling:** Use distinct colors and icons for different place types.

## 4. Trust & Referencing
- **Source Citations:** Every recommendation (hotel, restaurant, attraction) should include a reference link or source name.
- **Security Alerts:** Integrate real-time or recent travel advisories with dates.

## 5. Technical Output
- **Single File Portability:** Encode all CSS and JS (except large libraries like Leaflet) within the HTML file for easy sharing/offline use.
- **Base64 Assets:** If small icons are used, embed them as Base64.
