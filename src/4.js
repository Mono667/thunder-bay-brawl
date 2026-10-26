<script>
'use strict';
/* =====================================================================
   UI, INPUT WIRING, ONLINE, MAIN LOOP
   ===================================================================== */
const $ = (id) => document.getElementById(id);
let frame = 0, pick = 'craig', pendingMode = 'solo';
function show(id) { for (const s of document.querySelectorAll('.scr')) s.classList.toggle('on', s.id === id); }
function inGameUI(on) { $('ctl').classList.toggle('on', on && ('ontouchstart' in window || navigator.maxTouchPoints > 0)); $('b-pause').classList.toggle('on', on); }
function fit() {
  const s = Math.min(innerWidth / 960, innerHeight / 540);
  cv.style.width = Math.floor(960 * s) + 'px'; cv.style.height = Math.floor(540 * s) + 'px';
}
addEventListener('resize', fit); fit();
paintLogo(0);
/* ---- stale-cache guard: GitHub Pages lets browsers keep the page ~10 min. If the live copy has a
   newer build id than the one running, reload once onto it. ---- */
const BUILD_ID = '__BUILD__';
if ($('build')) $('build').textContent = 'build ' + BUILD_ID;
(function freshCheck() {
  if (location.protocol === 'file:' || QS.has('nofresh') || !window.fetch) return;
  fetch(location.pathname + '?fresh=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.text() : '').then(t => {
    const m = t.match(/const BUILD_ID = '([0-9a-f]{8})'/);
    if (m && m[1] !== BUILD_ID && !G && !sessionStorage.getItem('tbb-fresh-' + m[1])) {
      sessionStorage.setItem('tbb-fresh-' + m[1], '1'); const u = new URL(location.href); u.searchParams.set('v', m[1]); location.replace(u.toString());
    }
  }).catch(() => {});
})();
function crtLabel() { const b = $('btn-crt'); if (b) b.textContent = 'CRT SCANLINES: ' + (CRT.on ? 'ON' : 'OFF'); }
if ($('btn-crt')) { crtLabel(); $('btn-crt').onclick = () => { CRT.on = !CRT.on; localStorage.setItem('tbb-crt', CRT.on ? '1' : '0'); crtLabel(); }; }

/* ---- character select cards ---- */
const CARD_TXT = { craig: 'Balanced brawler. INK SPLASH projectile.', aj: 'Big, slow, tanky. Grab slam + ground quake.', bino: 'Rushdown. Chain flurry + KISS MY BUTT taunt-grab.', sara: 'Fastest. Wire toss, teleport drop kick, dash.', dirty: '"NICE NICE NICE NICE NICE!" Lanky zoner, steals your gear.' };
function buildCards() {
  const box = $('cards'); box.innerHTML = '';
  for (const id of CHAR_IDS) {
    const C = CHARS[id], d = document.createElement('div');
    d.className = 'card' + (id === pick ? ' sel' : ''); d.id = 'pick-' + id;
    const st = Object.entries(C.stats).map(([k, v]) => `<div class="stat"><b>${k.toUpperCase()}</b><i><s style="width:${v * 20}%"></s></i></div>`).join('');
    d.title = C.blurb;
    d.innerHTML = `<canvas width="140" height="100"></canvas><div class="nm">${C.title}</div><div class="ds">${CARD_TXT[id] || C.blurb}</div>${st}`;
    d.addEventListener('click', () => { pick = id; buildCards(); });
    box.appendChild(d);
  }
}
function drawCards() {
  for (const id of CHAR_IDS) {
    const el = document.querySelector('#pick-' + id + ' canvas'); if (!el) continue;
    const g = el.getContext('2d'), sel = id === pick; g.imageSmoothingEnabled = false; g.clearRect(0, 0, 140, 100);
    const gr = g.createLinearGradient(0, 0, 0, 100); gr.addColorStop(0, sel ? '#3a1a10' : '#120f2a'); gr.addColorStop(1, sel ? '#a0401a' : '#2a1d48'); g.fillStyle = gr; g.fillRect(0, 0, 140, 100);
    g.globalAlpha = sel ? 1 : 0.85; g.drawImage(PORTRAITS[id][sel ? 'win' : 'big'], 0, 2); g.globalAlpha = 1;
    g.fillStyle = '#0b0712'; g.fillRect(0, 92, 140, 8);
    const f = newFighter(id, 0); f.face = -1; f.st = sel ? 'win' : 'idle'; f.t = frame % 240;
    const save = G; if (!G) G = { camX: 0 };
    g.save(); g.translate(112, 96); g.scale(0.62, 0.62); (RENDERERS[CHARS[id].render] || RENDERERS.pixel)(g, f, CHARS[id], 0, 0, frame); g.restore();
    G = save;
  }
}
/* ---- buttons ---- */
$('btn-solo').onclick = () => { audioInit(); pendingMode = 'solo'; $('btn-fight').textContent = 'FIGHT!'; buildCards(); show('s-select'); };
$('btn-online').onclick = () => { audioInit(); pendingMode = 'online'; $('btn-fight').textContent = 'NEXT'; buildCards(); show('s-select'); };
$('btn-howto').onclick = () => show('s-howto');
$('btn-howto-back').onclick = () => show('s-title');
$('btn-sel-back').onclick = () => show('s-title');
$('btn-fight').onclick = () => {
  audioInit();
  if (pendingMode === 'solo') { const pool = CHAR_IDS.filter(c => c !== pick), q = QS.get('cpu'); startSolo(pick, CHARS[q] ? q : pool[Math.floor(Math.random() * pool.length)]); }
  else { $('srv').value = $('srv').value || localStorage.getItem('tbb-server') || defaultServer(); $('net-status').textContent = ''; $('bigcode').textContent = ''; show('s-online'); }
};
$('btn-online-back').onclick = () => { netClose(); show('s-select'); };
$('b-pause').onclick = () => { if (!G) return; if (G.mode === 'solo') paused = true; $('btn-resume').style.display = G.mode === 'solo' ? '' : 'none'; $('btn-restart').style.display = G.mode === 'guest' ? 'none' : ''; show('s-pause'); };
$('btn-resume').onclick = () => { paused = false; localIn.clear(); show(null); };
$('btn-restart').onclick = () => { paused = false; show(null); if (G.mode === 'solo') startSolo(G.chars[0], G.chars[1]); else if (G.mode === 'host') hostStart(G.chars[0], G.chars[1]); };
$('btn-quit').onclick = () => quitToMenu();
$('btn-menu').onclick = () => quitToMenu();
$('btn-rematch').onclick = () => {
  if (G.mode === 'solo') startSolo(G.chars[0], G.chars[1]);
  else if (G.mode === 'host') hostStart(G.chars[0], G.chars[1]);
  else { netSend({ t: 'rematch' }); $('end-note').textContent = 'Asked the host for a rematch...'; }
};
function quitToMenu() { paused = false; netClose(); G = null; inGameUI(false); show('s-title'); }
function startSolo(c1, c2) { me = 0; paused = false; lastEv = 0; localIn.clear(); newMatch('solo', c1, c2); show(null); inGameUI(true); }

