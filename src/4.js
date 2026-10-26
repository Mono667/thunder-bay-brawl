<script>
'use strict';
/* =====================================================================
   UI, INPUT WIRING, ONLINE, MAIN LOOP
   ===================================================================== */
const $ = (id) => document.getElementById(id);
let frame = 0, pick = 'lynx', pendingMode = 'solo';
function show(id) { for (const s of document.querySelectorAll('.scr')) s.classList.toggle('on', s.id === id); }
function inGameUI(on) { $('ctl').classList.toggle('on', on && ('ontouchstart' in window || navigator.maxTouchPoints > 0)); $('b-pause').classList.toggle('on', on); }
function fit() {
  const s = Math.min(innerWidth / 960, innerHeight / 540);
  cv.style.width = Math.floor(960 * s) + 'px'; cv.style.height = Math.floor(540 * s) + 'px';
}
addEventListener('resize', fit); fit();

/* ---- character select cards ---- */
function buildCards() {
  const box = $('cards'); box.innerHTML = '';
  for (const id of CHAR_IDS) {
    const C = CHARS[id], d = document.createElement('div');
    d.className = 'card' + (id === pick ? ' sel' : ''); d.id = 'pick-' + id;
    const st = Object.entries(C.stats).map(([k, v]) => `<div class="stat"><b>${k.toUpperCase()}</b><i><s style="width:${v * 20}%"></s></i></div>`).join('');
    d.innerHTML = `<canvas width="120" height="64"></canvas><div class="nm">${C.title}</div><div class="ds">${C.blurb}</div>${st}`;
    d.addEventListener('click', () => { pick = id; buildCards(); });
    box.appendChild(d);
  }
}
function drawCards() {
  for (const id of CHAR_IDS) {
    const el = document.querySelector('#pick-' + id + ' canvas'); if (!el) continue;
    const g = el.getContext('2d'); g.clearRect(0, 0, 120, 64);
    const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#1a1442'); gr.addColorStop(1, '#3a2457'); g.fillStyle = gr; g.fillRect(0, 0, 120, 64);
    g.fillStyle = '#24222c'; g.fillRect(0, 56, 120, 8);
    const f = newFighter(id, 0); f.st = id === pick ? 'win' : 'idle'; f.t = frame;
    const save = G; if (!G) G = { camX: 0 };
    g.save(); g.translate(60, 58); g.scale(0.56, 0.56); RENDERERS.shapes(g, f, CHARS[id], 0, 0, frame); g.restore();
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
  if (pendingMode === 'solo') { const other = CHAR_IDS.find(c => c !== pick); startSolo(pick, QS.get('cpu') || other); }
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

/* ---- touch: virtual stick ---- */
(function stick() {
  const el = $('stick'), knob = $('knob'); let pid = null;
  const set = (e) => {
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = e.clientX - cx, dy = e.clientY - cy; const R = r.width * 0.36, m = Math.hypot(dx, dy);
    if (m > R) { dx *= R / m; dy *= R / m; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    const dz = r.width * 0.12;
    (dx < -dz ? localIn.down('l') : localIn.up('l')); (dx > dz ? localIn.down('r') : localIn.up('r'));
    (dy < -r.width * 0.2 ? localIn.down('u') : localIn.up('u')); (dy > r.width * 0.16 ? localIn.down('d') : localIn.up('d'));
  };
  const end = (e) => { if (e.pointerId !== pid) return; pid = null; knob.style.transform = ''; for (const k of ['l', 'r', 'u', 'd']) localIn.up(k); };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); audioInit(); pid = e.pointerId; try { el.setPointerCapture(pid); } catch (_) {} set(e); });
  el.addEventListener('pointermove', (e) => { if (e.pointerId === pid) set(e); });
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
})();
/* ---- touch: attack buttons ---- */
for (const [id, k] of [['b-lp', 'lp'], ['b-hp', 'hp'], ['b-lk', 'lk'], ['b-hk', 'hk'], ['b-bl', 'bl'], ['b-sp', 'sp']]) {
  const el = $(id);
  const up = (e) => { localIn.up(k); el.classList.remove('dn'); };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); audioInit(); localIn.down(k); el.classList.add('dn'); });
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
    case 'peer': status('Opponent joined!'); hostStart(pick, CHARS[m.char] ? m.char : CHAR_IDS.find(c => c !== pick)); break;
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
  render();
}
requestAnimationFrame(loop);

/* ---- test / debug hooks ---- */
window.FIGHT = {
  get G() { return G; },
  state() { if (!G) return { phase: 'menu' }; const f = G.f.map(x => ({ ch: x.ch, x: Math.round(x.x), y: Math.round(x.y), hp: x.hp, red: x.red, st: x.st, mv: x.mv, face: x.face })); return { mode: G.mode, phase: G.phase, round: G.round, wins: G.wins, timer: G.timer, banner: G.banner && G.banner.txt, result: G.result, f, stat: G.stat, proj: G.proj.length, tick: G.tick, me, snaps: NET.snaps, code: NET.code }; },
  setHp(i, v) { G.f[i].hp = v; G.f[i].red = v; },
  cpu(on) { cpuOn = on; cpuIn.clear(); },
  press(i, k) { (i === me ? localIn : G.mode === 'host' ? remoteIn : cpuIn).latch[k] = true; },
  hold(i, k, on) { const s = i === me ? localIn : G.mode === 'host' ? remoteIn : cpuIn; s.held[k] = !!on; },
  place(i, x) { G.f[i].x = x; }
};
</script>
</body>
</html>
