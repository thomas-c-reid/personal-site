/* ============================================================
   Thomas Reid — personal site
   ~40 lines of behaviour. No dependencies.
   Everything here is progressive enhancement: with JS off the
   page still reads correctly, it just doesn't animate.
   ============================================================ */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* --- nav: solidify on scroll, highlight the current section ---- */

const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

const links = [...document.querySelectorAll('.nav__links a')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) =>
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id)
    );
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));


/* --- reveal on scroll ------------------------------------------ */

const items = document.querySelectorAll('.reveal');

if (reduced) {
  items.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('is-in'), i * 70);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  items.forEach((el) => io.observe(el));
}


/* --- hero terminal: cycling typewriter -------------------------
   CONTENT SLOT: edit LINES. Each string is typed, held, deleted.
   --------------------------------------------------------------- */

const LINES = [
  'software engineer, belfast',
  'llm evaluation & agent systems',
  'msc artificial intelligence, final year',
  'currently: looking for the next one',
];

const out = document.getElementById('typed');

if (out) {
  if (reduced) {
    out.textContent = LINES[0];
  } else {
    let li = 0, ci = 0, deleting = false;

    (function tick() {
      const line = LINES[li];
      out.textContent = line.slice(0, ci);

      let wait = deleting ? 34 : 62;

      if (!deleting && ci === line.length) {
        deleting = true;
        wait = 2100;
      } else if (deleting && ci === 0) {
        deleting = false;
        li = (li + 1) % LINES.length;
        wait = 420;
      } else {
        ci += deleting ? -1 : 1;
      }

      setTimeout(tick, wait);
    })();
  }
}


/* --- colophon: live status, with static fallback ----------------
   Point STATUS at whatever the home box exposes. Expected shape:
     { host, node, uptime }
   If the fetch fails (box is down, or you're on the CDN copy) the
   static values already in the HTML are left exactly as they are.
   --------------------------------------------------------------- */

const STATUS = null; // e.g. '/api/status'

if (STATUS) {
  fetch(STATUS, { signal: AbortSignal.timeout(2500) })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => {
      Object.entries(d).forEach(([k, v]) => {
        const el = document.querySelector(`[data-status="${k}"]`);
        if (el) el.textContent = v;
      });
      const label = document.querySelector('[data-status="label"]');
      if (label) label.textContent = 'Live — served from home';
    })
    .catch(() => { /* static values stand */ });
}