/* ---- touch: floating stick - touch anywhere on the left half, the stick appears under your thumb ---- */
function vsSkip() { if (G && G.phase === 'vs') localIn.latch.lp = true; }
const STICK = { pid: null, ox: 0, oy: 0 };
(function stick() {
  const zone = $('lzone'), el = $('stick'), knob = $('knob');
  const dirs = (dx, dy, R) => {   // 8-way: each direction covers +-67.5deg, so diagonals are as wide as straights
    const m = Math.hypot(dx, dy), ux = m ? dx / m : 0, uy = m ? dy / m : 0, on = m > R * 0.33;
    return { l: on && ux < -0.38, r: on && ux > 0.38, d: on && uy > 0.38, u: m > R * 0.45 && uy < -0.38 };
  };
  const set = (e) => {
    const R = el.offsetWidth * 0.5 || 70;
    let dx = e.clientX - STICK.ox, dy = e.clientY - STICK.oy; const m = Math.hypot(dx, dy);
    if (m > R * 1.25) { const k = (m - R * 1.25) / m; STICK.ox += dx * k; STICK.oy += dy * k; dx -= dx * k; dy -= dy * k; place(); }   // base follows a long drag
    const km = Math.min(1, R * 0.72 / (Math.hypot(dx, dy) || 1));
    knob.style.transform = `translate(${dx * km}px,${dy * km}px)`;
    const d = dirs(dx, dy, R); for (const k of ['l', 'r', 'u', 'd']) (d[k] ? localIn.down(k) : localIn.up(k));
  };
  const place = () => { el.style.left = STICK.ox + 'px'; el.style.top = STICK.oy + 'px'; };
  const end = (e) => { if (e.pointerId !== STICK.pid) return; STICK.pid = null; knob.style.transform = ''; el.classList.remove('on'); for (const k of ['l', 'r', 'u', 'd']) localIn.up(k); };
  zone.addEventListener('pointerdown', (e) => {
    e.preventDefault(); audioInit(); vsSkip(); if (STICK.pid != null) return;
    STICK.pid = e.pointerId; try { zone.setPointerCapture(e.pointerId); } catch (_) {}
    STICK.ox = e.clientX; STICK.oy = e.clientY; place(); el.classList.add('on'); set(e);
  });
  zone.addEventListener('pointermove', (e) => { if (e.pointerId === STICK.pid) set(e); });
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
})();
cv.addEventListener('pointerdown', vsSkip);
/* ---- touch: attack buttons ---- */
for (const [id, k] of [['b-lp', 'lp'], ['b-hp', 'hp'], ['b-lk', 'lk'], ['b-hk', 'hk'], ['b-bl', 'bl'], ['b-sp', 'sp']]) {
  const el = $(id);
  const up = (e) => { localIn.up(k); el.classList.remove('dn'); };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); audioInit(); vsSkip(); localIn.down(k); el.classList.add('dn'); });
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', up);
}
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => { if (!(e.target instanceof HTMLInputElement)) e.preventDefault(); }, { passive: false });
/* ---- keyboard ---- */
const KMAP = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', KeyJ: 'lp', KeyK: 'hp', KeyU: 'lk', KeyI: 'hk', KeyL: 'bl', KeyO: 'sp' };
addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  audioInit();
  if ((e.code === 'Escape' || e.code === 'KeyP') && G) { if ($('s-pause').classList.contains('on')) $('btn-resume').onclick(); else $('b-pause').onclick(); return; }
  const k = KMAP[e.code]; if (k) { e.preventDefault(); if (!e.repeat) localIn.down(k); }
});
addEventListener('keyup', (e) => { const k = KMAP[e.code]; if (k) localIn.up(k); });
addEventListener('blur', () => localIn.clear());

