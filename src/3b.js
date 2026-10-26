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
     hat:   'snapback' | 'flatbrim' (both worn backwards)   shades (wraparounds on the cap), glasses, piercings, goldTooth, smile
     pack (backpack), boom (carries a boombox), hood (hoodie), inkPrint (ink-print top)
     ink:   tattoo zones { neck, chest, armF, armB, foreF, foreB }
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
      shoe: ['#0a0a0c', '#1c1c20', '#323238', '#4e4e56'], ink: ['#22262e', '#4a505a'], glass: ['#5c6672', '#e4ecf4'],
      metal: ['#7a7a88', '#c0c0d0', '#f4f4fc'], wire: ['#7a3a14', '#c87838', '#f0b070', '#d0d4dc'],
      misc: ['#ffffff', '#8a2a2a', '#f8f4ee', '#4a0e0e'] },
    L: { top: 'tee', heather: 1, lower: 'pants', feet: 'boot', hair: 'long', glasses: 1, smile: 1, bright: 1, rings: 1,
      ink: { foreF: 1 }, win: 'peace', toss: 'wire' }
  },
  /* DIRTY - stylized likeness from Craig's reference (never traced): white flat-brim worn backwards with a red logo,
     green/blue wraparounds on the cap, stubble, blue tee, black backpack, light-blue shorts, dark skate shoes,
     tattoo sleeves on both forearms, a big unbranded black boombox. Lanky: long limbs that stretch on attacks. */
  dirty: {
    D: { thigh: 20, shin: 20, ank: 3, torso: 26, neck: 3.4, ua: 14, fa: 14, shX: 2, hipH: 39, crH: 22, lean0: 0.05, tw: 8, hs: 1,
      st: [10, -9], gF: [10, -4], gB: [7, 0], legW: [6.6, 5.6], armW: [5.2, 4.6], fist: 2.8, walkDiv: 4, stride: 7 },
    M: { skin: ['#6a3a26', '#b4704e', '#e2a07a', '#fcc8a4'], hair: ['#2a1a0e', '#5a3e24', '#7a5a38', '#9a7a50'],
      top: ['#0e2456', '#1e4a9a', '#3a6ac8', '#6a98e8'], pants: ['#2e5a86', '#5a92c4', '#88bce4', '#bcdcf6'],
      shoe: ['#0a0a0e', '#1e1e24', '#34343c', '#50505a'], ink: ['#1a2030', '#33405a'],
      hat: ['#a8aab4', '#dcdee6', '#f4f4f8', '#ffffff'], logo: ['#c01818', '#ff4a3a'], shade: ['#0a2a1a', '#1aa070', '#3ad0e8', '#a8ffe0'],
      boom: ['#050508', '#14141a', '#2a2a34', '#4a4a58'], pack: ['#050508', '#121216', '#24242c'],
      misc: ['#f4f4f8', '#6a1a14', '#f4f0e8', '#3a0a08'], bike: ['#1a1a1e', '#2a2a30', '#9aa2b4', '#c4ccd8'], prt: ['#3a6a8a', '#e05a1a'] },
    L: { top: 'tee', heather: 1, lower: 'shorts', feet: 'sneaker', hair: 'buzz', beard: 'stubble', hat: 'flatbrim', shades: 1, pack: 1, boom: 1,
      ink: { foreF: 1, foreB: 1 }, win: 'bmx', toss: 'boom', stretch: 1 }
  }
};
/* FIVE-FINGER DISCOUNT wardrobe swaps: '<fighter>:<key>' -> overrides on top of ART. Built lazily, only for the pair in a match. */
const STEAL_LOOK = {
  'aj:strip': { M: { top: ['#9a9aa6', '#d8d8e0', '#f0f0f4', '#ffffff'] }, L: { sleevePrint: 0, hemPrint: 0 } },          // plain white undershirt
  'bino:strip': { L: { hat: null, chain: 0 } },                                                                          // bare head
  'sara:strip': { L: { glasses: 0 } },
  'dirty:strip': { L: { hat: null, shades: 0 } },
  'craig:strip': {},                                                                                                     // hoodie was over his shoulders; he's back to normal
  'dirty:hoodie': { M: { top: ['#050508', '#141418', '#26262e', '#3c3c48'] }, L: { hood: 1, inkPrint: 1, heather: 0 } },
  'dirty:tee': { M: { top: ['#050508', '#121218', '#24242e', '#3c3c4a'], print: ['#8a2a08', '#e05a1a', '#ff9a4a'] }, L: { sleevePrint: 1, hemPrint: 1, heather: 0 } },
  'dirty:cap': { M: { hat: ['#5a0606', '#a81812', '#e03a22', '#ff7a5a'], chain: ['#3e4654', '#808ca0', '#c4d0e0', '#f4f8ff'] }, L: { hat: 'snapback', shades: 0, chain: 1 } },
  'dirty:capw': { L: { hat: 'snapback', shades: 1 } },
  'dirty:glasses': { M: { glass: ['#9aa6b4', '#e4ecf4'] }, L: { glasses: 1, shades: 0 } }
};
function artOf(ch, key) {
  const A = ART[ch], o = key && STEAL_LOOK[ch + ':' + key]; if (!o) return A;
  return { D: A.D, M: Object.assign({}, A.M, o.M || {}), L: Object.assign({}, A.L, o.L || {}) };
}
const FXP = ['#000000', '#0a0d14', '#14324a', '#1e6a8a', '#3ad0e8', '#b8f4ff', '#7a3a14', '#c87838', '#f0b070', '#d0d4dc', '#ffffff'];
/* colour mixing for the 16-bit ramps: every material ramp gets in-between tones,
   a deep core shadow and a specular tint, so shading reads as 6-8 tone bands */
