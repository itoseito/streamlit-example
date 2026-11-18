// やる気動画を見た夜（横型・viewBox 960×360）。人物写真は ../cast/（AI生成・架空）。部品は ../kit_wide.js。
const CREAM = "#f6e9b8", NIGHT = "#101d33", HARUTO = "../cast/n1.jpg", MARCO = "../cast/m2.jpg";
let PID = 0;
// 写真のカード。ゆっくり寄る（ケン・バーンズ）。tint=暗くする量, gray=色を抜く量
function photo(src, x, y, w, h, lt, o = 1, { zoom = .05, fy = .15, tint = 0, gray = 0, rx = 16, label = "" } = {}) {
  const id = "p" + (PID++), z = 1 + zoom * cl(lt / 8), iw = w * z * 1.02, ih = iw * 1.86, ix = x + (w - iw) / 2, iy = y - (ih - h) * fy;
  return `<g opacity="${o}"><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/></clipPath>
    <g clip-path="url(#${id})"><image href="${src}" x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMin slice" style="filter:grayscale(${gray})"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0b1820" opacity="${tint}"/></g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#3a5563" stroke-width="3"/>
    ${label ? box(x + 10, y + h - 40, label.length * 17 + 24, 30, 1, "#0b1820cc", "none", 0, 15) + txt(x + 22, y + h - 19, label, 1, INK, 17, "start") : ""}
    ${txt(x + w - 10, y + 22, "AI生成", 1, CREAM, 13, "end")}</g>`; }
