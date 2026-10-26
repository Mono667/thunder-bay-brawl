<script>
'use strict';
/* =====================================================================
   THUNDER BAY BRAWL  - first playable
   Canvas 2D, fixed 60 Hz timestep, no build step.
   World units: 480 x 270 logical pixels. y is height above the ground.
   ===================================================================== */
const W = 480, H = 270, GROUND = 238, STAGE_W = 800, TICK = 1000 / 60, MAXSEP = 440;
const QS = new URLSearchParams(location.search);
const SHOW_BOXES = QS.has('boxes');

/* ---------------------------------------------------------------------
   FIGHTER DATA
   Move fields: s=startup a=active r=recovery (ticks) dmg hs=hitstun bs=blockstun
   chip=damage on block  box=[x forward, y up from feet, w, h]  lvl=mid|low|high
   push=knockback px/tick  kd=knockdown  anim=pose used by the renderer
   `render` picks the drawing routine: 'pixel' (generated sprite sheets) now, 'sprite' once art arrives
   (see RENDERERS + the README "Swapping in art" section).
   --------------------------------------------------------------------- */
const CHARS = {
  craig: {
    name: 'CRAIG', title: 'CRAIG', hp: 1000, walk: 2.3, back: 2.0, jumpV: 7.2, jumpX: 2.8, grav: 0.42, scale: 1, bodyW: 24,
    blurb: 'Scrappy brawler. Solid all-round hits. Special: INK SPLASH (thrown blob of tattoo ink).',
    taunt: 'YOU JUST GOT INKED!',
    stats: { speed: 3, power: 3, reach: 3 },
    hurt: { st: [-13, 0, 26, 72], cr: [-14, 0, 28, 46], air: [-13, 8, 26, 58] },
    colors: { skin: '#eaa880', top: '#1a2030', top2: '#0b0712', pants: '#2e4466', hair: '#94663a', band: '#b0b0c0', glove: '#eaa880', shoe: '#1e1e22' },
    render: 'pixel', sprite: null,
    moves: {
      lp:  { s: 3, a: 2, r: 7,  dmg: 32, hs: 13, bs: 9,  box: [12, 54, 25, 9],  lvl: 'mid', push: 2.6, anim: 'punch' },
      hp:  { s: 7, a: 3, r: 15, dmg: 80, hs: 19, bs: 13, box: [12, 52, 34, 11], lvl: 'mid', push: 4.6, anim: 'punch', heavy: 1 },
      lk:  { s: 4, a: 3, r: 9,  dmg: 42, hs: 14, bs: 9,  box: [10, 24, 32, 10], lvl: 'mid', push: 2.8, anim: 'kick' },
      hk:  { s: 9, a: 4, r: 17, dmg: 90, hs: 20, bs: 13, box: [10, 42, 40, 12], lvl: 'mid', push: 5.0, anim: 'kick', heavy: 1 },
      clp: { s: 3, a: 2, r: 7,  dmg: 26, hs: 12, bs: 8,  box: [12, 22, 25, 9],  lvl: 'low', push: 2.4, anim: 'punch' },
      chp: { s: 6, a: 4, r: 17, dmg: 72, hs: 19, bs: 12, box: [8, 38, 26, 32],  lvl: 'mid', push: 3.6, anim: 'upper', heavy: 1 },
      clk: { s: 4, a: 3, r: 9,  dmg: 32, hs: 13, bs: 8,  box: [10, 2, 34, 9],   lvl: 'low', push: 2.4, anim: 'sweep' },
      chk: { s: 8, a: 4, r: 21, dmg: 78, hs: 20, bs: 13, box: [10, 1, 44, 9],   lvl: 'low', push: 3.0, anim: 'sweep', kd: 1, heavy: 1 },
      jp:  { s: 4, a: 7, r: 0,  dmg: 60, hs: 17, bs: 11, box: [8, 26, 27, 16],  lvl: 'high', push: 3.0, anim: 'jpunch' },
      jk:  { s: 5, a: 9, r: 0,  dmg: 70, hs: 18, bs: 12, box: [6, 6, 33, 16],   lvl: 'high', push: 3.4, anim: 'jkick', heavy: 1 },
      sp:  { s: 12, a: 1, r: 22, dmg: 85, hs: 24, bs: 16, chip: 22, box: [0, 0, 0, 0], lvl: 'mid', push: 3.4, anim: 'toss', heavy: 1, name: 'INK SPLASH',
             proj: { vx: 4.4, w: 18, h: 14, y: 52, x: 24, art: 'ink' } }
    }
  },
  aj: {
    name: 'AJ', title: 'AJ', hp: 980, walk: 2.7, back: 2.3, jumpV: 7.5, jumpX: 3.0, grav: 0.42, scale: 1, bodyW: 22,
    blurb: 'Fast all-rounder. Quick pokes, sneaky range. Special: BEVERAGE BREAK (can-first shoulder rush).',
    taunt: 'HOLD MY CAN.',
    stats: { speed: 4, power: 3, reach: 2 },
    hurt: { st: [-12, 0, 24, 73], cr: [-13, 0, 26, 45], air: [-12, 8, 24, 57] },
    colors: { skin: '#e2a682', top: '#121218', top2: '#e05a1a', pants: '#3a6ac8', hair: '#8a6a40', band: '#e05a1a', glove: '#e2a682', shoe: '#e2a682' },
    render: 'pixel', sprite: null,
    moves: {
      lp:  { s: 3, a: 2, r: 6,  dmg: 30, hs: 13, bs: 9,  box: [12, 54, 24, 9],  lvl: 'mid', push: 2.6, anim: 'punch' },
      hp:  { s: 6, a: 3, r: 14, dmg: 72, hs: 19, bs: 13, box: [12, 52, 32, 10], lvl: 'mid', push: 4.2, anim: 'punch', heavy: 1 },
      lk:  { s: 4, a: 3, r: 8,  dmg: 40, hs: 14, bs: 9,  box: [10, 24, 30, 10], lvl: 'mid', push: 2.8, anim: 'kick' },
      hk:  { s: 8, a: 4, r: 16, dmg: 85, hs: 20, bs: 13, box: [10, 42, 38, 12], lvl: 'mid', push: 4.8, anim: 'kick', heavy: 1 },
      clp: { s: 3, a: 2, r: 6,  dmg: 25, hs: 12, bs: 8,  box: [12, 22, 24, 9],  lvl: 'low', push: 2.4, anim: 'punch' },
      chp: { s: 6, a: 4, r: 16, dmg: 66, hs: 19, bs: 12, box: [8, 38, 26, 30],  lvl: 'mid', push: 3.4, anim: 'upper', heavy: 1 },
      clk: { s: 4, a: 3, r: 8,  dmg: 30, hs: 13, bs: 8,  box: [10, 2, 32, 9],   lvl: 'low', push: 2.4, anim: 'sweep' },
      chk: { s: 7, a: 4, r: 20, dmg: 70, hs: 20, bs: 13, box: [10, 1, 42, 9],   lvl: 'low', push: 3.0, anim: 'sweep', kd: 1, heavy: 1 },
      jp:  { s: 4, a: 7, r: 0,  dmg: 55, hs: 17, bs: 11, box: [8, 26, 26, 16],  lvl: 'high', push: 3.0, anim: 'jpunch' },
      jk:  { s: 5, a: 9, r: 0,  dmg: 65, hs: 18, bs: 12, box: [6, 6, 32, 16],   lvl: 'high', push: 3.4, anim: 'jkick', heavy: 1 },
      sp:  { s: 8, a: 16, r: 16, dmg: 110, hs: 28, bs: 18, chip: 28, box: [6, 30, 34, 38], lvl: 'mid', push: 3.6, anim: 'rush', kd: 1, dash: 6.4, heavy: 1, name: 'BEVERAGE BREAK' }
    }
  },
  bino: {
    name: 'BINO', title: 'BINO', hp: 1150, walk: 1.6, back: 1.4, jumpV: 6.7, jumpX: 2.2, grav: 0.4, scale: 1, bodyW: 32,
    blurb: 'Slow heavy bruiser. Huge reach, huge damage. Special: CHAIN WHIP (long-range steel chain swing).',
    taunt: "BEARD'S UNDEFEATED, EH.",
    stats: { speed: 1, power: 5, reach: 5 },
    hurt: { st: [-17, 0, 34, 86], cr: [-18, 0, 36, 54], air: [-16, 8, 32, 66] },
    colors: { skin: '#cc8a5c', top: '#b81a12', top2: '#6a0808', pants: '#2c3a54', hair: '#e8661e', band: '#c8d4e4', glove: '#cc8a5c', shoe: '#3e2a1a', beard: 1 },
    render: 'pixel', sprite: null,
    moves: {
      lp:  { s: 4, a: 3, r: 8,  dmg: 42,  hs: 14, bs: 9,  box: [14, 64, 32, 10], lvl: 'mid', push: 3.0, anim: 'punch' },
      hp:  { s: 9, a: 4, r: 20, dmg: 115, hs: 21, bs: 15, box: [14, 60, 46, 14], lvl: 'mid', push: 6.0, anim: 'punch', heavy: 1 },
      lk:  { s: 6, a: 3, r: 11, dmg: 52,  hs: 15, bs: 10, box: [12, 28, 38, 11], lvl: 'mid', push: 3.2, anim: 'kick' },
      hk:  { s: 12, a: 5, r: 22, dmg: 135, hs: 22, bs: 16, box: [12, 46, 52, 14], lvl: 'mid', push: 6.6, anim: 'kick', heavy: 1 },
      clp: { s: 4, a: 3, r: 8,  dmg: 36,  hs: 13, bs: 9,  box: [14, 26, 30, 9],  lvl: 'low', push: 2.8, anim: 'punch' },
      chp: { s: 9, a: 5, r: 20, dmg: 105, hs: 21, bs: 14, box: [10, 48, 32, 30], lvl: 'mid', push: 4.0, anim: 'upper', heavy: 1 },
      clk: { s: 6, a: 3, r: 11, dmg: 42,  hs: 14, bs: 9,  box: [12, 2, 40, 9],   lvl: 'low', push: 2.6, anim: 'sweep' },
      chk: { s: 11, a: 5, r: 26, dmg: 105, hs: 22, bs: 15, box: [12, 1, 58, 9],  lvl: 'low', push: 3.2, anim: 'sweep', kd: 1, heavy: 1 },
      jp:  { s: 6, a: 7, r: 0,  dmg: 82,  hs: 18, bs: 12, box: [8, 30, 30, 18],  lvl: 'high', push: 3.4, anim: 'jpunch', heavy: 1 },
      jk:  { s: 7, a: 8, r: 0,  dmg: 92,  hs: 19, bs: 13, box: [6, 8, 36, 18],   lvl: 'high', push: 3.6, anim: 'jkick', heavy: 1 },
      sp:  { s: 13, a: 5, r: 24, dmg: 120, hs: 26, bs: 16, chip: 26, box: [18, 50, 72, 14], lvl: 'mid', push: 5.0, anim: 'whip', kd: 1, heavy: 1, name: 'CHAIN WHIP' }
    }
  },
  sara: {
    name: 'SARA', title: 'SARA', hp: 900, walk: 3.1, back: 2.6, jumpV: 8.0, jumpX: 3.4, grav: 0.45, scale: 1, bodyW: 20,
    blurb: 'Fastest fighter. Dash (tap forward twice), quick chains. Specials: WIRE TOSS, and DROP IN (SP + down) teleport kick.',
    taunt: 'TOO SLOW!',
    stats: { speed: 5, power: 2, reach: 3 },
    hurt: { st: [-11, 0, 22, 70], cr: [-12, 0, 24, 44], air: [-11, 8, 22, 56] },
    colors: { skin: '#f0c0a4', top: '#46464e', top2: '#2e2e34', pants: '#22304e', hair: '#140c0a', band: '#d8e0e8', glove: '#f0c0a4', shoe: '#1e1e22' },
    render: 'pixel', sprite: null,
    chain: 1, dashV: 6.0,
    moves: {
      lp:  { s: 2, a: 2, r: 5,  dmg: 24, hs: 13, bs: 8,  box: [12, 52, 24, 9],  lvl: 'mid', push: 2.0, anim: 'punch' },
      hp:  { s: 5, a: 3, r: 13, dmg: 58, hs: 18, bs: 12, box: [12, 50, 30, 10], lvl: 'mid', push: 3.8, anim: 'punch', heavy: 1 },
      lk:  { s: 3, a: 3, r: 7,  dmg: 32, hs: 14, bs: 9,  box: [10, 24, 32, 10], lvl: 'mid', push: 2.2, anim: 'kick' },
      hk:  { s: 7, a: 4, r: 15, dmg: 72, hs: 19, bs: 13, box: [10, 44, 40, 12], lvl: 'mid', push: 4.4, anim: 'kick', heavy: 1 },
      clp: { s: 2, a: 2, r: 5,  dmg: 20, hs: 12, bs: 8,  box: [12, 22, 24, 9],  lvl: 'low', push: 2.0, anim: 'punch' },
      chp: { s: 5, a: 4, r: 15, dmg: 58, hs: 19, bs: 12, box: [8, 38, 26, 30],  lvl: 'mid', push: 3.2, anim: 'upper', heavy: 1 },
      clk: { s: 3, a: 3, r: 7,  dmg: 26, hs: 13, bs: 8,  box: [10, 2, 34, 9],   lvl: 'low', push: 2.2, anim: 'sweep' },
      chk: { s: 6, a: 4, r: 19, dmg: 62, hs: 20, bs: 13, box: [10, 1, 44, 9],   lvl: 'low', push: 3.0, anim: 'sweep', kd: 1, heavy: 1 },
      jp:  { s: 3, a: 7, r: 0,  dmg: 48, hs: 17, bs: 11, box: [8, 26, 26, 16],  lvl: 'high', push: 3.0, anim: 'jpunch' },
      jk:  { s: 4, a: 9, r: 0,  dmg: 58, hs: 18, bs: 12, box: [6, 6, 34, 16],   lvl: 'high', push: 3.4, anim: 'jkick', heavy: 1 },
      sp:  { s: 10, a: 1, r: 18, dmg: 70, hs: 22, bs: 15, chip: 18, box: [0, 0, 0, 0], lvl: 'mid', push: 3.0, anim: 'toss', name: 'WIRE TOSS',
             proj: { vx: 5.2, w: 18, h: 12, y: 50, x: 22, art: 'wire' } },
      sp2: { s: 14, a: 12, r: 14, dmg: 92, hs: 24, bs: 16, chip: 18, box: [-6, -4, 34, 26], lvl: 'high', push: 3.4, anim: 'drop', kd: 1, heavy: 1, tele: 1, name: 'DROP IN' },
      dsh: { s: 1, a: 10, r: 6, dmg: 0, hs: 0, bs: 0, box: [0, 0, 0, 0], lvl: 'mid', push: 0, anim: 'dash', dash: 6.0, nohit: 1 }
    }
  }
};
const CHAR_IDS = Object.keys(CHARS);

