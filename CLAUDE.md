# CLAUDE.md — Packcheck: Philmont Edition

## Product Vision

Packcheck is a gear planning and pack weight platform for backcountry travelers. The core idea is simple: know what you're carrying before you leave the trailhead. The app helps users build a gear list, track weights, and simulate how their pack changes day by day as they consume food and water.

The first release is **Packcheck: Philmont Edition** — purpose-built for Philmont Scout Ranch treks. Philmont is one of the most logistically complex backcountry experiences available to scouts, with crew-shared gear, resupply points, dry camps, and strict weight recommendations. The Philmont Edition addresses all of that specifically.

The broader vision is a **platform of editions** — Philmont is the first, but the same core engine applies to any multi-day backcountry trip: BWCA, JMT, PCT thru-hiking, high-adventure base camps, and beyond. Each edition gets a tailored itinerary system, relevant defaults, and community-specific guidance. The brand — **Packcheck** — is the through-line.

**Design philosophy:** No framework, no build step, no account required. The app works offline, saves locally, and loads fast. It should feel like a well-made tool, not a web app. Visual identity is strong and intentional — it should look like gear, not software.

**Current status:** Phase 2 public beta, deployed at `philmont.packcheck.app`. Open to all Philmont crews for the 2026 season. `beta.packcheck.app` (repo: `rhoegee/bagofholding`) is the **active development repo** — changes on branch `claude/beautiful-babbage-biA91` auto-deploy to `philmont.packcheck.app` via GitHub Actions.

---

## Project Overview

**Packcheck: Philmont Edition** is a single-page gear planning and pack weight simulator for Philmont Scout Ranch treks. It is deployed at **https://philmont.packcheck.app** via GitHub Pages from the `main` branch of `rhoegee/philmont.packcheck.app`.

- **All 48 Philmont 2026 itineraries** (24 twelve-day, 12 nine-day, 12 seven-day) loaded dynamically from `itinerary-data.js`
- **No backend, no build step, no framework** — pure HTML/CSS/JS
- **Core files:** `index.html` (app) + `packcheck-theme.css` (styles) + `pc-icons.js` (icon system) + `help-content.js` (user guide) + `itinerary-data.js` (all itineraries + menus)
- **Deployment:** push to branch → GitHub Action force-pushes to `philmont.packcheck.app` main → live within ~30 seconds

---

## Deployment

- **Live URL:** https://philmont.packcheck.app
- **Source repo:** `rhoegee/bagofholding`, branch `claude/beautiful-babbage-biA91`
- **Deploy target:** `rhoegee/philmont.packcheck.app`, branch `main` (GitHub Pages source)
- **Deploy mechanism:** `.github/workflows/deploy-philmont.yml` — triggers on push to `claude/beautiful-babbage-biA91`, force-pushes to philmont repo main
- **Deploy secret:** `PHILMONT_DEPLOY_TOKEN` (repo secret on bagofholding)
- **DNS:** `philmont` CNAME → `rhoegee.github.io` (Namecheap)
- **Splash page:** `packcheck.app` apex domain — separate repo `rhoegee/packcheck.app` (to be created), single static `index.html`

### Git workflow
```bash
git add <files>
git commit -m "description"
git push origin claude/beautiful-babbage-biA91
```

Push to the feature branch — the GitHub Action handles deployment. Do NOT push directly to `rhoegee/philmont.packcheck.app` as it will be overwritten on the next bagofholding push.

---

## File Structure

```
index.html              — Full application (~3000 lines)
packcheck-theme.css     — Trailhead v2 design system
wordmark-core.js        — PACKCHECK logo renderer
pc-icons.js             — PNG/SVG/stroke category icon system (v6)
help-content.js         — User guide Q&A content (edit to update in-app help)
itinerary-data.js       — All 48 itineraries + 10-meal rotation (DO NOT hand-edit)
favicon.svg             — App icon
CNAME                   — philmont.packcheck.app
.github/workflows/
  deploy-philmont.yml   — Auto-deploy to philmont.packcheck.app on push
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

All data lives as global JS variables in `index.html`. No external JSON files except itinerary-data.js.

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
Same item schema. Category keys (in canonical render order):
`tents othershelter cook bear safety sanitation repair consumables water misc`

- `tents` — tent bodies only; weight excluded from adult pack share
- `othershelter` — dining fly, poles, tarps; shared by all
- Fetched from Google Sheets CSV on load; falls back to hardcoded defaults silently
- If user customizes the list, `crewGearCustomized = true` and the sheet no longer overwrites on refresh
- `CREW_CAT_ORDER` array enforces render order regardless of object key insertion order

### `profile`
```js
{ name, crew, troop, council, arrival: '', itinNumber: '', day0: false, role: 'scout' }
```
- `crew` format: `616-E` (MMDD + letter). MMDD auto-fills arrival date.
- `itinNumber` format: `12-10`, `9-3`, `7-1`. Auto-fills trek length and loads itinerary from `ITINERARIES`.
- `role`: `'scout'` | `'leader'` — set via pill buttons in profile modal. Leader = carrying own tent (excluded from tent weight share).

### `trekConfig`
```js
{ days: 12, crewSize: 8, crewGearOz: 564.8, bodyWeight: 175,
  resupplyDays: [], dryCampDays: [], staffDays: [] }