const MIXC = new Map();
function mixHex(a, b, t) {
  const k = a + b + t; let r = MIXC.get(k); if (r) return r;
  const A = rgb(a), B = rgb(b), h = (v) => ('0' + Math.round(v).toString(16)).slice(-2);
  r = '#' + h(A[0] + (B[0] - A[0]) * t) + h(A[1] + (B[1] - A[1]) * t) + h(A[2] + (B[2] - A[2]) * t); MIXC.set(k, r); return r;
}
const deepOf = (c) => mixHex(c, '#1a0a2a', 0.42), specOf = (c) => mixHex(c, '#fffaf0', 0.42);
function palOf(ch) {
  const out = [OUT]; const M = (typeof ch === 'string' ? ART[ch] : ch).M;
  for (const k in M) { const m = M[k]; if (!Array.isArray(m)) continue; for (let i = 0; i < m.length; i++) { out.push(m[i], deepOf(m[i]), specOf(m[i])); if (i < m.length - 1) out.push(mixHex(m[i], m[i + 1], 0.5)); } }
  return Array.from(new Set(out)).concat(FXP);
}
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
const QPOSE = (D, o) => Q(D, o);
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
  const sA = q.str ? Math.max(1, Math.hypot(fHt[0] - shF[0], fHt[1] - shF[1]) / (D.ua + D.fa - 0.5)) : 1;   // stretchy arm
  const [fE, fH] = ik(shF, fHt, D.ua * sA, D.fa * sA, 1), [bE, bH] = ik(shB, bHt, D.ua, D.fa, 1);
  const hipF = A2(hip, [1, 0]), hipB = A2(hip, [-1.5, 0]);
  const sL = q.str ? Math.max(1, Math.hypot(fFt[0] - hipF[0], fFt[1] - hipF[1]) / (D.thigh + D.shin - 0.5)) : 1;   // stretchy leg
  const [fK, fA] = ik(hipF, fFt, D.thigh * sL, D.shin * sL, -1), [bK, bA] = ik(hipB, bFt, D.thigh, D.shin, -1);
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
const OLW = 1.25;   // outline width added around shapes (world units): ~0.6 each side = ~2 sprite px at SD 3
function strokeSeg(g, a, b, w, col, off) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0] + off[0], a[1] + off[1]); g.lineTo(b[0] + off[0], b[1] + off[1]); g.stroke(); }
function lightN(p, q) { const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1; let n = [-dy / d, dx / d]; if (n[0] * LV[0] + n[1] * LV[1] < 0) n = [-n[0], -n[1]]; return n; }
function limb(g, pts, ws, C, stripe) {          // pts: [a, j, b]  ws: [w1, w2]  C: [shadow, base, hi]
  g.lineCap = 'round'; g.lineJoin = 'round';
  const segs = [[pts[0], pts[1], ws[0]], [pts[1], pts[2], ws[1]]];
  for (const [p, q, w] of segs) strokeSeg(g, p, q, w + OLW, OUT, [0, 0]);
  for (const [p, q, w] of segs) strokeSeg(g, p, q, w, C[0], [0, 0]);
  for (const [p, q, w] of segs) { if (w < 3.5) continue; const n = lightN(p, q); strokeSeg(g, p, q, Math.max(0.6, w * 0.2), deepOf(C[0]), M2(n, -(w / 2 - w * 0.12))); }   // core shadow on the dark side
  for (const [p, q, w] of segs) { const n = lightN(p, q); if (w < 4) strokeSeg(g, p, q, Math.max(1, w - 2.2), C[1], M2(n, 0.9)); else strokeSeg(g, p, q, w * 0.62, C[1], M2(n, w * 0.17)); }   // 16-bit volume: ~40% of the limb stays in shadow
  for (const [p, q, w] of segs) { if (w < 3.5) continue; const n = lightN(p, q); strokeSeg(g, p, q, Math.max(0.6, w * 0.26), mixHex(C[1], C[2], 0.5), M2(n, w * 0.3)); }   // half-tone band
  for (const [p, q, w] of segs) { if (w < 4) continue; const n = lightN(p, q); strokeSeg(g, p, q, 1, C[2], M2(n, w / 2 - 1.3)); }
  for (const [p, q, w] of segs) { if (w < 5) continue; const n = lightN(p, q); strokeSeg(g, p, q, 0.5, specOf(C[2]), M2(n, w / 2 - 1.15)); }   // specular glint
  if (stripe) for (const [p, q, w] of segs) { const n = lightN(p, q); g.lineCap = 'butt'; strokeSeg(g, p, q, 1, stripe, M2(n, -w / 2 + 1.6)); g.lineCap = 'round'; }
}
function shadeShape(g, path, C, sh, hi) {
  sh = sh == null ? 2.2 : sh; hi = hi == null ? 1.3 : hi;
  g.save(); g.lineJoin = 'round'; g.lineWidth = OLW; g.strokeStyle = OUT; g.beginPath(); path(g, 0, 0); g.stroke();
  g.beginPath(); path(g, 0, 0); g.clip();
  g.fillStyle = sh >= 1.5 ? deepOf(C[0]) : C[0]; g.fillRect(-999, -999, 1999, 1999);   // deep core shadow on the far edge
  if (sh >= 1.5) { g.fillStyle = C[0]; g.beginPath(); path(g, LV[0] * 0.7, LV[1] * 0.7); g.fill(); }
  g.beginPath(); path(g, LV[0] * sh, LV[1] * sh); g.clip();
  g.fillStyle = C[2]; g.fillRect(-999, -999, 1999, 1999);
  if (hi >= 1) { g.fillStyle = mixHex(C[1], C[2], 0.5); g.beginPath(); path(g, -LV[0] * hi * 0.55, -LV[1] * hi * 0.55); g.fill(); }   // half-tone band
  g.fillStyle = C[1]; g.beginPath(); path(g, -LV[0] * hi, -LV[1] * hi); g.fill();
  g.restore();
}
const polyP = (pts) => { let ar = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; ar += a[0] * b[1] - b[0] * a[1]; } if (ar < 0) pts = pts.slice().reverse(); return polyP0(pts); };
const polyP0 = (pts) => (g, dx, dy) => { g.moveTo(pts[0][0] + dx, pts[0][1] + dy); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] + dx, pts[i][1] + dy); g.closePath(); };
const ellP = (c, rx, ry, a) => (g, dx, dy) => { a = a || 0; g.moveTo(c[0] + dx + rx * Math.cos(a), c[1] + dy + rx * Math.sin(a)); g.ellipse(c[0] + dx, c[1] + dy, rx, ry, a, 0, Math.PI * 2); };
const uni = (...ps) => (g, dx, dy) => { for (const p of ps) p(g, dx, dy); };
function line(g, a, b, w, col, out) { g.lineCap = 'round'; if (out) strokeSeg(g, a, b, w + OLW, OUT, [0, 0]); strokeSeg(g, a, b, w, col, [0, 0]); }
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
function boomProp(g, c, s, M, a) {   // big unbranded black boombox speaker: barrel body, round woofer ends, carry handle
  s = s || 1; const C = M.boom || ['#050508', '#14141a', '#2a2a34', '#4a4a58'];
  g.save(); g.translate(c[0], c[1]); g.rotate(a || 0); g.scale(s, s);
  shadeShape(g, polyP([[-11, -4.6], [11, -4.6], [12.4, -2], [12.4, 3], [11, 5], [-11, 5], [-12.4, 3], [-12.4, -2]]), [C[0], C[1], C[2]], 1.2, 0.8);
  for (const x of [-11.6, 11.6]) { g.lineWidth = 2; g.strokeStyle = OUT; g.beginPath(); g.ellipse(x, 0.2, 2.2, 4.4, 0, 0, 6.3); g.stroke(); g.lineWidth = 1; g.strokeStyle = C[3]; g.beginPath(); g.ellipse(x, 0.2, 1.4, 3.4, 0, 0, 6.3); g.stroke(); }
  line(g, [-7, -4.6], [-6, -8], 1.4, OUT); line(g, [7, -4.6], [6, -8], 1.4, OUT); line(g, [-6, -8], [6, -8], 1.6, C[2], true);
  line(g, [-9, -2.6], [9, -2.6], 1, C[3]); px(g, [0, 1.4], '#c01818', 3, 1);
  g.restore();
}
function waveRings(g, c, s, k) {   // NICE NICE NICE: a slow blast of sound rings
  for (let r = 0; r < 4; r++) {
    const rr = (3 + r * 3.6 + k * 3.6) * s; if (rr > 15.5) continue;
    g.lineWidth = 3; g.strokeStyle = OUT; g.beginPath(); g.arc(c[0] - 7, c[1], rr, -0.95, 0.95); g.stroke();
    g.lineWidth = 1.4; g.strokeStyle = r % 2 ? FXP[4] : '#ff6ad8'; g.beginPath(); g.arc(c[0] - 7, c[1], rr, -0.95, 0.95); g.stroke();
  }
  px(g, [c[0] - 6, c[1]], FXP[10], 3, 3); px(g, [c[0] + 4, c[1] - 9], FXP[5]); px(g, [c[0] + 6, c[1] + 8], '#ff6ad8');
}
function bikeProp(g, J, M, fi) {   // BMX for the win pose: wheels, frame, bars
  const w1 = [-21, -9], w2 = [22, -9], bb = [1, -12], bar = [17, -38], seat = [-8, -24];
  for (const w of [w1, w2]) {
    g.lineWidth = 4; g.strokeStyle = OUT; g.beginPath(); g.arc(w[0], w[1], 9, 0, 6.3); g.stroke();
    g.lineWidth = 2; g.strokeStyle = '#2a2a30'; g.beginPath(); g.arc(w[0], w[1], 9, 0, 6.3); g.stroke();
    g.strokeStyle = '#9aa2b4'; g.lineWidth = 0.7; for (let k = 0; k < 4; k++) { const a = fi * 0.4 + k * 0.785; g.beginPath(); g.moveTo(w[0] - Math.cos(a) * 7.6, w[1] - Math.sin(a) * 7.6); g.lineTo(w[0] + Math.cos(a) * 7.6, w[1] + Math.sin(a) * 7.6); g.stroke(); }
    px(g, w, '#c4ccd8', 2, 2);
  }
  for (const [a, b] of [[w1, bb], [bb, seat], [seat, w1], [bb, [15, -30]], [seat, [15, -30]], [[15, -30], w2], [[15, -30], bar]]) line(g, a, b, 2, '#1a1a1e', true);
  line(g, [12, -40], [22, -37], 1.6, '#c4ccd8', true); line(g, A2(seat, [-4, -1]), A2(seat, [3, -1]), 2.2, OUT);
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
    if (back && ink.foreB) { inkLimb(g, LERP(E, Hd, 0.05), LERP(E, Hd, 0.8), D.armW[1], M.ink, 5); inkLimb(g, LERP(E, Hd, 0.2), LERP(E, Hd, 0.7), D.armW[1], M.ink, 2); }
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
    if (L.boom && back && !q.hold && !q.bike) boomProp(g, A2(Hd, [0, 5.5]), 0.8, M, 0);
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
  if (L.hood) shadeShape(g, uni(ellP(HT([-3.5, -4]), 6.4, 5.2, J.hang)), F3(M.top), 1.2, 0.8);   // hood bunched behind the neck
  if (L.pack) shadeShape(g, polyP([[-13.4, -23], [-6, -24.5], [-5.6, -3], [-12.4, -2.4], [-14.2, -10]].map(TS)), F3(M.pack), 1.2, 0.8);   // backpack
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
    { const fl = Math.sin(fi * 0.9) * 0.6 - (q.hairK || 0) * 0.3; line(g, TS([-7.4, 2.2]), TS([-8.6 + fl, 3.4]), 1.4, M.top[2]); px(g, TS([-8.8 + fl, 3]), M.top[1], 2, 1); }
    line(g, TS([0, -23.8]), TS([4.6, -23.2]), 1, M.top[0]);
    if (L.heather) for (const p of [[2, -18], [5, -14], [0, -10], [6, -6], [-3, -14], [3, -3], [-5, -7]]) px(g, TS(p), M.top[3]);
    if (L.hemPrint) { px(g, TS([5, -2.4]), M.print[1], 2, 2); px(g, TS([6.5, -3]), M.print[2]); }
    if (L.inkPrint) { for (const p of [[2, -16], [4, -13], [6, -16], [3, -9], [5.5, -8]]) px(g, TS(p), '#3a6a8a', 2, 1); line(g, TS([1, -18]), TS([7, -18.6]), 1, '#3a6a8a'); }
    if (L.pack) { line(g, TS([1.4, -23.6]), TS([0.4, -7]), 1.4, M.pack[1]); px(g, TS([0.8, -12]), M.pack[2], 2, 1); }   // backpack strap
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
    const sw = Math.sin(fi * 0.8) * 0.9 + (q.hairK || 0) * 0.25;
    const cp = [[-4.6, -23.4], [-1.4 + sw * 0.5, -19.8], [2.4 + sw, -17.2], [6.4 + sw, -17.8], [9 + sw * 0.4, -21.4], [9.4, -24.4]].map(TS);
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
  if (L.hat === 'flatbrim') {   // white flat-brim, worn backwards (flat bill out the back), red logo up front
    shadeShape(g, uni(ellP(HT([0.4, -11.2]), 6.6, 4.2, J.hang), polyP([[-6.4, -11], [7, -11.4], [7.2, -9.2], [-6.6, -9]].map(HT))), F3(M.hat), 1.6, 1);
    shadeShape(g, polyP([[-5.6, -10.6], [-13.4, -10.4], [-13.4, -9], [-5.8, -8.8]].map(HT)), B3(M.hat), 0.6, 0.4);
    line(g, HT([3, -13.2]), HT([5.6, -13]), 1.2, M.logo[0]); px(g, HT([4.2, -13.6]), M.logo[1]);
    for (const p of [[6.4, -8.4], [5.2, -8.6], [-5.8, -8.2]]) px(g, HT(p), M.hair[1]);
  }
  if (L.shades && L.hat) {   // wraparound sport shades sitting up on the cap
    line(g, HT([-1, -10.8]), HT([7.4, -10.4]), 2.4, OUT); line(g, HT([1.4, -10.9]), HT([4, -10.8]), 1.4, M.shade[1]); line(g, HT([4.6, -10.7]), HT([7, -10.4]), 1.4, M.shade[2]);
    px(g, HT([2.4, -11.4]), M.shade[3]); px(g, HT([5.6, -11.2]), M.shade[3]);
  }
  if (L.glasses && L.bright) {   // thin clear frames sitting around (never over) the open eye
    const e = HT([4.5, -6.3]), r = 2.3 * hs;
    g.lineWidth = 0.6; g.strokeStyle = M.glass[0]; g.beginPath(); g.arc(e[0], e[1], r, 0, 6.3); g.stroke();
    line(g, HT([2.2, -6.7]), HT([-1, -6.2]), 0.6, M.glass[0]); px(g, HT([5.9, -8]), M.glass[1]);
  } else if (L.glasses) {
    const e = HT([4.6, -6.2]);
    g.lineWidth = 2; g.strokeStyle = OUT; g.beginPath(); g.arc(e[0], e[1], 1.7 * hs, 0, 6.3); g.stroke();
    g.lineWidth = 0.8; g.strokeStyle = M.glass[1]; g.beginPath(); g.arc(e[0], e[1], 1.7 * hs, 0, 6.3); g.stroke();
    line(g, HT([2.9, -6.5]), HT([-1, -6]), 0.8, M.glass[0]); px(g, HT([5.3, -7.1]), '#ffffff');
  }
  if (BROW) { line(g, HT(BROW[0][0]), HT(BROW[0][1]), 1.1, BROW[1]); BROW = null; }   // brows last: over fringe + frame
  if (!bust) arm(J.shF, J.fE, J.fH, false);
}
let PAINT_BUST = false, BROW = null;   // true while painting select / HUD / VS portraits
function faceEyes(g, HT, ex, e, M, L) {
  const eye = HT(e), white = M.misc[2], dark = OUT;
  if (L.bright && ex !== 'x' && ex !== 'h' && ex !== 'k') {   // big, open, alert eyes: clear white, dark pupil, catch-light, no lids
    px(g, HT([e[0] + 0.2, e[1]]), white, 3, 2);
    if (PAINT_BUST) { px(g, HT([e[0] + 0.7, e[1] + 0.1]), dark, 2, 2); px(g, HT([e[0] + 1.2, e[1] - 0.3]), '#ffffff', 1, 1); }
    else px(g, HT([e[0] + 0.9, e[1] + 0.1]), dark, 1, 2);
    const hap = PAINT_BUST || ex === 'l';
    const bl = hap ? [[e[0] - 1.1, e[1] - 2.0], [e[0] + 2.2, e[1] - 1.7]] : [[e[0] - 1.1, e[1] - 2.1], [e[0] + 2.3, e[1] - 1.1]];   // determined, sloping toward the nose
    BROW = [bl, M.hair[0]];   // drawn after the hair so the fringe never hides it
    return;
  }
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
  if (L.bright && ex !== 'h' && ex !== 'x' && ex !== 'k') {
    if (PAINT_BUST || ex === 'l' || ex === 'w') {   // wide happy toothy smile
      g.fillStyle = OUT; g.beginPath(); polyP([[2.6, -3.7], [7.1, -4.1], [6.8, -1.3], [5.4, -0.6], [3.8, -1.2]].map(HT))(g, 0, 0); g.fill();
      g.fillStyle = white; g.beginPath(); polyP([[3.1, -3.5], [6.8, -3.8], [6.6, -2.4], [3.6, -2.3]].map(HT))(g, 0, 0); g.fill();
      g.fillStyle = mouthC; g.beginPath(); polyP([[3.8, -2.1], [6.5, -2.2], [5.4, -1], [4.2, -1.4]].map(HT))(g, 0, 0); g.fill();
      px(g, HT([2.2, -4.1]), M.skin[1]);
    } else if (ex === 's') {   // focused, teeth set
      g.fillStyle = OUT; g.beginPath(); polyP([[4, -3.2], [6.8, -3.5], [6.6, -1.8], [4.3, -1.7]].map(HT))(g, 0, 0); g.fill();
      g.fillStyle = white; g.fillRect(...HT([4.5, -3]), 2, 1);
    } else { line(g, HT([4.3, -2.4]), HT([6.4, -2.6]), 1, mouthC); px(g, HT([4, -2.9]), mouthC); }   // focused: firm line, a hint of a smirk
    return;
  }
  if (ex === 'h') open();
  else if (ex === 's' || ex === 'l' || (ex === 'n' && L.smile)) grin();
  else if (ex === 'g') px(g, HT([5.4, -2]), white, 2, 1);
  else if (ex === 'k' || ex === 'x') line(g, HT([4.6, -1.8]), HT([6.2, -2.2]), 1, mouthC);
  else line(g, HT([4.6, -2]), HT([6.2, -2.4]), 1, mouthC);
}

