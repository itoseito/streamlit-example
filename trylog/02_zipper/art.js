// ファスナーの絵。lt=場面内の秒, c=合図の秒
const BLUE = "#5aa2f0", METAL = "#7d8a93";
// 全体図：スライダー(ys)より下は閉じ、上は左右に開く
function zipFull(ys, { glass = 0, hl = 0 } = {}) {
  let s = "";
  for (let k = 0; k < 29; k++) { const y = 22 + k * 14, open = Math.max(0, ys - y), dx = Math.min(open * .34, 92), rot = open > 0 ? 16 * Math.min(open / 30, 1) : 0;
    s += `<rect x="${270 - 30 - dx}" y="${y}" width="32" height="8" rx="4" fill="${MINT}" transform="rotate(${-rot} ${270 - 14 - dx} ${y + 4})"/>`
      + `<rect x="${270 - 2 + dx}" y="${y + 7}" width="32" height="8" rx="4" fill="${BLUE}" transform="rotate(${rot} ${270 + 14 + dx} ${y + 11})"/>`; }
  const b = `M${270 - 40} ${ys - 34} H${270 + 40} L${270 + 24} ${ys + 26} H${270 - 24} Z`;
  s += `<path d="${b}" fill="${mix(METAL, "#3a4a54", glass)}" stroke="${mix("#aab6bd", ORANGE, hl)}" stroke-width="${3 + hl * 3}" stroke-linejoin="round" opacity="${1 - glass * .35}"/>`;
  s += `<path d="M${270 - 26} ${ys - 26} L270 ${ys - 2} L${270 + 26} ${ys - 26} M270 ${ys - 2} V${ys + 20}" stroke="#0b1820" stroke-width="13" fill="none" stroke-linecap="round" opacity="${glass}"/>`;
  s += `<rect x="262" y="${ys - 8}" width="16" height="42" rx="8" fill="#dfe7ea" stroke="#22323b" stroke-width="3" opacity="${1 - glass}"/>`;
  return s; }
// 拡大図の歯：棒＋頭（頭がふくらんでいて引っかかる）
const tooth = (x, y, side, col, rot = 0, o = 1) => { const d = side < 0 ? 1 : -1;      // 左の歯は頭が右向き
  return `<g transform="rotate(${rot} ${x} ${y})" opacity="${o}"><rect x="${d > 0 ? x - 34 : x - 8}" y="${y - 6}" width="42" height="12" rx="4" fill="${col}"/><circle cx="${x + d * 10}" cy="${y}" r="9.5" fill="${col}"/></g>`; };
// スライダーの中：Yの字の通り道を歯が流れる（dir=1 閉じる / -1 開く）
function channel(lt, dir, { wedge = 0, tilt = 0, fit = 0 } = {}) {
  let s = `<rect x="140" y="24" width="260" height="402" rx="26" fill="#2a3b45" stroke="#93a5ad" stroke-width="3"/>
    <path d="M186 44 L262 222 V412 M354 44 L278 222 V412" stroke="#0b1820" stroke-width="58" fill="none" stroke-linecap="butt" stroke-linejoin="round"/>
    <path d="M270 96 L246 186 H294 Z" fill="${mix("#2a3b45", ORANGE, wedge)}" stroke="${mix("#93a5ad", ORANGE, wedge)}" stroke-width="3" stroke-linejoin="round"/>`;
  const N = 9;
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i < N; i++) {
    let u = ((i + (side > 0 ? .5 : 0)) / N + dir * lt * .11) % 1; if (u < 0) u += 1;
    const arm = u < .48, k = arm ? u / .48 : (u - .48) / .52;
    const x = arm ? lerp(side < 0 ? 190 : 350, side < 0 ? 252 : 288, k) : (side < 0 ? 252 : 288), y = arm ? lerp(50, 222, k) : lerp(222, 410, k);
    const edge = Math.min(cl(u / .05), cl((1 - u) / .05));
    s += tooth(x, y, side, side < 0 ? MINT : BLUE, arm ? side * -22 * (1 - k * .4) : 0, edge); }
  s += `<rect x="232" y="232" width="76" height="176" rx="10" fill="none" stroke="${MINT}" stroke-width="3" opacity="${fit * .9}"/>`;
  [[-1, 176, 110, 226, 196], [1, 364, 110, 314, 196]].forEach(a => { s += arrow(a[1], a[2], a[3], a[4], tilt * (dir > 0 ? 1 : 0), INK, 3); });
  return s; }
