<script>
'use strict';
/* =====================================================================
   STAGE 2: MAY STREET ALLEY BAR, Fort William, Thunder Bay.
   The back alley behind a dive bar off May Street, late night: brick,
   a lit back door under a caged bulb, the tavern's neon, dumpsters,
   kegs + crates, a fire escape, a chain-link fence, slush puddles, a cat
   on the dumpster, regulars by the door, and a slice of May Street (and
   the grain elevators, faint) through the alley mouth.
   Built once by buildAlley() (called from 3d.js), same layer scheme as
   Bay Street: sky / far / mid / near / crowd frames / fg + live bits.
   ===================================================================== */
function pxLine(g, c, x0, y0, x1, y1, w) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; g.fillStyle = c; for (let i = 0; i <= n; i++) { const k = n ? i / n : 0; g.fillRect(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k), w || 1, w || 1); } }
function brickWall(g, x0, y0, w, h, cols, seedX) {   // [mortar, brick, lit brick, dark brick]
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
    const row = (y - y0) >> 2, mortar = ((y - y0) & 3) === 3 || ((x + (row & 1 ? 4 : 0)) & 7) === 7;
    const n = ((((x + (row & 1 ? 4 : 0)) >> 3) * 73 + row * 151 + (seedX || 0)) % 11);
    g.fillStyle = mortar ? cols[0] : n === 0 ? cols[3] : (dith(x, y) < 0.16 || n === 5 ? cols[2] : cols[1]); g.fillRect(x, y, 1, 1);
  }
}
function keg(g, x, y) {   // generic steel keg, 16 x 22
  const cols = ['#3a4048', '#5a626c', '#8a929c', '#c8d0d8', '#9aa2ac', '#6a727c', '#4a5058', '#30363e'];
  for (let i = 0; i < 16; i++) R(g, cols[Math.min(7, i >> 1)], x + i, y + 2, 1, 18);
  R(g, OUT, x - 1, y + 1, 18, 1); R(g, OUT, x - 1, y + 20, 18, 2); R(g, OUT, x - 1, y + 1, 1, 21); R(g, OUT, x + 16, y + 1, 1, 21);
  for (const ry of [y + 3, y + 10, y + 17]) { R(g, '#2a3038', x, ry, 16, 1); R(g, '#dfe6ee', x + 5, ry + 1, 3, 1); }
  R(g, '#5a626c', x + 1, y, 14, 2); R(g, '#9aa2ac', x + 5, y, 6, 1); R(g, '#e8eef8', x + 2, y - 1, 12, 1);   // rim + a dusting of snow
}
function crate(g, x, y, c, d) {   // stackable plastic crate, 18 x 12
  R(g, OUT, x - 1, y - 1, 20, 14); R(g, c, x, y, 18, 12); R(g, d, x, y + 10, 18, 2);
  for (let k = 0; k < 4; k++) R(g, d, x + 2 + k * 4, y + 3, 2, 5);
  R(g, 'rgba(255,255,255,0.18)', x, y, 18, 1);
}
function dumpster(g, x, y, col) {   // 64 x 38, top-left at (x, y)
  const [c0, c1, c2] = col;
  R(g, OUT, x - 1, y + 3, 66, 33); R(g, c1, x, y + 4, 64, 31);
  for (let i = 0; i < 64; i += 8) { R(g, c2, x + i + 2, y + 8, 2, 25); R(g, c0, x + i + 4, y + 8, 1, 25); }
  R(g, c2, x, y + 4, 64, 3); R(g, c0, x, y + 33, 64, 2);
  R(g, OUT, x - 3, y - 1, 70, 6); R(g, '#1a1a22', x - 2, y, 68, 4); R(g, '#2e2e3a', x - 2, y, 68, 1);   // lid
  R(g, '#e4ecf8', x - 1, y - 3, 66, 3); R(g, '#ffffff', x + 6, y - 3, 30, 1); for (let i = 0; i < 66; i += 5) if (dith(i, 1) < 0.5) R(g, '#b0bed2', x - 1 + i, y - 1, 2, 1);
  for (const wx of [x + 6, x + 52]) { R(g, OUT, wx, y + 35, 7, 4); R(g, '#3a3a44', wx + 2, y + 36, 3, 2); }
  R(g, '#0b0712', x + 24, y + 14, 16, 6); R(g, '#d8d0c0', x + 25, y + 15, 14, 4); R(g, '#0b0712', x + 27, y + 16, 10, 1); R(g, '#0b0712', x + 27, y + 18, 7, 1);   // generic stencil plate
}
function bag(g, x, y, r) { disc(g, OUT, x, y, r + 1); disc(g, '#121218', x, y, r); disc(g, '#24242e', x - (r >> 2), y - (r >> 2), r >> 1); R(g, '#5a5a6a', x - (r >> 1), y - (r >> 1), 2, 1); R(g, OUT, x - 1, y - r - 2, 3, 3); }
function buildAlley() {
  seed = 777;
  const S = { id: 'alley', gy: 214, crowdY: 164, midY: 0, aur: 0.45 };
  /* sky: sodium haze over Fort William, a handful of stars, low cloud */
  let c = mk(W, 140, true), g = c.g;
  gradRows(g, 0, 0, W, 140, ['#04040c', '#08081a', '#11122a', '#221a36', '#3a2236', '#5a3030', '#7a4228']);
  for (let i = 0; i < 50; i++) { const x = rnd() * W | 0, y = rnd() * 70 | 0, b = rnd(); R(g, b < 0.2 ? '#fff6c8' : '#7a80c0', x, y, 1, 1); }
  for (const [x0, y0, w0] of [[10, 52, 160], [200, 40, 120], [330, 58, 150]]) for (let i = 0; i < w0; i++) { const h = 3 + Math.sin(i * 0.17 + x0) * 2 + Math.sin(i * 0.05) * 2; R(g, '#2a1c30', x0 + i, y0 - h, 1, h + 3); if (dith(i, 1) < 0.35) R(g, '#5a3434', x0 + i, y0 + 2, 1, 1); }
  S.sky = c;
  /* far: Mount McKay's mesa and the grain elevators, faint through the haze */
  c = mk(640, 140); g = c.g;
  g.fillStyle = '#1a1428'; g.beginPath(); g.moveTo(0, 140); for (const [x, y] of [[0, 104], [30, 100], [60, 86], [80, 78], [150, 76], [170, 80], [190, 94], [230, 104], [260, 108]]) g.lineTo(x, y); g.lineTo(260, 140); g.fill();
  for (let x = 62; x < 186; x++) if (dith(x, 0) < 0.5) R(g, '#2a1e34', x, Math.round(x < 80 ? 86 - (x - 62) * 0.45 : x < 150 ? 77 : 77 + (x - 150) * 0.4), 1, 1);
  const EL = (x0, n, top, col, hi) => {   // a row of silos + headhouse, low contrast
    for (let i = 0; i < n; i++) { const x = x0 + i * 9; R(g, col, x, top + 18, 8, 140); R(g, hi, x + 1, top + 18, 1, 140); R(g, hi, x, top + 17, 8, 1); }
    R(g, col, x0 - 8, top, 26, 20); R(g, hi, x0 - 8, top, 26, 1); R(g, col, x0, top - 8, 10, 9); R(g, '#c84a3a', x0 + 4, top - 10, 2, 2);
    R(g, col, x0 + 18, top + 10, n * 9 - 18, 3);
    for (let i = 0; i < 4; i++) R(g, '#6a4a3a', x0 - 5 + i * 6, top + 8, 2, 2);
  };
  EL(286, 10, 54, '#1c1830', '#2e2640'); EL(470, 7, 66, '#1a162c', '#28223a');
  for (let y = 0; y < 140; y++) if (y > 96) { g.fillStyle = 'rgba(122,66,40,' + (0.012 * (y - 96) / 4).toFixed(3) + ')'; g.fillRect(0, y, 640, 1); }   // haze at the bottom
  S.far = c;
  /* mid: nearer rooftops, chimneys, a water tank, an antenna */
  c = mk(760, 150); g = c.g;
  for (const [x, w, top] of [[0, 90, 74], [96, 60, 64], [170, 120, 82], [300, 70, 70], [380, 110, 86], [500, 80, 72], [590, 90, 80], [690, 70, 66]]) {
    R(g, '#0d0b18', x, top, w, 150 - top); R(g, '#1c1828', x, top, w, 1);
    for (let yy = top + 5; yy < 140; yy += 7) for (let xx = x + 4; xx < x + w - 4; xx += 7) if (rnd() < 0.12) R(g, rnd() < 0.8 ? '#c8904a' : '#7fb0d0', xx, yy, 2, 3);
    if (rnd() < 0.7) { const cx = x + 6 + rnd() * (w - 16) | 0; R(g, '#0d0b18', cx, top - 9, 6, 9); R(g, '#1c1828', cx, top - 9, 6, 1); }
  }
  R(g, '#0d0b18', 330, 36, 3, 34); R(g, '#0d0b18', 324, 44, 15, 1); R(g, '#0d0b18', 326, 52, 11, 1); R(g, '#c84a3a', 330, 34, 2, 2);   // antenna
  R(g, '#0d0b18', 520, 50, 30, 18); R(g, '#1c1828', 520, 50, 30, 1); g.fillStyle = '#0d0b18'; g.beginPath(); g.moveTo(518, 50); g.lineTo(535, 40); g.lineTo(552, 50); g.fill(); for (const lx of [522, 534, 546]) R(g, '#0d0b18', lx, 68, 2, 6);   // water tank
  S.mid = c;

  /* near: the alley itself */
  c = mk(STAGE_W, H, true); g = c.g;
  // A: four-storey brick with the fire escape (x 0-210)
  brickWall(g, 0, 22, 210, 192, ['#1a0e10', '#3a1c1a', '#4a2622', '#2a1412'], 3);
  R(g, '#4a2622', 0, 18, 210, 4); R(g, '#0b0712', 0, 17, 210, 1); for (let x = 2; x < 208; x += 10) R(g, '#2a1412', x, 20, 5, 2);
  for (const wy of [34, 84, 136]) for (const wx of [44, 96, 148]) {
    R(g, '#0b0712', wx - 1, wy - 1, 20, 26); const lit = rnd() < 0.3;
    if (lit) { gradRows(g, wx, wy, 18, 24, ['#ffd890', '#d89a50', '#7a4a2a']); for (let k = 0; k < 24; k += 3) R(g, 'rgba(60,30,10,0.45)', wx, wy + k, 18, 1); }   // a lit window with blinds
    else gradRows(g, wx, wy, 18, 24, ['#24304e', '#121a30', '#0a0e1c']);
    R(g, '#0b0712', wx + 8, wy, 2, 24); R(g, '#5a3430', wx - 2, wy + 24, 22, 2); R(g, '#e4ecf8', wx - 2, wy + 23, 22, 1);
  }
  // fire escape: two landings, railings, the zig-zag stair, the drop ladder, brackets
  const FE = '#0e0c14', FEH = '#34303e';
  for (const py of [68, 122]) {
    R(g, FE, 30, py, 164, 3); R(g, FEH, 30, py, 164, 1); R(g, '#e4ecf8', 30, py - 1, 164, 1);
    R(g, FE, 30, py - 15, 164, 2); R(g, FEH, 30, py - 15, 164, 1); for (let x = 30; x < 195; x += 5) R(g, FE, x, py - 13, 1, 13);
    for (const bx of [36, 186]) pxLine(g, FE, bx, py + 3, bx + (bx < 100 ? 10 : -10), py + 16, 2);
  }
  pxLine(g, FE, 66, 120, 150, 70, 2); pxLine(g, FE, 72, 122, 156, 72, 1); for (let k = 0; k < 12; k++) { const x = 70 + k * 7, y = 118 - k * 4.2; R(g, FEH, x, y | 0, 6, 1); }
  pxLine(g, FEH, 66, 106, 150, 56, 1);
  R(g, FE, 164, 125, 2, 44); R(g, FE, 174, 125, 2, 44); for (let y = 128; y < 168; y += 5) R(g, FEH, 164, y, 12, 1);
  // B: the bar's back wall (x 210-590), two storeys
  brickWall(g, 210, 70, 380, 144, ['#1e1416', '#4a2a22', '#5a3628', '#341c18'], 7);
  R(g, '#2a2a34', 206, 64, 388, 6); R(g, '#4a4a58', 206, 64, 388, 1); R(g, '#e4ecf8', 206, 62, 388, 2); R(g, '#0b0712', 206, 70, 388, 1);
  R(g, '#0b0712', 210, 70, 2, 144); R(g, '#0b0712', 588, 70, 2, 144);
  for (const wx of [236, 292, 470, 526]) {
    R(g, '#0b0712', wx - 1, 79, 26, 24); const lit = wx === 470;
    gradRows(g, wx, 80, 24, 22, lit ? ['#ffb36b', '#c8703a', '#5a2a1a'] : ['#1e2840', '#10162a', '#0a0c18']);
    R(g, '#0b0712', wx + 11, 80, 2, 22); R(g, '#6a4a3a', wx - 2, 102, 28, 2); R(g, '#e4ecf8', wx - 2, 101, 28, 1);
  }
  // sign board for the neon, the caged bulb, transom, back door (ajar, warm light)
  R(g, '#0b0712', 322, 112, 130, 24); R(g, '#16101a', 323, 113, 128, 22); for (const bx of [330, 444]) R(g, '#3a3a44', bx, 108, 1, 5);
  R(g, '#0b0712', 383, 138, 9, 4); R(g, '#3a3a44', 384, 139, 7, 1); R(g, '#0b0712', 382, 142, 11, 7); for (let x = 383; x < 393; x += 3) R(g, '#4a4a58', x, 142, 1, 7);
  R(g, '#0b0712', 364, 150, 46, 64); R(g, '#2a2630', 366, 152, 42, 62);
  gradRows(g, 370, 153, 34, 6, ['#ffe9a8', '#f5b85a']); R(g, '#0b0712', 386, 153, 1, 6); R(g, '#0b0712', 370, 159, 34, 1);
  gradRows(g, 370, 160, 34, 54, ['#ffe0a0', '#f0a850', '#c06a2a', '#7a3a1a']);   // warm interior through the open door
  for (const [x, y, w, h] of [[378, 172, 6, 30], [392, 168, 7, 34]]) R(g, 'rgba(60,24,12,0.55)', x, y, w, h);   // silhouettes inside
  R(g, '#0b0712', 383, 160, 21, 54); R(g, '#4a4654', 384, 161, 19, 53); R(g, '#5a5664', 384, 161, 2, 53); R(g, '#3a3644', 401, 161, 2, 53);   // steel door, swung half open
  R(g, '#2e2a38', 387, 166, 12, 18); R(g, '#2e2a38', 387, 190, 12, 18); R(g, '#c8b060', 386, 186, 3, 2);
  R(g, '#0b0712', 388, 177, 11, 6); R(g, '#c8c0a8', 389, 178, 9, 4);
  R(g, '#4a4854', 358, 210, 58, 4); R(g, '#6a6876', 358, 210, 58, 1);   // stoop
  // wall clutter: AC unit + drip, meter, a pipe with a steam vent, a faded "NO PARKING" plate, generic tags
  R(g, '#0b0712', 470, 116, 30, 20); R(g, '#5a5e68', 471, 117, 28, 18); for (let y = 119; y < 133; y += 2) R(g, '#3a3e48', 473, y, 24, 1); R(g, '#e4ecf8', 470, 114, 30, 2);
  R(g, '#0b0712', 236, 150, 12, 16); R(g, '#6a7078', 237, 151, 10, 14); disc(g, '#c8d0d8', 242, 157, 3); R(g, '#0b0712', 241, 166, 2, 48);
  R(g, '#2a2a34', 452, 140, 6, 74); R(g, '#4a4a58', 452, 140, 1, 74); R(g, '#0b0712', 448, 136, 14, 6); R(g, '#3a3a44', 449, 137, 12, 4);
  R(g, '#0b0712', 527, 146, 42, 14); R(g, '#d8d0c0', 528, 147, 40, 12); drawTxt(g, 'NO', 530, 149, 1, '#c01818'); drawTxt(g, 'PARK', 543, 149, 1, '#0b0712');
  for (const [x, y, col] of [[540, 176, '#2a8aa0'], [270, 130, '#8a3aa0']]) for (let k = 0; k < 18; k++) R(g, col, x + k, y + Math.round(Math.sin(k * 0.7) * 3), 2, 2);   // spray-paint squiggles (no words)
  // C: chain-link fence over the gap (x 590-640), dark void behind it
  R(g, '#07060c', 590, 40, 50, 174); for (let y = 40; y < 140; y += 3) if (y % 6) R(g, '#0d0b14', 592, y, 46, 1);
  for (let y = 132; y < 212; y++) for (let x = 590; x < 640; x++) if (((x + y) % 7 === 0 || ((x - y) % 7 + 7) % 7 === 0) && dith(x, y) < 0.85) R(g, y < 136 ? '#4a5060' : '#6a7080', x, y, 1, 1);
  R(g, '#8a90a0', 590, 130, 50, 2); for (const px of [590, 638]) { R(g, '#0b0712', px - 1, 128, 4, 86); R(g, '#8a90a0', px, 128, 2, 86); }
  for (let x = 591; x < 638; x += 2) R(g, '#5a6070', x, 128 - (x & 2 ? 1 : 0), 1, 1);   // a twist of wire on top
  // D: the alley mouth: a slice of May Street (x 640-760); above it the sky shows through
  brickWall(g, 640, 112, 120, 84, ['#140e18', '#2a2030', '#342a3c', '#1e1626'], 11);
  R(g, '#3a3044', 640, 108, 120, 4); R(g, '#e4ecf8', 640, 107, 120, 1);
  R(g, '#0b0712', 650, 154, 56, 38); gradRows(g, 652, 156, 52, 34, ['#ffd890', '#f0a050', '#7a3a24']); R(g, '#0b0712', 677, 156, 2, 34);
  for (let x = 650; x < 708; x++) { const st = ((x - 650) >> 3) & 1; R(g, st ? '#1a6a6a' : '#d8e8e0', x, 148, 1, 5); }
  R(g, '#0b0712', 716, 160, 22, 36); gradRows(g, 718, 162, 18, 32, ['#3a2a3a', '#5a3a3a', '#2a1a24']);
  for (const wx of [656, 690, 724]) { R(g, '#0b0712', wx - 1, 119, 16, 20); gradRows(g, wx, 120, 14, 18, wx === 690 ? ['#ffe9a8', '#c8803a'] : ['#2a3a6a', '#0c1024']); }
  gradRows(g, 640, 196, 120, 5, ['#6a6874', '#4a4854']); R(g, '#8a8696', 640, 201, 120, 1);
  gradRows(g, 640, 202, 120, 12, ['#2a2832', '#1a1820']); for (let x = 644; x < 760; x += 20) R(g, '#c8b04a', x, 208, 10, 1);
  // street furniture at the mouth: the May Street sign + a sodium streetlight
  R(g, '#0b0712', 645, 92, 4, 122); R(g, '#3a4048', 646, 92, 1, 122);
  R(g, '#0b0712', 624, 88, 46, 13); R(g, '#1a6a3a', 625, 89, 44, 11); R(g, '#e8f0e8', 626, 90, 42, 1); drawTxt(g, 'MAY ST', 629, 91, 1, '#ffffff');
  R(g, '#0b0712', 752, 96, 4, 118); R(g, '#3a3a44', 753, 96, 1, 118); R(g, '#0b0712', 730, 94, 26, 3); R(g, '#0b0712', 728, 97, 14, 5); R(g, '#ffd890', 729, 100, 12, 2);
  // E: corner of the next building (x 760-800)
  brickWall(g, 760, 40, 40, 174, ['#160e12', '#30201e', '#3c2824', '#20140e'], 5); R(g, '#0b0712', 760, 40, 2, 174); R(g, '#3c2824', 760, 36, 40, 4); R(g, '#e4ecf8', 760, 35, 40, 1);
  // wall base: dark concrete footing + a snow line (cleared at the stoop and the mouth)
  R(g, '#1a1820', 0, 206, 640, 8); R(g, '#2a2832', 0, 206, 640, 1); R(g, '#1a1820', 760, 206, 40, 8);
  // props: dumpsters, bags, kegs, crates, a pallet
  dumpster(g, 84, 174, ['#0e2a1a', '#1e4a2e', '#2e6a42']); dumpster(g, 476, 174, ['#0e1a3a', '#1e2e5a', '#2e4a7a']);
  for (const [x, y, r] of [[78, 206, 7], [158, 204, 9], [170, 208, 6], [150, 210, 6], [548, 206, 8], [560, 209, 6], [466, 209, 5]]) bag(g, x, y, r);
  for (const kx of [246, 264, 282]) keg(g, kx, 190); for (const kx of [255, 273]) keg(g, kx, 167);
  crate(g, 418, 200, '#2a4a8a', '#1a2a5a'); crate(g, 438, 200, '#8a2a2a', '#5a1a1a'); crate(g, 428, 187, '#2a4a8a', '#1a2a5a'); crate(g, 438, 174, '#8a2a2a', '#5a1a1a');
  for (let k = 0; k < 4; k++) R(g, k & 1 ? '#3a2a1a' : '#5a4228', 566, 178 + k * 9, 22, 6); R(g, '#0b0712', 568, 176, 3, 36); R(g, '#0b0712', 583, 176, 3, 36);
  for (let x = 0; x < STAGE_W; x += 2) {   // snow line along the wall foot
    if ((x > 352 && x < 420) || (x > 640 && x < 760)) continue;
    const hh = 2 + Math.sin(x * 0.07) * 1.5 + Math.sin(x * 0.21) + rnd() * 1.5 | 0; R(g, '#d8e2f0', x, 214 - hh, 2, hh); if (dith(x, hh) < 0.4) R(g, '#ffffff', x, 214 - hh, 2, 1);
  }
  // floor: cracked wet asphalt, slush, a manhole, puddles that mirror the wall
  const facade = mk(STAGE_W, 114); facade.g.drawImage(c, 0, 100, STAGE_W, 114, 0, 0, STAGE_W, 114);
  gradRows(g, 0, 214, STAGE_W, H - 214, ['#22202a', '#1a1822', '#14121a', '#0e0c14']);
  for (let i = 0; i < 900; i++) R(g, rnd() < 0.5 ? '#2c2a36' : '#0a0810', rnd() * STAGE_W | 0, 215 + rnd() * 55 | 0, 1, 1);
  for (let i = 0; i < 9; i++) { let x = rnd() * STAGE_W, y = 220 + rnd() * 44; for (let k = 0; k < 24; k++) { R(g, '#0a0810', x | 0, y | 0, 2, 1); x += 2; y += (rnd() - 0.5) * 2.2; } }
  for (let i = 0; i < 16; i++) {   // slush patches, grey and lumpy
    const x0 = rnd() * STAGE_W | 0, y0 = 216 + rnd() * 50 | 0, w0 = 14 + rnd() * 40 | 0, h0 = 2 + rnd() * 3 | 0;
    for (let y = 0; y < h0; y++) for (let x = 0; x < w0; x++) { const e = Math.abs(x - w0 / 2) / (w0 / 2) + Math.abs(y - h0 / 2) / h0; if (e < 1 && dith(x0 + x, y0 + y) < 0.9 - e * 0.6) R(g, dith(x, y) < 0.3 ? '#c8d0de' : '#8a92a4', x0 + x, y0 + y, 1, 1); }
  }
  g.fillStyle = '#0b0712'; g.beginPath(); g.ellipse(310, 250, 16, 4, 0, 0, 7); g.fill(); g.fillStyle = '#2a2832'; g.beginPath(); g.ellipse(310, 250, 14, 3, 0, 0, 7); g.fill(); for (let x = 300; x < 322; x += 4) R(g, '#0b0712', x, 249, 2, 2);
  for (const [cx, cy, rx, ry] of [[120, 236, 36, 4], [392, 230, 28, 3], [520, 252, 46, 5], [700, 240, 34, 4], [230, 262, 30, 4]]) {
    for (let r = -ry; r <= ry; r++) {
      const hw = Math.round(rx * Math.sqrt(1 - (r / (ry + 0.5)) ** 2)), y = cy + r, sy = Math.round(214 - (y - 214) * 2.6) - 100; if (hw < 2) continue;
      R(g, '#0c0e1c', cx - hw, y, hw * 2, 1);
      if (sy >= 0 && sy < 114) { g.globalAlpha = 0.6; g.drawImage(facade, cx - hw, sy, hw * 2, 1, cx - hw + Math.round(Math.sin(y * 1.7)), y, hw * 2, 1); g.globalAlpha = 1; }
      R(g, 'rgba(60,80,150,0.18)', cx - hw, y, hw * 2, 1);
    }
    R(g, '#4a5068', cx - rx + 6, cy - ry - 1, rx * 2 - 12, 1); R(g, '#8a92a4', cx - rx + 10, cy + ry + 1, rx * 2 - 20, 1);
  }
  S.near = c;
  /* neon: the tavern's name (a little temperamental) */
  S.neon = [{ x: 387, y: 118, txt: 'THE MAY ST. TAVERN', col: '#ff5a3a', ph: 17, dodgy: 2 }];
  /* lights: caged bulb over the door (flickers), wall-pack on the fire-escape building, the May St. sodium lamp */
  S.lamps = [
    { x: 387, y: 146, cone: 1, pool: 226, flick: (t) => { const u = t % 520; if (u < 34) return (u >> 2) % 3 === 0 ? 0.12 : 1; if (u > 260 && u < 266) return 0.25; return 0.92 + 0.08 * Math.sin(t * 0.37); } },
    { x: 120, y: 96, cone: 1, pool: 222, a: 0.6 },
    { x: 735, y: 100, cone: 1, pool: 214, a: 0.85 }
  ];
  S.vents = [[455, 136, 5], [310, 248, 6]];
  /* regulars by the back door: parkas, toques, a flannel or two */
  const PPL = [];
  for (const [x, h] of [[300, 22], [314, 25], [330, 20], [346, 24], [416, 23], [452, 26], [464, 20]]) PPL.push({ x, h, w: 11 + rnd() * 4 | 0, c: ['#3a1e1e', '#2a2a4a', '#4a2a1a', '#1e3a2a', '#5a1a1a', '#2a2a2a'][rnd() * 6 | 0], hat: ['#c02a2a', '#2a6ac0', null, '#e0c040', '#3a3a3a'][rnd() * 5 | 0], ph: rnd() * 4 | 0, arm: rnd() < 0.5, phone: rnd() < 0.15, skin: ['#c88a6a', '#e0b090', '#8a5a3a', '#f0c8a8'][rnd() * 4 | 0] });
  S.crowd = crowdFrames(PPL);
  /* foreground (parallax 1.3x): slush heaps, a trash can, a pylon, a stray tire */
  c = mk(BG.fgW, 40, true); g = c.g;
  for (let x = 0; x < BG.fgW; x += 2) { const hh = 4 + Math.sin(x * 0.027) * 3 + Math.sin(x * 0.13) * 1.5 + (rnd() * 1.5 | 0); if (Math.sin(x * 0.011 + 2) > -0.4) { R(g, '#0b0712', x, 40 - hh - 1, 2, 1); R(g, '#9aa4b8', x, 40 - hh, 2, hh); R(g, '#d8e2f0', x, 40 - hh, 2, 1); if (dith(x, hh) < 0.4) R(g, '#6a7288', x, 40 - hh + 2, 2, 1); } }
  { const tx = 40; R(g, '#0b0712', tx - 1, 6, 26, 34); R(g, '#5a606a', tx, 7, 24, 33); for (let k = 2; k < 24; k += 5) R(g, '#3a3e48', tx + k, 9, 2, 31); R(g, '#7a808a', tx + 1, 7, 2, 33); R(g, '#0b0712', tx - 3, 4, 30, 4); R(g, '#6a707a', tx - 2, 5, 28, 2); R(g, '#e4ecf8', tx - 2, 2, 28, 3); }
  { const px = 420; g.fillStyle = '#0b0712'; g.beginPath(); g.moveTo(px - 10, 40); g.lineTo(px - 3, 8); g.lineTo(px + 3, 8); g.lineTo(px + 10, 40); g.fill(); g.fillStyle = '#ff6a12'; g.beginPath(); g.moveTo(px - 8, 39); g.lineTo(px - 2, 10); g.lineTo(px + 2, 10); g.lineTo(px + 8, 39); g.fill(); R(g, '#f0f0f0', px - 5, 22, 10, 4); R(g, '#0b0712', px - 14, 37, 28, 3); }
  { const rx = BG.fgW - 120; disc(g, '#0b0712', rx, 34, 16); disc(g, '#24222c', rx, 34, 14); disc(g, '#0b0712', rx, 34, 7); R(g, '#3a3844', rx - 10, 22, 6, 2); R(g, '#e4ecf8', rx - 12, 18, 24, 3); }
  S.fg = c;
  neonSprites(S.neon);
  S.live = alleyLive;
  return S;
}
/* live bits: the bulb, the cat on the dumpster, cars passing the mouth of the alley */
function alleyLive(g, nx, tick, lv, S) {
  const b = S.lamps[0].flick(tick); R(g, b > 0.5 ? '#fff6c8' : '#5a4a30', 385 + nx, 143, 5, 4); if (b > 0.5) R(g, '#ffffff', 386 + nx, 144, 2, 2);
  // alley cat on the blue dumpster lid: tail swish, blinks, arches up and puffs out at a KO
  const cx = 512 + nx, cy = 171, cheer = G && ((G.phase === 'roundEnd' && G.koX != null) || G.phase === 'matchEnd');
  if (cx > -20 && cx < W + 20) {
    const k = '#0e0a12', up = cheer ? 3 : 0;
    R(g, k, cx, cy - 7 - up, 12, 7 + up); R(g, k, cx + 1, cy - 9 - up, 10, 2);   // body (arched at a KO)
    if (cheer) { R(g, k, cx, cy - 2, 2, 2); R(g, k, cx + 10, cy - 2, 2, 2); }
    R(g, k, cx - 5, cy - 13 - up, 7, 6); R(g, k, cx - 5, cy - 15 - up, 2, 2); R(g, k, cx, cy - 15 - up, 2, 2);   // head + ears
    const blink = (tick % 260) < 8; if (!blink) { R(g, '#c8ff6a', cx - 4, cy - 11 - up, 1, 1); R(g, '#c8ff6a', cx - 1, cy - 11 - up, 1, 1); }
    const sw = Math.sin(tick * (cheer ? 0.4 : 0.06));
    for (let s = 0; s < 7; s++) { const a = (cheer ? -1.3 : -0.4) + s * 0.22 * (cheer ? 0.2 : 1) + sw * 0.08 * s; R(g, k, Math.round(cx + 11 + Math.cos(a) * s * 1.6), Math.round(cy - 3 - up + Math.sin(a) * s * 1.8 - (cheer ? s : 0)), 2, 2); }
  }
  if (lv > 0) {   // a car rolls past on May Street every ~8 s: lights sweep the slice of storefront and the wet road
    const cyc = tick % 470;
    if (cyc < 140) {
      const dir = (Math.floor(tick / 470) & 1) ? -1 : 1, p = cyc / 140, x = Math.round((dir > 0 ? 600 + p * 200 : 800 - p * 200) + nx);
      g.save(); g.beginPath(); g.rect(640 + nx, 108, 120, 106); g.clip();
      R(g, '#0b0712', x - 22, 196, 44, 12); R(g, '#1e1c2a', x - 21, 197, 42, 10); R(g, '#141220', x - 12, 190, 24, 7); R(g, '#5a7aa0', x - 10, 191, 20, 4);
      R(g, '#fff6dc', dir > 0 ? x + 19 : x - 21, 200, 3, 3); R(g, '#ff2a2a', dir > 0 ? x - 22 : x + 19, 200, 3, 2);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.7; g.drawImage(BG.head, x - 80 + dir * 60, 168); g.globalAlpha = 0.45; g.drawImage(BG.head, x - 80 + dir * 50, 196, 160, 24);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.restore();
      if (p > 0.3 && p < 0.7) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.12 * Math.sin((p - 0.3) / 0.4 * Math.PI); g.drawImage(BG.head, 600 + nx, 214, 220, 40); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }   // a sweep across the alley floor
    }
  }
}
</script>