const boardBox = (x, y, w, h, o = 1) => box(x, y, w, h, o, "#f3f1ea", "none", 0, 10) + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="#c9c2ad" stroke-width="3" opacity="${o}"/>`;
const ink = (s, x, y, o, size = 24, col = "#22363f", a = "middle") => txt(x, y, s, o, col, size, a);
// マルコの机の図：左に小さくマルコ、右に紙の図
const marcoBoard = (lt, inner, o = 1) => photo(MARCO, 40, 30, 200, 300, lt, o, { label: "マルコ" }) + boardBox(270, 30, 650, 300, o) + inner;
const SL = [["いつ", 80, 230], ["どこで", 330, 230], ["何を", 580, 300]];
function slots(y, vals, on, col = MINT, lt = 0, blink = -1, x0 = 0, sc = 1) { let s = "";
  SL.forEach(([lab, x, w], i) => { const o = on[i], v = vals[i]; x = x0 + x * sc; w *= sc;
    s += txt(x + 6, y - 12, lab, o, col, 20, "start") + box(x, y, w, 64, o, PANEL, v ? col : "#3a5563", v ? 3.5 : 2.5, 14) + txt(x + w / 2, y + 42, v || "", o, INK, 23)
      + (blink === i ? `<rect x="${x + 20}" y="${y + 16}" width="4" height="32" fill="${col}" opacity="${Math.sin(lt * 10) > 0 ? 1 : 0}"/>` : ""); });
  return s; }
const vidCard = (x, y, w, p, o = 1, title = "海外の起業家の動画") => box(x, y, w, w * .56, o, "#12303f", "#3a5563", 2.5, 10) + ico("play", x + w / 2 - 22, y + w * .28 - 22, INK, o * .9)
  + box(x, y + w * .56 + 6, w, 6, o, "#22363f", "none", 0, 3) + box(x, y + w * .56 + 6, w * p, 6, o, ORANGE, "none", 0, 3) + txt(x, y + w * .56 + 34, title, o, DIM, 16, "start");

window.ART = {
  hook(lt, c) { const p = cl(lt / Math.max(c.done, .5)), y = seg(lt, c.yes - .2, .4);
    return photo(HARUTO, 60, 20, 250, 320, lt, 1, { label: "ハルト", tint: .15 }) + vidCard(380, 40, 300, p) + meter(830, .35 + .6 * p, lt)
      + box(380, 270, 300, 56, y, PANEL, ORANGE, 3, 28) + txt(530, 306, "よし、俺も変わる！", y, ORANGE, 24) + txt(530, 22, "23:00", 1, INK, 22); },
  notice(lt, c) { const h = seg(lt, c.h - .2, .4), m = seg(lt, c.m - .2, .4), a = seg(lt, c.ai - .2, .4);
    return photo(HARUTO, 150, 30, 230, 290, lt, h, { label: "ハルト（これからの人）" }) + photo(MARCO, 580, 30, 230, 290, lt, m, { label: "マルコ（先を行く人）" })
      + `<g transform="rotate(-8 480 175)">${box(330, 140, 300, 70, a, "#0b1820ee", CREAM, 4, 12) + txt(480, 186, "AI生成・架空の人物", a, CREAM, 28)}</g>`; },
  then(lt, c) { const n = seg(lt, c.next - .2, .5), s = seg(lt, c.sleep - .2, .5), m = seg(lt, c.morning - .2, .5); let v = "";
    for (let i = 0; i < 3; i++) v += vidCard(370, 30 + i * 70 - n * 60 * (1 - s) + i * 0, 220, i === 0 ? 1 : n * cl((lt - c.next) / 2), (1 - s * .7) * (i ? n : 1), i ? "おすすめ" : "");
    return photo(HARUTO, 60, 20, 250, 320, lt, 1, { label: "ハルト", tint: .15 + m * .4, gray: m * .6 }) + `<g opacity="${1 - m}">${v}</g>`
      + `<g opacity="${s * (1 - m)}"><circle cx="760" cy="120" r="44" fill="${CREAM}"/><circle cx="782" cy="104" r="40" fill="#0b1820"/>${txt(760, 220, "そして寝る", 1, DIM, 22)}</g>`
      + meter(820, lerp(.95, .1, m), lt, m) + txt(560, 200, "翌朝", m, ORANGE, 40); },
  question(lt, c) { const q = seg(lt, c.q - .2, .4), t = seg(lt, c.three - .2, .4), l = seg(lt, c.last - .2, .4); let s = txt(480, 130, "？", q, ORANGE, 120);
    ["①", "②", "③"].forEach((n, i) => { const o = seg(lt, c.three + i * .2, .3); s += box(170 + i * 230, 190, 160, 100, o, PANEL, MINT, 3, 16) + txt(250 + i * 230, 256, n, o, MINT, 40); });
    return s + txt(480, 340, "最後に、今夜使える形にまとめます", l, DIM, 19); },
  marco(lt, c) { const m = seg(lt, c.m - .2, .5), b = seg(lt, c.board - .2, .5), s = seg(lt, c.src - .2, .4);
    return photo(MARCO, 60, 20, 260, 320, lt, m, { label: "マルコ" }) + boardBox(380, 40, 520, 280, b)
      + `<g opacity="${b}"><circle cx="520" cy="140" r="34" fill="none" stroke="#22363f" stroke-width="3"/><circle cx="760" cy="140" r="34" fill="none" stroke="#22363f" stroke-width="3"/><circle cx="640" cy="240" r="34" fill="none" stroke="#22363f" stroke-width="3"/>
        <path d="M558 140 h160 M748 176 l-78 50 M610 226 l-70 -52" stroke="#22363f" stroke-width="3" fill="none" stroke-dasharray="320" stroke-dashoffset="${320 * (1 - cl((lt - c.board) / 1.5))}"/></g>`
      + txt(640, 300, "図の中身：James Clear の記事がもと", s, "#22363f", 18); },
  step1(lt, c) { const a = seg(lt, c.cue - .2, .4), st = seg(lt, c.stack - .2, .4), l = seg(lt, c.link - .3, .5);
    return marcoBoard(lt, ink("①", 310, 80, a, 34, ORANGE, "start") + ink("見終わった瞬間 ＝ 合図", 360, 80, a, 26, "#22363f", "start")
      + box(310, 140, 260, 90, st, "#e4e0d3", "#22363f", 3, 14) + ink("いつもの行動", 440, 194, st, 26) + arrow(585, 185, 585 + 60 * l, 185, l, ORANGE, 5)
      + box(660, 140, 240, 90, l, "#fff", ORANGE, 4, 14) + ink("新しい行動", 780, 194, l, 26, ORANGE) + ink("習慣の積み重ね（habit stacking）", 600, 296, st, 19, "#6b6a63")); },
  ex1(lt, c) { const cl2 = seg(lt, c.close - .2, .4), m = seg(lt, c.memo - .2, .4), l = seg(lt, c.line - .2, .4), b = lt > c.line ? Math.floor((lt - c.line) * 1.4) % 3 : -1;
    return photo(HARUTO, 30, 20, 200, 320, lt, 1, { label: "ハルト" }) + vidCard(270, 30, 200, 1, 1 - cl2 * .6) + cross(370, 86, cl2, ORANGE, 26)
      + arrow(490, 86, 490 + 70 * m, 86, m, ORANGE, 4.5) + box(590, 40, 320, 92, m, "#0f1f27", "#a9c3cc", 3, 18) + ico("note", 606, 64, MINT, m, lt) + txt(760, 98, "メモアプリ", m, INK, 26)
      + slots(230, ["", "", ""], [l, l, l], ORANGE, lt, b, 200, .85); },
  clear(lt, c) { const f = seg(lt, c.fail - .2, .4), x = seg(lt, c.fix - .2, .4);
    return marcoBoard(lt, box(300, 50, 280, 150, f, "#fff", "#b9b3a2", 3, 14) + ink("昼休みに、腕立て", 440, 110, f, 24) + ink("いつ？ どこで？", 440, 156, f, 20, ORANGE) + cross(555, 75, f, ORANGE, 14)
      + box(610, 50, 290, 150, x, "#fff", MINT, 4, 14) + ink("ノートパソコンを閉じたら、", 755, 100, x, 20) + ink("机の横で、腕立て10回", 755, 136, x, 22, "#0f7a6a") + check(735, 168, x, "#0f7a6a", 1.2)
      + ink("著者自身の例（James Clear）", 600, 290, f, 18, "#6b6a63")); },
  step2(lt, c) { const t = seg(lt, c.two - .2, .4), e = seg(lt, c.ex - .2, .4), r = seg(lt, c.rule - .2, .4);
    return marcoBoard(lt, ink("②", 310, 80, t, 34, ORANGE, "start") + ink("最初の2分だけ、その場で", 360, 80, t, 26, "#22363f", "start")
      + `<g transform="translate(0 20)">${ring(420, 180, 62, cl((lt - c.two) / 3), t, ORANGE, "", 0)}</g>` + ink("2分", 420, 212, t, 34, ORANGE)
      + box(540, 130, 330, 54, e, "#fff", "#22363f", 2.5, 27) + ink("資料を開くだけ", 705, 166, e, 22) + box(540, 200, 330, 54, e, "#fff", "#22363f", 2.5, 27) + ink("テキストを1ページ読むだけ", 705, 236, e, 22)
      + ink("2分ルール：始めるのは簡単に", 600, 300, r, 19, "#6b6a63")); },
  trap(lt, c) { const t = seg(lt, c.trap - .2, .4), m = seg(lt, c.tom - .2, .5);
    return photo(HARUTO, 70, 30, 210, 290, lt, 1, { label: "今夜" }) + meter(340, .95, lt) + txt(480, 175, "→", m, DIM, 40)
      + photo(HARUTO, 560, 30, 210, 290, lt, m, { label: "明日の夜", tint: .35, gray: .7 }) + meter(830, .25, lt, m)
      + txt(480, 345, "やる気は、長続きしない（著者）", t, ORANGE, 22); },
  study(lt, c) { const s = seg(lt, c.study - .2, .4), n = seg(lt, c.num - .2, .9), f = seg(lt, c.form - .2, .4);
    const bar = (x, v, col, lab, form) => box(x - 60, 300 - v * 2 * n, 120, v * 2 * n, s, col, "none", 0, 8) + txt(x, 290 - v * 2 * n, `${v === 86 ? "約86" : "約4"}%`, n, col, 30)
      + txt(x, 330, lab, s, INK, 22) + box(x - 130, 30, 260, 60, f, PANEL, col, 2.5, 12) + txt(x, 68, form, f, INK, 18);
    return `<line x1="200" y1="300" x2="760" y2="300" stroke="#3a5563" stroke-width="3" opacity="${s}"/>` + bar(300, 4, DIM, "デンマーク", "提供したい人が ✓ をつける") + bar(660, 86, MINT, "スウェーデン", "したくない人が ✓ をつける")
      + txt(300, 200, "最初の選択肢が、", f, ORANGE, 22) + txt(300, 230, "結果を分けた", f, ORANGE, 22); },
  env(lt, c) { const e = seg(lt, c.env - .2, .4), t = seg(lt, c.three - .2, .4), st = seg(lt, c.steps - .2, .5);
    const stairs = (x, n, col, lab, o) => { let s = ""; for (let i = 0; i < n; i++) s += box(x + i * 34, 280 - (i + 1) * 30, 34, (i + 1) * 30, o, PANEL, col, 2, 4); return s; };
    return marcoBoard(lt, ink("③", 310, 80, t, 34, ORANGE, "start") + ink("明日の環境を、今夜つくる", 360, 80, t, 26, "#22363f", "start")
      + `<g transform="translate(-20 -10)">${stairs(340, lerp(5, 1, st) | 0, "#0f7a6a", "", e)}${stairs(640, lerp(1, 5, st) | 0, ORANGE, "", e)}</g>` + ink("いい行動：手間を減らす", 430, 312, e, 20, "#0f7a6a") + ink("悪い行動：手間を増やす", 740, 312, e, 20, ORANGE)); },
  envex(lt, c) { const a = seg(lt, c.clothes - .2, .35), b = seg(lt, c.remote - .2, .35), d = seg(lt, c.book - .2, .35);
    return marcoBoard(lt, ico("shirt", 320, 90, "#0f7a6a", a, lt, 1.6) + ink("運動着は、前の晩に出す", 410, 130, a, 24, "#22363f", "start")
      + box(320, 180, 70, 40, b, "#d9d4c6", "#22363f", 2, 6) + ink("リモコン → 引き出し", 410, 210, b, 24, "#22363f", "start")
      + ico("book", 322, 240, "#0f7a6a", d, lt, 1.4) + ink("その場所に、本を置く", 410, 282, d, 24, "#22363f", "start")); },
  ex3(lt, c) { const o = seg(lt, c.open - .2, .4), p = seg(lt, c.phone - .2, .5);
    return photo(HARUTO, 30, 20, 200, 320, lt, 1, { label: "ハルト" }) + `<rect x="270" y="60" width="650" height="270" rx="16" fill="${NIGHT}" opacity=".7"/>`
      + box(300, 200, 230, 14, 1, "#3a5563", "none", 0, 4) + box(340, 126, 130, 74, 1, "#22363f", "#a9c3cc", 3, 6) + `<rect x="348" y="134" width="114" height="58" rx="3" fill="${mix("#0b1820", "#1d3d4d", o)}"/>`
      + [0, 1, 2].map(i => `<rect x="358" y="${144 + i * 15}" width="${(i === 2 ? 50 : 90) * o}" height="5" rx="2" fill="${MINT}"/>`).join("") + txt(415, 245, "資料は開いたまま", o, MINT, 20)
      + box(640, 220, 220, 60, 1, "#2f4856", "none", 0, 14) + txt(750, 300, "ベッド", 1, DIM, 16)
      + box(lerp(700, 860, p), 150, 22, 36, 1, "#0b1820", "#a9c3cc", 2, 4) + txt(lerp(711, 871, p), 140, "充電", p, DIM, 14) + arrow(730, 168, 730 + 110 * p, 168, p, ORANGE, 3); },
  sum(lt, c) { let s = "";
    [["a", "① 閉じたら、一文", "note"], ["b", "② その場で、2分", "laptop"], ["c", "③ 明日の環境を整える", "shirt"]].forEach(([k, t, ic], i) => { const o = seg(lt, c[k] - .2, .35), x = 70 + i * 280;
      s += box(x, 70 - (1 - o) * 12, 260, 220, o, PANEL, MINT, 3, 18) + ico(ic, x + 108, 110, MINT, o, lt + i, 1) + txt(x + 130, 215, t, o, INK, 22); });
    return s; },
  honest(lt, c) { let s = "";
    [["ハルトとマルコ", "AI生成・架空", "fic"], ["稼げる・変われる", "保証なし", "no"], ["研究の数字", "著者の記事による紹介", "num"]].forEach(([l, r, k], i) => { const o = seg(lt, c[k] - .2, .35), y = 50 + i * 96;
      s += box(110, y, 740, 72, o, PANEL, "#3a5563", 2.5, 14) + txt(140, y + 46, l, o, INK, 26, "start") + txt(820, y + 46, r, o, ORANGE, 26, "end"); });
    return s; },
  ok(lt, c) { const o = seg(lt, c.ok - .2, .4), t = seg(lt, c.three - .2, .5);
    return box(100, 140, 560, 60, o, PANEL, "#3a5563", 2.5, 12) + txt(380, 180, "やる気動画（10分）", o, DIM, 22) + box(670, 130, 190, 80, t, PANEL, ORANGE, 4, 14) + txt(765, 180, "見たあとの3分", t, ORANGE, 22)
      + check(360, 300, o, MINT, 1.4) + txt(400, 312, "見ること自体は、悪くない", o, INK, 22, "start") + txt(765, 240, "ここが分かれ目（TRY LOGの見立て）", t, DIM, 16); },
  you(lt, c) { const q = seg(lt, c.q - .2, .4), m = seg(lt, c.com - .2, .4), b = Math.floor(lt * 1.2) % 3;
    return slots(110, ["", "", ""], [q, q, q], ORANGE, lt, b) + ico("chat", 440, 230, ORANGE, m, lt, 1.6) + txt(480, 340, "一文だけ、コメントで", m, INK, 22); },
  end(lt, c) { const l = seg(lt, c.line - .3, .5);
    return photo(HARUTO, 120, 40, 200, 280, lt, 1, { label: "ハルト" }) + photo(MARCO, 640, 40, 200, 280, lt, 1, { label: "マルコ" })
      + box(350, 140, 260, 80, l, PANEL, MINT, 4, 16) + txt(480, 192, "閉じたら、一文。", l, MINT, 30); },
};
// やる気メーター（05と同じ形）
function meter(x, lv, lt, o = 1) { const h = 210 * cl(lv), hot = cl((lv - .8) * 5);
  return `<g opacity="${o}">` + txt(x, 44, "やる気", 1, DIM, 20) + box(x - 24, 58, 48, 218, 1, PANEL, "#3a5563", 3, 14)
    + box(x - 20, 272 - h, 40, h, 1, mix(MINT, ORANGE, hot), "none", 0, 10) + txt(x, 310, lv > .93 ? "MAX" : Math.round(lv * 100) + "%", 1, mix(MINT, ORANGE, hot), 24) + `</g>`; }
const _render = window.renderAt; window.renderAt = t => { PID = 0; _render(t); };
finishArt();
