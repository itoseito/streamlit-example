// TRY LOG のキャラクター「会社員（架空）」。SVGの文字列を返す。
// chara(view, x, y, s, opt)  view: "front" | "side" | "back"   (x,y)=足元の中心, s=大きさ(1で高さ約220)
// opt: face="normal"|"tired"|"focus"|"smile", tie=ネクタイの色, jacket=上着を着るか, arm=腕の角度(度, 横向きのみ)
const CH = { skin: "#f2d2b6", skinS: "#dcb698", hair: "#1d2a33", shirt: "#eef4f6", shirtS: "#c9d6db", pants: "#2c4a5c", pantsS: "#22394a",
  shoe: "#152028", jacket: "#35566a", jacketS: "#2a4555", tie: "#5fd6c3", line: "#0b1820" };
function chara(view = "front", x = 0, y = 0, s = 1, opt = {}) {
  const o = { face: "normal", tie: CH.tie, jacket: false, arm: 0, ...opt }, L = CH.line;
  const g = inner => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
  const R = (x, y, w, h, r, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}"/>`;
  const face = (cx, cy, dir = 0) => { // dir: 0=正面, 1=右向き
    const e = { normal: [`<circle r="3.4"/>`, ""], tired: [`<path d="M-4 0 h8" stroke="${L}" stroke-width="2.6" stroke-linecap="round"/>`, `<path d="M-5 -6 l8 3" stroke="${L}" stroke-width="2" stroke-linecap="round"/>`],
      focus: [`<circle r="3.4"/>`, `<path d="M-5 -7 l9 2" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>`], smile: [`<path d="M-4 1 q4 -5 8 0" stroke="${L}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`, ""] }[o.face];
    const mouth = { normal: `<path d="M-4 0 h8" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>`, tired: `<path d="M-4 2 q4 -3 8 0" stroke="${L}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
      focus: `<path d="M-3 0 h6" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>`, smile: `<path d="M-5 -1 q5 6 10 0" stroke="${L}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` }[o.face];
    const eye = (ex, flip) => `<g transform="translate(${ex} ${cy}) scale(${flip} 1)" fill="${L}">${e[0]}${e[1]}</g>`;
    return dir ? eye(cx + 12, 1) + `<g transform="translate(${cx + 13} ${cy + 17})">${mouth}</g>`
      : eye(cx - 11, -1) + eye(cx + 11, 1) + `<g transform="translate(${cx} ${cy + 17})">${mouth}</g>`; };
  if (view === "front") {
    let s2 = R(-26, -10, 22, 10, 5, CH.shoe) + R(4, -10, 22, 10, 5, CH.shoe)                       // 靴
      + R(-22, -92, 20, 86, 8, CH.pants) + R(2, -92, 20, 86, 8, CH.pants)                            // 脚
      + R(-24, -100, 48, 20, 6, CH.pants);                                                              // 腰
    s2 += R(-42, -164, 16, 62, 8, o.jacket ? CH.jacket : CH.shirtS) + R(26, -164, 16, 62, 8, o.jacket ? CH.jacket : CH.shirtS) // 腕
      + `<circle cx="-34" cy="-98" r="8" fill="${CH.skin}"/><circle cx="34" cy="-98" r="8" fill="${CH.skin}"/>`;
    s2 += R(-30, -170, 60, 76, 16, CH.shirt);                                                          // 胴
    if (o.jacket) s2 += `<path d="M-30 -154 q0 -16 16 -16 h4 l10 40 l10 -40 h4 q16 0 16 16 v60 h-60z" fill="${CH.jacket}"/>`;
    s2 += `<path d="M-9 -170 l9 10 l9 -10" fill="${CH.shirtS}"/>` + `<path d="M-4 -161 h8 l3 34 l-7 9 l-7 -9z" fill="${o.tie}"/>`; // 襟・ネクタイ
    s2 += R(-7, -182, 14, 14, 4, CH.skinS) + `<ellipse cx="0" cy="-210" rx="30" ry="32" fill="${CH.skin}"/>`  // 首・顔
      + `<ellipse cx="-30" cy="-208" rx="5" ry="8" fill="${CH.skinS}"/><ellipse cx="30" cy="-208" rx="5" ry="8" fill="${CH.skinS}"/>`
      + `<path d="M-32 -212 q-2 -36 32 -36 q34 0 32 36 q-6 -18 -24 -20 q-6 8 -22 8 q-12 0 -18 12z" fill="${CH.hair}"/>`; // 髪
    return g(s2 + face(0, -208)); }
  if (view === "side") { // 右向き
    const a = o.arm * Math.PI / 180;
    let s2 = R(-10, -10, 30, 10, 5, CH.shoe) + R(-12, -92, 22, 86, 9, CH.pants) + R(-16, -100, 32, 20, 6, CH.pants);
    s2 += R(-18, -170, 36, 76, 14, o.jacket ? CH.jacket : CH.shirt) + `<path d="M12 -166 l6 4 v30 l-6 -4z" fill="${o.tie}"/>`;
    s2 += `<g transform="rotate(${o.arm} 0 -160)">` + R(-8, -164, 16, 62, 8, o.jacket ? CH.jacketS : CH.shirtS) + `<circle cx="0" cy="-98" r="8" fill="${CH.skin}"/></g>`;
    s2 += R(-6, -182, 14, 14, 4, CH.skinS) + `<ellipse cx="4" cy="-210" rx="27" ry="32" fill="${CH.skin}"/><path d="M29 -212 l6 8 l-6 2z" fill="${CH.skin}"/>`
      + `<ellipse cx="-6" cy="-208" rx="5" ry="8" fill="${CH.skinS}"/>`
      + `<path d="M-24 -200 q-6 -48 30 -48 q30 0 28 28 q-12 -10 -26 -8 q-8 2 -14 14 q-6 8 -18 14z" fill="${CH.hair}"/>`;
    return g(s2 + face(0, -210, 1)); }
  // back
  let s2 = R(-26, -10, 22, 10, 5, CH.shoe) + R(4, -10, 22, 10, 5, CH.shoe) + R(-22, -92, 20, 86, 8, CH.pantsS) + R(2, -92, 20, 86, 8, CH.pantsS) + R(-24, -100, 48, 20, 6, CH.pantsS);
  s2 += R(-42, -164, 16, 62, 8, o.jacket ? CH.jacketS : CH.shirtS) + R(26, -164, 16, 62, 8, o.jacket ? CH.jacketS : CH.shirtS)
    + `<circle cx="-34" cy="-98" r="8" fill="${CH.skinS}"/><circle cx="34" cy="-98" r="8" fill="${CH.skinS}"/>`;
  s2 += R(-30, -170, 60, 76, 16, o.jacket ? CH.jacket : CH.shirtS) + `<path d="M0 -166 v66" stroke="${o.jacket ? CH.jacketS : CH.shirt}" stroke-width="2"/>`;
  s2 += R(-7, -182, 14, 14, 4, CH.skinS) + `<ellipse cx="0" cy="-210" rx="30" ry="32" fill="${CH.skin}"/>`
    + `<ellipse cx="-30" cy="-208" rx="5" ry="8" fill="${CH.skinS}"/><ellipse cx="30" cy="-208" rx="5" ry="8" fill="${CH.skinS}"/>`
    + `<path d="M-31 -196 q-6 -52 31 -52 q37 0 31 52 q-8 6 -31 6 q-23 0 -31 -6z" fill="${CH.hair}"/>`;
  return g(s2);
}