/* ---------------------------------------------------------------------
   INPUT SOURCES (keyboard/touch, CPU, remote player all look the same)
   held = buttons down now; latch = presses that happened since last read,
   so a very quick tap between two ticks is never lost.
   --------------------------------------------------------------------- */
const KEYS = ['l', 'r', 'u', 'd', 'lp', 'hp', 'lk', 'hk', 'bl', 'sp'];
function InputSrc() { this.held = {}; this.latch = {}; this.prev = {}; }
InputSrc.prototype.down = function (k) { if (!this.held[k]) this.latch[k] = true; this.held[k] = true; };
InputSrc.prototype.up = function (k) { this.held[k] = false; };
InputSrc.prototype.read = function () {
  const o = { p: {} };
  for (const k of KEYS) { o[k] = !!this.held[k]; o.p[k] = !!(this.latch[k] || (this.held[k] && !this.prev[k])); }
  this.prev = Object.assign({}, this.held); this.latch = {};
  return o;
};
InputSrc.prototype.clear = function () { this.held = {}; this.latch = {}; this.prev = {}; };
const NEUTRAL = (() => { const o = { p: {} }; for (const k of KEYS) { o[k] = false; o.p[k] = false; } return o; })();

const localIn = new InputSrc();   // this device (touch + keyboard)
const cpuIn = new InputSrc();     // CPU brain writes here
const remoteIn = new InputSrc();  // online guest's inputs (host side)

