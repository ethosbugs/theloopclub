/* TheLoop · escena de scroll
   La estrella crece con el scroll hasta llenar la pantalla de azul → los ojos se cierran y abren →
   con la pantalla ya llena aparecen la L y la P y los ojos pasan a ser las dos "O" de LOOP.
   Todo está dibujado con los contornos vectorizados de las imágenes oficiales (assets/brand-paths.js). */
import { BRAND } from "./assets/brand-paths.js";

const NS = "http://www.w3.org/2000/svg";
const NAVY = "#01165A";
const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const out = (x) => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, t) => a + (b - a) * t;

export function initStage({ reduceMotion }) {
  const stage = $("stage"), svg = $("stageSvg"), intro = $("stageIntro"), hint = $("stageHint"), outro = $("stageOutro");
  if (!stage || !svg) return;

  const S = BRAND.star, ANCHOR = S.anchor, EYES = S.eyes, LOOP = BRAND.loop;
  const [lx0, ly0, lx1, ly1] = BRAND.loopbox, lcx = (lx0 + lx1) / 2, lcy = (ly0 + ly1) / 2;
  const mk = (tag, attrs = {}, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };

  /* --- capas (de atrás hacia delante) --- */
  const bg = mk("rect", { fill: NAVY, opacity: 0 });
  const body = mk("path", { d: S.body, fill: NAVY });
  const eyeEl = EYES.map((e) => {
    const g = mk("g"); mk("path", { d: e.outer, fill: "#fff" }, g); if (e.pupil) mk("path", { d: e.pupil, fill: NAVY }, g); return g;
  });
  // letras de LOOP: [L, O, O, P]
  const glyph = LOOP.map((gl) => {
    const g = mk("g"); mk("path", { d: [gl.outer, ...gl.holes].join(""), fill: "#fff", "fill-rule": "evenodd" }, g); return g;
  });
  const oEl = [glyph[1], glyph[2]], Lg = glyph[0], Pg = glyph[3];
  const setT = (el, tx, ty, sx, sy, cx, cy) => el.setAttribute("transform", `translate(${tx} ${ty}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`);

  /* --- medidas dependientes del viewport --- */
  let W = 0, H = 0, u0 = 0, uCover = 0, uEyeMax = 0, k = 1, loopY = 0, startY = 0, len = 1, top = 0;
  function layout() {
    W = innerWidth; H = innerHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    bg.setAttribute("width", W); bg.setAttribute("height", H);
    const h0 = Math.min(0.36 * H, (0.62 * W) / 1.1);
    u0 = h0 / S.bbox.h;
    loopY = 0.44 * H; startY = 0.64 * H;
    const dmax = Math.hypot(W / 2, Math.max(loopY, H - loopY));
    uCover = Math.max(u0 * 1.5, (dmax * 1.06) / S.rin);
    uEyeMax = Math.min((0.88 * W) / 430, (0.42 * H) / 177);
    k = Math.min(0.86 * W, 1000) / (lx1 - lx0);
    const r = stage.getBoundingClientRect();
    top = r.top + scrollY; len = Math.max(1, stage.offsetHeight - H);
  }

  function render(p) {
    const ex = io(seg(p, 0.06, 0.5));                                    // expansión
    const ub = Math.exp(lerp(Math.log(u0), Math.log(uCover), ex));        // escala del cuerpo (logarítmica)
    const ue = Math.min(ub, uEyeMax);                                    // los ojos no crecen sin límite
    const My = lerp(startY, loopY, ex), Mx = W / 2;
    setT(body, Mx, My, ub, ub, ANCHOR[0], ANCHOR[1]);
    bg.setAttribute("opacity", clamp((ex - 0.72) / 0.28));

    // parpadeos: 1) normal  2) cierra → los ojos pasan a ser las O → abre
    const tri = (a, b) => { const t = seg(p, a, b); return Math.sin(Math.PI * t); };
    let blink = 1 - 0.93 * tri(0.52, 0.58);
    const close2 = seg(p, 0.64, 0.69), open2 = seg(p, 0.73, 0.79);
    if (p >= 0.64) blink = 1 - 0.93 * (p < 0.73 ? out(close2) : 1 - out(open2));
    const morph = io(seg(p, 0.67, 0.73));                                // desplazamiento ojo → O con los ojos cerrados
    const swapped = p >= 0.73;

    EYES.forEach((e, i) => {
      const ex0 = Mx + (e.info.cx - ANCHOR[0]) * ue, ey0 = My + (e.info.cy - ANCHOR[1]) * ue;
      const O = LOOP[1 + i], ox = Mx + (O.info.cx - lcx) * k, oy = loopY + (O.info.cy - lcy) * k;
      const sEye = ue, sO = (k * O.info.w) / e.info.w;
      const tx = lerp(ex0, ox, morph), ty = lerp(ey0, oy, morph), s = lerp(sEye, sO, morph);
      setT(eyeEl[i], tx, ty, s, s * blink, e.info.cx, e.info.cy);
      eyeEl[i].style.display = swapped ? "none" : "";
      setT(oEl[i], ox, oy, k, k * blink, O.info.cx, O.info.cy);
      oEl[i].style.display = swapped ? "" : "none";
    });
    // L y P aparecen cuando los ojos se vuelven a abrir (pantalla ya llena)
    const lp = out(seg(p, 0.745, 0.82));
    [[Lg, LOOP[0], -1], [Pg, LOOP[3], 1]].forEach(([g, gl, dir]) => {
      const x = Mx + (gl.info.cx - lcx) * k + dir * (1 - lp) * 60, y = loopY + (gl.info.cy - lcy) * k;
      setT(g, x, y, k, k, gl.info.cx, gl.info.cy); g.setAttribute("opacity", lp);
    });

    // textos HTML
    intro.style.opacity = 1 - seg(p, 0.03, 0.14); intro.style.visibility = p > 0.15 ? "hidden" : "visible";
    hint.style.opacity = 1 - seg(p, 0.0, 0.05);
    const o = out(seg(p, 0.85, 0.93));
    outro.style.opacity = o; outro.style.transform = `translateY(${(1 - o) * 24}px)`; outro.style.pointerEvents = o > 0.6 ? "auto" : "none";
    outro.style.visibility = o > 0 ? "visible" : "hidden";
  }

  /* --- scroll --- */
  let raf = 0, last = -1;
  const frame = () => { raf = 0; const p = clamp((scrollY - top) / len); if (p !== last) { last = p; render(p); } };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const resize = () => { layout(); last = -1; frame(); };

  if (reduceMotion) {            // sin animación: se muestra el resultado final (LOOP sobre azul)
    stage.style.height = "100svh"; stage.classList.add("is-static");
    layout(); render(1); addEventListener("resize", () => { layout(); render(1); }); return;
  }
  layout(); render(0);
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", resize);
  addEventListener("load", resize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  frame();
}
