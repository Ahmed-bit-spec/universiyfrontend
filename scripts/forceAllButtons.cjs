const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src');

const exactButtonClasses = 'bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 dark:bg-[#1E1FAA] dark:shadow-[0_4px_0_#0F0F55] dark:hover:shadow-[0_2px_0_#0F0F55] px-4 py-2 w-full md:w-auto rounded-xl';

function removeConflictingClasses(classNameStr) {
    return classNameStr.split(/\s+/).filter(cls => {
        if (!cls) return false;
        if (cls.startsWith('bg-') && !cls.includes('bg-transparent')) return false;
        if (cls.startsWith('text-') && !cls.startsWith('text-[')) return false; 
        if (cls.startsWith('shadow')) return false;
        if (cls.startsWith('hover:')) return false;
        if (cls.startsWith('active:')) return false;
        if (cls.startsWith('dark:')) return false;
        if (cls.startsWith('border-')) return false;
        if (cls.startsWith('ring-')) return false;
        if (cls === 'rounded' || cls.startsWith('rounded-')) return false; 
        if (cls === 'transition' || cls.startsWith('transition-') || cls.startsWith('duration-')) return false;
        return true;
    }).join(' ');
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Regular string classNames
    content = content.replace(/(<button[^>]*className=["'])([^"']*)(["'])/g, (match, p1, p2, p3) => {
        let cleaned = removeConflictingClasses(p2);
        return p1 + cleaned + (cleaned ? ' ' : '') + exactButtonClasses + p3;
    });
    
    // 2. Template literal classNames
    content = content.replace(/(<button[^>]*className=\{`)([\s\S]*?)(`\})/g, (match, p1, p2, p3) => {
        // We do NOT clean p2 because it might contain ${...} logic which would get destroyed.
        // We just append our classes to the end of the template literal.
        // It's safe to append it right before the closing backtick.
        // However, we want to strip static bg-* etc. if they are not in ${}
        // Doing that with regex is too risky. Let's just append. The later classes usually override.
        return p1 + p2 + ' ' + exactButtonClasses + p3;
    });

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Forced button styles in:', filePath);
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
