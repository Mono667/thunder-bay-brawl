<script>
/* ============ 3-5. THUNDER BAY STREETS: WESTFORT, ARTHUR STREET, HIGH STREET ============
   Same floor as Bay Street (sidewalk at SWT, curb, wet road from 214) so the fight plane is identical. */
function tbSign(g, x, a, b, top) {   // a green Thunder Bay street-name pole: one blade facing us, one end-on (shorter, darker)
  top = top || 86;
  R(g, OUT, x - 2, top, 5, 204 - top); R(g, '#5a6070', x - 1, top, 3, 204 - top); R(g, '#8a90a0', x - 1, top, 1, 204 - top); R(g, OUT, x - 3, top - 2, 7, 3);
  const blade = (t, y, face, dk) => { const w = txtW(t, 1) + 10, x0 = x - (w >> 1);
    R(g, OUT, x0 - 1, y - 1, w + 2, 13); R(g, face, x0, y, w, 11); R(g, '#e8f0e8', x0 + 1, y + 1, w - 2, 1); R(g, '#e8f0e8', x0 + 1, y + 9, w - 2, 1); R(g, '#e8f0e8', x0 + 1, y + 1, 1, 9); R(g, '#e8f0e8', x0 + w - 2, y + 1, 1, 9);
    drawTxt(g, t, x0 + 5, y + 2, 1, dk ? '#c8d8cc' : '#ffffff'); R(g, 'rgba(0,0,0,0.3)', x0, y + 11, w, 1); snowCap(g, x0, y, w, 2); };
  blade(a, top + 2, '#16683a'); if (b) blade(b, top + 16, '#105030', 1);
}
function townWindow(g, k, x, y, w, h) {   // the lit display window of a little shop
  const P = { variety: ['#2a2414', '#f0d890', '#c8a050', '#3a2a14'], barber: ['#16202a', '#c8e0f0', '#7aa0c0', '#16202a'], pizza: ['#2a1008', '#ffb060', '#c86020', '#3a1408'], diner: ['#1a2a2a', '#e0f0e0', '#90c0b0', '#1a2a2a'],
    hardware: ['#1a1610', '#e8d8a0', '#a08a50', '#1a1408'], bingo: ['#1a0a1a', '#a050a0', '#602a60', '#1a0a1a'], pharmacy: ['#202a30', '#f4fbff', '#c8dce8', '#2a3a40'], donut: ['#2a1a14', '#ffd8b0', '#e0a070', '#3a2014'],
    subs: ['#1a2010', '#f0f0c0', '#b8c070', '#1a2010'], burger: ['#2a1410', '#ffe0a0', '#e09040', '#3a1a10'], corner: ['#1e1a10', '#ffe8a8', '#d0a050', '#2a1a0c'], dark: ['#0a0c18', '#1a2038', '#121628', '#0a0c18'] }[k] || ['#1a1a1a', '#e0d0b0', '#a08060', '#1a1a1a'];
  R(g, OUT, x - 2, y - 2, w + 4, h + 4); gradRows(g, x, y, w, h, P);
  if (k === 'variety' || k === 'corner') {   // racks of chips, a cooler of milk, a magazine rack
    for (let r = 0; r < 3; r++) for (let i = 0; i < (w - 30) / 7; i++) { const c = ['#c02a2a', '#2a6ac0', '#e0a020', '#2a8a4a', '#a02a8a'][(i + r * 2) % 5]; R(g, OUT, x + 3 + i * 7, y + 8 + r * 11, 6, 8); R(g, c, x + 4 + i * 7, y + 9 + r * 11, 4, 6); R(g, 'rgba(255,255,255,0.4)', x + 4 + i * 7, y + 9 + r * 11, 1, 2); }
    R(g, OUT, x + w - 24, y + 4, 20, h - 4); gradRows(g, x + w - 23, y + 5, 18, h - 5, ['#d8f0ff', '#9ac8e8']); for (let r = 0; r < 4; r++) for (let i = 0; i < 3; i++) R(g, '#ffffff', x + w - 21 + i * 6, y + 8 + r * 9, 4, 6);
    drawTxt(g, k === 'corner' ? 'MILK' : 'LOTTO', x + 4, y + h - 10, 1, '#c01818');
  } else if (k === 'barber') {   // the mirror strip, two chairs, a customer under the cape
    R(g, '#e8f4ff', x + 2, y + 4, w - 4, 14); R(g, OUT, x + 2, y + 18, w - 4, 1);
    for (let i = 0; i < 2; i++) { const cx = x + 12 + i * ((w - 30) >> 1); R(g, OUT, cx, y + 26, 18, 6); R(g, '#8a1a1a', cx + 1, y + 27, 16, 4); R(g, OUT, cx + 7, y + 32, 4, h - 34); R(g, '#c8c8d0', cx + 3, y + h - 4, 12, 2);
      if (!i) { R(g, '#3a2a20', cx + 5, y + 12, 8, 9); R(g, '#e8e8f0', cx + 2, y + 20, 14, 8); } }
  } else if (k === 'pizza') {   // the oven mouth glowing, a counter, a stack of boxes
    R(g, OUT, x + 6, y + 6, 36, 26); R(g, '#5a2a1a', x + 7, y + 7, 34, 24); disc(g, OUT, x + 24, y + 26, 10); disc(g, '#ff8a20', x + 24, y + 26, 9); disc(g, '#ffd060', x + 24, y + 28, 5); R(g, '#5a2a1a', x + 7, y + 28, 34, 3);
    for (let i = 0; i < 5; i++) { R(g, OUT, x + w - 30, y + h - 8 - i * 5, 24, 5); R(g, '#e8e0c8', x + w - 29, y + h - 7 - i * 5, 22, 3); }
    R(g, '#3a1a10', x, y + h - 10, w - 34, 10); R(g, '#c87040', x, y + h - 10, w - 34, 1); drawTxt(g, 'SLICES', x + 48, y + 6, 1, '#fff6e0');
  } else if (k === 'diner') {   // booths, stools, a pie case
    for (let i = 0; i < 4; i++) { const bx = x + 6 + i * ((w - 12) / 4 | 0); R(g, '#a01818', bx, y + h - 18, 6, 18); R(g, '#c8a070', bx + 7, y + h - 14, 10, 2); R(g, OUT, bx + 11, y + h - 12, 2, 12); R(g, 'rgba(20,30,30,0.7)', bx + 8, y + h - 30, 7, 7); R(g, 'rgba(20,30,30,0.7)', bx + 6, y + h - 23, 11, 8); }
    R(g, OUT, x + w - 26, y + 4, 22, 16); R(g, '#f0f8f8', x + w - 25, y + 5, 20, 14); for (let i = 0; i < 3; i++) { R(g, '#c88a3a', x + w - 24 + i * 7, y + 9, 5, 3); R(g, '#a01830', x + w - 24 + i * 7, y + 14, 5, 3); } drawTxt(g, 'PIE', x + 6, y + 6, 1, '#1a4a4a');
  } else if (k === 'hardware') {   // pegboard of tools, shovels, salt
    for (let i = 0; i < w - 8; i += 5) for (let j = 0; j < 20; j += 5) R(g, '#8a7040', x + 4 + i, y + 4 + j, 1, 1);
    for (let i = 0; i < 5; i++) { const sx = x + 6 + i * 9; R(g, '#3a2a1a', sx + 2, y + 8, 2, 26); R(g, ['#c02a2a', '#2a6ac0', '#e0a020', '#2a8a4a', '#c02a2a'][i], sx, y + 32, 6, 9); }
    for (let i = 0; i < 3; i++) { R(g, OUT, x + w - 40 + i * 12, y + h - 12, 11, 12); R(g, '#e8e8f0', x + w - 39 + i * 12, y + h - 11, 9, 10); R(g, '#2a6ac0', x + w - 39 + i * 12, y + h - 8, 9, 3); }
    drawTxt(g, 'SHOVELS', x + w - 44, y + 4, 1, '#3a1a0a');
  } else if (k === 'bingo') {   // a dim hall, posters on the glass
    for (let i = 0; i < 3; i++) { const px = x + 6 + i * ((w - 12) / 3 | 0); R(g, '#f0e8d0', px, y + 6, 22, 28); R(g, ['#c02a8a', '#2a8ac0', '#e0a020'][i], px + 2, y + 8, 18, 8); drawTxt(g, ['FRI', 'SAT', 'SUN'][i], px + 2, y + 20, 1, '#3a1a3a'); }
    drawTxt(g, '7PM', x + w - 24, y + h - 10, 1, '#ffd0ff');
  } else if (k === 'pharmacy' || k === 'subs' || k === 'donut' || k === 'burger') {   // bright counters + a menu board
    R(g, '#1a1a20', x + 4, y + 4, w - 8, 10); for (let i = 0; i < (w - 12) / 14; i++) R(g, ['#ffe060', '#ff6a3a', '#7aff8a'][i % 3], x + 7 + i * 14, y + 7, 10, 4);
    if (k === 'donut') for (let r = 0; r < 2; r++) for (let i = 0; i < (w - 10) / 11; i++) { disc(g, OUT, x + 9 + i * 11, y + 26 + r * 10, 4); disc(g, ['#c88a3a', '#ff8ac0', '#6a3a1a'][(i + r) % 3], x + 9 + i * 11, y + 26 + r * 10, 3); R(g, '#3a2014', x + 9 + i * 11, y + 26 + r * 10, 1, 1); }
    else if (k === 'pharmacy') for (let r = 0; r < 3; r++) for (let i = 0; i < (w - 8) / 6; i++) R(g, ['#2a6ac0', '#e8e8f0', '#c02a2a', '#2a8a4a'][(i * 3 + r) % 4], x + 4 + i * 6, y + 20 + r * 8, 4, 6);
    else { for (let i = 0; i < 3; i++) { R(g, 'rgba(40,20,10,0.75)', x + 10 + i * 26, y + 22, 8, 8); R(g, 'rgba(40,20,10,0.75)', x + 7 + i * 26, y + 30, 14, 10); } }
    R(g, '#8a8a98', x, y + h - 8, w, 8); R(g, '#c8c8d0', x, y + h - 8, w, 1);
  }
  R(g, 'rgba(255,255,255,0.18)', x + 3, y + 3, 2, 18); R(g, 'rgba(255,255,255,0.1)', x + 7, y + 3, 1, 10);
}
function clapboard(g, x, y, w, h, c) {   // painted wood siding: [face, lit lip, shadow]
  for (let yy = 0; yy < h; yy++) { const k = (yy + y) % 5; R(g, k === 0 ? c[1] : k === 4 ? c[2] : c[0], x, y + yy, w, 1); }
  for (let i = 0; i < w * h / 70; i++) R(g, 'rgba(0,0,0,0.14)', x + rnd() * w | 0, y + rnd() * h | 0, 1 + rnd() * 5 | 0, 1);
}
function townShop(g, s) {   // like bayShop, but brick or clapboard, a lower roof and its own window kinds
  const { x, w, roof } = s;
  if (s.siding) clapboard(g, x, roof, w, SWT - roof, s.siding); else brickWall(g, x, roof, w, SWT - roof, s.brick, s.sd);
  shadeV(g, x, roof, w, Math.max(1, 100 - roof), 0.4, 0.06);
  R(g, OUT, x, roof, 1, SWT - roof); R(g, 'rgba(255,255,255,0.07)', x + 1, roof, 2, SWT - roof); R(g, 'rgba(0,0,0,0.38)', x + w - 3, roof, 3, SWT - roof);
  if (s.front) {   // a false-front parapet, small-town style
    const px = x + (w >> 1); R(g, OUT, px - 30, roof - 15, 60, 16); if (s.siding) clapboard(g, px - 29, roof - 14, 58, 14, s.siding); else R(g, s.trim, px - 29, roof - 14, 58, 14); R(g, s.trim, px - 31, roof - 17, 62, 3); snowCap(g, px - 31, roof - 17, 62, 3);
    if (s.date) drawTxt(g, s.date, px - (txtW(s.date, 1) >> 1), roof - 11, 1, '#e8e0d0'); }
  R(g, OUT, x - 1, roof - 7, w + 2, 1); R(g, s.trim, x - 1, roof - 6, w + 2, 4); R(g, 'rgba(255,255,255,0.2)', x - 1, roof - 6, w + 2, 1); R(g, s.trimD, x, roof - 2, w, 2); R(g, OUT, x, roof, w, 1);
  snowCap(g, x - 1, roof - 7, w + 2, 4);
  if (s.chim) { const cx = x + s.chim; brickWall(g, cx, roof - 26, 12, 19, ['#1a0e10', '#4a2622', '#5e302c', '#341a18'], 5, 6, 3); R(g, OUT, cx - 1, roof - 29, 14, 3); R(g, s.trim, cx - 1, roof - 29, 14, 2); snowCap(g, cx - 1, roof - 29, 14, 3); }
  const nW = Math.max(1, Math.floor((w - 10) / 34)), gap = (w - nW * 20) / (nW + 1);
  for (let ty = 70; ty >= roof + 10; ty -= 32) for (let i = 0; i < nW; i++) win(g, Math.round(x + gap + i * (20 + gap)), ty, 20, 24, { lit: rnd() < 0.45, kind: ['blinds', 'curtain', 'plant', 'person'][rnd() * 4 | 0], st: s.stone, cc: ['#7a2a2a', '#2a4a7a', '#5a3a6a'][i % 3] });
  if (s.ghost) { g.globalAlpha = 0.28; drawTxt(g, s.ghost, x + (w - txtW(s.ghost, 1) >> 1), roof + 6, 1, '#d8d0c0'); g.globalAlpha = 1; }
  R(g, OUT, x + 6, 101, w - 12, 26); R(g, '#120c16', x + 7, 102, w - 14, 24); R(g, '#241a2a', x + 7, 102, w - 14, 1); snowCap(g, x + 6, 101, w - 12, 2);
  s.neon.forEach(n => NEON.push(n));
  if (s.awn) {
    R(g, OUT, x + 2, 127, w - 4, 1);
    for (let i = x + 3; i < x + w - 3; i++) { const st = ((i - x) >> 3) & 1, sc = (i - x) % 8; R(g, s.awn[st], i, 128, 1, 9); R(g, 'rgba(255,255,255,0.18)', i, 128, 1, 1); R(g, 'rgba(0,0,0,0.25)', i, 134, 1, 3); R(g, s.awn[st], i, 137, 1, sc > 1 && sc < 6 ? 3 : 1); R(g, OUT, i, sc > 1 && sc < 6 ? 140 : 138, 1, 1); }
    snowCap(g, x + 3, 128, w - 6, 3); R(g, 'rgba(0,0,0,0.45)', x + 3, 141, w - 6, 3);
  } else { R(g, OUT, x + 2, 127, w - 4, 6); R(g, s.trim, x + 3, 128, w - 6, 4); R(g, 'rgba(255,255,255,0.2)', x + 3, 128, w - 6, 1); snowCap(g, x + 3, 128, w - 6, 2); R(g, 'rgba(0,0,0,0.4)', x + 3, 133, w - 6, 3); }
  const ww = w - 54, wx0 = x + 8; townWindow(g, s.kind, wx0, 143, ww, 42);
  const dx = x + w - 40; R(g, OUT, dx - 2, 137, 32, 55); R(g, s.trimD, dx - 1, 138, 30, 54); R(g, s.door, dx + 1, 140, 26, 52); R(g, 'rgba(255,255,255,0.12)', dx + 1, 140, 1, 52);
  gradRows(g, dx + 4, 143, 20, 22, s.dpal || ['#3a2a30', '#c8905a', '#3a2a30']); R(g, OUT, dx + 4, 165, 20, 1); R(g, 'rgba(0,0,0,0.3)', dx + 4, 168, 20, 20);
  R(g, '#d8b46a', dx + 21, 170, 3, 2); R(g, '#8a8a98', dx + 2, 186, 24, 3);
  R(g, OUT, x + 2, 186, w - 44, 1); R(g, s.trimD, x + 2, 187, w - 44, 5); R(g, 'rgba(255,255,255,0.12)', x + 2, 187, w - 44, 1);
  glowAt(g, wx0 + ww / 2, 194, ww * 0.75, 14, s.spill || '255,190,120', 0.22);
}
function cobraLamp(g, x, dir) {   // a modern street light: tall grey pole, long arm, cobra head (glow is live at y 66)
  dir = dir || 1;
  R(g, OUT, x - 4, 196, 9, 8); R(g, '#5a5e6a', x - 3, 197, 7, 6); R(g, OUT, x - 2, 64, 5, 134); R(g, '#6a6e7a', x - 1, 64, 3, 134); R(g, '#9a9eaa', x - 1, 64, 1, 134);
  for (let k = 0; k < 22; k++) R(g, OUT, x + dir * k, 64 - (k > 12 ? 2 : k / 6 | 0), 1, 3);
  const hx = x + dir * 22; R(g, OUT, hx - 7, 61, 15, 6); R(g, '#7a7e8a', hx - 6, 62, 13, 3); R(g, '#ffe9a8', hx - 5, 65, 11, 2); snowCap(g, hx - 7, 61, 15, 2);
  return hx;
}
function woodPole(g, x) {   // old utility pole with a crossarm and a cobra head (glow is live at y 78)
  R(g, OUT, x - 3, 40, 7, 164); R(g, '#4a3424', x - 2, 40, 5, 164); R(g, '#6a4a34', x - 2, 40, 1, 164); for (let y = 48; y < 200; y += 9) R(g, 'rgba(0,0,0,0.25)', x - 2, y, 5, 1);
  R(g, OUT, x - 22, 46, 45, 5); R(g, '#4a3424', x - 21, 47, 43, 3); for (const ix of [-19, -9, 9, 19]) { R(g, OUT, x + ix - 1, 42, 3, 5); R(g, '#8a9aa8', x + ix, 42, 1, 4); } snowCap(g, x - 22, 46, 45, 2);
  for (let k = 0; k < 14; k++) R(g, OUT, x + k, 74 - (k / 5 | 0), 1, 2); R(g, OUT, x + 10, 71, 13, 6); R(g, '#7a7e8a', x + 11, 72, 11, 2); R(g, '#ffe9a8', x + 12, 75, 9, 2); snowCap(g, x + 10, 71, 13, 2);
  R(g, OUT, x - 8, 120, 16, 30); R(g, '#d8d0b8', x - 7, 121, 14, 28);   // a lost-cat poster stapled on
  R(g, '#1a1410', x - 4, 125, 8, 7); R(g, '#1a1410', x - 3, 123, 2, 2); R(g, '#1a1410', x + 1, 123, 2, 2); for (let k = 0; k < 4; k++) R(g, '#5a5048', x - 5, 135 + k * 3, 10, 1); drawTxt(g, 'LOST', x - 6, 113, 1, '#e8e0d0');
  return x + 16;
}
function streetFloor(g, c, S, o) {   // Bay Street's sidewalk, curb, snowbanks and wet road (same y's), with per-stage puddles
  gradRows(g, 0, SWT, NW, 18, o.walk || ['#5e5c6a', '#504e5c', '#42404e', '#36343f']);
  for (let x = 0; x < NW; x += 40) pxLine(g, '#2c2a36', x, SWT, x - 6, 209, 1);
  R(g, 'rgba(0,0,0,0.25)', 0, SWT, NW, 2);
  for (let i = 0; i < 520; i++) R(g, rnd() < 0.7 ? '#c8d4e4' : '#8a8a9a', rnd() * NW | 0, SWT + 2 + rnd() * 16 | 0, 1, 1);
  R(g, '#a8a4b4', 0, 210, NW, 1); gradRows(g, 0, 211, NW, 3, ['#6a6676', '#4a4656']);
  for (let x = 0; x < NW; x += 2) {
    if (o.clear(x) || Math.sin(x * 0.011 + o.ph) < -0.55) continue;
    const hh = 3 + Math.sin(x * 0.05) * 2 + Math.sin(x * 0.17) * 1.5 + rnd() * 1.5 | 0; R(g, OUT, x, 211 - hh - 1, 2, 1); R(g, '#d8e2f2', x, 211 - hh, 2, hh + 1); if (dith(x, hh) < 0.35) R(g, '#ffffff', x, 211 - hh, 2, 1); R(g, '#9aa8c4', x, 210, 2, 1); if (dith(x, 3) < 0.25) R(g, '#7a7488', x, 211 - (hh >> 1), 2, 1);
  }
  const facade = mk(NW, 92); facade.g.drawImage(c, 0, 100, NW, 92, 0, 0, NW, 92);
  gradRows(g, 0, 214, NW, H - 214, o.road || ['#1e1c28', '#17151f', '#110f18', '#0c0a12']);
  for (let r = 0; r < H - 214; r++) { const sy = 91 - Math.floor(r * 1.7); if (sy < 0) break; g.globalAlpha = 0.36 * (1 - r / (H - 214)); g.drawImage(facade, 0, sy, NW, 1, Math.round(Math.sin(r * 1.7) * 1.5), 214 + r, NW, 1); }
  g.globalAlpha = 1;
  for (let i = 0; i < 1400; i++) R(g, rnd() < 0.5 ? '#2a2834' : '#0a0810', rnd() * NW | 0, 215 + rnd() * 55 | 0, 1, 1);
  if (o.paint) o.paint(g);
  for (const [cx0, cw] of o.cross || []) for (let k = 0; k < 7; k++) { const y = 216 + k * 8, sk = Math.round(k * 1.2); R(g, 'rgba(220,220,230,0.32)', cx0 - sk, y, cw + sk * 2, 3); }
  for (const [cx, cy, rx, ry] of o.puddles) for (let r = -ry; r <= ry; r++) {
    const hw = Math.round(rx * Math.sqrt(1 - (r / (ry + 0.5)) ** 2)), y = cy + r, sy = Math.round(91 - (y - 214) * 1.7); if (hw < 2) continue;
    R(g, '#0a0c1a', cx - hw, y, hw * 2, 1); if (sy >= 0) { g.globalAlpha = 0.7; g.drawImage(facade, cx - hw, sy, hw * 2, 1, cx - hw + Math.round(Math.sin(y * 1.7)), y, hw * 2, 1); g.globalAlpha = 1; } R(g, 'rgba(70,90,170,0.16)', cx - hw, y, hw * 2, 1);
  }
  if (o.man) { const [mx, my] = o.man; g.fillStyle = OUT; g.beginPath(); g.ellipse(mx, my, 20, 5, 0, 0, 7); g.fill(); g.fillStyle = '#2a2832'; g.beginPath(); g.ellipse(mx, my, 18, 4, 0, 0, 7); g.fill(); for (let x = mx - 14; x < mx + 14; x += 5) R(g, OUT, x, my - 1, 3, 2); R(g, '#4a4854', mx - 16, my - 4, 32, 1); }
}
function snowLip(g, ph) { for (let x = 0; x < BG.fgW; x += 2) { if (Math.sin(x * 0.009 + ph) < -0.5) continue; const hh = 4 + Math.sin(x * 0.031 + ph) * 2.5 + Math.sin(x * 0.11) * 1.2 + (rnd() * 1.5 | 0) | 0; R(g, OUT, x, 20 - hh - 1, 2, 1); R(g, '#cdd8ea', x, 20 - hh, 2, hh); R(g, '#f2f6ff', x, 20 - hh, 2, 1); if (dith(x, hh) < 0.35) R(g, '#9aa8c4', x, 20 - hh + 2, 2, 1); } }
function sidewalkCrowd(skip) { const PPL = []; for (let x = 8; x < NW - 20; x += 13 + rnd() * 18) { if (skip(x + 10)) continue; PPL.push(makePerson(x, 38 + rnd() * 18)); } return crowdFrames(PPL, 70); }
function elevators(g, x, n, sw, top, bot, cols, head) {   // a row of concrete grain silos + a headhouse
  for (let i = 0; i < n; i++) { const sx = x + i * sw; for (let k = 0; k < sw; k++) { const f = k / (sw - 1), ci = f < 0.15 ? 3 : f < 0.45 ? 1 : f < 0.75 ? 0 : f < 0.92 ? 2 : 3; R(g, cols[ci], sx + k, top, 1, bot - top); } R(g, cols[4], sx + 1, top - 2, sw - 2, 2); for (let y = top + 8; y < bot; y += 12) R(g, 'rgba(0,0,0,0.18)', sx, y, sw, 1); }
  if (head) { const hx = head[0], ht = head[1]; R(g, cols[3], hx, ht, 34, bot - ht); R(g, cols[1], hx, ht, 2, bot - ht); R(g, cols[3], hx + 8, ht - 14, 18, 15); for (let y = ht + 8; y < bot - 6; y += 12) if (rnd() < 0.25) R(g, '#e8b85a', hx + 14, y, 3, 4); }
}
function plumeBack(g, x, y, tick, a) { for (let k = 0; k < 5; k++) { const age = (tick * 0.2 + k * 40) % 200, r = 3 + age * 0.08; g.globalAlpha = a * (1 - age / 200); g.fillStyle = '#7a7a9a'; g.fillRect(Math.round(x + age * 0.35 - r), Math.round(y - age * 0.3 - r * 0.6), Math.round(r * 2), Math.round(r * 1.2)); } g.globalAlpha = 1; }

