<script>
'use strict';
/* =====================================================================
   RENDER CORE: canvases, pixel-art helpers, bitmap font
   The world is drawn at 480x270 into `wc`, then scaled up 2x with
   smoothing off onto the 960x540 main canvas, which gives chunky pixels.
   Everything detailed (fighters, stage, sparks, text) is pre-rendered once.
   ===================================================================== */
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
// RES: the world canvas runs at 2x density (960x540) so fighters, portraits,
// text and sparks get twice the pixels (16-bit arcade detail); all drawing code
// still works in 480x270 world units via wx.setTransform(RES, ...).
const RES = 2;
// SD: sprite-sheet density = px per world unit on the world canvas (the fight plane is zoomed ZOOM x)
const SD = RES * ZOOM;
const wc = document.createElement('canvas'); wc.width = W * RES; wc.height = H * RES;
const wx = wc.getContext('2d'); wx.imageSmoothingEnabled = false;
function worldXform() { wx.setTransform(RES, 0, 0, RES, 0, 0); wx.imageSmoothingEnabled = false; }
// GY: screen y of the fight-plane ground line. screenXform = 480x270 screen units (stage art, HUD-ish overlays);
// planeXform = world units of the fight plane (x already minus camX, y down from the top), zoomed ZOOM x about GY.
const GY = 252;
function screenXform(g, b) { g.setTransform(b, 0, 0, b, 0, 0); g.imageSmoothingEnabled = false; }
function planeXform(g, b) { g.setTransform(b * ZOOM, 0, 0, b * ZOOM, 0, b * (GY - ZOOM * GROUND)); g.imageSmoothingEnabled = false; }
function mk(w, h, rf) { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); c.g = c.getContext('2d', rf ? { willReadFrequently: true } : undefined); c.g.imageSmoothingEnabled = false; return c; }
let seed = 1337; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
const OUT = '#0b0712';

/* Snap a canvas to a palette: hard alpha, nearest palette colour, and a
   1px dark outline on the silhouette edge. This is what turns smooth
   vector drawing into crisp pixel art. */
const PIX_CACHE = new WeakMap();   // palette -> { P, packed colours, rgb -> palette index } kept across frames
function pixelate(c, pal, outline) {
  const w = c.width, h = c.height, g = c.getContext('2d'), im = g.getImageData(0, 0, w, h), d = im.data;
  let C = PIX_CACHE.get(pal);
  if (!C) { const P = pal.map(rgb); C = { P, cache: new Map(), u: new Uint32Array(new Uint8Array(P.flatMap(p => [p[0], p[1], p[2], 255])).buffer) }; PIX_CACHE.set(pal, C); }
  const P = C.P, cache = C.cache, U = C.u, d32 = new Uint32Array(d.buffer, d.byteOffset, d.length >> 2);
  for (let q = 0, i = 0; q < d32.length; q++, i += 4) {
    if (d[i + 3] < 128) { d32[q] = 0; continue; }
    const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    let j = cache.get(key);
    if (j === undefined) {
      let best = 1e12; j = 0;
      for (let k = 0; k < P.length; k++) { const dr = d[i] - P[k][0], dg = d[i + 1] - P[k][1], db = d[i + 2] - P[k][2], e = dr * dr * 3 + dg * dg * 4 + db * db * 2; if (e < best) { best = e; j = k; } }
      cache.set(key, j);
    }
    d32[q] = U[j];
  }
  if (outline) {
    const o = rgb(outline), a = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) a[p] = d[p * 4 + 3] ? 1 : 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const p = y * w + x; if (!a[p]) continue;
      if (x === 0 || x === w - 1 || y === 0 || y === h - 1 || !a[p - 1] || !a[p + 1] || !a[p - w] || !a[p + w]) { d[p * 4] = o[0]; d[p * 4 + 1] = o[1]; d[p * 4 + 2] = o[2]; }
    }
  }
  g.putImageData(im, 0, 0);
  return c;
}
// ordered dither threshold (4x4 Bayer), 0..1
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
function dith(x, y) { return BAYER[(y & 3) * 4 + (x & 3)]; }

