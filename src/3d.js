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

/* stage builders, crowd, neon + shared stage assets live in 3c.js */
/* ---------- sparks / dust (pre-rendered frame strips, pixel-snapped) ---------- */
const SPARK_PAL = ['#ffffff', '#fff6b0', '#ffe066', '#ffb020', '#ff6a12', '#c82808', '#bfe8ff', '#7fd3ff', '#3a8aff', '#1a4ca0', '#d8d0c0', '#a89a88', '#6a6058', '#0b0712'];
const SPK = {};
function buildSparks() {
  const life = { h: 18, H: 22, K: 34, b: 16, d: 16, D: 22 }, size = { h: 56, H: 96, K: 150, b: 44, d: 40, D: 72 };
  for (const k in life) {
    const n = Math.ceil(life[k] / 2), S = size[k], arr = [];
    for (let i = 0; i < n; i++) {
      const c = mk(S * SD, S * SD, true), g = c.g, p = i / (n - 1), m = S / 2; seed = 99 + i * 7 + k.charCodeAt(0); g.setTransform(SD, 0, 0, SD, 0, 0);
      if (k === 'h' || k === 'H' || k === 'K') {
        const big = k === 'h' ? 1.3 : k === 'H' ? 2.2 : 3.4, rays = k === 'h' ? 8 : 14;
        if (i < 2) { g.fillStyle = '#ffffff'; g.fillRect(m - S * 0.45, m - 1.5, S * 0.9, 3); g.fillRect(m - 1.5, m - S * 0.32, 3, S * 0.64); }   // first frames: hard cross-flash
        if (k !== 'h' && p > 0.1 && p < 0.7) { g.strokeStyle = '#ff6a12'; g.lineWidth = 1; for (let r = 0; r < 6; r++) { const a = r / 6 * 7 + i, L0 = (8 + p * 18) * big * 0.6; g.beginPath(); g.moveTo(m + Math.cos(a) * L0, m + Math.sin(a) * L0); g.lineTo(m + Math.cos(a + 0.25) * L0 * 1.5, m + Math.sin(a + 0.25) * L0 * 1.5); g.stroke(); } }
        const col = p < 0.25 ? '#ffffff' : p < 0.5 ? '#ffe066' : p < 0.75 ? '#ffb020' : '#ff6a12';
        if (p < 0.6) { g.fillStyle = p < 0.3 ? '#ffffff' : '#fff6b0'; g.beginPath(); g.arc(m, m, (5 - p * 6) * big, 0, 7); g.fill(); }
        g.strokeStyle = col; g.lineCap = 'round';
        for (let r = 0; r < rays; r++) { const a = r / rays * Math.PI * 2 + (r & 1) * 0.2, L0 = (3 + p * 10) * big, L1 = L0 + (r & 1 ? 5 : 9) * big * (1 - p * 0.7); g.lineWidth = Math.max(1, (2.6 - p * 2) * big * 0.7); g.beginPath(); g.moveTo(m + Math.cos(a) * L0, m + Math.sin(a) * L0); g.lineTo(m + Math.cos(a) * L1, m + Math.sin(a) * L1); g.stroke(); }
        if (k !== 'h') { g.strokeStyle = p < 0.4 ? '#ffffff' : '#ffb020'; g.lineWidth = Math.max(1, 2 * (1 - p)); g.beginPath(); g.arc(m, m, (4 + p * 16) * big * 0.8, 0, 7); g.stroke(); }
        if (p < 0.8) { g.strokeStyle = '#ffffff'; g.lineWidth = 0.5; for (let r = 0; r < rays; r++) { const a = r / rays * Math.PI * 2 + (r & 1) * 0.2 + 0.11, L0 = (2 + p * 10) * big, L1 = L0 + (r & 1 ? 4 : 8) * big * (1 - p * 0.7); g.beginPath(); g.moveTo(m + Math.cos(a) * L0, m + Math.sin(a) * L0); g.lineTo(m + Math.cos(a) * L1, m + Math.sin(a) * L1); g.stroke(); } }   // fine white glints (2x detail)
        if (p > 0.3) { for (let d = 0; d < (k === 'h' ? 5 : 12); d++) { const a = rnd() * 7, rr = (8 + p * 22) * big * (0.5 + rnd() * 0.6); g.fillStyle = p < 0.6 ? '#fff6b0' : '#ff9a3a'; g.fillRect(m + Math.cos(a) * rr, m + Math.sin(a) * rr, 1, 1); } }   // ember specks
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
  PROJ.wave = [];
  for (let i = 0; i < 8; i++) { const c = mk(32 * SD, 32 * SD, true); c.g.scale(SD, SD); waveRings(c.g, [16, 16], 1, i / 8); PROJ.wave.push(pixelate(c, [OUT].concat(FXP, ['#ff6ad8', '#c03aa0']), null)); }
  for (const art of ['ink', 'wire', 'chain']) {
    PROJ[art] = [];
    for (let i = 0; i < 8; i++) {
      const c = mk(32 * SD, 32 * SD, true), g = c.g;
      g.scale(SD, SD); g.translate(16, 16); g.rotate(art === 'ink' ? Math.sin(i / 8 * Math.PI * 2) * 0.25 : 0); g.translate(-16, -16);
      if (art === 'ink') { inkBlob(g, [16, 16], 1.7 + Math.sin(i / 8 * Math.PI * 2) * 0.12); } else if (art === 'chain') chainSpark(g, [16, 16], 1.55, i / 8 * Math.PI * 2); else wireCoil(g, [16, 16], 1.6, i / 8 * Math.PI * 2);
      PROJ[art].push(pixelate(c, [OUT].concat(FXP), null));
    }
  }
}

/* ---------- live stage drawing ---------- */
function neonLevel(n, tick) {   // 1 = on, 0 = off; each sign has its own flicker habit
  const t = (tick + n.ph) % 600;
  if (n.dodgy === 1) return (t < 40 && (t >> 2) % 3 === 0) || (t > 300 && t < 310) ? 0 : 1;   // the PAWN sign
  if (n.dodgy === 2) return (t > 420 && t < 470 && (t * 7 >> 3) % 5 === 0) || (t < 6 && t & 1) ? 0 : 1;   // the tavern: buzzes, stutters now and then
  return t < 8 && (t >> 1) % 2 ? 0 : 1;
}
function stageOf(sid) { return STAGES[sid || (G && G.stage) || (!G && ATTRACT.stage) || 'bay'] || STAGES.bay; }
function drawStage(g, camX, tick, sid, b) {   // draws in screen units, leaves the fight-plane transform set
  b = b || RES; const lv = QUAL.lv, S = stageOf(sid), T = camX * ZOOM;
  screenXform(g, b);
  g.drawImage(S.sky, 0, 0);
  if (S.clouds) { const cw = S.clouds.width, ox = Math.round((((T * 0.035 + tick * 0.04) % cw) + cw) % cw); g.globalAlpha = 0.85; g.drawImage(S.clouds, -ox, S.cloudY); g.drawImage(S.clouds, cw - ox, S.cloudY); g.globalAlpha = 1; }
  if (lv > 0 && S.aur) {   // aurora curtains drift and shimmer (cross-fade between 4 frames)
    const u = tick / 70, k = Math.floor(u) % 4, fr = u - Math.floor(u), ax = Math.round(-20 - T * 0.03 + Math.sin(tick * 0.002) * 6), a0 = (0.45 + 0.2 * Math.sin(tick * 0.013)) * S.aur;
    g.globalAlpha = a0 * (1 - fr); g.drawImage(BG.aur[k], ax, 0);
    g.globalAlpha = a0 * fr; g.drawImage(BG.aur[(k + 1) % 4], ax, 0); g.globalAlpha = 1;
  }
  for (const L of S.layers) g.drawImage(L.img, Math.round(-T * L.par), L.y || 0);
  if (S.back) S.back(g, T, tick, lv, S);
  const nx = Math.round(-T);
  g.drawImage(S.near, nx, 0);
  for (const n of S.neon) {
    const x = Math.round(n.x - n.w / 2 + nx); if (x > W + 50 || x + n.w < -50) continue;
    const on = neonLevel(n, tick);
    if (on && lv > 0) { g.globalCompositeOperation = 'lighter'; g.drawImage(n.wash, x - 45, n.y - 35); g.globalCompositeOperation = 'source-over'; }   // the sign lights the brick around it
    g.drawImage(on ? n.on : n.off, x, n.y);
    if (on && lv > 0) { g.save(); g.globalAlpha = 0.2; g.translate(x, S.gy + Math.round((S.gy - n.y) * 0.35)); g.scale(1, -0.5); g.drawImage(n.on, 0, 0); g.restore(); }   // smeared in the wet ground
  }
  const cheer = stageCheer();
  g.drawImage(S.crowd[cheer ? 4 + (Math.floor(tick / 6) & 1) : lv ? Math.floor(tick / 9) % 4 : 0], nx, S.crowdY);
  if (S.live) S.live(g, nx, tick, lv, S);
  if (lv > 0) {   // vent steam (alley grates, manholes)
    for (const [vx, vy, n] of S.vents) {
      const x0 = vx + nx; if (x0 < -50 || x0 > W + 50) continue;
      for (let k = 0; k < n; k++) {
        const age = (tick * 0.55 + k * (150 / n)) % 150, f = age / 150, r = 4 + age * 0.12;
        g.globalAlpha = 0.22 * (1 - f) * Math.min(1, age / 12); g.fillStyle = k & 1 ? '#c8cede' : '#a8b0c8';
        const x = x0 + Math.sin(age * 0.05 + k) * 5 + age * (0.22 + WIND.g * 1.1), y = vy - age * 0.6;
        g.fillRect(Math.round(x - r), Math.round(y - r * 0.7), Math.round(r * 2), Math.round(r * 1.4)); g.fillRect(Math.round(x - r * 0.7), Math.round(y - r), Math.round(r * 1.4), Math.round(r * 2));
      }
      g.globalAlpha = 1;
    }
    const cyc = tick % 780;   // a car passes behind camera: its headlights sweep the storefronts and the wet road
    if (S.car && cyc < 200) {
      const dir = (Math.floor(tick / 780) & 1) ? -1 : 1, p = cyc / 200, wxp = dir > 0 ? -200 + p * (NW + 400) : NW + 200 - p * (NW + 400), x = Math.round(wxp + nx);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.8; g.drawImage(BG.head, x - 100, 130); g.drawImage(BG.head, x - 40, 136);
      g.globalAlpha = 0.35; g.drawImage(BG.head, x - 100, 214, 200, 40); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
  }
  for (const l of S.lamps) {
    const x = l.x + nx; if (x < -90 || x > W + 90) continue;
    const a = (l.a || 1) * (l.flick ? l.flick(tick) : 1); if (a <= 0.05) continue;
    if (lv > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.drawImage(BG.glow, x - 80, l.y - 80); if (l.cone) g.drawImage(BG.cone, x - 55, l.y + 4); if (l.pool) { g.globalAlpha = 0.6 * a; g.drawImage(BG.glow, x - 80, l.pool - 80); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    else { g.globalAlpha = 0.5 * a; g.drawImage(BG.glow, x - 80, l.y - 80); g.globalAlpha = 1; }
  }
  planeXform(g, b);
}
function drawSnow(g, tick, near) {
  const lv = QUAL.lv, n = lv === 2 ? 110 : lv === 1 ? 70 : 30;
  if (!near && tick !== WIND.last) {   // wind: a steady drift plus a gust every ~12 s
    const dt = Math.max(0, Math.min(5, tick - WIND.last)); WIND.last = tick;
    WIND.g = Math.pow(Math.max(0, Math.sin(tick * 0.0085)), 10); WIND.off += dt * (0.12 + WIND.g * 2.6);
  }
  const gst = WIND.g, streak = lv > 0 && gst > 0.25 ? Math.round(1 + gst * 4) : 0;
  g.fillStyle = near ? '#eef4ff' : '#9aa8d0';
  for (let i = near ? 0 : 1; i < n; i += 2) {
    const s = BG.snow[i], big = near && s.s > 0.6, sp = near ? s.s : s.s * 0.5;
    const y = (s.y + tick * sp * (0.7 - gst * 0.25)) % H, x = ((s.x + WIND.off * sp + Math.sin((tick + s.y) * 0.02) * 6 - (near ? (G ? G.camX : 0) * ZOOM * 0.3 : 0)) % W + W) % W;
    g.fillRect(x | 0, y | 0, (big ? 2 : 1) + (streak ? (big ? streak : streak >> 1) : 0), big ? 2 : 1);
  }
}

/* ---------- fighters ---------- */
const FLASH = mk(FW * SD, FH * SD);
function fighterVisible(f, tick) {
  const M = moveDef(f);
  if (M && M.tele && f.mf < M.s) return f.mf < 4 ? ((tick >> 1) & 1) : 0;   // DROP IN: vanishes on startup
  if (M && M.warp && f.mf < M.s) return f.mf < 5 ? 1 : f.mf < 9 ? ((tick >> 1) & 1) * 0.7 : 0;   // VANISHING TRICK
  if (M && M.warp && f.mf < M.s + 4) return (tick >> 1) & 1 ? 1 : 0.5;
  if (f.inv > 0 && (tick >> 1) % 2) return 0.6;
  return 1;
}
function drawFighter(g, f, tick, camX) {
  const C = CHARS[f.ch], sx = Math.round((f.x - camX) * SD) / SD, sy = GROUND - Math.round(f.y * SD) / SD, S = sheetFor(f), M = moveDef(f);   // half-pixel positions at 2x density
  const vis = fighterVisible(f, tick), rend = RENDERERS[C.render] || RENDERERS.pixel;
  // contact shadow
  const sk = Math.max(0.35, 1 - f.y / 120), sw = Math.round(C.bodyW * 0.85 * sk) * 2, shh = Math.max(3, Math.round(7 * sk));
  g.globalAlpha = 0.55 + 0.3 * sk; g.drawImage(BG.shadow, sx - sw / 2, GROUND - (shh >> 1) + 1, sw, shh); g.globalAlpha = 1;
  if (M && M.tele && f.mf < M.s) {   // wire-glint swirl where she vanished
    g.fillStyle = '#d0d4dc'; for (let k = 0; k < 6; k++) { const a = tick * 0.3 + k * 1.05, r = 6 + f.mf * 1.2; g.fillRect(sx + Math.cos(a) * r | 0, sy - 40 + Math.sin(a) * r * 1.6 | 0, 2, 1); }
  }
  if (M && M.warp && f.mf < M.s && f.mf > 3) {   // boombox-pink smoke puff where he vanished
    g.fillStyle = (tick >> 2) & 1 ? '#ff6ad8' : '#b8f4ff'; for (let k = 0; k < 8; k++) { const a = k * 0.785 + f.mf * 0.2, r = 4 + f.mf * 1.6; g.fillRect(sx + Math.cos(a) * r | 0, sy - 36 + Math.sin(a) * r * 1.3 | 0, 2, 2); }
  }
  if (!vis) return;
  if (f.buff > 0) drawAura(g, f, sx, sy, tick);
  // afterimages on dashes, rushes and the drop
  const active = M && f.mf >= M.s && f.mf < M.s + M.a;
  const spc = f.mv === 'sp' || f.mv === 'sp2';
  if (M && (M.dash || M.tele || spc) && (active || f.mv === 'dsh' || (spc && f.mf < M.s + M.a)) && QUAL.lv > 0) {
    const n = QUAL.lv === 2 ? 3 : 2;
    for (let k = n; k >= 1; k--) {
      g.globalAlpha = 0.14 * (n + 1 - k); const dx = M.tele ? 0 : Math.abs(f.vx) > 0.5 ? -Math.round(f.vx * 4 * k) : -f.face * 7 * k, dy = M.tele && active ? -12 * k : 0;
      rend(g, f, C, sx + dx, sy + dy, tick);
    }
    g.globalAlpha = 1;
  }
  g.globalAlpha = vis;
  rend(g, f, C, sx, sy, tick, false, QUAL.lv > 0 ? 0.7 : 0);
  g.globalAlpha = 1;
  // white hit-flash while the hit-stop holds
  if (G && G.hitstop > 0 && (f.st === 'hit' || f.st === 'kd') && (G.hitstop & 2) && S && S.lazy) {
    const A = animOf(f, S), [Rw, i] = readyRow(S, A, frameOf(f, A, tick)), fg = FLASH.g; fg.clearRect(0, 0, FLASH.width, FLASH.height);
    fg.globalCompositeOperation = 'source-over'; fg.drawImage(Rw.img, i * Rw.fw, 0, Rw.fw, Rw.fh, 0, 0, Rw.fw, Rw.fh);
    fg.globalCompositeOperation = 'source-in'; fg.fillStyle = '#ffffff'; fg.fillRect(0, 0, Rw.fw, Rw.fh); fg.globalCompositeOperation = 'source-over';
    const sq = squashOf(f) || [1, 1]; g.save(); g.globalAlpha = 0.75; g.translate(sx, sy); g.scale(f.face * sq[0] / SD, sq[1] / SD); g.drawImage(FLASH, 0, 0, Rw.fw, Rw.fh, -Rw.ox, -Rw.oy, Rw.fw, Rw.fh); g.restore();
  }
}
function drawAura(g, f, sx, sy, tick) {   // BINO's power-up: red/orange glow + rising embers
  if (!BG.aura) { BG.aura = mk(90, 130); const gg = BG.aura.g, gr = gg.createRadialGradient(45, 70, 4, 45, 70, 62); gr.addColorStop(0, 'rgba(255,150,40,0.55)'); gr.addColorStop(0.45, 'rgba(255,70,20,0.28)'); gr.addColorStop(1, 'rgba(255,40,10,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 90, 130); }
  const fl = 0.75 + 0.25 * Math.sin(tick * 0.4) * (f.buff < 90 && (tick >> 2) & 1 ? 0.2 : 1);
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = fl; g.drawImage(BG.aura, sx - 45, sy - 110); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  for (let k = 0; k < 6; k++) { const ph = (tick * 1.3 + k * 23) % 70; g.fillStyle = k & 1 ? '#ffb020' : '#ff4a12'; g.fillRect(sx - 16 + ((k * 11 + (tick >> 3)) % 32), sy - 8 - ph, ph < 50 ? 2 : 1, ph < 50 ? 2 : 1); }
}
function star5(g, x, y, r, col) { g.fillStyle = OUT; g.fillRect(x - r - 1, y - 1, 2 * r + 3, 3); g.fillRect(x - 1, y - r - 1, 3, 2 * r + 3); g.fillStyle = col; g.fillRect(x - r, y, 2 * r + 1, 1); g.fillRect(x, y - r, 1, 2 * r + 1); g.fillRect(x - 1, y - 1, 3, 3); }
function headY(f) { const h = hurtBox(f); return GROUND - (h[1] + h[3]); }
function worldBubble(g, x, y, txt, tint) {   // comic speech bubble above a fighter, kept on screen (x, y: fight plane; drawn in screen units)
  const b = g === wx ? RES : 1; screenXform(g, b); x = x * ZOOM; y = GY + (y - GROUND) * ZOOM;
  const lines = wrapTxt(txt, 18), w = Math.max(...lines.map(l => txtW(l, 1))) + 10, h = lines.length * 9 + 6;
  let bx = Math.round(x - w / 2); bx = Math.max(2, Math.min(W - w - 2, bx)); const by = Math.max(46, Math.round(y - h - 8));
  R(g, OUT, bx - 1, by - 1, w + 2, h + 2); R(g, tint || '#f4f0e0', bx, by, w, h);
  const tx = Math.max(bx + 4, Math.min(bx + w - 6, Math.round(x))); R(g, OUT, tx - 1, by + h, 5, 4); R(g, tint || '#f4f0e0', tx, by + h, 3, 3);
  lines.forEach((l, j) => drawTxt(g, l, bx + 5, by + 4 + j * 9, 1, OUT));
  planeXform(g, b);
}
function drawFightFX(g, t, camX) {
  // speech bubbles: DIRTY's catchphrase, BINO's shout
  for (const f of G.f) {
    const M = moveDef(f), x = f.x - camX, y = headY(f);
    let txt = null;
    if (f.mv === 'tnt' && M && M.shout && f.mf < M.s + M.a + 34) txt = M.shout;
    else if (f.ch === 'dirty' && M && (f.mv === 'sp' || f.mv === 'sp2' || f.mv === 'sp3') && f.mf < M.s + M.a + 14) txt = 'NICE NICE NICE!';
    else if (G.steal && G.steal.i === f.i && G.steal.t < 70) txt = 'NICE NICE NICE!';
    else if (f.st === 'win' && G.phase === 'roundEnd' && (f.ch === 'dirty' || f.ch === 'bino') && f.t > 10 && f.t < 200) txt = f.ch === 'dirty' ? 'NICE NICE NICE NICE NICE!' : 'ALL GOD DAMN DAY!';
    if (txt && G.phase !== 'matchEnd') worldBubble(g, x, y, txt, f.mv === 'tnt' ? '#ffe0b0' : null);   // the winner card owns the quote at match end
    if (f.dz > 0) for (let k = 0; k < 3; k++) { const a = t * 0.18 + k * 2.09; star5(g, Math.round(x + Math.cos(a) * 11), Math.round(y - 4 + Math.sin(a) * 3), 2, k & 1 ? '#ffe066' : '#ffffff'); }
  }
  // SMOOCH! burst covers the spot - comic star + lip print, never contact
  if (G.kiss) {
    const k = G.kiss, x = Math.round(k.x - camX), y = GROUND - 54, pop = Math.min(1, k.t / 5) * (1 + 0.08 * Math.sin(k.t * 0.9)), fade = k.t > 44 ? (54 - k.t) / 10 : 1;
    g.globalAlpha = Math.max(0, fade);
    const pts = []; for (let i = 0; i < 24; i++) { const r = (i & 1 ? 20 : 34) * pop; const a = i / 24 * Math.PI * 2 + 0.1; pts.push([x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r]); }
    g.fillStyle = OUT; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0] + 1, p[1] + 1) : g.moveTo(p[0] + 1, p[1] + 1)); g.closePath(); g.fill();
    g.fillStyle = '#fff36a'; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
    g.fillStyle = '#ff9ac0'; g.beginPath(); g.ellipse(x, y, 22 * pop, 14 * pop, 0, 0, 6.3); g.fill();
    g.fillStyle = '#d0103a'; for (const sgn of [-1, 1]) { g.beginPath(); g.ellipse(x + sgn * 5 * pop, y - 3 * pop, 6 * pop, 3.4 * pop, sgn * 0.25, 0, 6.3); g.fill(); }
    g.beginPath(); g.ellipse(x, y + 3 * pop, 9 * pop, 4 * pop, 0, 0, 6.3); g.fill(); g.fillStyle = '#ff6a8a'; g.fillRect(x - 6, y + 1, 4, 1);
    if (k.t > 2) drawText(g, 'SMOOCH!', x, y - 34 * pop - 6, 2, 'red', 'c');
    g.globalAlpha = 1;
  }
  // FIVE-FINGER DISCOUNT: the loot flies over, and flies home when time's up
  if (G.steal) {
    const st = G.steal, th = G.f[st.i], vi = G.f[st.v], vch = vi.ch, icon = st.item === 'cap' && vch === 'dirty' ? 'capw' : st.item;
    let k = -1, from = vi, to = th;
    if (st.t < 16) k = st.t / 16; else if (st.t >= st.T) { k = st.back / 30; from = th; to = vi; }
    if (k >= 0 && k <= 1) {
      const x0 = from.x - camX, y0 = headY(from) + 10, x1 = to.x - camX, y1 = headY(to) + 10;
      const x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 30;
      g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(k * 6.28); itemIcon(g, [0, 0], icon, 1.4); g.restore();
      if (t & 1) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(x - (x1 - x0) * 0.06), Math.round(y), 2, 1); }
    }
  }
}
function drawReflection(g, f, tick, camX) {
  if (!fighterVisible(f, tick)) return;
  const C = CHARS[f.ch], sx = Math.round((f.x - camX) * SD) / SD, ry = GROUND + Math.round(f.y * SD) / SD + 1;
  g.globalAlpha = 0.22; (RENDERERS[C.render] || RENDERERS.pixel)(g, f, C, sx, ry, tick, true); g.globalAlpha = 1;
}
function drawProj(g, p, tick, camX) {
  const x = Math.round((p.x - camX) * SD) / SD, y = GROUND - Math.round(p.y * SD) / SD, art = p.art || (G && G.f[p.o] && CHARS[G.f[p.o].ch].moves.sp.proj && CHARS[G.f[p.o].ch].moves.sp.proj.art) || 'ink';
  const fr = PROJ[art] || PROJ.ink, img = fr[Math.floor(tick / 3) % fr.length], d = Math.sign(p.vx) || 1;
  if (art === 'wave') { if ((tick >> 4) & 1) drawText(g, 'NICE', x - d * 4, y - 24 - ((tick >> 2) & 1), 1, 'cyan', 'c'); g.fillStyle = '#ff6ad8'; for (let k = 1; k < 4; k++) if ((tick + k) & 1) g.fillRect(x - d * (10 + k * 7), y - 6 + k * 3, 2, 2); }
  else if (art === 'ink') { g.fillStyle = '#14324a'; for (let k = 1; k < 5; k++) g.fillRect(x - d * k * 7, y + (k & 1 ? 2 : -2) + ((tick + k) % 3), 4 - (k >> 1), 2); }
  else { g.fillStyle = '#d0d4dc'; for (let k = 1; k < 4; k++) if ((tick + k) & 1) g.fillRect(x - d * k * 8, y - 3 + k * 2, 2, 1); }
  g.save(); g.translate(x, y); g.scale(d, 1); g.drawImage(img, -16, -16, 32, 32); g.restore();
}
function drawSpark(g, s, camX) {
  const fr = SPK[s.k] || SPK.h, img = fr[Math.min(fr.length - 1, s.t >> 1)];
  const dust = s.k === 'd' || s.k === 'D';
  const iw = img.width / SD, ih = img.height / SD;
  g.drawImage(img, Math.round((s.x - camX - iw / 2) * SD) / SD, Math.round((GROUND - s.y - ih / 2 - (dust ? ih * 0.2 : 0)) * SD) / SD, iw, ih);
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
    g.drawImage(c, Math.round(W / 2 - c.ww * z / 2), Math.round(y + 3.5 * sc - c.hh * z / 2), Math.round(c.ww * z), Math.round(c.hh * z));
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
    g.save(); g.translate(i ? W - 6 : 6, 6); g.scale(i ? -1 : 1, 1); g.drawImage(pimg, 0, 0, 30, 30); g.restore();
    const nm = CHARS[f.ch].name, lab = G.mode === 'solo' ? (i ? 'CPU' : '1P') : (i === me ? 'YOU' : (i ? '2P' : '1P'));
    const nw = drawText(g, nm, i ? x + BW : x, y + BH + 5, 1, 'chrome', i ? 'r' : 'l');
    drawText(g, lab, i ? x + BW - nw - 4 : x + nw + 4, y + BH + 5, 1, 'cyan', i ? 'r' : 'l');
    for (let r = 0; r < G.wins[i]; r++) g.drawImage(HUD.v, i ? x + 2 + r * 11 : x + BW - 11 - r * 11, y + BH + 14);
  }
  if (G.combo && G.combo.n >= 2 && G.combo.t < 75 && G.phase !== 'matchEnd') {   // combo counter
    const c = G.combo, pop = c.t < 4 ? 4 : 3, x = c.i ? W - 12 : 12;
    drawText(g, c.n + ' HITS!', x, 64 - (c.t < 4 ? 2 : 0), pop, c.n >= 5 ? 'fire' : 'gold', c.i ? 'r' : 'l');
  }
  if (G.ctr && G.ctr.t < 70) drawText(g, 'COUNTER!', G.ctr.i ? W - 12 : 12, 90, 2, (G.ctr.t >> 2) & 1 ? 'red' : 'flash', G.ctr.i ? 'r' : 'l');
  for (const f of G.f) {   // special-move name callout
    const M = moveDef(f);
    if (M && M.name && (f.mv === 'sp' || f.mv === 'sp2' || f.mv === 'sp3' || f.mv === 'tnt') && f.mf < 40) {
      const sc = f.mf < 3 ? 3 : 2; drawText(g, M.name, f.i ? W - 14 : 14, 108, sc, 'fire', f.i ? 'r' : 'l');
    }
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
      chromeBox(g, 40, 118, 100, 100); g.drawImage(P.win, 42, 120, 96, 96);
      const lines = wrapTxt('"' + winQuote(C) + '"', 26);
      R(g, OUT, 150, 132, 300, 14 + lines.length * 12); R(g, '#f4f0e0', 151, 133, 298, 12 + lines.length * 12); R(g, '#f4f0e0', 144, 150, 7, 6); R(g, OUT, 143, 150, 1, 6);
      lines.forEach((l, j) => drawTxt(g, l, 158, 139 + j * 12, 1, OUT));
      drawText(g, C.title + ' TAKES ' + stageInfo(G.stage).takes, 150, 160 + lines.length * 12, 1, 'gold', 'l');
    }
  }
}
function wrapTxt(s, n) { const out = []; let cur = ''; for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > n) { out.push(cur.trim()); cur = w; } else cur += ' ' + w; } if (cur.trim()) out.push(cur.trim()); return out; }