/* ---------------------------------------------------------------------
   GAME STATE  (plain object so the host can send it to the guest as-is)
   --------------------------------------------------------------------- */
let G = null;
let me = 0;                // which fighter this device controls
let cpuOn = true;
const hist = [[], []];     // direction history (numpad notation) for motion inputs
let paused = false;

function newFighter(ch, i) {
  const C = CHARS[ch];
  return { ch, i, x: STAGE_W / 2 + (i ? 70 : -70), y: 0, vx: 0, vy: 0, face: i ? -1 : 1, hp: C.hp, max: C.hp, red: C.hp, redDelay: 0,
    st: 'idle', t: 0, mv: null, mf: 0, hitC: false, airAtk: false, cr: false, blk: false, stun: 0, inv: 0, pb: 0, walkT: 0 };
}
function newMatch(mode, c1, c2) {
  G = { mode, chars: [c1, c2], round: 1, wins: [0, 0], timer: 99, tt: 0, phase: 'intro', pt: 0, banner: null, f: [], proj: [], sparks: [],
    shake: 0, hitstop: 0, slow: 0, camX: (STAGE_W - W) / 2, ev: [], evId: 0, tick: 0, result: null, stat: { hits: [0, 0], blocks: [0, 0], specials: [0, 0] } };
  startRound();
}
function startRound() {
  G.f = [newFighter(G.chars[0], 0), newFighter(G.chars[1], 1)];
  G.proj = []; G.sparks = []; G.timer = 99; G.tt = 0; G.phase = 'intro'; G.pt = 0; G.slow = 0; G.hitstop = 0;
  hist[0] = []; hist[1] = []; cpuBrain.reset();
  const final = G.wins[0] === 1 && G.wins[1] === 1;
  G.banner = { txt: final ? 'FINAL ROUND' : 'ROUND ' + G.round, t: 0 };
  sfx('round');
}
function ev(type) { G.evId++; G.ev.push({ id: G.evId, type }); if (G.ev.length > 12) G.ev.shift(); }