/* ---------- animation sets ---------- */
/* in-between poses: lerp two key poses (raw fields when they line up, else via solved hand/foot positions) */
function tweenQ(D, a, b, t) {
  const near = t < 0.5 ? a : b, o = Object.assign({}, near), L = (x, y) => x + (y - x) * t, LA = (x, y) => [L(x[0], y[0]), L(x[1], y[1])];
  const same = (k) => (a[k] == null) === (b[k] == null);
  if (same('fHa') && same('bHa') && same('fFw') && same('bFw') && (a.flip || 0) === (b.flip || 0)) {
    for (const k of ['hip', 'fF', 'bF', 'fH', 'bH', 'fHa', 'bHa', 'fFw', 'bFw']) if (a[k] && b[k]) o[k] = LA(a[k], b[k]);
    for (const k of ['lean', 'rot', 'hairK']) if (a[k] != null || b[k] != null) o[k] = L(a[k] || 0, b[k] || 0);
    if (a.tilt != null || b.tilt != null) o.tilt = L(a.tilt != null ? a.tilt : -a.lean * 0.7, b.tilt != null ? b.tilt : -b.lean * 0.7);
    if (a.reach && b.reach) o.reachMax = L(a.reachMax, b.reachMax); else if (a.reach || b.reach) { const Ja = solve(D, a), Jb = solve(D, b); o.reach = null; o.hip = LA(Ja.hip, Jb.hip); if (a.reach === 'fH' || b.reach === 'fH') o.fHa = LA(Ja.fH, Jb.fH); else { o.fF = LA(Ja.fA, Jb.fA); } }
    return o;
  }
  if ((a.rot || 0) || (b.rot || 0) || (a.flip || 0) !== (b.flip || 0)) return Object.assign({}, near);
  const Ja = solve(D, a), Jb = solve(D, b);
  return Object.assign(o, { hip: LA(Ja.hip, Jb.hip), lean: L(a.lean, b.lean), tilt: L(a.tilt != null ? a.tilt : -a.lean * 0.7, b.tilt != null ? b.tilt : -b.lean * 0.7), fHa: LA(Ja.fH, Jb.fH), bHa: LA(Ja.bH, Jb.bH), fF: LA(Ja.fA, Jb.fA), bF: LA(Ja.bA, Jb.bA), fFw: null, bFw: null, reach: null, hairK: L(a.hairK || 0, b.hairK || 0) });
}
function animsFor(ch, A) {
  A = A || ART[ch]; const D = A.D, LK = A.L, MV = CHARS[ch].moves, L = [], big = D.tw >= 11;
  const add = (name, meta, frames) => L.push({ name, meta, frames });
  const T = (k, dx) => { const b = MV[k].box; return [b[0] + b[2] - 4 + (dx || 0), -(b[1] + b[3] / 2)]; };
  const hy = -D.hipH, ln = D.lean0, ank = -D.ank;
  const Q = LK.stretch ? (D2, o) => QPOSE(D2, Object.assign({ str: 1 }, o)) : QPOSE;   // stretchy limbs reach their hitboxes
  add('idle', { fps: big ? 8 : 10 }, [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i / 8 * Math.PI * 2, b = (1 - Math.cos(a)) * (big ? 0.9 : 0.75), b2 = (1 - Math.cos(a - 0.7)) * 0.8; return Q(D, { hip: [0, hy + b], lean: ln + Math.sin(a) * 0.012, fH: [D.gF[0], D.gF[1] + b2 * 0.7], bH: [D.gB[0] - 0.3, D.gB[1] + b2], fi: i, hairK: Math.sin(a - 1) * 0.8 }); }));
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
  add('hit', { by: 't', t: [3, 9] }, [Q(D, { lean: -0.38, tilt: -0.45, hip: [-4, hy + 2], fH: [-4, 11], bH: [-9, 8], expr: 'h', hairK: 4 }), Q(D, { lean: -0.26, tilt: -0.25, hip: [-3, hy + 1], fH: [-1, 9], bH: [-6, 7], expr: 'h', hairK: 2 }), Q(D, { lean: -0.1, tilt: -0.06, hip: [-1, hy], fH: [4, 6], bH: [1, 5], expr: 'h', hairK: 1, fi: 3 })]);
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
    W({ lean: -0.04, fH: [5, -19], bH: [-2, 9], expr: 'l', peace: 1, fi: 0 }), W({ hip: [0, hy - 1], lean: -0.06, fH: [6, -20], bH: [-2, 9], expr: 'l', peace: 1, fi: 1, hairK: 1 }),
    W({ lean: -0.04, tilt: 0.2, fH: [5, -19], bH: [-2, 9], expr: 'l', peace: 1, fi: 2 }), W({ hip: [0, hy - 1], lean: -0.06, fH: [6, -20], bH: [-2, 9], expr: 'l', peace: 1, fi: 3, hairK: -1 })]);
  if (LK.win === 'bmx') add('win', { fps: 5 }, [   // up on the BMX: cocky point, then a thumbs-up
    W({ bike: 1, hip: [-3, -34], lean: 0.18, fF: [1, -14], bF: [3, -12], bHa: [17, -39], fHa: [24, -58], point: 1, expr: 's', fi: 0 }),
    W({ bike: 1, hip: [-3, -35], lean: 0.16, fF: [1, -14], bF: [3, -12], bHa: [17, -39], fHa: [25, -59], point: 1, expr: 'l', fi: 1 }),
    W({ bike: 1, hip: [-3, -35], lean: 0.1, fF: [1, -14], bF: [3, -12], bHa: [17, -39], fHa: [14, -66], thumb: 1, expr: 's', fi: 2 }),
    W({ bike: 1, hip: [-3, -34], lean: 0.12, fF: [1, -14], bF: [3, -12], bHa: [17, -39], fHa: [14, -67], thumb: 1, expr: 'l', fi: 3 })]);
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
  add('clp', { ph: ['s', 'a', 'r'] }, [crouchQ(D, { fH: [3, 3] }), crouchQ(D, { str: LK.stretch, fHa: T('clp'), reach: 'fH', reachMax: 5, lean: ln + 0.5, expr: 's' }), crouchQ(D, { fH: [12, 0] })]);
  const cb = MV.chp.box;
  add('chp', { ph: ['s', 's', 'a', 'r', 'r'] }, [
    crouchQ(D, { fH: [0, 9], lean: ln + 0.55, hip: [-1, -D.crH + 1] }), crouchQ(D, { fH: [5, 4], lean: ln + 0.4 }),
    Q(D, { hip: [2, -D.crH - 9], lean: ln - 0.06, fF: [D.st[0] + 3, ank], bF: [D.st[1] - 3, ank], fHa: [cb[0] + cb[2] * 0.55, -(cb[1] + cb[3] - 3)], bH: [4, 8], expr: 's' }),
    Q(D, { hip: [1, -D.crH - 5], lean: ln + 0.1, fF: [D.st[0] + 3, ank], bF: [D.st[1] - 3, ank], fH: [8, -12] }), crouchQ(D, { fH: [9, 0] })]);
  add('clk', { ph: ['s', 'a', 'r'] }, [crouchQ(D, { fF: [D.st[0] + 6, ank - 2] }), crouchQ(D, { str: LK.stretch, fF: [T('clk')[0] - 3, ank], reach: 'fF', reachMax: 4, kick: 'flat', lean: ln + 0.3, expr: 's' }), crouchQ(D, { fF: [D.st[0] + 10, ank - 1] })]);
  add('chk', { ph: ['s', 's', 'a', 'r', 'r'] }, [
    crouchQ(D, { hip: [-2, -D.crH + 2], fF: [D.st[0] + 4, ank - 2], bHa: [-2, -4] }),
    crouchQ(D, { hip: [-3, -D.crH + 3], lean: ln + 0.55, fF: [D.st[0] + 12, ank], bHa: [-4, -3] }),
    crouchQ(D, { str: LK.stretch, hip: [-3, -D.crH + 4], lean: ln + 0.6, fF: [T('chk')[0] - 3, ank], reach: 'fF', reachMax: 6, kick: 'flat', bF: [D.st[1] - 4, ank], bHa: [-6, -3], fH: [6, 6], expr: 's' }),
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
    Q(D, { fHa: [P.x + 4, -P.y - 2], reach: 'fH', reachMax: 7, lean: ln + 0.32, fF: [D.st[0] + 5, ank], bH: [-4, 6], expr: 's', hairK: 3, hold: hold === 'boom' ? 'boom' : undefined, str: 0 }),
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
  if (MV.sp2 && MV.sp2.warp) add('sp2', { ph: ['s', 's', 'a', 'r'] }, [   // VANISHING TRICK: spin down, gone, pop back up
    crouchQ(D, { hip: [-1, -D.crH - 3], lean: ln + 0.4, fH: [-2, -14], bH: [-6, -16], expr: 's' }),
    Q(D, { hip: [0, hy + 2], lean: -0.1, fHa: [6, -98], bHa: [-4, -96], expr: 'l', speedV: 1 }),
    Q(D, { hip: [0, hy + 1], lean: -0.05, fHa: [8, -96], bHa: [-2, -94], expr: 'l', speedV: 2 }),
    crouchQ(D, { hip: [0, -D.crH - 4], fH: [9, -2], thumb: 1, expr: 's' })]);
  if (MV.sp3 && MV.sp3.steal) add('sp3', { ph: ['s', 'a', 'r', 'r', 'r'] }, [   // FIVE-FINGER DISCOUNT: snatch, then admire the loot
    Q(D, { hip: [3, hy + 2], lean: ln + 0.3, fF: [D.st[0] + 5, ank], fHa: [30, -62], bH: [-4, 6], expr: 's' }),
    Q(D, { hip: [4, hy + 2], lean: ln + 0.34, fF: [D.st[0] + 6, ank], fHa: [33, -64], bH: [-4, 6], expr: 'l' }),
    Q(D, { hip: [0, hy], lean: -0.1, fHa: [14, -80], bH: [-3, 8], expr: 'l', thumb: 1 }),
    Q(D, { hip: [0, hy - 1], lean: -0.12, fHa: [15, -82], bH: [-3, 8], expr: 's', thumb: 1 }),
    Q(D, { hip: [0, hy], lean: ln, fH: [10, -6], expr: 's' })]);
  if (MV.tnt && MV.tnt.kiss) add('tnt', { ph: ['s', 's', 'a', 'r', 'r', 'r'] }, [   // KISS MY BUTT!: grabs, turns his back (trousers stay on), slaps his own seat, grins back
    Q(D, { hip: [0, hy], lean: ln + 0.1, fHa: [24, -56], bHa: [20, -50], expr: 's' }),
    Q(D, { hip: [2, hy + 1], lean: ln + 0.2, fHa: [28, -58], bHa: [24, -52], expr: 'l' }),
    Q(D, { flip: 1, hip: [0, hy + 3], lean: 0.42, fH: [4, 8], bHa: [-8, -50], expr: 'l', hairK: 2 }),
    Q(D, { flip: 1, hip: [0, hy + 3], lean: 0.42, fH: [4, 8], bHa: [-11, -37], expr: 's', speed: 1, hairK: 3 }),
    Q(D, { flip: 1, hip: [0, hy + 2], lean: 0.36, tilt: -0.6, fH: [4, 8], bHa: [-12, -38], expr: 's', hairK: 1 }),
    Q(D, { hip: [0, hy], lean: ln, expr: 's' })]);
  if (MV.dsh) add('dsh', { ph: ['s', 'a', 'r'] }, [
    Q(D, { hip: [0, hy + 2], lean: ln + 0.3, fF: [12, ank - 2], bF: [-8, ank], fH: [-4, 4], bH: [-8, 3], hairK: 3 }),
    Q(D, { hip: [1, hy + 3], lean: ln + 0.42, fF: [15, ank - 4], bF: [-15, ank - 7], fH: [-8, 5], bH: [-11, 3], hairK: 5, speed: 1 }),
    Q(D, { hip: [0, hy + 2], lean: ln + 0.2, fF: [10, ank], bF: [-6, ank], hairK: 2 })]);
  /* batch 2: more in-betweens. Normals get a wind-up tween + a settle tween (lights 3->5, heavies 5->7),
     specials gain a tween into and out of the active frames, plus new reaction / knockdown / lose rows. */
  const idleQ = Q(D, {}), crQ = crouchQ(D, {});
  const ins = (an, i, q, ph) => { an.frames.splice(i, 0, q); an.meta.ph.splice(i, 0, ph); };
  for (const an of L) {
    const ph = an.meta.ph; if (!ph) continue;
    const fs = an.frames, lastS = ph.lastIndexOf('s'), firstA = ph.indexOf('a'), lastA = ph.lastIndexOf('a');
    const normal = /^(c?[lh][pk]|j[pk])$/.test(an.name), heavy = /^c?h[pk]$/.test(an.name);
    if (lastS < 0 || firstA < 0) continue;
    const s0 = fs[lastS], a0 = fs[firstA], aL = fs[lastA], rL = fs[fs.length - 1];
    if (normal) {
      const rest = an.name[0] === 'c' ? crQ : an.name[0] === 'j' ? rL : idleQ;
      ins(an, ph.length, tweenQ(D, rL, rest, 0.5), 'r');                           // settle back to guard
      if (heavy) ins(an, lastA + 1, tweenQ(D, aL, fs[lastA + 1], 0.3), 'a');         // follow-through holds the hit
      ins(an, lastS + 1, tweenQ(D, s0, a0, 0.55), 's');                              // the snap between wind-up and contact
    } else if (/^(sp|sp2|sp3|dsh|tnt)$/.test(an.name)) {
      if (lastA + 1 < fs.length) ins(an, lastA + 1, tweenQ(D, aL, fs[lastA + 1], 0.45), 'r');
      ins(an, lastS + 1, tweenQ(D, s0, a0, 0.5), 's');
    }
  }
  const row = (n) => L.find(a => a.name === n);
  // gut hit (mid / low): doubled over, hands to the belly
  add('hitlo', { by: 't', t: [2, 6, 10] }, [
    Q(D, { lean: ln + 0.42, tilt: 0.35, hip: [-3, hy + 4], fH: [5, 9], bH: [3, 10], fF: [D.st[0] + 2, ank], expr: 'h', hairK: -2 }),
    Q(D, { lean: ln + 0.5, tilt: 0.45, hip: [-4, hy + 5], fH: [6, 8], bH: [4, 9], fF: [D.st[0] + 2, ank], expr: 'h', hairK: -3, fi: 2 }),
    Q(D, { lean: ln + 0.3, tilt: 0.25, hip: [-3, hy + 3], fH: [6, 6], bH: [3, 7], expr: 'h', hairK: -1, fi: 3 }),
    Q(D, { lean: ln + 0.1, tilt: 0.05, hip: [-1, hy + 1], fH: [5, 4], bH: [2, 5], expr: 'h', fi: 4 })]);
  // heavy stagger: knocked back off balance, arms flung out, stumbling feet
  add('stagger', { by: 't', t: [3, 7, 12, 17] }, [
    Q(D, { lean: -0.5, tilt: -0.55, hip: [-5, hy + 1], fH: [-8, -10], bH: [-13, -6], fF: [D.st[0] + 4, ank - 3], bF: [D.st[1] - 2, ank], expr: 'h', hairK: 5 }),
    Q(D, { lean: -0.42, tilt: -0.45, hip: [-6, hy + 2], fH: [-10, -4], bH: [-14, 0], fF: [D.st[0] + 2, ank], bF: [D.st[1] - 6, ank - 2], expr: 'h', hairK: 4, fi: 2 }),
    Q(D, { lean: -0.2, tilt: -0.2, hip: [-4, hy + 3], fH: [-4, 4], bH: [-9, 6], fF: [D.st[0] + 1, ank], bF: [D.st[1] - 4, ank], expr: 'h', hairK: 2, fi: 3 }),
    Q(D, { lean: ln + 0.12, tilt: 0.1, hip: [-2, hy + 3], fH: [3, 6], bH: [-2, 7], expr: 'h', hairK: 1, fi: 4 }),
    Q(D, { lean: ln + 0.04, hip: [-1, hy + 1], fH: [5, 3], bH: [2, 4], expr: 'h', fi: 5 })]);
  { const k = row('hit'); k.meta.t = [2, 5, 9]; k.frames.splice(1, 0, tweenQ(D, k.frames[0], k.frames[1], 0.5)); }   // head snap: 4 frames
  { const k = row('chit'); k.meta.t = [3, 6]; k.frames.splice(1, 0, tweenQ(D, k.frames[0], k.frames[1], 0.5)); }
  { const k = row('kd'); k.meta.t = [2, 4, 7, 10]; const f = k.frames; k.frames = [f[0], tweenQ(D, f[0], f[1], 0.5), f[1], tweenQ(D, f[1], f[2], 0.5), f[2]]; }
  { const k = row('rise'); k.meta.t = [3, 5, 8, 11]; const f = k.frames;
    k.frames = [Q(D, { hip: [-3, -9], rot: -1.3, lean: 0, fFw: [14, ank], bFw: [8, ank - 3], fH: [-6, 10], bH: [-9, 10], expr: 'g' }), f[0],
      Q(D, { hip: [-3, -D.crH - 1], rot: -0.4, lean: ln + 0.3, fFw: [D.st[0] + 6, ank], bFw: [D.st[1] - 2, ank], fH: [-2, 10], bH: [-5, 9], expr: 'g' }), f[1], f[2]]; }
  { const k = row('block'), f = k.frames[0]; k.meta.by = 't'; k.meta.t = [4]; k.frames = [Q(D, { fH: [6, -11], bH: [9, -7], lean: ln - 0.2, tilt: -0.25, hip: [-3, hy + 1], expr: 'g', hairK: 2 }), f]; }
  { const k = row('cblock'), f = k.frames[0]; k.meta.by = 't'; k.meta.t = [4]; k.frames = [crouchQ(D, { fH: [7, -9], bH: [9, -5], lean: ln + 0.28, hip: [-3, -D.crH + 1], expr: 'g' }), f]; }
  // lose pose (round / match lost on their feet): hands on knees, head down, heavy breathing
  add('lose', { fps: 4 }, [0, 1, 2, 3].map(i => { const b = [0, 1, 2, 1][i]; return Q(D, { hip: [-1, hy + 5 + b * 0.6], lean: ln + 0.5 - b * 0.03, tilt: 0.45, fH: [7, 15 - b * 0.5], bH: [3, 15 - b * 0.5], fF: [D.st[0] + 2, ank], bF: [D.st[1] - 2, ank], expr: 'h', hairK: -2 + b, fi: i }); }));
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
function paintFrame(g, ch, q, A) {
  A = A || ART[ch]; const D = A.D, M = A.M, L = A.L, J = solve(D, q);
  if (q.bike) bikeProp(g, J, M, q.fi || 0);
  if (q.speed) { const c = q.speed === 1 ? '#d0d4dc' : '#ffffff'; for (let k = 0; k < 5; k++) { const y = J.hip[1] - 30 + k * 7 + (q.speed === 2 ? 3 : 0), x0 = J.hip[0] - 12 - (k % 2) * 6; line(g, [x0 - 18 - k * 3, y], [x0, y], 1.2, c, true); } }
  if (q.speedV) for (let k = 0; k < 4; k++) { const x = J.hip[0] - 10 + k * 7, y0 = J.neckTop[1] - 6 - (k % 2) * 6 - (q.speedV === 2 ? 3 : 0); line(g, [x, y0 - 16 - k * 2], [x, y0], 1.2, '#d0d4dc', true); }
  if (q.chain && M.chain) chainLinks(g, chainPts(q, J), M.chain, 1.8);
  paintFighter(g, J, q, D, M, L, false);
  if (q.hold === 'ink') inkBlob(g, A2(J.fH, [0, -3.5]), 0.85);
  if (q.hold === 'wire') wireCoil(g, A2(J.fH, [0, -3.5]), 0.75, 0);
  if (q.hold === 'chain') chainSpark(g, A2(J.fH, [0, -3.5]), 0.7, 0.6);
  if (q.hold === 'boom') boomProp(g, A2(J.fH, [2, -2]), 1, M, -0.15);
  if (q.thumb) { line(g, A2(J.fH, [-0.4, -2]), A2(J.fH, [-0.6, -6.4]), 1.6, M.skin[2], true); }
  if (q.point) { line(g, A2(J.fH, [1.6, -0.6]), A2(J.fH, [6, -1.6]), 1.4, M.skin[2], true); }
  if (q.peace) { line(g, A2(J.fH, [-0.6, -2]), A2(J.fH, [-1.6, -6]), 1, M.skin[2], true); line(g, A2(J.fH, [0.8, -2]), A2(J.fH, [1.8, -6]), 1, M.skin[2], true); }
}
/* rim light: a 1px neon edge on the back (magenta sign glow) and top (cold sky) of every frame,
   built once from the silhouette and blended on at draw time */
function rimOf(c, fw) {
  const w = c.width, h = c.height, src = c.g.getImageData(0, 0, w, h).data, r = mk(w, h), im = r.g.createImageData(w, h), d = im.data;
  const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!op(x, y)) continue;
    const fx = x % fw, o = (y * w + x) * 4;
    const back = fx > 0 && !op(x - 1, y) && op(x + 1, y) && op(x + 2, y), top = !op(x, y - 1) && op(x, y + 1) && op(x, y + 2);
    const back2 = !back && fx > 1 && !op(x - 2, y) && op(x - 1, y) && !op(x - 1, y - 1) && op(x + 1, y);   // 2nd, softer rim pixel at 2x density
    if (back) { d[o] = 255; d[o + 1] = 92; d[o + 2] = 214; d[o + 3] = 255; }
    else if (top) { d[o] = 150; d[o + 1] = 236; d[o + 2] = 255; d[o + 3] = 200; }
    else if (back2) { d[o] = 255; d[o + 1] = 120; d[o + 2] = 220; d[o + 3] = 110; }
  }
  r.g.putImageData(im, 0, 0); return r;
}
/* squash & stretch keyed off the fighter's state: [sx, sy] around the feet */
function squashOf(f) {
  if (!f || !f.st) return null;
  if (f.st === 'land') return [1.12 - f.t * 0.025, 0.88 + f.t * 0.025];
  if (f.st === 'hit' && f.t < 4) return [0.92, 1.05];
  if (f.st === 'lie' && f.t < 5) return [1.14 - f.t * 0.028, 0.86 + f.t * 0.028];
  if (f.st === 'jump' && f.vy > 3) return [0.93, 1.07];
  if (f.st === 'atk' && f.mv) { const M = CHARS[f.ch].moves[f.mv]; if (M && M.heavy && f.mf >= M.s && f.mf < M.s + 3) return [1.06, 0.96]; }
  return null;
}
function itemIcon(g, c, item, s) {   // stolen gear, drawn on its own (flying back to its owner)
  s = s || 1; const T = (x, y) => [c[0] + x * s, c[1] + y * s];
  if (item === 'cap') { shadeShape(g, uni(ellP(T(0, 0), 5 * s, 3.4 * s), polyP([T(-1, 0), T(8, 0.6), T(8, 2), T(-1, 2)])), ['#6a0808', '#c01818', '#ff5a3a'], 1, 0.6); }
  else if (item === 'capw') { shadeShape(g, uni(ellP(T(0, 0), 5 * s, 3.4 * s), polyP([T(-1, 0), T(8, 0.6), T(8, 2), T(-1, 2)])), ['#a8aab4', '#f4f4f8', '#ffffff'], 1, 0.6); }
  else if (item === 'glasses') { for (const x of [-2.4, 2.4]) { g.lineWidth = 2; g.strokeStyle = OUT; g.beginPath(); g.arc(T(x, 0)[0], T(x, 0)[1], 2 * s, 0, 6.3); g.stroke(); g.lineWidth = 0.9; g.strokeStyle = '#e4ecf4'; g.beginPath(); g.arc(T(x, 0)[0], T(x, 0)[1], 2 * s, 0, 6.3); g.stroke(); } }
  else { const C = ['#050508', '#141418', '#2a2a34']; shadeShape(g, polyP([T(-6, -5), T(-2, -6), T(2, -6), T(6, -5), T(8, -1), T(5, 0), T(5, 6), T(-5, 6), T(-5, 0), T(-8, -1)]), C, 1, 0.6); px(g, T(0, 1), item === 'tee' ? '#e05a1a' : '#3a6a8a', 2, 2); }
}
/* Sprite sheets are painted at RES x density (2x the pixels of the old sheets),
   one animation row at a time, on demand, and each row is cropped to the
   union bounding box of its frames so memory stays phone-friendly.
   warmSheets() builds rows ahead of need inside a per-frame time budget. */
