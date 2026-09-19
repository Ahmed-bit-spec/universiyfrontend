/**
 * fixStudent.cjs
 * Surgically replaces ALL remaining green colors in src/student with #2C2DE0
 * Rules:
 *  - bg-green-*  → bg-[#2C2DE0]
 *  - text-green-* → text-[#2C2DE0]
 *  - border-green-* → border-[#2C2DE0]
 *  - hover:bg-green-* → hover:bg-[#2C2DE0]
 *  - shadow-green-* → shadow-[#2C2DE0]
 *  - ring-green-* → ring-[#2C2DE0]
 *  - from-green-* / to-green-* / via-green-* → same with [#2C2DE0]
 *  - #58CC02, #46A302, #3F9100, #9DE83A, #EAF8DC, #F6FCEF and similar greens → #2C2DE0
 *  - shadow-[0_*_0_#46A302] → shadow-[0_*_0_#1E1FAA]
 *  - shadow-[0_*_0_#46a302] → shadow-[0_*_0_#1E1FAA]
 *  - fill="..." green svg colors → #2C2DE0
 *  - Does NOT touch FrontDoorSystem
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '../src/student');

// Tailwind class prefix patterns: replace -green- with -[#2C2DE0]
// handles opacity modifiers like text-green-500/30 → text-[#2C2DE0]/30
function replaceTailwindGreen(content) {
  return content.replace(
    /\b((?:bg|text|border|ring|shadow|from|to|via|hover:bg|focus:bg|hover:text|focus:text|hover:border|focus:border|hover:ring|focus:ring|dark:bg|dark:text|dark:border|dark:ring|dark:hover:bg|dark:hover:text|group-hover:bg|group-hover:text|placeholder)-green-\d+)(\/\d+)?/g,
    (match, prefix, opacity) => {
      const newPrefix = prefix.replace('-green-', '-[#2C2DE0]').replace(/\d+$/, '');
      return newPrefix + (opacity || '');
    }
  );
}

// Replace hardcoded hex green colors in className strings
function replaceHexGreens(content) {
  const hexMap = {
    '#58CC02': '#2C2DE0',
    '#58cc02': '#2C2DE0',
    '#46A302': '#1E1FAA',
    '#46a302': '#1E1FAA',
    '#3F9100': '#2C2DE0',
    '#3f9100': '#2C2DE0',
    '#9DE83A': '#6366F1',
    '#9de83a': '#6366F1',
    '#EAF8DC': '#EEF2FF',
    '#eaf8dc': '#EEF2FF',
    '#F6FCEF': '#F5F7FF',
    '#f6fcef': '#F5F7FF',
    // Common green shades
    '#22c55e': '#2C2DE0',
    '#16a34a': '#2C2DE0',
    '#15803d': '#2C2DE0',
    '#4ade80': '#2C2DE0',
    '#86efac': '#2C2DE0',
    '#bbf7d0': '#2C2DE0',
    '#dcfce7': '#EEF2FF',
    '#f0fdf4': '#EEF2FF',
    '#166534': '#2C2DE0',
    '#14532d': '#2C2DE0',
  };

  for (const [from, to] of Object.entries(hexMap)) {
    // case insensitive replace
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    content = content.replace(new RegExp(escaped, 'gi'), to);
  }
  return content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = replaceTailwindGreen(content);
  content = replaceHexGreens(content);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', path.relative(process.cwd(), filePath));
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(jsx?|tsx?)$/.test(entry)) {
      processFile(full);
    }
  }
}

walk(TARGET_DIR);
console.log('Done fixing student folder.');
