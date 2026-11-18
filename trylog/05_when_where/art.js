// 「いつ・どこで」の絵（横型・viewBox 960×360）。部品は ../kit_wide.js。lt=場面内の秒, c=合図の秒
// やる気メーター。lv=0〜1
const meter = (x, lv, lt, o = 1) => { const h = 210 * cl(lv), hot = cl((lv - .8) * 5);
  return `<g opacity="${o}">` + txt(x, 44, "やる気", 1, DIM, 20) + box(x - 24, 58, 48, 218, 1, PANEL, "#3a5563", 3, 14)
    + box(x - 20, 272 - h, 40, h, 1, mix(MINT, ORANGE, hot), "none", 0, 10) + txt(x, 310, lv > .93 ? "MAX" : Math.round(lv * 100) + "%", 1, mix(MINT, ORANGE, hot), 24)
    + (hot > 0 ? [0, 1, 2, 3].map(i => `<circle cx="${x + Math.cos(lt * 4 + i * 1.6) * 44}" cy="${90 + Math.sin(lt * 4 + i * 1.6) * 30}" r="4" fill="${ORANGE}" opacity="${hot * .8}"/>`).join("") : "") + `</g>`; };
const person = (x, y, s = 1, col = "#6f8d99", o = 1) => `<g opacity="${o}"><circle cx="${x}" cy="${y - 20 * s}" r="${7 * s}" fill="#cfe3e6"/><rect x="${x - 7 * s}" y="${y - 11 * s}" width="${14 * s}" height="${18 * s}" rx="${6 * s}" fill="${col}"/></g>`;
// 3つのグループのカード。on=[1つ目,2つ目,3つ目] の出方, hi=3つ目の強調
const GX = [170, 480, 790], GC = [DIM, ORANGE, MINT];
function groups(lt, on, rows) { let s = "";
  GX.forEach((x, i) => { const o = on[i]; s += box(x - 130, 30 + (1 - o) * 14, 260, 300, o, PANEL, GC[i], 3, 18) + `<circle cx="${x}" cy="74" r="26" fill="${GC[i]}" opacity="${o}"/>` + txt(x, 85, i + 1, o, "#0b1820", 30);
    rows[i].forEach(([t, k, col], j) => { s += check(x - 104, 150 + j * 54, o * k, col || GC[i]) + txt(x - 66, 162 + j * 54, t, o * k, INK, 21, "start"); }); });
  return s; }
// 棒グラフ。v=[%,%,%] それぞれの伸び具合 k
const BARY = 306, PX = 2.5;
function bars(lt, k, { hl = 0, dim3 = 0, tag = 1 } = {}) { let s = `<line x1="90" y1="${BARY}" x2="870" y2="${BARY}" stroke="#3a5563" stroke-width="3"/>`;
  [36.5, 36.5, 91].forEach((v, i) => { const x = GX[i], h = v * PX * k[i], o = i === 2 ? 1 - dim3 * .65 : 1;
    s += box(x - 60, BARY - h, 120, h, o, GC[i], "none", 0, 8) + txt(x, 338, ["1つ目：記録だけ", "2つ目：＋やる気", "3つ目：＋一文"][i], o * tag, GC[i], 19)
      + txt(x, BARY - h - 14, i === 2 ? Math.round(91 * k[2]) + "%" : "35〜38%", o * cl(k[i] * 2), i === 2 ? MINT : INK, i === 2 ? 46 : 28); });
  if (hl > 0) s += box(70, 150, 580, 200, hl, "none", ORANGE, 4, 18) + txt(325, 140, "やる気を高めても、ほぼ同じ", hl, ORANGE, 23);
  return s; }
// 「いつ・どこで・何を」の3つの枠
const SL = [["いつ", 80, 230], ["どこで", 330, 230], ["何を", 580, 300]];
function slots(y, vals, on, col = MINT, lt = 0, blink = -1) { let s = "";
  SL.forEach(([lab, x, w], i) => { const o = on[i], v = vals[i];
    s += txt(x + 6, y - 12, lab, o, col, 20, "start") + box(x, y, w, 72, o, PANEL, v ? col : "#3a5563", v ? 3.5 : 2.5, 14) + txt(x + w / 2, y + 46, v || "", o, INK, 25)
      + (blink === i ? `<rect x="${x + 22}" y="${y + 18}" width="4" height="36" fill="${col}" opacity="${Math.sin(lt * 10) > 0 ? 1 : 0}"/>` : ""); });
  return s; }
