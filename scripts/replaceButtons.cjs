const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src');

const buttonClasses = 'text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 dark:shadow-[0_4px_0_#0F0F55] dark:hover:shadow-[0_2px_0_#0F0F55]';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    if (content.includes('bg-[#2C2DE0]') && !content.includes('shadow-[0_4px_0_#1E1FAA]')) {
        content = content.replace(/(className=(?:\{`|["']))([^`"']*bg-\[\#2C2DE0\][^`"']*)([`"']|\}\})/g, (match, prefix, inner, suffix) => {
            if (!inner.includes('shadow-[0_4px_0_#1E1FAA]')) {
                return prefix + inner + ' ' + buttonClasses + suffix;
            }
            return match;
        });
    }

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Added 3D classes to buttons in:', filePath);
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
