# CLAUDE.md — Packcheck: Philmont Edition

## Project Overview

**Packcheck: Philmont Edition** is a single-page gear planning and pack weight simulator for Philmont Scout Ranch treks. It is deployed at **https://packcheck.app** via GitHub Pages from the `main` branch of `rhoegee/bagofholding`.

- **Current trek:** Crew 616-E, Trek 12-10, June 16–27 2026
- **No backend, no build step, no framework** — pure HTML/CSS/JS
- **Two core files:** `index.html` (app) + `packcheck-theme.css` (styles)
- **Feature branch convention:** `claude/adoring-mccarthy-d96BA` → merge to `main` to deploy

---

## File Structure

```
index.html              — Full application (~2800 lines)
packcheck-theme.css     — Trailhead v2 design system (~530 lines)
wordmark-core.js        — PACKCHECK logo renderer
pc-icons.js             — SVG category icon system
favicon.svg             — App icon
BRIEF_phase1.md         — Original Phase 1 specification
```

No `package.json`, no build tooling. CDN libraries loaded in `<head>`.

---

## CDN Dependencies

```html
Chart.js 4.4.1       — cdnjs  — donut + bar charts
XLSX 0.18.5          — cdnjs  — Excel export (uses eval internally — ignore CSP warning)
LZ-String 1.5.0      — jsdelivr — URL compression for share links
QRious 4.0.2         — cdnjs  — QR code generation (canvas-based)
Google Fonts         — Oswald (display), Zilla Slab (body), JetBrains Mono (mono)
```

---

## Data Model

All data lives as global JS variables in `index.html`. No external JSON files.

### `gearData` — Personal gear
```js
{
  [categoryKey]: {
    label: 'Sleep System',
    color: 'var(--pc-accent)',
    items: [
      { name, brand, qty, oz, notes, included: true/false, warn: null|'cotton' }
    ]
  }
}
```
**Important:** checked state is `item.included` (boolean), NOT `item.checked`.

Category keys: `bags sleep equipment clothing rain cooking hygiene first_aid coords misc`

### `crewGearData` — Shared/crew gear
Same item schema. Category keys: `shelter cook bear safety sanitation repair consumables water misc`
Fetched from Google Sheets CSV on load; falls back to hardcoded defaults silently.

### `profile`
```js
{ name, crewNumber, troop, council, arrival: '2026-06-16', trekLength: 12, day0: false }
```

### `trekConfig`
```js
{ days: 12, crewSize: 8, crewGearOz: 564.8, bodyWeight: 175,
  resupplyDays: [1,5,10], dryCampDays: [7,10], staffDays: [4] }
```

### `ITINERARY` — Daily trek data
12-element array. Per day: `{ camp, miles, elev_gain, elev_loss, difficulty, flags }`.
Pre-loaded for Trek 12-10 (Rugged, South Country).

### `MENUS` — Meal rotation
10-meal cycle. Per meal: breakfast/lunch/dinner strings.

---

## Key Functions

### Persistence
- `saveLocal()` — saves to localStorage key `'packcheck-planner-v1'`
- `loadLocal()` — restores from localStorage; returns `true` if data existed
- `scheduleAutoSave()` — debounced auto-save on edits

### Rendering
- `renderGear()` — re-renders all personal gear sections; calls `syncMasterCheckAll()` at end
- `renderCrewGear()` — re-renders crew gear sections
- `updateCalc()` — recalculates all weight stats, gauges, charts
- `renderItinerary()` — builds itinerary table

### Weight helpers
- `totalOz()` — sum of all included personal gear
- `catOz(key)` — sum for one category
- `crewTotalOz()` — sum of all crew gear
- `tentOz()` — weight of tent items in crew gear
- `ozToStr(oz)` — formats to "X lb Y oz"

### Edit / CRUD
- `startEdit(key, idx)` — sets `editingRow = {key, idx}` then `renderGear()`
- `toggleItem(key, idx, checked)` — sets `item.included`, saves, re-renders
- `toggleAllItems(cb)` — master select/deselect all; uses `item.included`
- `moveItem(fromKey, idx, select)` — moves item between categories
- `batchDelete()` — deletes all ✕-selected items

### Sharing / Export
- `packGear()` — compact serialization (short keys: n/b/o/q/t/u/w)
- `unpackGear(data)` — deserialize compact format (v:1) or legacy full format
- `showSendToPhone()` — LZ-compress → QRious QR code in modal
- `saveJSON()`, `loadJSON()` — full JSON save/load
- `exportExcel()` — XLSX export via SheetJS
- URL import: `?g=<lzstring>` checked in `window.onload` after `loadLocal()`

### Touch / Mobile
- `rowTouchStart(e, key, idx)` — 500ms long-press triggers edit mode
- `rowTouchEnd()`, `rowTouchMove()` — cancel timer on release/scroll

---

## UI Structure

