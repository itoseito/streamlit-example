// 場面の「型」。timeline.json の各場面に "art": "hero" などと書くだけで絵が出る（08 以降の量産用）。
// 合図は cues の c1, c2, … の順に、要素が1つずつ出る。人物は ../cast/ の写真（AI生成・架空）。部品は kit_wide.js。
const CREAM = "#f6e9b8", INKD = "#22363f", GREEN = "#0f7a6a";
const WHO = { n1: "ハルト", n2: "ソウタ", n3: "リク", m1: "レオ", m2: "マルコ", m3: "ダン" };
let PID = 0;
function photo(who, x, y, w, h, lt, o = 1, { tint = 0, gray = 0, label = WHO[who], zoom = .05 } = {}) {
  const id = "p" + (PID++), z = 1 + zoom * cl(lt / 8), iw = w * z * 1.02, ih = iw * 1.86, ix = x + (w - iw) / 2, iy = y - (ih - h) * .15;
  return `<g opacity="${o}"><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16"/></clipPath>
    <g clip-path="url(#${id})"><image href="../cast/${who}.jpg" x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMin slice" style="filter:grayscale(${gray})"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0b1820" opacity="${tint}"/></g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="none" stroke="#3a5563" stroke-width="3"/>
    ${label ? box(x + 10, y + h - 40, label.length * 17 + 24, 30, 1, "#0b1820cc", "none", 0, 15) + txt(x + 22, y + h - 19, label, 1, INK, 17, "start") : ""}
    ${txt(x + w - 10, y + 22, "AI生成", 1, CREAM, 13, "end")}</g>`; }
function meter(x, lv, lt, o = 1) { const h = 210 * cl(lv), hot = cl((lv - .8) * 5);
  return `<g opacity="${o}">` + txt(x, 44, "やる気", 1, DIM, 20) + box(x - 24, 58, 48, 218, 1, PANEL, "#3a5563", 3, 14)
    + box(x - 20, 272 - h, 40, h, 1, mix(MINT, ORANGE, hot), "none", 0, 10) + txt(x, 310, lv > .93 ? "MAX" : Math.round(lv * 100) + "%", 1, mix(MINT, ORANGE, hot), 24) + `</g>`; }
const paper = (x, y, w, h, o = 1) => box(x, y, w, h, o, "#f3f1ea", "#c9c2ad", 3, 10);
const fit = (s, w, max) => Math.min(max, Math.floor(w / Math.max(s.length, 1)));       // 幅に収まる文字の大きさ
const SLOT = [["いつ", 80, 230], ["どこで", 330, 230], ["何を", 580, 300]];
const slotRow = (y, vals, on, col, lt, blink, x0 = 0, sc = 1) => SLOT.map(([lab, x, w], i) => { const o = on[i], v = vals[i]; x = x0 + x * sc; w *= sc;
  return txt(x + 6, y - 12, lab, o, col, 20, "start") + box(x, y, w, 64, o, PANEL, v ? col : "#3a5563", v ? 3.5 : 2.5, 14) + txt(x + w / 2, y + 42, v || "", o, INK, fit(v || "", w - 20, 23))
    + (blink === i ? `<rect x="${x + 20}" y="${y + 16}" width="4" height="32" fill="${col}" opacity="${Math.sin(lt * 10) > 0 ? 1 : 0}"/>` : ""); }).join("");

