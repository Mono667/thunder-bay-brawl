<script>
'use strict';
/* =====================================================================
   RENDERING
   The world is drawn at 480x270 into `wc`, then blown up 2x (pixelated)
   onto the main canvas; the HUD is drawn on top at 2x so text stays crisp.
   ===================================================================== */
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
const wc = document.createElement('canvas'); wc.width = W; wc.height = H;
const wx = wc.getContext('2d');
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
let seed = 1337; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

/* ---------- background layers (pre-rendered once) ---------- */
const BG = {};
(function buildBG() {
  // sky
  let c = mk(W, H), g = c.getContext('2d');
  let gr = g.createLinearGradient(0, 0, 0, 170); gr.addColorStop(0, '#05061a'); gr.addColorStop(0.6, '#1a1442'); gr.addColorStop(1, '#3a2457');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) { g.fillStyle = rnd() < 0.2 ? '#fff6c8' : '#9aa6e8'; g.fillRect(rnd() * W | 0, rnd() * 130 | 0, 1, 1); }
  g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(392, 42, 15, 0, 7); g.fill();
  g.fillStyle = '#e8d9a0'; g.beginPath(); g.arc(387, 38, 3, 0, 7); g.arc(398, 47, 2, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,240,190,.08)'; g.beginPath(); g.arc(392, 42, 30, 0, 7); g.fill();
  BG.sky = c;
  // far: Lake Superior + the Sleeping Giant
  c = mk(640, H); g = c.getContext('2d');
  g.fillStyle = '#101a3a'; g.fillRect(0, 150, 640, 40);
  for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,240,190,' + (0.05 + rnd() * 0.12) + ')'; g.fillRect(rnd() * 640 | 0, 152 + rnd() * 34 | 0, 4 + rnd() * 10 | 0, 1); }
  g.fillStyle = '#1d2448';
  g.beginPath(); g.moveTo(40, 151);
  const giant = [[70, 146], [100, 141], [130, 132], [160, 122], [185, 119], [205, 124], [235, 133], [262, 131], [290, 118], [320, 110], [360, 108], [400, 110], [425, 118], [440, 126], [452, 122], [462, 112], [474, 108], [486, 110], [494, 104], [500, 110], [512, 124], [530, 140], [560, 151]];
  for (const p of giant) g.lineTo(p[0], p[1]);
  g.closePath(); g.fill();
  g.fillStyle = '#151b3a'; g.fillRect(0, 150, 640, 2);
  BG.far = c;
  // mid: grain elevators, harbour cranes, Port Arthur skyline
  c = mk(760, H); g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#0d1226';
  const tall = [[30, 70, 30], [96, 54, 20], [150, 86, 36], [250, 60, 18], [300, 30, 26], [450, 66, 22], [520, 92, 32], [620, 58, 20], [690, 80, 26]];
  for (const [x, w, hh] of tall) { g.fillRect(x, 190 - hh, w, hh); }
  // grain elevator: row of silos + headhouse
  g.fillStyle = '#121a33';
  for (let i = 0; i < 9; i++) { g.fillRect(340 + i * 11, 148, 10, 42); g.beginPath(); g.arc(345 + i * 11, 148, 5, Math.PI, 0); g.fill(); }
  g.fillRect(366, 128, 36, 22); g.fillRect(378, 120, 12, 10);
  g.font = 'bold 7px Arial'; g.fillStyle = '#2b3a66'; g.fillText('POOL 6', 369, 142);
  g.fillStyle = '#121a33'; g.fillRect(580, 150, 3, 40); g.fillRect(560, 150, 46, 3); g.fillRect(604, 150, 2, 16);
  for (let i = 0; i < 260; i++) { const x = rnd() * 760 | 0, y = 150 + rnd() * 40 | 0; const id = g.getImageData(x, y, 1, 1).data; if (id[2] > 30) { g.fillStyle = rnd() < 0.7 ? '#f5d27a' : '#8fd7ff'; g.fillRect(x, y, 2, 2); } }
  BG.mid = c;
  // near: Bay Street storefronts + road (scrolls 1:1 with the fighters)
  c = mk(STAGE_W, H); g = c.getContext('2d');
  g.fillStyle = '#20141c'; g.fillRect(0, 118, STAGE_W, 96);
  for (let x = 0; x < STAGE_W; x += 8) for (let y = 118; y < 214; y += 4) { g.fillStyle = ((x / 8 + y / 4) % 3 === 0) ? '#2a1920' : '#24161d'; g.fillRect(x + ((y / 4) % 2 ? 4 : 0), y, 7, 3); }
  const shops = [[10, 'BAIT & TACKLE', '#8fd7ff'], [140, '', '#f5d27a'], [250, '', '#ff8ac0'], [380, 'BAY ST', '#9fffb0'], [520, '', '#ff5a3a'], [660, 'PAWN', '#f5d27a']];
  for (const [x, name, col] of shops) {
    g.fillStyle = '#120c12'; g.fillRect(x, 132, 120, 82);
    g.fillStyle = '#2b2233'; g.fillRect(x + 6, 152, 70, 46);
    gr = g.createLinearGradient(0, 152, 0, 198); gr.addColorStop(0, col + '55'); gr.addColorStop(1, col + '11'); g.fillStyle = gr; g.fillRect(x + 8, 154, 66, 42);
    g.fillStyle = '#0b070b'; g.fillRect(x + 84, 160, 28, 54); g.fillStyle = '#d8b46a'; g.fillRect(x + 106, 186, 2, 3);
    if (name) { g.font = 'bold 8px Arial'; g.fillStyle = col; g.fillText(name, x + 8, 146); }
    g.fillStyle = '#3a2a36'; g.fillRect(x - 2, 128, 124, 4);
  }
  g.fillStyle = '#4a4650'; g.fillRect(0, 214, STAGE_W, 12);               // sidewalk
  g.fillStyle = '#5a5662'; for (let x = 0; x < STAGE_W; x += 32) g.fillRect(x, 214, 1, 12);
  g.fillStyle = '#7a7684'; g.fillRect(0, 225, STAGE_W, 2);                // curb
  gr = g.createLinearGradient(0, 227, 0, H); gr.addColorStop(0, '#24222c'); gr.addColorStop(1, '#141218'); g.fillStyle = gr; g.fillRect(0, 227, STAGE_W, H - 227);
  for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(255,255,255,' + rnd() * 0.06 + ')'; g.fillRect(rnd() * STAGE_W | 0, 228 + rnd() * 42 | 0, 1, 1); }
  g.fillStyle = '#c8b04a'; for (let x = 6; x < STAGE_W; x += 44) g.fillRect(x, 258, 22, 2);
  // snowbanks along the curb - it's Thunder Bay
  for (let x = 0; x < STAGE_W; x += 3) { const hh = 3 + Math.sin(x * 0.05) * 2 + Math.sin(x * 0.17) * 1.5 + rnd(); if (Math.sin(x * 0.013) > -0.35) { g.fillStyle = '#d9e4f2'; g.fillRect(x, 226 - hh, 3, hh); g.fillStyle = '#a9b8cc'; g.fillRect(x, 225, 3, 1); } }
  // streetlamps
  for (const x of [120, 400, 680]) { g.fillStyle = '#0b0a10'; g.fillRect(x, 120, 3, 100); g.fillRect(x - 10, 120, 13, 3); g.fillStyle = '#ffe9a8'; g.fillRect(x - 11, 123, 6, 3); }
  BG.near = c;
})();
const snow = []; for (let i = 0; i < 70; i++) snow.push({ x: Math.random() * W, y: Math.random() * H, s: 0.3 + Math.random() * 0.7 });