### Navigation
- Sticky nav: `position:sticky; top:0; z-index:100`
- **Two rows at ≤1024px:** logo+profile+theme+hamburger+save on top; tabs full-width below
- `overflow-x:clip` on html/body (NOT `hidden` — hidden breaks sticky)

### Five pages (tabs)
| ID | Tab | Content |
|----|-----|---------|
| `#page-gear` | Gear List | Personal gear table, weight stats, donut chart, pack weight gauge |
| `#page-crew` | Crew Gear | Shared equipment, per-person share calc (adult vs scout), donut chart |
| `#page-calc` | Pack Weight | Day-by-day simulator, resupply/dry toggles, bar chart, body weight |
| `#page-itin` | Itinerary | Pre-loaded trek schedule, elevation, menus, difficulty badges |
| `#page-rules` | Rules & Reqs | Philmont reference cards, resources section |

### Gear table columns
`checkbox(3%) | item(27%) | brand(17%) | qty(5%) | weight(14%) | notes(auto) | actions(5%)`
- `table-layout:fixed; border-collapse:separate; border-spacing:0` (separate required for sticky to work)
- At ≤640px: brand and notes columns hidden via `display:none` on nth-child

### Two-col layout (Gear and Crew tabs)
- Desktop: `grid-template-columns: 1fr 330px` (main col | side panel)
- ≤1024px: collapses to single column, side panel stacks below

### Hamburger menu
- `.hamburger-btn` — always visible (styled to match nav buttons)
- Contains: Load, Import CSV, Export Excel, Print, Share/QR
- Desktop `nav-actions` keeps only: red Save button + hidden file inputs

---

## Design System (packcheck-theme.css)

### Color tokens
```css
--pc-bg: #efe6cf          /* paper */
--pc-surface: #f4ecd8     /* cream cards */
--pc-anchor: #2e4a39      /* pine — nav, primary */
--pc-accent: #c5172b      /* scout red — checked, active, delete */
--pc-trim: #d6a93f        /* gold — keylines, caution */
--pc-ink: #1c1c1a         /* body text */
--pc-ink-soft: #5a5040    /* muted text */
--pc-line: rgba(28,28,26,.12)  /* borders */
```
Dark mode via `[data-theme="dark"]` on body — full palette inversion.

### Breakpoints
- `≤1024px` — tablet/landscape phone: two-row nav, single-column layout, hide nav-actions
- `≤640px` — portrait phone: compressed nav, hide gear table brand+notes columns, smaller modal

### Modal
- `.modal-overlay` — `position:fixed; inset:0; z-index:200`
- At ≤540px: `align-items:flex-start; overflow-y:auto; padding:.5rem` so tall modals scroll instead of clip

---

## Deployment

- **Live URL:** https://packcheck.app (custom domain → GitHub Pages)
- **Branch:** `main` (GitHub Pages source)
- **Feature branch:** `claude/adoring-mccarthy-d96BA`
- **Workflow:** edit on feature branch → merge to main → live within ~30 seconds
- **HTTPS:** enforced in GitHub Pages settings; `overflow-x:clip` on html/body keeps nav sticky

### Git workflow
```bash
git add <files>
git commit -m "description"
git push -u origin claude/adoring-mccarthy-d96BA
git checkout main && git merge claude/adoring-mccarthy-d96BA && git push origin main
git checkout claude/adoring-mccarthy-d96BA
```

### Versioning
Tag stable releases: `git tag v1.0 -m "description" && git push origin v1.0`

---

## Important Implementation Notes

1. **`item.included` not `item.checked`** — the packed/unpacked state field. Easy to get wrong.
2. **`saveLocal()` not `saveData()`** — the persistence function name.
3. **`border-collapse:separate`** — required on `.gear-table` for `position:sticky` to work on td/th.
4. **`overflow-x:clip` not `overflow-x:hidden`** — `hidden` breaks `position:sticky` on the nav.
5. **`table-layout:fixed`** requires explicit widths on both `<col>` elements AND `<th>` elements — colgroup alone is insufficient.
6. **Inline styles beat CSS** — `style="width:X%"` on col/th elements needs `!important` in CSS to override on mobile.
7. **XLSX uses eval internally** — this triggers a CSP DevTools warning but does not affect users or site security.
8. **Google Sheets fetch** — crew gear loads from a published CSV URL; fails silently to hardcoded defaults.
9. **Long-press edit** — 500ms `touchstart` timer triggers `startEdit()`; `touchmove` cancels it to preserve scrolling.
10. **QR share format** — compact JSON (v:1, short keys) LZ-compressed to `?g=` URL param; `unpackGear()` handles import.

---

## Phase 2 Planning (Not Yet Built)

The next major version will open the app to all Philmont crews (not just 616-E). Key changes will include:
- Remove hardcoded crew/trek info
- Multi-crew / multi-trek configuration
- Crew number lookup for itinerary assignment
- Potential user accounts or crew codes for sync

Current version should be tagged `v1.0` before Phase 2 begins.