/* ---------- logo (title screen) ---------- */
const LOGO = {};
function paintLogo(t) {   // chrome logo with a sweeping shine and a flickering bolt
  const el = document.getElementById('logo'); if (!el) return; t = t || 0;
  const g = el.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, el.width, el.height);
  if (!LOGO.a) { LOGO.a = textSprite('THUNDER BAY', 5, 'ice', 2, 1); LOGO.b = textSprite('BRAWL', 12, 'fire', 3, 1); LOGO.s = mk(el.width, el.height); }
  const a = LOGO.a, b = LOGO.b, bob = Math.round(Math.sin(t / 40) * 1.5);
  g.drawImage(a, Math.round((el.width - a.width) / 2), 2);
  g.drawImage(b, Math.round((el.width - b.width) / 2), a.height + 2 + bob);
  const sg = LOGO.s.g, sx = (t * 4) % (el.width + 260) - 130;   // shine: a bright diagonal band clipped to the letters
  sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, el.width, el.height); sg.drawImage(el, 0, 0);
  sg.globalCompositeOperation = 'source-in'; const gr = sg.createLinearGradient(sx - 40, 0, sx + 40, el.height); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); sg.fillStyle = gr; sg.fillRect(0, 0, el.width, el.height);
  g.drawImage(LOGO.s, 0, 0);
  const on = (t % 150) > 8 || (t & 2);
  g.fillStyle = on ? '#fff36a' : '#ffffff'; const bx = el.width - 40, by = a.height + 8 + bob;   // lightning bolt
  for (const [x, y, w] of [[10, 0, 6], [8, 6, 6], [6, 12, 10], [9, 16, 5], [7, 20, 4], [5, 24, 3]]) g.fillRect(bx + x, by + y, w, 4);
  if (!on) { g.fillStyle = 'rgba(255,243,106,0.25)'; g.fillRect(0, 0, el.width, el.height); }
}