let SCRATCH = null;
function buildSheet(ch, A) {
  A = A || ART[ch];
  const defs = animsFor(ch, A), S = { lazy: 1, ch, A, pal: palOf(A), defs, rows: [], fw: FW * SD, fh: FH * SD, ox: FOX * SD, oy: FOY * SD, scale: 1 / SD, anims: {} };
  defs.forEach((an, row) => { S.anims[an.name] = Object.assign({ row, n: an.frames.length }, an.meta); });
  return S;
}
/* resumable: with a deadline (performance.now() ms) it paints frames until the deadline passes
   (at least one), parks the half-built strip in S.pend and returns null; without one it finishes the row. */
function sheetRow(S, row, until) {
  let Rw = S.rows[row]; if (Rw) return Rw;
  const an = S.defs[row], n = an.frames.length, fw = FW * SD, fh = FH * SD;
  if (!SCRATCH) SCRATCH = mk(fw, fh, true);
  S.pend = S.pend || {};
  const P = S.pend[row] || (S.pend[row] = { tmp: mk(fw * n, fh, true), i: 0 }), tmp = P.tmp;
  while (P.i < n) {
    const q = an.frames[P.i], i = P.i;
    const g = SCRATCH.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, fw, fh); g.setTransform(SD, 0, 0, SD, FOX * SD, FOY * SD);
    if (q.flip) g.scale(-1, 1); paintFrame(g, S.ch, q, S.A); g.setTransform(1, 0, 0, 1, 0, 0); pixelate(SCRATCH, S.pal, null); tmp.g.drawImage(SCRATCH, i * fw, 0);
    P.i++;
    if (until != null && P.i < n && performance.now() >= until) return null;
  }
  delete S.pend[row];
  const d = tmp.g.getImageData(0, 0, fw * n, fh).data, W2 = fw * n; let x0 = fw, x1 = -1, y0 = fh, y1 = -1;
  for (let y = 0; y < fh; y++) for (let x = 0; x < W2; x++) if (d[(y * W2 + x) * 4 + 3]) { const fx = x % fw; if (fx < x0) x0 = fx; if (fx > x1) x1 = fx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) { x0 = 0; x1 = 1; y0 = 0; y1 = 1; }
  x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(fw - 1, x1 + 2); y1 = Math.min(fh - 1, y1 + 2);
  const cw = x1 - x0 + 1, chh = y1 - y0 + 1, img = mk(cw * n, chh);
  for (let i = 0; i < n; i++) img.g.drawImage(tmp, i * fw + x0, y0, cw, chh, i * cw, 0, cw, chh);
  tmp.width = tmp.height = 1;   // free the scratch strip
  Rw = { img, rim: rimOf(img, cw), fw: cw, fh: chh, ox: FOX * SD - x0, oy: FOY * SD - y0 };
  S.rows[row] = Rw; return Rw;
}
function sheetReady(S) { return !S.lazy || S.rows.length === S.defs.length && S.rows.every(Boolean); }
/* build pending rows: match fighters (and their FIVE-FINGER DISCOUNT variants) first, then
   the attract/select rows for everyone. Spends at most `ms` per call. */