function drawBG(g, camX, tick) {
  g.drawImage(BG.sky, 0, 0);
  g.drawImage(BG.far, -camX * 0.15 - 40 | 0, -56);
  g.drawImage(BG.mid, -camX * 0.4 - 20 | 0, -72);
  g.drawImage(BG.near, -camX | 0, 0);
  // neon signs (flicker) + lamp light pools, drawn live
  const flick = (n) => ((tick + n * 37) % 240 < 6 ? 0.25 : 1);
  neon(g, 'THE HOITO', 150 - camX, 146, '#ff3a3a', flick(1));
  neon(g, 'PERSIANS 24HR', 258 - camX, 146, '#ff8ac0', flick(2));
  neon(g, 'LIVE BAIT', 528 - camX, 146, '#57e0ff', flick(3));
  for (const x of [120, 400, 680]) {
    const gx = x - 8 - camX, gr = g.createRadialGradient(gx, 232, 2, gx, 232, 60);
    gr.addColorStop(0, 'rgba(255,225,150,.20)'); gr.addColorStop(1, 'rgba(255,225,150,0)'); g.fillStyle = gr; g.fillRect(gx - 60, 180, 120, 90);
  }
}
function neon(g, t, x, y, col, a) {
  g.save(); g.globalAlpha = a; g.font = 'bold 9px Arial'; g.shadowColor = col; g.shadowBlur = 8; g.fillStyle = col; g.fillText(t, x | 0, y); g.shadowBlur = 0; g.fillStyle = '#fff'; g.globalAlpha = a * 0.5; g.fillText(t, x | 0, y); g.restore();
}
function drawSnow(g, tick) {
  g.fillStyle = 'rgba(230,240,255,.75)';
  for (const s of snow) { const y = (s.y + tick * s.s * 0.6) % H, x = (s.x + Math.sin((tick + s.y) * 0.02) * 6 + W) % W; g.fillRect(x | 0, y | 0, s.s > 0.7 ? 2 : 1, s.s > 0.7 ? 2 : 1); }
}

