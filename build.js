// Joins src/ parts into the single playable index.html.  Run:  node build.js
const fs = require('fs'), path = require('path');
const parts = ['1.html', '2.js', '3.js', '4.js'].map(f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8'));
fs.writeFileSync(path.join(__dirname, 'index.html'), parts.join(''));
console.log('index.html rebuilt');