/* ---------------------------------------------------------------------
   SIMULATION
   --------------------------------------------------------------------- */
function worldBox(f, b) {
  const x1 = f.face > 0 ? f.x + b[0] : f.x - b[0] - b[2];
  return [x1, f.y + b[1], b[2], b[3]];
}
function hurtBox(f) {
  const C = CHARS[f.ch];
  const air = f.y > 0 || f.st === 'jump' || f.st === 'kd';
  const crouchy = f.cr && !air && (f.st === 'crouch' || f.st === 'block' || f.st === 'hit' || (f.st === 'atk' && f.mv && f.mv[0] === 'c'));
  const b = air ? C.hurt.air : crouchy ? C.hurt.cr : C.hurt.st;
  return [f.x + b[0], f.y + b[1], b[2], b[3]];
}
function overlap(a, b) { return a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1]; }
function grounded(f) { return f.y <= 0 && f.st !== 'jump' && f.st !== 'kd'; }
function canAct(f) { return f.st === 'idle' || f.st === 'walk' || f.st === 'crouch'; }
function moveDef(f) { return f.mv ? CHARS[f.ch].moves[f.mv] : null; }
function qcf(h) { // down, (down-forward), forward within the last 15 ticks
  let stage = 0;
  for (let k = Math.max(0, h.length - 15); k < h.length; k++) {
    const d = h[k];
    if (stage === 0 && (d === 2 || d === 1 || d === 3)) stage = 1;
    else if (stage >= 1 && d === 3) stage = 2;
    else if (stage >= 1 && d === 6) return true;
  }
  return false;
}
function wantsSpecial(f, inp) {
  return inp.p.sp || (inp.p.lp && inp.p.hp) || ((inp.p.lp || inp.p.hp) && qcf(hist[f.i]));
}
function wantsSpecial2(f, inp) {
  return !!CHARS[f.ch].moves.sp2 && ((inp.p.sp && inp.d) || ((inp.p.lk || inp.p.hk) && qcf(hist[f.i])));
}
function dashTap(h) {   // forward, release, forward again within ~14 ticks
  const n = h.length; if (n < 3 || h[n - 1] !== 6 || h[n - 2] === 6) return false;
  let gap = false;
  for (let k = n - 2; k >= Math.max(0, n - 14); k--) { if (h[k] !== 6) gap = true; else if (gap) return true; }
  return false;
}
function specialReady(f) { const M = CHARS[f.ch].moves.sp; return !(M.proj && G.proj.some(p => p.o === f.i)); }
function startMove(f, name) {
  f.st = 'atk'; f.mv = name; f.mf = 0; f.hitC = false; f.t = 0;
  const M = CHARS[f.ch].moves[name];
  if (name !== 'sp' && !M.dash) f.vx = 0;
  if (name === 'sp' || name === 'sp2') { G.stat.specials[f.i]++; ev('special'); }
  else if (M.nohit) ev('jump');
  else ev(M.heavy ? 'swingH' : 'swing');
}

