const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We only add the dark: class if it's not already there for that element.
    // A simple regex string replace is dangerous if we don't check boundaries, but we will use \b and negative lookahead where possible, or just simple replace and fix dupes.
    
    const replacements = {
        'bg-white': 'bg-white dark:bg-gray-900',
        'bg-gray-50': 'bg-gray-50 dark:bg-gray-800',
        'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
        'text-gray-900': 'text-gray-900 dark:text-gray-100',
        'text-gray-800': 'text-gray-800 dark:text-gray-200',
        'text-gray-700': 'text-gray-700 dark:text-gray-300',
        'text-gray-600': 'text-gray-600 dark:text-gray-400',
        'text-gray-500': 'text-gray-500 dark:text-gray-400',
        'border-gray-200': 'border-gray-200 dark:border-gray-700',
        'border-gray-300': 'border-gray-300 dark:border-gray-600'
    };

    for (const [key, value] of Object.entries(replacements)) {
        // Find `key` that doesn't already have the `value` or `dark:` next to it
        // A simple way is to replace `key` with a temporary token, then replace token with `value`.
        // We can just use a regex that matches `key` not followed by `dark:`
        // Actually, if we just blindly replace, we might end up with `bg-white dark:bg-gray-900 dark:bg-gray-800` if it had `bg-white dark:bg-gray-800`.
        
        const regex = new RegExp(`\\b${key}\\b(?![^"'\`]*dark:)`, 'g');
        content = content.replace(regex, value);
    }

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Added dark mode classes in:', filePath);
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
