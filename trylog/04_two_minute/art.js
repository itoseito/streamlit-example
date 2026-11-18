// 2分ルールの絵（横型・viewBox 960×360）。lt=場面内の秒, c=合図の秒
const DIM = "#8ea3ad", PANEL = "#16262f", SOFA = "#2f4856", DARK = "#263a47";
const box = (x, y, w, h, o = 1, fill = PANEL, stroke = "none", sw = 2.5, rx = 12) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${o}"/>`;
// 2分タイマーの輪。p=進み具合(0〜1)
const ring = (cx, cy, r, p, o = 1, col = MINT, label = "", size = 30) => { const C = 2 * Math.PI * r;
  return `<g opacity="${o}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#22363f" stroke-width="${r * .14}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="${r * .14}" stroke-linecap="round"
    stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - cl(p))}" transform="rotate(-90 ${cx} ${cy})"/>
  ${label ? txt(cx, cy + size * .36, label, 1, INK, size) : ""}</g>`; };

// ---- 帰宅後の部屋 ----
function room(lt, { min = 1170, glow = 0, dark = 0, down = 0 } = {}) {
  const hh = Math.floor(min / 60), mm = Math.floor(min % 60), ha = (min / 60 % 12) * 30, ma = (min % 60) * 6, cx = 800, cy = 96;
  const hand = (ang, len, w) => `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(ang * Math.PI / 180) * len}" y2="${cy - Math.cos(ang * Math.PI / 180) * len}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`;
  let s = `<line x1="60" y1="318" x2="900" y2="318" stroke="#22363f" stroke-width="3"/>`;
  s += `<rect x="96" y="44" width="150" height="130" rx="8" fill="${mix("#27507f", "#101d33", dark)}" stroke="#3a5563" stroke-width="5"/>
    <line x1="171" y1="44" x2="171" y2="174" stroke="#3a5563" stroke-width="4"/>
    <circle cx="212" cy="82" r="15" fill="#f6e9b8" opacity="${.25 + dark * .75}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="46" fill="${PANEL}" stroke="#a9c3cc" stroke-width="4"/>` + hand(ha, 24, 5) + hand(ma, 35, 3.5)
    + txt(cx, 178, `${hh}:${String(mm).padStart(2, "0")}`, 1, mix(INK, ORANGE, dark), 26);
  s += `<rect x="300" y="170" width="360" height="110" rx="26" fill="${DARK}"/><rect x="280" y="232" width="400" height="70" rx="22" fill="${SOFA}"/>
    <rect x="300" y="296" width="18" height="22" fill="${DARK}"/><rect x="642" y="296" width="18" height="22" fill="${DARK}"/>`;
  const px = lerp(506, 590, down), py = lerp(196, 240, down), tilt = lerp(-14, 90, down), g = glow * (1 - down);
  s += `<circle cx="${px + 10}" cy="${py + 16}" r="${58 + 5 * Math.sin(lt * 3)}" fill="#7db7ff" opacity="${g * .22}"/>`;
  s += `<circle cx="452" cy="150" r="26" fill="#cfe3e6"/><rect x="418" y="182" width="70" height="78" rx="26" fill="#6f8d99"/>
    <rect x="430" y="246" width="110" height="26" rx="13" fill="#587582"/>`;
  s += `<line x1="476" y1="206" x2="${lerp(508, 520, down)}" y2="${lerp(218, 238, down)}" stroke="#6f8d99" stroke-width="15" stroke-linecap="round"/>`;
  s += `<g transform="rotate(${tilt} ${px + 10} ${py + 17})"><rect x="${px}" y="${py}" width="20" height="34" rx="4" fill="${mix("#0b1820", "#bfe0ff", g)}" stroke="#a9c3cc" stroke-width="2"/></g>`;
  return s; }
const chip = (x, y, s, o, col = MINT, w = 130) => box(x - w / 2, y, w, 44, o, PANEL, col, 2.5, 22) + txt(x, y + 30, s, o, col, 22);

