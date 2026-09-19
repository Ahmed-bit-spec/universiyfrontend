const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/FrontDoorSystem');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace hex colors for green
    const greenHexes = [
        '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', 
        '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#052e16'
    ];
    for (const hex of greenHexes) {
        content = content.replace(new RegExp(hex, 'gi'), '#2C2DE0');
    }

    // 2. Eradicate all tailwind "green" utilities without touching anything else
    content = content.replace(/\b([a-zA-Z]+)-green-\d+(?:\/(\d+|\[[^\]]+\]))?\b/g, (match, prefix, opacity) => {
        return prefix + '-[#2C2DE0]' + (opacity ? '/' + opacity : '');
    });

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Replaced green with #2C2DE0 in FrontDoorSystem file:', filePath);
    }
}

function walkDir(currentPath) {
    if (!fs.existsSync(currentPath)) return;
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