/* ---------------- 3. WESTFORT: Frederica St, the Kam River and its elevators ---------------- */
function buildWestfort() {
  seed = 6106; NEON.length = 0;
  const S = { id: 'westfort', gy: 214, aur: 0.8, car: 1, crowdY: 136 };
  let c = mk(W, H, true), g = c.g;
  gradRows(g, 0, 0, W, 200, ['#02040c', '#050a1c', '#0a1230', '#121c44', '#1e2452', '#322c5a', '#4e3660', '#70445c', '#924e50']);
  for (let i = 0; i < 140; i++) { const x = rnd() * W | 0, y = rnd() * 110 | 0, b = rnd(); R(g, b < 0.15 ? '#fff6c8' : b < 0.5 ? '#9aa6e8' : '#4a5090', x, y, 1, 1); }
  glowAt(g, 380, 40, 50, 50, '200,200,255', 0.14); disc(g, '#6a6a7a', 380, 40, 11); disc(g, '#fff3c4', 380, 40, 10); disc(g, '#e8d9a0', 383, 42, 8); disc(g, '#1a2050', 376, 37, 8);   // a crescent moon
  S.sky = c; S.clouds = cloudStrip(720, 60, ['#3e3a6a', '#201c40', '#523048'], 61); S.cloudY = 48;
  /* far: Mount McKay's mesa and the Nor'Wester range to the south-west */
  c = mk(560, 200, true); g = c.g;
  g.fillStyle = '#1a1c44'; g.beginPath(); g.moveTo(0, 200); for (const [x, y] of [[0, 120], [40, 112], [90, 104], [140, 108], [200, 96], [250, 100], [300, 92], [360, 98], [420, 90], [480, 100], [560, 106]]) g.lineTo(x, y); g.lineTo(560, 200); g.fill();
  g.fillStyle = '#121434'; g.beginPath(); g.moveTo(0, 200); for (const [x, y] of [[0, 130], [60, 126], [110, 96], [128, 82], [236, 79], [256, 90], [290, 118], [360, 128], [460, 124], [560, 132]]) g.lineTo(x, y); g.lineTo(560, 200); g.fill();
  for (let x = 110; x < 290; x++) if (dith(x, 2) < 0.5) R(g, '#262a5a', x, Math.round(x < 128 ? 96 - (x - 110) * 0.78 : x < 236 ? 82 - (x - 128) * 0.028 : 79 + (x - 236) * 0.6), 1, 1);
  for (let i = 0; i < 6; i++) R(g, '#ff5a3a', 160 + i * 11, 80, 1, 1);   // the lookout on the mountain
  for (let i = 0; i < 60; i++) R(g, '#0e1030', 20 + rnd() * 520 | 0, 122 + rnd() * 10 | 0, 2 + rnd() * 5 | 0, 1);
  for (let y = 110; y < 200; y++) { g.fillStyle = 'rgba(146,78,80,' + Math.min(0.35, 0.004 * (y - 110)).toFixed(3) + ')'; g.fillRect(0, y, 560, 1); }
  S.far = c;
  /* mid: the Kam River, the steel swing bridge, the elevators on the far bank */
  c = mk(660, 200, true); g = c.g;
  const EC = ['#343c6a', '#4a5488', '#262c54', '#161a38', '#5a6498'];
  elevators(g, 150, 10, 13, 86, 168, EC, [280, 50]); [...'KAM'].forEach((ch, i) => drawTxt(g, ch, 150 + (i + 3) * 13 + 2, 100, 2, 'rgba(220,220,240,0.35)'));
  elevators(g, 506, 7, 12, 100, 168, ['#2c3462', '#3e4878', '#20264a', '#141834', '#4a5488'], [590, 62]);
  R(g, '#161a38', 314, 60, 192, 3); for (let x = 316; x < 504; x += 8) pxLine(g, '#161a38', x, 63, x + 4, 69, 1);   // conveyor gallery
  for (let i = 0; i < 10; i++) if (rnd() < 0.6) R(g, '#e8b85a', 154 + i * 13 + 5, 120 + (i % 3) * 14, 2, 3);
  gradRows(g, 0, 166, 660, 6, ['#1a1c34', '#12142a']);   // far bank
  gradRows(g, 0, 172, 660, 28, ['#0e1632', '#0c1330', '#0a0f28', '#080b20']);   // the river
  for (let i = 0; i < 90; i++) { const x = rnd() * 660 | 0, y = 173 + rnd() * 26 | 0; R(g, rnd() < 0.5 ? '#26306a' : '#1a2450', x, y, 3 + rnd() * 10 | 0, 1); }
  for (let i = 0; i < 30; i++) R(g, 'rgba(232,184,90,0.35)', 40 + rnd() * 560 | 0, 174 + rnd() * 24 | 0, 3 + rnd() * 6 | 0, 1);
  { const bx = 330, by = 150;   // the swing bridge: a steel truss on stone piers
    for (const px of [bx, bx + 140]) { R(g, '#1a1a30', px - 4, by + 8, 12, 30); R(g, '#2a2a44', px - 4, by + 8, 2, 30); }
    R(g, '#10122a', bx - 10, by + 6, 170, 4); R(g, '#10122a', bx - 10, by - 18, 170, 2);
    for (let k = 0; k <= 16; k++) { const x = bx - 10 + k * 10.6; R(g, '#10122a', x | 0, by - 18, 2, 26); if (k < 16) pxLine(g, '#10122a', x, k & 1 ? by - 18 : by + 6, x + 10.6, k & 1 ? by + 6 : by - 18, 1); }
    R(g, '#2a2c50', bx - 10, by - 18, 170, 1); snowCap(g, bx - 10, by - 18, 170, 2); R(g, '#ff3a3a', bx - 10, by - 20, 2, 2); R(g, '#ff3a3a', bx + 158, by - 20, 2, 2);
    for (let r = 0; r < 14; r += 2) { g.globalAlpha = 0.25 - r * 0.015; R(g, '#10122a', bx - 10, 176 + r, 170, 1); } g.globalAlpha = 1; }
  for (let i = 0; i < 26; i++) { const tx = rnd() * 660 | 0, th = 8 + rnd() * 10 | 0; g.fillStyle = '#0c0e22'; g.beginPath(); g.moveTo(tx - 4, 168); g.lineTo(tx, 168 - th); g.lineTo(tx + 4, 168); g.fill(); }   // spruce along the bank
  S.mid = c; S.train = trainSprite();
  S.layers = [{ img: S.far, par: 0.08, y: 0 }, { img: S.mid, par: 0.25, y: 0 }];
  S.back = (g, T, tick, lv, S) => {
    const mx = Math.round(-T * 0.25), bl = (tick % 90) < 45;
    for (const [bx, by] of [[296, 34], [606, 46]]) { R(g, bl ? '#ff3a3a' : '#5a1414', mx + bx, by, 2, 2); if (bl && lv > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.45; g.drawImage(BG.glow, mx + bx - 9, by - 9, 20, 20); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } }
    if (lv > 0) plumeBack(g, mx + 305, 34, tick, 0.18);
    const cyc = tick % 2600; if (cyc < 1300) {   // a grain train rumbles over the Kam on the swing bridge
      const tx = Math.round(mx + 750 - cyc * 0.75); g.save(); g.beginPath(); g.rect(mx + 318, 0, 176, 200); g.clip(); g.drawImage(S.train, tx, 132); g.restore();
      if (lv > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5; g.drawImage(BG.head, tx - 150, 126, 160, 30); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } }
    if (lv > 0) for (let k = 0; k < 6; k++) { const x = mx + 20 + ((k * 113 + tick * 0.15) % 640); R(g, 'rgba(200,210,255,0.35)', x | 0, 178 + (k * 5) % 18, 4, 1); }   // the river glints as it slides past
  };
  /* near: Frederica Street */
  c = mk(NW, H, true); g = c.g;
  const SH = [
    { x: 0, w: 150, roof: 62, brick: ['#2a1416', '#4a2422', '#5e302c', '#341a18'], trim: '#6a4a40', trimD: '#2a1614', stone: '#8a7a6a', door: '#2a3a3a', kind: 'variety', chim: 110, neon: [{ txt: 'VARIETY', col: '#ffd23a', s: 2 }], sd: 11, spill: '255,220,140' },
    { x: 150, w: 140, roof: 84, siding: ['#3a4a5e', '#5a6a80', '#26324a'], trim: '#c8c8d0', trimD: '#3a3a48', stone: '#a8a8b0', door: '#5a1a1a', kind: 'barber', front: 1, date: '1912', neon: [{ txt: 'BARBER', col: '#57e0ff', s: 2 }], sd: 12, spill: '170,220,255' },
    { x: 290, w: 140, roof: 58, brick: ['#2e2014', '#4a3420', '#5e4430', '#3a2818'], trim: '#7a5a3a', trimD: '#2a1a10', stone: '#a08a6a', door: '#3a1a14', kind: 'pizza', awn: ['#1a6a2a', '#e8e0d0'], neon: [{ txt: 'PIZZA', col: '#ff7a2a', s: 2 }], sd: 13, spill: '255,160,80' },
    { x: 724, w: 166, roof: 80, siding: ['#5a3a2a', '#7a5440', '#3a2418'], trim: '#e8e0d0', trimD: '#3a2a20', stone: '#c8c0b0', door: '#1a3a3a', kind: 'diner', front: 1, awn: ['#a01818', '#e8e0d0'], neon: [{ txt: 'DINER', col: '#5affd8', s: 2 }, { txt: 'OPEN', col: '#ff3a3a', s: 1, dx: -44, y: 147, ph: 130 }], sd: 14, spill: '180,255,230' },
    { x: 890, w: 160, roof: 40, brick: ['#161a24', '#262e3c', '#323a4a', '#1c222e'], trim: '#4a5262', trimD: '#10141c', stone: '#7a8290', door: '#20242e', kind: 'hardware', ghost: 'GENERAL STORE', neon: [{ txt: 'HARDWARE', col: '#ffb23a', s: 2, ph: 260 }], sd: 15, spill: '255,200,120' },
    { x: 1050, w: 150, roof: 70, brick: ['#22142a', '#36203e', '#462a4e', '#2a1832'], trim: '#5a3a62', trimD: '#160a1a', stone: '#7a6a80', door: '#14101e', kind: 'bingo', chim: 20, neon: [{ txt: 'BINGO', col: '#ff6ad8', s: 2, dodgy: 2 }], sd: 16, spill: '255,140,230' }
  ];
  for (const s of SH) { s.neon.forEach((n, i) => { n.x = s.x + s.w / 2 + (n.dx || 0); n.y = n.y || 99; n.ph = n.ph != null ? n.ph : NEON.length * 53 + i * 97; }); townShop(g, s); }
  // the barber pole (its stripes turn, live)
  R(g, OUT, 158, 140, 10, 40); R(g, '#c8c8d0', 159, 138, 8, 3); R(g, '#c8c8d0', 159, 179, 8, 3); disc(g, '#c8c8d0', 163, 136, 3); S.pole = [159, 141];
  // the side lane (430-480) with a dumpster, then the Kam River lookout (480-724)
  R(g, '#08070e', 430, 40, 50, 152); brickWall(g, 432, 40, 46, 152, ['#0a080e', '#16121c', '#1c1824', '#100c14'], 17); shadeV(g, 432, 40, 46, 152, 0.55, 0.2);
  dumpster(g, 438, 160, ['#0e1a3a', '#1e2e5a', '#2e4a7a'], 36, 32);
  { const L0 = 480, L1 = 724;
    R(g, OUT, L0, 173, L1 - L0, 1); gradRows(g, L0, 174, L1 - L0, 18, ['#5a5a6a', '#46465a', '#34344a']); R(g, '#7a7a8a', L0, 174, L1 - L0, 1);
    for (let x = L0 + 20; x < L1; x += 34) R(g, '#2a2a3a', x, 175, 1, 17); for (let i = 0; i < 140; i++) R(g, 'rgba(0,0,0,0.25)', L0 + rnd() * (L1 - L0) | 0, 176 + rnd() * 15 | 0, 1, 1); snowCap(g, L0, 174, L1 - L0, 4);
    R(g, OUT, L0, 152, L1 - L0, 3); R(g, '#2a2a38', L0, 152, L1 - L0, 1); R(g, OUT, L0, 162, L1 - L0, 1); for (let x = L0 + 2; x < L1; x += 8) R(g, OUT, x, 152, 1, 21);
    for (let x = L0 + 2; x < L1; x += 40) { R(g, OUT, x - 1, 148, 4, 26); R(g, '#3a3a4a', x, 149, 1, 24); R(g, OUT, x - 1, 146, 4, 3); } snowCap(g, L0, 152, L1 - L0, 2);
    const mx = 610; R(g, OUT, mx + 4, 140, 3, 34); R(g, OUT, mx + 56, 140, 3, 34); R(g, OUT, mx - 1, 128, 64, 14); R(g, '#5a3a1a', mx, 129, 62, 12); R(g, '#c8a070', mx, 129, 62, 1); drawTxt(g, 'KAM RIVER', mx + 5, 132, 1, '#f0e0c0'); snowCap(g, mx - 1, 128, 64, 2);
    for (const [tx, th] of [[500, 60], [700, 72]]) { R(g, OUT, tx - 2, 174 - th * 0.3, 5, th * 0.3); for (let k = 0; k < 5; k++) { const w2 = 8 + k * 5, y2 = 174 - th + k * th * 0.14; g.fillStyle = '#0e2a1e'; g.beginPath(); g.moveTo(tx - w2, y2 + th * 0.2); g.lineTo(tx, y2); g.lineTo(tx + w2, y2 + th * 0.2); g.fill(); R(g, '#dfe7f4', tx - w2 + 2, y2 + th * 0.2 - 2, w2 * 2 - 4, 2); } }
    R(g, 'rgba(0,0,0,0.38)', L0, 40, 6, 133); R(g, 'rgba(0,0,0,0.38)', L1 - 6, 40, 6, 133); }
  tbSign(g, 470, 'FREDERICA ST W', 'NEEBING AVE');
  // heritage lamps with WESTFORT banners
  S.lampX = [290, 724, 1050]; for (const x of S.lampX) { bayLamp(g, x); R(g, OUT, x + 2, 112, 18, 30); R(g, '#1a4a8a', x + 3, 113, 16, 28); drawTxt(g, 'W', x + 6, 116, 1, '#ffd23a'); drawTxt(g, 'F', x + 7, 126, 1, '#ffd23a'); R(g, '#e8e8f0', x + 3, 136, 16, 2); R(g, OUT, x + 2, 110, 20, 2); }
  sag(g, '#0a0810', 0, 30, 1200, 26, 18);
  streetFloor(g, c, S, { ph: 1.3, clear: x => S.lampX.some(l => Math.abs(x - l) < 10) || (x > 450 && x < 500), cross: [[450, 46]], puddles: [[120, 236, 40, 4], [380, 256, 50, 5], [800, 232, 36, 3], [1000, 258, 58, 5]], man: [640, 246],
    paint: g => { for (let x = 4; x < NW; x += 64) { R(g, '#6a5e30', x, 240, 32, 2); R(g, '#b8a048', x + 2, 240, 28, 1); } } });
  S.near = c;
  S.neon = NEON.slice(); neonSprites(S.neon);
  S.lamps = S.lampX.map(x => ({ x, y: 92, cone: 1, pool: 232 }));
  S.vents = [[640, 244, 7], [1076, 40, 4], [116, 34, 4]];
  S.crowd = sidewalkCrowd(x => S.lampX.some(l => Math.abs(x - l) < 16) || (x > 422 && x < 486));
  c = mk(BG.fgW, 20, true); g = c.g; snowLip(g, 0.4);
  for (const bx of [300, 980]) { R(g, OUT, bx - 1, 2, 18, 18); R(g, '#c02a1a', bx, 3, 16, 17); R(g, '#e85a3a', bx + 1, 3, 3, 17); R(g, OUT, bx + 3, 8, 10, 2); R(g, '#e8eef8', bx, 1, 16, 2); }   // red mailboxes
  S.fg = c;
  S.live = (g, nx, tick, lv, S) => { const [px, py] = S.pole, x = px + nx; if (x < -20 || x > W + 20) return; g.save(); g.beginPath(); g.rect(x, py, 8, 38); g.clip(); g.fillStyle = '#f0f0f8'; g.fillRect(x, py, 8, 38); for (let k = -2; k < 8; k++) { const y0 = py + k * 8 + ((tick >> 2) % 8); g.fillStyle = k & 1 ? '#2a4ac0' : '#d02a2a'; for (let j = 0; j < 8; j++) g.fillRect(x + j, y0 + j * 0.5, 1, 3); } g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 1, py, 1, 38); g.restore(); };
  return S;
}

