const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // This regex matches any Tailwind class containing "-green-" with a number, 
    // e.g., bg-green-500, text-green-600, border-green-300/50, hover:bg-green-400
    // and forcefully converts it to use the exact hex #2C2DE0 while preserving the prefix (bg, text, etc) and opacity.
    content = content.replace(/\b([a-zA-Z]+)-green-\d+(?:\/(\d+|\[[^\]]+\]))?\b/g, (match, prefix, opacity) => {
        return prefix + '-[#2C2DE0]' + (opacity ? '/' + opacity : '');
    });

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Eradicated all green from:', filePath);
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
