# Packcheck Planner — Phase 1 Brief
### For Claude Code · Crew 616-E Deployment · June 2026

---

## What this is

A single-file HTML gear planning app for Philmont Scout Ranch treks. It is functionally complete and fully re-skinned. This is not a build-from-scratch engagement. The job is three specific tasks: wire a Google Sheet for crew gear, verify the baked-in itinerary data, and deploy to GitHub Pages.

Do not refactor, restructure, or redesign anything. Do not introduce new dependencies. Do not change the data model. The app works. Ship it.

---

## Repo

**GitHub:** `rhoegee/bagofholding`
**Branch:** `main`
**Primary file:** `Packcheck Planner.html`
**Dependencies (same directory):**
- `packcheck-theme.css` — Trailhead v2 stylesheet
- `wordmark-core.js` — PACKCHECK logo lockup
- `pc-icons.js` — category icon system

All four files are already in the repo.

---

## The app — what's in it

Single HTML file, no backend, no build step. Five tabs:

1. **Gear List** — personal gear checklist, 10 categories, inline edit, checkboxes, weight calculations, donut chart, pack weight gauge.
2. **Crew Gear** — shared equipment, 8 categories, per-person share calculation (adults vs. scouts), donut chart.
3. **Pack Weight** — day-by-day pack weight simulator, resupply/dry camp grid, bar chart, body weight gauge.
4. **Itinerary** — pre-loaded with Itinerary 12-10 data including daily menus.
5. **Rules & Reqs** — Philmont reference cards.

Tech stack: vanilla HTML/CSS/JS, Chart.js (CDN), SheetJS/XLSX (CDN). No framework, no build tooling.

Data lives in JS globals inside the HTML file: `gearData`, `crewGearData`, `trekConfig`, `ITINERARY`, `MENUS`, `profile`.

---

## Task 1 — Google Sheet crew gear fetch

**Goal:** On page load, fetch crew gear data from a public Google Sheet and populate `crewGearData`. The advisor (Rob) updates the sheet; crew members see the latest data automatically.

**Sheet details:**
- File: "Packcheck_Gear_Template"
- Google Sheet ID: `1vjzeKb9pxhhrosyP75Au3aGLpML73-RmJBU_JeFBqd0`
- The sheet contains both personal gear (default template) and crew gear sections
- Crew gear categories: Shelter, Cook System, Bear System, Safety & Navigation, Sanitation, Repair Kit, Shared Consumables, Water System, Misc
- Items have: Category, Item, Brand, Qty, Unit Weight (oz), Total Weight (oz), Source (CREW or PHI), Notes

**Implementation requirements:**
- Make the sheet publicly readable (Rob will set sharing to "Anyone with the link can view")
- Use the Google Sheets CSV export URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0` — no API key required
- Fetch on page load; parse CSV; populate `crewGearData` in the existing format the app expects
- PHI badge logic: Source column value "PHI" → mark item as Philmont-issued (existing `phi` flag in data model)
- If fetch fails (offline, sheet unavailable): fall back silently to the existing hardcoded `crewGearData` — do not show an error that breaks the page
- Show a subtle last-updated timestamp in the Crew Gear tab header (e.g. "Crew gear synced Jun 1")

**URL parameter for crew sheet ID:**
Support an optional `?sheet={ID}` URL parameter so the shared link can point directly at the sheet without the user touching any settings. If the parameter is present, use it. If absent, use the hardcoded default sheet ID above. Example shared URL:
`https://rhoegee.github.io/bagofholding/Packcheck%20Planner.html?sheet=1vjzeKb9pxhhrosyP75Au3aGLpML73-RmJBU_JeFBqd0`

---

## Task 2 — Verify and lock itinerary data

**Goal:** Confirm the baked-in `ITINERARY` array and `MENUS` data are correct for Crew 616-E.

**Crew details:**
- Trek: 616-E
- Itinerary: 12-10 (Rugged, 62 miles, South Country)
- Arrival: June 16, 2026
- Crew: 8 people (3 adults, 5 scouts)
- Dry camps: Days 7 (Comanche Peak) and 10 (Devils Wash Basin)
- Resupply days: Days 5 (Phillips Junction) and 10 (Ute Gulch). Day 1 is CHQ resupply.
- Chuckwagon dinner: Day 4 at Beaubien
- Conservation project: Day 5 morning, Forest Fuels Reduction at Beaubien, 7:30am

