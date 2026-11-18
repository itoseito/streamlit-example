// 使い方: node render.js <index.html> <audio.wav> <out.mp4>   1コマずつ描画してffmpegへ渡す
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const [html, audio, out] = process.argv.slice(2), FPS = 30;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + html);
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => window.TOTAL), frames = Math.round(total * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', audio, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-r', String(FPS),
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => window.renderAt(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