/* =====================================================================
   ONLINE 2P (host-authoritative)
   Host = player 1, runs the whole simulation, sends the game state ~30x/s.
   Guest = player 2, sends its buttons every tick and just draws the state.
   The relay is server/server.js (WebSocket on /ws, 4-letter room codes).
   ===================================================================== */
const NET = { ws: null, role: null, code: null, lastSent: '', sentAt: 0, snaps: 0 };
function defaultServer() { return /github\.io$/.test(location.hostname) || location.protocol === 'file:' ? '' : location.host; }
function wsURL(s) {
  s = s.trim().replace(/\/+$/, '');
  if (/^wss?:\/\//.test(s)) return s.replace(/\/ws$/, '') + '/ws';
  if (/^https?:\/\//.test(s)) return s.replace(/^http/, 'ws').replace(/\/ws$/, '') + '/ws';
  return (location.protocol === 'https:' ? 'wss://' : 'ws://') + s + '/ws';
}
function status(t) { $('net-status').textContent = t; }
function netSend(m) { if (NET.ws && NET.ws.readyState === 1) NET.ws.send(JSON.stringify(m)); }
function netClose() { if (NET.ws) { NET.ws.onclose = null; try { NET.ws.close(); } catch (_) {} } NET.ws = null; NET.role = null; }
function netOpen(onOpen) {
  const s = $('srv').value;
  if (!s.trim()) { status('Type the laptop server address first, e.g. 192.168.1.20:8080'); return; }
  localStorage.setItem('tbb-server', s.trim());
  netClose();
  let ws;
  try { ws = new WebSocket(wsURL(s)); } catch (e) { status('Bad server address.'); return; }
  NET.ws = ws; status('Connecting...');
  ws.onopen = onOpen;
  ws.onerror = () => status(location.protocol === 'https:' && !/^wss|^https/.test(s.trim()) ? 'Could not connect. This page is https, so open the game from the laptop address instead (http://LAPTOP-IP:8080).' : 'Could not reach the server. Is start-server.bat running and are you on the same Wi-Fi?');
  ws.onclose = () => { if (NET.ws !== ws) return; NET.ws = null; if (G && G.mode !== 'solo') { quitToMenu(); show('s-online'); } status('Disconnected from server.'); };
  ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch (_) { return; } onNet(m); };
}
$('btn-create').onclick = () => { audioInit(); netOpen(() => { NET.role = 'host'; netSend({ t: 'create', char: pick }); }); };
$('btn-join').onclick = () => {
  audioInit(); const code = $('code').value.trim().toUpperCase();
  if (!/^[A-Z]{4}$/.test(code)) { status('Room codes are 4 letters.'); return; }
  netOpen(() => { NET.role = 'guest'; netSend({ t: 'join', code, char: pick }); });
};
function hostStart(c1, c2) { me = 0; paused = false; lastEv = 0; localIn.clear(); remoteIn.clear(); newMatch('host', c1, c2); show(null); inGameUI(true); netSend({ t: 'snap', g: G }); }
function onNet(m) {
  switch (m.t) {
    case 'created': NET.code = m.code; $('bigcode').textContent = m.code; status('Room ready. On the other phone: ONLINE 2P → pick a fighter → type this code → JOIN.'); break;
    case 'peer': status('Opponent joined!'); hostStart(pick, CHARS[m.char] ? m.char : CHAR_IDS.filter(c => c !== pick)[Math.floor(Math.random() * (CHAR_IDS.length - 1))]); break;
    case 'joined': NET.code = m.code; me = 1; lastEv = 0; localIn.clear(); status('Joined room ' + m.code + '. Waiting for the host...'); break;
    case 'snap':
      if (NET.role !== 'guest') break;
      if (!G || G.mode !== 'guest') { show(null); inGameUI(true); }
      if (G && m.g.evId < (G.evId || 0)) lastEv = 0;
      G = m.g; G.mode = 'guest'; NET.snaps++;
      if (G.phase !== 'matchEnd' && $('s-end').classList.contains('on')) show(null);
      break;
    case 'in': if (NET.role === 'host') { remoteIn.held = m.h || {}; for (const k of (m.p || [])) remoteIn.latch[k] = true; } break;
    case 'rematch': if (NET.role === 'host' && G && G.phase === 'matchEnd') hostStart(G.chars[0], G.chars[1]); break;
    case 'left': status('Opponent left the room.'); const wasGame = !!G; netClose(); G = null; inGameUI(false); show('s-online'); if (wasGame) status('Opponent left the match.'); break;
    case 'err': status(m.msg || 'Server error.'); netClose(); break;
  }
}
function guestSendInput() {
  const latch = Object.keys(localIn.latch).filter(k => localIn.latch[k]);
  const h = {}; for (const k of KEYS) if (localIn.held[k]) h[k] = 1;
  const key = JSON.stringify(h);
  if (latch.length || key !== NET.lastSent || frame - NET.sentAt > 15) { netSend({ t: 'in', h, p: latch }); NET.lastSent = key; NET.sentAt = frame; }
  localIn.latch = {};
}

/* =====================================================================
   MAIN LOOP  (fixed 60 Hz simulation, render every animation frame)
   ===================================================================== */
let acc = 0, last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  let dt = now - last; last = now; if (dt > 250) dt = 250;
  acc += dt;
  while (acc >= TICK) {
    acc -= TICK; frame++;
    if (G && G.mode === 'guest') { guestSendInput(); }
    else if (G && !paused) {
      step();
      if (G.mode === 'host' && G.tick % 2 === 0) netSend({ t: 'snap', g: G });
    }
  }
  if (G) {
    playEvents();
    if (G.phase === 'matchEnd' && G.pt > 70 && !$('s-end').classList.contains('on') && !$('s-pause').classList.contains('on')) {
      $('btn-rematch').style.display = ''; $('end-note').textContent = G.mode === 'guest' ? 'Rematch asks the host to restart.' : '';
      show('s-end');
    }
  }
  if ($('s-select').classList.contains('on')) drawCards();
  const vsOn = !!(G && G.phase === 'vs'); if (vsOn !== $('ctl').classList.contains('vs')) $('ctl').classList.toggle('vs', vsOn);
  if (!G && $('s-title').classList.contains('on') && (frame & 1)) paintLogo(frame);
  render(); qualTick(dt);
}
requestAnimationFrame(loop);

