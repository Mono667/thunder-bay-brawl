<script>
'use strict';
/* =====================================================================
   FIGHTER ART - procedural pixel-art sprite sheets, generated once at load
   Each character is a jointed skeleton (2-bone IK arms/legs) posed per
   animation frame, painted with 3-tone cel shading and dark outlines, then
   snapped to a fixed palette (see pixelate). The result is a sprite sheet
   in exactly the format a hand-drawn sheet uses, so Craig's art can drop in
   later via render:'sprite' (see RENDERERS below and the README).
   ===================================================================== */
const FW = 180, FH = 128, FOX = 86, FOY = 116;
/* ---------------------------------------------------------------------
   LOOKS - every fighter is one data block: D = body dimensions, M = 4-tone
   material palettes (dark -> light), L = what they wear / carry.
   To restyle someone (e.g. new shirt colour, hair, glasses) edit only here.
   L options:
     top:   'none' (shirtless) | 'tee'            sleevePrint / hemPrint: tee prints
     lower: 'pants' | 'shorts'                    pattern: shorts pattern dots, drawstring
     feet:  'boot' | 'sneaker' | 'bare'           footInk: tattooed feet
     hair:  'messy' | 'buzz' | 'curly' | 'long'   beard: 'goatee' | 'stubble' | 'huge'
     hat:   'snapback' (worn backwards)          glasses, piercings, goldTooth, smile
     ink:   tattoo zones { neck, chest, armF, armB, foreF }
     chain (necklace), can (carried in back hand), rings, muscle
   --------------------------------------------------------------------- */
const ART = {
  craig: {
    D: { thigh: 17, shin: 16, ank: 3, torso: 24, neck: 3, ua: 12, fa: 12, shX: 2, hipH: 34, crH: 19, lean0: 0.07, tw: 8.4, hs: 1,
      st: [9, -8], gF: [9, -3], gB: [6, 1], legW: [7.5, 6], armW: [5.6, 4.8], fist: 2.9, walkDiv: 3, stride: 6 },
    M: { skin: ['#6a3a28', '#b8765a', '#e6a684', '#ffd2b4'], hair: ['#3a2412', '#6a4422', '#94663a', '#b88a58'],
      beard: ['#4a1e0c', '#7a3818', '#a8542a', '#c87a48'], pants: ['#0e1420', '#1c2a40', '#2e4466', '#4a6690'],
      shoe: ['#0a0a0c', '#1e1e22', '#36363c', '#55555e'], ink: ['#141a26', '#25344a'], metal: ['#6a6a78', '#b0b0c0', '#eeeef8'],
      misc: ['#f0c030', '#7a1a14', '#f4f0e8', '#3a0a08'] },
    L: { top: 'none', lower: 'pants', feet: 'boot', hair: 'messy', beard: 'goatee', piercings: 1, goldTooth: 1, smile: 1, belt: 1,
      ink: { neck: 1, chest: 1, armF: 1, armB: 1 }, win: 'pump', toss: 'ink' }
  },
  aj: {
    D: { thigh: 20, shin: 19, ank: 3, torso: 32, neck: 2.5, ua: 15, fa: 14.5, shX: 4, hipH: 40, crH: 24, lean0: 0.04, tw: 14.5, hs: 1.12,
      st: [12, -11], gF: [11, 2], gB: [7, 6], legW: [12.5, 10.5], armW: [10.4, 9], fist: 4.8, walkDiv: 5, stride: 5 },
    M: { skin: ['#6a3a28', '#b07656', '#dea282', '#f8c8a4'], hair: ['#3a2814', '#6a4a28', '#8a6a40', '#a8885a'],
      top: ['#050508', '#121218', '#24242e', '#3c3c4a'], print: ['#8a2a08', '#e05a1a', '#ff9a4a'],
      pants: ['#0a1a4a', '#1a3a8a', '#3a6ac8', '#7aa8f0'], pat: ['#081028', '#bcd8ff'], ink: ['#1a2030', '#2c3a4e'],
      can: ['#4a5060', '#98a2b4', '#d8dee8', '#ffffff'], misc: ['#f4f4f4', '#6a1a14', '#f4f0e8', '#3a0a08'] },
    L: { top: 'tee', sleevePrint: 1, hemPrint: 1, lower: 'shorts', pattern: 1, feet: 'bare', footInk: 1, hair: 'buzz', beard: 'stubble',
      ink: { neck: 1, armF: 1, armB: 1 }, can: 1, muscle: 1, win: 'can' }
  },
  bino: {
    D: { thigh: 17.5, shin: 16.5, ank: 3, torso: 26, neck: 2, ua: 13, fa: 12.5, shX: 2.5, hipH: 35, crH: 20, lean0: 0.1, tw: 10.4, hs: 1.08,
      st: [11, -9], gF: [10, -2], gB: [7, 2], legW: [9.4, 7.8], armW: [7.6, 6.4], fist: 3.6, walkDiv: 3, stride: 6 },
    M: { skin: ['#5a2e18', '#9a5a36', '#cc8a5c', '#eab088'], hair: ['#6a1a04', '#b0400e', '#e8661e', '#ffa04a'],
      hat: ['#5a0606', '#a81812', '#e03a22', '#ff7a5a'], pants: ['#0c1018', '#1a2232', '#2c3a54', '#465a7c'],
      shoe: ['#1c1008', '#3a2414', '#5a3c22', '#7a5834'], chain: ['#3e4654', '#808ca0', '#c4d0e0', '#f4f8ff'],
      misc: ['#3aa0ff', '#6a1a14', '#f4f0e8', '#3a0a08'] },
    L: { top: 'none', muscle: 1, lower: 'pants', feet: 'boot', hair: 'curly', beard: 'huge', hat: 'snapback', chain: 1, belt: 1,
      eyeC: 1, win: 'flex', toss: 'chain' }
  },
  sara: {
    D: { thigh: 17, shin: 17, ank: 3, torso: 22, neck: 3.4, ua: 12, fa: 11.5, shX: 1.5, hipH: 35, crH: 19, lean0: 0.06, tw: 6.9, hs: 0.96,
      st: [9, -7], gF: [9, -4], gB: [6, 0], legW: [6.4, 5.4], armW: [4.4, 3.9], fist: 2.4, walkDiv: 3, stride: 7 },
    M: { skin: ['#7a4a3a', '#c8907a', '#f0c2a8', '#ffe2d0'], hair: ['#030203', '#120a09', '#261814', '#3e2c26'],
      top: ['#16161a', '#2c2c32', '#44444c', '#62626c'], pants: ['#080c18', '#141c30', '#22304e', '#3a4a70'],
      shoe: ['#0a0a0c', '#1c1c20', '#323238', '#4e4e56'], ink: ['#22262e', '#4a505a'], glass: ['#9aa6b4', '#e4ecf4'],
      metal: ['#7a7a88', '#c0c0d0', '#f4f4fc'], wire: ['#7a3a14', '#c87838', '#f0b070', '#d0d4dc'],
      misc: ['#ffffff', '#8a2a2a', '#f8f4ee', '#4a0e0e'] },
    L: { top: 'tee', heather: 1, lower: 'pants', feet: 'boot', hair: 'long', glasses: 1, smile: 1, rings: 1,
      ink: { foreF: 1 }, win: 'peace', toss: 'wire' }
  }
};
const FXP = ['#000000', '#0a0d14', '#14324a', '#1e6a8a', '#3ad0e8', '#b8f4ff', '#7a3a14', '#c87838', '#f0b070', '#d0d4dc', '#ffffff'];
function palOf(ch) { const out = [OUT]; const M = ART[ch].M; for (const k in M) for (const c of M[k]) out.push(c); return out.concat(FXP); }
/* ---------- vector helpers ---------- */
const A2 = (a, b) => [a[0] + b[0], a[1] + b[1]], S2 = (a, b) => [a[0] - b[0], a[1] - b[1]], M2 = (a, k) => [a[0] * k, a[1] * k];
const R2 = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const N2 = (v) => { const d = Math.hypot(v[0], v[1]) || 1; return [v[0] / d, v[1] / d]; };
const LERP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function ik(a, t, L1, L2, bend) {
  let dx = t[0] - a[0], dy = t[1] - a[1], d = Math.hypot(dx, dy) || 0.001; const max = L1 + L2 - 0.01;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const ux = dx / d, uy = dy / d, aa = (L1 * L1 - L2 * L2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, L1 * L1 - aa * aa));
  return [[a[0] + ux * aa - uy * hh * bend, a[1] + uy * aa + ux * hh * bend], [a[0] + dx, a[1] + dy]];
}