/* ---------- 5x7 bitmap font ---------- */
const GLYPH = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110', C: '01110 10001 10000 10000 10000 10001 01110',
  D: '11110 10001 10001 10001 10001 10001 11110', E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001', I: '111 010 010 010 010 010 111',
  J: '00111 00010 00010 00010 00010 10010 01100', K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 10001 11001 10101 10011 10001 10001', O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000', Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100', U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100', W: '10001 10001 10001 10101 10101 10101 01010', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '010 110 010 010 010 010 111', 2: '01110 10001 00001 00010 00100 01000 11111',
  3: '11111 00010 00100 00010 00001 10001 01110', 4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000', 8: '01110 10001 10001 01110 10001 10001 01110',
  9: '01110 10001 10001 01111 00001 00010 01100', '!': '1 1 1 1 1 0 1', '.': '00 00 00 00 00 11 11', ',': '00 00 00 00 00 01 10',
  "'": '1 1 0 0 0 0 0', '"': '101 101 000 000 000 000 000', '-': '0000 0000 0000 1111 0000 0000 0000', ':': '0 1 1 0 1 1 0',
  '&': '01100 10010 10100 01000 10101 10010 01101', '/': '00001 00010 00010 00100 01000 01000 10000', '?': '01110 10001 00001 00010 00100 00000 00100',
  '#': '01010 11111 01010 01010 01010 11111 01010', ' ': '000 000 000 000 000 000 000'
};
const GL = {}; for (const k in GLYPH) { const rows = GLYPH[k].split(' '); GL[k] = { w: rows[0].length, rows }; }
function txtW(s, sc) { let w = 0; for (const ch of s) w += ((GL[ch] || GL[' ']).w + 1) * sc; return Math.max(0, w - sc); }
function drawTxt(g, s, x, y, sc, col) {
  g.fillStyle = col; let cx = x;
  for (const ch of s) { const G2 = GL[ch] || GL[' ']; for (let r = 0; r < 7; r++) for (let c = 0; c < G2.w; c++) if (G2.rows[r][c] === '1') g.fillRect(cx + c * sc, y + r * sc, sc, sc); cx += (G2.w + 1) * sc; }
}
/* A pre-rendered text sprite: per-glyph-row colour bands (classic arcade
   gradient), a dark outline and an optional drop shadow. Cached. */
