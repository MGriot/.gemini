# Frontend Refactor: Material You (Enterprise)

## Goal
Refactor the existing React/MUI frontend to a premium "Material You" Enterprise design system.
**Visuals**: "Paper & Glass", Surface layers, Glassmorphism, 16px/12px corner radii.
**Palette**: Deep Indigo (Primary), Teal Slate (Secondary), Off-White/Gunmetal (Backgrounds).
**Typography**: Plus Jakarta Sans.
**Layout**: Responsive "Command Center" with collapsible sidebar (desktop) and bottom nav (mobile).

## User Review Required
> [!IMPORTANT]
> This refactor will completely replace the current visual design. It requires installing new dependencies (`dnd-kit`, `framer-motion`, `@fontsource/plus-jakarta-sans`).

## Proposed Changes

### Dependencies
#### [NEW]
- `@dnd-kit/core`, `@dnd-kit/sortable`: For the 60fps Kanban board.
- `framer-motion`: For complex micro-interactions (page transitions, shared element transitions).
- `@fontsource/plus-jakarta-sans`: Primary font family.
- `date-fns`: For date manipulation in dashboards/timelines.

### Design System (`src/theme/`)
#### [NEW] `src/theme/palette.ts`
- Define "Focus & Trust" palette.
- Implement light/dark mode semantic tokens (surface-0 to surface-5).

#### [NEW] `src/theme/typography.ts`
- Configure Plus Jakarta Sans weights (SemiBold headers, Regular body).
- Tabular figures for data.

#### [NEW] `src/theme/components.ts`
- **MuiCard**: 16px radius, no shadow (border-based or soft surface).
- **MuiButton**: "Pill" shapes or rounded rects.
- **MuiTextField**: 12px radius, filled variant optimizations.
- **MuiCssBaseline**: Global glassmorphism and scrollbar styles.

### Layout (`src/layouts/`)
#### [MODIFY] `src/App.tsx`
- Wrap with new `ThemeProvider` and `CssBaseline`.
- Replace existing Layout structure.

#### [NEW] `src/layouts/MainLayout.tsx`
- Responsive logic:
  - **Desktop**: Collapsible Sidebar (Left).
  - **Mobile**: Bottom Navigation Bar.
- Glassmorphic Header/Sidebar backgrounds.

### Components
#### [NEW] `src/components/dashboard/`
- `GreetingWidget.tsx`: Date + Quote/Weather.
- `PulseCard.tsx`: Sparkline metrics cards.
- `ActivityHeatmap.tsx`: Contribution graph.

#### [NEW] `src/components/kanban/`
- `KanbanBoard.tsx`: Dnd-kit implementation.
- `KanbanColumn.tsx`: Transparent backgrounds.
- `TaskCard.tsx`: Progress bars, avatars, swipe actions (mobile).

#### [NEW] `src/components/tasks/`
- `TaskDetailModal.tsx`: Side-sheet (desktop) / Bottom-sheet (mobile).

## Verification Plan
### Automated Tests
- `npm run test:unit`: Verify component rendering.
- `npm run build`: Ensure no type errors with new theme.

### Manual Verification
- **Responsiveness**: Check 1200px+ (Desktop), 768px (Tablet), <768px (Mobile).
- **Theme**: Verify Dark/Light mode toggle (if implemented) or default aesthetic.
- **Interactions**: Drag-and-drop smoothness, Modal transitions.