// ---- 言いかえの3行（左：もとの目標 → 右：2分の形） ----
function conv(lt, c, rows, col) { let s = "";
  rows.forEach(([a, b], i) => { const k = "abc"[i], y = 22 + i * 110, A = seg(lt, c[k] - .15, .4), B = seg(lt, c[k + "2"] - .15, .4);
    s += box(70, y, 340, 84, A, PANEL, "#3a5563") + txt(240, y + 52, a, A * (1 - B * .45), INK, 25);
    s += arrow(430, y + 42, 430 + 90 * B, y + 42, B, col, 4);
    s += box(550 + (1 - B) * 30, y, 340, 84, B, PANEL, col, 3.5) + txt(720 + (1 - B) * 30, y + 52, b, B, col, 25); });
  return s; }

// ---- 道と山（始めるハードル）。H=山の高さ, x=玉の位置 ----
const BY = 262, bump = (x, H) => H * Math.exp(-Math.pow((x - 250) / 62, 2));
function track(H, x, o = 1, goal = "やりたいこと") { let d = "";
  for (let X = 70; X <= 890; X += 6) d += (d ? "L" : "M") + X + " " + (BY - bump(X, H)).toFixed(1);
  return `<path d="${d}" stroke="#a9c3cc" stroke-width="5" fill="none" stroke-linecap="round"/>
    <line x1="872" y1="${BY}" x2="872" y2="${BY - 74}" stroke="${INK}" stroke-width="4"/><path d="M872 ${BY - 74} l-46 14 l46 14z" fill="${ORANGE}"/>`
    + txt(858, BY - 86, goal, 1, ORANGE, 19) + `<circle cx="${x}" cy="${BY - bump(x, H) - 16}" r="14" fill="${MINT}" opacity="${o}"/>`; }
const bracket = (x1, x2, y, s, o, col) => `<path d="M${x1} ${y - 10} v10 h${x2 - x1} v-10" stroke="${col}" stroke-width="3.5" fill="none" opacity="${o}" stroke-linecap="round"/>` + txt((x1 + x2) / 2, y + 30, s, o, col, 21);
const stuck = lt => 112 + 78 * Math.abs(Math.sin(lt * 1.5));          // 山を登りきれず、戻ってしまう動き

