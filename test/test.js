// Headless phone test: landscape iPhone 13 with touch. Serve the project root first:
//   (cd ../server && PORT=8090 node server.js)   then   node test.js
const { chromium, devices } = require('playwright');
const BASE = 'http://localhost:' + (process.env.PORT || 8090);
(async () => {
  const browser = await chromium.launch();
  let fails = 0; const ok = (n, c) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + n); };
  const errors = [];
  const mkPage = async () => {
    const ctx = await browser.newContext({ ...devices['iPhone 13 landscape'] });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    const cdp = await ctx.newCDPSession(page);
    return { ctx, page, cdp };
  };
  const W = (p, ms) => p.waitForTimeout(ms);
  const S = (p) => p.evaluate(() => FIGHT.state());
  const until = async (p, fn, ms) => { const t0 = Date.now(); let s; while (Date.now() - t0 < ms) { s = await S(p); if (fn(s)) return s; await W(p, 100); } return s; };
  const center = async (p, sel) => { const b = await p.locator(sel).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };

  // ---------------- SOLO ----------------
  const { page, cdp } = await mkPage();
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  await page.goto(BASE + '/?q=2&cpu=aj'); await W(page, 1500);
  ok('title visible', await page.isVisible('#s-title'));
  ok('pixel logo painted', await page.$eval('#logo', c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n > 5000; }));
  ok('fighter art + stage built (' + await page.evaluate(() => BUILD_MS) + ' ms)', await page.evaluate(() => CHAR_IDS.every(c => SHEETS[c] && PORTRAITS[c].big) && !!(STAGES.bay && STAGES.bay.near && STAGES.alley && STAGES.alley.near) && !!SPK.K));
  ok('CRAIG AI sprite sheet loaded (' + await page.evaluate(() => CHARS.craig.sprite.img && CHARS.craig.sprite.img.naturalWidth + 'x' + CHARS.craig.sprite.img.naturalHeight) + ')', await page.evaluate(() => CHARS.craig.render === 'sprite' && !!CHARS.craig.sprite.img && !CHARS.craig.sprite.failed));
  await page.tap('#btn-crt'); await W(page, 100); ok('CRT toggle', (await page.textContent('#btn-crt')).includes('ON'));
  await page.screenshot({ path: '../shot-title-crt.png' });
  await page.tap('#btn-crt'); await W(page, 100);
  await page.screenshot({ path: '../shot-title.png' });
  await page.tap('#btn-howto'); await W(page, 200); ok('controls screen', await page.isVisible('#s-howto'));
  await page.tap('#btn-howto-back'); await W(page, 150);
  await page.tap('#btn-solo'); await W(page, 250); ok('select screen', await page.isVisible('#s-select'));
  ok('select shows all 5 fighters', (await page.$$eval('.card', es => es.map(e => e.id).join(','))) === 'pick-craig,pick-aj,pick-bino,pick-sara,pick-dirty');
  ok('5 cards fit on screen', await page.$$eval('.card', es => es.every(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; })));
  await page.tap('#pick-craig'); await W(page, 300);
  ok('craig selected', await page.$eval('#pick-craig', e => e.classList.contains('sel')));
  await page.screenshot({ path: '../shot-select.png' });
  await page.tap('#btn-fight'); await W(page, 400);
  ok('stage select after character select', await page.isVisible('#s-stage') && !(await S(page)).mode);
  ok('stage cards: BAY, ALLEY, RANDOM', (await page.$$eval('.scard', es => es.map(e => e.id).join(','))) === 'stage-bay,stage-alley,stage-random');
  ok('stage names shown', (await page.textContent('#stages')).includes('BAY STREET') && (await page.textContent('#stages')).includes('MAY STREET ALLEY BAR') && (await page.textContent('#stages')).includes('RANDOM'));
  ok('BAY STREET is the default', await page.$eval('#stage-bay', e => e.classList.contains('sel')));
  ok('stage thumbnails painted', await page.$$eval('.scard canvas', cs => cs.every(c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 60) n++; return n > 3000; })));
  ok('stage cards fit on screen', await page.$$eval('.scard, #btn-stage-go', es => es.every(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; })));
  await page.tap('#stage-alley'); await W(page, 500);
  ok('tap picks a stage', await page.$eval('#stage-alley', e => e.classList.contains('sel')) && !(await page.$eval('#stage-bay', e => e.classList.contains('sel'))));
  await page.screenshot({ path: '../shot-stage-select.png' });
  await page.tap('#btn-stage-back'); await W(page, 150); ok('stage BACK returns to fighters', await page.isVisible('#s-select'));
  await page.tap('#btn-fight'); await W(page, 200); await page.tap('#stage-bay'); await W(page, 100);
  await page.tap('#btn-stage-go'); await W(page, 300);
  let s = await S(page);
  ok('CPU match uses the picked stage (' + s.stage + ')', s.stage === 'bay');
  ok('match started: ' + s.mode + ' ' + s.f.map(f => f.ch).join(' vs '), s.mode === 'solo' && s.f[0].ch === 'craig' && s.f[1].ch === 'aj');
  ok('VS showdown first', s.phase === 'vs');
  ok('VS banter for CRAIG vs AJ: "' + (s.banter || []).join('" / "') + '"', Array.isArray(s.banter) && s.banter.length === 2 && s.banter.every(t => t && t.length > 3));
  await W(page, 450); await page.screenshot({ path: '../shot-vs.png' });
  s = await until(page, x => x.pt >= 150, 4000); await page.screenshot({ path: '../shot-vs-taunt.png' });
  ok('VS taunt + reply shown (pt ' + s.pt + ')', s.phase === 'vs' && s.pt >= 150);
  await page.evaluate(() => { window._ban = new Set(); const f = () => { if (FIGHT.G && FIGHT.G.banner) _ban.add(FIGHT.G.banner.txt); if (_ban.size < 9) requestAnimationFrame(f); }; f(); });
  const tv = Date.now(); await page.tap('#game', { position: { x: 600, y: 120 } });
  s = await until(page, x => x.phase !== 'vs', 1500); ok('tap skips the showdown in ' + (Date.now() - tv) + ' ms (' + s.phase + ')', s.phase === 'intro' || s.phase === 'fight');
  await W(page, 200); await page.screenshot({ path: '../shot-round.png' });
  await until(page, x => x.phase === 'fight', 4000);
  const bans = await page.evaluate(() => [..._ban]);
  ok('ROUND 1 banner', bans.includes('ROUND 1'));
  ok('FIGHT! banner', bans.includes('FIGHT!'));
  s = await until(page, x => x.phase === 'fight', 6000); ok('phase fight', s.phase === 'fight');
  ok('touch controls shown', await page.isVisible('#lzone') && await page.isVisible('#b-hp') && await page.isVisible('#b-pause'));
  ok('stick hidden until touched', await page.$eval('#stick', e => getComputedStyle(e).opacity) === '0');
  await page.evaluate(() => FIGHT.cpu(false));
  const t0 = s.timer;
  // nothing covers the health bars: every control sits below the HUD strip
  ok('controls clear of the health bars', await page.evaluate(() => { const cv = document.getElementById('game').getBoundingClientRect(), hud = cv.top + cv.height * 0.15;
    return [...document.querySelectorAll('.pb')].every(e => e.getBoundingClientRect().top > hud) && document.getElementById('lzone').getBoundingClientRect().top > hud; }));
  ok('buttons in 25-35% resting opacity', await page.$$eval('.pb', es => es.every(e => { const o = +getComputedStyle(e).opacity; return o >= 0.25 && o <= 0.35; })));
  // floating stick: appears wherever the left thumb lands, at several points
  const LZ = await page.locator('#lzone').boundingBox();
  const pts = [[0.2, 0.35], [0.55, 0.7], [0.3, 0.9], [0.85, 0.5]].map(([a, b]) => ({ x: Math.round(LZ.x + LZ.width * a), y: Math.round(LZ.y + LZ.height * b) }));
  for (const [i, q] of pts.entries()) {
    await page.evaluate(() => { FIGHT.place(0, 200); FIGHT.place(1, 600); }); await W(page, 60);
    const x0 = (await S(page)).f[0].x;
    await T('touchStart', [{ x: q.x, y: q.y, id: 10 + i }]); await W(page, 40);
    const at = await center(page, '#stick'), on = await page.$eval('#stick', e => e.classList.contains('on'));
    for (let k = 1; k <= 5; k++) { await T('touchMove', [{ x: q.x + k * 9, y: q.y + (k & 1), id: 10 + i }]); await W(page, 30); }
    await W(page, 300); const x1 = (await S(page)).f[0].x;
    await T('touchEnd', []); await W(page, 80);
    ok('stick at touch point ' + (i + 1) + ' (' + q.x + ',' + q.y + ') walks right ' + x0 + '->' + x1, on && Math.hypot(at.x - q.x, at.y - q.y) < 6 && x1 > x0 + 8);
  }
  ok('stick fades on release', await page.$eval('#stick', e => !e.classList.contains('on')));
  // generous diagonal: 35 deg below horizontal still counts as down-forward (crouch, no walk)
  await page.evaluate(() => { FIGHT.place(0, 200); FIGHT.place(1, 600); }); await W(page, 60);
  await T('touchStart', [{ x: pts[0].x, y: pts[0].y, id: 20 }]); await T('touchMove', [{ x: pts[0].x + 30, y: pts[0].y + 21, id: 20 }]); await W(page, 200);
  s = await S(page); await T('touchEnd', []);
  ok('diagonal down-forward reads as crouch (' + s.f[0].st + ')', s.f[0].st === 'crouch');
  // a miss on the right half (not a button) never grabs the stick
  await W(page, 100); const xr = (await S(page)).f[0].x;
  const vw = await page.evaluate(() => innerWidth), vh = await page.evaluate(() => innerHeight);
  await T('touchStart', [{ x: Math.round(vw * 0.6), y: Math.round(vh * 0.32), id: 21 }]);
  for (let k = 1; k <= 5; k++) { await T('touchMove', [{ x: Math.round(vw * 0.6) - k * 10, y: Math.round(vh * 0.32), id: 21 }]); await W(page, 30); }
  await W(page, 200); s = await S(page);
  const stOn = await page.$eval('#stick', e => e.classList.contains('on')); await T('touchEnd', []);
  ok('right-half miss does not move the stick (x ' + xr + '->' + s.f[0].x + ')', !stOn && Math.abs(s.f[0].x - xr) < 2);
  // multi-touch: hold the stick and tap a button with a second finger
  await page.evaluate(() => { FIGHT.place(0, 200); FIGHT.place(1, 600); }); await W(page, 60);
  const lpB = await center(page, '#b-lp');
  await T('touchStart', [{ x: pts[0].x, y: pts[0].y, id: 30 }]); await T('touchMove', [{ x: pts[0].x + 40, y: pts[0].y, id: 30 }]); await W(page, 150);
  await T('touchStart', [{ x: pts[0].x + 40, y: pts[0].y, id: 30 }, { x: lpB.x, y: lpB.y, id: 31 }]); await W(page, 50);
  const mt = await S(page); const dn = await page.$eval('#b-lp', e => e.classList.contains('dn') && +getComputedStyle(e).opacity > 0.6);
  await T('touchEnd', [{ x: pts[0].x + 40, y: pts[0].y, id: 30 }]); await W(page, 50); await T('touchEnd', []);
  ok('multi-touch: stick + LP together (mv ' + mt.f[0].mv + ', pressed bright ' + dn + ')', mt.f[0].mv === 'lp' && dn);
  await W(page, 400);
  // walk right with the floating stick until close
  await page.evaluate(() => { FIGHT.place(0, 300); FIGHT.place(1, 420); }); await W(page, 60);
  await T('touchStart', [{ x: pts[1].x, y: pts[1].y, id: 1 }]);
  for (let i = 1; i <= 6; i++) { await T('touchMove', [{ x: pts[1].x + i * 8, y: pts[1].y, id: 1 }]); await W(page, 30); }
  s = await until(page, x => Math.abs(x.f[1].x - x.f[0].x) < 44, 6000);
  await T('touchEnd', []);
  ok('stick walks P1 forward (gap ' + Math.abs(s.f[1].x - s.f[0].x) + ')', Math.abs(s.f[1].x - s.f[0].x) < 44);
  // attacks via touch buttons
  const hp0 = (await S(page)).f[1].hp;
  for (const b of ['#b-lp', '#b-hp', '#b-lk', '#b-hk']) { await page.tap(b); await W(page, 420); }
  s = await S(page);
  ok('touch attacks hit (P2 hp ' + hp0 + ' -> ' + s.f[1].hp + ', hits ' + s.stat.hits[0] + ')', s.f[1].hp < hp0 && s.stat.hits[0] >= 2);
  ok('delayed red bar >= hp', s.f[1].red >= s.f[1].hp);
  await page.evaluate(() => FIGHT.place(0, FIGHT.G.f[1].x - 34));
  await page.tap('#b-hp'); await W(page, 115);
  await page.screenshot({ path: '../shot-fight.png' });
  ok('"N HITS!" combo counter tracks hits', (await S(page)).combo >= 1);
  await W(page, 600);
  // crouch attack + special via SP button
  await page.evaluate(() => FIGHT.place(0, FIGHT.G.f[1].x - 40));
  await page.tap('#b-sp'); await W(page, 40);
  s = await S(page); ok('SP button -> special with super-freeze (' + s.f[0].mv + ', sfz ' + s.sfz + ')', (s.f[0].mv === 'sp' || s.stat.specials[0] >= 1) && s.sfz);
  await page.screenshot({ path: '../shot-super.png' });
  await W(page, 1200);
  // blocking: hold BLK, CPU throws heavies
  await page.evaluate(() => { FIGHT.place(0, 360); FIGHT.place(1, 396); });
  await W(page, 300);
  const bl = await center(page, '#b-bl');
  await T('touchStart', [{ x: bl.x, y: bl.y, id: 2 }]); await W(page, 100);
  const hpB = (await S(page)).f[0].hp, blocks0 = (await S(page)).stat.blocks[0];
  let sawBlock = false;
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => { FIGHT.place(1, FIGHT.G.f[0].x + 36); FIGHT.press(1, 'hp'); });   // re-close the gap after block pushback
    for (let k = 0; k < 8; k++) { const q = await S(page); if (q.f[0].st === 'block') sawBlock = true; await W(page, 40); }
    await W(page, 300);
  }
  await T('touchEnd', []);
  s = await S(page);
  const chip = hpB - s.f[0].hp;
  ok('BLK blocks (blocks ' + (s.stat.blocks[0] - blocks0) + ', blockstun seen ' + sawBlock + ')', s.stat.blocks[0] - blocks0 >= 2 && sawBlock);
  ok('chip damage on block (' + chip + ', full hits would be 330)', chip > 0 && chip < 100);
  // hold-back blocking (SF2 style): stick left while facing right
  await T('touchStart', [{ x: pts[1].x, y: pts[1].y, id: 3 }]); await T('touchMove', [{ x: pts[1].x - 40, y: pts[1].y, id: 3 }]); await W(page, 80);
  const b1 = (await S(page)).stat.blocks[0];
  await page.evaluate(() => { FIGHT.place(1, FIGHT.G.f[0].x + 36); FIGHT.press(1, 'lp'); }); await W(page, 400);
  await T('touchEnd', []);
  s = await S(page); ok('holding back blocks', s.stat.blocks[0] > b1);
  // timer runs
  ok('timer counts down (' + t0 + ' -> ' + s.timer + ')', s.timer < t0);
  // CPU fights back
  await page.evaluate(() => FIGHT.cpu(true));
  await W(page, 5000);
  s = await S(page);
  ok('CPU attacks (cpu hits ' + s.stat.hits[1] + ', p1 blocks ' + s.stat.blocks[0] + ')', s.stat.hits[1] + s.stat.blocks[0] > b1);
  await page.evaluate(() => FIGHT.cpu(false));
  await W(page, 800);
  // K.O. : finish the CPU with a touch heavy kick
  const ko = async () => {
    await until(page, x => x.f[0].st === 'idle' || x.f[0].st === 'walk' || x.f[0].st === 'crouch', 3000);
    await page.evaluate(() => { FIGHT.setHp(0, Math.max(FIGHT.G.f[0].hp, 600)); FIGHT.setHp(1, 20); FIGHT.place(0, FIGHT.G.f[1].x - (FIGHT.G.f[1].x > FIGHT.G.f[0].x ? 40 : -40)); });
    await W(page, 50);
    for (let i = 0; i < 6; i++) { await page.tap('#b-hk'); await W(page, 450); const q = await S(page); if (q.phase !== 'fight') break; }
  };
  await ko();
  s = await until(page, x => x.phase === 'roundEnd', 2000);
  ok('K.O. (banner ' + s.banner + ', wins ' + s.wins + ')', s.phase === 'roundEnd' && s.banner === 'K.O.' && s.wins[0] === 1);
  await W(page, 350);
  await page.screenshot({ path: '../shot-ko.png' });
  s = await until(page, x => x.banner === 'CRAIG WINS', 4000); ok('round-winner banner', s.banner === 'CRAIG WINS');
  s = await until(page, x => x.round === 2 && x.phase === 'fight', 8000); ok('round 2 starts', s.round === 2 && s.phase === 'fight');
  await page.evaluate(() => FIGHT.cpu(false));
  await ko();
  s = await until(page, x => x.phase === 'matchEnd', 9000);
  ok('match end: YOU WIN (result ' + s.result + ')', s.phase === 'matchEnd' && s.result === 0);
  await until(page, () => false, 1500);
  ok('rematch/menu shown', await page.isVisible('#btn-rematch'));
  await page.screenshot({ path: '../shot-win.png' });
  // pause menu
  await page.tap('#btn-rematch'); await W(page, 300); await page.evaluate(() => FIGHT.skipVS()); await W(page, 1800);
  await page.tap('#b-pause'); await W(page, 200);
  const p1 = (await S(page)).tick; await W(page, 400); const p2 = (await S(page)).tick;
  ok('pause freezes game', await page.isVisible('#s-pause') && p1 === p2);
  await page.tap('#btn-resume'); await W(page, 300); ok('resume', (await S(page)).tick > p2);
  await page.tap('#b-pause'); await W(page, 150); await page.tap('#btn-quit'); await W(page, 200);
  ok('quit to title', await page.isVisible('#s-title'));
  // CRAIG special = INK SPLASH projectile via motion input on keyboard
  const motion = async (btn) => {
    await page.keyboard.down('ArrowDown'); await W(page, 40);
    await page.keyboard.down('ArrowRight'); await W(page, 40); await page.keyboard.up('ArrowDown'); await W(page, 40);
    await page.keyboard.press(btn); await page.keyboard.up('ArrowRight');
  };
  const solo = async (pk, url, st) => {
    await page.goto(BASE + url); await W(page, 900); await page.tap('#btn-solo'); await W(page, 150); await page.tap('#pick-' + pk); await page.tap('#btn-fight');
    await W(page, 100); await page.tap('#stage-' + (st || 'bay')); await page.tap('#btn-stage-go');
    await until(page, x => x.phase === 'vs', 2000); await page.evaluate(() => FIGHT.skipVS());
    await until(page, x => x.phase === 'fight', 6000); await page.evaluate(() => FIGHT.cpu(false));
  };
  await page.tap('#btn-solo'); await W(page, 150); await page.tap('#pick-craig'); await page.tap('#btn-fight'); await W(page, 100); await page.tap('#btn-stage-go');
  await until(page, x => x.phase === 'vs', 2000); await page.evaluate(() => FIGHT.skipVS());
  await until(page, x => x.phase === 'fight', 6000);
  await page.evaluate(() => FIGHT.cpu(false));
  await motion('KeyJ');
  s = await until(page, x => x.proj > 0, 1500); ok('keyboard down,down-fwd,fwd+J -> INK SPLASH projectile', s.proj > 0);
  await W(page, 120); await page.screenshot({ path: '../shot-special.png' });
  s = await until(page, x => x.stat.hits[0] + x.stat.blocks[1] > 0, 4000); ok('projectile connects', s.stat.hits[0] > 0 || s.stat.blocks[1] > 0);
  // random CPU opponent (no ?cpu=)
  const seen = new Set();
  for (let i = 0; i < 3; i++) { await solo('bino', '/?q=2'); s = await S(page); seen.add(s.f[1].ch); ok('random CPU for BINO: ' + s.f[1].ch, s.f[0].ch === 'bino' && s.f[1].ch !== 'bino' && ['craig', 'aj', 'sara', 'dirty'].includes(s.f[1].ch)); }
  ok('every pair has its own banter', await page.evaluate(() => CHAR_IDS.every(a => CHAR_IDS.every(b => a === b || (BANTER[a + '>' + b] || []).length > 0))));
  // SARA: WIRE TOSS projectile, DROP IN teleport, dash
  await solo('sara', '/?q=2&cpu=bino');
  s = await S(page); ok('SARA vs BINO', s.f[0].ch === 'sara' && s.f[1].ch === 'bino');
  await motion('KeyJ'); s = await until(page, x => x.proj > 0, 1500); ok('SARA WIRE TOSS projectile', s.proj > 0);
  await W(page, 100); await page.screenshot({ path: '../shot-sara-bino.png' });
  await W(page, 1200);
  await page.evaluate(() => { FIGHT.place(0, 300); FIGHT.place(1, 420); });
  await W(page, 300);
  const x0 = (await S(page)).f[0].x;
  await page.keyboard.down('ArrowDown'); await W(page, 50); await page.keyboard.press('KeyO');
  s = await until(page, x => x.f[0].mv === 'sp2', 800); ok('SARA DROP IN starts (SP + down)', s.f[0].mv === 'sp2');
  await page.keyboard.up('ArrowDown');
  await W(page, 230); await page.screenshot({ path: '../shot-dropin.png' });
  s = await until(page, x => x.f[0].mv !== 'sp2', 2500); ok('DROP IN teleports toward BINO (' + x0 + ' -> ' + s.f[0].x + ')', Math.abs(s.f[0].x - s.f[1].x) < Math.abs(x0 - 420));
  await W(page, 800);
  // SARA face sheet: select/win portraits (open bright eyes, toothy smile) + in-fight frames (focused)
  ok('SARA face: open-eye bright portraits', await page.evaluate(() => CHARS.sara && ART.sara.L.bright === 1 && PORTRAITS.sara.big && PORTRAITS.sara.win));
  await page.evaluate(() => {
    const c = document.createElement('canvas'); c.id = 'facesheet'; c.width = innerWidth; c.height = innerHeight; c.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;width:100vw;height:100vh';
    document.body.appendChild(c); const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#141833'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#ffd34d'; g.font = 'bold 14px monospace';
    const P = PORTRAITS.sara, sz = Math.min(170, c.height * 0.44);
    g.drawImage(P.big, 0, 0, P.big.width, P.big.height, 20, 26, sz, sz); g.fillText('SELECT', 20, 20);
    g.drawImage(P.win, 0, 0, P.win.width, P.win.height, 40 + sz, 26, sz, sz); g.fillText('WIN', 40 + sz, 20);
    const sh = SHEETS.sara; let x = 20; const y = 60 + sz, hs = Math.min(120, c.height - y - 10);
    for (const [r, k] of [['idle', 0], ['lp', 1], ['block', 0], ['win', 0]]) { const a = sh.anims[r]; if (!a) continue;
      const Rw = sheetRow(sh, a.row), fx = k * Rw.fw + Rw.ox - 18 * SD, fy = Rw.oy - 70 * SD; g.drawImage(Rw.img, fx, fy, 36 * SD, 36 * SD, x, y, hs, hs); g.fillText(r.toUpperCase(), x, y - 4); x += hs + 16; }
    const d = document.getElementById('game'); g.drawImage(d, 0, 0, d.width, d.height, 80 + sz * 2, 26, c.width - 100 - sz * 2, (c.width - 100 - sz * 2) * d.height / d.width); g.fillText('IN FIGHT', 80 + sz * 2, 20);
  });
  await page.screenshot({ path: '../shot-sara-face.png' });
  await page.evaluate(() => document.getElementById('facesheet').remove());
  // AJ vs SARA and BINO vs CRAIG matchups (screenshots with live combat)
  for (const [a, b, n] of [['aj', 'sara', 'aj-sara'], ['bino', 'craig', 'bino-craig']]) {
    await solo(a, '/?q=2&cpu=' + b);
    await page.evaluate(() => { FIGHT.place(0, FIGHT.G.f[1].x - 42); });
    await W(page, 100); await page.keyboard.press('KeyO'); await W(page, a === 'aj' ? 330 : 380);
    await page.screenshot({ path: '../shot-' + n + '.png' });
    s = await S(page); ok('matchup ' + a.toUpperCase() + ' vs ' + b.toUpperCase(), s.f[0].ch === a && s.f[1].ch === b);
    await W(page, 1000);
  }
  // AJ (big, armored, grab + quake) vs BINO (rushdown, chain spark + flurry)
  ok('AJ is the biggest, slowest, toughest fighter', await page.evaluate(() => ['craig', 'bino', 'sara'].every(c => CHARS.aj.hurt.st[3] > CHARS[c].hurt.st[3] + 10 && CHARS.aj.hp > CHARS[c].hp && CHARS.aj.walk < CHARS[c].walk && CHARS.aj.moves.hk.dmg > CHARS[c].moves.hk.dmg)));
  ok('BINO mid-speed rushdown, SARA fastest, CRAIG balanced', await page.evaluate(() => CHARS.bino.walk > CHARS.craig.walk && CHARS.sara.walk > CHARS.bino.walk && CHARS.bino.chain && CHARS.craig.hp === 1000 && CHARS.bino.hp === 1000));
  ok('select cards show SPEED/POWER/HEALTH bars', await page.evaluate(() => [...document.querySelectorAll('#pick-aj .stat b')].map(b => b.textContent).join(',').startsWith('SPEED,POWER,HEALTH')));
  await solo('aj', '/?q=2&cpu=bino');
  s = await S(page); ok('AJ vs BINO', s.f[0].ch === 'aj' && s.f[1].ch === 'bino');
  await page.evaluate(() => { FIGHT.place(0, 380); FIGHT.place(1, 430); });
  await W(page, 150);
  await page.evaluate(() => FIGHT.press(0, 'hk')); await W(page, 40); await page.evaluate(() => FIGHT.press(1, 'lp'));
  s = await until(page, x => x.f[0].hp < 1200, 700); ok('AJ heavy armor: takes a light hit without flinching (' + s.f[0].st + '/' + s.f[0].mv + ')', s.f[0].hp < 1200 && s.f[0].st === 'atk' && s.f[0].mv === 'hk');
  await W(page, 1500);
  await page.evaluate(() => { FIGHT.setHp(0, 1200); FIGHT.setHp(1, 1000); FIGHT.place(0, 380); FIGHT.place(1, 412); });
  await W(page, 100); await page.keyboard.press('KeyO');
  s = await until(page, x => x.f[1].hp < 1000, 900); ok('BACKYARD SLAM grab connects (' + s.f[1].hp + ')', s.f[1].hp <= 850 && s.f[0].mv === 'sp');
  await W(page, 2200);
  await page.evaluate(() => { FIGHT.setHp(1, 1000); FIGHT.place(0, 300); FIGHT.place(1, 430); });
  await W(page, 200);
  await page.keyboard.down('ArrowDown'); await W(page, 50); await page.keyboard.press('KeyO');
  s = await until(page, x => x.f[0].mv === 'sp2', 800); ok('PATIO QUAKE starts (SP + down)', s.f[0].mv === 'sp2');
  await page.keyboard.up('ArrowDown');
  s = await until(page, x => x.f[1].hp < 1000, 1200); ok('PATIO QUAKE hits a grounded opponent ' + Math.abs(s.f[1].x - s.f[0].x) + 'px away', s.f[1].hp < 1000);
  await W(page, 60); await page.screenshot({ path: '../shot-aj-bino.png' });
  ok('DIRTY: slowest walk, low-mid HP, longest reach, floatiest jump', await page.evaluate(() => { const D = CHARS.dirty;
    return CHAR_IDS.every(c => c === 'dirty' || (D.walk < CHARS[c].walk && D.moves.hp.box[0] + D.moves.hp.box[2] > CHARS[c].moves.hp.box[0] + CHARS[c].moves.hp.box[2])) && D.hp < 1000 && D.hp >= 850; }));
  await W(page, 2200);
  await solo('bino', '/?q=2&cpu=aj');
  const sawProj = page.evaluate(() => new Promise(r => { const t0 = performance.now(); const f = () => { if (FIGHT.G.proj.some(p => p.art === 'chain' || p.o === 0)) r(true); else if (performance.now() - t0 > 2000) r(false); else requestAnimationFrame(f); }; f(); }));
  await motion('KeyJ'); let chainOk = await sawProj;
  if (!chainOk) { await W(page, 1500); const again = page.evaluate(() => new Promise(r => { const t0 = performance.now(); const f = () => { if (FIGHT.G.proj.some(p => p.art === 'chain')) r(true); else if (performance.now() - t0 > 2500) r(false); else requestAnimationFrame(f); }; f(); })); await motion('KeyJ'); chainOk = await again; }
  ok('BINO CHAIN SPARK projectile', chainOk);
  await W(page, 1800);
  await page.evaluate(() => { FIGHT.setHp(1, 1200); FIGHT.place(0, 380); FIGHT.place(1, 422); });
  await W(page, 150); const h0 = (await S(page)).stat.hits[0];
  await page.keyboard.down('ArrowDown'); await W(page, 50); await page.keyboard.press('KeyO');
  s = await until(page, x => x.f[0].mv === 'sp2', 800); ok('BEARD FURY starts', s.f[0].mv === 'sp2');
  await page.keyboard.up('ArrowDown');
  await W(page, 180); await page.screenshot({ path: '../shot-bino-aj.png' });
  s = await until(page, x => x.f[0].mv !== 'sp2', 2000); ok('BEARD FURY multi-hit (' + (s.stat.hits[0] - h0) + ' hits)', s.stat.hits[0] - h0 >= 3);
  await W(page, 900);
  // BINO "KISS MY BUTT" (SP + up): short command grab -> dizzy foe, 8 s +20% aura, SMOOCH burst covers it
  await page.evaluate(() => { FIGHT.setHp(1, 1200); FIGHT.G.f[0].tcd = 0; FIGHT.place(0, 380); FIGHT.place(1, 410); }); await W(page, 120);
  await page.evaluate(() => { FIGHT.hold(0, 'u', true); FIGHT.press(0, 'sp'); }); await W(page, 60); await page.evaluate(() => FIGHT.hold(0, 'u', false));
  s = await until(page, x => x.kiss, 900); await W(page, 90); await page.screenshot({ path: '../shot-kissmybutt.png' });
  s = await until(page, x => x.f[1].dz > 0 && x.f[0].buff > 0, 1500);
  ok('KISS MY BUTT grabs: SMOOCH, dizzy ' + s.f[1].dz + ', aura ' + s.f[0].buff + ', cooldown ' + s.f[0].tcd, s.f[1].dz > 0 && s.f[0].buff > 300 && s.f[0].tcd > 600 && s.f[1].hp < 1200);
  ok('BINO shout + move name', await page.evaluate(() => CHARS.bino.moves.tnt.shout === 'ALL GOD DAMN DAY!' && CHARS.bino.moves.tnt.name === 'KISS MY BUTT' && (CHARS.bino.win || []).concat(CHARS.bino.quotes || []).join('|').includes('ALL GOD DAMN DAY')));
  const dmgA = await page.evaluate(() => dmgMul(FIGHT.G.f[0], FIGHT.G.f[1]));
  ok('aura = +20% damage (x' + dmgA.toFixed(2) + ')', Math.abs(dmgA - 1.2) < 0.01 || dmgA > 1.19);
  await W(page, 1600);
  // whiffed taunt is vulnerable: hit BINO mid-taunt -> COUNTER
  await page.evaluate(() => { FIGHT.G.f[0].tcd = 0; FIGHT.G.f[0].buff = 0; FIGHT.setHp(0, 1000); FIGHT.place(0, 300); FIGHT.place(1, 420); }); await W(page, 200);
  await page.evaluate(() => { FIGHT.hold(0, 'u', true); FIGHT.press(0, 'sp'); }); await W(page, 50); await page.evaluate(() => FIGHT.hold(0, 'u', false));
  await W(page, 240); await page.evaluate(() => { FIGHT.place(1, FIGHT.G.f[0].x + 42); FIGHT.press(1, 'hp'); });
  s = await until(page, x => x.ctr, 1200); ok('whiffed taunt gets COUNTER-hit (hp ' + s.f[0].hp + ')', s.ctr && s.f[0].hp < 1000);
  await W(page, 900);
  // DIRTY: stretchy reach, boombox wave, VANISHING TRICK teleport, FIVE-FINGER DISCOUNT steal
  await solo('dirty', '/?q=2&cpu=sara');
  s = await S(page); ok('DIRTY vs SARA (banter "' + s.banter.join('" / "') + '")', s.f[0].ch === 'dirty' && s.f[1].ch === 'sara');
  await page.evaluate(() => { FIGHT.place(0, 330); FIGHT.place(1, 400); }); await W(page, 100);
  await page.evaluate(() => FIGHT.press(0, 'hp')); await W(page, 140); await page.screenshot({ path: '../shot-dirty.png' });
  s = await until(page, x => x.f[1].hp < 1000, 800); ok('DIRTY stretch punch lands from 70px (SARA hp ' + s.f[1].hp + ')', s.f[1].hp < 1000);
  await W(page, 800);
  await page.evaluate(() => FIGHT.press(0, 'sp')); s = await until(page, x => x.proj > 0, 1200); ok('DIRTY boombox wave projectile', s.proj > 0);
  await W(page, 1600);
  await page.evaluate(() => { FIGHT.place(0, 300); FIGHT.place(1, 400); }); await W(page, 150);
  await page.evaluate(() => { FIGHT.hold(0, 'd', true); FIGHT.press(0, 'sp'); }); await W(page, 60); await page.evaluate(() => FIGHT.hold(0, 'd', false));
  s = await until(page, x => x.f[0].mv === 'sp2', 600); ok('VANISHING TRICK starts (SP + down)', s.f[0].mv === 'sp2');
  s = await until(page, x => x.f[0].mv !== 'sp2', 2000); ok('teleports behind SARA (x 300 -> ' + s.f[0].x + ', SARA ' + s.f[1].x + ')', s.f[0].x > s.f[1].x);
  await W(page, 900);
  await page.evaluate(() => { FIGHT.place(0, 360); FIGHT.place(1, 392); }); await W(page, 200);
  await page.evaluate(() => { FIGHT.hold(0, 'r', true); FIGHT.press(0, 'sp'); }); await W(page, 60); await page.evaluate(() => FIGHT.hold(0, 'r', false));
  s = await until(page, x => x.steal && x.steal.item, 1200);
  ok('FIVE-FINGER DISCOUNT steals SARA\'s ' + (s.steal && s.steal.item), !!(s.steal && s.steal.item && s.steal.i === 0 && s.steal.v === 1));
  await W(page, 500); await page.screenshot({ path: '../shot-steal.png' });
  s = await until(page, x => !x.steal, 9000); ok('stolen item flies back after ~6 s', !s.steal);
  await W(page, 600);
  ok('quality level stays 2 with ?q=2', (await S(page)).q === 2);
  await page.tap('#b-pause'); await W(page, 150); await page.tap('#btn-quit');
  // MAY STREET ALLEY BAR: second stage, live fight screenshot, patrons cheer on KO, no bubble over the win card
  await solo('dirty', '/?q=2&cpu=bino', 'alley');
  s = await S(page); ok('MAY STREET ALLEY BAR picked (stage ' + s.stage + ')', s.stage === 'alley' && s.f[0].ch === 'dirty');
  ok('alley layers built (sky/far/mid/near/crowd/fg, neon sign, 3 lamps)', await page.evaluate(() => { const A = STAGES.alley; return A.sky && A.far && A.mid && A.near && A.crowd.length === 6 && A.fg && A.neon[0].txt === 'THE MAY ST. TAVERN' && A.neon[0].on && A.lamps.length === 3; }));
  ok('stage registry: BAY STREET still stage 1', await page.evaluate(() => STAGE_INFO[0].id === 'bay' && STAGE_INFO[1].name === 'MAY STREET ALLEY BAR'));
  await page.evaluate(() => { FIGHT.place(0, 370); FIGHT.place(1, 420); }); await W(page, 120);
  await page.evaluate(() => FIGHT.press(0, 'hp')); await W(page, 150);
  await page.screenshot({ path: '../shot-alleybar.png' });
  s = await until(page, x => x.f[1].hp < 1000, 900); ok('combat on the alley stage (BINO hp ' + s.f[1].hp + ')', s.f[1].hp < 1000);
  await page.evaluate(() => { window._wb = { me: 0, n: 0 }; const o = worldBubble; window.worldBubble = function () { _wb.n++; if (FIGHT.G.phase === 'matchEnd') _wb.me++; return o.apply(this, arguments); }; });
  await W(page, 900);
  for (let r = 0; r < 2; r++) { await ko(); await until(page, x => x.phase === 'fight' || x.phase === 'matchEnd', 9000); if ((await S(page)).phase === 'matchEnd') break; await page.evaluate(() => FIGHT.cpu(false)); }
  s = await until(page, x => x.phase === 'matchEnd' && x.pt > 120, 9000);
  ok('DIRTY wins on the alley (result ' + s.result + ')', s.phase === 'matchEnd' && s.result === 0);
  const wb = await page.evaluate(() => _wb);
  ok('win bubble shown in-round (' + wb.n + ') but never over the win card (' + wb.me + ')', wb.n > 0 && wb.me === 0);
  await page.screenshot({ path: '../shot-alley-win.png' });
  // RANDOM resolves to a real stage
  for (let i = 0; i < 2; i++) { await solo('craig', '/?q=2&cpu=aj', 'random'); s = await S(page); ok('RANDOM stage -> ' + s.stage, ['bay', 'alley'].includes(s.stage)); }
  await page.tap('#b-pause'); await W(page, 150); await page.tap('#btn-quit');

  // CRAIG's PNG sheet is what's drawn in a fight; if the PNG can't load he falls back to the code-drawn art
  await solo('craig', '/?q=2&cpu=bino');
  await page.evaluate(() => { window._spr = { s: 0, p: 0 }; const o = drawFromSheet; window.drawFromSheet = function (g, f, S) { if (f.ch === 'craig') S === CHARS.craig.sprite ? _spr.s++ : _spr.p++; return o.apply(this, arguments); }; });
  await page.evaluate(() => { FIGHT.place(0, 360); FIGHT.place(1, 400); }); await W(page, 300);
  for (const m of ['hp', 'hk', 'sp']) { await page.evaluate(n => FIGHT.press(0, n), m); await W(page, 700); }
  let spr = await page.evaluate(() => _spr); ok('CRAIG drawn from the sprite sheet in a fight (' + spr.s + ' sprite / ' + spr.p + ' code-drawn draws)', spr.s > 30 && spr.p === 0);
  s = await S(page); ok('CRAIG still hits with the sprite art (BINO hp ' + s.f[1].hp + ')', s.f[1].hp < 1000);
  await page.tap('#b-pause'); await W(page, 150); await page.tap('#btn-quit');
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13 landscape'] }), fp = await ctx.newPage(), perr = [];
    fp.on('pageerror', e => perr.push(e.message));
    await ctx.route('**/art/craig.png*', r => r.abort());
    await fp.goto(BASE + '/?q=2&cpu=bino'); await W(fp, 1200);
    await fp.tap('#btn-solo'); await W(fp, 150); await fp.tap('#pick-craig'); await fp.tap('#btn-fight'); await W(fp, 100); await fp.tap('#btn-stage-go');
    await until(fp, x => x.phase === 'vs', 2000); await fp.evaluate(() => FIGHT.skipVS()); await until(fp, x => x.phase === 'fight', 6000);
    await fp.evaluate(() => { window._spr = 0; const o = drawFromSheet; window.drawFromSheet = function (g, f, S) { if (f.ch === 'craig' && S === SHEETS.craig) _spr++; return o.apply(this, arguments); }; });
    await W(fp, 600);
    const fb = await fp.evaluate(() => ({ failed: !!CHARS.craig.sprite.failed, img: !!CHARS.craig.sprite.img, n: _spr }));
    ok('sprite PNG blocked -> CRAIG falls back to the code-drawn art (' + fb.n + ' draws, no page errors)', fb.failed && !fb.img && fb.n > 10 && perr.length === 0);
    await fp.screenshot({ path: '../shot-craig-fallback.png' });
    await ctx.close();
  }

  // ---------------- ONLINE (two phones through the server) ----------------
  const A = await mkPage(), B = await mkPage();
  for (const P of [A, B]) { await P.page.goto(BASE + '/?q=2'); await W(P.page, 900); await P.page.tap('#btn-online'); await W(P.page, 150); }
  ok('online select shows all 5', (await B.page.$$eval('.card', es => es.length)) === 5);
  await A.page.tap('#pick-dirty'); await B.page.tap('#pick-bino');
  for (const P of [A, B]) { await P.page.tap('#btn-fight'); await W(P.page, 200); }
  ok('online: stage select shows the host note', (await A.page.textContent('#stage-note')).includes('host'));
  await A.page.tap('#stage-alley'); await B.page.tap('#stage-bay');   // guest's own pick must be ignored
  for (const P of [A, B]) { await P.page.tap('#btn-stage-go'); await W(P.page, 150); }
  ok('server field defaults to page host', (await A.page.inputValue('#srv')) === new URL(BASE).host);
  await A.page.tap('#btn-create');
  await A.page.waitForFunction(() => /^[A-Z]{4}$/.test(document.getElementById('bigcode').textContent), null, { timeout: 4000 });
  const code = await A.page.textContent('#bigcode'); ok('room code ' + code, /^[A-Z]{4}$/.test(code));
  await A.page.screenshot({ path: '../shot-online.png' });
  await B.page.fill('#code', code.toLowerCase()); await B.page.tap('#btn-join');
  let sa = await until(A.page, x => x.mode === 'host', 4000); ok('host started match', sa.mode === 'host' && sa.f[0].ch === 'dirty' && sa.f[1].ch === 'bino');
  let sb = await until(B.page, x => x.mode === 'guest' && x.phase === 'vs' && x.pt > 20, 4000);
  sa = await S(A.page);
  ok('guest sees the host\'s VS line ("' + (sb.banter || []).join('" / "') + '")', sb.phase === 'vs' && sb.vsLine === sa.vsLine && JSON.stringify(sb.banter) === JSON.stringify(sa.banter));
  ok('guest gets the host\'s stage (host ' + sa.stage + ', guest ' + sb.stage + ')', sa.stage === 'alley' && sb.stage === 'alley');
  sb = await until(B.page, x => x.mode === 'guest' && x.phase === 'fight', 9000);
  ok('guest receives state (' + sb.snaps + ' snaps, me=' + sb.me + ')', sb.mode === 'guest' && sb.me === 1 && sb.snaps > 20);
  await A.page.evaluate(() => { FIGHT.place(0, 380); FIGHT.place(1, 416); });
  await W(A.page, 200);
  const hpA = (await S(A.page)).f[0].hp;
  for (const b of ['#b-lp', '#b-hp', '#b-hk']) { await B.page.tap(b); await W(B.page, 450); }
  sa = await S(A.page);
  ok('guest touch attacks hit the host (P1 hp ' + hpA + ' -> ' + sa.f[0].hp + ')', sa.f[0].hp < hpA && sa.stat.hits[1] > 0);
  sb = await S(B.page); ok('guest sees the damage', sb.f[0].hp < hpA);
  await B.page.screenshot({ path: '../shot-online-guest.png' });
  await B.page.tap('#b-pause'); await W(B.page, 150); await B.page.tap('#btn-quit'); await W(A.page, 600);
  ok('host notified when guest leaves', await A.page.isVisible('#s-online'));

  ok('zero console errors/warnings' + (errors.length ? ': ' + errors.join(' | ') : ''), errors.length === 0);
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  await browser.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