/* ---------- pose -> joints ---------- */
function Q(D, o) {
  return Object.assign({ hip: [0, -D.hipH], lean: D.lean0, tilt: null, rot: 0, fF: [D.st[0], -D.ank], bF: [D.st[1], -D.ank],
    fH: D.gF.slice(), bH: D.gB.slice(), fHa: null, bHa: null, expr: 'n', kick: null, reach: null, reachMax: 6, fi: 0 }, o);
}
function crouchQ(D, o) {
  return Q(D, Object.assign({ hip: [-1, -D.crH], lean: D.lean0 + 0.42, fF: [D.st[0] + 3, -D.ank], bF: [D.st[1] - 3, -D.ank],
    fH: [D.gF[0], D.gF[1] + 3], bH: [D.gB[0], D.gB[1] + 2] }, o));
}
function solve(D, q) {
  let J = solve1(D, q);
  if (q.reach) {   // slide the hips forward so the fist/foot actually reaches the hitbox
    const tg = q.reach === 'fH' ? q.fHa : q.fF, end = q.reach === 'fH' ? J.fH : J.fA;
    const short = tg[0] - end[0];
    if (short > 0.5) {
      const sh = Math.min(short, q.reachMax), q2 = Object.assign({}, q, { reach: null, hip: [q.hip[0] + sh, q.hip[1]] });
      if (q.reach === 'fH') q2.fF = [q.fF[0] + sh * 0.7, q.fF[1]];
      J = solve1(D, q2);
    }
  }
  return J;
}
function solve1(D, q) {
  const hip = q.hip.slice(), L = q.lean, up = R2([0, -1], L), fw = R2([1, 0], L);
  const inv = (p) => A2(hip, R2(S2(p, hip), -q.rot));
  const fFt = q.fFw ? inv(q.fFw) : q.fF, bFt = q.bFw ? inv(q.bFw) : q.bF;
  const neck = A2(hip, M2(up, D.torso));
  const shF = A2(A2(hip, M2(up, D.torso - 3)), M2(fw, D.shX)), shB = A2(A2(hip, M2(up, D.torso - 4)), M2(fw, D.shX - 4));
  const fHt = q.fHa ? q.fHa : A2(shF, q.fH), bHt = q.bHa ? q.bHa : A2(shB, q.bH);
  const [fE, fH] = ik(shF, fHt, D.ua, D.fa, 1), [bE, bH] = ik(shB, bHt, D.ua, D.fa, 1);
  const hipF = A2(hip, [1, 0]), hipB = A2(hip, [-1.5, 0]);
  const [fK, fA] = ik(hipF, fFt, D.thigh, D.shin, -1), [bK, bA] = ik(hipB, bFt, D.thigh, D.shin, -1);
  const footDir = (K, Aa, tgt, kick) => {
    const sd = N2(S2(Aa, K));
    if (!q.rot && tgt[1] > -D.ank - 1.6 && !kick) return [1, 0];
    if (kick === 'point') return N2(R2(sd, -0.45));
    return N2(R2(sd, -Math.PI / 2));
  };
  const dF = footDir(fK, fA, fFt, q.kick), dB = footDir(bK, bA, bFt, null);
  const P = { hip, neck, shF, shB, fE, fH, bE, bH, hipF, hipB, fK, fA, bK, bA };
  const tilt = q.tilt != null ? q.tilt : -L * 0.7;
  if (q.rot) for (const k in P) P[k] = A2(hip, R2(S2(P[k], hip), q.rot));
  P.dF = R2(dF, q.rot); P.dB = R2(dB, q.rot);
  P.ang = L + q.rot; P.hang = L + tilt + q.rot;
  P.neckTop = A2(P.neck, R2([0, -D.neck], P.ang));
  return P;
}

/* ---------- painting primitives ---------- */
const LV = [0.45, -0.9];
function strokeSeg(g, a, b, w, col, off) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0] + off[0], a[1] + off[1]); g.lineTo(b[0] + off[0], b[1] + off[1]); g.stroke(); }
function lightN(p, q) { const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1; let n = [-dy / d, dx / d]; if (n[0] * LV[0] + n[1] * LV[1] < 0) n = [-n[0], -n[1]]; return n; }
function limb(g, pts, ws, C, stripe) {          // pts: [a, j, b]  ws: [w1, w2]  C: [shadow, base, hi]
  g.lineCap = 'round'; g.lineJoin = 'round';
  const segs = [[pts[0], pts[1], ws[0]], [pts[1], pts[2], ws[1]]];
  for (const [p, q, w] of segs) strokeSeg(g, p, q, w + 2, OUT, [0, 0]);
  for (const [p, q, w] of segs) strokeSeg(g, p, q, w, C[0], [0, 0]);
  for (const [p, q, w] of segs) { const n = lightN(p, q); strokeSeg(g, p, q, Math.max(1, w - 2.2), C[1], M2(n, 0.9)); }
  for (const [p, q, w] of segs) { if (w < 4) continue; const n = lightN(p, q); strokeSeg(g, p, q, 1, C[2], M2(n, w / 2 - 1.3)); }
  if (stripe) for (const [p, q, w] of segs) { const n = lightN(p, q); g.lineCap = 'butt'; strokeSeg(g, p, q, 1, stripe, M2(n, -w / 2 + 1.6)); g.lineCap = 'round'; }
}
function shadeShape(g, path, C, sh, hi) {
  sh = sh == null ? 2.2 : sh; hi = hi == null ? 1.3 : hi;
  g.save(); g.lineJoin = 'round'; g.lineWidth = 2; g.strokeStyle = OUT; g.beginPath(); path(g, 0, 0); g.stroke();
  g.beginPath(); path(g, 0, 0); g.clip();
  g.fillStyle = C[0]; g.fillRect(-999, -999, 1999, 1999);
  g.beginPath(); path(g, LV[0] * sh, LV[1] * sh); g.clip();
  g.fillStyle = C[2]; g.fillRect(-999, -999, 1999, 1999);
  g.fillStyle = C[1]; g.beginPath(); path(g, -LV[0] * hi, -LV[1] * hi); g.fill();
  g.restore();
}
const polyP = (pts) => { let ar = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; ar += a[0] * b[1] - b[0] * a[1]; } if (ar < 0) pts = pts.slice().reverse(); return polyP0(pts); };
const polyP0 = (pts) => (g, dx, dy) => { g.moveTo(pts[0][0] + dx, pts[0][1] + dy); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] + dx, pts[i][1] + dy); g.closePath(); };
const ellP = (c, rx, ry, a) => (g, dx, dy) => { a = a || 0; g.moveTo(c[0] + dx + rx * Math.cos(a), c[1] + dy + rx * Math.sin(a)); g.ellipse(c[0] + dx, c[1] + dy, rx, ry, a, 0, Math.PI * 2); };
const uni = (...ps) => (g, dx, dy) => { for (const p of ps) p(g, dx, dy); };
function line(g, a, b, w, col, out) { g.lineCap = 'round'; if (out) strokeSeg(g, a, b, w + 2, OUT, [0, 0]); strokeSeg(g, a, b, w, col, [0, 0]); }
function px(g, p, col, w, h) { g.fillStyle = col; g.fillRect(Math.round(p[0] - (w || 1) / 2), Math.round(p[1] - (h || 1) / 2), w || 1, h || 1); }
const F3 = (m) => [m[1], m[2], m[3]], B3 = (m) => [m[0], m[1], m[2]];

