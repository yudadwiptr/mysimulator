// Isolated-world helper injected into every frame. It only wakes up inside frames
// created by the studio and talks to the studio through postMessage:
//   → nav (url/title/top colour), scroll, hello
//   ← config (touch cursor), scrollTo, back, forward, reload
(() => {
  if (window.top === window) return;
  let name = '';
  try {
    name = window.name || '';
  } catch (_) {
    return;
  }
  if (!name.startsWith('__msim__') || window.__msimAgent) return;
  window.__msimAgent = true;

  let cfg = {};
  try {
    cfg = JSON.parse(name.slice(8)) || {};
  } catch (_) {}

  const post = (m) => {
    try {
      window.parent.postMessage(Object.assign({ __msim: 1 }, m), '*');
    } catch (_) {}
  };

  const cursor = (r, fill) =>
    `url("data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='${r}' fill='${fill}' stroke='white' stroke-width='2'/></svg>`
    )}") 16 16, auto`;

  const css =
    (cfg.hide
      ? // phones/tablets use overlay scrollbars that take no space: hide every scrollbar,
        // including ones a site styles on inner containers, and drop any reserved gutter
        'html{scrollbar-gutter:auto!important}' +
        '*{scrollbar-width:none!important}' +
        '*::-webkit-scrollbar{display:none!important;width:0!important;height:0!important;background:transparent!important}'
      : '') +
    `html[data-msim-touch],html[data-msim-touch] *{cursor:${cursor(12, 'rgba(20,20,24,.28)')}!important}` +
    `html[data-msim-touch][data-msim-press],html[data-msim-touch][data-msim-press] *{cursor:${cursor(9, 'rgba(20,20,24,.5)')}!important}`;

  let touch = false;
  const html = () => document.documentElement;

  const ensureStyle = () => {
    const root = html();
    if (!root) return;
    if (!document.getElementById('__msim-style')) {
      const s = document.createElement('style');
      s.id = '__msim-style';
      s.textContent = css;
      (document.head || root).appendChild(s);
    }
    if (touch !== root.hasAttribute('data-msim-touch')) root.toggleAttribute('data-msim-touch', touch);
  };

  // --- colour of whatever sits at the very top of the page (status bar tint)
  const isClear = (c) => !c || c === 'transparent' || /rgba\(.*,\s*0\)$/.test(c);
  const topColor = () => {
    for (const m of document.querySelectorAll('meta[name="theme-color"]')) {
      const media = m.getAttribute('media');
      if (m.content && (!media || matchMedia(media).matches)) return m.content;
    }
    let el = document.elementFromPoint(Math.max(1, innerWidth / 2), 1);
    while (el && el !== document.documentElement) {
      const c = getComputedStyle(el).backgroundColor;
      if (!isClear(c)) return c;
      el = el.parentElement;
    }
    const b = document.body && getComputedStyle(document.body).backgroundColor;
    if (!isClear(b)) return b;
    const h = getComputedStyle(document.documentElement).backgroundColor;
    return isClear(h) ? '#ffffff' : h;
  };

  let last = '';
  const report = () => {
    ensureStyle();
    if (!document.body) return;
    let color = '#ffffff';
    try {
      color = topColor();
    } catch (_) {}
    const sig = location.href + '|' + document.title + '|' + color;
    if (sig === last) return;
    last = sig;
    post({ kind: 'nav', href: location.href, title: document.title, color });
  };

  let ignoreUntil = 0;
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking || Date.now() < ignoreUntil) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const se = document.scrollingElement || document.documentElement;
        const max = se.scrollHeight - innerHeight;
        post({ kind: 'scroll', ratio: max > 0 ? se.scrollTop / max : 0 });
      });
    },
    { passive: true }
  );

  window.addEventListener('message', (e) => {
    if (e.source !== window.parent) return;
    const d = e.data;
    if (!d || d.__msim !== 1) return;
    switch (d.kind) {
      case 'config':
        touch = !!d.touch;
        ensureStyle();
        break;
      case 'scrollTo': {
        ignoreUntil = Date.now() + 250;
        const se = document.scrollingElement || document.documentElement;
        se.scrollTop = d.ratio * (se.scrollHeight - innerHeight);
        break;
      }
      case 'back':
        history.back();
        break;
      case 'forward':
        history.forward();
        break;
      case 'reload':
        location.reload();
        break;
    }
  });

  window.addEventListener('mousedown', () => html() && html().setAttribute('data-msim-press', ''), true);
  window.addEventListener('mouseup', () => html() && html().removeAttribute('data-msim-press'), true);

  ensureStyle();
  document.addEventListener('DOMContentLoaded', report);
  window.addEventListener('load', report);
  window.addEventListener('hashchange', report);
  window.addEventListener('popstate', report);
  setInterval(report, 800);
  post({ kind: 'hello' });
})();
