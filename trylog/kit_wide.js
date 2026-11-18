// 横型（viewBox 960×360）の動画で共通に使う絵の部品。05 以降の art.js から使う（04 は自分の art.js に同じものを持っている）。
const DIM = "#8ea3ad", PANEL = "#16262f", SOFA = "#2f4856", DARK = "#263a47", BLUE = "#7db7ff";
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const box = (x, y, w, h, o = 1, fill = PANEL, stroke = "none", sw = 2.5, rx = 12) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${o}"/>`;
const chip = (x, y, s, o, col = MINT, w = 130) => box(x - w / 2, y, w, 44, o, PANEL, col, 2.5, 22) + txt(x, y + 30, s, o, col, 22);
const ring = (cx, cy, r, p, o = 1, col = MINT, label = "", size = 30) => { const C = 2 * Math.PI * r;
  return `<g opacity="${o}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#22363f" stroke-width="${r * .14}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="${r * .14}" stroke-linecap="round"
    stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - cl(p))}" transform="rotate(-90 ${cx} ${cy})"/>
  ${label ? txt(cx, cy + size * .36, label, 1, INK, size) : ""}</g>`; };
const check = (x, y, o, col = MINT, s = 1) => `<path d="M${x} ${y} l${9 * s} ${10 * s} l${17 * s} -${20 * s}" stroke="${col}" stroke-width="${5 * s}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;
const cross = (x, y, o, col = ORANGE, r = 14) => `<g opacity="${o}" stroke="${col}" stroke-width="5" stroke-linecap="round"><line x1="${x - r}" y1="${y - r}" x2="${x + r}" y2="${y + r}"/><line x1="${x + r}" y1="${y - r}" x2="${x - r}" y2="${y + r}"/></g>`;
const ICON = {
  book: `<path d="M2 9 q10 -6 20 0 q10 -6 20 0 v27 q-10 -6 -20 0 q-10 -6 -20 0z M22 9 v27"/>`,
  note: `<rect x="9" y="4" width="28" height="36" rx="3"/><path d="M16 14 h14 M16 22 h14 M16 30 h8"/>`,
  laptop: `<rect x="7" y="8" width="30" height="21" rx="2.5"/><path d="M2 36 h40 M14 17 h12"/>`,
  shirt: `<path d="M14 6 l-12 8 l6 9 l6 -4 v21 h16 v-21 l6 4 l6 -9 l-12 -8 q-8 6 -16 0z"/>`,
  dumbbell: `<path d="M6 14 v16 M12 10 v24 M32 10 v24 M38 14 v16 M12 22 h20"/>`,
  train: `<rect x="8" y="4" width="28" height="30" rx="6"/><path d="M8 20 h28 M15 28 v.5 M29 28 v.5 M14 34 l-5 7 M30 34 l5 7"/>`,
  play: `<rect x="4" y="8" width="36" height="28" rx="6"/><path d="M18 15 v14 l12 -7z"/>`,
  pen: `<path d="M8 36 l4 -12 l18 -18 l8 8 l-18 18z M26 10 l8 8"/>`,
  chat: `<path d="M5 8 h34 v22 h-18 l-9 8 v-8 h-7z"/>` };
const ico = (n, x, y, col, o = 1, wob = 0, s = 1) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${Math.sin(wob * 3) * 4} 22 22)" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="${o}">${ICON[n]}</g>`;
// 帰宅後の部屋。min=時刻(分), glow=スマホの光, dark=夜の深さ, down=スマホを置く, clock=時計を出すか
function room(lt, { min = 1170, glow = 0, dark = 0, down = 0, clock = 1 } = {}) {
  const hh = Math.floor(min / 60), mm = Math.floor(min % 60), ha = (min / 60 % 12) * 30, ma = (min % 60) * 6, cx = 800, cy = 96;
  const hand = (ang, len, w) => `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(ang * Math.PI / 180) * len}" y2="${cy - Math.cos(ang * Math.PI / 180) * len}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`;
  let s = `<line x1="60" y1="318" x2="900" y2="318" stroke="#22363f" stroke-width="3"/>`;
  s += `<rect x="96" y="44" width="150" height="130" rx="8" fill="${mix("#27507f", "#101d33", dark)}" stroke="#3a5563" stroke-width="5"/>
    <line x1="171" y1="44" x2="171" y2="174" stroke="#3a5563" stroke-width="4"/><circle cx="212" cy="82" r="15" fill="#f6e9b8" opacity="${.25 + dark * .75}"/>`;
  if (clock) s += `<circle cx="${cx}" cy="${cy}" r="46" fill="${PANEL}" stroke="#a9c3cc" stroke-width="4"/>` + hand(ha, 24, 5) + hand(ma, 35, 3.5) + txt(cx, 178, `${hh}:${String(mm).padStart(2, "0")}`, 1, mix(INK, ORANGE, dark), 26);
  s += `<rect x="300" y="170" width="360" height="110" rx="26" fill="${DARK}"/><rect x="280" y="232" width="400" height="70" rx="22" fill="${SOFA}"/>
    <rect x="300" y="296" width="18" height="22" fill="${DARK}"/><rect x="642" y="296" width="18" height="22" fill="${DARK}"/>`;
  const px = lerp(506, 590, down), py = lerp(196, 240, down), tilt = lerp(-14, 90, down), g = glow * (1 - down);
  s += `<circle cx="${px + 10}" cy="${py + 16}" r="${58 + 5 * Math.sin(lt * 3)}" fill="${BLUE}" opacity="${g * .22}"/>`;
  s += `<circle cx="452" cy="150" r="26" fill="#cfe3e6"/><rect x="418" y="182" width="70" height="78" rx="26" fill="#6f8d99"/><rect x="430" y="246" width="110" height="26" rx="13" fill="#587582"/>`;
  s += `<line x1="476" y1="206" x2="${lerp(508, 520, down)}" y2="${lerp(218, 238, down)}" stroke="#6f8d99" stroke-width="15" stroke-linecap="round"/>`;
  return s + `<g transform="rotate(${tilt} ${px + 10} ${py + 17})"><rect x="${px}" y="${py}" width="20" height="34" rx="4" fill="${mix("#0b1820", "#bfe0ff", g)}" stroke="#a9c3cc" stroke-width="2"/></g>`; }
// 全場面に、ただよう光の粒と、絵が少し手前に出てくる動きを付ける。art.js の最後で呼ぶ。
function finishArt() { let seed = 0;
  for (const k in window.ART) { const f = window.ART[k], sd = seed += 17;
    window.ART[k] = (lt, c, d) => { let bg = ""; const sc = .93 + .07 * seg(lt, 0, .5);
      for (let i = 0; i < 14; i++) { const x = (rnd(i + sd) * 960 + lt * (6 + rnd(i + sd + 40) * 10)) % 960, y = 20 + rnd(i + sd + 80) * 320 + Math.sin(lt * .8 + i) * 6;
        bg += `<circle cx="${x}" cy="${y}" r="${1.5 + rnd(i + sd + 9) * 2.5}" fill="${i % 4 ? MINT : ORANGE}" opacity="${.10 + rnd(i + sd + 3) * .14}"/>`; }
      return bg + `<g transform="translate(480 180) scale(${sc}) translate(-480 -180)">${f(lt, c, d)}</g>`; }; } }
