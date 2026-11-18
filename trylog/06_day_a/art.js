// 会社員Aさんの1日（横型・viewBox 960×360）。部品は ../kit_wide.js と ../chara/chara.js。lt=場面内の秒, c=合図の秒
const CREAM = "#f6e9b8", NIGHT = "#101d33";
// 上部の「1日のタイムライン」。cur=今いる時刻の番号（-1で全部同じ）、all=全部に2分の輪
const SLOTS = ["7:00", "8:10", "12:30", "19:30", "21:00", "23:00"];
const dayline = (cur, o = 1, done = -1) => { let s = `<line x1="160" y1="16" x2="800" y2="16" stroke="#22363f" stroke-width="3"/>`;
  SLOTS.forEach((t, i) => { const x = 160 + i * 128, on = i === cur, past = i <= done;
    s += `<circle cx="${x}" cy="16" r="${on ? 8 : 5}" fill="${on ? ORANGE : past ? MINT : "#3a5563"}"/>` + txt(x, 42, t, 1, on ? ORANGE : past ? MINT : DIM, on ? 18 : 14); });
  return `<g opacity="${o}">${s}</g>`; };
const fic = (o = 1) => txt(930, 352, "※架空の人物", o, CREAM, 15, "end");
const A = (v, x, y, s, opt) => chara(v, x, y, s, opt);
const floor = (y = 330) => `<line x1="40" y1="${y}" x2="920" y2="${y}" stroke="#22363f" stroke-width="3"/>`;
const sofa = (inner, x = 480) => `<rect x="${x - 190}" y="196" width="380" height="104" rx="26" fill="${DARK}"/>${inner}<rect x="${x - 210}" y="262" width="420" height="58" rx="22" fill="${SOFA}"/><rect x="${x - 190}" y="314" width="18" height="16" fill="${DARK}"/><rect x="${x + 172}" y="314" width="18" height="16" fill="${DARK}"/>`;
const phone = (x, y, glow, label = "", rot = 0) => `<g transform="rotate(${rot} ${x + 11} ${y + 18})"><circle cx="${x + 11}" cy="${y + 18}" r="${46}" fill="${BLUE}" opacity="${glow * .2}"/>` + box(x, y, 22, 36, 1, mix("#0b1820", "#bfe0ff", glow), "#a9c3cc", 2, 4) + `</g>` + (label ? txt(x + 11, y - 10, label, glow, BLUE, 15) : "");
const desk = (x, y, w = 300) => box(x, y, w, 14, 1, "#3a5563", "none", 0, 4) + box(x + 20, y + 14, 12, 330 - y - 14, 1, DARK, "none", 0, 3) + box(x + w - 32, y + 14, 12, 330 - y - 14, 1, DARK, "none", 0, 3);
const laptop = (x, y, on, lines = 0) => { let s = box(x, y - 80, 120, 78, 1, "#22363f", "#a9c3cc", 3, 6) + box(x - 10, y - 4, 140, 6, 1, "#a9c3cc", "none", 0, 3);
  s += `<rect x="${x + 6}" y="${y - 74}" width="108" height="66" rx="3" fill="${mix("#0b1820", "#1d3d4d", on)}"/>`;
  for (let i = 0; i < 3; i++) s += `<rect x="${x + 16}" y="${y - 62 + i * 18}" width="${(i === 2 ? 50 : 86) * cl(lines - i)}" height="6" rx="3" fill="${MINT}" opacity="${on}"/>`;
  return s; };
