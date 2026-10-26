<script>
'use strict';
/* =====================================================================
   STAGE, FX, HUD
   Bay Street, Port Arthur, 2 AM. Every layer is pre-rendered once into
   offscreen canvases; per frame we only blit + animate a few live bits
   (neon flicker, crowd frames, lamp glow, snow, reflections).
   QUAL.lv: 2 = full, 1 = no fighter reflections / fewer flakes,
            0 = static crowd, no glow, minimal snow.  Auto-drops when the
   frame rate sags; lock it with ?q=0|1|2.
   ===================================================================== */
const QUAL = { lv: 2, lock: QS.has('q'), n: 0, ms: 0, drops: 0 };
if (QUAL.lock) QUAL.lv = Math.max(0, Math.min(2, parseInt(QS.get('q'), 10) || 0));
function qualTick(dt) {
  if (QUAL.lock || !G || paused || document.hidden) { QUAL.n = 0; QUAL.ms = 0; return; }
  QUAL.n++; QUAL.ms += dt;
  if (QUAL.n >= 120) { const fps = 1000 * QUAL.n / QUAL.ms; if (fps < 50 && QUAL.lv > 0) { QUAL.lv--; QUAL.drops++; } QUAL.n = 0; QUAL.ms = 0; }
}
const CRT = { on: QS.has('crt') || localStorage.getItem('tbb-crt') === '1' };

/* ---------- pixel helpers for the stage ---------- */
function gradRows(g, x, y, w, h, cols) {   // dithered vertical gradient through a list of colours
  const im = g.getImageData(x, y, w, h), d = im.data, C = cols.map(rgb), n = C.length - 1;
  for (let yy = 0; yy < h; yy++) {
    const f = yy / Math.max(1, h - 1) * n, i0 = Math.min(n - 1, Math.floor(f)), fr = f - i0;
    for (let xx = 0; xx < w; xx++) { const c = C[fr > dith(xx, yy) ? i0 + 1 : i0], o = (yy * w + xx) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; }
  }
  g.putImageData(im, x, y);
}
function R(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); }
function disc(g, c, x, y, r) { g.fillStyle = c; for (let yy = -r; yy <= r; yy++) { const hw = Math.floor(Math.sqrt(r * r - yy * yy)); g.fillRect(x - hw, y + yy, hw * 2 + 1, 1); } }