function stepFighter(f, inp, o) {
  const C = CHARS[f.ch];
  if (f.redDelay > 0) f.redDelay--; else if (f.red > f.hp) f.red = Math.max(f.hp, f.red - 7);
  if (f.inv > 0) f.inv--;
  const fwd = f.face > 0 ? inp.r : inp.l, back = f.face > 0 ? inp.l : inp.r;
  const dir = inp.d ? (fwd ? 3 : back ? 1 : 2) : inp.u ? (fwd ? 9 : back ? 7 : 8) : (fwd ? 6 : back ? 4 : 5);
  const h = hist[f.i]; h.push(dir); if (h.length > 24) h.shift();
  f.t++;
  if (f.pb) { f.x += f.pb; f.pb *= 0.78; if (Math.abs(f.pb) < 0.1) f.pb = 0; }
  f.blk = (back || inp.bl) && !fwd;

  if (canAct(f)) {
    if (f.y <= 0) f.face = o.x >= f.x ? 1 : -1;
    const fwd2 = f.face > 0 ? inp.r : inp.l, back2 = f.face > 0 ? inp.l : inp.r;
    f.blk = (back2 || inp.bl) && !fwd2;
    f.cr = inp.d;
    f.chainN = 0;
    if (wantsSpecial2(f, inp)) { startMove(f, 'sp2'); return; }
    if (wantsSpecial(f, inp) && specialReady(f)) { startMove(f, 'sp'); return; }
    const btn = inp.p.hp ? 'hp' : inp.p.hk ? 'hk' : inp.p.lp ? 'lp' : inp.p.lk ? 'lk' : null;
    if (btn) { startMove(f, (inp.d ? 'c' : '') + btn); return; }
    if (C.dashV && !inp.d && !inp.u && dashTap(h)) { startMove(f, 'dsh'); return; }
    if (inp.u) { f.st = 'jump'; f.vy = C.jumpV; f.vx = (fwd2 ? 1 : back2 ? -1 : 0) * C.jumpX * f.face; f.y = 0.01; f.airAtk = false; f.mv = null; f.cr = false; ev('jump'); return; }
    if (inp.d) { f.st = 'crouch'; f.vx = 0; return; }
    if (inp.bl && !fwd2) { f.st = 'idle'; f.vx = 0; return; }
    if (fwd2) { f.st = 'walk'; f.vx = C.walk * f.face; f.walkT++; }
    else if (back2) { f.st = 'walk'; f.vx = -C.back * f.face; f.walkT--; }
    else { f.st = 'idle'; f.vx = 0; }
    f.x += f.vx;
    return;
  }
  switch (f.st) {
    case 'jump': {
      if (!f.airAtk) {
        const b = inp.p.lp || inp.p.hp ? 'jp' : inp.p.lk || inp.p.hk ? 'jk' : null;
        if (b) { f.mv = b; f.mf = 0; f.hitC = false; f.airAtk = true; ev('swing'); }
      } else if (f.mv) { f.mf++; const M = moveDef(f); if (f.mf > M.s + M.a + 6) f.mv = null; }
      f.vy -= C.grav; f.y += f.vy; f.x += f.vx;
      if (f.y <= 0) { f.y = 0; f.vy = 0; f.vx = 0; f.mv = null; f.st = 'land'; f.t = 0; G.sparks.push({ x: f.x, y: 0, t: 0, k: 'd' }); ev('land'); }
      break;
    }
    case 'land': if (f.t >= 4) f.st = 'idle'; break;
    case 'atk': {
      const M = moveDef(f); f.mf++;
      if (M.dash) {
        if (f.mf >= M.s && f.mf < M.s + M.a && !f.hitC) f.vx = M.dash * f.face; else f.vx *= 0.8;
        f.x += f.vx;
      }
      if (M.proj && f.mf === M.s) {
        G.proj.push({ o: f.i, x: f.x + f.face * M.proj.x, y: M.proj.y, vx: M.proj.vx * f.face, w: M.proj.w, h: M.proj.h, t: 0, dead: 0, art: M.proj.art || 'ink' });
        ev('toss');
      }
      if (M.tele) {   // DROP IN: vanish, reappear above the opponent, drop feet-first
        const o2 = G.f[1 - f.i];
        if (f.mf < M.s) f.inv = 2;
        if (f.mf === M.s) { f.x = Math.max(20, Math.min(STAGE_W - 20, o2.x - f.face * 12)); f.y = 84; }
        if (f.mf > M.s && f.mf < M.s + M.a) f.y = Math.max(0, f.y - 7.5);
        if (f.mf >= M.s + M.a) f.y = 0;
      }
      const isSp = f.mv === 'sp' || f.mv === 'sp2';
      if (!isSp && !M.nohit && f.hitC && f.mf >= M.s) {
        if (wantsSpecial2(f, inp)) { startMove(f, 'sp2'); break; }
        if (wantsSpecial(f, inp) && specialReady(f)) { startMove(f, 'sp'); break; }
        if (C.chain && f.mv[0] !== 'j' && (f.chainN || 0) < 3) {   // quick strings: a normal that connected cancels into another
          const b2 = inp.p.hp ? 'hp' : inp.p.hk ? 'hk' : inp.p.lp ? 'lp' : inp.p.lk ? 'lk' : null;
          if (b2) { f.chainN = (f.chainN || 0) + 1; startMove(f, (inp.d ? 'c' : '') + b2); break; }
        }
      }
      if (f.mf >= M.s + M.a + M.r) { f.mv = null; f.vx = 0; f.st = inp.d ? 'crouch' : 'idle'; f.cr = inp.d; }
      break;
    }
    case 'hit': case 'block':
      f.x += f.vx; f.vx *= 0.8;
      if (--f.stun <= 0) { f.st = f.cr ? 'crouch' : 'idle'; f.cr = inp.d; }
      break;
    case 'kd':
      f.vy -= 0.4; f.y += f.vy; f.x += f.vx;
      if (f.y <= 0) { f.y = 0; f.vy = 0; f.vx = 0; f.st = f.hp <= 0 ? 'ko' : 'lie'; f.t = 0; G.sparks.push({ x: f.x, y: 0, t: 0, k: 'D' }); G.shake = Math.max(G.shake, 3); ev('thud'); }
      break;
    case 'lie': if (f.t >= 34) { f.st = 'rise'; f.t = 0; f.inv = 20; } break;
    case 'rise': if (f.t >= 14) { f.st = 'idle'; f.inv = 6; } break;
    case 'ko': f.vx = 0; break;
    case 'win': break;
  }
}