/* ---------- attract mode behind the title ---------- */
const ATTRACT = { pair: null, at: -1, stage: 'bay' };
function renderAttract() {
  const cyc = Math.floor(frame / 420);
  if (ATTRACT.at !== cyc) { ATTRACT.at = cyc; ATTRACT.stage = (cyc & 1) && STAGES.alley ? 'alley' : 'bay'; const a = CHAR_IDS[cyc % CHAR_IDS.length], b = CHAR_IDS[(cyc + 1 + (cyc >> 2)) % CHAR_IDS.length]; ATTRACT.pair = [newFighter(a, 0), newFighter(b === a ? CHAR_IDS[(cyc + 2) % CHAR_IDS.length] : b, 1)]; }
  const camX = (STAGE_W - VIEW_W) / 2 + Math.sin(frame / 300) * 140;
  drawStage(wx, camX, frame); screenXform(wx, RES); drawSnow(wx, frame, false); planeXform(wx, RES);
  const [p, q] = ATTRACT.pair, ph = frame % 420;
  p.x = camX + VIEW_W / 2 - 55; q.x = camX + VIEW_W / 2 + 55; p.face = 1; q.face = -1;
  for (const f of [p, q]) { f.st = ph > 300 ? 'win' : (ph >> 6) & 1 ? 'walk' : 'idle'; f.t = ph - 300; f.walkT = frame; }
  if (QUAL.lv > 0) for (const f of [p, q]) drawReflection(wx, f, frame, camX);
  for (const f of [p, q]) drawFighter(wx, f, frame, camX);
  screenXform(wx, RES); drawSnow(wx, frame, true);
}