/* ---------- fighter renderers (swappable) ----------
   RENDERERS[name](g, f, C, sx, sy, tick)
     g: 2D context in world pixels   f: fighter state   C: CHARS entry
     sx, sy: screen position of the fighter's feet
   poseOf(f) gives {name, p} so a sprite renderer can pick an animation row. */
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
const RENDERERS = {
  shapes(g, f, C, sx, sy, tick) {
    const k = C.scale, col = C.colors, pose = poseOf(f), P = pose.name, p = pose.p;
    g.save(); g.translate(sx, sy); g.scale(f.face, 1);
    let lean = 0, rot = 0, lift = 0;
    if (f.st === 'kd') rot = -Math.min(1, f.t / 14) * 1.35;
    if (f.st === 'lie' || f.st === 'ko') { rot = -Math.PI / 2; lift = -6; }
    if (f.st === 'rise') rot = -Math.PI / 2 * (1 - f.t / 14);
    if (rot) { g.translate(0, lift); g.rotate(rot); }
    const crouch = /^c/.test(P) || P === 'crouch';
    const air = f.y > 0 && f.st !== 'kd';
    const bob = (f.st === 'idle') ? Math.sin(tick * 0.12 + f.i) * 1.2 : 0;
    let hipH = (crouch ? 19 : 32) * k + bob, torso = 26 * k;
    if (P === 'hit' || P === 'chit') lean = -5; if (P === 'rush') lean = 8; if (P === 'kick' || P === 'jkick') lean = -4 * p;
    if (P === 'win') hipH += Math.abs(Math.sin(f.t * 0.15)) * 3;
    const hip = [0, -hipH], neck = [lean, -hipH - torso], sh = [lean + 2, -hipH - torso + 4];
    // legs
    let fF = [10 * k, 0], bF = [-9 * k, 0];
    if (f.st === 'walk') { const w = Math.sin(f.walkT * 0.35) * 6; fF = [10 * k + w, -Math.max(0, Math.cos(f.walkT * 0.35)) * 3]; bF = [-9 * k - w, -Math.max(0, -Math.cos(f.walkT * 0.35)) * 3]; }
    if (crouch) { fF = [13 * k, 0]; bF = [-12 * k, 0]; }
    if (air) { fF = [10 * k, -hipH + 12]; bF = [-6 * k, -hipH + 8]; }
    const M = pose.M, tgt = (b) => [b[0] + b[2] - 3, -(b[1] + b[3] / 2)];
    if (M && (P === 'kick' || P === 'jkick' || P === 'csweep')) {
      const T = tgt(M.box), base = P === 'csweep' ? [6 * k, 0] : [6 * k, -10]; if (air) T[1] += f.y * 0;
      fF = [base[0] + (T[0] - base[0]) * p, base[1] + (T[1] - base[1]) * p];
      if (P === 'csweep') { bF = [-14 * k, 0]; }
    }
    // arms
    let fH = [15 * k, sh[1] + 9], bH = [9 * k, sh[1] + 13];
    if (M && (P === 'punch' || P === 'cpunch' || P === 'jpunch' || P === 'rush')) { const T = tgt(M.box); fH = [fH[0] + (T[0] - fH[0]) * p, fH[1] + (T[1] - fH[1]) * p]; bH = [5 * k, sh[1] + 12]; }
    if (M && P === 'cupper') { const T = [M.box[0] + M.box[2] / 2, -(M.box[1] + M.box[3] - 2)]; fH = [fH[0] + (T[0] - fH[0]) * p, fH[1] + (T[1] - fH[1]) * p]; }
    if (P === 'toss') { fH = p < 1 ? [-8 + p * 10, sh[1] - 6 - p * 8] : [26 * k, sh[1] + 2]; }
    if (P === 'block' || P === 'cblock') { fH = [13 * k, sh[1] - 2]; bH = [11 * k, sh[1] + 4]; }
    if (P === 'hit' || P === 'chit' || f.st === 'kd') { fH = [-2, sh[1] - 12]; bH = [-12, sh[1] - 4]; }
    if (P === 'win') { fH = [4, sh[1] - 26]; bH = [10, sh[1] + 10]; }
    const OUT = '#05040a';
    const limb = (a, b, L1, L2, bend, w, c, endC, endR) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      let j;
      if (d >= L1 + L2) j = [a[0] + dx * L1 / (L1 + L2), a[1] + dy * L1 / (L1 + L2)];
      else { const aa = (L1 * L1 - L2 * L2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, L1 * L1 - aa * aa)), ux = dx / d, uy = dy / d; j = [a[0] + ux * aa - uy * hh * bend, a[1] + uy * aa + ux * hh * bend]; }
      g.lineCap = 'round'; g.lineJoin = 'round';
      g.strokeStyle = OUT; g.lineWidth = w + 3; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(j[0], j[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(j[0], j[1]); g.lineTo(b[0], b[1]); g.stroke();
      if (endC) { g.fillStyle = OUT; g.beginPath(); g.arc(b[0], b[1], endR + 1.5, 0, 7); g.fill(); g.fillStyle = endC; g.beginPath(); g.arc(b[0], b[1], endR, 0, 7); g.fill(); }
    };
    const legL = hipH / 2 + 2, armL = 11 * k;
    limb(sh, bH, armL, armL, 1, 5 * k, col.top2, col.glove, 3.2 * k);                 // back arm
    limb(hip, bF, legL, legL, -1, 7 * k, col.pants, col.shoe, 3 * k);                  // back leg
    // torso
    g.strokeStyle = OUT; g.lineCap = 'round'; g.lineWidth = 15 * k + 3; g.beginPath(); g.moveTo(hip[0], hip[1]); g.lineTo(neck[0], neck[1] + 4); g.stroke();
    g.strokeStyle = col.top; g.lineWidth = 15 * k; g.beginPath(); g.moveTo(hip[0], hip[1]); g.lineTo(neck[0], neck[1] + 4); g.stroke();
    g.fillStyle = col.band; g.fillRect(hip[0] - 8 * k, hip[1] - 2, 16 * k, 3);
    // head
    const hd = [neck[0] + 2, neck[1] - 7 * k];
    g.fillStyle = OUT; g.beginPath(); g.arc(hd[0], hd[1], 8.5 * k + 1.5, 0, 7); g.fill();
    g.fillStyle = col.skin; g.beginPath(); g.arc(hd[0], hd[1], 8.5 * k, 0, 7); g.fill();
    g.fillStyle = col.hair; g.beginPath(); g.arc(hd[0] - 1, hd[1] - 2, 8.5 * k, Math.PI * 0.95, Math.PI * 2.05); g.fill();
    if (col.beard) { g.fillStyle = col.hair; g.beginPath(); g.arc(hd[0] + 2, hd[1] + 3, 7 * k, 0.1, Math.PI - 0.6); g.fill(); }
    else { g.fillStyle = col.band; g.fillRect(hd[0] - 8, hd[1] - 4, 16, 3); g.fillRect(hd[0] - 12, hd[1] - 3 + Math.sin(tick * 0.3) * 1.5, 5, 2); }
    g.fillStyle = '#000'; const ko = f.st === 'ko' || f.st === 'kd' || P === 'hit' || P === 'chit';
    if (ko) { g.fillRect(hd[0] + 3, hd[1] - 2, 3, 1); g.fillRect(hd[0] + 4, hd[1] - 3, 1, 3); } else g.fillRect(hd[0] + 4, hd[1] - 2, 2, 2);
    limb(hip, fF, legL, legL, -1, 7 * k, col.pants, col.shoe, 3 * k);                  // front leg
    limb(sh, fH, armL, armL, 1, 5 * k, col.top, col.glove, 3.6 * k);                   // front arm
    if (P === 'rush' && p === 1) { g.globalAlpha = 0.35; g.fillStyle = col.band; for (let i = 1; i < 4; i++) g.fillRect(-14 - i * 9, -60 * k + i * 4, 8, 34 * k); g.globalAlpha = 1; }
    g.restore();
  },
  /* Sprite-sheet renderer, ready for real art. Set on a character:
       render: 'sprite',
       sprite: { src: 'art/lynx.png', fw: 96, fh: 96, ox: 48, oy: 92, scale: 1,
                 anims: { idle: {row:0, n:4, fps:8}, walk: {row:1, n:6, fps:10}, punch: {row:2, n:3}, ... } }
     ox/oy = the feet point inside a frame. Unknown poses fall back to 'idle'.
     Attack poses play their frames across startup/active/recovery using pose.p. */
  sprite(g, f, C, sx, sy, tick) {
    const S = C.sprite;
    if (!S || !S.img) { if (S && !S.loading) { S.loading = 1; S.img0 = new Image(); S.img0.onload = () => { S.img = S.img0; }; S.img0.src = S.src; } return RENDERERS.shapes(g, f, C, sx, sy, tick); }
    const pose = poseOf(f), A = S.anims[pose.name] || S.anims[pose.name.replace(/^c/, '')] || S.anims.idle;
    let fr = pose.M ? Math.min(A.n - 1, Math.floor((pose.M && f.mf < pose.M.s ? 0.5 * pose.p : 0.5 + 0.5 * (1 - pose.p)) * A.n)) : Math.floor(tick * (A.fps || 8) / 60) % A.n;
    g.save(); g.translate(sx, sy); g.scale(f.face * (S.scale || 1), S.scale || 1);
    g.drawImage(S.img, fr * S.fw, A.row * S.fh, S.fw, S.fh, -S.ox, -S.oy, S.fw, S.fh);
    g.restore();
  }
};

