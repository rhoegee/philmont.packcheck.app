#!/usr/bin/env node
// Reset all conservation tags and reapply correctly from verified guidebook data
// Run: node fix-conservation-reset.js

const fs = require('fs');

// Exact data from 2026 guidebook research — DO NOT MODIFY
const CONSERVATION_DAYS = {
  '12-1':  [7],  '12-2':  [4],  '12-3':  [10], '12-4':  [12], '12-5':  [12],
  '12-6':  [8],  '12-7':  [5],  '12-8':  [6],  '12-9':  [6],  '12-10': [5],
  '12-11': [4],  '12-12': [8],  '12-13': [6],  '12-14': [4,6,8], '12-15': [9],
  '12-16': [5],  '12-17': [10], '12-18': [9],  '12-19': [5],  '12-20': [6],
  '12-21': [5],  '12-22': [9],  '12-23': [8],  '12-24': [7],
  '9-1':   [6],  '9-2':   [6],  '9-3':   [4],  '9-4':   [4],  '9-5':   [5],
  '9-6':   [8],  '9-7':   [5],  '9-8':   [9],  '9-9':   [4],  '9-10':  [5],
  '9-11':  [4],  '9-12':  [5],
  '7-1':   [4],  '7-2':   [5],  '7-3':   [3],  '7-4':   [7],  '7-5':   [4],
  '7-6':   [6],  '7-7':   [3],  '7-8':   [4],  '7-9':   [5],  '7-10':  [6],
  '7-11':  [6],  '7-12':  [5],
};

const src = fs.readFileSync(__dirname + '/itinerary-data.js', 'utf8');
const lines = src.split('\n');

let currentKey = null;
let currentDay = null;
let currentStaffed = false;
let currentDry = false;
let currentCamp = '';
let changes = 0;

// For multi-line entries we need to track fields as we see them
const state = {};  // per-line context

function inferType(key, day, camp, staffed, dry) {
  if (camp === 'Camping HQ') return 'chq';
  if (dry) return 'dry';
  if (staffed) return 'staff';
  return 'trail';
}

function shouldBeConservation(key, day) {
  return (CONSERVATION_DAYS[key] || []).includes(day);
}

const out = lines.map(line => {
  // Track current itinerary key
  const keyMatch = line.match(/^\s*"(\d+-\d+)":\s*\{/);
  if (keyMatch) {
    currentKey = keyMatch[1];
    currentDay = null; currentStaffed = false; currentDry = false; currentCamp = '';
    return line;
  }
  if (!currentKey) return line;

  // Track fields for multi-line format
  const campMatch = line.match(/["']?camp["']?\s*:\s*["']([^"']+)["']/);
  if (campMatch) currentCamp = campMatch[1];

  const staffMatch = line.match(/["']?staffed["']?\s*:\s*(true|false)/);
  if (staffMatch) currentStaffed = staffMatch[1] === 'true';

  const dryMatch = line.match(/["']?dry["']?\s*:\s*(true|false)/);
  if (dryMatch) currentDry = dryMatch[1] === 'true';

  // Track day number
  const dayMatch = line.match(/["']?day["']?\s*:\s*(\d+)/);
  if (dayMatch) {
    currentDay = parseInt(dayMatch[1]);
    // Reset per-day state when we hit a new day in inline format
    if (!/camp/.test(line)) { currentStaffed = false; currentDry = false; currentCamp = ''; }
  }

  if (currentDay === null) return line;

  // Handle inline format (12-day): type on same line as day
  if (dayMatch && /type/.test(line)) {
    return applyType(line, currentKey, currentDay, currentCamp, currentStaffed, currentDry, true);
  }

  // Handle multi-line format (7/9-day): type on its own line
  if (!dayMatch && /["']?type["']?\s*:/.test(line)) {
    return applyType(line, currentKey, currentDay, currentCamp, currentStaffed, currentDry, false);
  }

  return line;
});

function applyType(line, key, day, camp, staffed, dry, inline) {
  const wantConserv = shouldBeConservation(key, day);
  const hasConserv = /type["']?\s*:\s*["']conservation["']/.test(line);

  if (wantConserv && !hasConserv) {
    changes++;
    return inline
      ? line.replace(/(type: ")[^"]+(")/,  '$1conservation$2')
      : line.replace(/(type["']?\s*:\s*["'])[^"']+(['"])/,  '$1conservation$2');
  }

  if (!wantConserv && hasConserv) {
    const correct = inferType(key, day, camp, staffed, dry);
    changes++;
    return inline
      ? line.replace(/(type: ")[^"]+(")/,  `$1${correct}$2`)
      : line.replace(/(type["']?\s*:\s*["'])[^"']+(['"])/,  `$1${correct}$2`);
  }

  return line;
}

fs.writeFileSync(__dirname + '/itinerary-data.js', out.join('\n'), 'utf8');
console.log(`Done. ${changes} type corrections applied.`);