const BG = {}, NEON = [], LAMPS = [120, 400, 680];
function buildStage() {
  seed = 4242;
  /* sky: deep night, sodium-orange city glow on the horizon, stars, moon, faint aurora */
  let c = mk(W, 140, true), g = c.g;
  gradRows(g, 0, 0, W, 140, ['#03030c', '#070820', '#0e0f33', '#1c1645', '#34205a', '#5a2c5e', '#86405a']);
  for (let i = 0; i < 120; i++) { const x = rnd() * W | 0, y = rnd() * 100 | 0, b = rnd(); R(g, b < 0.15 ? '#fff6c8' : b < 0.5 ? '#9aa6e8' : '#4a5090', x, y, 1, 1); if (b < 0.04) { R(g, '#6a74c0', x - 1, y, 3, 1); R(g, '#6a74c0', x, y - 1, 1, 3); R(g, '#ffffff', x, y, 1, 1); } }
  for (let x = 0; x < W; x++) { const y = 30 + Math.sin(x * 0.018) * 9 + Math.sin(x * 0.051) * 4; for (let k = 0; k < 14; k++) if (dith(x, k) < 0.16 * (1 - k / 14)) R(g, k < 5 ? '#3a9a7a' : '#2a6a6a', x, y + k, 1, 1); }
  disc(g, '#6a6a7a', 392, 40, 15); disc(g, '#fff3c4', 392, 40, 14); disc(g, '#e8d9a0', 396, 42, 12); disc(g, '#fff9dc', 389, 37, 9);
  disc(g, '#d8c68a', 387, 35, 2); disc(g, '#d8c68a', 398, 46, 3); disc(g, '#e0cf96', 394, 32, 1); disc(g, '#d8c68a', 384, 45, 1);
  for (const [x0, y0, w0] of [[20, 74, 120], [150, 66, 90], [300, 80, 140], [420, 70, 70]]) for (let i = 0; i < w0; i++) { const h = 3 + Math.sin(i * 0.2 + x0) * 2; R(g, '#1a1640', x0 + i, y0 - h, 1, h + 2); if (dith(i, 0) < 0.4) R(g, '#3a2a5a', x0 + i, y0 - h, 1, 1); }
  BG.sky = c;

  /* far: Lake Superior + the Sleeping Giant across the water */
  c = mk(640, 140); g = c.g;
  const HZ = 104;
  const giant = [[0, 103], [40, 102], [70, 98], [100, 93], [130, 84], [160, 74], [185, 71], [205, 76], [235, 85], [262, 83], [290, 70], [320, 62], [360, 60], [400, 62], [425, 70], [440, 78], [452, 74], [462, 64], [474, 60], [486, 62], [494, 56], [500, 62], [512, 76], [530, 92], [560, 101], [640, 103]];
  g.fillStyle = '#1b1f44'; g.beginPath(); g.moveTo(0, HZ); for (const p of giant) g.lineTo(p[0], p[1]); g.lineTo(640, HZ); g.closePath(); g.fill();
  g.fillStyle = '#2a2c5a'; for (let i = 1; i < giant.length; i++) { const [x0, y0] = giant[i - 1], [x1, y1] = giant[i]; for (let x = x0; x < x1; x++) { const y = y0 + (y1 - y0) * (x - x0) / (x1 - x0); if (y1 < y0 || dith(x, 0) < 0.5) g.fillRect(x, Math.round(y), 1, 1); } }
  for (let i = 0; i < 40; i++) { const x = 60 + rnd() * 480 | 0; R(g, '#151938', x, 96 + rnd() * 6 | 0, 2 + rnd() * 5 | 0, 1); }
  gradRows(g, 0, HZ, 640, 36, ['#141a3e', '#0e1430', '#0a0e24']);
  for (let i = 0; i < 70; i++) { const x = rnd() * 640 | 0, y = HZ + 2 + rnd() * 30 | 0; R(g, rnd() < 0.5 ? '#2a3466' : '#1e2850', x, y, 3 + rnd() * 10 | 0, 1); }
  for (let y = HZ + 1; y < 140; y += 2) { const w = 6 + (y - HZ) * 0.5; R(g, y % 4 ? '#e8d9a0' : '#a89a70', 520 - w / 2 + Math.sin(y) * 3, y, w * (0.4 + rnd() * 0.6), 1); }
  BG.far = c;

  /* mid: Port Arthur skyline, harbour cranes, the grain elevators */
  c = mk(760, 150, true); g = c.g;
  const sky = [[0, 34, 30], [30, 40, 46], [96, 34, 22], [150, 66, 38], [250, 40, 18], [300, 32, 28], [520, 70, 34], [620, 52, 24], [690, 70, 30]];
  for (const [x, w, hh] of sky) { R(g, '#0c1028', x, 140 - hh, w, hh + 10); R(g, '#151a3a', x, 140 - hh, w, 1); for (let yy = 140 - hh + 3; yy < 138; yy += 4) for (let xx = x + 2; xx < x + w - 2; xx += 4) if (rnd() < 0.35) R(g, rnd() < 0.75 ? '#e8b85a' : '#8fd7ff', xx, yy, 2, 2); }
  // grain elevator: a long row of silos + headhouse + gallery
  const EX = 336;
  for (let i = 0; i < 12; i++) { const x = EX + i * 12; R(g, '#141a36', x, 80, 11, 70); R(g, '#26305a', x + 1, 80, 2, 70); R(g, '#3a4a7a', x + 1, 80, 1, 70); R(g, '#0c1024', x + 9, 80, 2, 70); R(g, '#1e2648', x + 1, 78, 9, 2); }
  R(g, '#10152e', EX - 10, 52, 40, 30); R(g, '#1a2140', EX - 10, 52, 40, 2); R(g, '#10152e', EX + 2, 40, 16, 14); R(g, '#1a2140', EX + 2, 40, 16, 1);
  R(g, '#10152e', EX + 30, 76, 120, 4); for (let x = EX - 6; x < EX + 26; x += 6) R(g, '#e8b85a', x, 60, 2, 3);
  drawTxt(g, 'POOL 6', EX + 40, 100, 1, '#3a4a7a'); R(g, '#ff3a3a', EX + 9, 38, 2, 2);
  // harbour cranes
  for (const x of [590, 650]) { R(g, '#10152e', x, 70, 3, 80); R(g, '#10152e', x - 30, 70, 56, 3); R(g, '#10152e', x + 22, 70, 2, 18); for (let k = 0; k < 8; k++) R(g, '#151b3a', x - 28 + k * 7, 72, 1, 4); R(g, '#ff3a3a', x + 1, 68, 2, 2); }
  BG.mid = c;

  /* near: Bay Street storefronts, sidewalk, wet road */
  c = mk(STAGE_W, H, true); g = c.g;
  const SH = [
    { x: 0, w: 112, top: 100, brick: ['#3a1e20', '#4a2826', '#5a3430'], sign: 'LIVE BAIT', col: '#57e0ff', win: '#3aa0c8' },
    { x: 112, w: 140, top: 82, brick: ['#2a2436', '#34304a', '#403a58'], sign: 'THE HOITO', col: '#ff3a3a', win: '#ffb36b', awn: ['#a01818', '#e8e0d0'] },
    { x: 252, w: 30, top: 104, alley: 1 },
    { x: 282, w: 148, top: 90, brick: ['#30202a', '#3c2832', '#4a323e'], sign: 'TATTOO', col: '#c46aff', win: '#9a5aff' },
    { x: 430, w: 130, top: 104, brick: ['#3a2a1a', '#4a3622', '#5a4430'], sign: 'PERSIANS 24HR', col: '#ff8ac0', win: '#ffc8a0', awn: ['#c0306a', '#f0d8e0'] },
    { x: 560, w: 120, top: 78, brick: ['#1e2430', '#28303e', '#343c4c'], sign: 'PAWN', col: '#ffd23a', win: '#d8c070' },
    { x: 680, w: 120, top: 96, brick: ['#2a1a2a', '#382236', '#462c44'], sign: 'ARCADE', col: '#7aff8a', win: '#5ad0ff', awn: ['#1a6a3a', '#d0f0d8'] }
  ];
  for (const s of SH) {
    if (s.alley) {   // dark alley: back wall, fire escape, dumpster, steam
      R(g, '#0a0810', s.x, s.top, s.w, 214 - s.top); for (let y = s.top + 10; y < 200; y += 22) { R(g, '#1a1620', s.x + 3, y, s.w - 6, 2); for (let x = s.x + 4; x < s.x + s.w - 4; x += 4) R(g, '#1a1620', x, y - 8, 1, 8); }
      R(g, '#1e3a2a', s.x + 4, 196, 22, 18); R(g, '#2a5038', s.x + 4, 196, 22, 2); R(g, '#0a1a10', s.x + 6, 200, 18, 1);
      continue;
    }
    // brick facade (dithered courses)
    for (let y = s.top; y < 214; y++) for (let x = s.x; x < s.x + s.w; x++) {
      const row = (y - s.top) >> 2, mortar = ((y - s.top) & 3) === 3 || ((x + (row & 1 ? 4 : 0)) & 7) === 7;
      g.fillStyle = mortar ? s.brick[0] : (dith(x, y) < 0.18 ? s.brick[2] : s.brick[1]); g.fillRect(x, y, 1, 1);
    }
    // cornice + rooftop details
    R(g, s.brick[2], s.x, s.top - 4, s.w, 4); R(g, '#0b0712', s.x, s.top - 5, s.w, 1); R(g, s.brick[0], s.x, s.top, s.w, 2);
    for (let x = s.x + 4; x < s.x + s.w - 4; x += 8) R(g, s.brick[0], x, s.top - 2, 4, 2);
    if (s.w > 120) { R(g, '#101018', s.x + s.w - 30, s.top - 14, 10, 10); R(g, '#1a1a26', s.x + s.w - 31, s.top - 15, 12, 2); }
    // upper-floor windows, some lit
    for (let fy = s.top + 8; fy < 128; fy += 22) for (let x = s.x + 10; x < s.x + s.w - 18; x += 26) {
      R(g, '#0b0712', x - 1, fy - 1, 16, 18); const lit = rnd() < 0.4;
      if (lit) gradRows(g, x, fy, 14, 16, ['#ffe9a8', '#f5b85a', '#b0602a']); else gradRows(g, x, fy, 14, 16, ['#2a3a6a', '#151c3a', '#0c1024']);
      R(g, '#0b0712', x + 6, fy, 2, 16); R(g, '#0b0712', x, fy + 7, 14, 1); R(g, s.brick[2], x - 2, fy + 16, 18, 2);
      if (!lit && rnd() < 0.5) R(g, '#4a5a8a', x + 1, fy + 1, 2, 3);
    }
    // sign board (neon mounts on it, drawn live)
    R(g, '#0b0712', s.x + 6, 132, s.w - 12, 16); R(g, '#16101c', s.x + 7, 133, s.w - 14, 14);
    NEON.push({ x: s.x + s.w / 2, y: 136, txt: s.sign, col: s.col, ph: NEON.length * 53 });
    // shop window with warm interior + door
    const wx0 = s.x + 6, ww = s.w - 46;
    R(g, '#0b0712', wx0 - 2, 152, ww + 4, 50);
    gradRows(g, wx0, 154, ww, 44, ['#1a1420', s.win, '#2a1a24', '#120c14']);
    for (let i = 0; i < 6; i++) { const x = wx0 + 4 + rnd() * (ww - 12) | 0; R(g, '#0b0712', x, 176 + rnd() * 8 | 0, 4 + rnd() * 6 | 0, 22); }
    R(g, '#0b0712', wx0 + (ww >> 1), 154, 2, 44); R(g, 'rgba(255,255,255,0.18)', wx0 + 3, 156, 2, 20); R(g, 'rgba(255,255,255,0.12)', wx0 + 6, 156, 1, 12);
    R(g, '#0b0712', s.x + s.w - 34, 158, 28, 56); R(g, '#1c1622', s.x + s.w - 32, 160, 24, 54); gradRows(g, s.x + s.w - 29, 163, 18, 20, ['#2a2030', s.win, '#2a2030']);
    R(g, '#d8b46a', s.x + s.w - 12, 188, 2, 3);
    R(g, s.brick[0], s.x, 202, s.w, 12); R(g, s.brick[2], s.x, 202, s.w, 1);
    if (s.awn) for (let x = s.x + 2; x < s.x + s.w - 2; x++) { const st = ((x - s.x) >> 3) & 1; R(g, s.awn[st], x, 148, 1, 5); R(g, s.awn[0], x, 153, 1, (x & 7) < 4 ? 2 : 1); }
  }
  // lamp posts (lantern heads; the glow is live)
  for (const x of LAMPS) { R(g, '#0b0a10', x, 116, 3, 100); R(g, '#1a1822', x, 116, 1, 100); R(g, '#0b0a10', x - 3, 212, 9, 4); R(g, '#0b0a10', x - 12, 114, 15, 3); R(g, '#0b0a10', x - 14, 117, 9, 7); R(g, '#ffe9a8', x - 13, 118, 7, 5); R(g, '#fff9dc', x - 11, 119, 3, 2); }
  // sidewalk + curb + snowbanks
  gradRows(g, 0, 214, STAGE_W, 12, ['#5a5864', '#4a4854', '#3a3844']);
  for (let x = 0; x < STAGE_W; x += 32) R(g, '#2e2c36', x, 214, 1, 12);
  for (let i = 0; i < 260; i++) R(g, '#c8d4e4', rnd() * STAGE_W | 0, 214 + rnd() * 11 | 0, 1, 1);
  R(g, '#8a8696', 0, 225, STAGE_W, 1); R(g, '#6a6676', 0, 226, STAGE_W, 1);
  for (let x = 0; x < STAGE_W; x += 2) { const hh = 3 + Math.sin(x * 0.05) * 2 + Math.sin(x * 0.17) * 1.5 + rnd() | 0; if (Math.sin(x * 0.013) > -0.35 && LAMPS.every(l => Math.abs(x - l) > 6)) { R(g, '#e4ecf8', x, 226 - hh, 2, hh); R(g, '#b0bed2', x, 225, 2, 1); if (dith(x, hh) < 0.3) R(g, '#ffffff', x, 226 - hh, 2, 1); } }
  // wet road: reflection of the street (rippled, fading), asphalt dither, lane paint, puddles
  const facade = mk(STAGE_W, 90); facade.g.drawImage(c, 0, 124, STAGE_W, 90, 0, 0, STAGE_W, 90);
  gradRows(g, 0, 227, STAGE_W, H - 227, ['#1e1c26', '#16141e', '#100e16']);
  for (let r = 0; r < H - 227; r++) {
    const sy = 89 - Math.floor(r * 1.9); if (sy < 0) break;
    g.globalAlpha = 0.34 * (1 - r / (H - 227)); g.drawImage(facade, 0, sy, STAGE_W, 1, Math.round(Math.sin(r * 1.7) * 1.5), 227 + r, STAGE_W, 1);
  }
  g.globalAlpha = 1;
  for (let i = 0; i < 700; i++) R(g, rnd() < 0.5 ? '#2a2834' : '#0c0a12', rnd() * STAGE_W | 0, 228 + rnd() * 42 | 0, 1, 1);
  for (let x = 6; x < STAGE_W; x += 44) { R(g, '#8a7a3a', x, 258, 22, 2); R(g, '#c8b04a', x + 2, 258, 18, 1); }
  for (const [x, y, w] of [[60, 248, 40], [300, 262, 60], [520, 244, 30], [700, 256, 50]]) for (let k = 0; k < 4; k++) R(g, 'rgba(140,170,255,0.08)', x + k * 3, y + k, w - k * 6, 1);
  BG.near = c;

  /* neon signs: an 'on' (tube + glow) and 'off' (dead tube) sprite each */
  for (const n of NEON) {
    const tw = txtW(n.txt, 1), w = tw + 16, h = 20;
    const on = mk(w, h), off = mk(w, h);
    for (let k = 0; k < 3; k++) { on.g.shadowColor = n.col; on.g.shadowBlur = 6; drawTxt(on.g, n.txt, 8, 6, 1, n.col); }
    on.g.shadowBlur = 0; drawTxt(on.g, n.txt, 8, 6, 1, n.col); on.g.globalAlpha = 0.7; drawTxt(on.g, n.txt, 8, 6, 1, '#ffffff'); on.g.globalAlpha = 1;
    on.g.strokeStyle = n.col; on.g.lineWidth = 1; on.g.strokeRect(3.5, 2.5, w - 7, h - 5);
    drawTxt(off.g, n.txt, 8, 6, 1, '#3a2a3a'); off.g.strokeStyle = '#2a2030'; off.g.strokeRect(3.5, 2.5, w - 7, h - 5);
    n.on = on; n.off = off; n.w = w;
  }
  /* lamp glow + window-light pools */
  BG.glow = mk(120, 120); { const gg = BG.glow.g, gr = gg.createRadialGradient(60, 60, 2, 60, 60, 60); gr.addColorStop(0, 'rgba(255,225,150,0.55)'); gr.addColorStop(0.3, 'rgba(255,200,120,0.18)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 120, 120); }
  BG.cone = mk(80, 110); { const gg = BG.cone.g, gr = gg.createLinearGradient(0, 0, 0, 110); gr.addColorStop(0, 'rgba(255,225,150,0.20)'); gr.addColorStop(1, 'rgba(255,225,150,0.02)'); gg.fillStyle = gr; gg.beginPath(); gg.moveTo(36, 0); gg.lineTo(44, 0); gg.lineTo(80, 110); gg.lineTo(0, 110); gg.closePath(); gg.fill(); }

  /* crowd on the sidewalk: 4 bob frames, parkas + toques, a few phones up */
  const PPL = []; for (let x = 6; x < STAGE_W - 6; x += 9 + rnd() * 12) if (LAMPS.every(l => Math.abs(x - l) > 10)) PPL.push({ x: x | 0, h: 18 + rnd() * 9 | 0, w: 11 + rnd() * 5 | 0, c: ['#2a2a4a', '#3a1e2a', '#1e3a3a', '#3a3a22', '#2a1a3a', '#40242a'][rnd() * 6 | 0], hat: ['#c02a2a', '#2a6ac0', '#e0c040', '#2a8a4a', '#d0d0e0', null][rnd() * 6 | 0], ph: rnd() * 4 | 0, arm: rnd() < 0.35, phone: rnd() < 0.2, skin: ['#c88a6a', '#e0b090', '#8a5a3a', '#f0c8a8'][rnd() * 4 | 0] });
  BG.crowd = [];
  for (let fr = 0; fr < 4; fr++) {
    const cc = mk(STAGE_W, 50), cg = cc.g;
    for (const p of PPL) {
      const b = [0, -1, -2, -1][(fr + p.ph) & 3], top = 50 - p.h + b, x = p.x;
      R(cg, '#0b0712', x, top + 6, p.w, 2); R(cg, '#0b0712', x - 1, top + 8, p.w + 2, p.h); R(cg, p.c, x + 1, top + 7, p.w - 2, 2); R(cg, p.c, x, top + 9, p.w, p.h);
      R(cg, 'rgba(0,0,0,0.35)', x + (p.w >> 1), top + 12, 1, p.h);
      R(cg, 'rgba(255,255,255,0.10)', x, top + 7, p.w, 1); R(cg, 'rgba(0,0,0,0.35)', x + p.w - 2, top + 8, 2, p.h);
      const hx = x + (p.w >> 1) - 4;
      R(cg, '#0b0712', hx - 1, top - 1, 9, 9); R(cg, p.skin, hx, top, 7, 8); R(cg, 'rgba(0,0,0,0.3)', hx + 5, top, 2, 8); R(cg, '#0b0712', hx + 2, top + 3, 1, 1); R(cg, '#0b0712', hx + 5, top + 3, 1, 1);
      if (p.hat) { R(cg, '#0b0712', hx - 1, top - 3, 9, 5); R(cg, p.hat, hx, top - 2, 7, 4); R(cg, 'rgba(255,255,255,0.35)', hx, top + 1, 7, 1); R(cg, '#ffffff', hx + 2, top - 4, 3, 2); } else R(cg, '#2a1a12', hx, top, 7, 2);
      if (p.arm) { const up = ((fr + p.ph) & 2) ? 3 : 0; R(cg, '#0b0712', x + p.w - 1, top - 6 + up, 4, 14); R(cg, p.c, x + p.w, top - 5 + up, 2, 12); R(cg, p.skin, x + p.w, top - 7 + up, 2, 2); if (p.phone) R(cg, '#bfe8ff', x + p.w - 1, top - 10 + up, 3, 3); }
    }
    BG.crowd.push(cc);
  }

  /* snow flakes */
  BG.snow = []; for (let i = 0; i < 110; i++) BG.snow.push({ x: Math.random() * W, y: Math.random() * H, s: 0.25 + Math.random() * 0.85 });

  /* CRT overlay: scanlines + vignette at 960x540 */
  BG.crt = mk(960, 540); { const gg = BG.crt.g; gg.fillStyle = 'rgba(0,0,0,0.30)'; for (let y = 0; y < 540; y += 2) gg.fillRect(0, y, 960, 1);
    gg.fillStyle = 'rgba(255,0,60,0.035)'; for (let x = 0; x < 960; x += 3) gg.fillRect(x, 0, 1, 540);
    const gr = gg.createRadialGradient(480, 270, 200, 480, 270, 620); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)'); gg.fillStyle = gr; gg.fillRect(0, 0, 960, 540); }
}

/* ---------- sparks / dust (pre-rendered frame strips, pixel-snapped) ---------- */
const SPARK_PAL = ['#ffffff', '#fff6b0', '#ffe066', '#ffb020', '#ff6a12', '#c82808', '#bfe8ff', '#7fd3ff', '#3a8aff', '#1a4ca0', '#d8d0c0', '#a89a88', '#6a6058', '#0b0712'];
const SPK = {};
function buildSparks() {
  const life = { h: 16, H: 16, K: 28, b: 16, d: 16, D: 22 }, size = { h: 40, H: 64, K: 112, b: 40, d: 40, D: 72 };
  for (const k in life) {
    const n = Math.ceil(life[k] / 2), S = size[k], arr = [];
    for (let i = 0; i < n; i++) {
      const c = mk(S, S, true), g = c.g, p = i / (n - 1), m = S / 2; seed = 99 + i * 7 + k.charCodeAt(0);
      if (k === 'h' || k === 'H' || k === 'K') {
        const big = k === 'h' ? 1 : k === 'H' ? 1.6 : 2.8, rays = k === 'h' ? 8 : 12;
        const col = p < 0.25 ? '#ffffff' : p < 0.5 ? '#ffe066' : p < 0.75 ? '#ffb020' : '#ff6a12';
        if (p < 0.6) { g.fillStyle = p < 0.3 ? '#ffffff' : '#fff6b0'; g.beginPath(); g.arc(m, m, (5 - p * 6) * big, 0, 7); g.fill(); }
        g.strokeStyle = col; g.lineCap = 'round';
        for (let r = 0; r < rays; r++) { const a = r / rays * Math.PI * 2 + (r & 1) * 0.2, L0 = (3 + p * 10) * big, L1 = L0 + (r & 1 ? 5 : 9) * big * (1 - p * 0.7); g.lineWidth = Math.max(1, (2.6 - p * 2) * big * 0.7); g.beginPath(); g.moveTo(m + Math.cos(a) * L0, m + Math.sin(a) * L0); g.lineTo(m + Math.cos(a) * L1, m + Math.sin(a) * L1); g.stroke(); }
        if (k !== 'h') { g.strokeStyle = p < 0.4 ? '#ffffff' : '#ffb020'; g.lineWidth = Math.max(1, 2 * (1 - p)); g.beginPath(); g.arc(m, m, (4 + p * 16) * big * 0.8, 0, 7); g.stroke(); }
        for (let d = 0; d < (k === 'h' ? 4 : 9); d++) { const a = rnd() * 7, rr = (6 + p * 16) * big * (0.6 + rnd() * 0.5); g.fillStyle = col; g.fillRect(m + Math.cos(a) * rr, m + Math.sin(a) * rr, 2, 2); }
      } else if (k === 'b') {
        g.strokeStyle = p < 0.3 ? '#ffffff' : p < 0.6 ? '#bfe8ff' : '#3a8aff'; g.lineWidth = Math.max(1, 3 - p * 2);
        for (let r = 0; r < 3; r++) { g.beginPath(); g.arc(m - 6 + r * 2, m, 6 + r * 4 + p * 8, -1.1 + p * 0.3, 1.1 - p * 0.3); g.stroke(); }
        g.fillStyle = '#bfe8ff'; for (let d = 0; d < 6; d++) { const a = -1 + rnd() * 2, rr = 8 + p * 14; g.fillRect(m + Math.cos(a) * rr, m + Math.sin(a) * rr, 2, 1); }
      } else {   // dust
        const big = k === 'd' ? 1 : 1.8;
        for (let d = 0; d < 6; d++) { const side = d & 1 ? 1 : -1, rr = (4 + p * 12) * big * (0.6 + (d >> 1) * 0.3), x = m + side * rr, y = m + 6 * big - p * 6 * big - (d >> 1) * 2, r = Math.max(1, (4 - p * 3) * big * (1 - (d >> 1) * 0.2)); g.fillStyle = p < 0.4 ? '#d8d0c0' : p < 0.7 ? '#a89a88' : '#6a6058'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
      }
      arr.push(pixelate(c, SPARK_PAL, null));
    }
    SPK[k] = arr;
  }
}
/* ---------- projectile sprites ---------- */
const PROJ = {};
function buildProj() {
  for (const art of ['ink', 'wire', 'chain']) {
    PROJ[art] = [];
    for (let i = 0; i < 8; i++) {
      const c = mk(32, 32, true), g = c.g;
      g.translate(16, 16); g.rotate(art === 'ink' ? Math.sin(i / 8 * Math.PI * 2) * 0.25 : 0); g.translate(-16, -16);
      if (art === 'ink') { inkBlob(g, [16, 16], 1.7 + Math.sin(i / 8 * Math.PI * 2) * 0.12); } else if (art === 'chain') chainSpark(g, [16, 16], 1.55, i / 8 * Math.PI * 2); else wireCoil(g, [16, 16], 1.6, i / 8 * Math.PI * 2);
      PROJ[art].push(pixelate(c, [OUT].concat(FXP), null));
    }
  }
}

/* ---------- live stage drawing ---------- */
function neonLevel(n, tick) {   // 1 = on, 0 = off; each sign has its own flicker habit
  const t = (tick + n.ph) % 600;
  if (n.txt === 'PAWN') return (t < 40 && (t >> 2) % 3 === 0) || (t > 300 && t < 310) ? 0 : 1;   // the dodgy one
  return t < 8 && (t >> 1) % 2 ? 0 : 1;
}
function drawStage(g, camX, tick) {
  const lv = QUAL.lv;
  g.drawImage(BG.sky, 0, 0);
  g.drawImage(BG.far, Math.round(-camX * 0.12), 0);
  g.drawImage(BG.mid, Math.round(-camX * 0.35), -34);
  const nx = Math.round(-camX);
  g.drawImage(BG.near, nx, 0);
  for (const n of NEON) {
    const x = Math.round(n.x - n.w / 2 + nx); if (x > W || x + n.w < 0) continue;
    const on = neonLevel(n, tick); g.drawImage(on ? n.on : n.off, x, n.y - 4);
    if (on && lv > 0) { g.save(); g.globalAlpha = 0.28; g.translate(x, 2 * 229 - n.y + 30); g.scale(1, -1); g.drawImage(n.on, 0, 0); g.restore(); }
  }
  g.drawImage(BG.crowd[lv ? Math.floor(tick / 9) % 4 : 0], nx, 178);
  for (const l of LAMPS) {
    const x = l - 10 + nx; if (x < -70 || x > W + 70) continue;
    if (lv > 0) { g.globalCompositeOperation = 'lighter'; g.drawImage(BG.glow, x - 60, 120 - 60); g.drawImage(BG.cone, x - 40, 122); g.globalAlpha = 0.6; g.drawImage(BG.glow, x - 60, 236 - 60); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    else { g.globalAlpha = 0.5; g.drawImage(BG.glow, x - 60, 120 - 60); g.globalAlpha = 1; }
  }
}
function drawSnow(g, tick, near) {
  const lv = QUAL.lv, n = lv === 2 ? 110 : lv === 1 ? 70 : 30;
  for (let i = near ? 0 : 1; i < n; i += 2) {
    const s = BG.snow[i], big = near && s.s > 0.6, sp = near ? s.s : s.s * 0.5;
    const y = (s.y + tick * sp * 0.7) % H, x = ((s.x + Math.sin((tick + s.y) * 0.02) * 6 - (near ? (G ? G.camX : 0) * 0.3 : 0)) % W + W) % W;
    g.fillStyle = near ? '#eef4ff' : '#9aa8d0'; g.fillRect(x | 0, y | 0, big ? 2 : 1, big ? 2 : 1);
  }
}

/* ---------- fighters ---------- */
const FLASH = mk(FW, FH);
function fighterVisible(f, tick) {
  const M = moveDef(f);
  if (M && M.tele && f.mf < M.s) return f.mf < 4 ? ((tick >> 1) & 1) : 0;   // DROP IN: vanishes on startup
  if (f.inv > 0 && (tick >> 1) % 2) return 0.6;
  return 1;
}
function drawFighter(g, f, tick, camX) {
  const C = CHARS[f.ch], sx = Math.round(f.x - camX), sy = GROUND - Math.round(f.y), S = SHEETS[f.ch], M = moveDef(f);
  const vis = fighterVisible(f, tick), rend = RENDERERS[C.render] || RENDERERS.pixel;
  // contact shadow
  const sw = Math.round(C.bodyW * 0.8 * Math.max(0.35, 1 - f.y / 120));
  g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(sx - sw, GROUND, sw * 2, 2); g.fillRect(sx - sw + 3, GROUND - 1, sw * 2 - 6, 1); g.fillRect(sx - sw + 3, GROUND + 2, sw * 2 - 6, 1);
  if (M && M.tele && f.mf < M.s) {   // wire-glint swirl where she vanished
    g.fillStyle = '#d0d4dc'; for (let k = 0; k < 6; k++) { const a = tick * 0.3 + k * 1.05, r = 6 + f.mf * 1.2; g.fillRect(sx + Math.cos(a) * r | 0, sy - 40 + Math.sin(a) * r * 1.6 | 0, 2, 1); }
  }
  if (!vis) return;
  // afterimages on dashes, rushes and the drop
  const active = M && f.mf >= M.s && f.mf < M.s + M.a;
  if (M && (M.dash || M.tele) && (active || f.mv === 'dsh') && QUAL.lv > 0) {
    for (let k = 2; k >= 1; k--) { g.globalAlpha = 0.18 * (3 - k); const dx = M.tele ? 0 : -Math.round(f.vx * 4 * k), dy = M.tele && active ? -12 * k : 0; rend(g, f, C, sx + dx, sy + dy, tick); }
    g.globalAlpha = 1;
  }
  g.globalAlpha = vis;
  rend(g, f, C, sx, sy, tick);
  g.globalAlpha = 1;
  // white hit-flash while the hit-stop holds
  if (G && G.hitstop > 0 && (f.st === 'hit' || f.st === 'kd') && (G.hitstop & 2) && S && S.imgs) {
    const A = animOf(f, S), i = frameOf(f, A, tick), fg = FLASH.g; fg.clearRect(0, 0, FW, FH);
    fg.globalCompositeOperation = 'source-over'; fg.drawImage(S.imgs[A.row], i * S.fw, 0, S.fw, S.fh, 0, 0, S.fw, S.fh);
    fg.globalCompositeOperation = 'source-in'; fg.fillStyle = '#ffffff'; fg.fillRect(0, 0, FW, FH); fg.globalCompositeOperation = 'source-over';
    g.save(); g.globalAlpha = 0.75; g.translate(sx, sy); g.scale(f.face, 1); g.drawImage(FLASH, -S.ox, -S.oy); g.restore();
  }
}
function drawReflection(g, f, tick, camX) {
  if (!fighterVisible(f, tick)) return;
  const C = CHARS[f.ch], sx = Math.round(f.x - camX), ry = GROUND + Math.round(f.y) + 1;
  g.globalAlpha = 0.22; (RENDERERS[C.render] || RENDERERS.pixel)(g, f, C, sx, ry, tick, true); g.globalAlpha = 1;
}
function drawProj(g, p, tick, camX) {
  const x = Math.round(p.x - camX), y = GROUND - Math.round(p.y), art = p.art || (G && G.f[p.o] && CHARS[G.f[p.o].ch].moves.sp.proj && CHARS[G.f[p.o].ch].moves.sp.proj.art) || 'ink';
  const fr = PROJ[art] || PROJ.ink, img = fr[Math.floor(tick / 3) % fr.length], d = Math.sign(p.vx) || 1;
  if (art === 'ink') { g.fillStyle = '#14324a'; for (let k = 1; k < 5; k++) g.fillRect(x - d * k * 7, y + (k & 1 ? 2 : -2) + ((tick + k) % 3), 4 - (k >> 1), 2); }
  else { g.fillStyle = '#d0d4dc'; for (let k = 1; k < 4; k++) if ((tick + k) & 1) g.fillRect(x - d * k * 8, y - 3 + k * 2, 2, 1); }
  g.save(); g.translate(x, y); g.scale(d, 1); g.drawImage(img, -16, -16); g.restore();
}
function drawSpark(g, s, camX) {
  const fr = SPK[s.k] || SPK.h, img = fr[Math.min(fr.length - 1, s.t >> 1)];
  const dust = s.k === 'd' || s.k === 'D';
  g.drawImage(img, Math.round(s.x - camX - img.width / 2), Math.round(GROUND - s.y - img.height / 2 - (dust ? img.height * 0.2 : 0)));
}
function drawBoxes(g) {
  for (const f of G.f) {
    const hu = hurtBox(f); g.strokeStyle = '#0f0'; g.strokeRect(hu[0] - G.camX, GROUND - hu[1] - hu[3], hu[2], hu[3]);
    const M = moveDef(f); if (M && f.mf >= M.s && f.mf < M.s + M.a && !M.proj) { const b = worldBox(f, M.box); g.strokeStyle = '#f00'; g.strokeRect(b[0] - G.camX, GROUND - b[1] - b[3], b[2], b[3]); }
  }
}

/* ---------- HUD (drawn at 2x onto the main canvas, in world units) ---------- */
const HUD = {};
function chromeBox(g, x, y, w, h) {
  const rows = ['#ffffff', '#d8dcec', '#9aa2c0', '#5a6284', '#3a4060'];
  R(g, OUT, x - 1, y - 1, w + 2, h + 2);
  for (let i = 0; i < 2; i++) { R(g, rows[i], x + i, y + i, w - i * 2, 1); R(g, rows[3 + i], x + i, y + h - 1 - i, w - i * 2, 1); R(g, rows[1 + i], x + i, y + i, 1, h - i * 2); R(g, rows[3 + i], x + w - 1 - i, y + i, 1, h - i * 2); }
  R(g, OUT, x + 2, y + 2, w - 4, h - 4);
}
function buildHUD() {
  const BW = 172, BH = 9;
  HUD.BW = BW; HUD.BH = BH;
  HUD.frame = mk(W, 50); const g = HUD.frame.g;
  for (let i = 0; i < 2; i++) { const x = i ? W - 40 - BW - 4 : 40; chromeBox(g, x, 7, BW + 4, BH + 4); chromeBox(g, i ? W - 38 : 4, 4, 34, 34); }
  chromeBox(g, W / 2 - 18, 5, 36, 30);
  const bar = (cols) => { const c = mk(BW, BH, true); gradRows(c.g, 0, 0, BW, BH, cols); R(c.g, 'rgba(255,255,255,0.45)', 0, 1, BW, 1); return c; };
  HUD.y = bar(['#fffbd0', '#ffe066', '#ffc83a', '#f0a020', '#c87010']);
  HUD.o = bar(['#ffe0b0', '#ff9a3a', '#ff6a12', '#c83808', '#902004']);
  HUD.r = bar(['#ff8a7a', '#e02a1a', '#b01010', '#780404']);
  HUD.e = bar(['#2a0606', '#1a0404', '#100202']);
  HUD.v = mk(9, 9); chromeBox(HUD.v.g, 1, 1, 7, 7); R(HUD.v.g, '#ffc83a', 3, 3, 3, 3); R(HUD.v.g, '#ffffff', 3, 3, 1, 1);
}
function drawBanner(g, b) {
  const t = b.t, txt = b.txt;
  let style = 'gold', sc = 5;
  if (txt === 'FIGHT!') { style = 'fire'; sc = 8; }
  else if (/K\.O\./.test(txt)) { style = (t >> 2) % 2 && t < 40 ? 'flash' : 'red'; sc = 9; }
  else if (txt === 'TIME') { style = 'ice'; sc = 8; }
  else if (/WINS|DRAW/.test(txt)) { style = 'gold'; sc = 4; }
  sc = Math.max(2, Math.min(sc, Math.floor(440 / txtW(txt, 1))));
  const y = Math.round(H * 0.36);
  if (/^ROUND|^FINAL/.test(txt) || /WINS|DRAW/.test(txt)) {   // band + slide-in
    const k = Math.min(1, t / 10), bh = 7 * sc + 16;
    g.fillStyle = 'rgba(5,6,15,0.55)'; g.fillRect(0, y - 8, W, bh); R(g, '#ffc83a', 0, y - 9, Math.round(W * k), 1); R(g, '#ffc83a', W - Math.round(W * k), y - 9 + bh, Math.round(W * k), 1);
    drawText(g, txt, Math.round(W / 2 - (1 - k) * 300), y, sc, style, 'c');
  } else if (txt === 'FIGHT!') {
    const z = Math.max(1, 2.2 - t * 0.2), c = textSprite(txt, sc, style);
    g.drawImage(c, Math.round(W / 2 - c.width * z / 2), Math.round(y + 3.5 * sc - c.height * z / 2), Math.round(c.width * z), Math.round(c.height * z));
  } else drawText(g, txt, W / 2, y, sc, style, 'c');
}
function drawHUD(g) {
  const BW = HUD.BW, BH = HUD.BH;
  g.drawImage(HUD.frame, 0, 0);
  for (let i = 0; i < 2; i++) {
    const f = G.f[i], x = i ? W - 38 - BW : 42, y = 9;
    const red = Math.round(BW * Math.max(0, f.red) / f.max), hp = Math.round(BW * Math.max(0, f.hp) / f.max);
    g.drawImage(HUD.e, x, y);
    if (red > 0) g.drawImage(HUD.r, 0, 0, red, BH, i ? x + BW - red : x, y, red, BH);
    const low = f.hp / f.max < 0.25 && (G.tick >> 3) % 2;
    if (hp > 0) g.drawImage(low ? HUD.o : HUD.y, 0, 0, hp, BH, i ? x + BW - hp : x, y, hp, BH);
    const P = PORTRAITS[f.ch], hurt = f.st === 'hit' || f.st === 'kd' || f.st === 'lie' || f.st === 'ko', pimg = hurt ? P.h : P.n;
    g.save(); g.translate(i ? W - 6 : 6, 6); g.scale(i ? -1 : 1, 1); g.drawImage(pimg, 0, 0); g.restore();
    const nm = CHARS[f.ch].name, lab = G.mode === 'solo' ? (i ? 'CPU' : '1P') : (i === me ? 'YOU' : (i ? '2P' : '1P'));
    const nw = drawText(g, nm, i ? x + BW : x, y + BH + 5, 1, 'chrome', i ? 'r' : 'l');
    drawText(g, lab, i ? x + BW - nw - 4 : x + nw + 4, y + BH + 5, 1, 'cyan', i ? 'r' : 'l');
    for (let r = 0; r < G.wins[i]; r++) g.drawImage(HUD.v, i ? x + 2 + r * 11 : x + BW - 11 - r * 11, y + BH + 14);
  }
  const tm = String(Math.max(0, G.timer)).padStart(2, '0');
  drawText(g, tm, W / 2, 10, 3, G.timer <= 10 ? ((G.tick >> 4) & 1 ? 'red' : 'white') : 'gold', 'c');
  if (G.banner && G.phase !== 'matchEnd') drawBanner(g, G.banner);
  if (G.phase === 'matchEnd') {
    const won = G.result === me, txt = G.result < 0 ? 'DRAW GAME' : won ? 'YOU WIN' : 'YOU LOSE';
    const k = Math.min(1, G.pt / 10);
    drawText(g, txt, W / 2, Math.round(H * 0.2 + (1 - k) * -40), 6, G.result < 0 ? 'chrome' : won ? 'fire' : 'ice', 'c');
    if (G.result >= 0) {
      const C = CHARS[G.f[G.result].ch], P = PORTRAITS[G.f[G.result].ch];
      chromeBox(g, 40, 118, 100, 100); g.drawImage(P.win, 42, 120);
      const lines = wrapTxt('"' + C.taunt + '"', 26);
      R(g, OUT, 150, 132, 300, 14 + lines.length * 12); R(g, '#f4f0e0', 151, 133, 298, 12 + lines.length * 12); R(g, '#f4f0e0', 144, 150, 7, 6); R(g, OUT, 143, 150, 1, 6);
      lines.forEach((l, j) => drawTxt(g, l, 158, 139 + j * 12, 1, OUT));
      drawText(g, C.title + ' TAKES BAY STREET', 150, 160 + lines.length * 12, 1, 'gold', 'l');
    }
  }
}
function wrapTxt(s, n) { const out = []; let cur = ''; for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > n) { out.push(cur.trim()); cur = w; } else cur += ' ' + w; } if (cur.trim()) out.push(cur.trim()); return out; }

/* ---------- logo (title screen) ---------- */
function paintLogo() {
  const el = document.getElementById('logo'); if (!el) return;
  const g = el.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, el.width, el.height);
  const a = textSprite('THUNDER BAY', 5, 'ice', 2), b = textSprite('BRAWL', 12, 'fire', 3);
  g.drawImage(a, Math.round((el.width - a.width) / 2), 2);
  g.drawImage(b, Math.round((el.width - b.width) / 2), a.height + 2);
  g.fillStyle = '#fff36a'; const bx = el.width - 40, by = a.height + 8;   // lightning bolt
  for (const [x, y, w] of [[10, 0, 6], [8, 6, 6], [6, 12, 10], [9, 16, 5], [7, 20, 4], [5, 24, 3]]) g.fillRect(bx + x, by + y, w, 4);
}

/* ---------- attract mode behind the title ---------- */
const ATTRACT = { pair: null, at: -1 };
function renderAttract() {
  const cyc = Math.floor(frame / 420);
  if (ATTRACT.at !== cyc) { ATTRACT.at = cyc; const a = CHAR_IDS[cyc % CHAR_IDS.length], b = CHAR_IDS[(cyc + 1 + (cyc >> 2)) % CHAR_IDS.length]; ATTRACT.pair = [newFighter(a, 0), newFighter(b === a ? CHAR_IDS[(cyc + 2) % CHAR_IDS.length] : b, 1)]; }
  const camX = (STAGE_W - W) / 2 + Math.sin(frame / 300) * 140;
  drawStage(wx, camX, frame); drawSnow(wx, frame, false);
  const [p, q] = ATTRACT.pair, ph = frame % 420;
  p.x = camX + 170; q.x = camX + 310; p.face = 1; q.face = -1;
  for (const f of [p, q]) { f.st = ph > 300 ? 'win' : (ph >> 6) & 1 ? 'walk' : 'idle'; f.t = ph - 300; f.walkT = frame; }
  if (QUAL.lv > 0) for (const f of [p, q]) drawReflection(wx, f, frame, camX);
  for (const f of [p, q]) drawFighter(wx, f, frame, camX);
  drawSnow(wx, frame, true);
}

function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  if (!G) { renderAttract(); ctx.drawImage(wc, 0, 0, 960, 540); if (CRT.on) ctx.drawImage(BG.crt, 0, 0); return; }
  const t = G.tick, camX = G.camX;
  drawStage(wx, camX, t);
  drawSnow(wx, t, false);
  if (QUAL.lv > 0) for (const f of G.f) drawReflection(wx, f, t, camX);
  const order = G.f.slice().sort((a, b) => (a.st === 'atk' ? 1 : 0) - (b.st === 'atk' ? 1 : 0));
  for (const f of order) drawFighter(wx, f, t, camX);
  for (const p of G.proj) drawProj(wx, p, t, camX);
  for (const s of G.sparks) drawSpark(wx, s, camX);
  drawSnow(wx, t, true);
  if (SHOW_BOXES) drawBoxes(wx);
  const sh = G.shake, ox = sh ? Math.round((Math.random() - 0.5) * sh * 2) : 0, oy = sh ? Math.round((Math.random() - 0.5) * sh * 2) : 0;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 960, 540);
  ctx.drawImage(wc, ox * 2 - (sh ? 6 : 0), oy * 2 - (sh ? 6 : 0), 960 + (sh ? 12 : 0), 540 + (sh ? 12 : 0));
  if (G.banner && /K\.O\./.test(G.banner.txt) && G.banner.t < 12) { ctx.fillStyle = 'rgba(255,255,255,' + (0.7 * (1 - G.banner.t / 12)).toFixed(3) + ')'; ctx.fillRect(0, 0, 960, 540); }
  ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.imageSmoothingEnabled = false;
  drawHUD(ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (CRT.on) ctx.drawImage(BG.crt, 0, 0);
}

