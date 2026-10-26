// Joins every file in src/ (in name order) into the single playable index.html.  Run:  node build.js
// A short build id is stamped in so a phone holding an old cached copy can spot it and reload.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const dir = path.join(__dirname, 'src');
const files = fs.readdirSync(dir).filter(f => /\.(html|js)$/.test(f)).sort();
let out = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('');
const id = crypto.createHash('sha1').update(out).digest('hex').slice(0, 8);
out = out.replace(/__BUILD__/g, id);
fs.writeFileSync(path.join(__dirname, 'index.html'), out);
console.log('index.html rebuilt (build ' + id + ') from ' + files.join(', '));
