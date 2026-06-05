#!/usr/bin/env node
// Set type:"conservation" on verified conservation days from 2026 guidebook
// Run: node fix-conservation-days.js

const fs = require('fs');
const vm = require('vm');

const CONSERVATION_DAYS = {
  '12-1':  [7],
  '12-2':  [4],
  '12-3':  [10],
  '12-4':  [11],
  '12-5':  [11],
  '12-6':  [8],
  '12-7':  [5],
  '12-8':  [6],
  '12-9':  [6],
  '12-10': [5],
  '12-11': [4],
  '12-12': [8],
  '12-13': [6],
  '12-14': [4, 6, 8],
  '12-15': [9],
  '12-16': [5],
  '12-17': [10],
  '12-18': [9],
  '12-19': [5],
  '12-20': [6],
  '12-21': [5],
  '12-22': [9],
  '12-23': [8],
  '12-24': [7],
  '9-1':   [6],
  '9-2':   [6],
  '9-3':   [4],
  '9-4':   [4],
  '9-5':   [5],
  '9-6':   [8],
  '9-7':   [5],
  '9-8':   [8],
  '9-9':   [4],
  '9-10':  [5],
  '9-11':  [4],
  '9-12':  [5],
  '7-1':   [4],
  '7-2':   [5],
  '7-3':   [3],
  '7-4':   [6],
  '7-5':   [4],
  '7-6':   [6],
  '7-7':   [3],
  '7-8':   [4],
  '7-9':   [5],
  '7-10':  [6],
  '7-11':  [6],
  '7-12':  [5],
};

// Verify against loaded data first
const src = fs.readFileSync(__dirname + '/itinerary-data.js', 'utf8');
const sb = {};
vm.createContext(sb);
vm.runInContext(`(function(){ ${src}; this.ITINERARIES=ITINERARIES; }).call(this)`, sb);
const I = sb.ITINERARIES;

let warnings = 0;
for (const [key, days] of Object.entries(CONSERVATION_DAYS)) {
  for (const d of days) {
    const itin = I[key];
    if (!itin) { console.warn(`WARN: ${key} not found`); warnings++; continue; }
    const day = itin.dayData.find(x => x.day === d);
    if (!day) { console.warn(`WARN: ${key} day ${d} not found`); warnings++; continue; }
  }
}
if (warnings) { console.error(`${warnings} warnings — fix before proceeding`); process.exit(1); }

// Apply: line-by-line type replacement (handles both inline and multi-line formats)
const lines = src.split('\n');
let currentKey = null;
let currentDay = null;
let changes = 0;

const out = lines.map(line => {
  const keyMatch = line.match(/^\s*"(\d+-\d+)":\s*\{/);
  if (keyMatch) { currentKey = keyMatch[1]; currentDay = null; return line; }
  if (!currentKey) return line;

  const dayMatch = line.match(/["']?day["']?\s*:\s*(\d+)/);
  if (dayMatch) {
    currentDay = parseInt(dayMatch[1]);
    if (/type/.test(line)) return applyType(line, currentKey, currentDay);
    return line;
  }

  if (currentDay !== null && /["']?type["']?\s*:/.test(line)) {
    return applyType(line, currentKey, currentDay);
  }

  return line;
});

function applyType(line, key, day) {
  const conDays = CONSERVATION_DAYS[key] || [];
  if (!conDays.includes(day)) return line;
  if (/type["']?\s*:\s*["']conservation["']/.test(line)) return line; // already set
  const updated = line.replace(/(type["']?\s*:\s*["'])[^"']+(['"])/, '$1conservation$2');
  if (updated !== line) changes++;
  return updated;
}

fs.writeFileSync(__dirname + '/itinerary-data.js', out.join('\n'), 'utf8');
console.log(`Done. ${changes} days updated to type:"conservation".`);
