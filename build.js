// Joins every file in src/ (in name order) into the single playable index.html.  Run:  node build.js
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'src');
const files = fs.readdirSync(dir).filter(f => /\.(html|js)$/.test(f)).sort();
fs.writeFileSync(path.join(__dirname, 'index.html'), files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join(''));
console.log('index.html rebuilt from ' + files.join(', '));