const TSTYLE = {
  fire: { rows: ['#fffbd0', '#ffe873', '#ffc93a', '#ff9d1e', '#ff6a12', '#e8380c', '#a81808'], out: '#1a0400', sh: 1 },
  gold: { rows: ['#ffffff', '#fff6b0', '#ffe066', '#ffc83a', '#f0a020', '#d07810', '#a05008'], out: '#120800', sh: 1 },
  red: { rows: ['#ffffff', '#ffc0b0', '#ff7a5a', '#ff3a2a', '#e01818', '#b00c0c', '#780404'], out: '#140000', sh: 1 },
  ice: { rows: ['#ffffff', '#e0f6ff', '#b0e6ff', '#7fd3ff', '#4aa8f0', '#2a78d0', '#1a4ca0'], out: '#000614', sh: 1 },
  chrome: { rows: ['#ffffff', '#e8ecf8', '#b8c0d8', '#6a7290', '#9aa4c4', '#dfe6ff', '#ffffff'], out: '#05060c', sh: 1 },
  white: { rows: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'], out: '#000000', sh: 0 },
  flash: { rows: ['#ffffff', '#ffffff', '#ffffff', '#fff8e0', '#ffffff', '#ffffff', '#ffffff'], out: '#ff2a2a', sh: 1 },
  cyan: { rows: ['#e8fbff', '#bff2ff', '#8fe6ff', '#5fd4ff', '#3ab8f0', '#2a98d8', '#1a70b0'], out: '#000000', sh: 0 },
  dim: { rows: ['#cfd6ff', '#cfd6ff', '#b8c0f0', '#b8c0f0', '#a0a8e0', '#a0a8e0', '#8890c8'], out: '#000000', sh: 0 }
};
const TXC = new Map();
/* Text sprites are built at `res` x density (default RES) with chunky arcade styling:
   per-row gradient bands, a lit bevel on the top edge of each stroke, a thick dark outline and a 3D extruded drop shadow. c.ww/c.hh
   give the size in world units. */
function textSprite(s, sc, style, outW, res) {
  res = res || RES;
  const st = TSTYLE[style] || TSTYLE.white, o = outW != null ? outW : Math.max(1, Math.round(sc / 2.5)), sh = st.sh ? Math.max(1, Math.round(sc / 2)) : 0;
  const key = s + '|' + sc + '|' + style + '|' + o + '|' + res; let c = TXC.get(key); if (c) return c;
  const tw = txtW(s, sc), w = (tw + o * 2 + sh) * res, h = (7 * sc + o * 2 + sh) * res, O = o * res, SC = sc * res, SH = sh * res;
  const m = mk(w, h); drawTxt(m.g, s, O, O, SC, '#fff');
  const dark = mk(w, h); dark.g.drawImage(m, 0, 0); dark.g.globalCompositeOperation = 'source-in'; dark.g.fillStyle = st.out; dark.g.fillRect(0, 0, w, h);
  c = mk(w, h); const g = c.g;
  if (SH) {   // extruded shadow: a diagonal stack of the dark silhouette
    for (let k = SH; k > 0; k--) g.drawImage(dark, O + k - O, O + k - O);
  }
  for (let dy = -O; dy <= O; dy += Math.max(1, O >> 1)) for (let dx = -O; dx <= O; dx += Math.max(1, O >> 1)) if (dx * dx + dy * dy <= O * O + 1) g.drawImage(dark, dx, dy);
  for (const [dx, dy] of [[-O, 0], [O, 0], [0, -O], [0, O]]) g.drawImage(dark, dx, dy);
  const fill = mk(w, h);   // colour bands first, then keep only the glyph pixels
  for (let r = 0; r < 7; r++) {
    fill.g.fillStyle = st.rows[r]; fill.g.fillRect(0, O + r * SC, w, SC);
  }
  if (SC >= 6) {   // bevel each lit font cell: highlight on the top-left edge, shade on the bottom-right
    const bv = Math.max(1, Math.round(SC / 6)); let cx = O;
    for (const ch of s) { const G2 = GL[ch] || GL[' '];
      for (let r = 0; r < 7; r++) for (let q = 0; q < G2.w; q++) { if (G2.rows[r][q] !== '1') continue; const x = cx + q * SC, y = O + r * SC;
        const up = r > 0 && G2.rows[r - 1][q] === '1', lf = q > 0 && G2.rows[r][q - 1] === '1', dn = r < 6 && G2.rows[r + 1][q] === '1', rt = q < G2.w - 1 && G2.rows[r][q + 1] === '1';
        fill.g.fillStyle = 'rgba(255,255,255,0.5)'; if (!up) fill.g.fillRect(x, y, SC, bv); if (!lf && !up) fill.g.fillRect(x, y, bv, SC >> 1);
        fill.g.fillStyle = 'rgba(0,0,0,0.22)'; if (!dn && !rt) fill.g.fillRect(x + (SC >> 1), y + SC - bv, SC - (SC >> 1), bv); }
      cx += (G2.w + 1) * SC; }
  }
  fill.g.globalCompositeOperation = 'destination-in'; fill.g.drawImage(m, 0, 0);
  g.drawImage(fill, 0, 0);
  c.ww = w / res; c.hh = h / res;
  TXC.set(key, c); return c;
}
// draw a text sprite centred (align 'c'), left ('l') or right ('r') at world coords
function drawText(g, s, x, y, sc, style, align, outW) {
  const c = textSprite(s, sc, style, outW), o = outW != null ? outW : Math.max(1, Math.round(sc / 2.5));
  const dx = align === 'l' ? x - o : align === 'r' ? x - c.ww + o : x - (c.ww - (TSTYLE[style] && TSTYLE[style].sh ? Math.max(1, Math.round(sc / 2)) : 0)) / 2;
  g.drawImage(c, Math.round(dx), Math.round(y - o), c.ww, c.hh);
  return c.ww;
}
</script>
