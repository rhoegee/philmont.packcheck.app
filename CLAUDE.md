# CLAUDE.md — Packcheck: Philmont Edition

## Product Vision

Packcheck is a gear planning and pack weight platform for backcountry travelers. The core idea is simple: know what you're carrying before you leave the trailhead. The app helps users build a gear list, track weights, and simulate how their pack changes day by day as they consume food and water.

The first release is **Packcheck: Philmont Edition** — purpose-built for Philmont Scout Ranch treks. Philmont is one of the most logistically complex backcountry experiences available to scouts, with crew-shared gear, resupply points, dry camps, and strict weight recommendations. The Philmont Edition addresses all of that specifically.

The broader vision is a **platform of editions** — Philmont is the first, but the same core engine applies to any multi-day backcountry trip: BWCA, JMT, PCT thru-hiking, high-adventure base camps, and beyond. Each edition gets a tailored itinerary system, relevant defaults, and community-specific guidance. The brand — **Packcheck** — is the through-line.

**Design philosophy:** No framework, no build step, no account required. The app works offline, saves locally, and loads fast. It should feel like a well-made tool, not a web app. Visual identity is strong and intentional — it should look like gear, not software.

**Current status:** v1.0-beta, deployed at `beta.packcheck.app`, private beta for Crew 616-E (Trek 12-10, June 2026). Phase 2 opens the platform to all Philmont crews. Beyond that, additional editions.

---

## Project Overview

**Packcheck: Philmont Edition** is a single-page gear planning and pack weight simulator for Philmont Scout Ranch treks. It is deployed at **https://beta.packcheck.app** via GitHub Pages from the `main` branch of `rhoegee/bagofholding`.

- **Current trek:** Crew 616-E, Trek 12-10, June 16–27 2026
- **No backend, no build step, no framework** — pure HTML/CSS/JS
- **Core files:** `index.html` (app) + `packcheck-theme.css` (styles) + `pc-icons.js` (icon system) + `help-content.js` (user guide content)
- **Feature branch convention:** `claude/adoring-mccarthy-d96BA` → merge to `main` to deploy

---

## File Structure

```
index.html              — Full application (~2800 lines)
packcheck-theme.css     — Trailhead v2 design system (~530 lines)
wordmark-core.js        — PACKCHECK logo renderer
pc-icons.js             — PNG/SVG category icon system (v2, border-fixed)
help-content.js         — User guide Q&A content (edit to update in-app help)
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

Category keys: `bags sleep equipment clothing rain care food water utility luxury`

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

## Icon System (pc-icons.js)

Icons are 168×168px PNG/SVG data URIs stored in a `PNG{}` object. The `bear` entry is an SVG data URI; all others are PNG.

### Key → subject mapping
| Key | Subject | Used by |
|-----|---------|---------|
| `pack` | backpack | personal: bags |
| `sleep` | sleeping bag | personal: sleep |
| `poles` | trekking poles | personal: equipment |
| `jacket` | jacket | personal: clothing |
| `rain` | rain jacket | personal: rain |
| `soap` | soap/hygiene | personal: care |
| `food` | spork | personal: food |
| `bottle` | water droplet | personal: water, crew: water |
| `firstaid` | first aid kit | personal: utility |
| `chair` | camp chair | personal: luxury |
| `cook` | pot/stove | crew: cook |
| `bear` | bear face (SVG) | crew: bear |
| `compass` | compass | crew: safety |
| `trowel` | trowel | crew: sanitation |
| `tape` | tape roll | crew: repair |
| `consum` | sunscreen tube | crew: consumables |
| `lantern` | lantern | crew: misc |
| `tent` | tent | crew: shelter |
| `checkbox` | brand lockup (STROKE only) | gear row checked state |

### Category → icon key mappings (in index.html)
```js
const CAT_ICON = {
  bags:'pack', sleep:'sleep', equipment:'poles', clothing:'jacket', rain:'rain',
  care:'soap', food:'food', water:'bottle', utility:'firstaid', luxury:'chair'
};
const CREW_CAT_ICON = {
  shelter:'tent', cook:'cook', bear:'bear', safety:'compass', sanitation:'trowel',
  repair:'tape', consumables:'consum', water:'bottle', misc:'lantern'
};
```

### pc-icons.js structure
- `PNG{}` — data URI map (png or svg)
- `STROKE{}` — SVG path glyphs; only `checkbox` lives here
- `tile(key, size)` — renders a rounded-square badge at given size
- `glyph(key, opts)` — renders icon as inline SVG (stroke style)
- `ALL_KEYS` — full list of valid keys
- `window.PCIcon` — exports: `{glyph, tile, PNG, STROKE, COL, keys:ALL_KEYS}`

**When rebuilding icons:** border stroke must be inset by at least half stroke-width to avoid clipping. `bear` key stays as SVG data URI.

---

## Help System (help-content.js)

Standalone file containing `HELP_CONTENT` array — edit this to update the in-app User Guide modal without touching `index.html`.

```js
const HELP_CONTENT = [
  { title: "Section Title", items: [{ q: "Question?", a: "Answer." }] }
]
```

`a` may contain basic HTML (`<strong>`, `<code>`, `<a>`, `<br>`). Modal is rendered dynamically by `showHelpModal()` in `index.html`.

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
- Help (?) button in nav opens User Guide modal — content served from `help-content.js`

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
- Actions column: category move `<select>` (blank default + category options) + ✕ delete button

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

- **Live URL:** https://beta.packcheck.app (custom subdomain → GitHub Pages)
- **Root URL:** https://packcheck.app — reserved for v2.0 public launch
- **Branch:** `main` (GitHub Pages source)
- **Feature branch:** `claude/adoring-mccarthy-d96BA`
- **Workflow:** edit on feature branch → merge to main → live within ~30 seconds
- **HTTPS:** enforced in GitHub Pages settings; `overflow-x:clip` on html/body keeps nav sticky
- **DNS:** `beta` CNAME → `rhoegee.github.io` (Namecheap); domain verified via TXT record

### Git workflow
```bash
git add <files>
git commit -m "description"
git push -u origin claude/adoring-mccarthy-d96BA
git checkout main && git merge claude/adoring-mccarthy-d96BA && git push origin main
git checkout claude/adoring-mccarthy-d96BA
```

### Versioning
- Current: `v1.0-beta` (tagged in GitHub, private crew release)
- Tag stable releases: create via GitHub Releases UI (remote environment blocks tag push)

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
11. **localStorage origin-bound** — data saved at `packcheck.app` is NOT accessible at `beta.packcheck.app`. Users moving between domains must export/import JSON.
12. **Icon keys are internal labels only** — the key name (e.g. `bottle`) does not need to match the visual (a water droplet is fine). What matters is the key matches `CAT_ICON`/`CREW_CAT_ICON` in `index.html`.

---

## Phase 2 Planning (Not Yet Built)

The next major version will open the app to all Philmont crews. Key changes will include:
- Remove hardcoded crew/trek info (Crew 616-E, Trek 12-10)
- Crew number lookup → auto-assign itinerary
- Multi-crew / multi-trek configuration
- Potential crew codes for shared crew gear sync
- Deploy at `packcheck.app` (root) for public launch

Phase 2 starts from `v1.0-beta` as the baseline. The `bagofholding` repo continues as the codebase.