function fist(g, p, r, C) { shadeShape(g, ellP(p, r, r * 0.9), C, 1.4, 0.9); }
function shoe(g, A, d, C, kind, misc) {
  const dn = [-d[1], d[0]];               // "down" across the foot
  const T = (x, y) => A2(A2(A, M2(d, x)), M2(dn, y));
  if (kind === 'boot') {
    shadeShape(g, polyP([T(-4.4, -4.6), T(3.2, -4.6), T(4.2, -1.3), T(9.6, -0.2), T(10, 3), T(-4.6, 3)]), C, 1.6, 1);
    line(g, T(-4.2, 3), T(9.6, 3), 1.2, OUT); px(g, T(2, -2), C[2]); px(g, T(4, -0.6), C[2]);
  } else {
    shadeShape(g, polyP([T(-3.2, -2.4), T(1.5, -3), T(4.6, -0.8), T(7.6, 0.2), T(8, 2.4), T(-3.4, 2.4)]), C, 1.4, 0.9);
    line(g, T(-3, 2.2), T(7.6, 2.2), 1, misc[0]); line(g, T(0, 0), T(4.5, 0.9), 1, misc[0]);
  }
}
/* ---------- props ---------- */
function inkBlob(g, c, s) {     // INK SPLASH: glossy black-teal blob
  s = s || 1;
  shadeShape(g, uni(ellP(c, 4.6 * s, 3.8 * s), ellP([c[0] - 3 * s, c[1] + 2 * s], 2 * s, 1.6 * s), ellP([c[0] + 3.4 * s, c[1] - 2.2 * s], 1.8 * s, 1.5 * s)), [FXP[1], FXP[2], FXP[3]], 1.4 * s, 0.8);
  px(g, [c[0] + 1.4 * s, c[1] - 1.6 * s], FXP[4], 2, 1); px(g, [c[0] + 2.4 * s, c[1] - 2.2 * s], FXP[5]);
}
function wireCoil(g, c, s, a) { // WIRE TOSS: spinning coil of jewellery wire
  s = s || 1; a = a || 0;
  for (let k = 0; k < 3; k++) {
    const r = (4.6 - k * 1.3) * s;
    g.lineWidth = 3; g.strokeStyle = OUT; g.beginPath(); g.ellipse(c[0], c[1], r, r * 0.7, a + k * 0.7, 0, 6.3); g.stroke();
    g.lineWidth = 1.2; g.strokeStyle = k % 2 ? FXP[7] : FXP[8]; g.beginPath(); g.ellipse(c[0], c[1], r, r * 0.7, a + k * 0.7, 0, 6.3); g.stroke();
  }
  px(g, [c[0] + 3.4 * s, c[1] - 2 * s], FXP[10]); px(g, [c[0] - 2 * s, c[1] + 2 * s], FXP[9]);
}
function canProp(g, p, d, M) {  // silver drinks can, unbranded
  const C = M.can, up = [-d[1], d[0]];
  const T = (x, y) => A2(A2(p, M2(d, x)), M2(up, y));
  shadeShape(g, polyP([T(-2.4, -4.4), T(2.4, -4.4), T(2.4, 4.2), T(-2.4, 4.2)]), [C[0], C[1], C[2]], 1.2, 0.8);
  line(g, T(-2, -3.6), T(2, -3.6), 1, C[3]); line(g, T(-1.4, -1), T(-1.4, 2.6), 1, C[3]); line(g, T(-2, 1), T(2, 1), 1, M.print ? M.print[1] : C[0]);
}
function chainSpark(g, c, s, a) {   // CHAIN SPARK: a spinning loop of chain crackling with sparks
  s = s || 1; a = a || 0; const pts = [];
  for (let k = 0; k <= 8; k++) { const t = a + k / 8 * Math.PI * 2; pts.push([c[0] + Math.cos(t) * 4.6 * s, c[1] + Math.sin(t) * 3.4 * s]); }
  chainLinks(g, pts, [FXP[2], FXP[9], FXP[10], FXP[5]], 1.3 * s);
  for (let k = 0; k < 4; k++) { const t = a * 1.7 + k * 1.57, r = 6.2 * s; line(g, [c[0] + Math.cos(t) * r * 0.6, c[1] + Math.sin(t) * r * 0.6], [c[0] + Math.cos(t + 0.3) * r, c[1] + Math.sin(t + 0.3) * r], 1, k % 2 ? FXP[4] : FXP[5], true); }
  px(g, c, FXP[10], 2, 2);
}
function chainLinks(g, pts, C, r) {   // a run of steel links along a polyline
  r = r || 1.6; let k = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / (r * 1.7)));
    for (let j = 0; j < n; j++, k++) {
      const p = LERP(a, b, j / n), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      g.lineWidth = 2.6; g.strokeStyle = OUT; g.beginPath(); g.ellipse(p[0], p[1], r, k % 2 ? r * 0.45 : r * 0.8, ang, 0, 6.3); g.stroke();
      g.lineWidth = 1; g.strokeStyle = C[k % 2 ? 1 : 2]; g.beginPath(); g.ellipse(p[0], p[1], r, k % 2 ? r * 0.45 : r * 0.8, ang, 0, 6.3); g.stroke();
      if (k % 3 === 0) px(g, [p[0], p[1] - r * 0.6], C[3]);
    }
  }
}
function inkLimb(g, a, b, w, ink, seed) {   // tattoo marks along a limb (deterministic)
  const d = S2(b, a), n = N2([-d[1], d[0]]);
  for (let k = 0; k < 6; k++) {
    const t = 0.14 + k * 0.14, o = (((k * 7 + seed * 3) % 5) - 2) * w * 0.14;
    const p = A2(LERP(a, b, t), M2(n, o));
    if (k % 3 === 0) line(g, p, A2(p, M2(N2(d), 2.2)), 1, ink[0]);
    else px(g, p, ink[k % 2], 2, 1);
  }
}