function drawFighter(g, f, tick) {
  const C = CHARS[f.ch], sx = Math.round(f.x - G.camX), sy = GROUND - Math.round(f.y);
  g.fillStyle = 'rgba(0,0,0,.45)'; const sw = 18 * C.scale * Math.max(0.4, 1 - f.y / 120);
  g.beginPath(); g.ellipse(sx, GROUND + 1, sw, 3, 0, 0, 7); g.fill();
  if (f.inv > 0 && (tick >> 1) % 2) g.globalAlpha = 0.6;
  (RENDERERS[C.render] || RENDERERS.shapes)(g, f, C, sx, sy, tick);
  g.globalAlpha = 1;
}
function drawProj(g, p, tick) {
  const x = p.x - G.camX, y = GROUND - p.y;
  g.save(); g.translate(x, y); g.rotate(tick * 0.4 * Math.sign(p.vx));
  g.fillStyle = 'rgba(255,138,192,.35)'; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.fill();
  g.fillStyle = '#05040a'; g.beginPath(); g.arc(0, 0, 9.5, 0, 7); g.fill();
  g.fillStyle = '#d99a52'; g.beginPath(); g.arc(0, 0, 8, 0, 7); g.fill();
  g.fillStyle = '#ff8ac0'; g.beginPath(); g.arc(0, 0, 6.5, 0, 7); g.fill();
  g.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { const a = i * 1.26; g.fillRect(Math.cos(a) * 4.5, Math.sin(a) * 4.5, 2, 1); }
  g.fillStyle = '#05040a'; g.beginPath(); g.arc(0, 0, 2.4, 0, 7); g.fill();
  g.restore();
  g.fillStyle = 'rgba(255,138,192,.25)'; g.fillRect(x - p.vx * 5 - 8, y - 3, 10, 6);
}
function drawSpark(g, s) {
  const x = s.x - G.camX, y = GROUND - s.y, t = s.t, big = s.k === 'H' ? 1.5 : 1;
  g.save(); g.translate(x, y);
  if (s.k === 'b') {
    g.strokeStyle = t < 6 ? '#bfe8ff' : '#5aa0ff'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 4 + t * 1.3, -1.2, 1.2); g.stroke();
  } else {
    const r = (5 + t * 1.6) * big, n = 8;
    g.fillStyle = t < 4 ? '#ffffff' : t < 9 ? '#fff36a' : '#ff7a00';
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + t * 0.1, rr = i % 2 ? r * 0.4 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.globalAlpha = Math.max(0, 1 - t / 16); g.fill();
  }
  g.restore();
}
function drawBoxes(g) {
  for (const f of G.f) {
    const hu = hurtBox(f); g.strokeStyle = '#0f0'; g.strokeRect(hu[0] - G.camX, GROUND - hu[1] - hu[3], hu[2], hu[3]);
    const M = moveDef(f); if (M && f.mf >= M.s && f.mf < M.s + M.a && !M.proj) { const b = worldBox(f, M.box); g.strokeStyle = '#f00'; g.strokeRect(b[0] - G.camX, GROUND - b[1] - b[3], b[2], b[3]); }
  }
}

