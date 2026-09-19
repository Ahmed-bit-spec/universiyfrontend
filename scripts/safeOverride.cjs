const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src');

const BUTTON_APPEND_CLASSES = " text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group";

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace hex colors
    const greenHexes = [
        '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', 
        '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#052e16'
    ];
    for (const hex of greenHexes) {
        content = content.replace(new RegExp(hex, 'gi'), '#2C2DE0');
    }

    // 2. Eradicate all tailwind "green" utilities
    content = content.replace(/\b([a-zA-Z]+)-green-\d+(?:\/(\d+|\[[^\]]+\]))?\b/g, (match, prefix, opacity) => {
        return prefix + '-[#2C2DE0]' + (opacity ? '/' + opacity : '');
    });

    // 3. Safely inject the 3D classes to buttons
    // Only target <button className="..."> that now contain bg-[#2C2DE0] 
    // AND don't already have the shadow class.
    // Instead of parsing perfectly, we can safely inject classes right before the closing quote or backtick.
    
    // For standard string classNames: <button ... className="... bg-[#2C2DE0] ...">
    content = content.replace(/(<button[^>]*className=["'])([^"']*bg-\[\#2C2DE0\][^"']*)(["'])/g, (match, p1, p2, p3) => {
        if (!p2.includes('shadow-[0_4px_0_#1E1FAA]')) {
            return p1 + p2 + BUTTON_APPEND_CLASSES + p3;
        }
        return match;
    });

    // For template literal classNames: <button ... className={`... bg-[#2C2DE0] ...`}>
    content = content.replace(/(<button[^>]*className=\{`)([^`]*bg-\[\#2C2DE0\][^`]*)(`\})/g, (match, p1, p2, p3) => {
        if (!p2.includes('shadow-[0_4px_0_#1E1FAA]')) {
            return p1 + p2 + BUTTON_APPEND_CLASSES + p3;
        }
        return match;
    });

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Safely updated buttons and eradicated green in:', filePath);
    }
}

function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);
        
        // Exclude Landing pages
        if (file === 'FrontDoorSystem') continue;

        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (/\.(jsx|js|tsx|ts)$/.test(fullPath)) {
            processFile(fullPath);
        }
    }
}

walkDir(dir);