const train = (lt, k) => { const ox = (1 - k) * -700; let s = `<line x1="40" y1="286" x2="920" y2="286" stroke="#3a5563" stroke-width="4"/>` + box(60 + ox, 110, 620, 160, 1, DARK, "#a9c3cc", 4, 22);
  for (let i = 0; i < 5; i++) { const x = 92 + i * 116 + ox; s += box(x, 138, 92, 70, 1, "#12303f", "#3a5563", 2, 8) + person(x + 46, 204, 2.1, i === 2 ? "#6f8d99" : "#3a5563", i === 2 ? 1 : .55); }
  return s + [150, 590].map(x => `<circle cx="${x + ox}" cy="276" r="14" fill="#0b1820" stroke="#a9c3cc" stroke-width="4"/>`).join("") + txt(370 + ox, 244, "いつもの電車", 1, DIM, 20); };

window.ART = {
  hook(lt, c) { const lv = .25 + .45 * seg(lt, c.up - .2, 1.6) + .3 * seg(lt, c.max - .2, .5), m = seg(lt, c.max - .1, .3);
    return room(lt, { min: 1380, glow: 1, dark: 1, clock: 0 }) + meter(800, lv, lt)
      + box(520, 92 - m * 6, 150, 50, m, PANEL, ORANGE, 3, 25) + txt(595, 126 - m * 6, "明日から！", m, ORANGE, 23); },
  morning(lt, c) { const k = seg(lt, c.train - .5, .9), d = seg(lt, c.drop - .1, .9);
    return train(lt, k) + meter(800, lerp(1, .06, d), lt) + txt(120, 70, "7:30", 1, INK, 44) + txt(800, 26, "↓", d * (1 - seg(lt, c.drop + 1.2, .4)), ORANGE, 26); },
  lack(lt, c) { const n = seg(lt, c.no - .2, .4), l = seg(lt, c.line - .2, .5), e = seg(lt, c.last - .2, .4);
    return chip(210, 136, "やる気", 1 - n * .55, mix(ORANGE, DIM, n), 200) + `<line x1="124" y1="158" x2="${124 + 172 * n}" y2="158" stroke="${ORANGE}" stroke-width="4" stroke-linecap="round" opacity="${n}"/>`
      + txt(210, 218, "じゃなくて", n, DIM, 21) + arrow(350, 158, 350 + 90 * l, 158, l, MINT, 4)
      + box(480, 110, 400, 96, l, PANEL, MINT, 3.5, 16) + [0, 1, 2].map(i => `<rect x="${510 + i * 118}" y="170" width="${98 * l}" height="5" rx="2" fill="${MINT}" opacity="${l * (.5 + .5 * Math.sin(lt * 5 + i))}"/>`).join("")
      + txt(680, 152, "たった一文", l, MINT, 30) + ring(680, 280, 34, cl((lt - c.last) / 1.5), e, ORANGE, "30秒", 19); },
  source(lt, c) { const a = seg(lt, c.name - .2, .4), d = seg(lt, c.study - .2, .4);
    return box(130, 28, 700, 304, 1, PANEL, "#22363f", 2.5, 18) + `<rect x="130" y="56" width="7" height="${78 * a}" fill="${MINT}"/>`
      + txt(170, 92, "James Clear", a, INK, 40, "start") + txt(170, 128, "ジェームズ・クリアー", a, DIM, 21, "start")
      + txt(170, 184, "“Achieve Your Goals: Research Reveals a Simple Trick", a, MINT, 19, "start") + txt(170, 210, "That Doubles Your Chances for Success”", a, MINT, 19, "start") + txt(170, 238, "jamesclear.com 掲載の記事", a, DIM, 17, "start")
      + txt(170, 290, "記事で紹介されている研究：2001年・イギリス・248人", d, BLUE, 22, "start") + txt(170, 316, "（研究の内容は、著者の紹介による）", d, DIM, 17, "start"); },
  people(lt, c) { const a = seg(lt, c.all - .2, .4), k = seg(lt, c.split - .1, .8); let s = "";
    for (let i = 0; i < 36; i++) { const g = i % 3, j = Math.floor(i / 3), x0 = 300 + (i % 12) * 32, y0 = 120 + Math.floor(i / 12) * 62, x1 = GX[g] - 72 + (j % 4) * 48, y1 = 130 + Math.floor(j / 4) * 62;
      s += person(lerp(x0, x1, k), lerp(y0, y1, k) + Math.sin(lt * 3 + i) * 2, 1.5, mix("#6f8d99", GC[g], k), a); }
    return s + txt(480, 60, "248人", a * (1 - k), INK, 44) + GX.map((x, i) => txt(x, 70, `グループ${i + 1}`, k, GC[i], 24)).join("") + txt(480, 344, "2週間", a, DIM, 24); },
  g12(lt, c) { const a = seg(lt, c.a - .2, .4), b = seg(lt, c.b - .2, .4), b2 = seg(lt, c.b2 - .2, .4);
    return groups(lt, [a, b, 0], [[["運動を記録", 1]], [["運動を記録", 1], ["メリットを学ぶ", b2], ["→ やる気UP", b2]], []]); },
  g3(lt, c) { const k = seg(lt, c.c - .2, .4), s1 = seg(lt, c.s1 - .15, .3), s2 = seg(lt, c.s2 - .15, .3), s3 = seg(lt, c.s3 - .15, .3);
    return groups(lt, [1 - k * .6, 1 - k * .6, k], [[["運動を記録", 1]], [["運動を記録", 1], ["メリットを学ぶ", 1], ["→ やる気UP", 1]], [["2つ目と同じ説明", 1], ["一文を書く", 1]]])
      + [["何曜日", s1], ["何時に", s2], ["どこで", s3]].map(([t, o], i) => chip(710 + i * 80, 262, t, o, MINT, 74).replace(/font-size="22"/, 'font-size="17"')).join(""); },
  res12(lt, c) { const k = seg(lt, c.bars - .2, .9); return bars(lt, [k, k, 0]) + txt(480, 40, "週に1回以上、運動した人の割合", 1, DIM, 21); },
  res3(lt, c) { const k = seg(lt, c.bar - .1, .9); return bars(lt, [1, 1, k]) + txt(480, 40, "週に1回以上、運動した人の割合", 1, DIM, 21) + txt(640, 150, "倍以上", seg(lt, c.bar + .9, .3), MINT, 26); },
  twist(lt, c) { const h = seg(lt, c.hl - .1, .4); return bars(lt, [1, 1, 1], { hl: h, dim3: h }); },
  alike(lt, c) { const v = seg(lt, c.video - .2, .5), n = seg(lt, c.note - .2, .4);
    return box(80, 70, 330, 190, 1, PANEL, ORANGE, 3, 18) + txt(245, 112, "研究の2つ目", 1, ORANGE, 21) + ico("book", 223, 132, ORANGE, 1, lt) + txt(245, 222, "やる気が出る説明を読む", 1, INK, 23)
      + txt(480, 178, "似てる？", v, INK, 28) + box(550, 70, 330, 190, v, PANEL, MINT, 3, 18) + txt(715, 112, "私たちの夜", v, MINT, 21) + ico("play", 693, 132, MINT, v, lt) + txt(715, 222, "やる気動画を見る", v, INK, 23)
      + txt(480, 316, "※TRY LOGの見立てです。研究が調べたのは、動画ではなく読みものです。", n, DIM, 19); },
  quote(lt, c) { const a = seg(lt, c.q1 - .2, .5), b = seg(lt, c.q2 - .2, .5);
    return `<rect x="110" y="40" width="7" height="${180 * a}" fill="${MINT}"/>` + txt(150, 96, "足りないのは、やる気ではなく", a, INK, 38, "start") + txt(150, 166, "「明確さ」。", a, MINT, 50, "start")
      + txt(150, 222, "いつ・どこでやるかが、決まっていないだけ。", b, INK, 25, "start")
      + txt(150, 282, "“Many people think they lack motivation when what they really lack is clarity.”", b, DIM, 18, "start") + txt(150, 316, "— James Clear（日本語はTRY LOGによる意訳）", b, DIM, 18, "start"); },
  form(lt, c) { const o = [seg(lt, c.s1 - .15, .3), seg(lt, c.s2 - .15, .3), seg(lt, c.s3 - .15, .3)];
    return txt(480, 70, "私は、", o[0], DIM, 26) + slots(150, ["", "", ""], o) + txt(480, 290, "I will [BEHAVIOR] at [TIME] in [LOCATION].", o[2], DIM, 20); },
  ex1(lt, c) { const o = [seg(lt, c.s1 - .15, .3), seg(lt, c.s2 - .15, .3), seg(lt, c.s3 - .15, .3)];
    return chip(250, 26, "退職しない", 1, DIM, 190) + chip(480, 26, "出費なし", 1, DIM, 170) + chip(710, 26, "今夜できる", 1, DIM, 190)
      + slots(150, [o[0] > .5 ? "平日 21:00" : "", o[1] > .5 ? "自分の机で" : "", o[2] > .5 ? "副業の資料を開く" : ""], [1, 1, 1], ORANGE) + ico("laptop", 458, 258, ORANGE, o[2], lt, 1.4); },
  ex2(lt, c) { const a = seg(lt, c.a - .15, .35), b = seg(lt, c.b - .15, .35);
    return ico("dumbbell", 84, 54, ORANGE, a, lt, 1.3) + box(170, 44, 700, 84, a, PANEL, ORANGE, 3, 16) + txt(520, 97, "朝7時 ／ 玄関で ／ 腕立てを5回", a, INK, 27)
      + ico("train", 84, 204, ORANGE, b, lt + 1, 1.3) + box(170, 194, 700, 84, b, PANEL, ORANGE, 3, 16) + txt(520, 247, "帰りの電車で ／ 英単語を10個", b, INK, 27)
      + txt(520, 326, "小さくていい。大事なのは「いつ・どこで」。", b, DIM, 20); },
  ifthen(lt, c) { const a = seg(lt, c.if - .2, .4), e = seg(lt, c.ex - .2, .4);
    return box(80, 40, 360, 84, a, PANEL, MINT, 3, 16) + txt(260, 93, "もし 〜 なら", a, MINT, 28) + arrow(460, 82, 460 + 50 * a, 82, a, MINT, 4) + box(530, 40, 350, 84, a, PANEL, MINT, 3, 16) + txt(705, 93, "〜 する", a, MINT, 28)
      + txt(80, 186, "例（TRY LOG作）", e, ORANGE, 19, "start")
      + box(80, 200, 360, 84, e, PANEL, ORANGE, 3, 16) + txt(260, 252, "もし残業で遅くなったら", e, INK, 24) + arrow(460, 242, 460 + 50 * e, 242, e, ORANGE, 4) + box(530, 200, 350, 84, e, PANEL, ORANGE, 3, 16) + txt(705, 252, "寝る前に1行だけ書く", e, INK, 24); },
  limit1(lt, c) { const a = seg(lt, c.a - .2, .35), b = seg(lt, c.b - .2, .35), k = seg(lt, c.c - .2, .4);
    return chip(250, 70, "運動の研究", a, BLUE, 260) + chip(710, 70, "期間は2週間", b, BLUE, 260)
      + box(250, 180, 460, 90, k, PANEL, mix(ORANGE, DIM, .2), 3, 18) + txt(440, 236, "副業で稼げる証拠", k, INK, 30) + cross(650, 225, k, ORANGE, 20) + txt(480, 312, "ではありません", k, ORANGE, 23); },
  limit2(lt, c) { let s = "";
    [["元の論文", "未確認", "a"], ["91%などの数字", "著者の紹介による", "b"], ["TRY LOGで試した結果", "なし", "c"]].forEach(([l, r, k], i) => { const o = seg(lt, c[k] - .2, .35), y = 50 + i * 96;
      s += box(110, y, 740, 72, o, PANEL, "#3a5563", 2.5, 14) + txt(140, y + 46, l, o, INK, 26, "start") + txt(820, y + 46, r, o, ORANGE, 26, "end"); });
    return s; },
  make(lt, c) { const r = seg(lt, c.ring - .2, .4), o = [seg(lt, c.s1 - .15, .25), seg(lt, c.s2 - .15, .25), seg(lt, c.s3 - .15, .25)], b = lt > c.s3 ? 2 : lt > c.s2 ? 1 : lt > c.s1 ? 0 : -1;
    return ring(480, 70, 46, cl((lt - c.ring) / Math.max(c.s3 + 1 - c.ring, 1)), r, ORANGE, "30秒", 22) + txt(590, 62, "無料", r, MINT, 26, "start") + ico("pen", 300, 46, MINT, r, lt, 1.2)
      + slots(180, ["", "", ""], o.map(x => .35 + .65 * x), ORANGE, lt, b) + txt(480, 310, "あなたの一文を、今ここで。", o[0], INK, 24); },
  save(lt, c) { const m = seg(lt, c.memo - .2, .4), k = seg(lt, c.com - .2, .4);
    return box(170, 60, 260, 220, m, PANEL, MINT, 3.5, 22) + ico("note", 256, 86, MINT, m, lt, 2) + txt(300, 240, "スマホのメモ", m, INK, 25)
      + txt(480, 180, "か", m * k, DIM, 26) + box(530, 60, 260, 220, k, PANEL, ORANGE, 3.5, 22) + ico("chat", 616, 90, ORANGE, k, lt + 1, 2) + txt(660, 240, "コメント欄", k, INK, 25)
      + txt(480, 330, "この動画を閉じる前に", 1, DIM, 22); },
  end(lt, c) { const f = seg(lt, c.fade - .2, 1.2), s = seg(lt, c.stay - .2, .5);
    return room(lt, { min: 1380, dark: 1, clock: 0, down: 1 }) + meter(800, lerp(.9, .1, f), lt)
      + box(250, 40 - s * 6, 400, 64, s, PANEL, MINT, 3.5, 16) + txt(450, 82 - s * 6, "いつ ／ どこで ／ 何を", s, MINT, 25); },
};
finishArt();