/* ---------- HUD ---------- */
function outlined(g, t, x, y, size, fill, stroke, align) {
  g.font = size + 'px Impact, "Arial Black", sans-serif'; g.textAlign = align || 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.strokeStyle = stroke || '#000'; g.lineWidth = Math.max(2, size / 7); g.strokeText(t, x, y);
  g.fillStyle = fill; g.fillText(t, x, y);
}
function drawHUD(g) {
  const bw = 196, bh = 11, y = 12;
  for (let i = 0; i < 2; i++) {
    const f = G.f[i], x = i ? W - 14 - bw : 14;
    g.fillStyle = '#000'; g.fillRect(x - 2, y - 2, bw + 4, bh + 4);
    g.fillStyle = '#3a0a0a'; g.fillRect(x, y, bw, bh);
    const red = bw * f.red / f.max, hp = bw * f.hp / f.max;
    g.fillStyle = '#e01a1a'; if (i) g.fillRect(x + bw - red, y, red, bh); else g.fillRect(x, y, red, bh);
    const gr = g.createLinearGradient(0, y, 0, y + bh); gr.addColorStop(0, '#fff6a0'); gr.addColorStop(0.5, '#ffd23a'); gr.addColorStop(1, '#e09a00');
    g.fillStyle = f.hp / f.max < 0.25 && (G.tick >> 3) % 2 ? '#ff8a3a' : gr;
    if (i) g.fillRect(x + bw - hp, y, hp, bh); else g.fillRect(x, y, hp, bh);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, y + 1, bw, 2);
    outlined(g, CHARS[f.ch].name, i ? W - 14 : 14, y + bh + 9, 10, '#fff', '#000', i ? 'right' : 'left');
    const lab = G.mode === 'solo' ? (i ? 'CPU' : '1P') : (i === me ? 'YOU' : (i ? '2P' : '1P'));
    outlined(g, lab, i ? W - 14 - g.measureText(CHARS[f.ch].name).width - 22 : 14 + g.measureText(CHARS[f.ch].name).width + 20, y + bh + 9, 8, '#7fd3ff', '#000');
    for (let r = 0; r < G.wins[i]; r++) { const wx2 = i ? W - 14 - bw + 4 + r * 13 : 14 + bw - 10 - r * 13; g.fillStyle = '#000'; g.fillRect(wx2 - 1, y + bh + 4, 10, 10); g.fillStyle = '#ffd23a'; g.fillRect(wx2, y + bh + 5, 8, 8); outlined(g, 'V', wx2 + 4, y + bh + 9.5, 8, '#c00', '#ffd23a'); }
  }
  g.fillStyle = '#000'; g.fillRect(W / 2 - 16, 6, 32, 24);
  outlined(g, String(Math.max(0, G.timer)).padStart(2, '0'), W / 2, 19, 20, G.timer <= 10 ? '#ff5a3a' : '#fff36a');
  if (G.banner) {
    const b = G.banner, s = Math.min(1, b.t / 8), big = b.txt.length < 8 ? 54 : b.txt.length < 13 ? 40 : 30;
    g.save(); g.translate(W / 2, H * 0.42); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    const col = b.txt === 'FIGHT!' ? '#ff5a2a' : /K\.O\./.test(b.txt) ? '#ff2a2a' : '#fff36a';
    outlined(g, b.txt, 0, 0, big, col, '#000'); g.restore();
  }
  if (G.phase === 'matchEnd') {
    const txt = G.result < 0 ? 'DRAW GAME' : G.result === me ? 'YOU WIN' : 'YOU LOSE';
    const s = Math.min(1, G.pt / 10);
    g.save(); g.translate(W / 2, H * 0.36); g.scale(0.5 + 0.5 * s, 0.5 + 0.5 * s);
    outlined(g, txt, 0, 0, 58, G.result === me ? '#fff36a' : '#7fd3ff', '#000'); g.restore();
    if (G.result >= 0) outlined(g, CHARS[G.f[G.result].ch].title + ' TAKES BAY STREET', W / 2, H * 0.36 + 36, 12, '#fff', '#000');
  }
}

function render() {
  if (!G) { drawBG(wx, (STAGE_W - W) / 2, frame); drawSnow(wx, frame); ctx.imageSmoothingEnabled = false; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(wc, 0, 0, 960, 540); return; }
  const t = G.tick;
  drawBG(wx, G.camX, t);
  const order = G.f.slice().sort((a, b) => (a.st === 'atk' ? 1 : 0) - (b.st === 'atk' ? 1 : 0));
  for (const f of order) drawFighter(wx, f, t);
  for (const p of G.proj) drawProj(wx, p, t);
  for (const s of G.sparks) drawSpark(wx, s);
  drawSnow(wx, t);
  if (SHOW_BOXES) drawBoxes(wx);
  const sh = G.shake, ox = sh ? (Math.random() - 0.5) * sh * 2 : 0, oy = sh ? (Math.random() - 0.5) * sh * 2 : 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 960, 540);
  ctx.drawImage(wc, ox * 2 - (sh ? 6 : 0), oy * 2 - (sh ? 6 : 0), 960 + (sh ? 12 : 0), 540 + (sh ? 12 : 0));
  ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.imageSmoothingEnabled = true;
  drawHUD(ctx);
}

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
