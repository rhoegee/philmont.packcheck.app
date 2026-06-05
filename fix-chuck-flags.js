#!/usr/bin/env node
// One-time migration: set chuck flags based on verified 2026 guidebook data
// Run: node fix-chuck-flags.js

const fs = require('fs');

// Ground truth from 2026 Philmont guidebook
const CHUCK_DAYS = {
  '12-1':  [3, 6],
  '12-2':  [6, 10],
  '12-3':  [3],
  '12-4':  [5],
  '12-6':  [5],
  '12-7':  [7],
  '12-9':  [10],
  '12-10': [4],
  '12-11': [5],
  '12-12': [7],
  '12-13': [10],
  '12-15': [10],
  '12-16': [11],
  '12-18': [10],
  '12-19': [4],
  '12-21': [10],
  '12-23': [11],
  '12-24': [10],
  '9-1':   [4],
  '9-2':   [5, 7],
  '9-4':   [3],
  '9-5':   [6],
  '9-6':   [4],
  '9-9':   [4],
  '7-1':   [4],
  '7-2':   [4],
  '7-3':   [4],
  '7-4':   [4],
  '7-5':   [4],
  '7-9':   [4],
  '7-10':  [5],
};

let src = fs.readFileSync(__dirname + '/itinerary-data.js', 'utf8');
const lines = src.split('\n');

let currentKey = null;
let currentDay = null;
let changes = 0;

function applyChuck(line, key, day) {
  const chuckDays = CHUCK_DAYS[key] || [];
  const shouldChuck = chuckDays.includes(day);
  const hasTrue  = /chuck["']?\s*:\s*true/.test(line);
  const hasFalse = /chuck["']?\s*:\s*false/.test(line);
  if (shouldChuck && hasFalse) { changes++; return line.replace(/(chuck["']?\s*:\s*)false/, '$1true'); }
  if (!shouldChuck && hasTrue)  { changes++; return line.replace(/(chuck["']?\s*:\s*)true/,  '$1false'); }
  return line;
}

const out = lines.map(line => {
  // Detect itinerary key
  const keyMatch = line.match(/^\s*"(\d+-\d+)":\s*\{/);
  if (keyMatch) {
    currentKey = keyMatch[1];
    currentDay = null;
    return line;
  }

  if (!currentKey) return line;

  // Detect day number (inline or multi-line format)
  const dayMatch = line.match(/["']?day["']?\s*:\s*(\d+)/);
  if (dayMatch) {
    currentDay = parseInt(dayMatch[1]);
    // Inline format: chuck on same line
    if (/chuck/.test(line)) return applyChuck(line, currentKey, currentDay);
    return line;
  }

  // Multi-line format: chuck on its own line
  if (currentDay !== null && /["']?chuck["']?\s*:/.test(line)) {
    return applyChuck(line, currentKey, currentDay);
  }

  return line;
});

fs.writeFileSync(__dirname + '/itinerary-data.js', out.join('\n'), 'utf8');
console.log(`Done. ${changes} lines updated.`);
