// node pano.js <stage> -> shots/pano-<stage>.png : the stage drawn at 3 camera positions, stacked
const { chromium } = require('playwright'); const fs = require('fs');
const sid = process.argv[2];
(async () => {
  const b = await chromium.launch(), p = await b.newPage(), errors = [];
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); }); p.on('pageerror', e => errors.push(e.message));
  await p.goto('http://localhost:8090/?q=2'); await p.waitForTimeout(1200);
  const url = await p.evaluate(sid => { const out = mk(W, H * 3); [0, 240, 480].forEach((cx, i) => { const c = mk(W, H); drawStage(c.g, cx, 200 + i * 37, sid, 1); c.g.setTransform(1, 0, 0, 1, 0, 0); out.g.drawImage(c, 0, i * H); }); return out.toDataURL(); }, sid);
  fs.writeFileSync('/workspace/fighter/shots/pano-' + sid + '.png', Buffer.from(url.split(',')[1], 'base64'));
  console.log(sid, 'BUILD_MS', await p.evaluate(() => BUILD_MS), 'errors', JSON.stringify(errors)); await b.close();
})();
