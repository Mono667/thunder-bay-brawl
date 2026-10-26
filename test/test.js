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
  await page.goto(BASE + '/'); await W(page, 1200);
  ok('title visible', await page.isVisible('#s-title'));
  await page.screenshot({ path: '../shot-title.png' });
  await page.tap('#btn-howto'); await W(page, 200); ok('controls screen', await page.isVisible('#s-howto'));
  await page.tap('#btn-howto-back'); await W(page, 150);
  await page.tap('#btn-solo'); await W(page, 250); ok('select screen', await page.isVisible('#s-select'));
  await page.tap('#pick-lynx'); await W(page, 100);
  ok('lynx selected', await page.$eval('#pick-lynx', e => e.classList.contains('sel')));
  await page.screenshot({ path: '../shot-select.png' });
  await page.tap('#btn-fight'); await W(page, 300);
  let s = await S(page);
  ok('match started: ' + s.mode + ' ' + s.f.map(f => f.ch).join(' vs '), s.mode === 'solo' && s.f[0].ch === 'lynx' && s.f[1].ch === 'persian');
  ok('ROUND 1 banner', s.banner === 'ROUND 1');
  s = await until(page, x => x.banner === 'FIGHT!', 3000); ok('FIGHT! banner', s.banner === 'FIGHT!');
  s = await until(page, x => x.phase === 'fight', 4000); ok('phase fight', s.phase === 'fight');
  ok('touch controls shown', await page.isVisible('#stick') && await page.isVisible('#b-hp'));
  await page.evaluate(() => FIGHT.cpu(false));
  const t0 = s.timer;
  // walk right with the virtual stick
  const st = await center(page, '#stick');
  await T('touchStart', [{ x: st.x, y: st.y, id: 1 }]);
  for (let i = 1; i <= 6; i++) { await T('touchMove', [{ x: st.x + i * 8, y: st.y, id: 1 }]); await W(page, 30); }
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
  await W(page, 600);
  // crouch attack + special via SP button
  await page.evaluate(() => FIGHT.place(0, FIGHT.G.f[1].x - 40));
  await page.tap('#b-sp'); await W(page, 60);
  s = await S(page); ok('SP button -> special (' + s.f[0].mv + ')', s.f[0].mv === 'sp' || s.stat.specials[0] >= 1);
  await W(page, 1200);
  // blocking: hold BLK, CPU throws heavies
  await page.evaluate(() => { FIGHT.place(0, 360); FIGHT.place(1, 396); });
  await W(page, 300);
  const bl = await center(page, '#b-bl');
  await T('touchStart', [{ x: bl.x, y: bl.y, id: 2 }]); await W(page, 100);
  const hpB = (await S(page)).f[0].hp, blocks0 = (await S(page)).stat.blocks[0];
  let sawBlock = false;
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => FIGHT.press(1, 'hp'));
    for (let k = 0; k < 8; k++) { const q = await S(page); if (q.f[0].st === 'block') sawBlock = true; await W(page, 40); }
    await W(page, 300);
  }
  await T('touchEnd', []);
  s = await S(page);
  const chip = hpB - s.f[0].hp;
  ok('BLK blocks (blocks ' + (s.stat.blocks[0] - blocks0) + ', blockstun seen ' + sawBlock + ')', s.stat.blocks[0] - blocks0 >= 2 && sawBlock);
  ok('chip damage on block (' + chip + ', full hits would be 330)', chip > 0 && chip < 100);
  // hold-back blocking (SF2 style): stick left while facing right
  await T('touchStart', [{ x: st.x - 40, y: st.y, id: 3 }]); await W(page, 80);
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
  s = await until(page, x => x.banner === 'LYNX WINS', 4000); ok('round-winner banner', s.banner === 'LYNX WINS');
  s = await until(page, x => x.round === 2 && x.phase === 'fight', 8000); ok('round 2 starts', s.round === 2 && s.phase === 'fight');
  await page.evaluate(() => FIGHT.cpu(false));
  await ko();
  s = await until(page, x => x.phase === 'matchEnd', 9000);
  ok('match end: YOU WIN (result ' + s.result + ')', s.phase === 'matchEnd' && s.result === 0);
  await until(page, () => false, 1500);
  ok('rematch/menu shown', await page.isVisible('#btn-rematch'));
  await page.screenshot({ path: '../shot-win.png' });
  // pause menu
  await page.tap('#btn-rematch'); await W(page, 2400);
  await page.tap('#b-pause'); await W(page, 200);
  const p1 = (await S(page)).tick; await W(page, 400); const p2 = (await S(page)).tick;
  ok('pause freezes game', await page.isVisible('#s-pause') && p1 === p2);
  await page.tap('#btn-resume'); await W(page, 300); ok('resume', (await S(page)).tick > p2);
  await page.tap('#b-pause'); await W(page, 150); await page.tap('#btn-quit'); await W(page, 200);
  ok('quit to title', await page.isVisible('#s-title'));
  // persian special = projectile via motion input on keyboard
  await page.tap('#btn-solo'); await W(page, 150); await page.tap('#pick-persian'); await page.tap('#btn-fight');
  await until(page, x => x.phase === 'fight', 4000);
  await page.evaluate(() => FIGHT.cpu(false));
  for (const k of ['ArrowDown']) await page.keyboard.down(k); await W(page, 40);
  await page.keyboard.down('ArrowRight'); await W(page, 40); await page.keyboard.up('ArrowDown'); await W(page, 40);
  await page.keyboard.press('KeyJ'); await page.keyboard.up('ArrowRight');
  s = await until(page, x => x.proj > 0, 1500); ok('keyboard down,down-fwd,fwd+J -> DONUT TOSS projectile', s.proj > 0);
  await W(page, 120); await page.screenshot({ path: '../shot-special.png' });
  s = await until(page, x => x.stat.hits[0] + x.stat.blocks[1] > 0, 4000); ok('projectile connects', s.stat.hits[0] > 0 || s.stat.blocks[1] > 0);
  await page.tap('#b-pause'); await W(page, 150); await page.tap('#btn-quit');

  // ---------------- ONLINE (two phones through the server) ----------------
  const A = await mkPage(), B = await mkPage();
  for (const P of [A, B]) { await P.page.goto(BASE + '/'); await W(P.page, 600); await P.page.tap('#btn-online'); await W(P.page, 150); }
  await B.page.tap('#pick-persian');
  for (const P of [A, B]) { await P.page.tap('#btn-fight'); await W(P.page, 150); }
  ok('server field defaults to page host', (await A.page.inputValue('#srv')) === new URL(BASE).host);
  await A.page.tap('#btn-create');
  await A.page.waitForFunction(() => /^[A-Z]{4}$/.test(document.getElementById('bigcode').textContent), null, { timeout: 4000 });
  const code = await A.page.textContent('#bigcode'); ok('room code ' + code, /^[A-Z]{4}$/.test(code));
  await A.page.screenshot({ path: '../shot-online.png' });
  await B.page.fill('#code', code.toLowerCase()); await B.page.tap('#btn-join');
  let sa = await until(A.page, x => x.mode === 'host', 4000); ok('host started match', sa.mode === 'host' && sa.f[1].ch === 'persian');
  let sb = await until(B.page, x => x.mode === 'guest' && x.phase === 'fight', 6000);
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