const TYPES = {
  // 主人公の写真＋右に言葉。lines の先頭が「！」ならオレンジの吹き出し。meter:[始,終] でやる気メーター。gray:true で最後に色が抜ける
  hero(S, lt, on, c, n) { const m = S.meter, W = m ? 440 : 540, last = on(n), k = S.gray ? last : 0;
    let s = photo(S.who, 60, 20, 250, 320, lt, 1, { tint: .1 + k * .35, gray: k * .7 });
    (S.lines || []).forEach((t, i) => { const o = on(i + 1), hot = t[0] === "！", u = hot ? t.slice(1) : t, y = 44 + i * 78;
      s += box(350, y - (1 - o) * 8, W, 62, o, PANEL, hot ? ORANGE : "#3a5563", hot ? 3.5 : 2.5, hot ? 31 : 14) + txt(350 + W / 2, y + 41 - (1 - o) * 8, u, o, hot ? ORANGE : INK, fit(u, W - 30, 26)); });
    if (m) s += meter(860, lerp(m[0], m[1], on(n, 1)), lt);
    return s + (S.clock ? txt(880, 26, S.clock, 1, INK, 22, "end") : ""); },
  // 登場人物の紹介＋「AI生成・架空の人物」の判
  duo(S, lt, on, c, n) { const N = S.who.length, w = N > 2 ? 190 : 230, gap = (960 - N * w) / (N + 1);
    return S.who.map((p, i) => photo(p, gap + i * (w + gap), 30, w, 290, lt, on(Math.min(i + 1, n - 1)), { label: (S.labels || [])[i] || WHO[p] })).join("")
      + `<g transform="rotate(-8 480 175)">${box(310, 140, 340, 70, on(n), "#0b1820ee", CREAM, 4, 12) + txt(480, 186, S.stamp || "AI生成・架空の人物", on(n), CREAM, 28)}</g>`; },
  // 先を行く人＋紙の図。title は c1、lines は c2 から。「→」で始まる行はオレンジ
  board(S, lt, on) { const x = S.who ? 270 : 110, w = S.who ? 650 : 740;
    let s = (S.who ? photo(S.who, 40, 30, 200, 300, lt) : "") + paper(x, 30, w, 300) + (S.num ? txt(x + 34, 84, S.num, on(1), ORANGE, 34, "start") : "")
      + txt(x + (S.num ? 84 : 34), 82, S.title || "", on(1), INKD, fit(S.title || "", w - 130, 27), "start");
    (S.lines || []).forEach((t, i) => { const o = on(i + 2), hot = t[0] === "→", y = 138 + i * (S.lines.length > 3 ? 44 : 54);
      s += `<circle cx="${x + 44}" cy="${y - 8}" r="5" fill="${hot ? ORANGE : INKD}" opacity="${o}"/>` + txt(x + 62, y, hot ? t.slice(1) : t, o, hot ? ORANGE : INKD, fit(t, w - 90, 24), "start"); });
    return s + (S.foot ? txt(x + w / 2, 314, S.foot, 1, "#6b6a63", 17) : ""); },
  // 言いかえの行（左 → 右）
  convert(S, lt, on) { const col = { mint: MINT, orange: ORANGE }[S.col] || ORANGE; return (S.rows || []).map(([a, b], i) => { const o = on(i + 1), y = 30 + i * (S.rows.length > 2 ? 106 : 150);
    return box(70, y, 340, 84, 1, PANEL, "#3a5563") + txt(240, y + 52, a, 1 - o * .3, INK, fit(a, 310, 25)) + box(550, y, 340, 84, .25 * (1 - o), PANEL, "#3a5563", 2.5) + arrow(430, y + 42, 430 + 90 * o, y + 42, o, col, 4)
      + box(550 + (1 - o) * 30, y, 340, 84, o, PANEL, col, 3.5) + txt(720 + (1 - o) * 30, y + 52, b, o, col, fit(b, 310, 25)); }).join(""); },
  // 棒グラフ。bars: [{label, value(0〜100), text, col}]
  bars(S, lt, on) { const N = S.bars.length, k = on(1, .9); let s = `<line x1="160" y1="290" x2="800" y2="290" stroke="#3a5563" stroke-width="3"/>` + (S.title ? txt(480, 34, S.title, 1, DIM, 21) : "");
    S.bars.forEach((b, i) => { const x = 480 + (i - (N - 1) / 2) * 280, h = b.value * 2.2 * k, col = { mint: MINT, orange: ORANGE, dim: DIM }[b.col] || MINT;
      s += box(x - 60, 290 - h, 120, h, 1, col, "none", 0, 8) + txt(x, 280 - h, b.text, cl(k * 2), col, 32) + txt(x, 322, b.label, 1, INK, fit(b.label, 260, 21)); });
    return s + (S.note ? txt(480, 352, S.note, on(2), ORANGE, 19) : ""); },
  // 「いつ・どこで・何を」の枠。vals が空なら点滅するだけ
  slots(S, lt, on) { const v = S.vals || ["", "", ""], col = S.col || ORANGE, x0 = S.who ? 200 : 0, sc = S.who ? .85 : 1;
    return (S.who ? photo(S.who, 30, 20, 200, 320, lt) : "") + (S.pre ? txt(x0 + 80 * sc, 70, S.pre, on(1), DIM, 24, "start") : "")
      + slotRow(130, v.map((t, i) => on(i + 1) > .5 ? t : ""), [1, 1, 1], col, lt, -1, x0, sc) + (S.post ? txt(480 + x0 / 2, 280, S.post, on(4), col, 24) : ""); },
  // 左に項目、右に答え（正直コーナーなど）
  list(S, lt, on) { return (S.rows || []).map(([l, r], i) => { const o = on(i + 1), y = 44 + i * (S.rows.length > 3 ? 76 : 96);
    return box(110, y, 740, 64, 1, PANEL, "#3a5563", 2.5, 14) + txt(140, y + 42, l, .55 + .45 * o, INK, fit(l, 380, 25), "start") + txt(820, y + 42, r, o, ORANGE, fit(r, 330, 25), "end"); }).join(""); },
  // まとめのカード（3〜4枚）。cards: [[アイコン名, 文]]
  cards(S, lt, on) { const N = S.cards.length, w = N > 3 ? 200 : 260, gap = (960 - N * w) / (N + 1);
    return S.cards.map(([ic, t], i) => { const o = on(i + 1), x = gap + i * (w + gap);
      return box(x, 70, w, 220, .3 + .7 * o, PANEL, MINT, 3, 18) + ico(ic, x + w / 2 - 22, 110 - (1 - o) * 10, MINT, o, lt + i, 1) + txt(x + w / 2, 180, `${"①②③④"[i]}`, .4 + .6 * o, MINT, 26) + txt(x + w / 2, 232, t, o, INK, fit(t, w - 24, 22)); }).join(""); },
  // コメントの呼びかけ
  comment(S, lt, on) { return (S.blank === false ? "" : slotRow(90, ["", "", ""], [1, 1, 1], ORANGE, lt, Math.floor(lt * 1.2) % 3)) + ico("chat", 440, S.blank === false ? 90 : 210, ORANGE, seg(lt, .1, .4), lt, 1.6)
    + txt(480, S.blank === false ? 220 : 330, S.text || "一文だけ、コメントで", seg(lt, .1, .4), INK, fit(S.text || "", 860, 26)); },
  // 30日のカレンダー。hi=今の週(0〜3)。右に見出しと行
  calendar(S, lt, on) { let s = txt(214, 36, "最初の30日", 1, DIM, 20);
    for (let d = 0; d < 30; d++) { const wk = Math.min(Math.floor(d / 7), 3), x = 60 + (d % 7) * 44, y = 52 + Math.floor(d / 7) * 56, cur = wk === S.hi, past = wk < S.hi, o = cur ? on(1) : 1;
      s += box(x, y, 38, 48, 1, cur ? mix(PANEL, ORANGE, .25 * o + .08 * o * Math.sin(lt * 4 + d)) : past ? "#1c3d3d" : PANEL, cur ? mix("#3a5563", ORANGE, o) : past ? MINT : "#3a5563", 2.5, 8) + txt(x + 19, y + 31, d + 1, 1, cur ? INK : DIM, 16)
        + (past ? check(x + 10, y + 26, .8, MINT, .7) : ""); }
    s += txt(420, 80, S.label || "", on(1), ORANGE, 34, "start") + txt(420, 128, S.title || "", on(1), INK, fit(S.title || "", 500, 28), "start");
    (S.lines || []).forEach((t, i) => { const o = on(i + 2); s += `<circle cx="430" cy="${182 + i * 50}" r="5" fill="${MINT}" opacity="${o}"/>` + txt(448, 190 + i * 50, t, o, INK, fit(t, 470, 23), "start"); });
    return s; },
  // 手順のチェックリスト。最後の合図で phrase（合言葉）の吹き出し
  steps(S, lt, on, c, n) { const N = S.steps.length, x = S.who ? 270 : 150, w = S.who ? 640 : 660, dy = N > 3 ? 58 : 70;
    let s = (S.who ? photo(S.who, 40, 30, 200, 300, lt) : "") + (S.title ? txt(x, 40, S.title, 1, DIM, 20, "start") : "");
    S.steps.forEach((t, i) => { const o = on(i + 1), y = 58 + i * dy; s += box(x, y, w, dy - 12, .25 + .75 * o, PANEL, MINT, 2.5, 12) + check(x + 18, y + (dy - 12) / 2, o, MINT, 1) + txt(x + 60, y + (dy - 12) / 2 + 9, t, o, INK, fit(t, w - 80, 24), "start"); });
    if (S.phrase) { const o = on(N + 1); s += box(x + 40, 58 + N * dy, w - 80, 56, o, PANEL, ORANGE, 3.5, 28) + txt(x + w / 2, 58 + N * dy + 38, S.phrase, o, ORANGE, fit(S.phrase, w - 120, 26)); }
    return s; },
  // ルーティンの判定。rows: [["ok"|"ng"|"note", 文]]
  verdict(S, lt, on) { let s = photo(S.who, 50, 20, 230, 320, lt) + box(310, 24, 600, 66, 1, PANEL, CREAM, 3, 14) + txt(610, 68, S.item, 1, CREAM, fit(S.item, 570, 27));
    (S.rows || []).forEach(([k, t], i) => { const o = on(i + 1), y = 112 + i * 76, col = k === "ok" ? MINT : k === "ng" ? ORANGE : DIM;
      s += box(310, y, 600, 62, o, PANEL, col, 3, 14) + (k === "ok" ? check(328, y + 30, o, MINT, 1) : k === "ng" ? cross(342, y + 31, o, ORANGE, 11) : "")
        + txt(374, y + 28, k === "ok" ? "マネしていい" : k === "ng" ? "マネしない" : "もと", o, col, 15, "start") + txt(374, y + 52, t, o, INK, fit(t, 520, 22), "start"); });
    return s; },
  // 大きな一言。text は c1、sub は c2、sub2 は c3
  big(S, lt, on) { const o = S.kicker ? on(1) : seg(lt, .1, .4); return (S.kicker ? txt(480, 70, S.kicker, 1, DIM, 22) : "")
    + `<g transform="translate(480 170) scale(${.9 + .1 * o}) translate(-480 -170)">${txt(480, 190, S.text, o, { orange: ORANGE, mint: MINT }[S.col] || INK, fit(S.text, 860, 64))}</g>`
    + (S.sub ? txt(480, 262, S.sub, on(2), MINT, fit(S.sub, 860, 28)) : "") + (S.sub2 ? txt(480, 312, S.sub2, on(3), DIM, fit(S.sub2, 860, 22)) : ""); },
  // 締め
  end(S, lt, on) { const N = S.who.length; return S.who.map((p, i) => photo(p, i < N / 2 ? 60 + i * 190 : 960 - 60 - 170 - (N - 1 - i) * 190, 50, 170, 250, lt)).join("")
    + box(480 - 150, 140, 300, 80, on(1), PANEL, MINT, 4, 16) + txt(480, 192, S.line, on(1), MINT, fit(S.line, 270, 30)); },
};
window.ART = {};
D.scenes.forEach(S => { const f = TYPES[S.art]; if (!f) throw new Error("知らない art: " + S.art);
  window.ART[S.id] = (lt, c) => { const n = Object.keys(c).length;
    const on = (i, len = .35) => seg(lt, (c["c" + Math.min(i, n)] ?? .3 + i * .5) - .2, len);   // i 番目の合図で 0→1
    return f(S, lt, on, c, n); }; });
const _render = window.renderAt; window.renderAt = t => { PID = 0; _render(t); };
finishArt();