window.ART = {
  home(lt, c) { return room(lt, { min: 1170 + lt * .4, glow: seg(lt, c.phone - .1, .6) }); },
  night(lt, c) { const k = seg(lt, c.clock, 1.8); return room(lt, { min: lerp(1173, 1380, k), glow: 1, dark: k }); },
  wish(lt, c) { const L = seg(lt, c.later - .1, .5); let s = room(lt, { min: 1380, glow: 1, dark: 1 });
    [["勉強", "a", 340], ["運動", "b", 480], ["副業", "c", 620]].forEach(([w, k, x]) => { const o = seg(lt, c[k] - .15, .35);
      s += chip(x, 22 - (1 - o) * 10, w, o * (1 - L * .6), mix(MINT, DIM, L))
        + `<g transform="rotate(-8 ${x} 90)">${txt(x, 96, "あとで", L, ORANGE, 19)}</g>`; });
    return s; },
  title(lt, c) { const k = seg(lt, c.rule - .2, 1.3), o = seg(lt, c.rule - .3, .4), A = seg(lt, c.abroad - .2, .4) * (1 - o), J = seg(lt, c.abroad + .9, .5) * (1 - o);
    return chip(250, 136, "海外の考え方", A, MINT, 260) + arrow(410, 158, 410 + 130 * J, 158, J, ORANGE, 4) + chip(710, 136, "日本の日常", J, ORANGE, 260)
      + txt(480, 250, "どう活かす？", J, DIM, 22) + ring(480, 158, 118, k, o) + txt(480, 186, "2分", o, INK, 84) + txt(480, 330, "The Two-Minute Rule", o, DIM, 22); },
  source(lt, c) { const a = seg(lt, c.name - .2, .4), b = seg(lt, c.book - .2, .4), d = seg(lt, c.site - .2, .4);
    return box(150, 28, 660, 304, 1, PANEL, "#22363f", 2.5, 18) + `<rect x="150" y="56" width="7" height="${78 * a}" fill="${MINT}"/>`
      + txt(190, 92, "James Clear", a, INK, 40, "start") + txt(190, 128, "ジェームズ・クリアー", a, DIM, 21, "start")
      + txt(190, 190, "著書『Atomic Habits』第13章からの抜粋", b, INK, 23, "start") + txt(190, 220, "（記事内の記載による）", b, DIM, 17, "start")
      + txt(190, 276, "“How to Stop Procrastinating by Using the ‘2-Minute Rule’”", d, MINT, 19, "start") + txt(190, 306, "jamesclear.com 掲載の記事", d, DIM, 17, "start"); },
  rule(lt, c) { const a = seg(lt, c.habit - .2, .4), k = seg(lt, c.shrink - .1, .9);
    const w = lerp(300, 76, k), h = lerp(230, 76, k), x = lerp(270, 690, k) - w / 2, y = 170 - h / 2;
    return ring(690, 170, 96, k, k) + box(x, y, w, h, a, mix("#3a5563", MINT, k), "none", 0, lerp(18, 14, k))
      + txt(lerp(270, 690, k), 178, "新しい習慣", a * (1 - k), INK, 30) + arrow(450, 170, 450 + 100 * k, 170, k * (1 - seg(lt, c.shrink + 1.2, .5)), MINT, 4)
      + txt(690, 312, "2分以内でできる形", k, MINT, 26) + txt(270, 312, "大きいままだと、始めにくい", a * (1 - k), DIM, 20); },
  ex_author(lt, c) { return conv(lt, c, [["寝る前に本を読む", "1ページ読む"], ["30分ヨガをする", "ヨガマットを出す"], ["授業の勉強をする", "ノートを開く"]], MINT); },
  why1(lt, c) { const k = seg(lt, c.start - .2, .5), g = seg(lt, c.go - .3, 3.2);
    return track(150, stuck(lt), 1 - k) + `<circle cx="${lerp(330, 800, g)}" cy="${BY - 16}" r="14" fill="${MINT}" opacity="${k}"/>`
      + txt(250, 76, "始めるまでが、大変", 1 - k * .6, ORANGE, 22) + txt(600, 200, "始めたあとは、進みやすい", k, MINT, 22); },
  why2(lt, c) { const k = seg(lt, c.low - .1, .8), g = seg(lt, c.low + .7, 1.6), a = seg(lt, c.after - .2, .5), e = seg(lt, c.gate - .2, .4);
    const x = g > 0 ? lerp(190, 360, g) + seg(lt, c.after, 4) * 240 : lerp(stuck(lt), 190, k);
    return track(lerp(150, 26, k), x) + bracket(90, 350, BY + 22, "最初の2分＝簡単に", k, MINT) + bracket(370, 870, BY + 22, "そのあと＝大変でもいい", a, DIM)
      + txt(250, lerp(76, 200, k), "入口", .4 + e * .6, mix(DIM, ORANGE, e), 24) + arrow(250, 84, 250, 84 + 60 * k, k * (1 - a), ORANGE, 4); },
  showup(lt, c) { let s = ""; const g = seg(lt, c.grow, 1.6);
    "月火水木金土日".split("").forEach((d, i) => { const x = 136 + i * 104, o = seg(lt, c.check + i * .32, .3), h = 18 + g * (i + 1) * 13;
      s += txt(x + 32, 52, d, 1, DIM, 20) + box(x, 66, 64, 64, 1, PANEL, o > 0 ? MINT : "#3a5563")
        + `<path d="M${x + 16} ${98} l12 13 l22 -26" stroke="${MINT}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="52" stroke-dashoffset="${52 * (1 - o)}"/>`
        + box(x + 12, 296 - h, 40, h, o, mix(MINT, ORANGE, g * .0), "none", 0, 5); });
    return s + txt(480, 176, "まず、毎回取りかかる", seg(lt, c.check - .2, .4) * (1 - g * .6), MINT, 23) + txt(480, 340, "良くするのは、定着してから", g, ORANGE, 22)
      + `<line x1="120" y1="298" x2="840" y2="298" stroke="#3a5563" stroke-width="3"/>`; },
  switch(lt, c) { const k = seg(lt, c.sw - .2, .6);
    return box(110, 120, 300, 84, 1, PANEL, mix(MINT, "#3a5563", k), 3, 42) + txt(260, 172, "著者の主張", 1 - k * .6, mix(MINT, DIM, k), 28)
      + arrow(440, 162, 440 + 80 * k, 162, k, ORANGE, 4.5)
      + box(550, 112 - k * 4, 320, 100 + k * 8, .25 + k * .75, PANEL, ORANGE, 3 + k, 54) + txt(710, 173, "TRY LOGの応用例", .25 + k * .75, ORANGE, 30)
      + txt(710, 262, "日本の仕事終わり向けに考えた例", k, INK, 21) + txt(260, 250, "ここまで", 1, DIM, 19) ; },
  ex_try(lt, c) { return conv(lt, c, [["副業を1時間する", "資料を開いて1行書く"], ["資格の勉強を30分", "テキストを開いて1問読む"], ["筋トレをする", "運動着に着替える"]], ORANGE); },
  step1(lt, c) { const p = seg(lt, c.pick - .2, .5), w = seg(lt, c.write - .2, .6), m = seg(lt, c.memo - .2, .5); let s = "";
    [["勉強", 0], ["運動", 0], ["副業", 1]].forEach(([t, on], i) => { s += chip(190, 70 + i * 86, t, on ? 1 : 1 - p * .7, on ? mix(MINT, ORANGE, p) : MINT, 170); });
    return s + txt(190, 44, "帰ってからやりたいこと", 1, DIM, 19) + txt(190, 340, "ひとつだけ選ぶ", p, ORANGE, 21)
      + arrow(300, 264, 300 + 150 * w, lerp(264, 180, w), w, ORANGE, 4)
      + box(480, 110, 380, 140, w, PANEL, ORANGE, 3.5, 18) + txt(670, 168, "2分でできる", w, INK, 28) + txt(670, 212, "最初の動き", w, ORANGE, 34)
      + txt(670, 290, "書きかえて、メモしておく", m, INK, 21); },
  step2(lt, c) { const lines = ["帰ったら、", "資料を開いて", "1行書く"], n = lines.join("").length, k = cl((lt - c.type) / 2.6) * n, t = seg(lt, c.timer - .2, .5);
    let s = box(330, 8, 300, 344, 1, "#0f1f27", "#a9c3cc", 4, 30) + txt(480, 52, "メモ", 1, DIM, 20) + `<line x1="354" y1="68" x2="606" y2="68" stroke="#22363f" stroke-width="2"/>`, used = 0, cx = 362, cy = 96;
    lines.forEach((L, i) => { const m = Math.floor(cl(k - used, 0, L.length)); used += L.length;
      s += txt(362, 124 + i * 52, L.slice(0, m), 1, i ? ORANGE : INK, 34, "start"); if (m > 0 && m <= L.length) { cx = 362 + m * 34 + 4; cy = 96 + i * 52; } });
    s += `<rect x="${cx}" y="${cy}" width="3" height="34" fill="${MINT}" opacity="${lt > c.type - .5 && Math.sin(lt * 9) > 0 ? 1 : 0}"/>`;
    return s + `<g opacity=".55">${txt(170, 172, "副業を1時間", 1, DIM, 26)}<line x1="84" y1="164" x2="256" y2="164" stroke="${DIM}" stroke-width="3"/></g>` + txt(170, 208, "→ 小さく書きかえる", 1, DIM, 18)
      + ring(790, 160, 76, cl((lt - c.timer) / 2.5), t, MINT, "2分だけ", 26) + txt(790, 276, "今夜、これだけ", t, MINT, 21); },
  stop(lt, c) { const p = cl((lt - c.run) / Math.max(c.stop - c.run, .1)), k = seg(lt, c.stop - .05, .35), sec = Math.round(p * 120);
    return ring(480, 158, 118, p, 1, mix(ORANGE, MINT, k)) + txt(480, 150, `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`, 1 - k, INK, 56)
      + `<rect x="${480 - 30}" y="${128 - 30}" width="60" height="60" rx="10" fill="${MINT}" opacity="${k}"/>` + txt(480, 222, "ここでやめる", k, MINT, 24)
      + txt(480, 334, "わざとらしく感じるなら：2分やったら、必ずやめる", k, INK, 21); },
  limit1(lt, c) { const k = seg(lt, c.bracket - .2, .5); return track(26, 330 + Math.sin(lt * 2) * 3) + bracket(90, 350, BY + 22, "2分ルールが助けるのは、ここ", k, MINT) + txt(250, 200, "入口", 1, ORANGE, 24); },
  limit2(lt, c) { const k = seg(lt, c.far - .2, .6), b = seg(lt, c.beyond - .2, .5);
    return track(26, 330 + cl(lt / 11) * 90, 1, "成果") + bracket(90, 350, BY + 22, "2分ルール", 1, MINT)
      + `<line x1="370" y1="${BY - 44}" x2="${370 + 480 * k}" y2="${BY - 44}" stroke="${ORANGE}" stroke-width="4" stroke-dasharray="12 10" stroke-linecap="round"/>`
      + txt(610, BY - 62, "ここから先は、積み重ね", k, ORANGE, 22) + bracket(370, 870, BY + 22, "本当の目標は、2分より先（著者）", b, DIM); },
  honest(lt, c) { const a = seg(lt, c.no - .2, .5), b = seg(lt, c.yes - .2, .5);
    return box(90, 90, 360, 150, .35 + a * .65, PANEL, "#3a5563", 3, 18) + txt(270, 152, "試した結果の報告", .35 + a * .65, DIM, 28)
      + `<path d="M240 190 l60 0" stroke="none"/><g opacity="${a}" stroke="${ORANGE}" stroke-width="6" stroke-linecap="round"><line x1="250" y1="180" x2="290" y2="220"/><line x1="290" y1="180" x2="250" y2="220"/></g>`
      + txt(270, 280, "ではありません", a, ORANGE, 22)
      + box(510, 90, 360, 150, b, PANEL, MINT, 3.5, 18) + txt(690, 152, "考え方と試し方の紹介", b, INK, 28)
      + `<path d="M664 198 l16 17 l30 -34" stroke="${MINT}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${b}"/>`
      + txt(690, 280, "合うかどうかは、人による", b, DIM, 21); },
  quote(lt, c) { const a = seg(lt, c.q1 - .2, .5), b = seg(lt, c.q2 - .2, .5);
    return `<rect x="150" y="50" width="7" height="${170 * a}" fill="${MINT}"/>` + txt(190, 110, "思っていたより少なくても、", a, INK, 40, "start") + txt(190, 180, "何もしないより、ずっといい。", b, MINT, 40, "start")
      + txt(190, 262, "“It’s far better to do less than you hoped than to do nothing at all.”", b, DIM, 19, "start")
      + txt(190, 302, "— James Clear（日本語はTRY LOGによる意訳）", b, DIM, 19, "start"); },
  end(lt, c) { const k = seg(lt, c.ring - .3, .6);
    return room(lt, { min: 1170 + lt * .4, down: seg(lt, .4, .8) }) + ring(480, 76, 44, cl((lt - c.ring) / 3), k, MINT, "2分", 26); },
};
