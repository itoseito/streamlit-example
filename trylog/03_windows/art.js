// 飛行機の窓の絵。lt=場面内の秒, c=合図の秒
const BLUE = "#5aa2f0";
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const cabinWindow = (lt, hl = 0) => { let s = `<rect x="150" y="14" width="240" height="410" rx="96" fill="#263a47"/>
  <rect x="192" y="52" width="156" height="300" rx="70" fill="#3f78a8" stroke="${mix("#a9bcc4", MINT, hl)}" stroke-width="${10 + hl * 4}"/>`;
  [[150, 60], [200, 84], [176, 108]].forEach((cl2, i) => { const x = 214 + ((cl2[0] + lt * (14 + i * 6)) % 90);
    s += `<rect x="${x}" y="${cl2[1] + 96}" width="${46 - i * 6}" height="6" rx="3" fill="#e9f3f6" opacity=".9"/>`; });
  return s + txt(270, 398, "客室の窓", 1, MINT, 20); };
function fuselage(lt, fill, push) { const R = 112 * (1 + push * .035 + push * .012 * Math.sin(lt * 5)); let s = "";
  for (let i = 0; i < 16; i++) { const a = rnd(i) * 6.283, r = 150 + rnd(i + 50) * 70;
    s += `<circle cx="${270 + Math.cos(a) * r * 1.15 + Math.sin(lt + i) * 4}" cy="${215 + Math.sin(a) * r * .95}" r="3.5" fill="#8fb7c4" opacity=".55"/>`; }
  s += `<circle cx="270" cy="215" r="${R}" fill="#263a47" stroke="#a9c3cc" stroke-width="6"/>`;
  for (let i = 0; i < 46; i++) { const a = rnd(i + 200) * 6.283, r = 30 + Math.sqrt(rnd(i + 300)) * 66, on = cl(fill * 46 - i);
    s += `<circle cx="${270 + Math.cos(a) * r + Math.sin(lt * 2 + i) * 3}" cy="${215 + Math.sin(a) * r + Math.cos(lt * 2 + i * 1.3) * 3}" r="3.5" fill="#e3f3f6" opacity="${(i < 10 ? 1 : on) * .9}"/>`; }
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, p = (lt * .6 + i * .13) % 1, r1 = R + 10 + p * 10, r2 = R + 38 + p * 14;
    s += arrow(270 + Math.cos(a) * r1, 215 + Math.sin(a) * r1, 270 + Math.cos(a) * r2, 215 + Math.sin(a) * r2, push * Math.sin(p * Math.PI)); }
  return s; }
// 壁の中を流れる力の線。hole=窓の有無, k=角の丸み(0=四角,1=丸), flow=線の濃さ
function wall(lt, { hole = 0, k = 0, flow = 1, pull = 0, glow = 0, crack = 0 } = {}) {
  let s = `<rect x="60" y="30" width="420" height="390" rx="14" fill="#263a47"/>`;
  const hw = 74, hh = 96, cx = 270, cy = 225, ramp = 26 + 44 * k;
  for (let i = 0; i < 13; i++) { const y0 = 54 + i * 28.5, dy = y0 - cy; let d = "";
    for (let x = 60; x <= 480; x += 5) { let y = y0;
      if (hole > 0 && Math.abs(dy) < hh + 14) { const rank = (hh + 14 - Math.abs(dy)) / 28.5, target = cy + Math.sign(dy || 1) * (hh + 9 + (3.6 - rank) * 5.5 * (1 + k * .35));
        let f = cl((hw + ramp - Math.abs(x - cx)) / ramp); f = k > 0 ? lerp(f, ease(f), k) : f; y = y0 + (target - y0) * f * hole; }
      d += (d ? "L" : "M") + x + " " + y.toFixed(1); }
    s += `<path d="${d}" stroke="${MINT}" stroke-width="2.6" fill="none" stroke-dasharray="14 9" stroke-dashoffset="${-lt * 46}" opacity="${flow * .85}"/>`; }
  const r = k * 52;
  s += `<rect x="${cx - hw}" y="${cy - hh}" width="${hw * 2}" height="${hh * 2}" rx="${r}" fill="#12303f" stroke="#eef5f7" stroke-width="4" opacity="${hole}"/>`;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy], i) => { const x = cx + sx * (hw - r * .3), y = cy + sy * (hh - r * .3), pu = .75 + .25 * Math.sin(lt * 6 + i);
    s += `<circle cx="${x}" cy="${y}" r="${20 * pu}" fill="${ORANGE}" opacity="${glow * .5}"/><circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${ORANGE}" stroke-width="3.5" opacity="${glow}"/>`;
    s += `<path d="M${x} ${y} l${sx * 16 * crack} ${sy * 10 * crack} l${sx * 5 * crack} ${sy * 15 * crack} l${sx * 13 * crack} ${sy * 6 * crack}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${cl(crack * 3)}"/>`; });
  [110, 225, 340].forEach(y => { s += arrow(56, y, 22 - pull * 6, y, pull, BLUE) + arrow(484, y, 518 + pull * 6, y, pull, BLUE); });
  return s; }
window.ART = {
  hook(lt, c) { return cabinWindow(lt, seg(lt, c.corner - .1, .4)); },
  air(lt, c) { const t = seg(lt, c.thin - .2, .5), f = seg(lt, c.fill, 1.4);
    return fuselage(lt, f, 0) + txt(270, 40, "外は空気が薄い", t, BLUE, 20) + txt(270, 222, "機内", f, INK, 22) + txt(270, 444, "空気を詰めている", f, MINT, 20); },
  balloon(lt, c) { const p = seg(lt, c.push - .2, .6); return fuselage(lt, 1, p) + txt(270, 222, "機内", 1, INK, 22) + txt(270, 444, "内側から、外へ押す力", p, ORANGE, 20); },
  skin(lt, c) { const p = seg(lt, c.pull - .2, .5), f = seg(lt, c.flow - .3, .6);
    return wall(lt, { flow: .15 + f * .85, pull: p }) + txt(270, 444, "機体の壁（一部を拡大）", 1, "#cfe3e6", 17); },
  square(lt, c) { const h = seg(lt, c.hole - .2, .5), g = seg(lt, c.corner - .15, .4);
    return wall(lt, { hole: h, pull: 1, glow: g }) + txt(270, 444, "角に、力が集まる", g, ORANGE, 20); },
  crack(lt, c) { const k = seg(lt, c.crack - .1, .9); return wall(lt, { hole: 1, pull: 1, glow: 1, crack: k }) + txt(270, 444, "ひびが入りやすい", k, ORANGE, 20); },
  round(lt, c) { const k = seg(lt, c.round - .1, 1.0), sm = seg(lt, c.smooth - .2, .5);
    return wall(lt, { hole: 1, pull: 1, k, glow: 1 - k }) + txt(270, 444, "なめらかに流れる", sm, MINT, 20); },
  end(lt, c) { return cabinWindow(lt, seg(lt, c.path - .3, .5)); },
};