const WARM_BASIC = ['idle', 'walk', 'win'];
function warmSheets(ms) {
  const t0 = performance.now(), todo = [];
  if (G && G.f) { for (const f of G.f) todo.push([SHEETS[f.ch], null]); for (const k in SHEETS) if (k.indexOf(':') > 0) todo.push([SHEETS[k], null]); }
  for (const ch of CHAR_IDS) todo.push([SHEETS[ch], WARM_BASIC]);
  if (!(G && G.f) && typeof pick !== 'undefined' && SHEETS[pick]) todo.push([SHEETS[pick], null]);   // menus: after the cards, get the highlighted fighter's full sheet going
  for (const [S, only] of todo) {
    if (!S || !S.lazy) continue;
    for (let r = 0; r < S.defs.length; r++) {
      if (S.rows[r] || (only && only.indexOf(S.defs[r].name) < 0)) continue;
      sheetRow(S, r, t0 + ms); if (performance.now() - t0 >= ms) return false;
    }
  }
  return true;
}
/* portrait: head + shoulders, drawn bigger, same painter */
function makePortrait(ch, size, sc, expr) {
  const D = ART[ch].D, c = mk(size, size, true), g = c.g, J = solve(D, Q(D, { lean: 0, tilt: 0, expr }));
  const hb = ART[ch].L.beard === 'huge'; if (hb) sc *= 0.86;
  const cx = J.neckTop[0] + 1.5, cy = J.neckTop[1] - 6 * (D.hs || 1) + (hb ? 1.5 : 0);
  g.setTransform(sc, 0, 0, sc, size * 0.5 - cx * sc, size * 0.5 - cy * sc);
  PAINT_BUST = expr !== 'h'; try { paintFighter(g, J, { expr, fi: 1 }, D, ART[ch].M, ART[ch].L, true); } finally { PAINT_BUST = false; }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return pixelate(c, palOf(ch), null);
}
const SHEETS = {}, PORTRAITS = {};
/* which sheet to draw: during FIVE-FINGER DISCOUNT the thief wears the loot and the victim goes without (always still covered) */
function stealKeys(st) {
  if (!st) return null;
  const vch = G.f[st.v].ch, item = STEAL_ITEM[vch];
  return { thief: item === 'cap' && vch === 'dirty' ? 'capw' : item, victim: 'strip' };
}
function sheetFor(f) {
  const st = G && G.steal;
  if (st && st.t < st.T) {
    const k = stealKeys(st), key = f.i === st.i ? k.thief : f.i === st.v ? k.victim : null;
    if (key && STEAL_LOOK[f.ch + ':' + key]) return variantSheet(f.ch, key);
  }
  return SHEETS[f.ch];
}
function variantSheet(ch, key) {
  const id = ch + ':' + key;
  if (!SHEETS[id]) SHEETS[id] = buildSheet(ch, artOf(ch, key));
  return SHEETS[id];
}
function warmStealSheets() {   // called during the VS splash so the swap never hitches mid-fight
  if (!G || !G.f) return;
  for (const a of G.f) {
    if (!CHARS[a.ch].moves.sp3 || !CHARS[a.ch].moves.sp3.steal) continue;
    const v = G.f[1 - a.i], item = STEAL_ITEM[v.ch], tk = item === 'cap' && v.ch === 'dirty' ? 'capw' : item;
    if (STEAL_LOOK[a.ch + ':' + tk]) variantSheet(a.ch, tk);
    if (STEAL_LOOK[v.ch + ':strip'] && Object.keys(STEAL_LOOK[v.ch + ':strip']).length) variantSheet(v.ch, 'strip');
  }
}
function buildFighterArt() {
  preloadSprites();
  for (const ch of CHAR_IDS) {
    SHEETS[ch] = buildSheet(ch);
    PORTRAITS[ch] = { n: makePortrait(ch, 30 * RES, 1.25 * RES, 'n'), h: makePortrait(ch, 30 * RES, 1.25 * RES, 'h'), big: makePortrait(ch, 96 * RES, 3.6 * RES, 'n'), win: makePortrait(ch, 96 * RES, 3.6 * RES, 's') };
    sheetRow(SHEETS[ch], SHEETS[ch].anims.idle.row);
    loadPortrait(ch);
  }
}
/* a sprite fighter can ship a 192x192 PNG bust (C.sprite.portrait) for the select / VS / HUD / win portraits;
   until it loads, or if it fails, the code-drawn portraits above stay in place */