// 「その意味は？」の見出し札
const why = (o, x = 120, y = 40) => box(x, y, 210, 50, o, "none", ORANGE, 3, 25) + txt(x + 105, y + 34, "その意味は？", o, ORANGE, 24);
const SL = [["いつ", 80, 230], ["どこで", 330, 230], ["何を", 580, 300]];
function slots(y, vals, on, col = MINT, lt = 0, blink = -1) { let s = "";
  SL.forEach(([lab, x, w], i) => { const o = on[i], v = vals[i];
    s += txt(x + 6, y - 12, lab, o, col, 20, "start") + box(x, y, w, 72, o, PANEL, v ? col : "#3a5563", v ? 3.5 : 2.5, 14) + txt(x + w / 2, y + 46, v || "", o, INK, 25)
      + (blink === i ? `<rect x="${x + 22}" y="${y + 18}" width="4" height="36" fill="${col}" opacity="${Math.sin(lt * 10) > 0 ? 1 : 0}"/>` : ""); });
  return s; }

window.ART = {
  open(lt, c) { const a = seg(lt, c.a - .2, .5), w = seg(lt, c.why - .2, .4), x = lerp(-80, 330, seg(lt, 0, 1.6));
    return floor() + dayline(-1, a) + A("side", x, 326, 1.15, { arm: Math.sin(lt * 9) * 22, face: "normal" })
      + SLOTS.map((t, i) => txt(560 + (i % 3) * 120, 140 + Math.floor(i / 3) * 90, "？", w * cl((lt - c.why) * 3 - i * .4), ORANGE, 46)).join("") + txt(680, 300, "全部に、理由がある", w, ORANGE, 24); },
  notice(lt, c) { const f = seg(lt, c.fic - .2, .5), d = seg(lt, c.flow - .2, .5);
    return A("front", 230, 326, 1.15, { face: "smile" }) + box(380, 70, 500, 120, f, PANEL, CREAM, 3.5, 18) + txt(630, 122, "Aさんは、架空の人物", f, CREAM, 32) + txt(630, 162, "実際に試した記録ではありません", f, INK, 21)
      + dayline(-1, d) .replace('<g opacity', '<g transform="translate(220 230) scale(.6)" opacity') + txt(630, 300, "考え方の使い方を、1日の流れで", d, DIM, 21) + floor(); },
  worry(lt, c) { const p = seg(lt, c.pay - .2, .4), f = seg(lt, c.fire - .2, .4), b = seg(lt, c.back - .1, .5), n = seg(lt, c.none - .2, .4);
    const face = b > .5 ? "tired" : f > .5 ? "smile" : "normal";
    return floor() + A("front", 210, 326, 1.15, { face }) + chip(450, 50, "給料", p, DIM, 120) + chip(590, 50, "将来", p, DIM, 120) + txt(730, 80, "…物足りない", p, DIM, 21, "start")
      + box(380, 120, 260, 80, f, PANEL, ORANGE, 3, 16) + ico("play", 400, 138, ORANGE, f, lt, 1) + txt(540, 170, "成功者の動画", f, INK, 22) + txt(700, 150, "→ 燃える", f * (1 - b), ORANGE, 22, "start") + txt(700, 150, "→ 翌日、元どおり", b, DIM, 22, "start")
      + cross(420, 260, n, ORANGE, 12) + txt(445, 268, "退職", n, DIM, 22, "start") + cross(560, 260, n, ORANGE, 12) + txt(585, 268, "大きな出費", n, DIM, 22, "start"); },
  a0700(lt, c) { const g = seg(lt, c.go - .3, .4), e = seg(lt, c.end - .1, .3), t = cl((lt - c.go) / Math.max(c.end - c.go, .5));
    const reps = Math.min(5, Math.floor(t * 5.999)), bob = g * (1 - e) * (Math.sin(t * 5 * Math.PI * 2 - Math.PI / 2) * .5 + .5), th = e ? 0 : lerp(0, lerp(58, 68, bob), g);
    let s = floor() + dayline(0) + `<rect x="80" y="70" width="120" height="260" rx="6" fill="${DARK}" stroke="#3a5563" stroke-width="4"/><circle cx="182" cy="206" r="6" fill="#a9c3cc"/>` + txt(140, 356, "玄関", 1, DIM, 16);
    s += `<g transform="rotate(${th} 330 326)">${A("side", 330, 326, 1.15, { arm: -th * (g && !e ? 1 : 0), face: e ? "smile" : "focus" })}</g>`;
    return s + txt(700, 170, `${reps}`, g, mix(INK, MINT, e), 110) + txt(780, 170, "/ 5", g, DIM, 34, "start") + txt(700, 240, "それで終わり", e, MINT, 28) + check(640, 290, e, MINT, 2) + fic(); },
  m0700(lt, c) { const t = seg(lt, c.tp - .2, .4), k = seg(lt, c.bars - .2, .8);
    let s = A("front", 905, 326, .62, { face: "focus" }) + slots(60, ["朝7時", "玄関で", "腕立て5回"], [t, t, t], MINT);
    [[36.5, ORANGE, "書かない"], [91, MINT, "一文を書いた"]].forEach(([v, col, l], i) => { const x = 250 + i * 240, h = v * 1.05 * k;
      s += box(x - 50, 330 - h, 100, h, k, col, "none", 0, 6) + txt(x, 322 - h - 8, i ? "91%" : "35〜38%", k, col, 22) + txt(x + 120 * (i ? 1 : -1) * 0 + 0, 352, l, k, col, 16); });
    return s + txt(720, 300, "著者が紹介する研究（運動・2週間）", k, BLUE, 16) + `<line x1="160" y1="330" x2="580" y2="330" stroke="#3a5563" stroke-width="3" opacity="${k}"/>`; },
  m0700b(lt, c) { const r = seg(lt, c.rule - .2, .4), k = seg(lt, c.small - .1, .8), g = seg(lt, c.go - .2, .5);
    const w = lerp(260, 72, k), h = lerp(150, 72, k), cx = lerp(250, 640, k);
    return chip(480, 20, "2分ルール", r, MINT, 220) + ring(640, 180, 96, k, k) + box(cx - w / 2, 180 - h / 2, w, h, r, mix("#3a5563", MINT, k), "none", 0, 16)
      + txt(cx, 190, "新しい習慣", r * (1 - k), INK, 28) + txt(640, 316, "2分以内でできる形に", k, MINT, 24)
      + txt(250, 300, "始めてしまえば、続けるのは楽", g, ORANGE, 22) + arrow(250, 250, 250 + 120 * g, 250, g, ORANGE, 4); },
  a0810(lt, c) { const tr = seg(lt, c.train - .3, .5), ap = seg(lt, c.app - .2, .4), n = Math.min(10, Math.floor(cl((lt - c.app) / 2.8) * 10.99));
    let s = box(60, 60, 840, 270, tr, DARK, "#a9c3cc", 4, 22);
    for (let i = 0; i < 3; i++) { s += box(110 + i * 270, 90, 210, 110, tr, "#12303f", "#3a5563", 2, 10); for (let j = 0; j < 3; j++) { const x = 110 + i * 270 + ((j * 90 - lt * 160) % 210 + 210) % 210; s += `<rect x="${x}" y="${150 + j * 12}" width="40" height="5" rx="2" fill="#5a7480" opacity="${tr * .7}"/>`; } }
    [180, 330, 640, 790].forEach(x => s += `<line x1="${x}" y1="60" x2="${x}" y2="96" stroke="#a9c3cc" stroke-width="3" opacity="${tr}"/><circle cx="${x}" cy="104" r="9" fill="none" stroke="#a9c3cc" stroke-width="3" opacity="${tr}"/>`);
    s += A("side", 400, 326, 1.15, { arm: -78, face: "focus" }) + phone(470, 168, ap, "", -10);
    s += box(560, 210, 260, 96, ap, PANEL, MINT, 3, 14) + txt(690, 248, "英単語", ap, MINT, 20) + txt(690, 288, `${n} / 10`, ap, INK, 30) + chip(690, 320 - 300 + 0, "", 0) ;
    return dayline(1) + s + cross(180, 268, ap, ORANGE, 12) + txt(205, 276, "SNSは、あとで", ap, DIM, 19, "start") + fic(); },
  m0810(lt, c) { const n = seg(lt, c.no - .2, .4), p = seg(lt, c.plan - .2, .5);
    return why(1, 80, 20) + A("side", 160, 326, .85, { arm: -78, face: "focus" })
      + box(330, 80, 230, 80, 1 - n * .6, PANEL, "#3a5563", 2.5, 14) + txt(445, 130, "どうしよう？", 1 - n * .6, DIM, 24) + cross(445, 120, n, ORANGE, 30)
      + arrow(330, 230, 330 + 230 * p, 230, p, MINT, 4.5) + box(580, 190, 320, 80, p, PANEL, MINT, 3.5, 14) + txt(740, 240, "決めた計画に従うだけ", p, MINT, 24)
      + txt(445, 310, "その瞬間に、決断しなくていい", n, INK, 22); },
  a1230(lt, c) { const m = seg(lt, c.memo - .2, .4), text = "今夜21時、自分の机で、資料を開く", k = Math.floor(cl((lt - c.type) / 3) * text.length);
    return dayline(2) + floor() + box(600, 220, 260, 14, 1, "#3a5563", "none", 0, 4) + box(620, 234, 12, 96, 1, DARK, "none", 0, 3) + box(828, 234, 12, 96, 1, DARK, "none", 0, 3)
      + box(680, 196, 70, 24, 1, "#a9c3cc", "none", 0, 8) + txt(715, 190, "お弁当", 1, DIM, 14)
      + A("side", 560, 326, 1.15, { arm: -70, face: "focus" }) + phone(620, 150, m, "", 10)
      + box(80, 70, 420, 170, m, "#0f1f27", "#a9c3cc", 3, 22) + txt(110, 108, "メモ", m, DIM, 18, "start")
      + txt(110, 160, text.slice(0, Math.min(k, 9)), m, INK, 28, "start") + txt(110, 204, text.slice(9, Math.max(k, 9)), m, ORANGE, 28, "start") + fic(); },
  m1230(lt, c) { const o = [seg(lt, c.s1 - .15, .3), seg(lt, c.s2 - .15, .3), seg(lt, c.s3 - .15, .3)], q = seg(lt, c.q - .2, .4);
    return why(1, 80, 20) + slots(130, [o[0] > .5 ? "今夜21時" : "", o[1] > .5 ? "自分の机で" : "", o[2] > .5 ? "資料を開く" : ""], o)
      + chip(300, 260, "やる気", q, DIM, 150) + `<line x1="232" y1="282" x2="${232 + 136 * q}" y2="282" stroke="${ORANGE}" stroke-width="4" opacity="${q}"/>` + arrow(395, 282, 455, 282, q, MINT, 4)
      + box(470, 254, 200, 56, q, PANEL, MINT, 3.5, 28) + txt(570, 292, "明確さ", q, MINT, 28) + txt(700, 290, "が足りない", q, INK, 22, "start"); },
  a1930(lt, c) { const h = seg(lt, c.home - .3, .5), so = seg(lt, c.sofa - .2, .5), p = seg(lt, c.phone - .2, .4), night = seg(lt, c.phone + .6, 1.5);
    const x = lerp(150, 480, so), y = lerp(326, 372, so);
    let s = `<rect x="70" y="50" width="130" height="110" rx="8" fill="${mix("#27507f", NIGHT, night)}" stroke="#3a5563" stroke-width="5"/><circle cx="170" cy="84" r="13" fill="${CREAM}" opacity="${.3 + night * .7}"/>`;
    const who = `<clipPath id="seat"><rect x="0" y="0" width="960" height="${lerp(330, 300, so)}"/></clipPath><g clip-path="url(#seat)">${A("front", x, y, 1.15, { face: night > .5 ? "tired" : "normal" })}</g>`;
    s += so > .01 ? sofa(who) : sofa("") + who;
    s += phone(500, 236, p) + txt(800, 120, `${night > .5 ? "23" : "19"}:${night > .5 ? "00" : "30"}`, 1, mix(INK, ORANGE, night), 54) + txt(800, 170, "気づけば、夜", night, ORANGE, 24);
    return dayline(3) + floor() + s + fic(); },
  a1930b(lt, c) { const o = seg(lt, c.open - .2, .4), t = seg(lt, c.two - .2, .4);
    return dayline(3) + floor() + desk(500, 230, 320) + laptop(600, 230, o, cl((lt - c.open) * 1.6)) + A("side", 480, 326, 1.15, { arm: -66, face: "focus" })
      + phone(860, 216, 0) + cross(871, 200, o, ORANGE, 10) + txt(871, 186, "あとで", o, DIM, 14)
      + ring(180, 150, 70, cl((lt - c.two) / 2), t, MINT, "2分", 30) + txt(180, 260, "1行だけ", t, MINT, 24) + fic(); },
  m1930(lt, c) { const st = seg(lt, c.stop - .1, .4), sh = seg(lt, c.show - .2, .4); let s = "";
    s += ring(200, 150, 90, cl(lt / Math.max(c.stop, .5)), 1, mix(ORANGE, MINT, st)) + `<rect x="170" y="120" width="60" height="60" rx="10" fill="${MINT}" opacity="${st}"/>`
      + txt(200, 162, `${Math.floor(cl(lt / Math.max(c.stop, .5)) * 2)}:00`, 1 - st, INK, 40) + txt(200, 290, "2分やったら、やめる", st, MINT, 22);
    "月火水木金".split("").forEach((d, i) => { const x = 420 + i * 100, o = seg(lt, c.show + i * .18, .25);
      s += txt(x + 32, 120, d, 1, DIM, 20) + box(x, 136, 64, 64, 1, PANEL, o > 0 ? MINT : "#3a5563") + check(x + 16, 170, o, MINT); });
    return s + txt(670, 260, "目的は、毎回取りかかること", sh, ORANGE, 24); },
  a2100(lt, c) { const ov = seg(lt, c.over - .1, .5), g = seg(lt, c.give - .2, .4);
    let s = box(80, 60, 520, 250, 1, DARK, "#3a5563", 3, 14); for (let i = 0; i < 4; i++) s += box(110 + i * 120, 90, 90, 60, 1, ov > .5 ? "#2b4f63" : "#12303f", "none", 0, 4);
    s += desk(230, 230, 300) + laptop(330, 230, 1, 3) + A("front", 380, 326, 1.05, { face: "tired", jacket: true });
    return dayline(4) + floor() + `<g opacity=".9">${s}</g>` + txt(780, 130, "21:00", 1, ORANGE, 54) + txt(780, 180, "まだ会社…", ov, ORANGE, 24)
      + box(650, 220, 260, 70, g, PANEL, "#3a5563", 2.5, 35) + txt(780, 264, "今日はもういいや", g, DIM, 23) + fic(); },
  m2100(lt, c) { const i = seg(lt, c.if - .2, .4), a = seg(lt, c.auth - .2, .4);
    return box(80, 70, 360, 84, i, PANEL, ORANGE, 3, 16) + txt(260, 122, "もし残業になったら", i, INK, 26) + arrow(460, 112, 510, 112, i, ORANGE, 4) + box(530, 70, 350, 84, i, PANEL, ORANGE, 3, 16) + txt(705, 122, "寝る前に1行だけ書く", i, INK, 26)
      + txt(80, 60, "例（TRY LOG作）", i, ORANGE, 17, "start")
      + box(80, 220, 360, 70, a, PANEL, MINT, 3, 16) + txt(260, 264, "もし 〜 なら", a, MINT, 26) + arrow(460, 255, 510, 255, a, MINT, 4) + box(530, 220, 350, 70, a, PANEL, MINT, 3, 16) + txt(705, 264, "〜 する", a, MINT, 26)
      + txt(80, 210, "型（著者の提案）", a, MINT, 17, "start"); },
  a2300(lt, c) { const w = seg(lt, c.write - .2, .4), l = seg(lt, c.less - .2, .4);
    return dayline(5) + floor() + `<rect x="80" y="50" width="130" height="110" rx="8" fill="${NIGHT}" stroke="#3a5563" stroke-width="5"/><circle cx="170" cy="84" r="13" fill="${CREAM}"/>`
      + desk(420, 230, 300) + laptop(500, 230, w, cl((lt - c.write) * 1.5) * .34) + `<circle cx="690" cy="150" r="60" fill="${CREAM}" opacity=".08"/><path d="M670 230 l10 -60 h20 l10 60" fill="#3a5563"/><circle cx="690" cy="166" r="14" fill="${CREAM}" opacity=".9"/>`
      + A("side", 400, 326, 1.15, { arm: -66, face: l > .5 ? "smile" : "focus" }) + txt(820, 290, "予定：21時に資料", l, DIM, 20) + txt(820, 320, "→ 実際：寝る前に1行", l, ORANGE, 20) + fic(); },
  m2300(lt, c) { const a = seg(lt, c.q - .2, .5), b = seg(lt, c.q2 - .2, .4);
    return txt(250, 210, "0", 1, DIM, 140) + arrow(330, 170, 330 + 120 * b, 170, b, MINT, 5) + txt(560, 210, "1行", b, MINT, 140)
      + txt(480, 290, "思っていたより少なくても、何もしないより、ずっといい。", a, INK, 23)
      + txt(480, 330, "“It’s far better to do less than you hoped than to do nothing at all.” — James Clear", a, DIM, 16); },
  sum(lt, c) { let s = dayline(-1, 1, 5);
    [["a", "入口を2分にする", "04", "laptop"], ["b", "いつ・どこでを決める", "05", "note"], ["c", "崩れた時の「もし〜なら」", "05", "pen"]].forEach(([k, t, n, ic], i) => { const o = seg(lt, c[k] - .2, .35), x = 70 + i * 280;
      s += box(x, 80 - (1 - o) * 12, 260, 220, o, PANEL, MINT, 3, 18) + ico(ic, x + 108, 110, MINT, o, lt + i, 1) + txt(x + 130, 210, t, o, INK, i === 2 ? 20 : 22) + txt(x + 130, 260, `くわしくは ${n}`, o, DIM, 16); });
    return s; },
  honest(lt, c) { let s = "";
    [["Aさん", "架空の人物", "fic"], ["給料・副業の収入", "上がる保証なし", "pay"], ["紹介した研究", "運動・2週間", "study"]].forEach(([l, r, k], i) => { const o = seg(lt, c[k] - .2, .35), y = 50 + i * 96;
      s += box(110, y, 740, 72, o, PANEL, "#3a5563", 2.5, 14) + txt(140, y + 46, l, o, INK, 26, "start") + txt(820, y + 46, r, o, ORANGE, 26, "end"); });
    return s; },
  you(lt, c) { const q = seg(lt, c.q - .2, .4), m = seg(lt, c.com - .2, .4), b = Math.floor(lt * 1.2) % 3;
    return slots(110, ["", "", ""], [q, q, q], ORANGE, lt, b) + ico("chat", 440, 230, ORANGE, m, lt, 1.6) + txt(480, 340, "一文だけ、コメントで", m, INK, 22); },
  end(lt, c) { const t = seg(lt, c.two - .3, .5); let s = dayline(-1, 1, 5);
    SLOTS.forEach((_, i) => { s += ring(160 + i * 128, 110, 30, cl((lt - c.two) * 1.5 - i * .25), t, MINT, "2分", 15); });
    return s + floor() + A("front", 480, 326, .75, { face: "smile" }); },
};
finishArt();
