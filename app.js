import { firebaseConfig, siteConfig } from "./firebase-config.js";
import { initStage } from "./stage.js";

const FIREBASE_VERSION = "10.14.1";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- ajustes desde firebase-config.js ---------- */
$("#year").textContent = new Date().getFullYear();
if (siteConfig.instagram) $("#igLink").href = siteConfig.instagram;
if (siteConfig.tiktok) { const t = $("#ttLink"); t.href = siteConfig.tiktok; t.hidden = false; }
if (siteConfig.contactEmail) $("#mailLink").href = "mailto:" + siteConfig.contactEmail;

/* ---------- escena de scroll (estrella → LOOP) ---------- */
initStage({ reduceMotion });

/* ---------- titular con efecto máquina de escribir ---------- */
(() => {
  const el = $("#typeLine");
  const parts = [["deja de consumir. empieza a ", false], ["construir.", true]];
  const html = (n) => {
    let left = n, out = "";
    for (const [txt, em] of parts) {
      const chunk = txt.slice(0, Math.max(0, left)); left -= txt.length;
      if (chunk) out += em ? `<em>${chunk}</em>` : chunk;
    }
    return out;
  };
  const total = parts.reduce((a, [t]) => a + t.length, 0);
  if (reduceMotion) { el.innerHTML = html(total); return; }
  let i = 0;
  const step = () => {
    i++;
    el.innerHTML = html(i) + '<span class="cur"></span>';
    if (i < total) setTimeout(step, 45 + Math.random() * 30);
  };
  setTimeout(step, 500);
})();

/* ---------- demo: del prompt a la web ---------- */
(() => {
  const prompt = $("#demoPrompt"), think = $("#demoThink"), site = $("#demoSite");
  if (!prompt) return;
  const txt = "hazme una web para mi proyecto, minimalista y en azul";
  const show = () => { prompt.textContent = txt; think.classList.remove("on"); site.classList.add("on"); };
  if (reduceMotion || !("IntersectionObserver" in window)) { show(); return; }
  let started = false;
  new IntersectionObserver((ents, ob) => {
    if (!ents[0].isIntersecting || started) return; started = true; ob.disconnect();
    let i = 0;
    const type = () => { prompt.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(type, 38); else { think.classList.add("on"); setTimeout(() => { think.classList.remove("on"); site.classList.add("on"); }, 1400); } };
    prompt.classList.add("on"); type();
  }, { threshold: 0.5 }).observe($(".chat"));
})();

/* ---------- revelado al hacer scroll ---------- */
(() => {
  const targets = $$(".section .h2, .section .eyebrow, .big, .card, .vs__card, .steps li, .faq, .final__in > *, .tools, .chat");
  targets.forEach((t) => t.classList.add("rv"));
  const vs = $(".vs");
  if (!("IntersectionObserver" in window) || reduceMotion) { targets.forEach((t) => t.classList.add("in")); vs && vs.classList.add("in"); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.18 });
  targets.forEach((t) => io.observe(t));
  if (vs) io.observe(vs);
})();

/* ---------- formularios de la lista privada (Formspree) ---------- */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const JOINED_KEY = "theloop_joined";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/myeeldyl";

function setMsg(form, text, kind) {
  const m = $(".form__msg", form);
  m.textContent = text || ""; m.classList.toggle("is-err", kind === "err"); m.classList.toggle("is-ok", kind === "ok");
}
function setBusy(form, busy) {
  const b = $("button[type=submit]", form);
  b.disabled = busy;
  $(".btn__label", b).hidden = busy;
  let sp = $(".spin", b);
  if (busy && !sp) { sp = document.createElement("span"); sp.className = "spin"; b.append(sp); }
  if (!busy && sp) sp.remove();
}

$$(".waitlist").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim().toLowerCase();
    if (form.company.value) { form.classList.add("is-done"); setMsg(form, "¡Estás dentro!", "ok"); return; } // honeypot: bots
    if (!EMAIL_RE.test(email) || email.length > 254) { setMsg(form, "Revisa tu email: parece que no es válido.", "err"); form.email.focus(); return; }
    if (!form.consent.checked) { setMsg(form, "Necesitamos que aceptes la política de privacidad para apuntarte.", "err"); return; }
    setMsg(form, ""); setBusy(form, true);
    
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      });

      if (response.ok) {
        try { localStorage.setItem(JOINED_KEY, "1"); } catch {}
        form.classList.add("is-done"); 
        setMsg(form, "¡Estás dentro! Te avisaremos cuando abramos la primera comunidad.", "ok");
      } else {
        setMsg(form, "No hemos podido apuntarte ahora mismo. Inténtalo de nuevo en un momento.", "err");
      }
    } catch (err) {
      console.error("[TheLoop]", err);
      setMsg(form, "No hemos podido apuntarte ahora mismo. Inténtalo de nuevo en un momento.", "err");
    } finally { 
      setBusy(form, false); 
    }
  });
});