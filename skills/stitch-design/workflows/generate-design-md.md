---
description: Analyze a Stitch project and synthesize its design system into a .stitch/DESIGN.md file.
---

# Workflow: Generate .stitch/DESIGN.md

Create a "source of truth" for your project's design language so every future screen shares the
same visual vocabulary. Stitch interprets design through **"Visual Descriptions"** backed by
precise values, so the output must pair evocative natural language with exact tokens.

## 📥 Retrieval

Retrieve metadata and assets through the Stitch MCP tools. See
[tool-schemas.md](../references/tool-schemas.md) for exact call signatures.

1. **Project lookup** (skip if the `projectId` is known)
   - Call `list_projects` with `filter: "view=owned"`.
   - Identify the target by title or URL, then extract the numeric ID from the `name` field
     (e.g. `projects/13534454087919359824` → `13534454087919359824`).

2. **Screen lookup** (skip if the `screenId` is known)
   - Call `list_screens` with the numeric `projectId` (not the full path).
   - Pick representative screens — "Home", "Main Dashboard", or the densest screen available.

3. **Metadata fetch**
   - Call `get_screen` with numeric `projectId` and `screenId`. The response carries:
     - `screenshot.downloadUrl` — visual reference
     - `htmlCode.downloadUrl` — full HTML/CSS source
     - `width`, `height`, `deviceType` — dimensions and target platform

4. **Project metadata**
   - Call `get_project` with the **full path** (`projects/{id}`) to get the `designTheme`
     object: color mode, fonts, roundness, custom colors, plus project-level guidelines.

5. **Asset download**
   - Fetch `htmlCode.downloadUrl` with `WebFetch` (or `Bash` + `curl` if the fetch tool is
     blocked on Google Cloud Storage domains). Parse out Tailwind classes, custom CSS, and
     repeated component patterns.
   - Optionally download the screenshot for visual confirmation of density and hierarchy.

## 🧠 Analysis & Synthesis

### 1. Identify Identity
Capture the Project Title and Project ID.

### 2. Define Atmosphere
Read the screenshot and HTML together to capture the "vibe". Use evocative adjectives —
"Airy", "Dense", "Utilitarian", "Editorial" — not generic ones like "modern" or "clean".

### 3. Map Color Palette
For each color, record three things: a descriptive name that conveys character
("Deep Muted Teal-Navy"), the exact hex in parentheses (`#294056`), and its functional role
("primary actions"). Never ship a name without a hex, or a hex without a role.

### 4. Translate Geometry
Convert `border-radius` and layout values into physical descriptions:
- `rounded-full` → "Pill-shaped"
- `rounded-lg` → "Subtly rounded corners"
- `rounded-none` → "Sharp, squared-off edges"

### 5. Document Depth & Elevation
Describe how the UI handles layers: "Flat", "Whisper-soft diffused shadows", or
"Heavy, high-contrast drop shadows".

### 6. Apply Taste Rules
Before writing, read [taste-rules.md](../references/taste-rules.md) and fold its constraints
and anti-pattern bans into sections 2, 3, and 7 of the output. Those bans are what keep the
generated screens from looking AI-generic.

## 📝 Output Structure

Write `.stitch/DESIGN.md` in the project directory:

```markdown
# Design System: [Project Title]
**Project ID:** [Insert Project ID Here]

## 1. Visual Theme & Atmosphere
(Mood, density, and aesthetic philosophy.)

## 2. Color Palette & Roles
(Descriptive Name + Hex Code + Functional Role. Max 1 accent, saturation < 80%.)

## 3. Typography Rules
(Font families, weight usage for headers vs. body, letter-spacing character.)

## 4. Component Stylings
* **Buttons:** Shape, color assignment, interaction behavior.
* **Cards/Containers:** Corner roundness, background, shadow depth.
* **Inputs/Forms:** Stroke style, background, label and error placement.
* **Loading/Empty States:** Skeletal loaders, composed empty compositions.

## 5. Layout Principles
(Whitespace strategy, margins, grid alignment, responsive collapse rules.)

## 6. Motion & Interaction
(Spring physics, staggered reveals, transform/opacity-only animation.)

## 7. Anti-Patterns (Banned)
(Explicit NEVER-DO list — see references/taste-rules.md.)
```

## 💡 Best Practices
- **Be Precise**: always include hex codes, rem values, and pixel values in parentheses.
- **Be Descriptive**: "Ocean-deep Cerulean (#0077B6)", never just "blue".
- **Be Functional**: explain *why* an element exists, not only what it looks like.
- **Be Consistent**: reuse the same terminology throughout the document.
- **Encode the bans**: the anti-pattern list matters as much as the positive rules.

## ❌ Common Pitfalls
- Untranslated jargon (`rounded-xl` instead of "generously rounded corners").
- Descriptive names with no hex code, or hex codes with no role.
- Vague atmosphere descriptions that could apply to any project.
- Ignoring subtle details — shadows, spacing rhythm, letter-spacing.
