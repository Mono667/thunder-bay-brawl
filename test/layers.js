const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto('http://localhost:8090/?q=2'); await p.waitForTimeout(1200);
  for (const sid of ['westfort', 'arthur', 'high', 'bay']) {
    const url = await p.evaluate(sid => { const S = STAGES[sid], f = S.layers[0].img, m = S.layers[1].img, o = mk(660, 400); o.g.fillStyle = '#300'; o.g.fillRect(0, 0, 660, 400); o.g.drawImage(f, 0, 0); o.g.drawImage(m, 0, 200); return o.toDataURL() + '|' + JSON.stringify(S.layers.map(l => [l.img.width, l.img.height, l.y, l.par])) + JSON.stringify(Object.keys(S)); }, sid);
    const [d, info] = url.split('|'); console.log(sid, info);
    fs.writeFileSync('/tmp/st/L-' + sid + '.png', Buffer.from(d.split(',')[1], 'base64'));
  }
  await b.close();
})();