```
`resupplyDays`, `dryCampDays`, `staffDays` are synced from the selected itinerary on `saveProfile()`. `staffDays` is used internally only — no manual input exposed to users.

### `ITINERARIES` — All trek data (itinerary-data.js)
```js
{
  "12-10": {
    label: "Itinerary 12-10", days: 12, miles: 67,
    difficulty: "Rugged", region: "South",
    dayData: [
      { day, camp, miles, gain, loss, dry, resupply, foodPickup, staffed, chuck, type }
    ]
  }, ...
}
```
Keys: `"12-1"` through `"12-24"`, `"9-1"` through `"9-12"`, `"7-1"` through `"7-12"`.
`type` values: `"chq"` | `"staff"` | `"dry"` | `"trail"`

### `MENUS` — Meal rotation (itinerary-data.js)
10-meal cycle. Meal number = day of month (e.g. June 16 → Meal 6, 0 maps to 10).
Day 1 = CHQ lunch+dinner, Day 2 = CHQ breakfast, last day = CHQ dinner, chuck camps = special dinner.

### Global override variables
- `crewOverrideOz` — (oz) when set, replaces `crewTotalOz()` in all crew share calculations. UI input accepts lbs. Tent split still applies.
- `tentOverrideOz` — (oz) when set, replaces `tentOz()`. UI input accepts lbs.
- `overrideOz` — (oz) personal gear scale override; replaces `totalOz()` in pack weight.
- `crewGearCustomized` — (bool) when true, `fetchCrewSheet()` skips re-fetching so user edits are preserved.

---

## Key Functions

### Persistence
- `saveLocal()` — saves to localStorage key `'packcheck-planner-v1'`
- `loadLocal()` — restores from localStorage; returns `true` if data existed
- `scheduleAutoSave()` — debounced auto-save on edits

### Itinerary
- `getActiveItinerary()` — returns `ITINERARIES[profile.itinNumber]` or `null`
- `parseItinNumber()` — validates input against `ITINERARIES`, shows hint, auto-normalizes format
- `parseCrewNumber()` — parses MMDD from crew number, auto-fills arrival date

### Rendering
- `renderGear()` — re-renders all personal gear sections
- `renderCrewGear()` — re-renders crew gear sections in `CREW_CAT_ORDER`
- `updateCalc()` — recalculates all weight stats, gauges, charts
- `updateCrewStats()` — recalculates crew gear totals and adult/scout shares; respects `crewOverrideOz`
- `renderItinerary()` — builds itinerary table from `getActiveItinerary()`

### Weight helpers
- `totalOz()` — sum of all included personal gear
- `catOz(key)` — sum for one category
- `crewTotalOz()` — sum of all crew gear items
- `tentOz()` — weight of `tents` category (respects `tentOverrideOz`)
- `ozToStr(oz)` — formats to "X lb Y oz"

### Adult/Scout crew split
- `adultShare = (crewTotal - tentOz) / crewSize`
- `scoutShare = (crewTotal - tentOz) / crewSize + tentOz / scouts`
- Driven by `crew-adults` and `crew-scouts` inputs on the Crew Gear tab
- `own-tent` checkbox on Pack Weight tab synced from `profile.role` on save

### Crew gear functions
- `updateCrewOverride()` / `clearCrewOverride()` — manage advisor weight override
- `updateTentOverride()` / `clearTentOverride()` — manage tent weight override
- `moveCrewItem(fromKey, idx, select)` — moves item between crew categories
- `fetchCrewSheet()` — fetches Google Sheet CSV; skips if `crewGearCustomized`
- `resetCrewGear()` — clears customization flag, re-fetches sheet
- `migrateCrewGearData(data)` — migrates old `shelter` key → `tents` + `othershelter`

### Edit / CRUD
- `startEdit(key, idx)` — sets `editingRow = {key, idx}` then `renderGear()`
- `toggleItem(key, idx, checked)` — sets `item.included`, saves, re-renders
- `toggleAllItems(cb)` — master select/deselect all
- `moveItem(fromKey, idx, select)` — moves personal gear item between categories
- `batchDelete()` — deletes all ✕-selected items

### Sharing / Export
- `packGear()` — compact serialization (short keys: n/b/o/q/t/u/w)
- `unpackGear(data)` — deserialize compact format (v:1) or legacy full format
- `showSendToPhone()` — LZ-compress → QRious QR code in modal
- `saveJSON()`, `loadJSON()` — full JSON save/load
- `exportExcel()` — XLSX export via SheetJS

---

## UI Structure

### Navigation
- Sticky nav: `position:sticky; top:0; z-index:100`
- **Two rows at ≤1024px:** logo+profile+theme+hamburger+save on top; tabs full-width below
- `overflow-x:clip` on html/body (NOT `hidden` — hidden breaks sticky)
- Help (?) button opens User Guide modal — content from `help-content.js`

### Four pages (tabs)
| ID | Tab | Content |
|----|-----|---------|
| `#page-gear` | Gear List | Personal gear table, weight stats, donut chart, pack weight gauge |
| `#page-crew` | Crew Gear | Shared equipment, advisor/tent weight overrides, adult/scout share breakdown, donut chart |
| `#page-calc` | Pack Weight | Day-by-day simulator, resupply/dry toggles, bar chart (clickable), body weight |
| `#page-itin` | Your Trek | Dynamic trek schedule from profile itinerary, elevation, menus, difficulty |

