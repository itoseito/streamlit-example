// 全動画共通：色・補間・文字・矢印・場面の切り替え。絵は各フォルダの art.js。
const D = window.DATA, $ = id => document.getElementById(id);
const MINT = "#5fd6c3", ORANGE = "#f39a4a", INK = "#f3f7f8", WALL = "#9cc9cf", TEA = "#6e3d2b", ICE = "#27507f";
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = cl(x); return x * x * (3 - 2 * x); };
const seg = (t, start, len) => ease((t - start) / len);          // start から len 秒かけて 0→1
const lerp = (a, b, k) => a + (b - a) * k;
const mix = (c1, c2, k) => { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const a = p(c1), b = p(c2); return "#" + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, "0")).join(""); };
$("tag").textContent = D.tag; $("note").textContent = D.note;

// ---- 部品 ----
const txt = (x, y, s, o = 1, fill = INK, size = 18, anchor = "middle") =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" opacity="${o}" text-anchor="${anchor}">${s}</text>`;
const arrow = (x1, y1, x2, y2, o = 1, col = ORANGE, w = 3.2) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 7;
  return `<g opacity="${o}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none">
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
  <path d="M${x2 - h * Math.cos(a - .5)} ${y2 - h * Math.sin(a - .5)} L${x2} ${y2} L${x2 - h * Math.cos(a + .5)} ${y2 - h * Math.sin(a + .5)}"/></g>`; };
window.TOTAL = D.total;
window.renderAt = function (t) {
  let i = D.timing.findIndex(s => t < s.start + s.dur); if (i < 0) i = D.timing.length - 1;
  const T = D.timing[i], S = D.scenes[i], lt = t - T.start;
  const fin = cl(lt / .35), fout = i === D.timing.length - 1 ? 1 : cl((T.dur - lt) / .25), o = Math.min(fin, fout);
  $("head").textContent = S.head; $("head").style.opacity = o; $("head").style.transform = `translateY(${(1 - fin) * 14}px)`;
  $("cap").textContent = S.caption; $("cap").style.opacity = cl((lt - .15) / .35) * fout;
  $("art").innerHTML = window.ART[S.id](lt, T.cues, T.dur); $("art").style.opacity = o;
  const B = $("badge"); if (B) { const L = (D.badges || {})[S.src]; B.textContent = L || ""; B.className = S.src || ""; B.style.opacity = L ? o : 0; }
  document.querySelector("#bar b").style.width = (t / D.total * 100) + "%";
};