const PORTRAIT_IMG = {};
function loadPortrait(ch) {
  const C = CHARS[ch], src = C.render === 'sprite' && C.sprite && C.sprite.portrait; if (!src) return;
  const apply = im => {
    const fit = (size, smooth) => { const c = mk(size, size); c.g.imageSmoothingEnabled = smooth; if (smooth) c.g.imageSmoothingQuality = 'high'; c.g.drawImage(im, 0, 0, size, size); return c; };
    const n = fit(30 * RES, true), h = fit(30 * RES, true);
    h.g.globalCompositeOperation = 'source-atop'; h.g.fillStyle = 'rgba(255,40,40,0.38)'; h.g.fillRect(0, 0, h.width, h.height);
    PORTRAITS[ch] = { n, h, big: fit(96 * RES, false), win: fit(96 * RES, false), img: 1 };
  };
  const P = PORTRAIT_IMG[ch];
  if (P) { if (P.ok) apply(P.im); return; }
  const im = new Image(), rec = PORTRAIT_IMG[ch] = { im, ok: 0 };
  im.onload = () => { if (im.naturalWidth >= 32 && im.naturalHeight >= 32) { rec.ok = 1; apply(im); } };
  im.onerror = () => { rec.failed = 1; };   // keep the code-drawn portraits
  im.src = src;
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
  if (f.st === 'hit') return { name: f.cr ? 'chit' : f.hk === 2 ? 'stagger' : f.hk === 1 ? 'hitlo' : 'hit', p: 0 };
  if ((f.st === 'idle' || f.st === 'walk') && G && G.f && (G.phase === 'roundEnd' || G.phase === 'matchEnd') && G.f[1 - f.i] && G.f[1 - f.i].st === 'win') return { name: 'lose', p: 0 };
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
/* row lookup on the draw path: during a match a row that isn't warm yet gets a few ms of painting per
   screen frame (no long hitch that would swallow a motion input); meanwhile the closest warm row stands in. */
function readyRow(S, A, i) {
  const R = S.rows[A.row]; if (R) return [R, i];
  if (G && G.f) {
    const got = sheetRow(S, A.row, performance.now() + 3); if (got) return [got, i];
    for (const nm of (/^c/.test(S.defs[A.row].name) ? ['crouch', 'idle'] : ['idle'])) { const B = S.anims[nm], RB = B && S.rows[B.row]; if (RB) return [RB, i % B.n]; }
  }
  return [sheetRow(S, A.row), i];
}
function drawFromSheet(g, f, S, sx, sy, tick, mirrorY, rim) {
  const A = animOf(f, S), sc = S.scale || 1, sq = squashOf(f) || [1, 1]; let i = frameOf(f, A, tick);
  g.save(); g.translate(sx, sy); g.scale(f.face * sc * sq[0], (mirrorY ? -sc : sc) * sq[1]);
  if (S.lazy) {
    let Rw; [Rw, i] = readyRow(S, A, i);
    g.drawImage(Rw.img, i * Rw.fw, 0, Rw.fw, Rw.fh, -Rw.ox, -Rw.oy, Rw.fw, Rw.fh);
    if (rim) { const a0 = g.globalAlpha; g.globalAlpha = a0 * rim; g.drawImage(Rw.rim, i * Rw.fw, 0, Rw.fw, Rw.fh, -Rw.ox, -Rw.oy, Rw.fw, Rw.fh); g.globalAlpha = a0; }
  } else g.drawImage(S.img, i * S.fw, A.row * S.fh, S.fw, S.fh, -S.ox, -S.oy, S.fw, S.fh);
  g.restore();
}
/* RENDERERS[name](g, f, C, sx, sy, tick, mirrorY)
   'pixel'  - the generated sheets above (default)
   'sprite' - a PNG sheet from C.sprite = { src, fw, fh, ox, oy, scale, anims:{ idle:{row,n,fps}, walk:{row,n,by:'walk',div:3}, lp:{row,n,ph:['s','a','r']}, ... } }
              (falls back to 'pixel' until the image has loaded) */
const RENDERERS = {
  pixel(g, f, C, sx, sy, tick, my, rim) { drawFromSheet(g, f, sheetFor(f), sx, sy, tick, my, rim); },
  sprite(g, f, C, sx, sy, tick, my, rim) {
    const S = C.sprite;
    // code-drawn art while the PNG loads, if it failed to load, or while a stolen-item look is being worn
    if (!S || !S.img || stealLookOn(f)) { if (S && !S.loading) loadSprite(S); return RENDERERS.pixel(g, f, C, sx, sy, tick, my, rim); }
    drawFromSheet(g, f, S, sx, sy, tick, my);
  }
};
function loadSprite(S) {
  S.loading = 1; const im = new Image();
  im.onload = () => { if (im.naturalWidth >= S.fw && im.naturalHeight >= S.fh) S.img = im; else S.failed = 1; };
  im.onerror = () => { S.failed = 1; };   // stays on the code-drawn art for this session
  im.src = S.src;
}
function stealLookOn(f) {
  const st = G && G.steal; if (!st || !(st.t < st.T)) return false;
  const k = stealKeys(st), key = f.i === st.i ? k.thief : f.i === st.v ? k.victim : null, L = key && STEAL_LOOK[f.ch + ':' + key];
  return !!(L && Object.keys(L).length);
}
function preloadSprites() { for (const id of CHAR_IDS) { const S = CHARS[id].sprite; if (CHARS[id].render === 'sprite' && S && !S.loading) loadSprite(S); } }
RENDERERS.shapes = RENDERERS.pixel;
</script>
