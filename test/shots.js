// screenshots: node shots.js <p1> <cpu> <stage> <tag>  -> shots/<tag>-select|stages|vs|fight.png ; prints console errors
const { chromium, devices } = require('playwright');
const [p1, p2, stage, tag] = process.argv.slice(2), O = '/workspace/fighter/shots/' + tag;
(async () => {
  const browser = await chromium.launch(); const errors = [];
  const ctx = await browser.newContext({ ...devices['iPhone 13 landscape'] }); const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  const W = ms => page.waitForTimeout(ms), S = () => page.evaluate(() => FIGHT.state());
  await page.goto('http://localhost:8090/?q=2&cpu=' + p2); await W(1500);
  await page.tap('#btn-solo'); await W(600); await page.tap('#pick-' + p1); await W(500); await page.screenshot({ path: O + '-select.png' });
  await page.tap('#btn-fight'); await W(100); await page.tap('#stage-' + stage); await W(900); await page.screenshot({ path: O + '-stages.png' });
  await page.tap('#btn-stage-go');
  for (let i = 0; i < 40 && (await S()).phase !== 'vs'; i++) await W(100);
  await W(1400); await page.screenshot({ path: O + '-vs.png' });
  await page.evaluate(() => FIGHT.skipVS());
  for (let i = 0; i < 80 && (await S()).phase !== 'fight'; i++) await W(100);
  await W(2500); await page.screenshot({ path: O + '-fight.png' });
  console.log(tag, (await S()).stage, 'errors', JSON.stringify(errors));
  await browser.close();
})();