Rules & Reqs tab was removed — content deemed unnecessary for all users.

### Gear table columns
`checkbox(3%) | item(27%) | brand(17%) | qty(5%) | weight(14%) | notes(auto) | actions(5%)`
- `table-layout:fixed; border-collapse:separate; border-spacing:0`
- At ≤640px: brand and notes columns hidden

### Two-col layout (Gear and Crew tabs)
- Desktop: `grid-template-columns: 1fr 330px`
- ≤1024px: collapses to single column

---

## Icon System (pc-icons.js)

- PNG icons embedded as base64 data URIs in `PNG{}` object
- Stroke icons (SVG paths) in `STROKE{}` object — used for icons without a PNG
- `fly` key — custom dining fly shape (wide inverted-V, base + inner accent V) — used for Other Shelter
- `bear` key — listed in ALL_KEYS but has no PNG; mapped to `food` icon in `CREW_CAT_ICON`
- `catIconTile(key)` — renders a 30px icon tile, theme-aware (light/dark)
- Cache-bust via `?v=6` query string on script tag

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
Dark mode via `[data-theme="dark"]` on body.

### Breakpoints
- `≤1024px` — tablet: two-row nav, single-column layout
- `≤640px` — phone: compressed nav, hide gear table brand+notes columns

---

## Google Sheets Integration

Gear defaults load from a published Google Sheet on every page load.

- **Personal gear:** `DEFAULT_PERSONAL_URL` — gid=918676065
- **Crew gear:** `DEFAULT_SHEET_URL` — gid=114457742
- Both point to `Packcheck_Gear_Template` spreadsheet (Rob's Google account)
- Fetch fails silently → hardcoded defaults used instead
- Personal gear only fetched for new users (no localStorage data)
- Crew gear fetched fresh every load unless `crewGearCustomized = true`

---

## Important Implementation Notes

1. **`item.included` not `item.checked`** — the packed/unpacked state field. Easy to get wrong.
2. **`saveLocal()` not `saveData()`** — the persistence function name.
3. **`border-collapse:separate`** — required on `.gear-table` for `position:sticky` to work on td/th.
4. **`overflow-x:clip` not `overflow-x:hidden`** — `hidden` breaks `position:sticky` on the nav.
5. **`table-layout:fixed`** requires explicit widths on both `<col>` elements AND `<th>` elements.
6. **Inline styles beat CSS** — `style="width:X%"` on col/th elements needs `!important` in CSS to override on mobile.
7. **XLSX uses eval internally** — triggers a CSP DevTools warning but does not affect users.
8. **Google Sheets fetch** — fails silently to hardcoded defaults.
9. **Long-press edit** — 500ms `touchstart` timer triggers `startEdit()`; `touchmove` cancels it.
10. **QR share format** — compact JSON (v:1, short keys) LZ-compressed to `?g=` URL param.
11. **localStorage origin-bound** — data at `beta.packcheck.app` is NOT accessible at `philmont.packcheck.app`.
12. **`crewOverrideOz` is in oz internally** — the UI input accepts lbs and converts on entry.
13. **Itinerary is dynamic** — `getActiveItinerary()` returns null if no itinerary set; all rendering must handle null gracefully.
14. **`staffDays` is internal only** — populated by `saveProfile()` from itinerary data, not exposed as a user input.
15. **Crew category order** — always use `CREW_CAT_ORDER` when iterating `crewGearData`; object key order is unreliable after load/migration.
16. **Deploy is a force-push** — do NOT push changes directly to `rhoegee/philmont.packcheck.app`; they will be overwritten on the next bagofholding deploy.

---

## Phase 3 Planning (Not Yet Built)

- `packcheck.app` apex domain: splash/landing page (static `index.html` ready, needs repo + deploy wired up)
- Additional editions: BWCA, JMT, PCT, other high-adventure bases
- Backend + user accounts (future — not in current scope)
- Crew number lookup → auto-assign itinerary from Philmont registry
- Monetization layer (gear suggestions, premium features)