/* ---------------- 4. ARTHUR STREET: plazas, traffic, the airport ---------------- */
function plane(g, x, y, tick) {   // a little turboprop on approach, nav lights blinking
  R(g, '#c8ccd8', x, y, 26, 4); R(g, '#e8ecf4', x + 2, y, 22, 1); R(g, '#c8ccd8', x + 20, y - 6, 4, 7); R(g, '#9aa0b0', x + 6, y + 2, 14, 2); R(g, '#3a4a8a', x + 3, y + 1, 18, 1);
  R(g, (tick >> 4) & 1 ? '#ff3a3a' : '#5a1414', x + 8, y + 3, 1, 1); R(g, (tick >> 4) & 1 ? '#3aff6a' : '#145a24', x + 14, y + 3, 1, 1); if ((tick % 50) < 4) R(g, '#ffffff', x + 22, y - 7, 2, 2);
}
function buildArthur() {
  seed = 2718; NEON.length = 0;
  const S = { id: 'arthur', gy: 214, aur: 0.4, car: 1, crowdY: 136 };
  let c = mk(W, H, true), g = c.g;
  gradRows(g, 0, 0, W, 200, ['#03040c', '#070a1c', '#10142e', '#1c1c3e', '#2e2444', '#4a2c44', '#6a3a40', '#8a4a3a', '#a85a34']);
  for (let i = 0; i < 60; i++) { const x = rnd() * W | 0, y = rnd() * 90 | 0; R(g, rnd() < 0.3 ? '#fff6c8' : '#6a70b0', x, y, 1, 1); }
  S.sky = c; S.clouds = cloudStrip(720, 50, ['#5a3a50', '#2e2038', '#7a4a3a'], 77); S.cloudY = 30;
  /* far: the Nor'Westers and two radio masts */
  c = mk(560, 200, true); g = c.g;
  g.fillStyle = '#1c1630'; g.beginPath(); g.moveTo(0, 200); for (const [x, y] of [[0, 112], [70, 100], [130, 106], [200, 90], [280, 98], [350, 88], [430, 100], [500, 94], [560, 104]]) g.lineTo(x, y); g.lineTo(560, 200); g.fill();
  for (let x = 0; x < 560; x++) if (dith(x, 1) < 0.3) R(g, '#2c2240', x, Math.round(104 + Math.sin(x * 0.03) * 6), 1, 1);
  for (const mx of [150, 420]) { for (let y = 30; y < 100; y++) { const hw = (y - 30) * 0.07 | 0; R(g, '#120e22', mx - hw, y, 1, 1); R(g, '#120e22', mx + hw, y, 1, 1); if (y % 6 === 0) R(g, '#120e22', mx - hw, y, hw * 2 + 1, 1); } }
  for (let y = 100; y < 200; y++) { g.fillStyle = 'rgba(168,90,52,' + Math.min(0.5, 0.005 * (y - 100)).toFixed(3) + ')'; g.fillRect(0, y, 560, 1); }
  S.far = c;
  /* mid: the airport: hangars, the tower, the terminal, the approach lights; a hotel tower */
  c = mk(660, 200, true); g = c.g;
  R(g, '#14122a', 20, 70, 60, 110); R(g, '#221e3a', 20, 70, 2, 110); for (let y = 76; y < 176; y += 8) for (let x = 25; x < 76; x += 8) R(g, rnd() < 0.3 ? '#e8b85a' : '#0a0a1a', x, y, 4, 4); R(g, '#14122a', 40, 60, 20, 10);
  for (const [hx, hw] of [[110, 90], [210, 70]]) { g.fillStyle = '#16142c'; g.beginPath(); g.ellipse(hx + hw / 2, 150, hw / 2, 24, 0, Math.PI, 0); g.fill(); R(g, '#16142c', hx, 150, hw, 28); R(g, '#24203e', hx + 4, 150, hw - 8, 1); R(g, '#0a0a18', hx + 10, 156, hw - 20, 22); for (let k = 0; k < 4; k++) R(g, '#2a2644', hx + 12 + k * (hw - 24) / 4, 156, 1, 22); }
  drawTxt(g, 'YQT', 132, 136, 2, 'rgba(220,220,240,0.35)');
  { const tx = 330; R(g, '#16142c', tx - 5, 56, 10, 122); R(g, '#24203e', tx - 5, 56, 2, 122); g.fillStyle = '#16142c'; g.beginPath(); g.moveTo(tx - 16, 42); g.lineTo(tx + 16, 42); g.lineTo(tx + 11, 58); g.lineTo(tx - 11, 58); g.fill(); gradRows(g, tx - 13, 45, 26, 8, ['#5affc8', '#2a9a8a']); for (let k = -12; k < 13; k += 5) R(g, '#0a1a1a', tx + k, 45, 1, 8); R(g, '#16142c', tx - 14, 38, 28, 4); R(g, '#16142c', tx - 1, 26, 2, 12); }
  R(g, '#14122a', 380, 140, 200, 38); R(g, '#24203e', 380, 140, 200, 1); gradRows(g, 384, 150, 192, 8, ['#ffe0a0', '#c89a5a']); for (let x = 384; x < 576; x += 6) R(g, '#14122a', x, 150, 1, 8); R(g, '#14122a', 440, 128, 80, 12); drawTxt(g, 'THUNDER BAY', 448, 130, 1, 'rgba(255,240,210,0.5)'); snowCap(g, 380, 140, 200, 2);
  gradRows(g, 0, 178, 660, 22, ['#120e1e', '#0e0a18', '#0a0812']); R(g, '#2a2638', 0, 178, 660, 1);   // apron + the airport road
  for (let x = 6; x < 660; x += 12) R(g, '#3a5aff', x, 179, 1, 1);
  S.mid = c;
  S.layers = [{ img: S.far, par: 0.08, y: 0 }, { img: S.mid, par: 0.25, y: 0 }];
  S.back = (g, T, tick, lv) => {
    const fx = Math.round(-T * 0.08), mx = Math.round(-T * 0.25), bl = (tick % 80) < 40;
    for (const [bx, by] of [[fx + 150, 29], [fx + 420, 29], [mx + 330, 25]]) { R(g, bl ? '#ff3a3a' : '#5a1414', bx - 1, by, 3, 2); if (bl && lv > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.4; g.drawImage(BG.glow, bx - 9, by - 9, 20, 20); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } }
    if (lv > 0) { const k = (tick >> 2) % 14; R(g, '#ffffff', mx + 600 - k * 12, 183, 2, 1); }   // the approach-light "rabbit"
    const cyc = tick % 1500; if (cyc < 900) { const p = cyc / 900, x = Math.round(fx + 540 - p * 520), y = Math.round(40 + p * 110); plane(g, x, y, tick); if (lv > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; g.drawImage(BG.head, x - 60, y - 12, 80, 24); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } }   // a turboprop on final
    for (let k = 0; k < 9; k++) {   // traffic out on the airport road
      const dir = k & 1 ? -1 : 1, sp = 0.5 + (k % 3) * 0.15, u = ((tick * sp + k * 137) % 760), x = Math.round(mx + (dir > 0 ? u - 50 : 710 - u)), y = dir > 0 ? 187 : 193;
      R(g, '#0a0812', x - 6, y - 3, 13, 4); if (dir > 0) { R(g, '#fff6dc', x + 6, y - 2, 2, 1); } else { R(g, '#ff3a3a', x + 6, y - 2, 2, 1); } R(g, dir > 0 ? '#ff3a3a' : '#fff6dc', x - 6, y - 2, 1, 1);
    }
  };
  /* near: Arthur Street W */
  c = mk(NW, H, true); g = c.g;
  // A (0-210): a strip plaza with lit sign boxes
  { const X = 0, Wd = 210; R(g, '#2a2630', X, 96, Wd, 96); for (let i = 0; i < 300; i++) R(g, 'rgba(0,0,0,0.2)', X + rnd() * Wd | 0, 96 + rnd() * 96 | 0, 2, 1); shadeV(g, X, 96, Wd, 20, 0.35, 0);
    R(g, OUT, X, 90, Wd + 2, 6); R(g, '#4a4654', X, 91, Wd + 2, 4); R(g, '#6a6676', X, 91, Wd + 2, 1); snowCap(g, X, 90, Wd + 2, 4);
    const U = [['PHARMACY', 'pharmacy', '#e8f4ff', '#c01818'], ['DONUTS', 'donut', '#ffe8d0', '#a0408a'], ['SUBS', 'subs', '#f0ffd0', '#1a6a2a']];
    U.forEach(([t, k, face, ink], i) => { const ux = X + 4 + i * 70; R(g, OUT, ux, 102, 64, 18); gradRows(g, ux + 1, 103, 62, 16, [face, '#c8c8d0']); drawTxt(g, t, ux + 32 - (txtW(t, 1) >> 1), 108, 1, ink); R(g, 'rgba(255,255,255,0.5)', ux + 1, 103, 62, 1); townWindow(g, k, ux + 4, 130, 56, 56); R(g, OUT, ux + 66, 100, 3, 92); glowAt(g, ux + 32, 196, 44, 12, '255,240,210', 0.2); });
    R(g, OUT, X, 124, Wd, 3); R(g, '#5a5664', X, 124, Wd, 2); snowCap(g, X, 124, Wd, 2); R(g, OUT, X, 186, Wd, 6); R(g, '#3a3644', X, 187, Wd, 5); }
  // B (214-340): the gas bar: canopy, pumps, a kiosk behind
  { R(g, '#221e2a', 250, 138, 70, 54); R(g, OUT, 250, 136, 70, 2); townWindow(g, 'corner', 258, 150, 40, 34); R(g, OUT, 302, 150, 14, 42); R(g, '#3a4a5a', 303, 151, 12, 41);
    for (const px of [232, 318]) { R(g, OUT, px - 3, 104, 7, 88); R(g, '#d8d8e0', px - 2, 104, 5, 88); R(g, '#c01818', px - 2, 150, 5, 6); }
    R(g, OUT, 214, 92, 126, 14); R(g, '#e8e8f0', 215, 93, 124, 8); R(g, '#c01818', 215, 101, 124, 4); R(g, '#a8a8b8', 215, 105, 124, 1); snowCap(g, 214, 92, 126, 4); R(g, '#fff6dc', 222, 106, 112, 1);
    for (const px of [256, 296]) { R(g, OUT, px - 1, 160, 16, 32); R(g, '#c8c8d0', px, 161, 14, 30); R(g, '#c01818', px, 161, 14, 5); R(g, '#1a3a2a', px + 2, 168, 10, 6); R(g, '#7aff8a', px + 3, 170, 6, 1); R(g, OUT, px + 14, 172, 3, 10); R(g, '#3a3a44', px + 2, 184, 10, 2); }
    glowAt(g, 277, 150, 70, 40, '255,250,235', 0.18); }
  // the price pylon
  { const x = 356; R(g, OUT, x - 2, 112, 5, 92); R(g, '#5a5e6a', x - 1, 112, 3, 92); R(g, OUT, x - 22, 56, 44, 58); R(g, '#c01818', x - 21, 57, 42, 14); drawTxt(g, 'GAS', x - 8, 61, 1, '#ffffff');
    for (const [t, y] of [['1.49', 74], ['1.62', 88], ['1.71', 102]]) { R(g, '#0a0a10', x - 21, y, 42, 12); drawTxt(g, t, x - 12, y + 2, 1, '#ffb020'); } snowCap(g, x - 22, 56, 44, 3); }
  // the intersection with Edward St: signal mast + street blades (signals are live)
  { const x = 444; R(g, OUT, x - 3, 40, 7, 164); R(g, '#6a6e7a', x - 2, 40, 5, 164); R(g, '#9a9eaa', x - 2, 40, 1, 164); R(g, OUT, x - 70, 42, 72, 4); R(g, '#6a6e7a', x - 70, 43, 72, 2); pxLine(g, OUT, x - 20, 46, x - 2, 60, 1); snowCap(g, x - 70, 42, 72, 2);
    for (const hx of [x - 62, x - 32]) { R(g, OUT, hx - 1, 46, 11, 30); R(g, '#e0c020', hx, 47, 9, 28); for (let k = 0; k < 3; k++) { disc(g, OUT, hx + 4, 52 + k * 9, 3); R(g, '#e0c020', hx - 2, 49 + k * 9, 2, 1); } }
    S.sig = [x - 62 + 4, x - 32 + 4];
    tbSign(g, x, 'ARTHUR ST W', 'EDWARD ST', 120); R(g, OUT, x + 8, 150, 4, 1); }
  // C (450-700): the plaza parking lot: a plowed snow mountain, a cart, parked cars, a light standard, the INTERCITY pylon
  { R(g, OUT, 450, 182, 250, 1); gradRows(g, 450, 183, 250, 9, ['#2a2832', '#1e1c26']);
    for (const [cx, col] of [[472, '#5a1a1a'], [526, '#1a2a4a'], [668, '#3a3a44']]) { R(g, OUT, cx - 1, 170, 42, 14); R(g, col, cx, 171, 40, 12); R(g, OUT, cx + 8, 162, 24, 9); R(g, '#2a3a5a', cx + 10, 164, 20, 6); R(g, OUT, cx + 4, 182, 8, 4); R(g, OUT, cx + 28, 182, 8, 4); snowCap(g, cx + 8, 162, 24, 3); R(g, '#ff3a3a', cx, 174, 2, 2); }
    g.fillStyle = OUT; g.beginPath(); g.moveTo(574, 186); g.quadraticCurveTo(612, 112, 650, 186); g.fill(); g.fillStyle = '#d0daea'; g.beginPath(); g.moveTo(577, 186); g.quadraticCurveTo(612, 116, 647, 186); g.fill();
    for (let i = 0; i < 90; i++) R(g, rnd() < 0.5 ? '#9aa8c4' : '#ffffff', 584 + rnd() * 56 | 0, 150 + rnd() * 34 | 0, 2, 1); for (let i = 0; i < 20; i++) R(g, '#4a4458', 584 + rnd() * 56 | 0, 160 + rnd() * 24 | 0, 1, 1);
    R(g, OUT, 600, 140, 18, 12); for (let k = 0; k < 4; k++) R(g, '#8a8a98', 601 + k * 4, 141, 1, 10); R(g, '#8a8a98', 601, 141, 16, 1); R(g, '#c01818', 616, 136, 3, 6);   // the shopping cart, half buried
    R(g, OUT, 560, 40, 4, 146); R(g, '#5a5e6a', 561, 40, 2, 146); R(g, OUT, 544, 36, 36, 6); R(g, '#ffe9a8', 546, 41, 12, 2); R(g, '#ffe9a8', 566, 41, 12, 2);
    const px = 690; R(g, OUT, px - 4, 30, 9, 160); R(g, '#3a3644', px - 3, 30, 7, 160); R(g, OUT, px - 34, 14, 68, 74); R(g, '#1a1a2a', px - 33, 15, 66, 72);
    for (const [t, y, col] of [['FOOD COURT', 44, '#ffe060'], ['CINEMA', 56, '#ff6a3a'], ['SPORTS', 68, '#7ad0ff']]) { R(g, '#e8e8f0', px - 30, y - 2, 60, 11); drawTxt(g, t, px - (txtW(t, 1) >> 1), y, 1, col === '#ffe060' ? '#8a5a00' : col); }
    snowCap(g, px - 34, 14, 68, 3); }
  // D (720-880): a burger joint with a drive-thru
  { const X = 720, Wd = 160; R(g, '#2e1a14', X, 120, Wd, 72); for (let i = 0; i < 200; i++) R(g, 'rgba(0,0,0,0.2)', X + rnd() * Wd | 0, 120 + rnd() * 72 | 0, 2, 1);
    g.fillStyle = OUT; g.beginPath(); g.moveTo(X - 6, 122); g.lineTo(X + 10, 92); g.lineTo(X + Wd - 10, 92); g.lineTo(X + Wd + 6, 122); g.fill(); g.fillStyle = '#6a2a14'; g.beginPath(); g.moveTo(X - 4, 121); g.lineTo(X + 11, 94); g.lineTo(X + Wd - 11, 94); g.lineTo(X + Wd + 4, 121); g.fill();
    for (let y = 98; y < 121; y += 4) R(g, '#4a1a0c', X + 6, y, Wd - 12, 1); snowCap(g, X + 10, 93, Wd - 20, 4); snowCap(g, X - 6, 122, Wd + 12, 2);
    townWindow(g, 'burger', X + 10, 134, 96, 50); R(g, OUT, X + 116, 132, 36, 60); gradRows(g, X + 117, 133, 34, 59, ['#3a2a20', '#c8905a', '#3a2a20']); R(g, OUT, X, 186, Wd, 6); R(g, '#3a2220', X, 187, Wd, 5);
    glowAt(g, X + 58, 196, 70, 12, '255,210,140', 0.22);
    NEON.push({ x: X + Wd / 2, y: 98, txt: 'BURGERS', col: '#ffb23a', s: 2, ph: 33 }, { x: X + Wd / 2 + 2, y: 70, txt: 'DRIVE THRU', col: '#7aff8a', s: 1, ph: 240 });
    R(g, OUT, X + 78, 82, 3, 12); }
  // E (880-1200): the airport-strip motel, doors along a balcony, the MOTEL blade (VACANCY flickers)
  { const X = 880, Wd = 320; brickWall(g, X, 60, Wd, 132, ['#1a1416', '#3a2a28', '#4a3632', '#2a1c1a'], 21); shadeV(g, X, 60, Wd, 40, 0.4, 0.05);
    R(g, OUT, X - 2, 52, Wd + 2, 8); R(g, '#6a5a50', X - 2, 53, Wd + 2, 6); R(g, '#8a7a70', X - 2, 53, Wd + 2, 1); snowCap(g, X - 2, 52, Wd + 2, 4);
    for (let i = 0; i < 6; i++) { const dx = X + 14 + i * 50; R(g, OUT, dx, 72, 18, 32); R(g, ['#2a4a6a', '#6a2a2a', '#2a5a4a'][i % 3], dx + 1, 73, 16, 31); R(g, '#d8b46a', dx + 13, 88, 2, 2); win(g, dx + 24, 76, 18, 16, { lit: rnd() < 0.5, kind: 'curtain', cc: '#8a6a2a' }); drawTxt(g, String(201 + i), dx + 2, 64, 1, '#c8c0b0'); }
    R(g, OUT, X, 104, Wd, 5); R(g, '#4a4a58', X, 105, Wd, 3); snowCap(g, X, 104, Wd, 3); R(g, OUT, X, 92, Wd, 1); for (let x = X; x < X + Wd; x += 6) R(g, OUT, x, 92, 1, 12);
    for (let i = 0; i < 4; i++) { const dx = X + 14 + i * 50; R(g, OUT, dx, 140, 18, 50); R(g, ['#6a2a2a', '#2a4a6a', '#2a5a4a'][i % 3], dx + 1, 141, 16, 49); R(g, '#d8b46a', dx + 13, 164, 2, 2); win(g, dx + 24, 146, 18, 16, { lit: rnd() < 0.5, kind: 'blinds' }); drawTxt(g, String(101 + i), dx + 2, 130, 1, '#c8c0b0'); R(g, '#fff6c8', dx + 7, 134, 4, 2); }
    townWindow(g, 'corner', X + 214, 140, 60, 44); R(g, OUT, X + 280, 140, 26, 52); gradRows(g, X + 281, 141, 24, 51, ['#3a2a30', '#c8905a', '#3a2a30']);
    NEON.push({ x: X + 244, y: 118, txt: 'OFFICE', col: '#57e0ff', s: 1, ph: 400 }, { x: X + Wd - 12, y: 14, txt: 'MOTEL', col: '#ff3a6a', s: 2, vert: 1, ph: 90 }, { x: X + Wd - 40, y: 129, txt: 'VACANCY', col: '#ff3a3a', s: 1, dodgy: 1, ph: 20 });
    R(g, OUT, X + Wd - 4, 10, 3, 104); R(g, OUT, X + Wd - 34, 40, 34, 2);
    R(g, OUT, X, 186, Wd, 6); R(g, '#3a3644', X, 187, Wd, 5); }
  S.lampX = [210, 560, 878]; for (const x of [210, 878]) cobraLamp(g, x, 1);
  streetFloor(g, c, S, { ph: 2.2, road: ['#201e2a', '#18161f', '#121019', '#0c0a12'], clear: x => [210, 878].some(l => Math.abs(x - l) < 10) || (x > 214 && x < 340) || (x > 404 && x < 470) || (x > 724 && x < 760), cross: [[408, 60]], puddles: [[110, 232, 40, 4], [580, 258, 56, 5], [1000, 232, 40, 3], [1120, 260, 50, 5]], man: [300, 248],
    paint: g => { for (let x = 4; x < NW; x += 48) { if (x > 396 && x < 476) continue; R(g, '#c8c8d0', x, 232, 24, 1); R(g, '#c8c8d0', x, 252, 24, 1); } R(g, '#b8a048', 0, 242, 396, 1); R(g, '#b8a048', 0, 244, 396, 1); R(g, '#b8a048', 476, 242, NW - 476, 1); R(g, '#b8a048', 476, 244, NW - 476, 1); for (let k = 0; k < 3; k++) { const ax = 800 + k * 120; R(g, '#c8c8d0', ax, 222, 14, 1); R(g, '#c8c8d0', ax + 10, 220, 1, 5); R(g, '#c8c8d0', ax + 11, 221, 1, 3); } } });
  S.near = c;
  S.neon = NEON.slice(); neonSprites(S.neon);
  S.lamps = [{ x: 232, y: 66, cone: 1, pool: 232 }, { x: 900, y: 66, cone: 1, pool: 232 }, { x: 562, y: 44, cone: 0, pool: 190, a: 0.7 }, { x: 277, y: 108, cone: 1, pool: 200, a: 0.6 }];
  S.vents = [[300, 246, 6], [760, 90, 4]];
  S.crowd = sidewalkCrowd(x => [210, 878].some(l => Math.abs(x - l) < 16) || Math.abs(x - 444) < 14 || Math.abs(x - 356) < 10);
  c = mk(BG.fgW, 20, true); g = c.g; snowLip(g, 2.7);
  for (const px of [260, 900]) { g.fillStyle = OUT; g.beginPath(); g.moveTo(px - 9, 20); g.lineTo(px - 3, 3); g.lineTo(px + 3, 3); g.lineTo(px + 9, 20); g.fill(); g.fillStyle = '#ff6a12'; g.beginPath(); g.moveTo(px - 7, 20); g.lineTo(px - 2, 5); g.lineTo(px + 2, 5); g.lineTo(px + 7, 20); g.fill(); R(g, '#f0f0f0', px - 4, 10, 8, 2); }
  S.fg = c;
  S.live = (g, nx, tick, lv, S) => {   // the signals cycle (green 6 s, amber 1.5 s, red 6 s)
    const t = tick % 810, st = t < 360 ? 2 : t < 450 ? 1 : 0, cols = [['#ff2a2a', '#5a1010'], ['#ffc02a', '#5a4010'], ['#3aff7a', '#105a24']];
    for (const hx of S.sig) { const x = hx + nx; if (x < -20 || x > W + 20) continue; for (let k = 0; k < 3; k++) { disc(g, k === st ? cols[k][0] : cols[k][1], x, 52 + k * 9, 2); if (k === st && lv > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5; g.drawImage(BG.glow, x - 10, 42 + k * 9, 20, 20); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } } }
  };
  return S;
}