**Itinerary 12-10 camp sequence:**
Day 1: Camping HQ (0 miles) · Day 2: Old Abreu (3.1 mi) · Day 3: Fish Camp (7.2 mi) · Day 4: Beaubien (6.9 mi) · Day 5: Porcupine (2.7 mi) · Day 6: Clear Creek (6.8 mi) · Day 7: Comanche Peak (6.0 mi, DRY) · Day 8: Cyphers Mine (4.5 mi) · Day 9: Sawmill (5.3 mi) · Day 10: Devils Wash Basin (8.7 mi, DRY + RESUPPLY) · Day 11: Harlan (6.1 mi) · Day 12: Return to CHQ (4.1 mi)

**Menu rotation:** Philmont 2026 menus cycle 1–10 by calendar date. Day ending in 1 = Meal #1, etc. Crew arrives June 16 (Day 1 = CHQ, no trail meals). Day 2 = June 17 = Meal #7. Verify the `MENUS` array matches this rotation.

**Check these specific items in the existing data:**
- Day 1 shows 0 miles and no pack weight (CHQ day, no hiking)
- Day 4 has chuckwagon dinner flag
- Day 5 has conservation badge (7:30am Forest Fuels Reduction)
- Days 5 and 10 have resupply badges
- Days 7 and 10 have dry camp badges
- Day 12 shows breakfast + lunch only (dinner at CHQ)
- Difficulty ratings present for all days

If any data is wrong, correct it in place. Do not change the data structure.

---

## Task 3 — Deploy to GitHub Pages

**Goal:** The app is accessible at a public URL that can be shared with 8 crew members.

**Steps:**
- Enable GitHub Pages on `rhoegee/bagofholding`, serving from `main` branch root
- Confirm all four files (`Packcheck Planner.html`, `packcheck-theme.css`, `wordmark-core.js`, `pc-icons.js`) are at the repo root and resolve correctly
- Verify the app loads fully in a browser (fonts, charts, icons all rendering)
- Verify the Google Sheet fetch works from the deployed URL (CORS can behave differently on Pages vs local)
- Provide the final shareable URL in the format: `https://rhoegee.github.io/bagofholding/Packcheck%20Planner.html?sheet=1vjzeKb9pxhhrosyP75Au3aGLpML73-RmJBU_JeFBqd0`

---

## What to preserve — do not touch

- The entire data model (`gearData`, `crewGearData`, `trekConfig`, `ITINERARY`, `MENUS`, `profile`)
- JSON save/load functionality
- Excel export (SheetJS)
- CSV import
- All five tabs and their feature sets
- The Trailhead v2 design (Packcheck brand, color tokens, typography, icons)
- Light/dark theme toggle
- The `packcheck-theme.css` external stylesheet — do not inline it
- Chart.js and SheetJS CDN references — do not swap these out

---

## Known bugs — do not fix in Phase 1

These are documented and deferred. Do not touch them:
- Day 1 pack weight shows nonzero in chart/slider (CHQ day, meaningless — cosmetic only)
- Cotton tag not triggering in some cases (stress test bug #7)
- Override banner missing / button too small (stress test bug #23)
- Heaviest/lightest labels don't update on resupply cycle (stress test bug #24)
- Heaviest item shows when all gear unchecked (stress test bug #47)

---

## Acceptance criteria

Phase 1 is done when:
1. `https://rhoegee.github.io/bagofholding/Packcheck%20Planner.html` loads in a browser
2. Crew Gear tab populates from the Google Sheet on load
3. If the sheet is unavailable, the app still loads with fallback data
4. The `?sheet=` URL parameter works
5. Itinerary data is verified correct for Crew 616-E / Itinerary 12-10
6. A crew member can open the URL on a phone, enter their gear weights, and see their pack weight by day

---

## Out of scope for Phase 1

- User accounts or authentication
- Multiple crew support
- Trek number lookup / auto-populate itinerary
- AI gear optimization
- Affiliate links
- Any backend infrastructure
- Responsive/mobile layout improvements (nice to have but not blocking)
- Bug fixes from the known bugs list above

All of the above are Phase 2. Do not scope-creep into them.

---

*Phase 2 brief to be written post-Philmont, informed by real crew feedback from the trek.*
