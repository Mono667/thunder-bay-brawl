'use strict';
// Thunder Bay Brawl - game server (Windows / macOS / Linux, Node 18+).
// Serves the game (../index.html) over HTTP and relays online matches over
// WebSocket at /ws. Rooms use 4-letter codes; the host's phone runs the fight.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT) || 8080;
const ROOT = path.resolve(path.join(__dirname, '..'));
const BLOCKED = new Set(['server', 'test', 'src', 'node_modules', '.git']);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };

const server = http.createServer((req, res) => {
  let rel;
  try { rel = decodeURIComponent((req.url || '/').split('?')[0]); } catch (e) { res.writeHead(400); return res.end('Bad request'); }
  if (rel === '/' || rel === '') rel = '/index.html';
  if (rel === '/health') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok ' + rooms.size + ' rooms'); }
  const file = path.resolve(path.join(ROOT, rel));
  const inside = path.relative(ROOT, file);
  const first = inside.split(path.sep)[0];
  if (!inside || inside.startsWith('..') || path.isAbsolute(inside) || BLOCKED.has(first)) { res.writeHead(404); return res.end('Not found'); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
});

// ---- rooms ----
const rooms = new Map(); // code -> { host, guest, hostChar }
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
function newCode() {
  for (let n = 0; n < 1000; n++) {
    let c = ''; for (let i = 0; i < 4; i++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (!rooms.has(c)) return c;
  }
  throw new Error('no free room codes');
}
function send(ws, msg) { if (ws && ws.readyState === 1) ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg)); }
function leave(ws) {
  const code = ws.room; if (!code) return;
  ws.room = null;
  const r = rooms.get(code); if (!r) return;
  const other = r.host === ws ? r.guest : r.host;
  rooms.delete(code);
  if (other) { other.room = null; send(other, { t: 'left' }); }
  log('room ' + code + ' closed');
}
function log(s) { console.log(new Date().toLocaleTimeString() + '  ' + s); }

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 64 * 1024 });
wss.on('connection', (ws, req) => {
  ws.alive = true; ws.room = null;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', (data) => {
    const text = data.toString();
    let m; try { m = JSON.parse(text); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    if (m.t === 'create') {
      leave(ws);
      const code = newCode();
      rooms.set(code, { host: ws, guest: null, hostChar: String(m.char || '') });
      ws.room = code; ws.role = 'host';
      send(ws, { t: 'created', code });
      log('room ' + code + ' created by ' + req.socket.remoteAddress);
      return;
    }
    if (m.t === 'join') {
      const code = String(m.code || '').toUpperCase();
      const r = rooms.get(code);
      if (!r) return send(ws, { t: 'err', msg: 'No room called ' + code + '. Check the code on the host phone.' });
      if (r.guest) return send(ws, { t: 'err', msg: 'Room ' + code + ' is already full.' });
      leave(ws);
      r.guest = ws; ws.room = code; ws.role = 'guest';
      send(ws, { t: 'joined', code, hostChar: r.hostChar });
      send(r.host, { t: 'peer', char: String(m.char || '') });
      log('room ' + code + ': guest joined from ' + req.socket.remoteAddress);
      return;
    }
    // everything else ('in', 'snap', 'rematch') is relayed to the other phone
    const r = ws.room && rooms.get(ws.room);
    if (!r) return;
    send(r.host === ws ? r.guest : r.host, text);
  });
  ws.on('close', () => leave(ws));
  ws.on('error', () => {});
});
const beat = setInterval(() => {
  for (const ws of wss.clients) { if (!ws.alive) { ws.terminate(); continue; } ws.alive = false; try { ws.ping(); } catch (e) {} }
}, 15000);
wss.on('close', () => clearInterval(beat));

function lanAddresses() {
  const out = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const n of nets[name] || []) {
      const v4 = n.family === 'IPv4' || n.family === 4;
      if (v4 && !n.internal) out.push({ name, address: n.address });
    }
  }
  return out;
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error('\nPort ' + PORT + ' is already in use. Close the other server window, or set PORT to another number.\n');
  else console.error(e);
  process.exit(1);
});
server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  THUNDER BAY BRAWL server is running on port ' + PORT);
  console.log('  This computer:  http://localhost:' + PORT);
  const lan = lanAddresses();
  if (!lan.length) console.log('  (No network found - connect this computer to Wi-Fi.)');
  for (const a of lan) console.log('  Phones open:    http://' + a.address + ':' + PORT + '    (' + a.name + ')');
  console.log('');
  console.log('  Phones must be on the same Wi-Fi. Tap ONLINE 2P, then CREATE ROOM / JOIN.');
  console.log('  Leave this window open. Press Ctrl+C to stop.');
  console.log('');
});
