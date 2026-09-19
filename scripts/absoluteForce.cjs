const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src');

const EXACT_CLASSES = "bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group";

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace all common Tailwind green hex codes with #2C2DE0
    const greenHexes = [
        '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', 
        '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#052e16'
    ];
    for (const hex of greenHexes) {
        content = content.replace(new RegExp(hex, 'gi'), '#2C2DE0');
    }

    // Completely overwrite every button's className with exactly what the user provided.
    // If it has className="...", replace the content.
    content = content.replace(/(<button[^>]*className=["'])([^"']*)(["'])/g, `$1${EXACT_CLASSES}$3`);
    
    // For template literals className={`...`}
    content = content.replace(/(<button[^>]*className=\{`)([^`]*)(`\})/g, `$1${EXACT_CLASSES}$3`);
    
    // If a button doesn't have a className, add one.
    // We can do a quick check: if `<button` is followed by something that doesn't have className before `>`, add it.
    // This regex matches `<button` not followed by `className` up to `>`
    content = content.replace(/<button(?![^>]*\bclassName\b)([^>]*)>/g, `<button className="${EXACT_CLASSES}"$1>`);

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Applied exact button classes and eradicated hex greens in:', filePath);
    }
}

function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (/\.(jsx|js|tsx|ts)$/.test(fullPath)) {
            processFile(fullPath);
        }
    }
}

walkDir(dir);