window.ART = {
  hook(lt, c, d) { const ys = lerp(380, 70, seg(lt, c.zip + .2, 2.8)); return zipFull(ys) + arrow(410, 330, 410, 120, .9, MINT, 3); },
  teeth(lt, c) { const a = seg(lt, c.rows - .1, .5), o = seg(lt, c.offset - .15, .4); let s = "";
    for (let k = 0; k < 8; k++) { const y = 60 + k * 46;
      s += tooth(196, y, -1, MINT, 0, .45 + a * .55) + tooth(344, y + 23, 1, BLUE, 0, .45 + a * .55)
        + `<line x1="222" y1="${y}" x2="372" y2="${y}" stroke="${ORANGE}" stroke-width="2" stroke-dasharray="6 6" opacity="${o * (k % 2 ? 0 : .9)}"/>`; }
    return s + txt(100, 240, "左の歯", a, MINT, 20) + txt(442, 240, "右の歯", a, BLUE, 20) + txt(270, 444, "半分ずつ、ずれている", o, ORANGE, 20); },
  slider(lt, c) { const h = seg(lt, c.slider - .15, .4), g = seg(lt, c.y - .2, .7);
    return zipFull(250, { glass: g, hl: h * (1 - g) }) + `<line x1="312" y1="236" x2="372" y2="206" stroke="${ORANGE}" stroke-width="2" opacity="${h}"/>`
      + txt(378, 204, "スライダー", h, ORANGE, 21, "start") + txt(378, 230, "中はＹの字", g, INK, 17, "start"); },
  merge(lt, c) { const t = seg(lt, c.tilt - .2, .5), f = seg(lt, c.fit - .2, .5);
    return channel(lt, 1, { tilt: t * (1 - f), fit: f }) + txt(96, 150, "ななめに", t, INK, 19) + txt(96, 174, "寄せる", t, INK, 19) + txt(452, 320, "交互に", f, MINT, 19) + txt(452, 344, "はまる", f, MINT, 19); },
  lock(lt, c) { const h = seg(lt, c.hook - .2, .5), p = seg(lt, c.pull - .1, .3), sh = p * Math.sin((lt - c.pull) * 22) * Math.exp(-Math.max(0, lt - c.pull) * 2.2) * 5; let s = "";
    for (let k = 0; k < 9; k++) { const y = 40 + k * 46; s += tooth(252 - sh, y, -1, MINT) + tooth(288 + sh, y + 23, 1, BLUE); }
    s += `<rect x="238" y="26" width="64" height="412" rx="12" fill="none" stroke="${ORANGE}" stroke-width="3" opacity="${h * .9}"/>`;
    [150, 240, 330].forEach(y => { s += arrow(200, y, 140 - p * 14, y, p, ORANGE) + arrow(340, y, 400 + p * 14, y, p, ORANGE); });
    return s + txt(452, 100, "頭が", h, ORANGE, 19) + txt(452, 124, "引っかかる", h, ORANGE, 19); },
  open(lt, c) { const w = seg(lt, c.wedge - .2, .4), a = seg(lt, c.apart - .2, .5);
    return channel(lt, -1, { wedge: w }) + `<line x1="296" y1="150" x2="420" y2="120" stroke="${ORANGE}" stroke-width="2" opacity="${w}"/>` + txt(452, 110, "くさび", w, ORANGE, 21)
      + txt(96, 150, "一つずつ", a, INK, 19) + txt(96, 174, "外れる", a, INK, 19); },
  end(lt, c, d) { const ph = (lt / Math.max(d, 1)) * Math.PI * 2; return zipFull(225 + Math.cos(ph) * 150) + arrow(410, 250, 410, 250 + Math.sin(ph) * 90, .9, Math.sin(ph) > 0 ? ORANGE : MINT, 3); },
};
