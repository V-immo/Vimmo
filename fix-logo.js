const fs = require('fs');
const path = require('path');

const directoryPath = 'c:\\Users\\devel\\.gemini\\antigravity\\scratch\\modern-real-estate';

function updateFile(filePath) {
    if (!filePath.endsWith('.html')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace the specific logo span structure with the new class-based one
    // Look for various versions we've used
    const patterns = [
        {
            regex: /<span style="color: #d63031; font-weight: 400;">V<\/span>\s*<span style="color: #3d3530; font-weight: 200;">[Ii]<\/span><span style="color: #3d3530; font-weight: 800;">MMO<\/span>/g,
            replacement: '<span class="logo-v">V</span> <span class="logo-i">I</span><span class="logo-mmo">MMO</span>'
        },
        {
            regex: /<span style="color: #d63031; font-weight: 400;">V<\/span>\s*<span style="color: #3d3530; font-weight: 100;">[Ii]<\/span><span style="color: #3d3530; font-weight: 800;">MMO<\/span>/g,
            replacement: '<span class="logo-v">V</span> <span class="logo-i">I</span><span class="logo-mmo">MMO</span>'
        },
        {
            regex: /<span style="color: #d63031; font-weight: 400;">V<\/span>\s*<span style="color: #3d3530; font-weight: 400;">[Ii]<\/span><span style="color: #3d3530; font-weight: 800;">MMO<\/span>/g,
            replacement: '<span class="logo-v">V</span> <span class="logo-i">I</span><span class="logo-mmo">MMO</span>'
        }
    ];

    patterns.forEach(p => {
        if (p.regex.test(content)) {
            content = content.replace(p.regex, p.replacement);
            changed = true;
        }
    });

    // Also fix the font import if it's there
    if (content.includes('fonts.googleapis.com/css2?family=Outfit')) {
        const fontRegex = /https:\/\/fonts\.googleapis\.com\/css2\?family=Outfit:wght@[0-9;]+&/g;
        if (fontRegex.test(content)) {
            content = content.replace(fontRegex, 'https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;600;700;800&');
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                walkDir(fullPath);
            }
        } else {
            updateFile(fullPath);
        }
    });
}

walkDir(directoryPath);
