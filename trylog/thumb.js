// サムネを作る:  node thumb.js 08_first_30_days   → <動画>/thumb.png（1920×1080）。文字と人物は timeline.json の "thumb"
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => { const dir = path.resolve(__dirname, process.argv[2]), th = JSON.parse(fs.readFileSync(path.join(dir, 'timeline.json'))).thumb;
  if ([...th.text].length > 8) throw new Error('サムネの文字は8文字以内に');
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'thumb.html') + '?' + new URLSearchParams(th)); await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300); await p.screenshot({ path: path.join(dir, 'thumb.png') }); await b.close(); console.log(path.join(dir, 'thumb.png')); })();