function damage(d, n) { if (d.red < d.hp) d.red = d.hp; d.hp = Math.max(0, d.hp - n); d.redDelay = 32; }
function tryBlock(d, lvl) {
  if (!(d.st === 'idle' || d.st === 'walk' || d.st === 'crouch' || d.st === 'block') || d.y > 0) return false;
  if (!d.blk) return false;
  if (lvl === 'low' && !d.cr) return false;
  if (lvl === 'high' && d.cr) return false;
  return true;
}
function applyHit(a, d, M, at, fromProj) {
  const away = d.x >= a.x ? 1 : -1;
  const sx = at[0], sy = at[1];
  if (tryBlock(d, M.lvl)) {
    d.st = 'block'; d.stun = M.bs; d.vx = away * M.push * 0.8; d.mv = null;
    damage(d, M.chip != null ? M.chip : Math.max(4, Math.round(M.dmg * 0.12)));
    G.sparks.push({ x: sx, y: sy, t: 0, k: 'b' }); G.hitstop = 4; G.stat.blocks[d.i]++; ev('block');
    if (d.hp <= 0) { d.st = 'kd'; d.vy = 4.5; d.vx = away * 2.2; d.y = 1; d.mv = null; }
    d.t = 0;   // animation clock only
  } else {
    damage(d, M.dmg);
    d.mv = null; d.airAtk = true;
    if (d.mv === 'sp2' && d.y > 0) d.y = Math.max(d.y, 1);
    if (d.y > 0 || M.kd || d.hp <= 0) { d.st = 'kd'; d.vy = d.hp <= 0 ? 5.5 : 4.5; d.vx = away * (d.hp <= 0 ? 3.2 : 2.2); d.y = Math.max(d.y, 1); }
    else { d.st = 'hit'; d.stun = M.hs; d.vx = away * M.push; }
    d.t = 0;   // animation clock only
    G.sparks.push({ x: sx, y: sy, t: 0, k: d.hp <= 0 ? 'K' : M.heavy ? 'H' : 'h' });
    G.shake = Math.max(G.shake, M.heavy ? 6 : 3); G.hitstop = M.heavy ? 8 : 5; G.stat.hits[a.i]++;
    ev(M.heavy ? 'hitH' : 'hit');
  }
  if (!fromProj) {
    a.hitC = true;
    // pushback: if the defender is pinned at a wall, the attacker slides back instead
    const pinned = d.x <= 22 || d.x >= STAGE_W - 22 || Math.abs(d.x - a.x) >= MAXSEP - 4;
    a.pb = -away * M.push * (pinned ? 1.1 : 0.35);
  }
}
function checkHits(a, d) {
  if (!a.mv || a.hitC) return;
  const M = moveDef(a);
  if (M.proj || M.nohit) return;
  if (a.mf < M.s || a.mf >= M.s + M.a) return;
  if (d.inv > 0 || d.st === 'lie' || d.st === 'rise' || d.st === 'ko' || (d.st === 'kd' && d.hp <= 0)) return;
  const hb = worldBox(a, M.box), hu = hurtBox(d);
  if (overlap(hb, hu)) {
    const ix = Math.max(hb[0], hu[0]) + 2 * (a.face > 0 ? 1 : 0), iy = (Math.max(hb[1], hu[1]) + Math.min(hb[1] + hb[3], hu[1] + hu[3])) / 2;
    return { a, d, M, at: [a.face > 0 ? Math.max(hb[0], hu[0]) + 3 : Math.min(hb[0] + hb[2], hu[0] + hu[2]) - 3, iy] };
  }
}
function stepProjectiles() {
  for (const p of G.proj) {
    p.t++; p.x += p.vx;
    const d = G.f[1 - p.o], a = G.f[p.o];
    const box = [p.x - p.w / 2, p.y - p.h / 2, p.w, p.h];
    if (!(d.inv > 0 || d.st === 'lie' || d.st === 'rise' || d.st === 'ko') && overlap(box, hurtBox(d))) {
      const M = Object.assign({}, CHARS[a.ch].moves.sp); M.kd = 0;
      applyHit(a, d, M, [p.x, p.y], true); p.dead = 1;
    }
    if (p.x < -30 || p.x > STAGE_W + 30) p.dead = 1;
  }
  for (const p of G.proj) for (const q of G.proj) if (p !== q && p.o !== q.o && Math.abs(p.x - q.x) < 16) { p.dead = q.dead = 1; G.sparks.push({ x: p.x, y: p.y, t: 0, k: 'b' }); }
  G.proj = G.proj.filter(p => !p.dead);
}
function resolveBodies() {
  const [a, b] = G.f;
  for (const f of G.f) f.x = Math.max(20, Math.min(STAGE_W - 20, f.x));
  // push apart when both are low enough to touch
  if (a.y < 34 && b.y < 34 && a.st !== 'lie' && b.st !== 'lie' && a.st !== 'ko' && b.st !== 'ko') {
    const minD = (CHARS[a.ch].bodyW + CHARS[b.ch].bodyW) / 2;
    const dx = b.x - a.x, ad = Math.abs(dx);
    if (ad < minD) {
      const s = dx === 0 ? (a.face > 0 ? 1 : -1) : Math.sign(dx), push = (minD - ad) / 2;
      a.x -= s * push; b.x += s * push;
      for (const f of G.f) if (f.x < 20 || f.x > STAGE_W - 20) { const o = f === a ? b : a; const over = f.x < 20 ? 20 - f.x : STAGE_W - 20 - f.x; f.x += over; o.x += over; }
    }
  }
  // the camera can only show MAXSEP of distance
  const sep = b.x - a.x;
  if (Math.abs(sep) > MAXSEP) { const fix = (Math.abs(sep) - MAXSEP) / 2 * Math.sign(sep); a.x += fix; b.x -= fix; }
  const mid = (a.x + b.x) / 2;
  G.camX = Math.max(0, Math.min(STAGE_W - W, mid - W / 2));
}

