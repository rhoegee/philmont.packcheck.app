#!/usr/bin/env node
// QC test for itinerary-data.js
// Run: node test-itineraries.js

const fs = require('fs');
const vm = require('vm');

// Load itinerary-data.js — wrap in function to expose const declarations
const src = fs.readFileSync(__dirname + '/itinerary-data.js', 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(`(function(){ ${src}; this.ITINERARIES=ITINERARIES; this.MENUS=MENUS; }).call(this)`, sandbox);
const { ITINERARIES, MENUS } = sandbox;

// ─── helpers ───────────────────────────────────────────────────────────────
const VALID_TYPES = new Set(['chq', 'staff', 'dry', 'trail', 'conservation']);
const VALID_DIFFICULTIES = new Set(['Easy', 'Moderate', 'Challenging', 'Rugged', 'Strenuous', 'Super Strenuous']);
const VALID_REGIONS = new Set(['North', 'South', 'North/South']);

let passed = 0;
let failed = 0;
const errors = [];

function fail(key, msg) {
  errors.push(`  [${key}] ${msg}`);
  failed++;
}
function pass() { passed++; }
function check(key, condition, msg) {
  condition ? pass() : fail(key, msg);
}

// ─── expected counts ────────────────────────────────────────────────────────
const EXPECTED_KEYS = [
  ...Array.from({length:24}, (_,i) => `12-${i+1}`),
  ...Array.from({length:12}, (_,i) => `9-${i+1}`),
  ...Array.from({length:12}, (_,i) => `7-${i+1}`),
];

console.log('Packcheck Itinerary QC\n' + '─'.repeat(50));

// ─── 1. All expected keys present ───────────────────────────────────────────
console.log('\n[1] Key coverage');
for (const k of EXPECTED_KEYS) {
  check(k, !!ITINERARIES[k], `Missing itinerary key`);
}
const extraKeys = Object.keys(ITINERARIES).filter(k => !EXPECTED_KEYS.includes(k));
if (extraKeys.length) {
  extraKeys.forEach(k => fail(k, `Unexpected key not in expected list`));
} else {
  pass();
}

// ─── 2. Per-itinerary checks ─────────────────────────────────────────────────
console.log('[2] Per-itinerary data integrity');
for (const [key, itin] of Object.entries(ITINERARIES)) {
  const expectedDays = parseInt(key.split('-')[0]);

  // Top-level fields
  check(key, itin.label === `Itinerary ${key}`,         `label mismatch: "${itin.label}"`);
  check(key, itin.days === expectedDays,                 `days=${itin.days}, expected ${expectedDays}`);
  check(key, typeof itin.miles === 'number' && itin.miles > 0, `invalid miles: ${itin.miles}`);
  check(key, VALID_DIFFICULTIES.has(itin.difficulty),   `unknown difficulty: "${itin.difficulty}"`);
  check(key, VALID_REGIONS.has(itin.region),             `unknown region: "${itin.region}"`);
  check(key, Array.isArray(itin.dayData),                `dayData is not an array`);
  check(key, itin.dayData.length === expectedDays,       `dayData has ${itin.dayData.length} days, expected ${expectedDays}`);

  if (!Array.isArray(itin.dayData)) continue;

  // Day 1 must be CHQ
  const day1 = itin.dayData[0];
  check(key, day1 && day1.type === 'chq',                `Day 1 type="${day1?.type}", expected "chq"`);
  check(key, day1 && day1.camp === 'Camping HQ',         `Day 1 camp="${day1?.camp}", expected "Camping HQ"`);
  check(key, day1 && day1.miles === 0,                   `Day 1 miles=${day1?.miles}, expected 0`);

  // Last day must be CHQ (conservation at CHQ on last day is also valid)
  const lastDay = itin.dayData[itin.dayData.length - 1];
  check(key, lastDay && (lastDay.type === 'chq' || (lastDay.type === 'conservation' && lastDay.camp === 'Camping HQ')),
                                                         `Last day type="${lastDay?.type}", expected "chq" or conservation at CHQ`);
  check(key, lastDay && lastDay.camp === 'Camping HQ',   `Last day camp="${lastDay?.camp}", expected "Camping HQ"`);

  // Per-day checks
  for (const d of itin.dayData) {
    const dk = `${key} day${d.day}`;
    check(dk, Number.isInteger(d.day) && d.day >= 1 && d.day <= expectedDays,
                                                          `invalid day number: ${d.day}`);
    check(dk, typeof d.camp === 'string' && d.camp.trim().length > 0,
                                                          `missing camp name`);
    check(dk, typeof d.miles === 'number' && d.miles >= 0, `invalid miles: ${d.miles}`);
    check(dk, Number.isInteger(d.gain) && d.gain >= 0,   `invalid gain: ${d.gain}`);
    check(dk, Number.isInteger(d.loss) && d.loss >= 0,   `invalid loss: ${d.loss}`);
    check(dk, typeof d.dry === 'boolean',                 `dry is not boolean: ${d.dry}`);
    check(dk, typeof d.resupply === 'boolean',            `resupply is not boolean: ${d.resupply}`);
    check(dk, typeof d.staffed === 'boolean',             `staffed is not boolean: ${d.staffed}`);
    check(dk, typeof d.chuck === 'boolean',               `chuck is not boolean: ${d.chuck}`);
    check(dk, VALID_TYPES.has(d.type),                    `unknown type: "${d.type}"`);

    // type/flag consistency
    if (d.type === 'dry') {
      check(dk, d.dry === true,                           `type="dry" but dry=false`);
    }
    if (d.type === 'staff') {
      check(dk, d.staffed === true,                       `type="staff" but staffed=false`);
    }
    if (d.chuck) {
      check(dk, d.staffed === true,                       `chuck=true but staffed=false (chuck camps are always staffed)`);
    }
    if (d.resupply) {
      check(dk, typeof d.foodPickup === 'string' && d.foodPickup.trim().length > 0,
                                                          `resupply=true but foodPickup is empty`);
    }

    // day number sequence
    check(dk, d.day === itin.dayData.indexOf(d) + 1,     `day number out of sequence`);
  }

  // If any chuck days exist, verify they're all on staffed days
  const chuckDays = itin.dayData.filter(d => d.chuck);
  for (const d of chuckDays) {
    check(`${key} day${d.day}`, d.staffed === true, `chuck=true but staffed=false on day ${d.day}`);
  }
}

// ─── 3. Menu checks ──────────────────────────────────────────────────────────
console.log('[3] Menu data');
for (const meal of ['breakfast', 'lunch', 'dinner']) {
  check('MENUS', !!MENUS[meal], `Missing meal type: ${meal}`);
  if (!MENUS[meal]) continue;
  for (let i = 1; i <= 10; i++) {
    check(`MENUS.${meal}`, Array.isArray(MENUS[meal][i]) && MENUS[meal][i].length > 0,
      `${meal} meal ${i} is missing or empty`);
  }
}

// ─── Results ─────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(50));
if (errors.length) {
  console.log(`\nFAILURES (${errors.length}):`);
  errors.forEach(e => console.log(e));
}
console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