/* ---- test / debug hooks ---- */
window.FIGHT = {
  get G() { return G; },
  state() { if (!G) return { phase: 'menu' }; const f = G.f.map(x => ({ ch: x.ch, x: Math.round(x.x), y: Math.round(x.y), hp: x.hp, red: x.red, st: x.st, mv: x.mv, face: x.face, buff: x.buff || 0, dz: x.dz || 0, tcd: x.tcd || 0 })); return { mode: G.mode, phase: G.phase, round: G.round, wins: G.wins, timer: G.timer, banner: G.banner && G.banner.txt, result: G.result, f, stat: G.stat, proj: G.proj.length, tick: G.tick, me, snaps: NET.snaps, code: NET.code, q: QUAL.lv, crt: CRT.on, steal: G.steal && { i: G.steal.i, v: G.steal.v, item: G.steal.item, t: G.steal.t, T: G.steal.T }, kiss: !!G.kiss, ctr: !!G.ctr, sfz: !!G.sfz, combo: G.combo && G.combo.n, vsLine: G.vsLine, banter: G.f && banterFor(G.f[0].ch, G.f[1].ch, G.vsLine), pt: G.pt }; },
  setHp(i, v) { G.f[i].hp = v; G.f[i].red = v; },
  cpu(on) { cpuOn = on; cpuIn.clear(); },
  press(i, k) { (i === me ? localIn : G.mode === 'host' ? remoteIn : cpuIn).latch[k] = true; },
  hold(i, k, on) { const s = i === me ? localIn : G.mode === 'host' ? remoteIn : cpuIn; s.held[k] = !!on; },
  place(i, x) { G.f[i].x = x; },
  skipVS() { if (G && G.phase === 'vs') G.pt = VS_T - 1; }
};
</script>
</body>
</html>