function simFight(inA, inB) {
  if (G.hitstop > 0) { G.hitstop--; return; }
  const [a, b] = G.f;
  stepFighter(a, inA, b); stepFighter(b, inB, a);
  resolveBodies();
  const h1 = checkHits(a, b), h2 = checkHits(b, a);   // simultaneous trades allowed
  if (h1) applyHit(h1.a, h1.d, h1.M, h1.at); if (h2) applyHit(h2.a, h2.d, h2.M, h2.at);
  stepProjectiles();
}

function endRound(kind) {
  const [a, b] = G.f;
  let w = -1;
  if (a.hp > b.hp) w = 0; else if (b.hp > a.hp) w = 1;
  G.roundWinner = w;
  if (w >= 0) G.wins[w]++; else { G.wins[0]++; G.wins[1]++; }
  G.phase = 'roundEnd'; G.pt = 0;
  G.banner = { txt: kind === 'ko' ? (a.hp <= 0 && b.hp <= 0 ? 'DOUBLE K.O.' : 'K.O.') : 'TIME', t: 0 };
  if (kind === 'ko') { G.slow = 50; ev('ko'); } else ev('time');
}

function step() {
  G.tick++;
  for (const s of G.sparks) s.t++;
  G.sparks = G.sparks.filter(s => s.t < (s.k === 'K' ? 28 : s.k === 'D' ? 22 : 16));
  if (G.shake > 0) G.shake *= 0.85; if (G.shake < 0.3) G.shake = 0;
  if (G.banner) G.banner.t++;
  if (G.phase === 'intro') {
    G.pt++;
    if (G.pt === 70) { G.banner = { txt: 'FIGHT!', t: 0 }; sfx('fight'); }
    simFight(NEUTRAL, NEUTRAL);
    if (G.pt >= 110) { G.phase = 'fight'; G.banner = null; localIn.latch = {}; }
    return;
  }
  if (G.phase === 'fight') {
    const inA = readInput(0), inB = readInput(1);
    simFight(inA, inB);
    if (G.hitstop === 0 && ++G.tt >= 60) { G.tt = 0; G.timer--; }
    if (G.f[0].hp <= 0 || G.f[1].hp <= 0) endRound('ko');
    else if (G.timer <= 0) { G.timer = 0; endRound('time'); }
    return;
  }
  if (G.phase === 'roundEnd') {
    G.pt++;
    if (G.slow > 0) { G.slow--; if (G.tick % 3) return; }
    simFight(NEUTRAL, NEUTRAL);
    const w = G.roundWinner;
    if (G.pt === 110) {
      if (w >= 0 && G.f[w].st !== 'kd' && G.f[w].st !== 'ko') { G.f[w].st = 'win'; G.f[w].t = 0; G.f[w].mv = null; }
      G.banner = { txt: w < 0 ? 'DRAW' : CHARS[G.f[w].ch].name + ' WINS', t: 0 };
    }
    if (G.pt >= 210) {
      if (G.wins[0] >= 2 || G.wins[1] >= 2) {
        G.phase = 'matchEnd'; G.pt = 0;
        G.result = G.wins[0] >= 2 && G.wins[1] >= 2 ? -1 : G.wins[0] >= 2 ? 0 : 1;
        ev('matchEnd');
      } else { G.round++; startRound(); }
    }
    return;
  }
  if (G.phase === 'matchEnd') {
    G.pt++;
    for (const f of G.f) if (f.st === 'win') f.t++;
  }
}
function readInput(i) {
  if (i === me) return localIn.read();
  if (G.mode === 'solo') { cpuBrain.think(G.f[i], G.f[1 - i]); return cpuIn.read(); }
  if (G.mode === 'host') return remoteIn.read();
  return NEUTRAL;
}