/* ---------- build everything once at load ---------- */
const BUILD_MS = (() => { const t0 = performance.now(); buildFighterArt(); buildStage(); buildSparks(); buildProj(); buildHUD(); return Math.round(performance.now() - t0); })();

/* ---------- tiny synth SFX ---------- */
let AC = null;
function audioInit() { if (AC) { if (AC.state === 'suspended') AC.resume(); return; } try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
function tone(f0, f1, dur, type, vol, noise) {
  if (!AC || AC.state !== 'running') return;
  const t = AC.currentTime, gn = AC.createGain(); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur); gn.connect(AC.destination);
  if (noise) { const b = AC.createBuffer(1, AC.sampleRate * dur | 0, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); const s = AC.createBufferSource(); s.buffer = b; const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = f0; s.connect(fl); fl.connect(gn); s.start(t); return; }
  const o = AC.createOscillator(); o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); o.connect(gn); o.start(t); o.stop(t + dur);
}
function sfx(k) {
  switch (k) {
    case 'hit': tone(1800, 0, 0.12, 0, 0.5, 1); tone(220, 80, 0.08, 'square', 0.12); break;
    case 'hitH': tone(1200, 0, 0.22, 0, 0.7, 1); tone(140, 40, 0.2, 'square', 0.2); break;
    case 'block': tone(3000, 0, 0.06, 0, 0.35, 1); tone(900, 600, 0.05, 'triangle', 0.1); break;
    case 'swing': tone(2600, 0, 0.05, 0, 0.12, 1); break;
    case 'swingH': tone(1400, 0, 0.09, 0, 0.18, 1); break;
    case 'jump': tone(300, 600, 0.08, 'triangle', 0.08); break;
    case 'land': case 'thud': tone(400, 0, 0.1, 0, 0.3, 1); break;
    case 'special': tone(200, 900, 0.25, 'sawtooth', 0.12); break;
    case 'toss': tone(500, 1200, 0.18, 'square', 0.08); break;
    case 'ko': tone(150, 30, 0.9, 'sawtooth', 0.3); tone(800, 0, 0.6, 0, 0.5, 1); break;
    case 'round': tone(440, 440, 0.12, 'square', 0.1); break;
    case 'fight': tone(330, 990, 0.35, 'square', 0.14); break;
    case 'time': tone(600, 200, 0.5, 'square', 0.12); break;
    case 'matchEnd': tone(523, 523, 0.15, 'square', 0.1); setTimeout(() => tone(784, 784, 0.3, 'square', 0.1), 150); break;
  }
}
let lastEv = 0;
function playEvents() { if (!G) return; for (const e of G.ev) if (e.id > lastEv) { lastEv = e.id; sfx(e.type); } }
</script>
