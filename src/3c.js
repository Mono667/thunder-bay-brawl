<script>
'use strict';
/* =====================================================================
   STAGES (batch 2 redraw). Art is authored in SCREEN pixels: the view is
   480x270 and the near layer is NW = STAGE_W*ZOOM px wide, scrolling 1:1
   with the (zoomed) fight plane. Back layers scroll at a fraction of that.
   Each stage = { sky, clouds?, aur, layers:[{img,par,y}], back(), near,
   neon, crowd, crowdY, live(), vents, lamps, car, fg, gy }.
   1. BAY STREET, Port Arthur, 2 AM: Live Bait, The Hoito, an alley,
      Tattoo, the Marina Park lookout (Lake Superior, the Sleeping Giant,
      the grain elevators, a freight train), Persians 24HR (with the cat),
      Pawn, Arcade. Wet road, snowbanks, crowd on the sidewalk.
   2. MAY STREET ALLEY BAR, Fort William: fire escapes, the tavern's back
      wall + neon, the caged bulb, kegs, dumpsters, the cat, a chain-link
      fence, the mouth onto May St with cars going by, Mount McKay beyond.
   ===================================================================== */
const NW = STAGE_W * ZOOM, SWT = 192;
const BG = {}, STAGES = {}, NEON = [], FG_PAR = 1.3, WIND = { off: 0, last: 0, g: 0 };
function pxLine(g, c, x0, y0, x1, y1, w) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; g.fillStyle = c; for (let i = 0; i <= n; i++) { const k = n ? i / n : 0; g.fillRect(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k), w || 1, w || 1); } }
function sag(g, c, x0, y0, x1, y1, d) { const n = Math.abs(x1 - x0) | 0; g.fillStyle = c; for (let i = 0; i <= n; i++) { const k = i / n; g.fillRect(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k + Math.sin(k * Math.PI) * d), 1, 1); } }
function brickWall(g, x0, y0, w, h, cols, sd, bw, bh) {   // [mortar, brick, lit brick, dark brick], painted straight into ImageData
  bw = bw || 8; bh = bh || 4; x0 |= 0; y0 |= 0; w |= 0; h |= 0; if (w <= 0 || h <= 0) return;
  const im = g.getImageData(x0, y0, w, h), d = im.data, C = cols.map(rgb);
  for (let y = 0; y < h; y++) {
    const row = Math.floor(y / bh), off = row & 1 ? bw >> 1 : 0, my = y % bh === bh - 1, top = y % bh === 0;
    for (let x = 0; x < w; x++) {
      const X = x0 + x + off, bx = Math.floor(X / bw), mortar = my || X % bw === bw - 1, n = ((bx * 73 + row * 151 + (sd || 0)) % 13 + 13) % 13;
      const c = mortar ? C[0] : n === 0 || n === 7 ? C[3] : (top || n === 5 || dith(X, y0 + y) < 0.1) ? C[2] : C[1];
      const o = (y * w + x) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
    }
  }
  g.putImageData(im, x0, y0);
}
function shadeV(g, x, y, w, h, a0, a1, col) { col = col || '4,4,16'; for (let i = 0; i < h; i++) { g.fillStyle = 'rgba(' + col + ',' + (a0 + (a1 - a0) * i / Math.max(1, h - 1)).toFixed(3) + ')'; g.fillRect(x, y + i, w, 1); } }
function glowAt(g, x, y, rx, ry, col, a) {   // soft additive light (col = 'r,g,b')
  g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); g.scale(1, ry / rx);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, 'rgba(' + col + ',' + a + ')'); gr.addColorStop(0.45, 'rgba(' + col + ',' + (a * 0.3).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)');
  g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
}
function snowCap(g, x, y, w, hm) {   // lumpy snow sitting on a ledge whose top is y
  hm = hm || 3;
  for (let i = 0; i < w; i++) { const X = x + i, h = Math.max(1, Math.round(1 + (0.5 + 0.3 * Math.sin(X * 0.37) + 0.2 * Math.sin(X * 0.13 + 1)) * (hm - 1))); R(g, '#dfe7f4', X, y - h, 1, h); if (dith(X, h) < 0.6) R(g, '#ffffff', X, y - h, 1, 1); R(g, '#8a98b8', X, y, 1, 1); }
  for (let i = 3; i < w - 2; i += 7 + (i * 13) % 5) R(g, '#b8c8e0', x + i, y + 1, 1, 1 + (i % 3));   // icicles
}
function win(g, x, y, w, h, o) {   // window: o.lit, o.kind (blinds|curtain|plant|person|tv|dark), o.st (sill/lintel stone), o.cc (curtain)
  R(g, OUT, x - 1, y - 1, w + 2, h + 2);
  if (o.lit) gradRows(g, x, y, w, h, o.pal || ['#ffe9a8', '#f5b85a', '#a0582a']); else gradRows(g, x, y, w, h, o.kind === 'tv' ? ['#22306a', '#141c44', '#0a0e26'] : ['#26345e', '#141b38', '#0b0f22']);
  if (!o.lit) for (let k = 0; k < Math.min(w, h) - 3; k++) if (k % 6 < 2) R(g, 'rgba(170,190,255,0.18)', x + 2 + k, y + h - 3 - k, 1, 1);
  if (o.lit && o.kind === 'blinds') for (let k = 1; k < h; k += 3) R(g, 'rgba(70,30,10,0.45)', x, y + k, w, 1);
  if (o.lit && o.kind === 'curtain') { R(g, o.cc || '#7a2a2a', x, y, 4, h); R(g, o.cc || '#7a2a2a', x + w - 4, y, 4, h); R(g, 'rgba(0,0,0,0.3)', x + 3, y, 1, h); R(g, 'rgba(0,0,0,0.3)', x + w - 4, y, 1, h); }
  if (o.lit && o.kind === 'plant') { R(g, '#3a1e10', x + 2, y + h - 5, 6, 5); for (const [dx, dy] of [[3, -9], [1, -7], [6, -8], [4, -12], [8, -6]]) R(g, '#1e3a1a', x + 2 + dx - 1, y + h - 5 + dy, 3, 4); }
  if (o.lit && o.kind === 'person') { const px = x + (w >> 1) - 3; R(g, 'rgba(30,14,8,0.75)', px, y + h - 13, 7, 7); R(g, 'rgba(30,14,8,0.75)', px - 3, y + h - 6, 13, 6); }
  R(g, OUT, x + (w >> 1), y, 1, h); R(g, OUT, x, y + Math.round(h * 0.45), w, 1);   // muntins
  if (o.st) { R(g, OUT, x - 3, y - 5, w + 6, 1); R(g, o.st, x - 3, y - 4, w + 6, 3); R(g, 'rgba(0,0,0,0.3)', x - 3, y - 2, w + 6, 1); R(g, o.st, x + (w >> 1) - 2, y - 5, 5, 4);
    R(g, OUT, x - 3, y + h + 1, w + 6, 3); R(g, o.st, x - 3, y + h + 1, w + 6, 2); snowCap(g, x - 3, y + h + 1, w + 6, 2); }
}
/* ---------- people (crowd strips) ---------- */
const PARKA = [['#2a2a4a', '#40406a'], ['#5a1e24', '#7e2e36'], ['#1e3a3a', '#2e5654'], ['#4a4a26', '#68683a'], ['#3a2050', '#56306e'], ['#16161e', '#2c2c38'], ['#6a3a14', '#8c5626'], ['#1a2a50', '#2a4274'], ['#7a1a1a', '#a02a2a'], ['#2a4a2a', '#3e683e']];
const SKIN = ['#f0c8a8', '#e0b090', '#c88a6a', '#a06a48', '#7a4a30', '#d8a080'];
function makePerson(x, h) {
  const p = PARKA[rnd() * PARKA.length | 0];
  return { x: x | 0, h: h | 0, w: Math.round(h * (0.36 + rnd() * 0.1)), c: p[0], hi: p[1], pants: ['#1a1e30', '#20202a', '#2a2a3a', '#2a1e1a'][rnd() * 4 | 0], boot: ['#2a1a10', '#101014', '#3a2a1a'][rnd() * 3 | 0],
    sc: rnd() < 0.45 ? ['#c02a2a', '#e0c040', '#2a6ac0', '#e8e8f0', '#2a8a4a'][rnd() * 5 | 0] : null, skin: SKIN[rnd() * SKIN.length | 0],
    hat: rnd() < 0.65 ? ['#c02a2a', '#2a6ac0', '#e0c040', '#2a8a4a', '#d0d0e0', '#5a2a7a', '#e86a1a'][rnd() * 7 | 0] : null, pom: rnd() < 0.6, hair: ['#2a1a12', '#14100c', '#5a3a1a', '#8a6a3a', '#3a2a20'][rnd() * 5 | 0],
    ph: rnd() * 4 | 0, arm: rnd() < 0.3, phone: rnd() < 0.22, cup: rnd() < 0.12 };
}
function person(g, p, fr, H0) {
  const cheer = fr >= 4, hop = cheer ? (((fr + p.ph) & 1) ? -4 : 0) : 0, br = cheer ? 0 : [0, 0, -1, 0][(fr + p.ph) & 3];
  const h = p.h, w = p.w, x = p.x, foot = H0 - 1 + hop, cx = x + (w >> 1);
  const legH = Math.round(h * 0.33), torsoH = Math.round(h * 0.4), hd = Math.max(7, Math.round(h * 0.17));
  const hip = foot - legH, sh = hip - torsoH + br, hy = sh - hd + 1, hx = cx - (hd >> 1), lw = Math.max(3, Math.round(w * 0.3));
  // legs + boots
  R(g, OUT, cx - lw - 2, hip - 1, lw * 2 + 4, foot - hip + 2);
  R(g, p.pants, cx - lw - 1, hip, lw, foot - hip - 2); R(g, p.pants, cx + 1, hip, lw, foot - hip - 2); R(g, 'rgba(255,255,255,0.12)', cx - lw - 1, hip, 1, foot - hip - 3);
  R(g, p.boot, cx - lw - 2, foot - 3, lw + 2, 3); R(g, p.boot, cx + 1, foot - 3, lw + 2, 3); R(g, 'rgba(255,255,255,0.15)', cx - lw - 1, foot - 3, lw, 1);
  // arms behind / at the sides
  const al = Math.round(torsoH * 0.9), arm = (ax, up) => { if (up) { R(g, OUT, ax - 1, sh - al + 1, 5, al + 2); R(g, p.c, ax, sh - al + 2, 3, al); R(g, OUT, ax - 1, sh - al - 2, 5, 4); R(g, p.skin, ax, sh - al - 1, 3, 3); } else { R(g, OUT, ax - 1, sh + 1, 5, al + 2); R(g, p.c, ax, sh + 2, 3, al - 1); R(g, p.hi, ax, sh + 2, 1, al - 1); R(g, p.skin, ax, sh + al, 3, 2); } };
  // parka
  R(g, OUT, x - 1, sh + 1, w + 2, hip - sh + 2); R(g, OUT, x, sh, w, 1);
  R(g, p.c, x, sh + 1, w, hip - sh + 1); R(g, p.hi, x, sh + 1, 2, hip - sh); R(g, p.hi, x + 1, sh + 1, w - 2, 1);
  R(g, 'rgba(0,0,0,0.35)', x + w - 3, sh + 1, 3, hip - sh + 1); R(g, 'rgba(0,0,0,0.3)', x, hip, w, 2); R(g, 'rgba(0,0,0,0.4)', cx, sh + 4, 1, hip - sh - 3);
  if (h > 44) { R(g, 'rgba(0,0,0,0.3)', x + 2, sh + (torsoH >> 1) + 2, 4, 1); R(g, 'rgba(0,0,0,0.3)', x + w - 6, sh + (torsoH >> 1) + 2, 4, 1); }   // pockets
  if (p.sc) { R(g, OUT, x + 1, sh - 1, w - 2, 5); R(g, p.sc, x + 2, sh, w - 4, 3); R(g, 'rgba(0,0,0,0.25)', x + 2, sh + 2, w - 4, 1); R(g, p.sc, x + w - 6, sh + 3, 3, 5); }
  if (cheer) { arm(x - 4, ((fr + p.ph) & 1) === 0); arm(x + w + 1, ((fr + p.ph) & 1) === 1); }
  else { arm(x - 3, false); if (p.arm || p.phone) { const up = ((fr + p.ph) & 2) ? 2 : 0; R(g, OUT, x + w - 2, sh - 6 + up, 5, 12); R(g, p.c, x + w - 1, sh - 5 + up, 3, 10); R(g, p.skin, x + w - 1, sh - 8 + up, 3, 3); if (p.phone) { R(g, OUT, x + w - 2, sh - 14 + up, 5, 7); R(g, '#bfe8ff', x + w - 1, sh - 13 + up, 3, 5); R(g, '#ffffff', x + w - 1, sh - 13 + up, 1, 1); } } else arm(x + w, false); }
  if (p.cup && !cheer) { R(g, OUT, x - 4, sh + al - 5, 6, 7); R(g, '#e8e0d0', x - 3, sh + al - 4, 4, 5); R(g, '#c02a2a', x - 3, sh + al - 2, 4, 1); }
  // head
  R(g, OUT, hx - 1, hy - 1, hd + 2, hd + 2); R(g, p.skin, hx, hy, hd, hd); R(g, 'rgba(0,0,0,0.22)', hx + hd - 2, hy, 2, hd); R(g, 'rgba(255,255,255,0.15)', hx, hy + 1, 1, hd - 2);
  const ey = hy + (hd >> 1); R(g, OUT, hx + 2, ey - 1, 1, 2); R(g, OUT, hx + hd - 3, ey - 1, 1, 2);
  if (cheer) R(g, '#4a1414', cx - 1, hy + hd - 3, 3, 2); else R(g, 'rgba(0,0,0,0.35)', cx - 1, hy + hd - 2, 2, 1);
  if (p.hat) { R(g, OUT, hx - 1, hy - 4, hd + 2, 6); R(g, p.hat, hx, hy - 3, hd, 4); R(g, 'rgba(255,255,255,0.3)', hx, hy - 3, hd, 1); R(g, 'rgba(0,0,0,0.3)', hx, hy, hd, 1);
    if (p.pom) { R(g, OUT, cx - 2, hy - 8, 5, 5); R(g, p.hat === '#d0d0e0' ? '#c02a2a' : '#f0f0f4', cx - 1, hy - 7, 3, 3); } }
  else { R(g, p.hair, hx - 1, hy - 2, hd + 2, 4); R(g, p.hair, hx - 1, hy, 2, (hd >> 1) + 1); R(g, p.hair, hx + hd - 1, hy, 2, hd >> 1); R(g, 'rgba(255,255,255,0.12)', hx + 1, hy - 2, hd - 3, 1); }
}
function crowdFrames(PPL, H0) {   // 6 strips NW x H0: 0-3 idle (breathing, phones bob), 4-5 cheering (arms up, hopping)
  const out = []; PPL.sort((a, b) => a.h - b.h);
  for (let fr = 0; fr < 6; fr++) { const cc = mk(NW, H0); for (const p of PPL) person(cc.g, p, fr, H0); out.push(cc); }
  return out;
}
/* ---------- neon: 'on' (tube + bloom), 'off' (dead tube) and a coloured light wash per sign ---------- */
function neonSprites(list) {
  for (const n of list) {
    const s = n.s || 1, pad = 4 + 2 * s, ch = [...n.txt];
    const tw = n.vert ? 5 * s : txtW(n.txt, s), th = n.vert ? ch.length * 9 * s - 2 * s : 7 * s, w = tw + pad * 2, h = th + pad * 2;
    const on = mk(w, h), off = mk(w, h);
    const put = (g, col) => { if (n.vert) ch.forEach((c, i) => drawTxt(g, c, pad + ((tw - txtW(c, s)) >> 1), pad + i * 9 * s, s, col)); else drawTxt(g, n.txt, pad, pad, s, col); };
    const box = (g, col, lw) => { g.strokeStyle = col; g.lineWidth = lw; g.strokeRect(2.5, 2.5, w - 5, h - 5); if (s > 1) { g.lineWidth = 1; g.strokeRect(4.5, 4.5, w - 9, h - 9); } };
    for (let k = 0; k < 3; k++) { on.g.shadowColor = n.col; on.g.shadowBlur = 3 + 2 * s; put(on.g, n.col); box(on.g, n.col, 1); }
    on.g.shadowBlur = 0; put(on.g, n.col); box(on.g, n.col, 1); on.g.globalAlpha = 0.6; put(on.g, '#ffffff'); on.g.globalAlpha = 1;
    put(off.g, '#3a2a3a'); box(off.g, '#2a2030', 1);
    const ww = w + 90, wh = h + 70, wash = mk(ww, wh), wg = wash.g, gr = wg.createRadialGradient(ww / 2, wh / 2, 4, ww / 2, wh / 2, ww / 2), c = rgb(n.col).join(',');
    gr.addColorStop(0, 'rgba(' + c + ',0.34)'); gr.addColorStop(0.5, 'rgba(' + c + ',0.10)'); gr.addColorStop(1, 'rgba(' + c + ',0)'); wg.setTransform(1, 0, 0, wh / ww, 0, 0); wg.fillStyle = gr; wg.fillRect(0, 0, ww, ww);
    n.on = on; n.off = off; n.w = w; n.h = h; n.wash = wash;
  }
}
/* ---------- shared bits (both stages) ---------- */
function buildStageCommon() {
  BG.glow = mk(160, 160); { const gg = BG.glow.g, gr = gg.createRadialGradient(80, 80, 2, 80, 80, 80); gr.addColorStop(0, 'rgba(255,225,150,0.55)'); gr.addColorStop(0.3, 'rgba(255,200,120,0.17)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 160, 160); }
  BG.cone = mk(110, 130); { const gg = BG.cone.g, gr = gg.createLinearGradient(0, 0, 0, 130); gr.addColorStop(0, 'rgba(255,225,150,0.20)'); gr.addColorStop(1, 'rgba(255,225,150,0.02)'); gg.fillStyle = gr; gg.beginPath(); gg.moveTo(50, 0); gg.lineTo(60, 0); gg.lineTo(110, 130); gg.lineTo(0, 130); gg.closePath(); gg.fill(); }
  BG.head = mk(200, 70); { const gg = BG.head.g, gr = gg.createRadialGradient(100, 35, 2, 100, 35, 100); gr.addColorStop(0, 'rgba(255,246,220,0.55)'); gr.addColorStop(0.35, 'rgba(255,236,200,0.18)'); gr.addColorStop(1, 'rgba(255,236,200,0)'); gg.fillStyle = gr; gg.setTransform(1, 0, 0, 0.35, 0, 0); gg.fillRect(0, 0, 200, 200); }
  BG.shadow = mk(64, 12); for (let y = 0; y < 12; y++) for (let x = 0; x < 64; x++) { const dx = (x - 31.5) / 32, dy = (y - 5.5) / 6, r = dx * dx + dy * dy; if (r < 1 && dith(x, y) < 1.15 - r) { BG.shadow.g.fillStyle = r < 0.35 ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.45)'; BG.shadow.g.fillRect(x, y, 1, 1); } }
  BG.aur = [];   // aurora curtains: 4 shimmering frames, cross-faded live
  for (let k = 0; k < 4; k++) {
    const ac = mk(W + 40, 70), ag = ac.g, ph = k * 1.57;
    for (let x = 0; x < W + 40; x++) {
      const y0 = 30 + Math.sin(x * 0.016 + ph * 0.5) * 10 + Math.sin(x * 0.047 - ph) * 4, len = 14 + Math.sin(x * 0.1 + ph * 1.3) * 7 + Math.sin(x * 0.021 - ph) * 6;
      for (let j = 0; j < len; j++) { const f = j / len; if (dith(x, j + k) < 0.5 * (1 - f) * (0.6 + 0.4 * Math.sin(x * 0.2 + ph))) { ag.fillStyle = f < 0.15 && Math.sin(x * 0.03 + ph) > 0.5 ? '#c86ad8' : f < 0.5 ? '#5ae0a0' : '#2a8a7a'; ag.fillRect(x, Math.round(y0 - 12 + j), 1, 1); } }
    }
    BG.aur.push(ac);
  }
  BG.snow = []; for (let i = 0; i < 110; i++) BG.snow.push({ x: Math.random() * W, y: Math.random() * H, s: 0.25 + Math.random() * 0.85 });
  BG.fgW = Math.ceil((STAGE_W - VIEW_W) * ZOOM * FG_PAR + W);
  BG.crt = mk(960, 540); { const gg = BG.crt.g; gg.fillStyle = 'rgba(0,0,0,0.30)'; for (let y = 0; y < 540; y += 2) gg.fillRect(0, y, 960, 1);
    gg.fillStyle = 'rgba(255,0,60,0.035)'; for (let x = 0; x < 960; x += 3) gg.fillRect(x, 0, 1, 540);
    const gr = gg.createRadialGradient(480, 270, 200, 480, 270, 620); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)'); gg.fillStyle = gr; gg.fillRect(0, 0, 960, 540); }
}
function cloudStrip(w, h, cols, sd) {   // drifting low cloud: lumpy bands, moonlit tops, city-glow undersides
  const c = mk(w, h), g = c.g; seed = sd;
  for (const [y0, amp, th] of [[h * 0.35, 6, 10], [h * 0.7, 5, 8]]) {
    const ph = rnd() * 10;
    for (let x = 0; x < w; x++) {
      const t = x / w * Math.PI * 2, cov = Math.sin(t * 3 + ph) + Math.sin(t * 7 + ph * 2) * 0.5 + Math.sin(t * 13) * 0.25; if (cov < -0.2) continue;
      const top = Math.round(y0 - amp * (cov + 0.2) - Math.abs(Math.sin(x * 0.09 + ph)) * 3), bot = Math.round(y0 + th * 0.4 + Math.sin(x * 0.05) * 2);
      for (let y = top; y <= bot; y++) { const f = (y - top) / Math.max(1, bot - top); if (f < 0.12 && dith(x, y) > 0.7) continue; g.fillStyle = f < 0.2 ? cols[0] : f < 0.75 ? cols[1] : cols[2]; g.fillRect(x, y, 1, 1); }
    }
  }
  return c;
}
function trainSprite() {   // a grain train: two diesel units + covered hoppers, ~640 px
  const c = mk(700, 20), g = c.g;
  const loco = (x, d) => { R(g, OUT, x, 4, 56, 13); R(g, '#a01a1a', x + 1, 5, 54, 7); R(g, '#141418', x + 1, 12, 54, 4); R(g, '#e8e8e8', x + 1, 10, 54, 1); R(g, OUT, x + (d > 0 ? 44 : 2), 1, 10, 5); R(g, '#a01a1a', x + (d > 0 ? 45 : 3), 2, 8, 3); R(g, '#bfe0ff', x + (d > 0 ? 50 : 4), 2, 2, 2); for (let k = 8; k < 44; k += 6) R(g, '#6a1010', x + k, 6, 3, 3); for (const wx of [x + 6, x + 14, x + 38, x + 46]) R(g, '#2a2a30', wx, 16, 5, 3); };
  loco(0, -1); loco(57, -1);
  for (let i = 0; i < 12; i++) { const x = 116 + i * 48, col = ['#8a7a5a', '#9a8a6a', '#6a6a70', '#7a6040'][i % 4]; R(g, OUT, x, 3, 46, 14); R(g, col, x + 1, 4, 44, 11); R(g, 'rgba(255,255,255,0.15)', x + 1, 4, 44, 1); for (let k = 5; k < 44; k += 5) R(g, 'rgba(0,0,0,0.22)', x + k, 5, 1, 9); R(g, 'rgba(0,0,0,0.35)', x + 1, 13, 44, 2); R(g, '#2a2a30', x + 4, 16, 6, 3); R(g, '#2a2a30', x + 36, 16, 6, 3); }
  return c;
}

/* =========================== 1. BAY STREET =========================== */
function bayWindow(g, s, wx0, ww) {   // the shop's display window contents
  const y0 = 141, h = 44, k = s.kind;
  R(g, OUT, wx0 - 2, y0 - 2, ww + 4, h + 4); R(g, s.trimD, wx0 - 1, y0 - 1, ww + 2, h + 2);
  const pal = { bait: ['#0a1a24', '#1a5a7a', '#0e3a4a', '#081820'], hoito: ['#2a1a14', '#e8a860', '#b06a34', '#3a2016'], tattoo: ['#14081e', '#7a3ab0', '#4a2270', '#1a0a24'], bakery: ['#3a1a24', '#f0a8b8', '#c87080', '#3a1a20'], pawn: ['#1a160c', '#a08a40', '#6a5a2a', '#1a140a'], arcade: ['#06060e', '#1a1440', '#120e2a', '#06060e'] }[k];
  gradRows(g, wx0, y0, ww, h, pal);
  if (k === 'bait') {   // minnow tanks glowing, rods, a cardboard sign
    for (const tx of [wx0 + 4, wx0 + 34]) { R(g, OUT, tx - 1, y0 + 22, 28, 18); gradRows(g, tx, y0 + 23, 26, 16, ['#3ac8e8', '#1a7aa0', '#0e4a68']); for (let i = 0; i < 6; i++) R(g, '#c8f0ff', tx + 3 + (i * 7) % 22, y0 + 26 + (i * 5) % 10, 2, 1); for (let i = 0; i < 3; i++) R(g, '#e8f8ff', tx + 4 + i * 8, y0 + 34 - i * 3, 1, 1); }
    for (let i = 0; i < 4; i++) pxLine(g, '#1a1008', wx0 + ww - 30 + i * 6, y0 + 42, wx0 + ww - 22 + i * 7, y0 + 2, 1);
    R(g, '#c8a070', wx0 + 6, y0 + 4, 44, 11); R(g, OUT, wx0 + 6, y0 + 15, 44, 1); drawTxt(g, 'MINNOWS', wx0 + 8, y0 + 6, 1, '#3a1a0a');
  } else if (k === 'hoito') {   // the counter, diners, steaming coffee; PANCAKES on the glass
    R(g, '#5a2a14', wx0, y0 + 30, ww, 14); R(g, '#c8783a', wx0, y0 + 30, ww, 2); R(g, '#e8e0d0', wx0, y0 + 28, ww, 2);
    for (let i = 0; i < 5; i++) { const px = wx0 + 10 + i * 22; R(g, '#2a140c', px, y0 + 12, 9, 9); R(g, '#2a140c', px - 3, y0 + 20, 15, 10); R(g, '#e8e0d0', px + 11, y0 + 24, 4, 4); R(g, 'rgba(255,255,255,0.35)', px + 12, y0 + 19, 1, 3); }
    drawTxt(g, 'PANCAKES', wx0 + (ww - txtW('PANCAKES', 1) >> 1), y0 + 3, 1, '#fff6e0'); R(g, 'rgba(255,255,255,0.2)', wx0 + 2, y0 + 2, 2, 24);
  } else if (k === 'tattoo') {   // flash sheets on the wall, the chair
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { const fx = wx0 + 4 + i * 12, fy = y0 + 4 + r * 14; R(g, '#e8e0d0', fx, fy, 10, 12); R(g, ['#c02a2a', '#2a6ac0', '#2a8a4a', '#e0a020'][(i + r) % 4], fx + 2, fy + 2, 6, 5); R(g, OUT, fx + 3, fy + 8, 4, 2); }
    R(g, '#0a0410', wx0 + ww - 22, y0 + 26, 16, 6); R(g, '#0a0410', wx0 + ww - 18, y0 + 18, 4, 10); R(g, '#0a0410', wx0 + ww - 16, y0 + 32, 2, 12);
  } else if (k === 'bakery') {   // shelves of Persians (pink icing), a few loaves; the cat sits on the bottom shelf (live)
    for (let r = 0; r < 3; r++) { const sy = y0 + 12 + r * 13; R(g, '#5a2a30', wx0 + 2, sy, ww - 4, 2); for (let i = 0; i < (ww - 12) / 10; i++) { const px = wx0 + 5 + i * 10; if (r === 2 && i < 4) continue; R(g, OUT, px - 1, sy - 6, 9, 6); R(g, '#c8803a', px, sy - 5, 7, 5); R(g, '#ff8ac0', px, sy - 5, 7, 2); R(g, '#ffd0e4', px + 1, sy - 5, 3, 1); } }
  } else if (k === 'pawn') {   // guitars, a stack of TVs, security bars
    for (const gx of [wx0 + 8, wx0 + 24]) { R(g, '#3a1a08', gx + 2, y0 + 2, 2, 18); R(g, OUT, gx - 1, y0 + 18, 9, 14); R(g, gx & 16 ? '#a04a14' : '#c8a040', gx, y0 + 19, 7, 12); R(g, OUT, gx + 2, y0 + 23, 3, 3); }
    for (let i = 0; i < 3; i++) { const tx = wx0 + 44 + (i % 2) * 18, ty = y0 + 8 + (i >> 1) * 16; R(g, OUT, tx - 1, ty - 1, 18, 15); R(g, '#2a2a30', tx, ty, 16, 13); R(g, '#3a6aa0', tx + 2, ty + 2, 11, 8); }
    drawTxt(g, 'WE BUY GOLD', wx0 + 4, y0 + h - 9, 1, '#ffd23a');
    for (let x = wx0 + 3; x < wx0 + ww; x += 6) R(g, 'rgba(10,8,14,0.85)', x, y0, 1, h);
  } else if (k === 'arcade') {   // cabinets (screens are live)
    for (let i = 0; i < 4; i++) { const cx = wx0 + 4 + i * 24; R(g, OUT, cx - 1, y0 + 4, 20, 40); R(g, ['#2a1a4a', '#4a1a1a', '#1a3a2a', '#3a3a1a'][i], cx, y0 + 5, 18, 39); R(g, ['#c46aff', '#ff5a3a', '#7aff8a', '#ffd23a'][i], cx + 1, y0 + 6, 16, 4); R(g, OUT, cx + 2, y0 + 12, 14, 12); R(g, '#3a3a4a', cx + 1, y0 + 28, 16, 3); R(g, '#ff3a3a', cx + 4, y0 + 27, 2, 2); R(g, '#3a8aff', cx + 10, y0 + 28, 2, 1); }
  }
  R(g, 'rgba(255,255,255,0.16)', wx0 + 3, y0 + 3, 2, 18); R(g, 'rgba(255,255,255,0.1)', wx0 + 7, y0 + 3, 1, 10);   // glass glint
}
function bayShop(g, s) {
  const { x, w, roof } = s, B = s.brick;
  brickWall(g, x, roof, w, SWT - roof, B, s.sd);
  shadeV(g, x, roof, w, 100 - roof, 0.45, 0.06);   // upstairs falls off into the night
  R(g, OUT, x, roof, 1, SWT - roof); R(g, 'rgba(255,255,255,0.07)', x + 1, roof, 2, SWT - roof); R(g, 'rgba(0,0,0,0.38)', x + w - 3, roof, 3, SWT - roof);
  // cornice with dentils, snow on top, icicles
  R(g, OUT, x - 1, roof - 9, w + 2, 1); R(g, s.trim, x - 1, roof - 8, w + 2, 5); R(g, 'rgba(255,255,255,0.2)', x - 1, roof - 8, w + 2, 1); R(g, s.trimD, x, roof - 3, w, 3);
  for (let i = x + 2; i < x + w - 3; i += 6) R(g, s.trim, i, roof - 3, 3, 2); R(g, OUT, x, roof, w, 1);
  snowCap(g, x - 1, roof - 9, w + 2, 4);
  if (s.chim) { const cx = x + s.chim; brickWall(g, cx, roof - 30, 14, 21, B, 5, 6, 3); R(g, OUT, cx - 1, roof - 33, 16, 3); R(g, s.trim, cx - 1, roof - 33, 16, 2); snowCap(g, cx - 1, roof - 33, 16, 3); }
  if (s.dish) { const dx = x + s.dish; R(g, OUT, dx, roof - 22, 2, 13); disc(g, OUT, dx - 2, roof - 24, 7); disc(g, '#8a8a98', dx - 2, roof - 24, 6); disc(g, '#b8b8c8', dx - 4, roof - 26, 3); R(g, OUT, dx + 2, roof - 25, 4, 1); }
  // upper floors
  const nW = Math.max(1, Math.floor((w - 10) / 34)), gap = (w - nW * 20) / (nW + 1);
  for (let ty = 72, row = 0; ty >= roof + 12; ty -= 32, row++) for (let i = 0; i < nW; i++) {
    const wx0 = Math.round(x + gap + i * (20 + gap)), r = rnd(), lit = r < 0.42, kind = ['blinds', 'curtain', 'plant', 'person'][rnd() * 4 | 0];
    if (s.tv && row === s.tv[0] && i === s.tv[1]) { win(g, wx0, ty, 20, 24, { lit: false, kind: 'tv', st: s.stone }); s.tvAt = [wx0, ty]; }
    else win(g, wx0, ty, 20, 24, { lit, kind, st: s.stone, cc: ['#7a2a2a', '#2a4a7a', '#5a3a6a'][i % 3] });
  }
  if (s.date) { R(g, OUT, x + (w >> 1) - 14, roof + 3, 28, 11); R(g, s.stone, x + (w >> 1) - 13, roof + 4, 26, 9); drawTxt(g, s.date, x + (w >> 1) - (txtW(s.date, 1) >> 1), roof + 5, 1, '#4a4038'); }
  if (s.ghost) { g.globalAlpha = 0.3; drawTxt(g, s.ghost, x + (w - txtW(s.ghost, 2) >> 1), roof + 10, 2, '#d8d0c0'); g.globalAlpha = 1; for (let i = 0; i < 160; i++) R(g, B[1], x + 6 + rnd() * (w - 12) | 0, roof + 10 + rnd() * 14 | 0, 2, 1); }
  // sign board (the neon is live)
  R(g, OUT, x + 6, 101, w - 12, 26); R(g, '#120c16', x + 7, 102, w - 14, 24); R(g, '#241a2a', x + 7, 102, w - 14, 1); R(g, 'rgba(0,0,0,0.4)', x + 7, 125, w - 14, 1);
  for (const bx of [x + 9, x + w - 11]) { R(g, '#5a5a66', bx, 104, 2, 2); R(g, '#5a5a66', bx, 121, 2, 2); }
  snowCap(g, x + 6, 101, w - 12, 2);
  s.neon.forEach(n => NEON.push(n));
  // awning or a plain canopy
  if (s.awn) {
    R(g, OUT, x + 2, 127, w - 4, 1);
    for (let i = x + 3; i < x + w - 3; i++) { const st = ((i - x) >> 3) & 1, sc = (i - x) % 8; R(g, s.awn[st], i, 128, 1, 9); R(g, 'rgba(255,255,255,0.18)', i, 128, 1, 1); R(g, 'rgba(0,0,0,0.25)', i, 134, 1, 3); R(g, s.awn[st], i, 137, 1, sc > 1 && sc < 6 ? 3 : 1); R(g, OUT, i, sc > 1 && sc < 6 ? 140 : 138, 1, 1); }
    snowCap(g, x + 3, 128, w - 6, 3); R(g, 'rgba(0,0,0,0.45)', x + 3, 141, w - 6, 3);
  } else { R(g, OUT, x + 2, 127, w - 4, 6); R(g, s.trim, x + 3, 128, w - 6, 4); R(g, 'rgba(255,255,255,0.2)', x + 3, 128, w - 6, 1); snowCap(g, x + 3, 128, w - 6, 2); R(g, 'rgba(0,0,0,0.4)', x + 3, 133, w - 6, 3); }
  // storefront: display window + door + kick plate
  const ww = w - 54, wx0 = x + 8; bayWindow(g, s, wx0, ww);
  const dx = x + w - 40; R(g, OUT, dx - 2, 137, 32, 55); R(g, s.trimD, dx - 1, 138, 30, 54); R(g, s.door, dx + 1, 140, 26, 52); R(g, 'rgba(255,255,255,0.12)', dx + 1, 140, 1, 52);
  gradRows(g, dx + 4, 143, 20, 22, s.dpal || ['#3a2a30', '#c8905a', '#3a2a30']); R(g, OUT, dx + 4, 165, 20, 1); R(g, 'rgba(0,0,0,0.3)', dx + 4, 168, 20, 20);
  R(g, '#d8b46a', dx + 21, 170, 3, 2); R(g, '#a08040', dx + 21, 172, 3, 1); R(g, '#8a8a98', dx + 2, 186, 24, 3);
  R(g, OUT, x + 2, 186, w - 44, 1); R(g, s.trimD, x + 2, 187, w - 44, 5); R(g, 'rgba(255,255,255,0.12)', x + 2, 187, w - 44, 1);
  // warm light from the window onto the sidewalk
  glowAt(g, wx0 + ww / 2, 194, ww * 0.75, 14, s.spill || '255,190,120', 0.22);
}
function bayLamp(g, x) {   // ornate cast-iron post: base, fluted pole, arm, lantern (the glow is live)
  R(g, OUT, x - 4, 200, 9, 10); R(g, '#1c1a26', x - 3, 201, 7, 8); R(g, '#3a3848', x - 3, 201, 2, 8);
  R(g, OUT, x - 2, 104, 5, 97); R(g, '#16141e', x - 1, 104, 3, 97); R(g, '#34324a', x - 1, 104, 1, 97);
  for (const y of [140, 170]) { R(g, OUT, x - 3, y, 7, 3); R(g, '#3a3848', x - 2, y, 5, 1); }
  R(g, OUT, x - 6, 98, 13, 7); R(g, '#16141e', x - 5, 99, 11, 5); R(g, OUT, x - 5, 84, 11, 15); R(g, '#ffe9a8', x - 4, 86, 9, 11); R(g, '#fff9dc', x - 2, 88, 4, 6); R(g, OUT, x, 86, 1, 11);
  R(g, OUT, x - 7, 81, 15, 4); R(g, '#24222e', x - 6, 82, 13, 2); R(g, OUT, x - 1, 77, 3, 4); snowCap(g, x - 7, 81, 15, 2);
}
function buildBay() {
  seed = 4242; NEON.length = 0;
  const S = { id: 'bay', gy: 214, aur: 1, car: 1, crowdY: 136 };
  /* sky */
  let c = mk(W, H, true), g = c.g;
  gradRows(g, 0, 0, W, 200, ['#02030a', '#05071a', '#0a0d2c', '#131540', '#21184c', '#362058', '#542a5a', '#783a58', '#9a4c4c']);
  for (let i = 0; i < 160; i++) { const x = rnd() * W | 0, y = rnd() * 120 | 0, b = rnd(); R(g, b < 0.15 ? '#fff6c8' : b < 0.5 ? '#9aa6e8' : '#4a5090', x, y, 1, 1); if (b < 0.035) { R(g, '#6a74c0', x - 1, y, 3, 1); R(g, '#6a74c0', x, y - 1, 1, 3); R(g, '#ffffff', x, y, 1, 1); } }
  glowAt(g, 110, 62, 70, 70, '200,200,255', 0.16);
  disc(g, '#6a6a7a', 110, 62, 17); disc(g, '#fff3c4', 110, 62, 16); disc(g, '#e8d9a0', 114, 64, 13); disc(g, '#fff9dc', 107, 58, 10);
  for (const [dx, dy, r] of [[-5, -6, 2], [6, 5, 3], [2, -10, 1], [-8, 4, 2], [8, -3, 1]]) disc(g, '#d8c68a', 110 + dx, 62 + dy, r);
  S.sky = c;
  S.clouds = cloudStrip(720, 60, ['#4a4070', '#241e44', '#5a2e48'], 51); S.cloudY = 58;
  /* far: Lake Superior + the Sleeping Giant + a laker at anchor + the breakwater light */
  c = mk(560, 200, true); g = c.g;
  const HZ = 146, gp = [[0, 103], [40, 102], [70, 98], [100, 93], [130, 84], [160, 74], [185, 71], [205, 76], [235, 85], [262, 83], [290, 70], [320, 62], [360, 60], [400, 62], [425, 70], [440, 78], [452, 74], [462, 64], [474, 60], [486, 62], [494, 56], [500, 62], [512, 76], [530, 92], [560, 101], [640, 103]].map(([x, y]) => [x * 0.78 + 30, HZ - (103 - y) * 0.8]);
  g.fillStyle = '#171b40'; g.beginPath(); g.moveTo(0, HZ); for (const p of gp) g.lineTo(p[0], p[1]); g.lineTo(560, HZ); g.closePath(); g.fill();
  for (let i = 1; i < gp.length; i++) { const [x0, y0] = gp[i - 1], [x1, y1] = gp[i]; for (let x = Math.ceil(x0); x < x1; x++) { const y = Math.round(y0 + (y1 - y0) * (x - x0) / (x1 - x0)); if (y1 < y0 || dith(x, 0) < 0.5) R(g, '#2e3264', x, y, 1, 1); if (dith(x, 1) < 0.3) R(g, '#22264e', x, y + 1, 1, 2); } }
  for (let i = 0; i < 70; i++) { const x = 60 + rnd() * 440 | 0; R(g, '#12163a', x, HZ - 8 + rnd() * 7 | 0, 2 + rnd() * 6 | 0, 1); }   // treeline texture
  for (let y = HZ - 5; y < HZ; y++) { g.fillStyle = 'rgba(90,70,120,' + (0.06 * (y - HZ + 6)).toFixed(3) + ')'; g.fillRect(0, y, 560, 1); }   // mist on the water
  gradRows(g, 0, HZ, 560, 54, ['#161c42', '#0f1534', '#0a0f28', '#070a1c']);
  for (let i = 0; i < 110; i++) { const x = rnd() * 560 | 0, y = HZ + 2 + rnd() * 50 | 0; R(g, rnd() < 0.5 ? '#2a3466' : '#1e2850', x, y, 3 + rnd() * 12 | 0, 1); }
  for (let y = HZ + 1; y < 200; y += 2) { const ww = 5 + (y - HZ) * 0.45; R(g, y % 4 ? '#e8d9a0' : '#a89a70', 140 - ww / 2 + Math.sin(y * 1.3) * 3, y, ww * (0.35 + rnd() * 0.6), 1); }   // moon glitter
  { const lx = 380; R(g, OUT, lx - 34, HZ - 6, 70, 6); R(g, '#3a1414', lx - 33, HZ - 5, 68, 4); R(g, '#d8d8e0', lx + 22, HZ - 12, 12, 6); R(g, OUT, lx + 26, HZ - 16, 3, 4); for (let k = 0; k < 7; k++) R(g, '#ffe9a8', lx - 28 + k * 8, HZ - 7, 1, 1); R(g, '#ffe9a8', lx + 24, HZ - 10, 2, 1); R(g, '#ffe9a8', lx + 29, HZ - 10, 2, 1); }   // laker at anchor
  { const bx = 262; R(g, '#3a3a50', 200, HZ - 1, 90, 2); R(g, '#d8d8e0', bx, HZ - 12, 4, 11); R(g, '#c02a2a', bx, HZ - 8, 4, 2); R(g, OUT, bx - 1, HZ - 14, 6, 2); }   // breakwater lighthouse
  S.far = c;
  /* mid: the grain elevators on the waterfront, the rail line, a crane */
  c = mk(660, 200, true); g = c.g;
  const silo = (x, top, bot, n, sw, cols) => { for (let i = 0; i < n; i++) { const sx = x + i * sw; for (let k = 0; k < sw; k++) { const f = k / (sw - 1), ci = f < 0.15 ? 3 : f < 0.45 ? 1 : f < 0.75 ? 0 : f < 0.92 ? 2 : 3; R(g, cols[ci], sx + k, top, 1, bot - top); } R(g, cols[4], sx + 1, top - 2, sw - 2, 2); R(g, cols[1], sx + 2, top - 3, sw - 4, 1); for (let y = top + 8; y < bot; y += 12) R(g, 'rgba(0,0,0,0.18)', sx, y, sw, 1); } };
  const EC = ['#262c50', '#343c66', '#1a1e3a', '#10132a', '#2e3458'];
  silo(96, 98, 172, 15, 14, EC);
  [...'POOL 6'].forEach((ch, i) => { if (ch !== ' ') drawTxt(g, ch, 96 + (i + 2) * 14 + 2, 112, 2, 'rgba(200,200,220,0.28)'); });
  R(g, '#141834', 28, 36, 68, 136); R(g, '#222848', 28, 36, 3, 136); R(g, '#0c0f24', 90, 36, 6, 136); R(g, '#141834', 40, 20, 40, 18); R(g, '#222848', 40, 20, 40, 2); R(g, '#141834', 52, 10, 16, 12);   // headhouse
  for (let y = 46; y < 166; y += 14) for (let x = 34; x < 88; x += 10) if (rnd() < 0.18) R(g, '#e8b85a', x, y, 3, 4); else R(g, '#0a0c1e', x, y, 3, 4);
  R(g, '#141834', 96, 66, 220, 4); for (let x = 98; x < 314; x += 8) pxLine(g, '#141834', x, 70, x + 4, 76, 1); R(g, '#141834', 300, 66, 10, 30);   // gallery to the dock
  silo(430, 116, 172, 8, 12, ['#22284a', '#2e3660', '#181c36', '#0e1128', '#2a3054']); R(g, '#131733', 526, 62, 40, 110); R(g, '#202646', 526, 62, 2, 110); R(g, '#131733', 534, 50, 22, 14); for (let y = 72; y < 166; y += 14) if (rnd() < 0.3) R(g, '#e8b85a', 540, y, 3, 4);
  R(g, '#131733', 360, 34, 3, 138); R(g, '#131733', 330, 34, 64, 3); for (let k = 0; k < 9; k++) pxLine(g, '#131733', 330 + k * 7, 37, 334 + k * 7, 43, 1); R(g, '#131733', 386, 37, 2, 26);   // crane
  gradRows(g, 0, 172, 660, 6, ['#20223a', '#16182c']); R(g, '#3a3a50', 0, 177, 660, 1);   // rail embankment
  gradRows(g, 0, 178, 660, 22, ['#0c1230', '#0a0f28', '#080b20']);
  for (let i = 0; i < 40; i++) { const x = rnd() * 660 | 0; R(g, 'rgba(232,184,90,0.35)', x, 180 + rnd() * 18 | 0, 4 + rnd() * 8 | 0, 1); }
  S.mid = c; S.train = trainSprite();
  S.layers = [{ img: S.far, par: 0.08, y: 0 }, { img: S.mid, par: 0.25, y: 0 }];
  S.back = bayBack;

  /* near: Bay Street */
  c = mk(NW, H, true); g = c.g;
  const SH = [
    { x: 0, w: 160, roof: 60, brick: ['#2a1416', '#4a2422', '#5e302c', '#341a18'], trim: '#6a4a40', trimD: '#2a1614', stone: '#8a7a6a', door: '#2a3a3a', kind: 'bait', chim: 120, neon: [{ txt: 'LIVE BAIT', col: '#57e0ff', s: 2 }], sd: 1 },
    { x: 160, w: 200, roof: 26, brick: ['#2a2232', '#3a3048', '#4a3e5a', '#2a2238'], trim: '#5a5070', trimD: '#1e1828', stone: '#9a90a0', door: '#5a1a1a', kind: 'hoito', awn: ['#a01818', '#e8e0d0'], date: '1910', dish: 170, tv: [0, 4], neon: [{ txt: 'THE HOITO', col: '#ff3a3a', s: 2 }], sd: 2, spill: '255,180,110' },
    { x: 396, w: 104, roof: 54, brick: ['#241620', '#3a2432', '#4a2e40', '#2a1826'], trim: '#5a3a50', trimD: '#1a0e18', stone: '#7a6a7a', door: '#1a1424', kind: 'tattoo', neon: [{ txt: 'TATTOO', col: '#c46aff', s: 2 }], sd: 3, spill: '200,140,255' },
    { x: 730, w: 180, roof: 58, brick: ['#2e2014', '#4a3420', '#5e4430', '#3a2818'], trim: '#7a5a3a', trimD: '#2a1a10', stone: '#a08a6a', door: '#3a1a24', kind: 'bakery', awn: ['#c0306a', '#f0d8e0'], chim: 30, neon: [{ txt: 'PERSIANS 24HR', col: '#ff8ac0', s: 2 }, { txt: 'OPEN', col: '#ff3a3a', s: 1, dx: -44, y: 146, ph: 120 }], sd: 4, spill: '255,170,190', dpal: ['#3a2a30', '#f0b0c0', '#3a2a30'] },
    { x: 910, w: 130, roof: 14, brick: ['#161a24', '#262e3c', '#323a4a', '#1c222e'], trim: '#4a5262', trimD: '#10141c', stone: '#7a8290', door: '#20242e', kind: 'pawn', ghost: 'HARDWARE', tv: [1, 0], neon: [{ txt: 'LOANS', col: '#ffd23a', s: 2, ph: 300 }], sd: 5, spill: '255,220,120' },
    { x: 1040, w: 160, roof: 48, brick: ['#22142a', '#36203e', '#462a4e', '#2a1832'], trim: '#5a3a62', trimD: '#160a1a', stone: '#7a6a80', door: '#14101e', kind: 'arcade', awn: ['#1a6a3a', '#d0f0d8'], dish: 120, neon: [{ txt: 'ARCADE', col: '#7aff8a', s: 2 }], sd: 6, spill: '120,255,160' }
  ];
  for (const s of SH) { s.neon.forEach((n, i) => { n.x = s.x + s.w / 2 + (n.dx || 0); n.y = n.y || 99; n.ph = n.ph != null ? n.ph : NEON.length * 53 + i * 97; }); if (s.kind === 'bakery') { s.neon[1].x = s.x + 8 + 40; s.neon[1].y = 150; } bayShop(g, s); if (s.tvAt) S.tv = (S.tv || []).concat([s.tvAt]); }
  NEON.push({ x: 1022, y: 22, txt: 'PAWN', col: '#ffd23a', s: 2, vert: 1, dodgy: 1, ph: 0 });   // the blade sign (temperamental)
  R(g, OUT, 1008, 60, 30, 3); R(g, '#3a3a48', 1008, 60, 30, 1); R(g, OUT, 1034, 26, 3, 74);
  // the alley between The Hoito and Tattoo: dark recess, fire escape, a dumpster, steam
  R(g, '#08070e', 360, 30, 36, 162); brickWall(g, 362, 30, 32, 162, ['#0a080e', '#16121c', '#1c1824', '#100c14'], 9); shadeV(g, 362, 30, 32, 162, 0.55, 0.2);
  R(g, 'rgba(0,0,0,0.55)', 360, 30, 6, 162); R(g, 'rgba(0,0,0,0.4)', 390, 30, 6, 162);
  for (const py of [70, 110, 150]) { R(g, '#1a1822', 364, py, 28, 2); R(g, '#2a2834', 364, py, 28, 1); for (let x = 364; x < 392; x += 4) R(g, '#1a1822', x, py - 9, 1, 9); R(g, '#1a1822', 364, py - 10, 28, 1); snowCap(g, 364, py, 28, 2); }
  for (const [a, b] of [[70, 110], [110, 150]]) pxLine(g, '#1a1822', 366, b, 388, a + 2, 1);
  R(g, OUT, 364, 166, 30, 26); R(g, '#1e3a2a', 365, 167, 28, 24); R(g, '#2a5038', 365, 167, 28, 2); R(g, '#16301e', 365, 175, 28, 1); snowCap(g, 364, 166, 30, 3);
  // the Marina Park lookout (500-730): railing + retaining wall; the lake, the Giant and the elevators show through
  { const L0 = 500, L1 = 730;
    R(g, OUT, L0, 173, L1 - L0, 1); gradRows(g, L0, 174, L1 - L0, 18, ['#5a5a6a', '#46465a', '#34344a']); R(g, '#7a7a8a', L0, 174, L1 - L0, 1);
    for (let x = L0 + 20; x < L1; x += 34) R(g, '#2a2a3a', x, 175, 1, 17); for (let i = 0; i < 140; i++) R(g, 'rgba(0,0,0,0.25)', L0 + rnd() * (L1 - L0) | 0, 176 + rnd() * 15 | 0, 1, 1);
    snowCap(g, L0, 174, L1 - L0, 4);
    R(g, OUT, L0, 152, L1 - L0, 3); R(g, '#2a2a38', L0, 152, L1 - L0, 1); R(g, OUT, L0, 162, L1 - L0, 1);
    for (let x = L0 + 2; x < L1; x += 8) R(g, OUT, x, 152, 1, 21);
    for (let x = L0 + 2; x < L1; x += 40) { R(g, OUT, x - 1, 148, 4, 26); R(g, '#3a3a4a', x, 149, 1, 24); R(g, OUT, x - 1, 146, 4, 3); }
    snowCap(g, L0, 152, L1 - L0, 2);
    const mx = 628; R(g, OUT, mx + 4, 140, 3, 34); R(g, OUT, mx + 64, 140, 3, 34); R(g, OUT, mx - 1, 128, 74, 14); R(g, '#1a3a6a', mx, 129, 72, 12); R(g, '#c8c8d0', mx, 129, 72, 1); drawTxt(g, 'MARINA PARK', mx + 4, 132, 1, '#e8e8f0'); snowCap(g, mx - 1, 128, 74, 2);
    R(g, 'rgba(0,0,0,0.38)', L0, 30, 6, 143); R(g, 'rgba(0,0,0,0.38)', L1 - 6, 30, 6, 143); }
  // lamp posts
  S.lampX = [158, 560, 908]; for (const x of S.lampX) bayLamp(g, x);
  // sidewalk + curb
  gradRows(g, 0, SWT, NW, 18, ['#5e5c6a', '#504e5c', '#42404e', '#36343f']);
  for (let x = 0; x < NW; x += 40) pxLine(g, '#2c2a36', x, SWT, x - 6, 209, 1);
  R(g, 'rgba(0,0,0,0.25)', 0, SWT, NW, 2);
  for (let i = 0; i < 520; i++) R(g, rnd() < 0.7 ? '#c8d4e4' : '#8a8a9a', rnd() * NW | 0, SWT + 2 + rnd() * 16 | 0, 1, 1);
  R(g, '#a8a4b4', 0, 210, NW, 1); gradRows(g, 0, 211, NW, 3, ['#6a6676', '#4a4656']);
  for (let x = 0; x < NW; x += 2) {   // snowbanks along the curb, cleared at the lamps and a crosswalk
    if (S.lampX.some(l => Math.abs(x - l) < 10) || (x > 600 && x < 660)) continue; if (Math.sin(x * 0.011 + 0.5) < -0.55) continue;
    const hh = 3 + Math.sin(x * 0.05) * 2 + Math.sin(x * 0.17) * 1.5 + rnd() * 1.5 | 0; R(g, OUT, x, 211 - hh - 1, 2, 1); R(g, '#d8e2f2', x, 211 - hh, 2, hh + 1); if (dith(x, hh) < 0.35) R(g, '#ffffff', x, 211 - hh, 2, 1); R(g, '#9aa8c4', x, 210, 2, 1); if (dith(x, 3) < 0.25) R(g, '#7a7488', x, 211 - (hh >> 1), 2, 1);
  }
  // wet road: the street reflected (rippled, fading), asphalt, lane paint, a crosswalk, puddles, a manhole
  const facade = mk(NW, 92); facade.g.drawImage(c, 0, 100, NW, 92, 0, 0, NW, 92);
  gradRows(g, 0, 214, NW, H - 214, ['#1e1c28', '#17151f', '#110f18', '#0c0a12']);
  for (let r = 0; r < H - 214; r++) { const sy = 91 - Math.floor(r * 1.7); if (sy < 0) break; g.globalAlpha = 0.36 * (1 - r / (H - 214)); g.drawImage(facade, 0, sy, NW, 1, Math.round(Math.sin(r * 1.7) * 1.5), 214 + r, NW, 1); }
  g.globalAlpha = 1;
  for (let i = 0; i < 1400; i++) R(g, rnd() < 0.5 ? '#2a2834' : '#0a0810', rnd() * NW | 0, 215 + rnd() * 55 | 0, 1, 1);
  for (let x = 4; x < NW; x += 64) { R(g, '#6a5e30', x, 240, 32, 2); R(g, '#b8a048', x + 2, 240, 28, 1); }
  for (let k = 0; k < 7; k++) { const y = 216 + k * 8, sk = Math.round(k * 1.2); R(g, 'rgba(220,220,230,0.32)', 606 - sk, y, 48 + sk * 2, 3); }
  for (const [cx, cy, rx, ry] of [[90, 232, 40, 4], [330, 258, 56, 5], [760, 230, 34, 3], [930, 262, 60, 5], [1120, 236, 40, 4]]) for (let r = -ry; r <= ry; r++) {
    const hw = Math.round(rx * Math.sqrt(1 - (r / (ry + 0.5)) ** 2)), y = cy + r, sy = Math.round(91 - (y - 214) * 1.7); if (hw < 2) continue;
    R(g, '#0a0c1a', cx - hw, y, hw * 2, 1); if (sy >= 0) { g.globalAlpha = 0.7; g.drawImage(facade, cx - hw, sy, hw * 2, 1, cx - hw + Math.round(Math.sin(y * 1.7)), y, hw * 2, 1); g.globalAlpha = 1; } R(g, 'rgba(70,90,170,0.16)', cx - hw, y, hw * 2, 1);
  }
  { const mx = 470, my = 248; g.fillStyle = OUT; g.beginPath(); g.ellipse(mx, my, 20, 5, 0, 0, 7); g.fill(); g.fillStyle = '#2a2832'; g.beginPath(); g.ellipse(mx, my, 18, 4, 0, 0, 7); g.fill(); for (let x = mx - 14; x < mx + 14; x += 5) R(g, OUT, x, my - 1, 3, 2); R(g, '#4a4854', mx - 16, my - 4, 32, 1); }
  S.near = c;
  S.neon = NEON.slice(); neonSprites(S.neon);
  S.lamps = S.lampX.map(x => ({ x, y: 92, cone: 1, pool: 232 }));
  S.vents = [[378, 176, 6], [470, 246, 7]];
  /* crowd along the sidewalk + leaning on the lookout rail */
  const PPL = [];
  for (let x = 8; x < NW - 20; x += 13 + rnd() * 18) { if (S.lampX.some(l => Math.abs(x + 10 - l) < 16) || (x > 352 && x < 392)) continue; PPL.push(makePerson(x, 38 + rnd() * 18)); }
  S.crowd = crowdFrames(PPL, 70);
  /* foreground strip (parallax 1.3x): the near snowbank lip, a hydrant cap, a parking meter head */
  c = mk(BG.fgW, 20, true); g = c.g;
  for (let x = 0; x < BG.fgW; x += 2) { if (Math.sin(x * 0.009 + 1) < -0.5) continue; const hh = 4 + Math.sin(x * 0.031) * 2.5 + Math.sin(x * 0.11) * 1.2 + (rnd() * 1.5 | 0) | 0; R(g, OUT, x, 20 - hh - 1, 2, 1); R(g, '#cdd8ea', x, 20 - hh, 2, hh); R(g, '#f2f6ff', x, 20 - hh, 2, 1); if (dith(x, hh) < 0.35) R(g, '#9aa8c4', x, 20 - hh + 2, 2, 1); }
  for (const hx of [430, 1150]) { R(g, OUT, hx - 1, 5, 14, 15); R(g, '#c02a1a', hx, 6, 12, 14); R(g, '#e85a3a', hx + 1, 6, 3, 14); R(g, OUT, hx - 3, 10, 18, 4); R(g, '#a01a10', hx - 2, 11, 16, 2); R(g, OUT, hx + 3, 2, 6, 4); R(g, '#c02a1a', hx + 4, 3, 4, 2); R(g, '#e8eef8', hx, 4, 12, 2); }
  for (const mx of [160, 860]) { R(g, OUT, mx - 1, 3, 12, 10); R(g, '#4a5060', mx, 4, 10, 8); R(g, '#9aa8b8', mx + 2, 5, 6, 3); R(g, '#ff3a3a', mx + 3, 9, 2, 1); R(g, OUT, mx + 3, 13, 4, 7); R(g, '#3a3e48', mx + 4, 13, 2, 7); R(g, '#e8eef8', mx, 2, 10, 2); }
  S.fg = c;
  S.live = bayLive;
  return S;
}
function bayBack(g, T, tick, lv, S) {   // things that live on the back layers: the lighthouse, elevator beacons, the grain train
  const fx = Math.round(-T * 0.08), mx = Math.round(-T * 0.25);
  if ((tick % 150) < 70) { R(g, '#fff6c8', fx + 262, 132, 4, 2); if (lv > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5; g.drawImage(BG.glow, fx + 264 - 20, 133 - 20, 40, 40); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } }
  const bl = (tick % 90) < 45; for (const [bx, by] of [[59, 8], [360, 32], [544, 48]]) { R(g, bl ? '#ff3a3a' : '#5a1414', mx + bx, by, 2, 2); if (bl && lv > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.45; g.drawImage(BG.glow, mx + bx - 9, by - 9, 20, 20); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } }
  const cyc = tick % 3000; if (cyc < 1500) {   // the grain train rolls along the waterfront every ~50 s
    const tx = mx + 700 - cyc * 0.95;
    g.drawImage(S.train, Math.round(tx), 158);
    if (lv > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.6; g.drawImage(BG.head, Math.round(tx) - 150, 150, 160, 30); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    R(g, '#fff6dc', Math.round(tx) + 1, 162, 2, 2);
  }
}
function catSit(g, cx, cy, tick, alert) {   // a black cat, sitting: tail swish, blinks, ears up + puffed at a KO
  const k = '#0e0a12', up = alert ? 2 : 0;
  R(g, k, cx, cy - 8 - up, 11, 8 + up); R(g, k, cx + 1, cy - 10 - up, 9, 2); R(g, k, cx + 1, cy - 1, 3, 1); R(g, k, cx + 7, cy - 1, 3, 1);
  R(g, k, cx - 4, cy - 15 - up, 8, 7); R(g, k, cx - 4, cy - 17 - up, 2, 2); R(g, k, cx + 2, cy - 17 - up, 2, 2);
  if ((tick % 260) >= 8) { R(g, '#c8ff6a', cx - 3, cy - 13 - up, 1, 1); R(g, '#c8ff6a', cx + 1, cy - 13 - up, 1, 1); }
  const sw = Math.sin(tick * (alert ? 0.4 : 0.05));
  for (let s = 0; s < 8; s++) { const a = (alert ? -1.4 : -0.3) + sw * 0.1 * s; R(g, k, Math.round(cx + 10 + Math.cos(a) * s * 1.5), Math.round(cy - 2 - up + Math.sin(a) * s * 1.6 - (alert ? s * 0.6 : 0)), 2, 2); }
}
function stageCheer() { return G && ((G.phase === 'roundEnd' && G.koX != null) || G.phase === 'matchEnd'); }
function tvFlicker(g, nx, tick, S) { if (!S.tv) return; g.globalCompositeOperation = 'lighter'; for (const [x, y] of S.tv) { const a = 0.18 + 0.14 * Math.sin(tick * 0.31 + x) * Math.sin(tick * 0.07 + y) + ((tick >> 3) % 7 === 0 ? 0.15 : 0); g.fillStyle = 'rgba(90,140,255,' + Math.max(0.05, a).toFixed(3) + ')'; g.fillRect(x + nx, y, 20, 24); } g.globalCompositeOperation = 'source-over'; }
function bayLive(g, nx, tick, lv, S) {
  // the cat in the Persians window
  const cx = 738 + 8 + 6 + nx; if (cx > -20 && cx < W + 20) catSit(g, cx, 182, tick, stageCheer());
  // arcade cabinet screens
  for (let i = 0; i < 4; i++) { const x = 1040 + 8 + 4 + i * 24 + 2 + nx; if (x < -20 || x > W) continue; const ph = (tick >> 3) + i * 5; g.fillStyle = ['#12306a', '#5a1430', '#145a34', '#5a4a10', '#3a1a5a'][ph % 5]; g.fillRect(x, 153, 14, 12); g.fillStyle = ['#5a8aff', '#ff5a8a', '#5aff9a', '#ffe05a', '#d08aff'][(ph + 2) % 5]; g.fillRect(x + 1 + (ph * 3) % 10, 156 + (ph % 3) * 2, 3, 3); g.fillRect(x + 2, 162, 10, 1); g.fillStyle = 'rgba(0,0,0,0.35)'; for (let k = 0; k < 12; k += 2) g.fillRect(x, 153 + k, 14, 1); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + 1, 154, 2, 1); }
  if (lv > 0) tvFlicker(g, nx, tick, S);
}

/* ========================= 2. MAY STREET ALLEY ========================= */
function keg(g, x, y) {   // generic steel keg, 20 x 28 (no branding)
  const cols = ['#30363e', '#4a5058', '#6a727c', '#9aa2ac', '#c8d0d8', '#9aa2ac', '#6a727c', '#4a5058', '#3a4048', '#30363e'];
  for (let i = 0; i < 20; i++) R(g, cols[Math.min(9, i >> 1)], x + i, y + 2, 1, 24);
  R(g, OUT, x - 1, y + 1, 22, 1); R(g, OUT, x - 1, y + 26, 22, 2); R(g, OUT, x - 1, y + 1, 1, 27); R(g, OUT, x + 20, y + 1, 1, 27);
  for (const ry of [y + 4, y + 13, y + 22]) { R(g, '#2a3038', x, ry, 20, 1); R(g, '#dfe6ee', x + 7, ry + 1, 3, 1); }
  R(g, '#5a626c', x + 1, y, 18, 2); R(g, '#9aa2ac', x + 6, y, 8, 1); R(g, OUT, x + 8, y - 2, 4, 2); snowCap(g, x, y, 20, 2);
}
function crate(g, x, y, c, d) {   // stackable plastic crate, 22 x 15
  R(g, OUT, x - 1, y - 1, 24, 17); R(g, c, x, y, 22, 15); R(g, d, x, y + 12, 22, 3);
  for (let k = 0; k < 5; k++) R(g, d, x + 2 + k * 4, y + 3, 2, 7); R(g, 'rgba(255,255,255,0.2)', x, y, 22, 1); R(g, OUT, x + 7, y + 1, 8, 2);
}
function dumpster(g, x, y, col, w, h) {   // top-left at (x, y)
  const [c0, c1, c2] = col;
  R(g, OUT, x - 1, y + 3, w + 2, h - 5); R(g, c1, x, y + 4, w, h - 7);
  for (let i = 0; i < w; i += 9) { R(g, c2, x + i + 2, y + 9, 2, h - 15); R(g, c0, x + i + 4, y + 9, 1, h - 15); }
  R(g, c2, x, y + 4, w, 3); R(g, c0, x, y + h - 5, w, 2); R(g, 'rgba(0,0,0,0.3)', x + w - 4, y + 4, 4, h - 7);
  R(g, OUT, x - 3, y - 1, w + 6, 6); R(g, '#1a1a22', x - 2, y, w + 4, 4); R(g, '#34344a', x - 2, y, w + 4, 1);
  snowCap(g, x - 2, y - 1, w + 4, 3);
  for (const wx of [x + 6, x + w - 13]) { R(g, OUT, wx, y + h - 3, 8, 4); R(g, '#3a3a44', wx + 2, y + h - 2, 4, 2); }
  R(g, OUT, x + (w >> 1) - 10, y + 16, 20, 8); R(g, '#d8d0c0', x + (w >> 1) - 9, y + 17, 18, 6); R(g, OUT, x + (w >> 1) - 7, y + 18, 13, 1); R(g, OUT, x + (w >> 1) - 7, y + 21, 9, 1);
}
function bag(g, x, y, r) { disc(g, OUT, x, y, r + 1); disc(g, '#121218', x, y, r); disc(g, '#24242e', x - (r >> 2), y - (r >> 2), r >> 1); R(g, '#5a5a6a', x - (r >> 1), y - (r >> 1), 2, 1); R(g, OUT, x - 1, y - r - 3, 3, 4); }
function buildAlley() {
  seed = 777;
  const S = { id: 'alley', gy: 202, aur: 0.45, crowdY: 134 };
  /* sky: sodium haze over Fort William, a few stars, low cloud */
  let c = mk(W, H, true), g = c.g;
  gradRows(g, 0, 0, W, 200, ['#04040c', '#08081a', '#11122a', '#201a36', '#382236', '#583030', '#7a4228', '#8a4a24']);
  for (let i = 0; i < 70; i++) { const x = rnd() * W | 0, y = rnd() * 80 | 0, b = rnd(); R(g, b < 0.2 ? '#fff6c8' : '#7a80c0', x, y, 1, 1); }
  S.sky = c; S.clouds = cloudStrip(720, 50, ['#4a3248', '#2a1c30', '#6a3a30'], 91); S.cloudY = 20;
  /* far: Mount McKay's mesa + the elevators, faint through the haze */
  c = mk(560, 200, true); g = c.g;
  g.fillStyle = '#1a1428'; g.beginPath(); g.moveTo(0, 200); for (const [x, y] of [[0, 92], [30, 86], [70, 62], [92, 50], [190, 47], [214, 54], [240, 76], [290, 92], [330, 98], [560, 102]]) g.lineTo(x, y); g.lineTo(560, 200); g.fill();
  for (let x = 70; x < 240; x++) if (dith(x, 0) < 0.5) R(g, '#2e2238', x, Math.round(x < 92 ? 62 - (x - 70) * 0.55 : x < 190 ? 50 - (x - 92) * 0.03 : 47 + (x - 190) * 0.6), 1, 1);
  for (let i = 0; i < 8; i++) R(g, '#ff5a3a', 120 + i * 9, 49, 1, 1);   // the lookout's lights
  const EL = (x0, n, top, col, hi) => { for (let i = 0; i < n; i++) { const x = x0 + i * 11; R(g, col, x, top + 22, 10, 200); R(g, hi, x + 2, top + 22, 2, 200); R(g, hi, x, top + 21, 10, 1); } R(g, col, x0 - 10, top, 32, 24); R(g, hi, x0 - 10, top, 32, 1); R(g, col, x0, top - 10, 12, 11); for (let i = 0; i < 4; i++) R(g, '#7a5a3a', x0 - 6 + i * 7, top + 9, 2, 3); };
  EL(360, 9, 52, '#1c1830', '#2c2440'); EL(480, 6, 64, '#1a162c', '#28223a');
  for (let y = 80; y < 200; y++) { g.fillStyle = 'rgba(122,66,40,' + Math.min(0.5, 0.004 * (y - 80)).toFixed(3) + ')'; g.fillRect(0, y, 560, 1); }
  S.far = c;
  /* mid: the rooftops beyond the tavern: chimneys, a steeple, a water tank, an antenna */
  c = mk(660, 200, true); g = c.g;
  for (const [x, w, top] of [[0, 92, 62], [96, 60, 52], [160, 120, 70], [284, 72, 58], [360, 110, 74], [474, 84, 60], [562, 96, 68]]) {
    R(g, '#0d0b18', x, top, w, 200 - top); R(g, '#1e1a2c', x, top, w, 1); snowCap(g, x, top, w, 2);
    for (let yy = top + 6; yy < 196; yy += 9) for (let xx = x + 5; xx < x + w - 5; xx += 9) if (rnd() < 0.12) R(g, rnd() < 0.8 ? '#c8904a' : '#7fb0d0', xx, yy, 3, 4);
    if (rnd() < 0.8) { const cx = x + 6 + rnd() * (w - 18) | 0; R(g, '#0d0b18', cx, top - 11, 8, 11); R(g, '#1e1a2c', cx, top - 11, 8, 1); }
  }
  R(g, '#0d0b18', 300, 20, 14, 40); g.fillStyle = '#0d0b18'; g.beginPath(); g.moveTo(298, 22); g.lineTo(307, -2); g.lineTo(316, 22); g.fill(); R(g, '#c8904a', 305, 34, 4, 6);   // steeple
  R(g, '#0d0b18', 150, 18, 3, 36); R(g, '#0d0b18', 143, 28, 17, 1); R(g, '#0d0b18', 145, 38, 13, 1);   // antenna
  R(g, '#0d0b18', 500, 32, 34, 22); R(g, '#1e1a2c', 500, 32, 34, 1); g.fillStyle = '#0d0b18'; g.beginPath(); g.moveTo(498, 32); g.lineTo(517, 21); g.lineTo(536, 32); g.fill(); for (const lx of [503, 516, 529]) R(g, '#0d0b18', lx, 54, 2, 8); snowCap(g, 500, 32, 34, 2);   // water tank
  S.mid = c;
  S.layers = [{ img: S.far, par: 0.08, y: 0 }, { img: S.mid, par: 0.25, y: 0 }];
  S.back = (g, T, tick, lv) => { const mx = Math.round(-T * 0.25), bl = (tick % 100) < 50; R(g, bl ? '#ff3a3a' : '#5a1414', mx + 150, 16, 3, 2); if (bl && lv > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5; g.drawImage(BG.glow, mx + 141, 7, 20, 20); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } };

  /* near: the alley */
  c = mk(NW, H, true); g = c.g;
  // A: four-storey brick with the fire escape (0-300)
  brickWall(g, 0, 14, 300, 186, ['#1a0e10', '#3a1c1a', '#4a2622', '#2a1412'], 3); shadeV(g, 0, 14, 300, 120, 0.4, 0.05);
  R(g, OUT, 0, 5, 302, 1); R(g, '#4a2622', 0, 6, 302, 6); R(g, 'rgba(255,255,255,0.15)', 0, 6, 302, 1); R(g, '#2a1412', 0, 12, 300, 2); snowCap(g, 0, 5, 302, 4);
  R(g, 'rgba(0,0,0,0.45)', 296, 14, 4, 186);
  for (const wy of [24, 74, 122]) for (const wx of [36, 104, 172, 240]) win(g, wx, wy, 22, 28, { lit: rnd() < 0.35, kind: ['blinds', 'curtain', 'plant'][rnd() * 3 | 0], st: '#6a4a40' });
  const FE = '#0e0c14', FEH = '#36323e';
  for (const py of [62, 112, 160]) {
    if (py === 160) break;
    R(g, FE, 24, py, 252, 3); R(g, FEH, 24, py, 252, 1); snowCap(g, 24, py, 252, 2);
    R(g, FE, 24, py - 18, 252, 2); R(g, FEH, 24, py - 18, 252, 1); for (let x = 24; x < 277; x += 5) R(g, FE, x, py - 16, 1, 16);
    for (const bx of [30, 270]) pxLine(g, FE, bx, py + 3, bx + (bx < 100 ? 12 : -12), py + 18, 2);
  }
  pxLine(g, FE, 80, 110, 200, 64, 2); pxLine(g, FE, 86, 112, 206, 66, 1); for (let k = 0; k < 16; k++) R(g, FEH, 84 + k * 7, Math.round(107 - k * 2.9), 6, 1); pxLine(g, FEH, 80, 94, 200, 48, 1);
  R(g, FE, 236, 115, 2, 50); R(g, FE, 250, 115, 2, 50); for (let y = 118; y < 164; y += 5) R(g, FEH, 236, y, 16, 1);
  R(g, OUT, 56, 146, 34, 54); R(g, '#2a2e36', 57, 147, 32, 53); R(g, '#3a3e48', 57, 147, 32, 1); for (let y = 152; y < 198; y += 11) R(g, 'rgba(0,0,0,0.25)', 59, y, 28, 1); R(g, '#8a8a98', 82, 172, 3, 4); R(g, OUT, 54, 144, 38, 2);   // steel door
  R(g, OUT, 64, 130, 18, 9); R(g, '#3a3a44', 65, 131, 16, 7); R(g, '#fff6c8', 67, 136, 12, 2);   // wall-pack light
  R(g, OUT, 120, 150, 64, 12); R(g, '#e8e8e8', 121, 151, 62, 10); drawTxt(g, 'NO PARKING', 123, 153, 1, '#c01818');
  for (let i = 0; i < 3; i++) { const mx = 196 + i * 16; R(g, OUT, mx, 158, 12, 18); R(g, '#5a6068', mx + 1, 159, 10, 16); disc(g, '#c8d0d8', mx + 6, 165, 3); R(g, OUT, mx + 6, 163, 1, 3); }
  pxLine(g, '#1a1a22', 196, 158, 196, 140, 2); R(g, '#1a1a22', 196, 140, 48, 2);
  // B: the tavern's back wall (300-880), two storeys
  brickWall(g, 300, 78, 580, 122, ['#1e1416', '#4a2a22', '#5a3628', '#341c18'], 7); shadeV(g, 300, 78, 580, 50, 0.35, 0.0);
  R(g, OUT, 298, 70, 584, 1); R(g, '#2a2a34', 298, 71, 584, 6); R(g, '#4a4a58', 298, 71, 584, 1); R(g, OUT, 298, 77, 584, 1); snowCap(g, 298, 70, 584, 4);
  R(g, OUT, 300, 78, 2, 122); R(g, OUT, 878, 78, 2, 122);
  S.tv = [];
  for (const wx of [330, 400, 760, 830]) { if (wx === 400) { win(g, wx, 86, 20, 24, { lit: false, kind: 'tv', st: '#6a4a3a' }); S.tv.push([wx, 86]); } else win(g, wx, 86, 20, 24, { lit: wx === 760, kind: 'blinds', st: '#6a4a3a' }); }
  R(g, OUT, 472, 112, 236, 30); R(g, '#16101a', 473, 113, 234, 28); R(g, '#281c2c', 473, 113, 234, 1); for (const bx of [478, 700]) { R(g, '#5a5a66', bx, 116, 2, 2); R(g, '#5a5a66', bx, 136, 2, 2); } snowCap(g, 472, 112, 236, 2);
  // the back door: ajar, warm light, silhouettes; the caged bulb above (live); a stoop
  R(g, OUT, 562, 144, 56, 58); R(g, '#3a2a22', 563, 145, 54, 56);
  gradRows(g, 566, 148, 48, 50, ['#ffd890', '#f0a050', '#c8703a', '#7a3a24']);
  for (const [px, ph] of [[574, 30], [596, 34]]) { R(g, 'rgba(40,16,8,0.8)', px, 198 - ph, 9, 9); R(g, 'rgba(40,16,8,0.8)', px - 4, 198 - ph + 9, 17, ph - 9); }
  R(g, OUT, 566, 148, 3, 50); R(g, '#4a2a1e', 602, 148, 14, 50); R(g, '#6a3a26', 602, 148, 2, 50); R(g, '#c8a070', 604, 172, 2, 3);
  R(g, OUT, 556, 198, 68, 5); R(g, '#4a4854', 557, 198, 66, 4); R(g, '#6a6874', 557, 198, 66, 1);
  R(g, OUT, 584, 139, 13, 4);
  // AC unit, drain pipe, gas meter, a pallet
  R(g, OUT, 668, 92, 34, 22); R(g, '#6a7078', 669, 93, 32, 20); for (let k = 0; k < 6; k++) R(g, '#4a5058', 671 + k * 5, 95, 3, 16); R(g, '#8a929c', 669, 93, 32, 1); snowCap(g, 668, 92, 34, 3); R(g, OUT, 676, 114, 2, 8);
  R(g, OUT, 726, 70, 5, 130); R(g, '#3a4048', 727, 70, 3, 128); R(g, '#5a626c', 727, 70, 1, 128); R(g, OUT, 724, 194, 12, 4); R(g, '#3a4048', 725, 195, 10, 2);
  for (const [x, y, w, h] of [[870, 170, 6, 30]]) R(g, OUT, x, y, w, h);
  for (let k = 0; k < 5; k++) { R(g, OUT, 844, 150 + k * 10, 30, 7); R(g, k & 1 ? '#3a2a1a' : '#5a4228', 845, 151 + k * 10, 28, 5); } R(g, OUT, 846, 148, 4, 52); R(g, OUT, 866, 148, 4, 52);
  // C: chain-link fence (880-960) over a dark lot
  { R(g, '#1a1820', 880, 196, 80, 6);
    for (let x = 880; x < 960; x++) for (let y = 118; y < 198; y++) { const a = (x + y) % 6 === 0, b = (x - y + 600) % 6 === 0; if (a || b) R(g, (a && b) ? '#7a7a8a' : '#4a4a5a', x, y, 1, 1); }
    for (const px of [882, 920, 958]) { R(g, OUT, px - 1, 112, 4, 90); R(g, '#5a5a6a', px, 112, 1, 90); } R(g, OUT, 880, 116, 80, 2); R(g, '#6a6a7a', 880, 116, 80, 1);
    for (let x = 880; x < 960; x += 4) { R(g, '#5a5a6a', x, 108 + (x & 4 ? 1 : 3), 3, 1); R(g, '#5a5a6a', x + 1, 110, 1, 3); } snowCap(g, 880, 116, 80, 2); }
  // D: the mouth onto May St (960-1140): storefront across the street, the street sign, a sodium lamp
  { const X = 960;
    brickWall(g, X, 108, 180, 78, ['#140e18', '#2a2030', '#342a3c', '#1e1626'], 11); R(g, OUT, X, 104, 180, 1); R(g, '#3a3044', X, 105, 180, 3); snowCap(g, X, 104, 180, 3);
    for (const wx of [X + 18, X + 70, X + 122]) win(g, wx, 114, 18, 18, { lit: wx === X + 70, kind: 'curtain', st: '#5a5068' });
    R(g, OUT, X + 14, 150, 110, 32); gradRows(g, X + 15, 151, 108, 30, ['#ffd890', '#f0a050', '#7a3a24']); for (let i = 0; i < 4; i++) R(g, 'rgba(60,24,10,0.6)', X + 22 + i * 24, 160, 14, 21);
    for (let x = X + 10; x < X + 128; x++) { const st = ((x - X) >> 3) & 1; R(g, st ? '#1a6a6a' : '#d8e8e0', x, 142, 1, 7); R(g, OUT, x, 149, 1, 1); } snowCap(g, X + 10, 142, 118, 2);
    R(g, OUT, X + 134, 150, 30, 36); gradRows(g, X + 135, 151, 28, 34, ['#3a2a3a', '#5a3a3a', '#2a1a24']);
    gradRows(g, X, 186, 180, 6, ['#6a6874', '#4a4854']); R(g, '#8a8696', X, 191, 180, 1); gradRows(g, X, 192, 180, 10, ['#2a2832', '#1a1820']); for (let x = X + 4; x < X + 180; x += 26) R(g, '#c8b04a', x, 197, 12, 1);
    R(g, OUT, X + 10, 74, 4, 128); R(g, '#3a4048', X + 11, 74, 1, 128); R(g, OUT, X - 14, 68, 52, 14); R(g, '#1a6a3a', X - 13, 69, 50, 12); R(g, '#e8f0e8', X - 12, 70, 48, 1); drawTxt(g, 'MAY ST', X - 6, 72, 1, '#ffffff'); snowCap(g, X - 14, 68, 52, 2);
    R(g, OUT, X + 168, 92, 4, 110); R(g, '#3a3a44', X + 169, 92, 1, 110); R(g, OUT, X + 140, 90, 32, 3); R(g, OUT, X + 136, 93, 18, 6); R(g, '#ffd890', X + 137, 97, 16, 2); snowCap(g, X + 136, 90, 36, 2); }
  // E: corner of the next building (1140-1200)
  brickWall(g, 1140, 30, 60, 170, ['#160e12', '#30201e', '#3c2824', '#20140e'], 5); R(g, OUT, 1140, 30, 2, 170); R(g, OUT, 1140, 24, 60, 1); R(g, '#3c2824', 1140, 25, 60, 5); snowCap(g, 1140, 24, 60, 3);
  win(g, 1160, 50, 22, 28, { lit: true, kind: 'person', st: '#6a4a40' }); win(g, 1160, 110, 22, 28, { lit: false, st: '#6a4a40' });
  // power lines across the top
  sag(g, '#0a0810', 0, 40, 1200, 34, 22); sag(g, '#0a0810', 0, 50, 1200, 46, 26); sag(g, '#0a0810', 300, 76, 960, 70, 10);
  // wall foot + props
  R(g, '#1a1820', 0, 196, 960, 6); R(g, '#2a2832', 0, 196, 960, 1); R(g, '#1a1820', 1140, 196, 60, 6);
  dumpster(g, 150, 152, ['#0e2a1a', '#1e4a2e', '#2e6a42'], 76, 48); dumpster(g, 750, 152, ['#0e1a3a', '#1e2e5a', '#2e4a7a'], 80, 48);
  for (const [x, y, r] of [[142, 196, 8], [236, 194, 10], [252, 198, 7], [744, 196, 9], [840, 197, 7], [550, 198, 5]]) bag(g, x, y, r);
  for (const kx of [386, 408, 430]) keg(g, kx, 172); for (const kx of [397, 419]) keg(g, kx, 143);
  crate(g, 636, 185, '#2a4a8a', '#1a2a5a'); crate(g, 660, 185, '#8a2a2a', '#5a1a1a'); crate(g, 648, 169, '#2a4a8a', '#1a2a5a'); crate(g, 660, 153, '#8a2a2a', '#5a1a1a');
  for (let x = 0; x < NW; x += 2) { if ((x > 552 && x < 628) || (x > 960 && x < 1140)) continue; const hh = 2 + Math.sin(x * 0.07) * 1.5 + Math.sin(x * 0.21) + rnd() * 1.5 | 0; R(g, '#d8e2f0', x, 202 - hh, 2, hh); if (dith(x, hh) < 0.4) R(g, '#ffffff', x, 202 - hh, 2, 1); }
  // floor: wet cracked asphalt, slush, tyre tracks, a manhole, puddles mirroring the wall
  const facade = mk(NW, 102); facade.g.drawImage(c, 0, 100, NW, 102, 0, 0, NW, 102);
  gradRows(g, 0, 202, NW, H - 202, ['#22202a', '#1a1822', '#14121a', '#0e0c14']);
  for (let r = 0; r < H - 202; r++) { const sy = 101 - Math.floor(r * 1.6); if (sy < 0) break; g.globalAlpha = 0.18 * (1 - r / (H - 202)); g.drawImage(facade, 0, sy, NW, 1, Math.round(Math.sin(r * 1.9)), 202 + r, NW, 1); }
  g.globalAlpha = 1;
  for (let i = 0; i < 1500; i++) R(g, rnd() < 0.5 ? '#2c2a36' : '#0a0810', rnd() * NW | 0, 203 + rnd() * 67 | 0, 1, 1);
  for (let i = 0; i < 14; i++) { let x = rnd() * NW, y = 210 + rnd() * 56; for (let k = 0; k < 28; k++) { R(g, '#0a0810', x | 0, y | 0, 2, 1); x += 2; y += (rnd() - 0.5) * 2.2; } }
  for (const ty of [224, 238, 252, 262]) for (let x = 0; x < NW; x += 3) if (dith(x, ty) < 0.35) R(g, '#2e2c38', x, ty + Math.round(Math.sin(x * 0.01) * 2), 2, 1);
  for (let i = 0; i < 22; i++) { const x0 = rnd() * NW | 0, y0 = 206 + rnd() * 60 | 0, w0 = 16 + rnd() * 50 | 0, h0 = 2 + rnd() * 4 | 0;
    for (let y = 0; y < h0; y++) for (let x = 0; x < w0; x++) { const e = Math.abs(x - w0 / 2) / (w0 / 2) + Math.abs(y - h0 / 2) / h0; if (e < 1 && dith(x0 + x, y0 + y) < 0.9 - e * 0.6) R(g, dith(x, y) < 0.3 ? '#c8d0de' : '#8a92a4', x0 + x, y0 + y, 1, 1); } }
  { const mx = 500, my = 240; g.fillStyle = OUT; g.beginPath(); g.ellipse(mx, my, 20, 5, 0, 0, 7); g.fill(); g.fillStyle = '#2a2832'; g.beginPath(); g.ellipse(mx, my, 18, 4, 0, 0, 7); g.fill(); for (let x = mx - 14; x < mx + 14; x += 5) R(g, OUT, x, my - 1, 3, 2); }
  for (const [cx, cy, rx, ry] of [[200, 226, 46, 4], [590, 222, 40, 4], [700, 254, 56, 5], [1050, 232, 44, 4], [330, 258, 40, 4]]) {
    for (let r = -ry; r <= ry; r++) { const hw = Math.round(rx * Math.sqrt(1 - (r / (ry + 0.5)) ** 2)), y = cy + r, sy = Math.round(101 - (y - 202) * 1.8); if (hw < 2) continue; R(g, '#0c0e1c', cx - hw, y, hw * 2, 1); if (sy >= 0 && sy < 102) { g.globalAlpha = 0.6; g.drawImage(facade, cx - hw, sy, hw * 2, 1, cx - hw + Math.round(Math.sin(y * 1.7)), y, hw * 2, 1); g.globalAlpha = 1; } R(g, 'rgba(60,80,150,0.18)', cx - hw, y, hw * 2, 1); }
    R(g, '#4a5068', cx - rx + 6, cy - ry - 1, rx * 2 - 12, 1); R(g, '#8a92a4', cx - rx + 10, cy + ry + 1, rx * 2 - 20, 1);
  }
  S.near = c;
  S.neon = [{ x: 590, y: 110, txt: 'THE MAY ST. TAVERN', col: '#ff5a3a', s: 2, ph: 17, dodgy: 2 }, { x: 1069, y: 128, txt: 'VARIETY', col: '#57e0ff', s: 1, ph: 230 }];
  neonSprites(S.neon);
  S.lamps = [
    { x: 590, y: 141, cone: 1, pool: 222, flick: (t) => { const u = t % 520; if (u < 34) return (u >> 2) % 3 === 0 ? 0.12 : 1; if (u > 260 && u < 266) return 0.25; return 0.92 + 0.08 * Math.sin(t * 0.37); } },
    { x: 73, y: 137, cone: 1, pool: 218, a: 0.6 },
    { x: 1105, y: 97, cone: 1, pool: 200, a: 0.85 }
  ];
  S.vents = [[685, 92, 4], [500, 238, 6]];
  const PPL = []; for (const [x, h] of [[462, 46], [482, 52], [504, 42], [526, 50], [626, 48], [690, 54], [712, 44], [992, 40], [1020, 44]]) PPL.push(makePerson(x, h));
  S.crowd = crowdFrames(PPL, 70);
  /* foreground strip (parallax 1.3x): slush lip, a pylon tip, a tyre */
  c = mk(BG.fgW, 20, true); g = c.g;
  for (let x = 0; x < BG.fgW; x += 2) { if (Math.sin(x * 0.011 + 2) < -0.4) continue; const hh = 3 + Math.sin(x * 0.027) * 2.5 + Math.sin(x * 0.13) * 1.2 + (rnd() * 1.5 | 0) | 0; R(g, OUT, x, 20 - hh - 1, 2, 1); R(g, '#9aa4b8', x, 20 - hh, 2, hh); R(g, '#d8e2f0', x, 20 - hh, 2, 1); if (dith(x, hh) < 0.4) R(g, '#6a7288', x, 20 - hh + 2, 2, 1); }
  for (const px of [380, 1100]) { g.fillStyle = OUT; g.beginPath(); g.moveTo(px - 9, 20); g.lineTo(px - 3, 3); g.lineTo(px + 3, 3); g.lineTo(px + 9, 20); g.fill(); g.fillStyle = '#ff6a12'; g.beginPath(); g.moveTo(px - 7, 20); g.lineTo(px - 2, 5); g.lineTo(px + 2, 5); g.lineTo(px + 7, 20); g.fill(); R(g, '#f0f0f0', px - 4, 11, 8, 3); }
  { const rx = 760; disc(g, OUT, rx, 22, 14); disc(g, '#24222c', rx, 22, 12); disc(g, OUT, rx, 22, 6); R(g, '#3a3844', rx - 9, 11, 6, 2); R(g, '#e4ecf8', rx - 10, 7, 20, 2); }
  S.fg = c;
  S.live = alleyLive;
  return S;
}
function alleyLive(g, nx, tick, lv, S) {
  const b = S.lamps[0].flick(tick);
  R(g, OUT, 585 + nx, 136, 11, 9); R(g, b > 0.5 ? '#fff6c8' : '#5a4a30', 587 + nx, 138, 7, 6); if (b > 0.5) R(g, '#ffffff', 589 + nx, 139, 3, 3); for (const k of [588, 591, 594]) R(g, OUT, k + nx, 137, 1, 8); R(g, OUT, 585 + nx, 141, 11, 1);   // the caged bulb
  const cx = 780 + nx; if (cx > -30 && cx < W + 30) catSit(g, cx, 150, tick, stageCheer());   // the cat on the blue dumpster lid
  const dc = tick % 90; if (dc < 30) R(g, '#9ab0d8', 729 + nx, 198 + (dc * dc / 30 | 0) - 0, 1, 2); else if (dc < 36) { R(g, '#9ab0d8', 726 + nx, 226 - (dc - 30), 1, 1); R(g, '#9ab0d8', 732 + nx, 226 - (dc - 30), 1, 1); }   // gutter drip
  if (lv > 0) {
    tvFlicker(g, nx, tick, S);
    const cyc = tick % 470;   // a car rolls past on May Street every ~8 s
    if (cyc < 150) {
      const dir = (Math.floor(tick / 470) & 1) ? -1 : 1, p = cyc / 150, x = Math.round((dir > 0 ? 900 + p * 300 : 1200 - p * 300) + nx);
      g.save(); g.beginPath(); g.rect(960 + nx, 100, 180, 102); g.clip();
      R(g, OUT, x - 34, 178, 68, 18); R(g, '#1e1c2a', x - 33, 179, 66, 16); R(g, '#2e2c3e', x - 33, 179, 66, 2); R(g, OUT, x - 20, 168, 40, 11); R(g, '#5a7aa0', x - 18, 170, 36, 7); R(g, OUT, x - 1, 170, 2, 7);
      R(g, OUT, x - 26, 192, 12, 6); R(g, OUT, x + 14, 192, 12, 6);
      R(g, '#fff6dc', dir > 0 ? x + 30 : x - 34, 183, 4, 4); R(g, '#ff2a2a', dir > 0 ? x - 34 : x + 30, 183, 4, 3);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.7; g.drawImage(BG.head, x - 100 + dir * 80, 150); g.globalAlpha = 0.45; g.drawImage(BG.head, x - 100 + dir * 60, 186, 200, 24);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.restore();
      if (p > 0.3 && p < 0.7) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.12 * Math.sin((p - 0.3) / 0.4 * Math.PI); g.drawImage(BG.head, 880 + nx, 202, 320, 50); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    }
  }
}
</script>