/* ---------------------------------------------------------------------
   CPU OPPONENT - approaches, pokes, sometimes blocks, jumps in, specials
   --------------------------------------------------------------------- */
const cpuBrain = {
  hold: {}, next: 0, blockUntil: 0, blockLow: false, sawMove: null, aggr: 0.55, blockP: 0.55,
  reset() { this.dashAt = null; this.chainAt = 0; this.hold = {}; this.next = 20; this.blockUntil = 0; this.sawMove = null; cpuIn.clear(); },
  press(k) { cpuIn.latch[k] = true; },
  think(c, o) {
    if (!cpuOn) return;
    const t = G.tick, dist = Math.abs(o.x - c.x), towards = o.x > c.x ? 'r' : 'l', away = towards === 'r' ? 'l' : 'r';
    const C = CHARS[c.ch], range = C.moves.hk.box[0] + C.moves.hk.box[2] + 8;
    const held = {};
    // react to an attack in progress: decide once per enemy move whether to block it
    const om = moveDef(o), incoming = G.proj.find(p => p.o === o.i && Math.abs(p.x - c.x) < 120 && Math.sign(c.x - p.x) === Math.sign(p.vx));
    const threat = (om && dist < 110) || incoming || (o.y > 0 && dist < 90);
    const moveKey = om ? o.i + ':' + o.mv + ':' + (t - o.mf) : incoming ? 'p' + incoming.t : null;
    if (threat && moveKey !== this.sawMove) {
      this.sawMove = moveKey;
      if (Math.random() < this.blockP) { this.blockUntil = t + 22; this.blockLow = om && om.lvl === 'low'; }
      else if (incoming && Math.random() < 0.35 && canAct(c)) { held.u = true; held[towards] = true; this.hold = {}; this.next = t + 30; }
    }
    if (t < this.blockUntil) { held[away] = true; if (this.blockLow) held.d = true; cpuIn.held = held; return; }
    if (t >= this.next && canAct(c)) {
      this.hold = {};
      const r = Math.random();
      if (dist > range + 20) {
        if (C.moves.sp.proj && dist > 150 && r < 0.18 && specialReady(c)) this.press('sp');
        else if (C.moves.sp2 && dist > 90 && r < 0.26) { this.press('sp'); this.hold.d = true; this.next = t + 40; }
        else if (C.dashV && r < 0.36) { this.dashAt = t; this.hold[towards] = true; }
        else if (r < 0.09) { this.hold.u = true; this.hold[towards] = true; }
        else this.hold[towards] = true;
        this.next = t + 12 + (Math.random() * 18 | 0);
      } else {
        if (r < this.aggr) {
          const opts = ['lp', 'lp', 'lk', 'hp', 'hk', 'clk', 'chk', 'clp', 'chp'];
          let pick = opts[Math.random() * opts.length | 0];
          if (o.y > 30 && Math.random() < 0.6) pick = 'chp';
          if (pick[0] === 'c') { this.hold.d = true; pick = pick.slice(1); }
          this.press(pick);
          if (!C.moves.sp.proj && Math.random() < 0.12 && specialReady(c)) this.press('sp');
          if (C.chain && Math.random() < 0.5) this.chainAt = t + 5;
          this.next = t + 16 + (Math.random() * 20 | 0);
        } else if (r < this.aggr + 0.15) { this.hold[away] = true; this.next = t + 14; }
        else if (r < this.aggr + 0.22) { this.hold.u = true; this.hold[towards] = true; this.next = t + 40; }
        else { this.next = t + 10 + (Math.random() * 14 | 0); }
      }
    }
    if (this.dashAt != null) {   // double-tap forward: hold, release, hold
      const k = t - this.dashAt; if (k === 3 || k === 4) delete this.hold[towards]; if (k === 5) this.hold[towards] = true; if (k > 6) this.dashAt = null;
    }
    if (this.chainAt && t >= this.chainAt) { this.chainAt = 0; if (c.st === 'atk' && c.hitC) this.press(Math.random() < 0.5 ? 'lk' : 'hp'); }
    if (this.hold.u && c.st === 'jump') { delete this.hold.u; if (!c.airAtk && c.vy < 1 && dist < 70) this.press(Math.random() < 0.5 ? 'hk' : 'hp'); }
    if (c.st === 'jump' && !c.airAtk && c.vy < 0 && dist < 60) this.press('hk');
    Object.assign(held, this.hold);
    cpuIn.held = held;
  }
};
</script>
