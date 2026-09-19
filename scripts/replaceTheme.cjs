const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Remove textShadow inline style globally
    content = content.replace(/style=\{\{\s*textShadow:\s*["']0 2px 0 #1E1FAA["']\s*\}\}/g, '');
    
    // 2. Eradicate Green Theme globally
    // We add the shadow 3D effect to bg-green-500 buttons by default here because the user wanted the green buttons to become this 3D button.
    // Wait, replacing 'bg-green-500' with all the button classes might break if bg-green-500 is used on a badge. 
    // Let's just do the color swap first, then we can do another pass for buttons.
    content = content.replace(/bg-green-500\b/g, 'bg-[#2C2DE0] dark:bg-[#1E1FAA]');
    content = content.replace(/bg-green-600\b/g, 'bg-[#1E1FAA] dark:bg-[#0F0F55]');
    content = content.replace(/text-green-500\b/g, 'text-[#2C2DE0] dark:text-[#4F51FF]');
    content = content.replace(/text-green-600\b/g, 'text-[#1E1FAA] dark:text-[#4F51FF]');
    content = content.replace(/text-green-700\b/g, 'text-[#0F0F55] dark:text-blue-300');
    content = content.replace(/border-green-500\b/g, 'border-[#2C2DE0] dark:border-[#4F51FF]');
    content = content.replace(/border-green-300\b/g, 'border-[#4F51FF] dark:border-blue-400');
    content = content.replace(/ring-green-500\b/g, 'ring-[#2C2DE0] dark:ring-[#4F51FF]');
    content = content.replace(/bg-green-500\/10\b/g, 'bg-[#2C2DE0]/10 dark:bg-[#4F51FF]/20');
    content = content.replace(/bg-green-500\/20\b/g, 'bg-[#2C2DE0]/20 dark:bg-[#4F51FF]/30');
    content = content.replace(/bg-green-400\b/g, 'bg-[#4F51FF]');
    content = content.replace(/text-green-400\b/g, 'text-[#4F51FF]');
    content = content.replace(/border-green-400\b/g, 'border-[#4F51FF]');
    content = content.replace(/bg-green-50\b/g, 'bg-[#2C2DE0]/5 dark:bg-[#4F51FF]/10');
    content = content.replace(/text-green-800\b/g, 'text-[#0F0F55] dark:text-blue-200');
    
    // Inject button 3D styles for buttons that had green backgrounds.
    // If we see `<button className="... bg-[#2C2DE0] dark:bg-[#1E1FAA] hover:bg-[#1E1FAA] dark:bg-[#0F0F55] text-white ...">`
    // We can use a regex to find `<button ... className="..."` and replace its className string to include our 3D styles.
    // For now, let's just get the colors replaced.

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
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