/* ---------- the generic fighter painter ---------- */
function paintFighter(g, J, q, D, M, L, bust) {
  const TT = (p) => A2(J.hip, R2(p, J.ang)), hs = D.hs || 1, HT = (p) => A2(J.neckTop, R2([p[0] * hs, p[1] * hs], J.hang));
  const sx = D.tw / 8, sy = D.torso / 23, TS = (p) => TT([p[0] * sx, p[1] * sy]);
  const fi = q.fi || 0, ink = L.ink || {};
  const topC = L.top === 'none' ? M.skin : M.top;

  const arm = (sh, E, Hd, back) => {
    const T3 = back ? B3 : F3;
    limb(g, [sh, E, LERP(E, Hd, 0.82)], D.armW, T3(M.skin));
    if (L.muscle) { const n = lightN(sh, E); px(g, A2(LERP(sh, E, 0.45), M2(n, D.armW[0] * 0.25)), M.skin[3], 2, 1); }
    if ((back ? ink.armB : ink.armF)) { inkLimb(g, sh, E, D.armW[0], M.ink, back ? 1 : 0); inkLimb(g, E, Hd, D.armW[1], M.ink, back ? 3 : 2); }
    if (!back && ink.foreF) { inkLimb(g, LERP(E, Hd, 0.05), LERP(E, Hd, 0.8), D.armW[1], M.ink, 4); inkLimb(g, LERP(E, Hd, 0.15), LERP(E, Hd, 0.7), D.armW[1], M.ink, 1); }
    if (L.top === 'tee') {
      const sl = LERP(sh, E, 0.56); g.lineCap = 'round';
      strokeSeg(g, sh, sl, D.armW[0] + 3.4, OUT, [0, 0]); strokeSeg(g, sh, sl, D.armW[0] + 1.4, T3(M.top)[1], [0, 0]);
      strokeSeg(g, sh, sl, 1.2, T3(M.top)[2], M2(lightN(sh, sl), 1.8));
      if (L.sleevePrint && !back) { px(g, LERP(sh, sl, 0.6), M.print[1], 2, 2); px(g, A2(LERP(sh, sl, 0.75), [1, 0]), M.print[2]); }
    }
    fist(g, Hd, D.fist, T3(M.skin));
    if (L.rings && !back) { px(g, A2(Hd, [0.5, -0.5]), M.metal[2]); px(g, A2(Hd, [0.5, 0.8]), M.metal[1]); }
    if (L.can && back) canProp(g, A2(Hd, [0.5, -1.5]), [1, 0], M);
  };
  const leg = (hp, K, A, d, back) => {
    const T3 = back ? B3 : F3;
    if (L.lower === 'shorts') {
      limb(g, [hp, K, A], [D.legW[0] - 1, D.legW[1] - 0.6], T3(M.skin));
      const e = LERP(hp, K, 1.08); g.lineCap = 'round';
      strokeSeg(g, hp, e, D.legW[0] + 4.4, OUT, [0, 0]); strokeSeg(g, hp, e, D.legW[0] + 2.4, T3(M.pants)[1], [0, 0]);
      strokeSeg(g, hp, e, 1.4, T3(M.pants)[2], M2(lightN(hp, e), 2.2));
      if (L.pattern) for (let k = 0; k < 4; k++) px(g, A2(LERP(hp, e, 0.2 + k * 0.2), M2(lightN(hp, e), (k % 2 ? -1.6 : 1.4))), M.pat[k % 2]);
      if (L.footInk) px(g, LERP(K, A, 0.5), M.ink[0], 1, 2);
    } else limb(g, [hp, K, A], D.legW, T3(M.pants), M.pants[3]);
    if (L.feet === 'bare') {
      const dn = [-d[1], d[0]], T = (x, y) => A2(A2(A, M2(d, x)), M2(dn, y)), C = T3(M.skin);
      shadeShape(g, polyP([T(-3, -2), T(1.5, -2.2), T(4.5, -0.6), T(7.2, 0.2), T(7.4, 2), T(-3.2, 2)]), C, 1.2, 0.8);
      if (L.footInk) { px(g, T(2, -0.5), M.ink[0], 2, 1); px(g, T(4, 0.4), M.ink[1]); }
    } else shoe(g, A, d, T3(M.shoe), L.feet, M.misc);
  };

  // long hair hangs behind everything
  if (L.hair === 'long') {
    const w = Math.sin(fi * 1.2) * 0.8, k = q.hairK || 0;
    shadeShape(g, polyP([[-5.8, -11], [-7.6, -4], [-8.4 - k, 4 + w], [-8 - k * 1.5, 13 + w], [-3.8 - k, 15], [-1, 11], [-0.6, 3], [-2.4, -4]].map(HT)), F3(M.hair), 1.4, 0.9);
  }
  if (!bust) { arm(J.shB, J.bE, J.bH, true); leg(J.hipB, J.bK, J.bA, J.dB, true); }

  // torso
  const tpts = [[-6.5, 2.5], [6.5, 2.5], [7.8, -5], [9, -13], [8.4, -19], [4.5, -23.5], [-3, -24], [-7.6, -21], [-8.6, -12], [-7.8, -3]];
  if (L.muscle) tpts.splice(3, 2, [10, -13], [10.4, -18.5]);
  shadeShape(g, polyP(tpts.map(TS)), F3(topC), 2.6, 1.4);
  if (L.top === 'none') {
    line(g, TS([1.5, -15]), TS([8.4, -14.2]), 1, M.skin[0]);
    if (L.muscle) { line(g, TS([0, -13.6]), TS([0.6, -18]), 1, M.skin[0]); for (const y of [-10, -7, -4]) { px(g, TS([3.5, y]), M.skin[0], 2, 1); px(g, TS([6.3, y]), M.skin[0], 2, 1); } px(g, TS([8.4, -17]), M.skin[3], 2, 1); }
    else { px(g, TS([4, -8]), M.skin[1], 2, 1); px(g, TS([4.4, -4.5]), M.skin[1], 2, 1); }
    px(g, TS([5, -1.6]), M.skin[0]);
    if (ink.chest) {   // chest piece + script across the collarbones + belly work
      for (let x = -2; x <= 7; x += 1.6) line(g, TS([x, -20.4]), TS([x + 0.8, -19]), 1, M.ink[0]);
      line(g, TS([1, -13]), TS([3, -11]), 1, M.ink[0]); line(g, TS([3, -11]), TS([5, -13.2]), 1, M.ink[0]);
      line(g, TS([5.5, -12]), TS([6.8, -10.6]), 1, M.ink[1]); line(g, TS([6.8, -10.6]), TS([8, -12]), 1, M.ink[1]);
      g.lineWidth = 1; g.strokeStyle = M.ink[0]; g.beginPath(); g.arc(TS([3.6, -5])[0], TS([3.6, -5])[1], 2.6, 0.4, 5.2); g.stroke();
      px(g, TS([-3, -16]), M.ink[1], 2, 2); px(g, TS([-1, -9]), M.ink[0], 2, 1);
    }
  } else {
    line(g, TS([0.5, -5.2]), TS([7.4, -6.2]), 1, M.top[0]);
    line(g, TS([0, -23.8]), TS([4.6, -23.2]), 1, M.top[0]);
    if (L.heather) for (const p of [[2, -18], [5, -14], [0, -10], [6, -6], [-3, -14], [3, -3], [-5, -7]]) px(g, TS(p), M.top[3]);
    if (L.hemPrint) { px(g, TS([5, -2.4]), M.print[1], 2, 2); px(g, TS([6.5, -3]), M.print[2]); }
  }
  // waistband / belt
  if (L.lower === 'shorts') {
    shadeShape(g, polyP([[-7.4, 4.5], [7.4, 4.5], [7.6, 0.4], [-7.6, 0.4]].map(TS)), F3(M.pants), 1, 0.6);
    line(g, TS([4, 1.4]), TS([4.6, 6]), 1, M.misc[0]); line(g, TS([5.4, 1.4]), TS([6.4, 5.6]), 1, M.misc[0]);
  } else if (L.belt) {
    shadeShape(g, polyP([[-7.2, 3.2], [7.2, 3.2], [7.6, 0], [-7.6, 0]].map(TS)), [OUT, M.pants[0], M.pants[1]], 0.8, 0.5);
    px(g, TS([5, 1.6]), M.metal ? M.metal[2] : M.chain[2], 2, 2);
  }
  if (ink.neck) { px(g, LERP(J.neck, J.neckTop, 0.4), M.ink[0], 2, 2); }
  if (L.chain) {
    const cp = [[-4.6, -23.4], [-1.4, -19.8], [2.4, -17.2], [6.4, -17.8], [9, -21.4], [9.4, -24.4]].map(TS);
    chainLinks(g, cp, M.chain, 1.5);
  }
  if (!bust) leg(J.hipF, J.fK, J.fA, J.dF, false);

  // ---- head ----
  const nw = L.muscle ? 7.5 : D.tw < 7.5 ? 3.8 : 4.6;
  limb(g, [J.neck, LERP(J.neck, HT([0.6, -0.5]), 0.5), HT([0.6, -0.5])], [nw, nw], F3(M.skin));
  if (ink.neck) { const a = LERP(J.neck, HT([0.6, -0.5]), 0.3); px(g, A2(a, [1, 0]), M.ink[0], 2, 1); px(g, A2(a, [-1, -2]), M.ink[1], 2, 1); px(g, A2(a, [2, -1.5]), M.ink[0]); }
  const H = L.hair === 'curly';
  if (H) shadeShape(g, polyP([[-6.4, -12], [-9.2, -9], [-8.4, -4], [-10, -1], [-6, -1.6], [-4.2, -3.6], [-3.4, -10]].map(HT)), F3(M.hair), 1.2, 0.8);
  shadeShape(g, uni(ellP(HT([0.5, -6.5]), 5.6, 6.6, J.hang), polyP([[-2, -2], [1, 0.6], [4.6, 0.6], [6.1, -1.5], [6.6, -4], [7.7, -5.4], [6.6, -6.6], [6.6, -9], [2, -9]].map(HT))), F3(M.skin), 2, 1.1);
  g.fillStyle = M.skin[1]; g.beginPath(); ellP(HT([-1.2, -5.4]), 1.4, 2, J.hang)(g, 0, 0); g.fill();
  if (L.piercings) px(g, HT([-1.2, -3.4]), M.metal[2]);
  faceEyes(g, HT, q.expr, [4.3, -6.3], M, L);
  // beards
  if (L.beard === 'stubble') for (const p of [[2.6, -1.4], [3.8, -0.4], [5.2, 0], [6.2, -1], [5.6, -3.6], [6.6, -3.8], [1.6, -3]]) px(g, HT(p), M.hair[1]);
  if (L.beard === 'goatee') {
    shadeShape(g, polyP([[3.4, -1.4], [4.4, -2.4], [6.4, -2.6], [7, -1.4], [6.6, 0.6], [5, 2.2], [3.6, 1.4]].map(HT)), F3(M.beard), 0.8, 0.6);
    for (const p of [[2, -2.4], [1.4, -0.6], [2.8, 0.6]]) px(g, HT(p), M.beard[1]);
  }
  if (L.beard === 'huge') {
    const w = Math.sin(fi * 1.1) * 0.6;
    shadeShape(g, polyP([[-2.6, -5.6], [-3.2, -1], [-2, 4], [0.8, 9 + w], [4.6, 11.4 + w], [8.4, 9 + w], [10, 4], [9.6, -1.6], [7.6, -2.6], [4.4, -2.2], [2.4, -4.6], [0.4, -6.2]].map(HT)), F3(M.hair), 1.8, 1);
    for (const p of [[1, 2], [4, 5], [7, 3], [2.6, 7.4], [6, 8], [8.4, 0.4], [0, -2]]) px(g, HT(p), M.hair[3]);
    for (const p of [[3, 3.6], [5.6, 6], [1.6, 5], [7.6, 5.6]]) px(g, HT(p), M.hair[0]);
  }
  faceMouth(g, HT, q.expr, M, L);
  if (L.beard === 'goatee') shadeShape(g, polyP([[4, -3.6], [7.2, -4.2], [7.8, -3.2], [6.4, -3.1], [4.2, -2.8]].map(HT)), F3(M.beard), 0.5, 0.4);
  if (L.beard === 'huge') shadeShape(g, polyP([[3.6, -4.2], [8.4, -4.8], [10.6, -3.4], [9.6, -2.4], [7, -3], [4, -2.8]].map(HT)), F3(M.hair), 0.6, 0.5);
  if (L.piercings) { px(g, HT([7.6, -4.8]), M.metal[2]); px(g, HT([6.4, -1.4]), M.metal[2]); }
  // hair
  if (L.hair === 'messy') shadeShape(g, polyP([[-5.6, -3], [-6.6, -8], [-8.6, -10.4], [-6, -12], [-6.4, -15], [-2.6, -13.6], [-0.6, -16.2], [1.6, -13.8], [4.8, -15], [4.8, -12.4], [7.8, -11.4], [8.4, -8.4], [6, -9.6], [5.6, -7.6], [3, -9.4], [0.6, -8.4], [-1.8, -9], [-3, -5.6]].map(HT)), F3(M.hair), 1.6, 1);
  if (L.hair === 'buzz') {
    shadeShape(g, polyP([[-5.6, -4], [-6, -9], [-3.6, -12.6], [1, -13.3], [4.8, -12.2], [6.6, -9.8], [4.2, -10.3], [0.4, -10.4], [-2.6, -8.8], [-3.8, -4.6]].map(HT)), [M.hair[1], M.hair[2], M.hair[3]], 1, 0.6);
    for (const p of [[-2, -11.4], [2, -12], [-4, -8]]) px(g, HT(p), M.hair[0]);
  }
  if (L.hair === 'long') {
    shadeShape(g, polyP([[-5.8, -3], [-6.4, -9], [-3.6, -13], [1, -13.8], [5.2, -12.4], [7.2, -9.4], [7, -7], [5, -9.4], [1.4, -9.8], [-1.8, -8.2], [-3.4, -3]].map(HT)), F3(M.hair), 1.4, 0.9);
    shadeShape(g, polyP([[-4.4, -7], [-2.4, -7.6], [-2.2, 1.6], [-4, 2.4]].map(HT)), F3(M.hair), 0.6, 0.4);
    px(g, HT([0, -12]), M.hair[3], 2, 1);
  }
  if (H) for (const p of [[-6.6, -9.6], [-7.4, -6], [-5.6, -4.2]]) px(g, HT(p), M.hair[3]);
  if (L.hat === 'snapback') {
    shadeShape(g, uni(ellP(HT([0.4, -11.4]), 6.4, 4, J.hang), polyP([[-6.2, -11], [6.8, -11.4], [7, -9.4], [-6.4, -9.2]].map(HT))), F3(M.hat), 1.6, 1);
    shadeShape(g, polyP([[-5.4, -11.4], [-12, -11.2], [-12.4, -9.4], [-5.6, -9.2]].map(HT)), B3(M.hat), 0.8, 0.5);
    line(g, HT([-4.6, -10.4]), HT([-3, -13.2]), 1, M.hat[0]); px(g, HT([0.6, -15.2]), M.hat[3]);
    for (const p of [[6.4, -8.6], [5.2, -8.8], [-5.8, -8.4]]) px(g, HT(p), M.hair[2]);
  }
  if (L.glasses) {
    const e = HT([4.6, -6.2]);
    g.lineWidth = 2; g.strokeStyle = OUT; g.beginPath(); g.arc(e[0], e[1], 1.7 * hs, 0, 6.3); g.stroke();
    g.lineWidth = 0.8; g.strokeStyle = M.glass[1]; g.beginPath(); g.arc(e[0], e[1], 1.7 * hs, 0, 6.3); g.stroke();
    line(g, HT([2.9, -6.5]), HT([-1, -6]), 0.8, M.glass[0]); px(g, HT([5.3, -7.1]), '#ffffff');
  }
  if (!bust) arm(J.shF, J.fE, J.fH, false);
}
function faceEyes(g, HT, ex, e, M, L) {
  const eye = HT(e), white = M.misc[2], dark = OUT;
  if (ex === 'h' || ex === 'k') line(g, HT([e[0] - 1, e[1] - 0.2]), HT([e[0] + 1.6, e[1] + 0.6]), 1, dark);
  else if (ex === 'x') { line(g, HT([e[0] - 0.8, e[1] - 1]), HT([e[0] + 1, e[1] + 1]), 1, dark); line(g, HT([e[0] - 0.8, e[1] + 1]), HT([e[0] + 1, e[1] - 1]), 1, dark); }
  else if (ex === 'l' || (ex === 's' && L.smile)) { line(g, HT([e[0] - 1, e[1] + 0.4]), HT([e[0], e[1] - 0.6]), 1, dark); line(g, HT([e[0], e[1] - 0.6]), HT([e[0] + 1.2, e[1] + 0.4]), 1, dark); }
  else { px(g, eye, white, 2, 1); px(g, HT([e[0] + 0.9, e[1]]), L.eyeC ? M.misc[0] : dark); }
  const bc = L.hair === 'curly' ? M.hair[1] : M.hair[0], bw = L.beard === 'huge' ? 1.6 : 1;
  const bl = ex === 'h' ? [[e[0] - 1.2, e[1] - 2.6], [e[0] + 2, e[1] - 2.2]] : ex === 'g' ? [[e[0] - 1.3, e[1] - 1.8], [e[0] + 2.2, e[1] - 1.2]] : [[e[0] - 1.3, e[1] - 2.3], [e[0] + 2.2, e[1] - 1.6]];
  line(g, HT(bl[0]), HT(bl[1]), bw, bc);
}
function faceMouth(g, HT, ex, M, L) {
  const white = M.misc[2], mouthC = M.misc[3];
  const grin = () => {   // big toothy grin
    const k = L.smile ? 0.6 : 0;
    g.fillStyle = OUT; g.beginPath(); polyP([[3.4 - k, -3.3], [6.9, -3.7 - k * 0.3], [6.7, -1.2 + k], [4.2, -1.1 + k * 0.6]].map(HT))(g, 0, 0); g.fill();
    g.fillStyle = white; g.beginPath(); polyP([[3.9 - k, -3.1], [6.6, -3.4 - k * 0.3], [6.5, -2.1 + k * 0.5], [4.3, -1.9 + k * 0.4]].map(HT))(g, 0, 0); g.fill();
    if (L.smile) line(g, HT([4.4, -2.5]), HT([6.4, -2.7]), 0.5, M.misc[3]);
    if (L.goldTooth) px(g, HT([5.4, -2.7]), M.misc[0]);
  };
  const open = () => { g.fillStyle = mouthC; g.beginPath(); polyP([[4.2, -2.9], [6.5, -3.3], [6.3, -1], [4.6, -1.1]].map(HT))(g, 0, 0); g.fill(); px(g, HT([5.3, -2.8]), white, 2, 1); };
  if (ex === 'h') open();
  else if (ex === 's' || ex === 'l' || (ex === 'n' && L.smile)) grin();
  else if (ex === 'g') px(g, HT([5.4, -2]), white, 2, 1);
  else if (ex === 'k' || ex === 'x') line(g, HT([4.6, -1.8]), HT([6.2, -2.2]), 1, mouthC);
  else line(g, HT([4.6, -2]), HT([6.2, -2.4]), 1, mouthC);
}