/* ---------------- 5. HIGH STREET: up the hill, the lake and the Sleeping Giant below ---------------- */
function bareTree(g, x, base, h, sd) {   // a big snowy maple, no leaves
  seed = sd; R(g, OUT, x - 3, base - h * 0.45, 7, h * 0.45); R(g, '#2a1e1a', x - 2, base - h * 0.45, 5, h * 0.45);
  const br = (x0, y0, a, l, d) => { const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l; pxLine(g, '#1a1214', x0, y0, x1, y1, d > 2 ? 2 : 1); if (d > 3 && rnd() < 0.7) R(g, '#dfe7f4', (x0 + x1) / 2 | 0, ((y0 + y1) / 2 | 0) - 1, 2, 1); if (d > 0) { br(x1, y1, a - 0.35 - rnd() * 0.3, l * 0.72, d - 1); br(x1, y1, a + 0.35 + rnd() * 0.3, l * 0.72, d - 1); } };
  br(x, base - h * 0.45, -Math.PI / 2, h * 0.22, 5);
}
function spruce(g, x, base, h) { R(g, OUT, x - 2, base - 6, 4, 6); for (let k = 0; k < 6; k++) { const w2 = 3 + k * h * 0.045, y2 = base - h + k * h * 0.14; g.fillStyle = OUT; g.beginPath(); g.moveTo(x - w2 - 1, y2 + h * 0.2 + 1); g.lineTo(x, y2 - 1); g.lineTo(x + w2 + 1, y2 + h * 0.2 + 1); g.fill(); g.fillStyle = '#12301e'; g.beginPath(); g.moveTo(x - w2, y2 + h * 0.2); g.lineTo(x, y2); g.lineTo(x + w2, y2 + h * 0.2); g.fill(); R(g, '#dfe7f4', x - w2 + 2, y2 + h * 0.2 - 2, w2 * 2 - 4, 2); R(g, '#ffffff', x - 1, y2 + 1, 2, 2); } }
function house(g, h) {   // an older two-storey frame house on a raised lot: gable or hip roof, porch, retaining wall, steps
  const { x, w, yb } = h, top = yb - 78, ap = h.hip ? top - 22 : top - Math.round(w * 0.36);
  // retaining wall + steps down to the sidewalk
  if (yb < SWT) { R(g, OUT, x - 6, yb, w + 12, SWT - yb); for (let yy = yb + 1; yy < SWT; yy += 6) for (let xx = x - 5 + ((yy >> 1) & 4); xx < x + w + 6; xx += 10) { R(g, '#4a4654', xx, yy, 9, 5); R(g, '#5e5a6a', xx, yy, 9, 1); } snowCap(g, x - 6, yb, w + 12, 3);
    const sx = x + h.door - 4; R(g, OUT, sx - 1, yb, 22, SWT - yb); for (let yy = yb; yy < SWT; yy += 4) { R(g, '#6a6676', sx, yy, 20, 3); R(g, '#dfe7f4', sx, yy, 20, 1); } }
  clapboard(g, x, top, w, yb - top, h.cols); shadeV(g, x, top, w, 30, 0.35, 0.05);
  R(g, OUT, x - 1, top, 1, yb - top); R(g, OUT, x + w, top, 1, yb - top); R(g, h.trim, x, top, 3, yb - top); R(g, h.trim, x + w - 3, top, 3, yb - top); R(g, 'rgba(0,0,0,0.35)', x + w - 4, top, 4, yb - top);
  // roof (snow-covered), eaves shadow
  g.fillStyle = OUT; g.beginPath(); if (h.hip) { g.moveTo(x - 8, top + 1); g.lineTo(x + 18, ap - 1); g.lineTo(x + w - 18, ap - 1); g.lineTo(x + w + 8, top + 1); } else { g.moveTo(x - 8, top + 1); g.lineTo(x + w / 2, ap - 1); g.lineTo(x + w + 8, top + 1); } g.fill();
  g.fillStyle = h.roof; g.beginPath(); if (h.hip) { g.moveTo(x - 6, top); g.lineTo(x + 19, ap); g.lineTo(x + w - 19, ap); g.lineTo(x + w + 6, top); } else { g.moveTo(x - 6, top); g.lineTo(x + w / 2, ap); g.lineTo(x + w + 6, top); } g.fill();
  for (let yy = ap + 2; yy < top; yy++) { const f = (yy - ap) / (top - ap), hw = h.hip ? (w / 2 - 19) + f * 25 : f * (w / 2 + 6); for (let xx = Math.round(x + w / 2 - hw); xx < x + w / 2 + hw; xx++) if (dith(xx, yy) < 0.78 - f * 0.5) R(g, (yy & 3) ? '#dfe7f4' : '#c8d4e8', xx, yy, 1, 1); }
  R(g, 'rgba(0,0,0,0.45)', x, top, w, 3); for (let i = x - 4; i < x + w + 4; i += 7) R(g, '#b8c8e0', i, top + 1, 1, 2 + (i % 3));
  if (!h.hip) { win(g, x + (w >> 1) - 7, ap + Math.round((top - ap) * 0.45), 14, 14, { lit: h.attic, kind: 'curtain', st: h.trim, cc: '#6a2a2a' }); }
  if (h.chim) { const cx = x + h.chim, cy = h.hip ? ap - 14 : ap + Math.round((top - ap) * Math.abs(h.chim - w / 2) / (w / 2)) - 14; brickWall(g, cx, cy, 12, 22, ['#1a0e10', '#4a2622', '#5e302c', '#341a18'], 7, 6, 3); R(g, OUT, cx - 1, cy - 3, 14, 3); snowCap(g, cx - 1, cy - 3, 14, 3); h.smoke = [cx + 6, cy - 4]; }
  // windows: two floors
  const wy = [top + 10, top + 44];
  for (let r = 0; r < 2; r++) for (const fx of h.wins) { if (r === 1 && Math.abs(fx - h.door) < 22) continue; win(g, x + fx, wy[r], 16, 22, { lit: rnd() < 0.55, kind: ['curtain', 'blinds', 'plant', 'person'][rnd() * 4 | 0], st: h.trim, cc: ['#7a2a2a', '#2a4a7a', '#5a3a6a'][r] }); }
  // porch: roof, posts, rail, the door and its light
  const p0 = x + h.door - 18, p1 = x + h.door + 34;
  R(g, OUT, p0 - 2, yb - 36, p1 - p0 + 4, 5); R(g, h.trim, p0 - 1, yb - 35, p1 - p0 + 2, 3); snowCap(g, p0 - 2, yb - 36, p1 - p0 + 4, 3);
  for (const px of [p0, p1 - 3]) { R(g, OUT, px - 1, yb - 32, 5, 32); R(g, h.trim, px, yb - 32, 3, 32); }
  R(g, OUT, p0, yb - 14, p1 - p0, 2); R(g, h.trim, p0, yb - 14, p1 - p0, 1); for (let px = p0 + 2; px < p1 - 2; px += 4) { if (px > x + h.door - 2 && px < x + h.door + 18) continue; R(g, h.trim, px, yb - 12, 1, 12); }
  R(g, OUT, x + h.door - 1, yb - 30, 18, 30); R(g, h.doorC, x + h.door, yb - 29, 16, 29); R(g, '#ffd890', x + h.door + 3, yb - 26, 10, 6); R(g, '#d8b46a', x + h.door + 13, yb - 14, 2, 2);
  R(g, OUT, x + h.door + 20, yb - 28, 4, 5); R(g, '#fff6c8', x + h.door + 21, yb - 27, 2, 3);
  R(g, OUT, p0 - 2, yb - 1, p1 - p0 + 4, 2);
  if (h.lights) h.lightsAt = [p0, yb - 31, p1 - p0];
  glowAt(g, x + h.door + 8, yb - 10, 40, 16, '255,210,150', 0.18);
  if (h.mailbox) { R(g, OUT, x + h.door + 24, yb - 22, 10, 7); R(g, '#1a1a22', x + h.door + 25, yb - 21, 8, 5); }
}
function buildHigh() {
  seed = 3141; NEON.length = 0;
  const S = { id: 'high', gy: 214, aur: 1.25, car: 0, crowdY: 136 };
  let c = mk(W, H, true), g = c.g;
  gradRows(g, 0, 0, W, 200, ['#01020a', '#03061a', '#060c28', '#0c1638', '#142048', '#1e2a58', '#2e3462', '#423a68']);
  for (let i = 0; i < 220; i++) { const x = rnd() * W | 0, y = rnd() * 130 | 0, b = rnd(); R(g, b < 0.18 ? '#fff6c8' : b < 0.55 ? '#9aa6e8' : '#4a5090', x, y, 1, 1); if (b < 0.03) { R(g, '#6a74c0', x - 1, y, 3, 1); R(g, '#6a74c0', x, y - 1, 1, 3); R(g, '#ffffff', x, y, 1, 1); } }
  for (let i = 0; i < 200; i++) { const t = rnd(), x = 60 + t * 360 + (rnd() - 0.5) * 30, y = 10 + t * 50 + (rnd() - 0.5) * 20; R(g, 'rgba(200,210,255,0.25)', x | 0, y | 0, 1, 1); }   // the Milky Way
  S.sky = c; S.clouds = cloudStrip(720, 40, ['#26305a', '#141a3a', '#3a3a62'], 33); S.cloudY = 96;
  /* far: Lake Superior from the hill: the Sleeping Giant across the water, the city lights along the shore */
  c = mk(560, 200, true); g = c.g;
  const HZ = 122, gp = [[0, 103], [40, 102], [70, 98], [100, 93], [130, 84], [160, 74], [185, 71], [205, 76], [235, 85], [262, 83], [290, 70], [320, 62], [360, 60], [400, 62], [425, 70], [440, 78], [452, 74], [462, 64], [474, 60], [486, 62], [494, 56], [500, 62], [512, 76], [530, 92], [560, 101], [640, 103]].map(([x, y]) => [x * 0.56 + 112, HZ - (103 - y) * 1.15]);
  g.fillStyle = '#2a3468'; g.beginPath(); g.moveTo(0, HZ); for (const p of gp) g.lineTo(p[0], p[1]); g.lineTo(560, HZ); g.closePath(); g.fill();
  for (let i = 1; i < gp.length; i++) { const [x0, y0] = gp[i - 1], [x1, y1] = gp[i]; for (let x = Math.ceil(x0); x < x1; x++) { const y = Math.round(y0 + (y1 - y0) * (x - x0) / (x1 - x0)); if (y1 < y0 || dith(x, 0) < 0.5) R(g, '#dfe7f4', x, y, 1, 1); if (dith(x, 1) < 0.3) R(g, '#2a3064', x, y + 1, 1, 2); } }   // moonlit snow along the Giant's back
  gradRows(g, 0, HZ, 560, 40, ['#222c5e', '#1a2450', '#141c44', '#10163a', '#0c1230']);
  for (let i = 0; i < 90; i++) { const x = rnd() * 560 | 0, y = HZ + 2 + rnd() * 26 | 0; R(g, rnd() < 0.5 ? '#2e3a72' : '#222c5a', x, y, 3 + rnd() * 12 | 0, 1); }
  for (let x = 0; x < 560; x += 2) { const y = HZ + 22 + Math.sin(x * 0.03) * 3; R(g, '#1e2852', x, y | 0, 2, 1); }   // the ice edge
  for (let y = HZ + 1; y < HZ + 22; y++) { const hw = 3 + (y - HZ) * 0.9; for (let k = 0; k < 3; k++) if (rnd() < 0.55) R(g, rnd() < 0.4 ? '#f4f0d8' : '#9aa6d8', 300 + (rnd() - 0.5) * hw * 2 | 0, y, 2 + rnd() * 4 | 0, 1); }   // moon path on the open water
  gradRows(g, 0, 160, 560, 40, ['#0e1028', '#0a0c20', '#080918']);
  for (let i = 0; i < 260; i++) { const x = rnd() * 560 | 0, y = 160 + Math.pow(rnd(), 1.5) * 38 | 0; R(g, rnd() < 0.75 ? '#e8b85a' : rnd() < 0.5 ? '#ffe9c8' : '#7fb0d0', x, y, 1, 1); }   // Port Arthur below
  for (const [ex, n] of [[90, 7], [300, 5]]) for (let i = 0; i < n; i++) R(g, '#10132e', ex + i * 7, 146, 6, 16);
  S.far = c;
  /* mid: rooftops stepping down the hill, a steeple, more maples */
  c = mk(660, 200, true); g = c.g;
  for (let i = 0; i < 18; i++) { const x = i * 38 + (rnd() * 10 | 0), w = 30 + rnd() * 10 | 0, base = 200, top = 156 + i * 1.2 + rnd() * 8 | 0, ap = top - 12 - (rnd() * 6 | 0);
    g.fillStyle = '#0e0c1e'; g.fillRect(x, top, w, base - top); g.beginPath(); g.moveTo(x - 3, top); g.lineTo(x + w / 2, ap); g.lineTo(x + w + 3, top); g.fill();
    for (let yy = ap + 1; yy < top; yy++) { const f = (yy - ap) / (top - ap); for (let xx = Math.round(x + w / 2 - f * (w / 2 + 2)); xx < x + w / 2 + f * (w / 2 + 2); xx++) if (dith(xx, yy) < 0.6 - f * 0.3) R(g, '#c8d4e8', xx, yy, 1, 1); }
    for (let k = 0; k < 3; k++) if (rnd() < 0.5) R(g, rnd() < 0.8 ? '#e8b85a' : '#7fb0d0', x + 4 + k * 9, top + 6 + (rnd() * 12 | 0), 3, 4); }
  R(g, '#0e0c1e', 250, 108, 18, 60); g.fillStyle = '#0e0c1e'; g.beginPath(); g.moveTo(247, 110); g.lineTo(259, 70); g.lineTo(271, 110); g.fill(); R(g, '#e8b85a', 256, 124, 5, 8); R(g, '#0e0c1e', 258, 62, 2, 9); R(g, '#0e0c1e', 255, 65, 8, 2);
  for (let i = 0; i < 10; i++) { const tx = 20 + i * 66 + (rnd() * 20 | 0); for (let k = 0; k < 40; k++) { const a = -Math.PI / 2 + (rnd() - 0.5) * 1.8, l = 6 + rnd() * 16; pxLine(g, '#0a0816', tx, 168, tx + Math.cos(a) * l, 168 + Math.sin(a) * l * 1.3, 1); } }
  for (let i = 0; i < 14; i++) { const x = 10 + i * 48; R(g, '#ffe9a8', x, 180 + (i & 1) * 2, 2, 2); }
  S.mid = c;
  S.layers = [{ img: S.far, par: 0.08, y: 0 }, { img: S.mid, par: 0.25, y: 0 }];
  S.back = (g, T, tick, lv) => {
    const fx = Math.round(-T * 0.08);
    const cyc = tick % 4000, lx = Math.round(fx + 520 - cyc * 0.14);   // a laker creeps across the bay
    R(g, OUT, lx - 26, HZ + 8, 52, 4); R(g, '#3a1414', lx - 25, HZ + 9, 50, 2); R(g, '#d8d8e0', lx + 16, HZ + 4, 9, 5); for (let k = 0; k < 5; k++) R(g, '#ffe9a8', lx - 20 + k * 8, HZ + 8, 1, 1);
    if (lv > 0) for (let k = 0; k < 12; k++) { const x = fx + ((k * 47) % 560), y = 162 + (k * 13) % 34; if (((tick >> 4) + k * 7) % 11 === 0) R(g, '#ffffff', x, y, 1, 1); }   // the city twinkles
  };
  /* near: High Street, climbing */
  c = mk(NW, H, true); g = c.g;
  const HS = [
    { x: 6, w: 150, yb: 190, cols: ['#3a4a5e', '#55667e', '#26324a'], trim: '#d8d8e0', roof: '#2a2a3a', door: 40, doorC: '#6a1a1a', wins: [14, 70, 116], chim: 112, attic: 1, lights: 1, mailbox: 1 },
    { x: 236, w: 140, yb: 184, cols: ['#5a2a24', '#7a3a30', '#3a1a16'], trim: '#e8e0d0', roof: '#2a2026', door: 58, doorC: '#1a3a2a', wins: [12, 46, 104], chim: 26, hip: 1 },
    { x: 650, w: 150, yb: 176, cols: ['#6a5a2a', '#8a7a40', '#4a3e1a'], trim: '#f0ece0', roof: '#2a2a30', door: 28, doorC: '#2a2a4a', wins: [62, 92, 122], chim: 120, attic: 0, lights: 1 },
    { x: 840, w: 140, yb: 172, cols: ['#3a3a44', '#55555e', '#26262e'], trim: '#c8c0b0', roof: '#24202a', door: 92, doorC: '#4a1a1a', wins: [10, 44, 70], chim: 20, hip: 1, mailbox: 1 },
    { x: 1030, w: 160, yb: 168, cols: ['#1e4a3a', '#2e6a52', '#123024'], trim: '#e8e0d0', roof: '#2a2226', door: 40, doorC: '#6a4a1a', wins: [12, 76, 106, 134], chim: 130, attic: 1, lights: 1 }
  ];
  S.vents = []; S.porch = [];
  // the far side of the street first: spruce + maples behind the houses
  for (const [tx, th] of [[188, 120], [420, 70], [610, 96], [1004, 100]]) spruce(g, tx, 186, th);
  for (const [tx, th, sd] of [[208, 150, 51], [560, 140, 52], [812, 130, 53]]) bareTree(g, tx, 196, th, sd);
  seed = 3142;
  for (const h of HS) { house(g, h); if (h.smoke) S.vents.push([h.smoke[0], h.smoke[1], 4]); if (h.lightsAt) S.porch.push(h.lightsAt); }
  // the corner store in house 4 (the old front room): neon in the window
  NEON.push({ x: 840 + 46, y: 128, txt: 'CORNER STORE', col: '#ffd23a', s: 1, ph: 50 }, { x: 840 + 34, y: 150, txt: 'OPEN', col: '#ff3a3a', s: 1, ph: 300 });
  townWindow(g, 'corner', 852, 140, 66, 26);
  // the lookout (440-640): a stone wall + iron rail at the edge of the hill; the view drops away to the lake
  { const L0 = 440, L1 = 640; R(g, OUT, L0, 168, L1 - L0, 24); for (let yy = 169; yy < 192; yy += 6) for (let xx = L0 + ((yy >> 1) & 4); xx < L1; xx += 10) { R(g, '#4a4654', xx, yy, 9, 5); R(g, '#5e5a6a', xx, yy, 9, 1); } snowCap(g, L0, 168, L1 - L0, 4);
    R(g, OUT, L0, 148, L1 - L0, 2); for (let x = L0 + 3; x < L1; x += 7) { R(g, OUT, x, 148, 1, 20); R(g, OUT, x - 1, 146, 3, 2); } snowCap(g, L0, 148, L1 - L0, 2);
    const bx = 520; R(g, OUT, bx, 156, 46, 4); R(g, '#5a3a24', bx + 1, 157, 44, 2); R(g, OUT, bx, 162, 46, 3); R(g, '#5a3a24', bx + 1, 163, 44, 1); R(g, OUT, bx + 4, 165, 3, 3); R(g, OUT, bx + 38, 165, 3, 3); snowCap(g, bx, 156, 46, 2);   // a bench
    R(g, OUT, 470, 120, 3, 48); R(g, OUT, 450, 112, 44, 12); R(g, '#1a4a8a', 451, 113, 42, 10); drawTxt(g, 'LOOKOUT', 454, 115, 1, '#e8e8f0'); snowCap(g, 450, 112, 44, 2); }
  tbSign(g, 400, 'HIGH ST N', 'RED RIVER RD');
  // wooden poles, lines sagging up the hill
  S.lampX = [192, 620, 1010]; const heads = S.lampX.map(x => woodPole(g, x));
  for (let i = 0; i < 2; i++) for (const dy of [0, 5]) sag(g, '#0a0810', S.lampX[i] - 19 + (dy ? 38 : 0), 44, S.lampX[i + 1] - 19 + (dy ? 38 : 0), 44, 12 + dy);
  sag(g, '#0a0810', 0, 50, S.lampX[0] - 19, 44, 6); sag(g, '#0a0810', S.lampX[2] + 19, 44, 1200, 40, 6);
  streetFloor(g, c, S, { ph: 3.1, walk: ['#5a5a68', '#4c4a58', '#403e4c', '#34323d'], clear: x => S.lampX.some(l => Math.abs(x - l) < 10) || (x > 380 && x < 420) || HS.some(h => Math.abs(x - (h.x + h.door + 6)) < 14), cross: [[376, 48]], puddles: [[140, 236, 36, 3], [520, 256, 50, 5], [900, 232, 40, 4], [1100, 258, 46, 4]], man: [740, 248],
    paint: g => { for (let i = 0; i < 26; i++) { let x = rnd() * NW, y = 222 + rnd() * 40; for (let k = 0; k < 30; k++) { R(g, '#3a3846', x | 0, y | 0, 2, 1); x += 2; y += (rnd() - 0.5) * 1.2; } } } });   // tyre ruts in packed snow
  S.near = c;
  S.neon = NEON.slice(); neonSprites(S.neon);
  S.lamps = heads.map(x => ({ x, y: 76, cone: 1, pool: 232, a: 0.85 }));
  S.crowd = sidewalkCrowd(x => S.lampX.some(l => Math.abs(x - l) < 16) || Math.abs(x - 400) < 12);
  c = mk(BG.fgW, 20, true); g = c.g; snowLip(g, 1.9);
  for (const hx of [380, 1100]) { R(g, OUT, hx - 1, 5, 14, 15); R(g, '#e0a020', hx, 6, 12, 14); R(g, '#f0c040', hx + 1, 6, 3, 14); R(g, OUT, hx - 3, 10, 18, 4); R(g, '#b07a10', hx - 2, 11, 16, 2); R(g, OUT, hx + 3, 2, 6, 4); R(g, '#e0a020', hx + 4, 3, 4, 2); R(g, '#e8eef8', hx, 4, 12, 2); }   // yellow hydrants
  for (const bx of [740]) { R(g, OUT, bx - 1, 1, 18, 19); R(g, '#1a5a2a', bx, 2, 16, 18); R(g, '#2a7a3a', bx + 1, 2, 3, 18); R(g, OUT, bx - 2, 0, 20, 3); R(g, '#e8eef8', bx - 1, -1, 18, 2); }   // a green bin
  S.fg = c;
  S.live = (g, nx, tick, lv, S) => {   // porch Christmas lights chase; the cat in the green house's window
    const cols = ['#ff3a3a', '#3aff6a', '#3a8aff', '#ffd23a', '#ff6ad8'];
    for (const [px, py, pw] of S.porch) { if (px + nx > W + 20 || px + pw + nx < -20) continue; for (let k = 0; k * 5 < pw; k++) { const x = px + k * 5 + nx, y = py + 2 + Math.round(Math.sin(k * 0.9) * 1.5), on = ((k + (tick >> 4)) % 3) !== 0; g.fillStyle = on ? cols[k % 5] : '#2a2030'; g.fillRect(x, y, 2, 2); } }
    const cx = 1030 + 12 + 4 + nx; if (cx > -20 && cx < W + 20) catSit(g, cx, 168 - 78 + 44 + 22, tick, stageCheer());
  };
  return S;
}
</script>