/* ---------- VS showdown: portraits slide in nose to nose, lightning, then the trash talk ---------- */
function vsBubble(g, txt, x, y, w, right, k) {
  const full = wrapTxt(txt, 30); let left = Math.max(0, Math.floor(k)); const lines = [];
  for (const l of full) { if (left <= 0) break; lines.push(l.slice(0, left)); left -= l.length + 1; }
  if (!lines.length) return;
  const h = full.length * 12 + 8;
  R(g, OUT, x - 2, y - 2, w + 4, h + 4); R(g, '#f4f0e0', x, y, w, h); R(g, '#ffc83a', x, y + h - 2, w, 2);
  const tx = right ? x + w - 34 : x + 30, ty = right ? y - 7 : y + h;
  R(g, OUT, tx - 1, ty - 1, 10, 9); R(g, '#f4f0e0', tx, right ? ty + 1 : ty, 8, 7);
  lines.forEach((l, j) => drawTxt(g, l, x + 6, y + 5 + j * 12, 1, OUT));
}
function drawVS(g, pt) {
  g.imageSmoothingEnabled = false;
  g.fillStyle = 'rgba(5,6,15,0.78)'; g.fillRect(0, 0, W, H);
  const k = Math.min(1, pt / 24), e = 1 - Math.pow(1 - k, 3), hitT = pt - 24;
  const sh = hitT >= 0 && hitT < 14 ? Math.round((Math.random() - 0.5) * (14 - hitT)) : 0;
  // red / blue halves split by a diagonal
  g.fillStyle = 'rgba(160,24,16,0.45)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W / 2 + 30, 0); g.lineTo(W / 2 - 30, H); g.lineTo(0, H); g.fill();
  g.fillStyle = 'rgba(20,60,170,0.45)'; g.beginPath(); g.moveTo(W, 0); g.lineTo(W / 2 + 30, 0); g.lineTo(W / 2 - 30, H); g.lineTo(W, H); g.fill();
  const c1 = G.f[0].ch, c2 = G.f[1].ch, s = 2, pw = 96 * s;
  const lx = Math.round(-pw + (W / 2 - 14) * e) + sh, rx = Math.round(W + pw - (W / 2 - 14) * e) + sh, py = 36 + (sh >> 1);
  g.drawImage(PORTRAITS[c1].big, lx - pw + pw, py, pw, pw);   // left, facing right
  g.save(); g.translate(rx, py); g.scale(-1, 1); g.drawImage(PORTRAITS[c2].big, 0, 0, pw, pw); g.restore();
  if (hitT >= 0) {
    if (hitT < 30 || (pt >> 2) % 5 === 0) {   // lightning between them
      g.strokeStyle = OUT; g.lineWidth = 5; const pts = []; let y = 0, x = W / 2; while (y < H) { pts.push([x, y]); y += 14 + (Math.random() * 12 | 0); x = W / 2 + (Math.random() - 0.5) * 34; }
      for (const [w2, col] of [[5, OUT], [3, '#fff36a'], [1, '#ffffff']]) { g.lineWidth = w2; g.strokeStyle = col; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
    }
    const z = Math.max(1, 2 - hitT * 0.12), vs = textSprite('VS', 9, 'fire', 3);
    g.drawImage(vs, Math.round(W / 2 - vs.ww * z / 2), Math.round(H / 2 - 24 - vs.hh * z / 2), Math.round(vs.ww * z), Math.round(vs.hh * z));
    if (hitT < 5) { g.fillStyle = 'rgba(255,255,255,' + (0.8 * (1 - hitT / 5)).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
  }
  drawText(g, CHARS[c1].name, 12, H - 22, 3, 'chrome', 'l'); drawText(g, CHARS[c2].name, W - 12, H - 22, 3, 'chrome', 'r');
  const bt = banterFor(c1, c2, G.vsLine);
  if (pt > 40) vsBubble(g, bt[0], 10, 8, 250, false, (pt - 40) * 1.6);
  if (pt > 120) vsBubble(g, bt[1], W - 260, 186 - (wrapTxt(bt[1], 30).length - 1) * 12, 250, true, (pt - 120) * 1.6);
  if (pt > 30 && (pt >> 4) & 1) drawText(g, 'TAP TO SKIP', W / 2, H - 10, 1, 'dim', 'c');
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  worldXform();
  if (!G) { warmSheets(5); worldXform(); renderAttract(); ctx.drawImage(wc, 0, 0, 960, 540); if (CRT.on) ctx.drawImage(BG.crt, 0, 0); return; }
  const t = G.tick, camX = G.camX;
  drawStage(wx, camX, t);
  screenXform(wx, RES); drawSnow(wx, t, false); planeXform(wx, RES);
  if (QUAL.lv > 0) for (const f of G.f) drawReflection(wx, f, t, camX);
  if (G.sfz) {   // super-freeze: the street goes dark, a flash blooms behind the attacker
    const a = G.f[G.sfz.i], k = Math.min(1, (G.sfz.t + 1) / 3), sx = (a.x - camX) * ZOOM, sy = GY - a.y * ZOOM;
    screenXform(wx, RES); wx.fillStyle = 'rgba(2,3,12,' + (0.62 * k).toFixed(3) + ')'; wx.fillRect(0, 0, W, H);
    wx.globalCompositeOperation = 'lighter'; wx.globalAlpha = 1 - G.sfz.t / (SFZ_T + 4); wx.drawImage(BG.glow, Math.round(sx) - 180, Math.round(sy) - 225, 360, 360); wx.globalAlpha = 1; wx.globalCompositeOperation = 'source-over';
    planeXform(wx, RES);
  }
  const order = G.f.slice().sort((a, b) => (a.st === 'atk' ? 1 : 0) - (b.st === 'atk' ? 1 : 0));
  for (const f of order) drawFighter(wx, f, t, camX);
  for (const p of G.proj) drawProj(wx, p, t, camX);
  for (const s of G.sparks) drawSpark(wx, s, camX);
  screenXform(wx, RES);
  { const fg = stageOf().fg; wx.drawImage(fg, -Math.round(camX * ZOOM * FG_PAR), H - fg.height); }   // foreground parallax strip (snowbank lip, hydrant cap / slush, pylon tip)
  drawSnow(wx, t, true);
  planeXform(wx, RES);
  if (G.phase !== 'vs') drawFightFX(wx, t, camX);
  if (SHOW_BOXES) drawBoxes(wx);
  screenXform(wx, RES);
  if (G.phase === 'vs') drawVS(wx, G.pt);
  // camera: round-start push-in, KO slow-mo zoom on the loser
  let z = 1, fx = W / 2, fy = H * 0.62;
  if (G.phase === 'intro' && G.pt < 50) { const q = 1 - G.pt / 50; z = 1 + 0.28 * q * q; fx = ((G.f[0].x + G.f[1].x) / 2 - camX) * ZOOM; }
  else if (G.phase === 'roundEnd' && G.koX != null && G.pt < 110) { z = 1 + 0.35 * Math.min(1, G.pt / 14) * (G.pt > 90 ? (110 - G.pt) / 20 : 1); fx = (G.koX - camX) * ZOOM; fy = GY - 50 * ZOOM; }
  const sw = W / z, shh = H / z, cx0 = Math.max(0, Math.min(W - sw, fx - sw / 2)), cy0 = Math.max(0, Math.min(H - shh, fy - shh * 0.6));
  const sh = G.shake, ox = sh ? Math.round((Math.random() - 0.5) * sh * 2) : 0, oy = sh ? Math.round((Math.random() - 0.5) * sh * 2) : 0;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 960, 540);
  ctx.drawImage(wc, cx0 * RES, cy0 * RES, sw * RES, shh * RES, ox * 2 - (sh ? 6 : 0), oy * 2 - (sh ? 6 : 0), 960 + (sh ? 12 : 0), 540 + (sh ? 12 : 0));
  if (G.banner && /K\.O\./.test(G.banner.txt) && G.banner.t < 12) { ctx.fillStyle = 'rgba(255,255,255,' + (0.7 * (1 - G.banner.t / 12)).toFixed(3) + ')'; ctx.fillRect(0, 0, 960, 540); }
  ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.imageSmoothingEnabled = false;
  if (G.phase !== 'vs') drawHUD(ctx); else warmStealSheets();
  if (G.phase !== 'fight' || (G.tick & 1)) warmSheets(G.phase === 'vs' ? 24 : G.phase === 'intro' ? 16 : G.phase === 'fight' ? 1 : 5);   // in a fight: one sprite frame every other screen frame   // finish the 2x sprite rows off the critical path
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (CRT.on) ctx.drawImage(BG.crt, 0, 0);
}

/* ---------- build everything once at load ---------- */
const BUILD_MS = (() => { const t0 = performance.now(); buildFighterArt(); buildStageCommon(); STAGES.bay = buildBay(); STAGES.alley = buildAlley(); buildSparks(); buildProj(); buildHUD(); return Math.round(performance.now() - t0); })();

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
    case 'taunt': tone(700, 300, 0.12, 'square', 0.08); break;
    case 'smooch': tone(1600, 0, 0.05, 0, 0.4, 1); tone(900, 1500, 0.12, 'sine', 0.18); setTimeout(() => tone(1200, 1800, 0.1, 'sine', 0.14), 90); break;
    case 'steal': tone(400, 1400, 0.14, 'triangle', 0.12); setTimeout(() => tone(1400, 1800, 0.08, 'square', 0.06), 120); break;
    case 'matchEnd': tone(523, 523, 0.15, 'square', 0.1); setTimeout(() => tone(784, 784, 0.3, 'square', 0.1), 150); break;
  }
}
let lastEv = 0;
function playEvents() { if (!G) return; for (const e of G.ev) if (e.id > lastEv) { lastEv = e.id; sfx(e.type); } }
</script>