/* ---------- animation sets ---------- */
function animsFor(ch) {
  const D = ART[ch].D, LK = ART[ch].L, MV = CHARS[ch].moves, L = [], big = D.tw >= 11;
  const add = (name, meta, frames) => L.push({ name, meta, frames });
  const T = (k, dx) => { const b = MV[k].box; return [b[0] + b[2] - 4 + (dx || 0), -(b[1] + b[3] / 2)]; };
  const hy = -D.hipH, ln = D.lean0, ank = -D.ank;
  add('idle', { fps: big ? 6 : 8 }, [0, 1, 2, 3, 4, 5].map(i => { const b = [0, 0, 1, 1, 1, 0][i]; return Q(D, { hip: [0, hy + b], fH: [D.gF[0], D.gF[1] + b * 0.6], bH: [D.gB[0], D.gB[1] + b], fi: i }); }));
  add('walk', { by: 'walk', div: D.walkDiv }, [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
    const a = i / 8 * Math.PI * 2, s = Math.sin(a), c = Math.cos(a), st = D.stride;
    return Q(D, { hip: [0, hy + (Math.abs(s) > 0.7 ? 1 : 0)], fF: [D.st[0] + s * st, ank - Math.max(0, c) * 3], bF: [D.st[1] - s * st, ank - Math.max(0, -c) * 3],
      fH: [D.gF[0] + s * 1.5, D.gF[1]], bH: [D.gB[0] - s * 1.5, D.gB[1]], lean: ln + 0.04, fi: i });
  }));
  add('crouch', { fps: 3 }, [crouchQ(D, {}), crouchQ(D, { hip: [-1, -D.crH + 1], fi: 2 })]);
  const air = (o) => Q(D, Object.assign({ lean: ln + 0.08, fF: [10, hy + 17], bF: [-3, hy + 14], fH: [8, -3], bH: [5, 1], hairK: -2 }, o));
  add('jump', { by: 'vy' }, [air({ fF: [7, hy + 28], bF: [-6, hy + 31], fH: [7, -10], bH: [3, -6], hairK: 2 }), air({ fi: 2 }), air({ fF: [9, hy + 26], bF: [-5, hy + 29], fH: [10, 0], fi: 4 })]);
  add('land', {}, [Q(D, { hip: [0, hy + 6], lean: ln + 0.2 })]);
  add('block', {}, [Q(D, { fH: [7, -9], bH: [10, -5], lean: ln - 0.08, hip: [-1, hy], expr: 'g' })]);
  add('cblock', {}, [crouchQ(D, { fH: [8, -8], bH: [10, -4], expr: 'g' })]);
  add('hit', { by: 't', t: [6] }, [Q(D, { lean: -0.3, tilt: -0.35, hip: [-3, hy + 1], fH: [-2, 10], bH: [-7, 7], expr: 'h', hairK: 3 }), Q(D, { lean: -0.14, tilt: -0.1, hip: [-1, hy], fH: [4, 6], bH: [1, 5], expr: 'h', hairK: 1 })]);
  add('chit', { by: 't', t: [6] }, [crouchQ(D, { lean: 0.05, tilt: -0.4, fH: [-2, 8], bH: [-6, 6], expr: 'h' }), crouchQ(D, { lean: 0.22, expr: 'h' })]);
  add('kd', { by: 't', t: [4, 10] }, [
    Q(D, { rot: -0.35, lean: -0.1, fH: [-6, -8], bH: [-10, -4], fF: [12, -6], bF: [0, -4], expr: 'h' }),
    Q(D, { rot: -0.95, lean: 0, fH: [-9, -10], bH: [-12, -4], fF: [14, -10], bF: [4, -14], expr: 'h', fi: 2 }),
    Q(D, { rot: -1.35, lean: 0, fH: [-10, -6], bH: [-12, 0], fF: [12, -6], bF: [6, -12], expr: 'h', fi: 4 })]);
  const lie = (ex) => Q(D, { hip: [0, -7], rot: -Math.PI / 2, lean: 0, tilt: 0.25, fFw: [D.thigh + D.shin - 2, -4], bFw: [D.thigh + 4, -10], fH: [-6, 9], bH: [-3, 10], expr: ex });
  add('lie', {}, [lie('k')]);
  add('ko', {}, [lie('x')]);
  add('rise', { by: 't', t: [5, 10] }, [Q(D, { hip: [-4, -13], rot: -1.0, lean: 0, fFw: [15, ank], bFw: [9, ank], fH: [-4, 10], bH: [-8, 10] }), crouchQ(D, {}), Q(D, { hip: [0, hy + 6], lean: ln + 0.2 })]);
  // win poses
  const W = (o) => Q(D, Object.assign({ fF: [6, ank], bF: [-6, ank] }, o));
  if (LK.win === 'pump') add('win', { fps: 6 }, [
    W({ hip: [0, hy - 1], lean: -0.05, fH: [3, -21], bH: [-3, 10], expr: 's', fi: 0 }), W({ hip: [0, hy - 1], lean: -0.05, fH: [4, -19], bH: [-3, 10], expr: 's', fi: 1 }),
    W({ hip: [0, hy], lean: 0, fH: [7, -12], bH: [-3, 10], expr: 'l', fi: 2 }), W({ hip: [0, hy - 1], lean: -0.05, fH: [4, -20], bH: [-3, 10], expr: 's', fi: 3 })]);
  if (LK.win === 'can') add('win', { fps: 5 }, [
    W({ lean: -0.04, bH: [5, -22], fH: [9, 6], expr: 's' }), W({ hip: [0, hy - 1], lean: -0.06, bH: [6, -23], fH: [9, 5], expr: 'l', fi: 1 }),
    W({ lean: -0.12, tilt: -0.3, bH: [6, -16], fH: [9, 6], expr: 'n', fi: 2 }), W({ hip: [0, hy - 1], lean: -0.06, bH: [5, -22], fH: [9, 4], expr: 's', fi: 3 })]);
  if (LK.win === 'flex') add('win', { fps: 4 }, [
    W({ fF: [9, ank], bF: [-9, ank], lean: -0.04, fHa: [17, -82], bHa: [-12, -82], expr: 'l' }), W({ fF: [9, ank], bF: [-9, ank], hip: [0, hy + 1], lean: -0.02, fHa: [17, -80], bHa: [-12, -80], expr: 's', fi: 1 }),
    W({ fF: [9, ank], bF: [-9, ank], lean: 0.02, fH: [12, 2], bH: [13, 0], expr: 'l', fi: 2 }), W({ fF: [9, ank], bF: [-9, ank], lean: -0.04, fHa: [17, -82], bHa: [-12, -82], expr: 'l', fi: 3 })]);
  if (LK.win === 'peace') add('win', { fps: 6 }, [
    W({ lean: -0.04, fH: [5, -19], bH: [-2, 9], expr: 's', peace: 1, fi: 0 }), W({ hip: [0, hy - 1], lean: -0.06, fH: [6, -20], bH: [-2, 9], expr: 's', peace: 1, fi: 1, hairK: 1 }),
    W({ lean: -0.04, tilt: 0.2, fH: [5, -19], bH: [-2, 9], expr: 'l', peace: 1, fi: 2 }), W({ hip: [0, hy - 1], lean: -0.06, fH: [6, -20], bH: [-2, 9], expr: 's', peace: 1, fi: 3, hairK: -1 })]);
  // normals: anticipation (s) -> active (a) -> recovery (r)
  add('lp', { ph: ['s', 'a', 'r'] }, [Q(D, { fH: [2, 0], lean: ln + 0.02 }), Q(D, { fHa: T('lp'), reach: 'fH', reachMax: 6, lean: ln + 0.12, expr: 's' }), Q(D, { fH: [13, -3], hip: [1, hy], lean: ln + 0.06 })]);
  add('hp', { ph: ['s', 's', 'a', 'r', 'r'] }, [
    Q(D, { fH: [-4, 3], bH: [10, -4], lean: ln - 0.1, hip: [-2, hy] }), Q(D, { fH: [1, 0], lean: ln + 0.06 }),
    Q(D, { fHa: T('hp'), reach: 'fH', reachMax: 9, lean: ln + 0.28, fF: [D.st[0] + 4, ank], bH: [3, 5], expr: 's', hairK: 2 }),
    Q(D, { fH: [15, -2], hip: [3, hy], lean: ln + 0.18, fF: [D.st[0] + 3, ank] }), Q(D, { fH: [11, -2], hip: [1, hy], lean: ln + 0.08 })]);
  add('lk', { ph: ['s', 'a', 'r'] }, [Q(D, { fF: [8, hy + 16], lean: ln - 0.06 }), Q(D, { fF: T('lk', -3), reach: 'fF', reachMax: 5, kick: 'point', lean: ln - 0.16, expr: 's' }), Q(D, { fF: [11, hy + 18], lean: ln - 0.08 })]);
  add('hk', { ph: ['s', 's', 'a', 'r', 'r'] }, [
    Q(D, { fF: [3, hy + 20], lean: ln - 0.04, bH: [-5, 5] }), Q(D, { fF: [9, hy + 8], lean: ln - 0.18, bH: [-8, 3] }),
    Q(D, { fF: T('hk', -3), reach: 'fF', reachMax: 8, kick: 'flat', lean: ln - 0.32, fH: [5, 6], bH: [-11, 2], expr: 's', hairK: 2 }),
    Q(D, { fF: [16, hy + 6], lean: -0.2, hip: [2, hy] }), Q(D, { fF: [10, hy + 18], lean: ln - 0.08 })]);
  add('clp', { ph: ['s', 'a', 'r'] }, [crouchQ(D, { fH: [3, 3] }), crouchQ(D, { fHa: T('clp'), reach: 'fH', reachMax: 5, lean: ln + 0.5, expr: 's' }), crouchQ(D, { fH: [12, 0] })]);
  const cb = MV.chp.box;
  add('chp', { ph: ['s', 's', 'a', 'r', 'r'] }, [
    crouchQ(D, { fH: [0, 9], lean: ln + 0.55, hip: [-1, -D.crH + 1] }), crouchQ(D, { fH: [5, 4], lean: ln + 0.4 }),
    Q(D, { hip: [2, -D.crH - 9], lean: ln - 0.06, fF: [D.st[0] + 3, ank], bF: [D.st[1] - 3, ank], fHa: [cb[0] + cb[2] * 0.55, -(cb[1] + cb[3] - 3)], bH: [4, 8], expr: 's' }),
    Q(D, { hip: [1, -D.crH - 5], lean: ln + 0.1, fF: [D.st[0] + 3, ank], bF: [D.st[1] - 3, ank], fH: [8, -12] }), crouchQ(D, { fH: [9, 0] })]);
  add('clk', { ph: ['s', 'a', 'r'] }, [crouchQ(D, { fF: [D.st[0] + 6, ank - 2] }), crouchQ(D, { fF: [T('clk')[0] - 3, ank], reach: 'fF', reachMax: 4, kick: 'flat', lean: ln + 0.3, expr: 's' }), crouchQ(D, { fF: [D.st[0] + 10, ank - 1] })]);
  add('chk', { ph: ['s', 's', 'a', 'r', 'r'] }, [
    crouchQ(D, { hip: [-2, -D.crH + 2], fF: [D.st[0] + 4, ank - 2], bHa: [-2, -4] }),
    crouchQ(D, { hip: [-3, -D.crH + 3], lean: ln + 0.55, fF: [D.st[0] + 12, ank], bHa: [-4, -3] }),
    crouchQ(D, { hip: [-3, -D.crH + 4], lean: ln + 0.6, fF: [T('chk')[0] - 3, ank], reach: 'fF', reachMax: 6, kick: 'flat', bF: [D.st[1] - 4, ank], bHa: [-6, -3], fH: [6, 6], expr: 's' }),
    crouchQ(D, { hip: [-2, -D.crH + 3], lean: ln + 0.5, fF: [D.st[0] + 18, ank], bHa: [-4, -3] }), crouchQ(D, {})]);
  add('jp', { ph: ['s', 'a', 'r'] }, [air({ fH: [1, 1] }), air({ fHa: T('jp'), lean: ln + 0.3, expr: 's' }), air({ fH: [12, 4] })]);
  add('jk', { ph: ['s', 'a', 'r'] }, [air({ fF: [5, hy + 12] }), air({ fF: T('jk', -3), kick: 'flat', lean: ln - 0.12, bF: [-7, hy + 12], expr: 's' }), air({ fF: [12, hy + 18] })]);
  // specials
  const SP = MV.sp;
  if (SP.anim === 'rush') add('sp', { ph: ['s', 's', 'a', 'a', 'r', 'r'] }, [
    crouchQ(D, { hip: [-2, -D.crH - 3], lean: ln + 0.5, fH: [-8, 7], bH: [-10, 5] }),
    crouchQ(D, { hip: [-3, -D.crH - 1], lean: ln + 0.6, fH: [-11, 4], bH: [-12, 3], expr: 's' }),
    Q(D, { hip: [3, hy + 4], lean: 0.5, fF: [16, ank], bF: [-16, ank - 4], fH: [9, 9], bHa: [26, -58], expr: 's', speed: 1, fi: 0 }),
    Q(D, { hip: [3, hy + 3], lean: 0.52, fF: [14, ank - 3], bF: [-18, ank - 2], fH: [10, 8], bHa: [27, -57], expr: 's', speed: 2, fi: 3 }),
    crouchQ(D, { hip: [1, -D.crH - 4], fH: [6, 2] }), Q(D, { hip: [0, hy + 4], lean: ln + 0.15 })]);
  if (SP.anim === 'toss') { const P = SP.proj, hold = LK.toss; add('sp', { ph: ['s', 's', 's', 'a', 'r', 'r'] }, [
    Q(D, { fHa: [12, -48], lean: ln + 0.12, hold }),
    Q(D, { fH: [-11, -8], hold, lean: ln - 0.12, hip: [-2, hy], bH: [10, -2], hairK: -1 }),
    Q(D, { fH: [-8, -15], hold, lean: ln - 0.2, hip: [-3, hy], bH: [12, -4], expr: 's', hairK: -2 }),
    Q(D, { fHa: [P.x + 4, -P.y - 2], reach: 'fH', reachMax: 7, lean: ln + 0.32, fF: [D.st[0] + 5, ank], bH: [-4, 6], expr: 's', hairK: 3 }),
    Q(D, { fH: [17, -1], hip: [3, hy], lean: ln + 0.22, fF: [D.st[0] + 4, ank] }), Q(D, { fH: [12, 0], hip: [1, hy], lean: ln + 0.1 })]); }
  if (SP.anim === 'whip') { const tip = T('sp', 4); add('sp', { ph: ['s', 's', 'a', 'a', 'r', 'r'] }, [
    Q(D, { fH: [-12, -6], lean: ln - 0.14, hip: [-3, hy], bH: [10, -2], chain: 'back' }),
    Q(D, { fHa: [-4, -96], lean: ln - 0.2, hip: [-3, hy], bH: [12, -4], chain: 'up', expr: 's' }),
    Q(D, { fHa: [30, -62], reach: 'fH', reachMax: 6, lean: ln + 0.3, fF: [D.st[0] + 6, ank], bH: [-6, 6], chain: 'out', tip, expr: 'l' }),
    Q(D, { fHa: [30, -60], reach: 'fH', reachMax: 6, lean: ln + 0.3, fF: [D.st[0] + 6, ank], bH: [-6, 6], chain: 'out2', tip, expr: 'l' }),
    Q(D, { fH: [16, -2], hip: [3, hy], lean: ln + 0.2, fF: [D.st[0] + 4, ank], chain: 'curl', tip }),
    Q(D, { fH: [11, 1], hip: [1, hy], lean: ln + 0.08, chain: 'hang' })]); }
  if (SP.anim === 'grab') { const top = -D.hipH - D.torso - 26; add('sp', { ph: ['s', 's', 'a', 'r', 'r', 'r'] }, [
    Q(D, { hip: [-2, hy + 2], lean: ln - 0.05, fH: [-4, 6], bH: [-6, 6], expr: 'g' }),
    Q(D, { hip: [3, hy + 3], lean: ln + 0.3, fF: [D.st[0] + 5, ank], fHa: [30, -58], bHa: [28, -50], expr: 's' }),
    Q(D, { hip: [4, hy + 3], lean: ln + 0.34, fF: [D.st[0] + 6, ank], fHa: [32, -60], bHa: [30, -52], expr: 'l' }),
    Q(D, { hip: [0, hy - 1], lean: -0.22, tilt: -0.2, fHa: [6, top], bHa: [-2, top + 2], expr: 'l', hairK: -2 }),
    crouchQ(D, { hip: [3, -D.crH - 4], lean: ln + 0.55, fH: [16, 12], bH: [13, 12], expr: 's', speedV: 1 }),
    Q(D, { hip: [1, hy + 3], lean: ln + 0.12, fH: [10, 2], expr: 's' })]); }
  if (MV.sp2 && MV.sp2.anim === 'stomp') add('sp2', { ph: ['s', 's', 's', 'a', 'r', 'r'] }, [
    Q(D, { hip: [-1, hy], lean: ln - 0.08, fF: [9, hy + 24], fH: [-2, -10], bH: [-6, -8], expr: 'g' }),
    Q(D, { hip: [-2, hy - 1], lean: ln - 0.14, fF: [10, hy + 18], fH: [-4, -16], bH: [-8, -14], expr: 'l', hairK: -2 }),
    Q(D, { hip: [-2, hy - 2], lean: ln - 0.16, fF: [11, hy + 16], fH: [-4, -18], bH: [-8, -16], expr: 'l', hairK: -3 }),
    Q(D, { hip: [2, hy + 7], lean: ln + 0.28, fF: [D.st[0] + 6, ank], bF: [D.st[1] - 4, ank], fH: [12, 12], bH: [8, 12], expr: 's', speedV: 2 }),
    Q(D, { hip: [1, hy + 5], lean: ln + 0.2, fF: [D.st[0] + 5, ank], fH: [10, 8], bH: [6, 8], expr: 's' }),
    Q(D, { hip: [0, hy + 2], lean: ln + 0.08 })]);
  if (MV.sp2 && MV.sp2.anim === 'fury') { const tip = T('sp2', 4), lo = A2(tip, [-6, 14]), hi = A2(tip, [-8, -14]); add('sp2', { ph: ['s', 'a', 'a', 'a', 'a', 'r'] }, [
    Q(D, { fH: [-12, -6], lean: ln - 0.1, hip: [-3, hy], bH: [-6, 2], chain: 'back', expr: 'g' }),
    Q(D, { fHa: [24, -70], reach: 'fH', reachMax: 6, bH: [-2, 4], lean: ln + 0.3, fF: [D.st[0] + 6, ank], chain: 'out', tip: hi, expr: 'l', speed: 1 }),
    Q(D, { fH: [4, 6], bHa: [26, -48], lean: ln + 0.34, fF: [D.st[0] + 7, ank], chain: 'out2', tip: lo, expr: 'l', speed: 2, hairK: 2 }),
    Q(D, { fHa: [26, -60], reach: 'fH', reachMax: 6, bH: [-4, 4], lean: ln + 0.32, fF: [D.st[0] + 6, ank], chain: 'out', tip, expr: 'l', speed: 1, hairK: -1 }),
    Q(D, { fH: [16, -4], bHa: [24, -40], lean: ln + 0.36, fF: [D.st[0] + 8, ank], chain: 'curl', tip, expr: 'l', speed: 2, hairK: 3 }),
    Q(D, { fH: [11, 1], hip: [1, hy], lean: ln + 0.08, chain: 'hang' })]); }
  if (MV.sp2 && MV.sp2.tele) add('sp2', { ph: ['s', 's', 'a', 'a', 'r'] }, [
    crouchQ(D, { hip: [-1, -D.crH - 2], lean: ln + 0.5, fH: [-4, 8], bH: [-8, 6], expr: 's' }),
    air({ hip: [0, hy - 2], fF: [6, hy + 24], bF: [-4, hy + 26], fH: [4, -16], bH: [-2, -18], lean: -0.1, expr: 's', hairK: -3 }),
    Q(D, { hip: [-7, -27], lean: -0.42, fF: [13, -1], kick: 'point', bF: [-4, -13], fH: [-8, -6], bH: [-11, -2], expr: 's', hairK: -4, speedV: 1 }),
    Q(D, { hip: [-7, -26], lean: -0.4, fF: [14, 0], kick: 'point', bF: [-5, -12], fH: [-9, -5], bH: [-12, -1], expr: 's', hairK: -4, speedV: 2 }),
    crouchQ(D, { hip: [0, -D.crH - 2], fH: [7, 2], expr: 's' })]);
  if (MV.dsh) add('dsh', { ph: ['s', 'a', 'r'] }, [
    Q(D, { hip: [0, hy + 2], lean: ln + 0.3, fF: [12, ank - 2], bF: [-8, ank], fH: [-4, 4], bH: [-8, 3], hairK: 3 }),
    Q(D, { hip: [1, hy + 3], lean: ln + 0.42, fF: [15, ank - 4], bF: [-15, ank - 7], fH: [-8, 5], bH: [-11, 3], hairK: 5, speed: 1 }),
    Q(D, { hip: [0, hy + 2], lean: ln + 0.2, fF: [10, ank], bF: [-6, ank], hairK: 2 })]);
  return L;
}
function chainPts(q, J) {
  const h = J.fH, t = q.tip || [80, -56];
  if (q.chain === 'back') return [h, A2(h, [-5, 8]), A2(h, [-12, 13]), A2(h, [-18, 14])];
  if (q.chain === 'up') return [h, A2(h, [-7, 4]), A2(h, [-15, 2]), A2(h, [-21, -4])];
  if (q.chain === 'out') return [h, LERP(h, t, 0.33), A2(LERP(h, t, 0.66), [0, 2]), t];
  if (q.chain === 'out2') return [h, A2(LERP(h, t, 0.3), [0, 2]), A2(LERP(h, t, 0.62), [0, -1.5]), A2(t, [-2, 1.5])];
  if (q.chain === 'curl') return [h, A2(h, [12, 4]), A2(h, [22, 8]), A2(h, [26, 14])];
  return [h, A2(h, [1, 7]), A2(h, [0, 14])];
}
function paintFrame(g, ch, q) {
  const D = ART[ch].D, M = ART[ch].M, L = ART[ch].L, J = solve(D, q);
  if (q.speed) { const c = q.speed === 1 ? '#d0d4dc' : '#ffffff'; for (let k = 0; k < 5; k++) { const y = J.hip[1] - 30 + k * 7 + (q.speed === 2 ? 3 : 0), x0 = J.hip[0] - 12 - (k % 2) * 6; line(g, [x0 - 18 - k * 3, y], [x0, y], 1.2, c, true); } }
  if (q.speedV) for (let k = 0; k < 4; k++) { const x = J.hip[0] - 10 + k * 7, y0 = J.neckTop[1] - 6 - (k % 2) * 6 - (q.speedV === 2 ? 3 : 0); line(g, [x, y0 - 16 - k * 2], [x, y0], 1.2, '#d0d4dc', true); }
  if (q.chain && M.chain) chainLinks(g, chainPts(q, J), M.chain, 1.8);
  paintFighter(g, J, q, D, M, L, false);
  if (q.hold === 'ink') inkBlob(g, A2(J.fH, [0, -3.5]), 0.85);
  if (q.hold === 'wire') wireCoil(g, A2(J.fH, [0, -3.5]), 0.75, 0);
  if (q.hold === 'chain') chainSpark(g, A2(J.fH, [0, -3.5]), 0.7, 0.6);
  if (q.peace) { line(g, A2(J.fH, [-0.6, -2]), A2(J.fH, [-1.6, -6]), 1, M.skin[2], true); line(g, A2(J.fH, [0.8, -2]), A2(J.fH, [1.8, -6]), 1, M.skin[2], true); }
}
function buildSheet(ch) {
  const pal = palOf(ch), anims = animsFor(ch), S = { fw: FW, fh: FH, ox: FOX, oy: FOY, scale: 1, imgs: [], anims: {} };
  const scratch = mk(FW, FH, true);
  anims.forEach((A, row) => {
    const rc = mk(FW * A.frames.length, FH);
    A.frames.forEach((q, i) => {
      const g = scratch.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, FW, FH); g.save(); g.translate(FOX, FOY);
      paintFrame(g, ch, q); g.restore(); pixelate(scratch, pal, null); rc.g.drawImage(scratch, i * FW, 0);
    });
    S.imgs.push(rc); S.anims[A.name] = Object.assign({ row, n: A.frames.length }, A.meta);
  });
  return S;
}
/* portrait: head + shoulders, drawn bigger, same painter */
function makePortrait(ch, size, sc, expr) {
  const D = ART[ch].D, c = mk(size, size, true), g = c.g, J = solve(D, Q(D, { lean: 0, tilt: 0, expr }));
  const hb = ART[ch].L.beard === 'huge'; if (hb) sc *= 0.86;
  const cx = J.neckTop[0] + 1.5, cy = J.neckTop[1] - 6 * (D.hs || 1) + (hb ? 1.5 : 0);
  g.setTransform(sc, 0, 0, sc, size * 0.5 - cx * sc, size * 0.5 - cy * sc);
  paintFighter(g, J, { expr, fi: 1 }, D, ART[ch].M, ART[ch].L, true);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return pixelate(c, palOf(ch), null);
}
const SHEETS = {}, PORTRAITS = {};
function buildFighterArt() {
  for (const ch of CHAR_IDS) {
    SHEETS[ch] = buildSheet(ch);
    PORTRAITS[ch] = { n: makePortrait(ch, 30, 1.25, 'n'), h: makePortrait(ch, 30, 1.25, 'h'), big: makePortrait(ch, 96, 3.6, 'n'), win: makePortrait(ch, 96, 3.6, 's') };
  }
}

/* ---------- picking a frame for the fighter's current state ---------- */
function poseOf(f) {
  const M = moveDef(f);
  if (M) {
    let p; if (f.mf < M.s) p = f.mf / M.s; else if (f.mf < M.s + M.a) p = 1; else p = M.r ? Math.max(0, 1 - (f.mf - M.s - M.a) / M.r) : 1;
    return { name: (f.mv[0] === 'c' ? 'c' : '') + M.anim, p, M };
  }
  if (f.st === 'walk') return { name: 'walk', p: 0 };
  if (f.st === 'crouch') return { name: 'crouch', p: 0 };
  if (f.st === 'block') return { name: f.cr ? 'cblock' : 'block', p: 0 };
  if (f.st === 'hit') return { name: f.cr ? 'chit' : 'hit', p: 0 };
  return { name: f.st, p: 0 };
}
function animOf(f, S) {
  const P = poseOf(f);
  return (f.mv && S.anims[f.mv]) || S.anims[P.name] || S.anims[P.name.replace(/^c/, '')] || (f.st === 'ko' && S.anims.lie) || S.anims.idle;
}
function frameOf(f, A, tick) {
  const n = A.n, M = moveDef(f);
  if (A.ph && M) {
    const cnt = { s: 0, a: 0, r: 0 }, first = {}; A.ph.forEach((p, i) => { if (first[p] == null) first[p] = i; cnt[p]++; });
    let ph, pr;
    if (f.mf < M.s) { ph = 's'; pr = f.mf / M.s; } else if (f.mf < M.s + M.a) { ph = 'a'; pr = (f.mf - M.s) / M.a; } else { ph = 'r'; pr = M.r ? (f.mf - M.s - M.a) / M.r : 0; }
    if (!cnt[ph]) ph = cnt.a ? 'a' : 's';
    return Math.min(n - 1, first[ph] + Math.min(cnt[ph] - 1, Math.floor(pr * cnt[ph])));
  }
  if (A.ph) return Math.min(n - 1, Math.floor(tick / 8) % n);
  if (A.by === 'walk') return ((Math.floor(f.walkT / (A.div || 4)) % n) + n) % n;
  if (A.by === 'vy') return n < 3 ? 0 : f.vy > 1.6 ? 0 : f.vy < -1.6 ? 2 : 1;
  if (A.by === 't') { let k = 0; for (const x of A.t) if (f.t >= x) k++; return Math.min(n - 1, k); }
  const tt = f.st === 'win' ? f.t : tick;
  return Math.floor(tt * (A.fps || 8) / 60) % n;
}
function drawFromSheet(g, f, S, sx, sy, tick, mirrorY) {
  const A = animOf(f, S), i = frameOf(f, A, tick), sc = S.scale || 1;
  const img = S.imgs ? S.imgs[A.row] : S.img;
  g.save(); g.translate(sx, sy); g.scale(f.face * sc, mirrorY ? -sc : sc);
  g.drawImage(img, i * S.fw, S.imgs ? 0 : A.row * S.fh, S.fw, S.fh, -S.ox, -S.oy, S.fw, S.fh);
  g.restore();
}
/* RENDERERS[name](g, f, C, sx, sy, tick, mirrorY)
   'pixel'  - the generated sheets above (default)
   'sprite' - a PNG sheet from C.sprite = { src, fw, fh, ox, oy, scale, anims:{ idle:{row,n,fps}, walk:{row,n,by:'walk',div:3}, lp:{row,n,ph:['s','a','r']}, ... } }
              (falls back to 'pixel' until the image has loaded) */
const RENDERERS = {
  pixel(g, f, C, sx, sy, tick, my) { drawFromSheet(g, f, SHEETS[f.ch], sx, sy, tick, my); },
  sprite(g, f, C, sx, sy, tick, my) {
    const S = C.sprite;
    if (!S || !S.img) { if (S && !S.loading) { S.loading = 1; const im = new Image(); im.onload = () => { S.img = im; }; im.src = S.src; } return RENDERERS.pixel(g, f, C, sx, sy, tick, my); }
    drawFromSheet(g, f, S, sx, sy, tick, my);
  }
};
RENDERERS.shapes = RENDERERS.pixel;
</script>
