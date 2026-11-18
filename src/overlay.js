// MY Simulator · overlay UI
// Injected into the active tab. Renders a full-screen studio inside a shadow root
// with up to four live device frames side by side.
(() => {
  'use strict';
  if (window.__msim) {
    try { window.__msim.close(); } catch (_) {}
    return;
  }

  const D = window.MSIM_DEVICES;
  const IC = window.MSIM_ICONS;
  if (!D || !IC) return;

  const isExt = !!(globalThis.chrome && chrome.runtime && chrome.runtime.id);
  const START_URL = window.__MSIM_START_URL || location.href;
  const MAX_SLOTS = 4;

  const ACCENTS = {
    iris: { c: '#8b7bff', ink: '#ffffff', label: 'Iris' },
    lime: { c: '#c4f25e', ink: '#0b0d08', label: 'Lime' },
    sky: { c: '#5ec8ff', ink: '#04121b', label: 'Sky' },
    coral: { c: '#ff7d66', ink: '#1a0905', label: 'Coral' },
    mint: { c: '#48e3ad', ink: '#03130d', label: 'Mint' },
  };
  const FINISHES = {
    graphite: { a: '#45464c', b: '#1b1c20', label: 'Graphite' },
    silver: { a: '#f4f5f7', b: '#b4b8c1', label: 'Silver' },
    titanium: { a: '#cfc6b9', b: '#857c71', label: 'Natural Titanium' },
    midnight: { a: '#3a4a6b', b: '#121a2b', label: 'Midnight' },
    blush: { a: '#f6dcd6', b: '#c69a93', label: 'Blush' },
    sage: { a: '#d2dccb', b: '#869780', label: 'Sage' },
  };
  const BACKDROPS = { aurora: 'Aurora', mesh: 'Mesh', grid: 'Grid', solid: 'Solid' };
  const CATS = [
    ['all', 'All'],
    ['iphone', 'iPhone'],
    ['android', 'Android'],
    ['tablet', 'Tablets'],
    ['desktop', 'Laptops & Desktops'],
    ['special', 'Specials'],
    ['custom', 'Custom'],
  ];
  const FRAMES = {
    island: { b: 12, r: 64, sr: 52, sb: 54 },
    notch: { b: 13, r: 58, sr: 45, sb: 47 },
    home: { b: 16, chin: 80, r: 60, sr: 3, sb: 20 },
    punch: { b: 10, r: 46, sr: 36, sb: 30 },
    fold: { b: 10, r: 32, sr: 22, sb: 28 },
    // book-style foldable (iPhone Duo): open = wide, closed = hinge spine on one edge
    duo: { b: 11, r: 46, sr: 35, sb: 30 },
    'duo-fold': { b: 10, r: 58, sr: 48, rs: 16, srs: 7, spine: 9, sb: 34 },
    tablet: { b: 20, r: 38, sr: 18, sb: 24 },
    watch: { b: 16, r: 62, sr: 46, sb: 0 },
    laptop: { b: 16, top: 20, chin: 30, r: 20, sr: 6, sb: 0 },
    monitor: { b: 14, r: 16, sr: 4, sb: 0 },
    tv: { b: 10, r: 8, sr: 2, sb: 0 },
    kiosk: { b: 30, r: 22, sr: 6, sb: 0 },
  };
  const MOBILE = new Set(['island', 'notch', 'home', 'punch', 'fold']);
  const DUO = new Set(['duo', 'duo-fold']);
  const SUGGEST = ['iphone-18-pro', 'galaxy-s26-ultra', 'iphone-duo-open', 'pixel-11-pro', 'ipad-air-11', 'macbook-air-13'];

  const DEFAULTS = {
    slots: [{ uid: 's1', id: 'iphone-18-pro', land: false }],
    active: 's1',
    theme: 'dark',
    accent: 'iris',
    backdrop: 'aurora',
    finish: 'graphite',
    frame: true,
    labels: true,
    touch: true,
    syncNav: true,
    syncScroll: false,
    zoom: 'fit',
    custom: [],
  };

  // ---------- utils ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
  const uidGen = () => 's' + Math.random().toString(36).slice(2, 8);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const pad = (n) => String(n).padStart(2, '0');
  const hostOf = (u) => {
    try { return new URL(u).host; } catch (_) { return ''; }
  };

  const store = {
    async get() {
      if (isExt) {
        try { return (await chrome.storage.local.get('msim')).msim || null; } catch (_) { return null; }
      }
      try { return JSON.parse(localStorage.getItem('msim-dev') || 'null'); } catch (_) { return null; }
    },
    set(v) {
      if (isExt) {
        try { chrome.storage.local.set({ msim: v }); } catch (_) {}
        return;
      }
      try { localStorage.setItem('msim-dev', JSON.stringify(v)); } catch (_) {}
    },
  };
  const send = (msg) => {
    if (!isExt) return Promise.resolve(null);
    try {
      return chrome.runtime.sendMessage(msg).catch(() => null);
    } catch (_) {
      return Promise.resolve(null);
    }
  };

  // ---------- state ----------
  let S = null;
  const live = new Map(); // uid -> slot runtime
  let lastScale = 1;
  let captureUid = null;
  let popName = null;
  const pick = { q: '', cat: 'all', form: false };
  let saveT = 0;
  const save = () => {
    clearTimeout(saveT);
    saveT = setTimeout(() => store.set(S), 150);
  };

  const allDevices = () => D.list.concat(S.custom);
  const dev = (id) => allDevices().find((d) => d.id === id) || D.list[1];
  const activeSlot = () => S.slots.find((s) => s.uid === S.active) || S.slots[0];
  const canRotate = (d) => !['laptop', 'watch', 'tv'].includes(d.frame);

  // ---------- shell ----------
  const host = document.createElement('msim-root');
  host.setAttribute(
    'style',
    'all:initial!important;position:fixed!important;inset:0!important;z-index:2147483647!important;display:block!important;'
  );
  host.tabIndex = -1;
  const shadow = host.attachShadow({ mode: 'open' });
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(window.__MSIM_CSS || '');
    shadow.adoptedStyleSheets = [sheet];
  } catch (_) {
    const st = document.createElement('style');
    st.textContent = window.__MSIM_CSS || '';
    shadow.appendChild(st);
  }

  const root = document.createElement('div');
  root.className = 'msim';
  root.innerHTML = `
    <div class="backdrop"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div>
    <main class="stage"><div class="rail"></div></main>
    <nav class="dock gl" aria-label="Studio tools">
      <button class="db close" data-act="close" data-tip="Close · Esc">${IC.close}</button>
      <hr>
      <button class="db" data-act="devices" data-pop="devices" data-tip="Devices · D">${IC.devices}</button>
      <button class="db" data-act="add" data-tip="Add device · A">${IC.plus}</button>
      <button class="db" data-act="rotate" data-tip="Rotate · R">${IC.rotate}</button>
      <button class="db" data-act="zoom" data-pop="zoom" data-tip="Zoom · Z">${IC.zoom}<span class="zbadge"></span></button>
      <hr>
      <button class="db" data-act="shot" data-tip="Screenshot · S">${IC.camera}</button>
      <button class="db" data-act="sync" data-tip="Sync navigation">${IC.link}<i class="pip"></i></button>
      <div class="grow"></div>
      <button class="db" data-act="theme" data-tip="Theme · T"></button>
      <button class="db" data-act="help" data-pop="help" data-tip="Shortcuts · ?">${IC.keyboard}</button>
      <button class="db" data-act="settings" data-pop="settings" data-tip="Settings">${IC.sliders}</button>
    </nav>
    <div class="pops"></div>
    <div class="toasts" role="status"></div>`;
  shadow.appendChild(root);

  const $ = (sel) => root.querySelector(sel);
  const stage = $('.stage');
  const rail = $('.rail');
  const dock = $('.dock');
  const pops = $('.pops');
  const toasts = $('.toasts');

  // ---------- look ----------
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const resolvedTheme = () => (S.theme === 'auto' ? (mq.matches ? 'dark' : 'light') : S.theme);
  function applyLook() {
    root.dataset.theme = resolvedTheme();
    root.dataset.backdrop = S.backdrop;
    root.dataset.labels = S.labels ? '1' : '0';
    const a = ACCENTS[S.accent] || ACCENTS.iris;
    root.style.setProperty('--accent', a.c);
    root.style.setProperty('--accent-ink', a.ink);
    const f = FINISHES[S.finish] || FINISHES.graphite;
    root.style.setProperty('--fin-a', f.a);
    root.style.setProperty('--fin-b', f.b);
    $('[data-act="theme"]').innerHTML = resolvedTheme() === 'dark' ? IC.sun : IC.moon;
    syncDock();
  }
  function syncDock() {
    dock.querySelectorAll('[data-pop]').forEach((b) => b.classList.toggle('on', b.dataset.pop === popName));
    $('[data-act="sync"]').classList.toggle('lit', !!S.syncNav);
    $('[data-act="sync"]').dataset.tip = S.syncNav ? 'Sync navigation: on' : 'Sync navigation: off';
    const d = dev(activeSlot().id);
    $('.dock [data-act="rotate"]').disabled = !canRotate(d);
  }

  // ---------- geometry ----------
  function geom(d, land) {
    const F = FRAMES[d.frame] || FRAMES.punch;
    land = !!land && canRotate(d);
    let w = d.w;
    let h = d.h;
    if (land) [w, h] = [h, w];
    let sb = F.sb;
    if (land && (MOBILE.has(d.frame) || d.frame === 'duo-fold')) sb = 0;
    if (d.ua === 'desktop' || d.ua === 'tv') sb = 0;
    const g = { w, h, sb, land, frame: d.frame };

    if (!S.frame) {
      const sr = MOBILE.has(d.frame) || DUO.has(d.frame) ? 30 : d.frame === 'watch' ? 44 : d.frame === 'tablet' ? 18 : 10;
      return Object.assign(g, { b: 0, r: sr, sr, bw: w, bh: h, ow: w, oh: h, bx: 0, by: 0, sx: 0, sy: 0 });
    }

    const b = F.b;
    let sx = b;
    let sy = b;
    let bw = w + 2 * b;
    let bh = h + 2 * b;
    if (d.frame === 'home') {
      if (land) { sx = F.chin; bw = w + 2 * F.chin; } else { sy = F.chin; bh = h + 2 * F.chin; }
    }
    if (d.frame === 'laptop') { sy = F.top; bh = h + F.top + F.chin; }
    // the hinge spine is part of the body: left edge in portrait, bottom edge once rotated
    if (d.frame === 'duo-fold') {
      if (land) bh += F.spine;
      else { bw += F.spine; sx += F.spine; }
    }

    let ow = bw;
    let oh = bh;
    let bx = 0;
    let by = 0;
    const extra = {};
    switch (d.frame) {
      case 'laptop': {
        const baseH = Math.round(clamp(w * 0.013, 16, 26));
        ow = Math.round(bw * 1.15);
        bx = Math.round((ow - bw) / 2);
        oh = bh + baseH;
        extra.baseH = baseH;
        break;
      }
      case 'monitor': {
        const standH = Math.round(clamp(h * 0.16, 80, 220));
        oh = bh + standH + 14;
        extra.standH = standH + 14;
        break;
      }
      case 'kiosk': {
        const standH = Math.round(h * 0.13);
        oh = bh + standH + 20;
        extra.standH = standH + 20;
        break;
      }
      case 'tv': {
        extra.standH = 46;
        oh = bh + 46;
        break;
      }
      case 'watch': {
        const strap = Math.round(h * 0.32);
        by = strap;
        oh = bh + 2 * strap;
        ow = bw + 10;
        extra.strap = strap;
        break;
      }
    }
    return Object.assign(g, { b, r: F.r, sr: F.sr, rs: F.rs || F.r, srs: F.srs || F.sr, spine: F.spine || 0, bw, bh, ow, oh, bx, by, sx, sy }, extra);
  }

  function statusKind(d, g) {
    if (!g.sb) return 'none';
    if (d.frame === 'island' || d.frame === 'notch') return 'ios-ear';
    if (d.frame === 'home') return d.ua === 'ios' ? 'ios-home' : 'android';
    if (d.frame === 'tablet') return d.ua === 'ipad' ? 'ipad' : 'android';
    if (d.frame === 'fold' && d.ua === 'ios') return 'ipad';
    if (DUO.has(d.frame)) return 'duo';
    return 'android';
  }
  function homeKind(d) {
    if (d.frame === 'island' || d.frame === 'notch') return 'bar';
    if (d.frame === 'tablet') return d.ua === 'ipad' ? 'bar' : d.ua === 'androidTab' ? 'pill' : 'none';
    if ((d.frame === 'fold' && d.ua === 'ios') || DUO.has(d.frame)) return 'bar';
    if (d.frame === 'punch' || d.frame === 'fold') return 'pill';
    return 'none';
  }
  function sbarHTML(k) {
    const t = '<span class="t"></span>';
    switch (k) {
      case 'ios-ear':
        return `<div class="e l">${t}</div><div class="e m"></div><div class="e r">${IC.sSignal}${IC.sWifi}${IC.sBatt}</div>`;
      case 'ios-home':
        return `<div class="l">${IC.sSignal}${IC.sWifi}</div>${t}<div class="r">${IC.sBatt}</div>`;
      case 'ipad':
        return `<div class="l">${t}<span class="dt"></span></div><div class="r">${IC.sWifi}${IC.sBatt}</div>`;
      case 'duo':
        return `<div class="r">${t}${IC.sWifi}${IC.sBatt}</div>`;
      case 'android':
        return `<div class="l">${t}</div><div class="r">${IC.aWifi}${IC.aSignal}${IC.aBatt}</div>`;
      default:
        return '';
    }
  }
  function tick() {
    const d = new Date();
    const time = `${d.getHours()}:${pad(d.getMinutes())}`;
    const date = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    root.querySelectorAll('.sbar .t').forEach((el) => { el.textContent = time; });
    root.querySelectorAll('.sbar .dt').forEach((el) => { el.textContent = date; });
  }

  function profileOf(d) {
    const p = D.UA[d.ua];
    const hide = d.ua !== 'desktop' ? 1 : 0;
    return p ? Object.assign({}, p, { hide }) : { hide };
  }
  function primaryProfile() {
    for (const s of S.slots) {
      const p = profileOf(dev(s.id));
      if (p.ua) return p;
    }
    return null;
  }
  const syncHeaderUA = () => send({ type: 'msim:ua', profile: primaryProfile() });

  // ---------- slots ----------
  function ensureSlot(s, href) {
    let L = live.get(s.uid);
    if (L) return L;
    const el = document.createElement('section');
    el.className = 'slot';
    el.dataset.uid = s.uid;
    el.innerHTML = `
      <div class="slot-head gl">
        <button class="sh-name" data-act="slot-pick" title="Change device"><i class="sh-dot"></i><b></b><span class="sh-dim"></span></button>
        <span class="sh-sep"></span>
        <button class="ib" data-act="slot-back" title="Back">${IC.back}</button>
        <button class="ib" data-act="slot-reload" title="Reload">${IC.reload}</button>
        <button class="ib" data-act="slot-rotate" title="Rotate">${IC.rotate}</button>
        <button class="ib" data-act="slot-shot" title="Screenshot">${IC.camera}</button>
        <button class="ib" data-act="slot-remove" title="Remove">${IC.close}</button>
      </div>
      <div class="holder">
        <div class="device">
          <div class="strap s-top"></div><div class="strap s-bot"></div>
          <div class="stand"></div><div class="foot"></div><div class="foot foot-r"></div>
          <div class="base"></div>
          <div class="body">
            <i class="hw hw-1"></i><i class="hw hw-2"></i><i class="hw hw-3"></i><i class="hw hw-4"></i>
            <i class="spine"></i>
            <div class="glass"></div>
            <i class="hinge h-a"></i><i class="hinge h-b"></i>
            <i class="lcam"></i><i class="speaker"></i><i class="homebtn"></i>
            <div class="screen">
              <div class="sbar" data-k=""></div>
              <div class="vp"></div>
              <div class="loader"><span></span></div>
              <i class="island"></i><i class="notch"></i><i class="pcam"></i><i class="crease"></i><i class="homebar"></i>
            </div>
          </div>
        </div>
      </div>`;
    L = {
      uid: s.uid,
      el,
      holder: el.querySelector('.holder'),
      device: el.querySelector('.device'),
      body: el.querySelector('.body'),
      screen: el.querySelector('.screen'),
      sbar: el.querySelector('.sbar'),
      vp: el.querySelector('.vp'),
      name: el.querySelector('.sh-name b'),
      dim: el.querySelector('.sh-dim'),
      rot: el.querySelector('[data-act="slot-rotate"]'),
      backBtn: el.querySelector('[data-act="slot-back"]'),
      iframe: null,
      href: href || START_URL,
      hist: [],
      expect: true,
    };
    live.set(s.uid, L);
    rail.appendChild(el);
    return L;
  }

  function makeFrame(L, name) {
    const f = document.createElement('iframe');
    f.name = name;
    f.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-presentation allow-pointer-lock allow-storage-access-by-user-activation'
    );
    f.setAttribute('allow', 'autoplay; clipboard-read; clipboard-write; fullscreen; geolocation; camera; microphone; encrypted-media; picture-in-picture; web-share');
    f.setAttribute('title', 'Device preview');
    f.addEventListener('load', () => L.screen.classList.add('ready'));
    f.src = L.href;
    L.screen.classList.remove('ready');
    L.hist = [];
    L.expect = true;
    L.vp.replaceChildren(f);
    L.iframe = f;
    updateBack(L);
  }

  function applyGeom(L, s, g, scale) {
    const d = dev(s.id);
    const ds = L.device.style;
    for (const k of ['ow', 'oh', 'bx', 'by', 'bw', 'bh', 'r', 'sr', 'sx', 'sy', 'w', 'h', 'sb', 'baseH', 'standH', 'strap', 'rs', 'srs', 'spine']) {
      ds.setProperty('--' + k, (g[k] || 0) + 'px');
    }
    ds.transform = `scale(${scale})`;
    Object.assign(L.device.dataset, {
      frame: d.frame,
      land: g.land ? '1' : '0',
      chrome: S.frame ? '1' : '0',
      mobile: MOBILE.has(d.frame) ? '1' : '0',
      os: d.ua === 'ios' ? 'ios' : 'android',
      home: homeKind(d),
    });
    L.holder.style.width = Math.round(g.ow * scale) + 'px';
    L.holder.style.height = Math.round(g.oh * scale) + 'px';
    const k = statusKind(d, g);
    if (L.sbar.dataset.k !== k) {
      L.sbar.dataset.k = k;
      L.sbar.innerHTML = sbarHTML(k);
      tick();
    }
    L.rot.disabled = !canRotate(d);
    const name = '__msim__' + JSON.stringify(profileOf(d));
    if (!L.iframe || L.iframe.name !== name) makeFrame(L, name);
  }

  // heads: measured label widths; a slot is as wide as max(device, label)
  function computeScale(gs, heads) {
    if (!gs.length) return 1;
    if (S.zoom !== 'fit' && !captureUid) return S.zoom;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const cap = !!captureUid;
    const padX = cap ? 48 : 40 + 108;
    const padY = cap ? 48 : 24 + 32 + (S.labels ? 56 : 0);
    const room = W - padX - (cap ? 0 : 56 * (gs.length - 1));
    const sumW = gs.reduce((a, g) => a + g.ow, 0);
    const maxH = Math.max(...gs.map((g) => g.oh));
    let s = Math.min(room / sumW, (H - padY) / maxH, 1);
    for (let i = 0; i < 4; i++) {
      let fixed = 0;
      let flex = 0;
      gs.forEach((g, j) => {
        if ((heads[j] || 0) > g.ow * s) fixed += heads[j];
        else flex += g.ow;
      });
      if (fixed + flex * s <= room + 0.5 || !flex) break;
      s = Math.min(s, (room - fixed) / flex);
    }
    return clamp(s, 0.08, 1);
  }

  // freeze: uid of a slot whose geometry is being animated by hand (rotation)
  function layout(freeze) {
    const geos = new Map(S.slots.map((s) => [s.uid, geom(dev(s.id), s.land)]));
    for (const s of S.slots) {
      const L = ensureSlot(s);
      const d = dev(s.id);
      const g = geos.get(s.uid);
      L.el.classList.toggle('hidden', !!captureUid && s.uid !== captureUid);
      L.el.classList.toggle('active', s.uid === S.active);
      L.name.textContent = d.name + (d.variant ? ' · ' + d.variant : '');
      L.dim.textContent = `${g.w}×${g.h}`;
    }
    const visible = captureUid ? S.slots.filter((s) => s.uid === captureUid) : S.slots;
    const measure = () =>
      visible.map((s) => (S.labels && !captureUid ? live.get(s.uid).el.querySelector('.slot-head').offsetWidth : 0));
    root.classList.remove('compact');
    let heads = measure();
    const room = stage.clientWidth - 148 - 56 * (visible.length - 1);
    if (heads.reduce((a, b) => a + b, 0) > room) {
      root.classList.add('compact');
      heads = measure();
    }
    const scale = computeScale(visible.map((s) => geos.get(s.uid)), heads);
    lastScale = scale;
    for (const s of S.slots) if (s.uid !== freeze) applyGeom(live.get(s.uid), s, geos.get(s.uid), scale);
    for (const [uid, L] of live) {
      if (!S.slots.some((s) => s.uid === uid)) {
        L.el.remove();
        live.delete(uid);
      }
    }
    updateMeta();
    syncDock();
    return { scale, geos };
  }

  function updateMeta() {
    const z = $('.zbadge');
    if (z) z.textContent = Math.round(lastScale * 100) + '%';
    const btn = $('.dock [data-act="zoom"]');
    if (btn) btn.dataset.tip = `Zoom ${Math.round(lastScale * 100)}%${S.zoom === 'fit' ? ' (fit)' : ''} · Z`;
  }

  function updateOmni() {}

  function updateBack(L) {
    if (L.backBtn) L.backBtn.disabled = L.hist.length < 2;
  }

  // ---------- motion helpers ----------
  const EASE = 'cubic-bezier(.65, 0, .35, 1)';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let motionT = 0;
  // Promote devices to their own compositor layer while they move, then drop it
  // so Chrome re-rasterises the iframes crisply at the final scale.
  function motion(ms = 700) {
    root.classList.add('animating');
    clearTimeout(motionT);
    motionT = setTimeout(() => root.classList.remove('animating'), ms);
  }
  function settleScreen(L) {
    if (reduced()) return;
    L.screen.animate(
      [{ opacity: 0.35, filter: 'blur(10px) saturate(1.2)' }, { opacity: 1, filter: 'blur(0) saturate(1)' }],
      { duration: 380, easing: 'cubic-bezier(.2, .8, .2, 1)' }
    );
  }
  // Fade a device out, run the change, fade it back in.
  async function swapDevice(L, change) {
    if (!L || reduced()) return change();
    await L.device.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(6px)' }], { duration: 150, easing: 'ease-in', fill: 'forwards' }).finished;
    motion();
    await change();
    const a = L.device.animate([{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 320, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    L.device.getAnimations().forEach((x) => x !== a && x.cancel());
  }

  // ---------- actions ----------
  function setActive(uid) {
    if (S.active === uid || !S.slots.some((s) => s.uid === uid)) return;
    S.active = uid;
    save();
    for (const [id, L] of live) L.el.classList.toggle('active', id === uid);
    updateOmni();
    syncDock();
    if (popName === 'devices') renderPop();
  }

  async function addSlot() {
    if (S.slots.length >= MAX_SLOTS) return toast(`Up to ${MAX_SLOTS} devices side by side`, 'info');
    const used = new Set(S.slots.map((s) => s.id));
    const id = SUGGEST.find((x) => !used.has(x)) || 'iphone-17-pro';
    const href = (live.get(S.active) || {}).href;
    const s = { uid: uidGen(), id, land: false };
    S.slots.push(s);
    S.active = s.uid;
    save();
    ensureSlot(s, href);
    await syncHeaderUA();
    layout();
    updateOmni();
    if (popName === 'devices') renderPop();
  }

  async function removeSlot(uid) {
    if (S.slots.length <= 1) return toast('At least one device stays in view', 'info');
    S.slots = S.slots.filter((s) => s.uid !== uid);
    if (S.active === uid) S.active = S.slots[0].uid;
    save();
    await syncHeaderUA();
    layout();
    updateOmni();
    if (popName === 'devices') renderPop();
  }

  const rotating = new Set();
  function rotate(uid) {
    const s = S.slots.find((x) => x.uid === uid);
    const L = live.get(uid);
    if (!s || !L || rotating.has(uid)) return;
    const d = dev(s.id);
    if (!canRotate(d)) return toast(`${d.name} doesn't rotate`, 'info');

    const before = geom(d, s.land);
    const s1 = lastScale;
    const symmetric = !S.frame || MOBILE.has(d.frame) || DUO.has(d.frame) || d.frame === 'tablet';
    s.land = !s.land;
    save();

    if (reduced() || !symmetric) {
      swapDevice(L, () => layout());
      return;
    }

    // Physically spin the device 90° around its centre while the slot resizes,
    // then swap to the landscape layout (which looks identical) and let the page reflow.
    rotating.add(uid);
    motion(900);
    L.el.classList.add('no-tx');
    const { scale: s2, geos } = layout(uid);
    const after = geos.get(uid);
    const P = { w: before.ow * s1, h: before.oh * s1 };
    const Q = { w: after.ow * s2, h: after.oh * s2 };
    const deg = s.land ? -90 : 90;
    const inner = `translate(${-before.ow / 2}px, ${-before.oh / 2}px)`;
    const opts = { duration: 620, easing: EASE, fill: 'forwards' };
    const spin = L.device.animate(
      [
        { transform: `translate(${P.w / 2}px, ${P.h / 2}px) rotate(0deg) scale(${s1}) ${inner}` },
        { transform: `translate(${Q.w / 2}px, ${Q.h / 2}px) rotate(${deg}deg) scale(${s2}) ${inner}` },
      ],
      opts
    );
    const grow = L.holder.animate(
      [
        { width: P.w + 'px', height: P.h + 'px' },
        { width: Q.w + 'px', height: Q.h + 'px' },
      ],
      opts
    );
    spin.finished
      .catch(() => {})
      .then(() => {
        applyGeom(L, s, after, s2);
        spin.cancel();
        grow.cancel();
        settleScreen(L);
        requestAnimationFrame(() => L.el.classList.remove('no-tx'));
        rotating.delete(uid);
        // fit may have drifted while we animated (e.g. window resize)
        if (S.zoom === 'fit') layout();
      });
  }

  async function changeDevice(uid, id) {
    const s = S.slots.find((x) => x.uid === uid);
    if (!s || s.id === id) return;
    s.id = id;
    if (!canRotate(dev(id))) s.land = false;
    save();
    if (popName === 'devices') renderPop();
    await swapDevice(live.get(uid), async () => {
      await syncHeaderUA();
      layout();
    });
  }

  function loadInto(L, url) {
    L.href = url;
    L.expect = true;
    L.screen.classList.remove('ready');
    L.iframe.src = url;
  }

  function reloadSlot(L) {
    L.screen.classList.remove('ready');
    L.expect = true;
    try {
      L.iframe.contentWindow.location.reload();
    } catch (_) {
      L.iframe.src = L.href;
    }
  }

  function goBack(L) {
    if (L.hist.length < 2) return;
    L.hist.pop();
    L.expect = false;
    try {
      L.iframe.contentWindow.history.back();
    } catch (_) {
      post(L, { kind: 'back' });
    }
    updateBack(L);
  }

  function post(L, m) {
    try {
      L.iframe.contentWindow.postMessage(Object.assign({ __msim: 1 }, m), '*');
    } catch (_) {}
  }
  const broadcastConfig = () => live.forEach((L) => post(L, { kind: 'config', touch: S.touch }));

  let themingT = 0;
  // Let every colour in the studio glide to its new value.
  function smoothColors(fn) {
    if (reduced()) return fn();
    root.classList.add('theming');
    fn();
    clearTimeout(themingT);
    themingT = setTimeout(() => root.classList.remove('theming'), 520);
  }

  let vtSheet = null;
  // Theme switch: circular reveal from the button that was clicked (View Transitions),
  // falling back to a colour cross-fade.
  function switchTheme(next, from) {
    const commit = () => {
      S.theme = next;
      save();
      applyLook();
      if (popName === 'settings') renderPop();
    };
    if (next === S.theme) return;
    if (reduced() || typeof document.startViewTransition !== 'function') return smoothColors(commit);
    const r = (from || $('.dock [data-act="theme"]')).getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    try {
      if (!vtSheet) {
        vtSheet = new CSSStyleSheet();
        vtSheet.replaceSync('::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}');
      }
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, vtSheet];
      const vt = document.startViewTransition(commit);
      const cleanup = () => {
        document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== vtSheet);
      };
      vt.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 700, easing: 'cubic-bezier(.4, 0, .2, 1)', pseudoElement: '::view-transition-new(root)' }
          );
        })
        .catch(cleanup);
      vt.finished.then(cleanup, cleanup);
    } catch (_) {
      smoothColors(commit);
    }
  }

  function update(key, val, from) {
    if (key === 'theme') return switchTheme(val, from);
    S[key] = val;
    save();
    if (['accent', 'backdrop', 'finish', 'labels'].includes(key)) smoothColors(applyLook);
    if (key === 'frame' || key === 'labels') {
      motion();
      layout();
    }
    if (key === 'touch') broadcastConfig();
    if (key === 'syncNav') {
      syncDock();
      toast(val ? 'Navigation synced across devices' : 'Navigation sync off', 'link');
    }
    if (popName === 'settings') renderPop();
  }

  function setZoom(v) {
    S.zoom = v;
    save();
    motion(800);
    layout();
    if (popName === 'zoom') renderPop();
  }
  const zoomBy = (dir) => setZoom(clamp(Math.round((lastScale + dir * 0.1) * 20) / 20, 0.2, 1.5));

  function toggleTheme(from) {
    switchTheme(resolvedTheme() === 'dark' ? 'light' : 'dark', from);
  }

  // ---------- screenshot ----------
  function flash() {
    if (reduced()) return;
    const f = document.createElement('div');
    f.className = 'flash';
    root.appendChild(f);
    f.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.18 }, { opacity: 0 }], { duration: 520, easing: 'ease-out' }).finished.then(() => f.remove());
  }

  let shooting = false;
  async function screenshot(uid = S.active) {
    const s = S.slots.find((x) => x.uid === uid);
    const L = live.get(uid);
    if (!s || !L || shooting) return;
    shooting = true;
    const d = dev(s.id);
    closePop();
    const fade = reduced() ? 0 : 220;

    // 1. fade the studio out, 2. switch to a clean full-size capture layout while invisible,
    // 3. fade it back in and capture, 4. shutter flash, 5. fade back to the normal studio.
    root.classList.add('shooting');
    await wait(fade);
    root.classList.add('capturing');
    captureUid = uid;
    layout();
    await raf();
    await raf();
    root.classList.remove('shooting');
    await wait(fade + 160);
    const g = geom(d, s.land);
    const clip = !S.frame || MOBILE.has(d.frame) || DUO.has(d.frame) || d.frame === 'tablet';
    const rect = (clip ? L.body : L.holder).getBoundingClientRect();
    // per-corner radii [tl, tr, br, bl]; the closed Duo is squarer on its hinge side
    const corners = !clip ? [0, 0, 0, 0]
      : S.frame && d.frame === 'duo-fold' ? (g.land ? [g.r, g.r, g.rs, g.rs] : [g.rs, g.r, g.r, g.rs])
      : [g.r, g.r, g.r, g.r];
    const capScale = lastScale; // the capture layout's scale, before we restore the studio
    const radii = corners.map((v) => v * capScale);
    const radius = clip ? 1 : 0;
    let res = null;
    try {
      res = await send({ type: 'msim:capture' });
    } finally {
      flash();
      root.classList.add('shooting');
      await wait(fade);
      root.classList.remove('capturing');
      captureUid = null;
      layout();
      await raf();
      root.classList.remove('shooting');
      shooting = false;
    }
    if (!isExt) return toast('Screenshots save in the installed extension', 'info');
    if (!res || !res.dataUrl) return toast('Screenshot failed — try again', 'info');

    const img = new Image();
    img.src = res.dataUrl;
    await img.decode();
    const k = img.width / innerWidth;
    const x = Math.max(0, rect.left);
    const y = Math.max(0, rect.top);
    const w = Math.min(innerWidth, rect.right) - x;
    const h = Math.min(innerHeight, rect.bottom) - y;
    const c = document.createElement('canvas');
    c.width = Math.round(w * k);
    c.height = Math.round(h * k);
    const ctx = c.getContext('2d');
    if (radius) {
      ctx.beginPath();
      ctx.roundRect(0, 0, c.width, c.height, radii.map((v) => v * k));
      ctx.clip();
    }
    ctx.drawImage(img, x * k, y * k, w * k, h * k, 0, 0, c.width, c.height);
    const site = hostOf(L.href) || 'page';
    const fn = `${d.name} ${g.w}x${g.h} - ${site}.png`.replace(/[\\/:*?"<>|]+/g, '-');
    c.toBlob((blob) => {
      if (!blob) return toast('Screenshot failed', 'info');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fn;
      root.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast(`Saved ${d.name} screenshot`, 'image');
    }, 'image/png');
  }

  // ---------- toasts ----------
  function toast(msg, icon = 'check') {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${IC[icon] || ''}<span>${esc(msg)}</span>`;
    toasts.appendChild(t);
    while (toasts.children.length > 3) toasts.firstElementChild.remove();
    setTimeout(() => {
      t.classList.add('out');
      setTimeout(() => t.remove(), 300);
    }, 2400);
  }

  // ---------- popovers ----------
  function openPop(name) {
    closePop();
    popName = name;
    const p = document.createElement('div');
    p.className = 'pop pop-' + name;
    pops.appendChild(p);
    renderPop();
    if (name !== 'devices') {
      const btn = dock.querySelector(`[data-pop="${name}"]`);
      if (btn) {
        const top = btn.getBoundingClientRect().top - 10;
        p.style.top = clamp(top, 16, innerHeight - p.offsetHeight - 16) + 'px';
      }
    }
    root.classList.add('has-pop');
    syncDock();
  }
  function closePop() {
    if (!popName) return;
    pops.replaceChildren();
    popName = null;
    root.classList.remove('has-pop');
    syncDock();
  }
  const togglePop = (name) => (popName === name ? closePop() : openPop(name));

  function renderPop() {
    const p = pops.firstElementChild;
    if (!p) return;
    if (popName === 'devices') renderPicker(p);
    else if (popName === 'settings') renderSettings(p);
    else if (popName === 'zoom') renderZoom(p);
    else if (popName === 'help') renderHelp(p);
  }

  const popHead = (title, sub) =>
    `<div class="pop-h"><div><h3>${title}</h3><p>${sub}</p></div><button class="ib" data-act="pop-close" title="Close">${IC.close}</button></div>`;

  function silHTML(d) {
    const s = Math.min(54 / d.w, 50 / d.h);
    const w = Math.max(14, Math.round(d.w * s));
    const h = Math.max(12, Math.round(d.h * s));
    return `<span class="sil" data-f="${d.frame}"><i style="width:${w}px;height:${h}px"></i></span>`;
  }

  function renderPicker(p) {
    if (!p.querySelector('.pick-list')) {
      p.innerHTML = `
        ${popHead('Devices', `${allDevices().length} devices · up to ${MAX_SLOTS} side by side`)}
        <div class="slots-row"></div>
        <label class="search">${IC.search}<input type="text" placeholder="Search devices or sizes…" aria-label="Search devices"><kbd>/</kbd></label>
        <div class="chips"></div>
        <div class="pick-list"></div>`;
      p.querySelector('.search input').value = pick.q;
    }
    renderSlotsRow(p);
    p.querySelector('.chips').innerHTML = CATS.map(
      ([k, l]) => `<button class="chip${pick.cat === k ? ' on' : ''}" data-act="cat" data-cat="${k}">${IC['cat_' + k] || ''}${l}</button>`
    ).join('');
    renderList(p);
  }

  function renderSlotsRow(p) {
    const row = p.querySelector('.slots-row');
    row.innerHTML =
      S.slots
        .map((s, i) => {
          const d = dev(s.id);
          const g = geom(d, s.land);
          return `<div class="sp${s.uid === S.active ? ' on' : ''}" data-act="sp-select" data-uid="${s.uid}" role="button" tabindex="0">
            <span class="n">${i + 1}</span>
            <span class="t"><b>${esc(d.name)}</b><small>${g.w}×${g.h}</small></span>
            ${S.slots.length > 1 ? `<button class="x" data-act="sp-remove" data-uid="${s.uid}" title="Remove">${IC.close}</button>` : ''}
          </div>`;
        })
        .join('') +
      (S.slots.length < MAX_SLOTS ? `<button class="sp sp-add" data-act="add" title="Add a device">${IC.plus}</button>` : '');
  }

  function renderList(p = pops.firstElementChild) {
    const list = p && p.querySelector('.pick-list');
    if (!list) return;
    const q = pick.q.trim().toLowerCase();
    const cur = activeSlot().id;
    const used = new Set(S.slots.map((s) => s.id));
    const match = (d) =>
      !q || `${d.name} ${d.variant || ''} ${d.w}x${d.h} ${d.w}×${d.h} ${d.cat}`.toLowerCase().includes(q);
    const card = (d) => `
      <button class="card${d.id === cur ? ' sel' : ''}${used.has(d.id) && d.id !== cur ? ' used' : ''}" data-act="pick-dev" data-id="${esc(d.id)}" title="${esc(d.name)} — ${d.w}×${d.h}">
        ${d.tag ? `<em class="tag">${esc(d.tag)}</em>` : ''}
        ${silHTML(d)}
        <b>${esc(d.name)}</b>
        ${d.variant ? `<span class="var">${esc(d.variant)}</span>` : ''}
        <span class="dims">${d.w}×${d.h}</span>
        ${d.custom ? `<span class="del" data-act="del-custom" data-id="${esc(d.id)}" title="Delete">${IC.trash}</span>` : ''}
        <span class="ck">${IC.check}</span>
      </button>`;
    const groups = pick.cat === 'all' ? CATS.slice(1) : CATS.filter((c) => c[0] === pick.cat);
    const html = groups
      .map(([cat, label]) => {
        const items = allDevices().filter((d) => d.cat === cat && match(d));
        const isCustom = cat === 'custom';
        if (!items.length && !(isCustom && !q)) return '';
        return `<div class="grp">
          <div class="grp-h">${IC['cat_' + cat] || ''}<span>${label}</span><em>${items.length}</em></div>
          <div class="grid">${items.map(card).join('')}${
            isCustom && !q ? `<button class="card add" data-act="custom-new">${IC.plus}<b>New custom</b></button>` : ''
          }</div>
          ${isCustom && pick.form ? customForm() : ''}
        </div>`;
      })
      .join('');
    list.innerHTML = html || `<div class="empty"><b>No devices match “${esc(pick.q)}”</b>Try a name like “Pixel” or a size like “390”.</div>`;
  }

  function customForm() {
    return `<form class="cform">
      <input class="field" name="name" placeholder="Device name" maxlength="28" required>
      <div class="row2">
        <input class="field" name="w" type="number" min="120" max="5120" placeholder="Width" required>
        <span>×</span>
        <input class="field" name="h" type="number" min="120" max="5120" placeholder="Height" required>
      </div>
      <div class="seg wide" data-type-seg>
        ${['phone', 'tablet', 'laptop', 'monitor']
          .map((t, i) => `<button type="button" class="${i === 0 ? 'on' : ''}" data-act="ctype" data-val="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`)
          .join('')}
      </div>
      <button class="btn primary" type="submit">Add device</button>
    </form>`;
  }

  function addCustom(form) {
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const w = clamp(parseInt(fd.get('w'), 10) || 0, 120, 5120);
    const h = clamp(parseInt(fd.get('h'), 10) || 0, 120, 5120);
    const typeBtn = form.querySelector('[data-act="ctype"].on');
    const type = typeBtn ? typeBtn.dataset.val : 'phone';
    if (!name || !w || !h) return;
    const map = {
      phone: { frame: 'punch', ua: 'android' },
      tablet: { frame: 'tablet', ua: 'androidTab' },
      laptop: { frame: 'laptop', ua: 'desktop' },
      monitor: { frame: 'monitor', ua: 'desktop' },
    };
    const d = Object.assign({ id: 'custom-' + Date.now().toString(36), name, cat: 'custom', w, h, custom: true }, map[type]);
    S.custom.push(d);
    pick.form = false;
    save();
    toast(`Added ${name}`);
    changeDevice(S.active, d.id);
  }

  function deleteCustom(id) {
    S.custom = S.custom.filter((d) => d.id !== id);
    S.slots.forEach((s) => {
      if (s.id === id) s.id = 'iphone-17-pro';
    });
    save();
    syncHeaderUA();
    layout();
    renderPop();
  }

  const seg = (key, opts) =>
    `<div class="seg">${opts
      .map(([v, l]) => `<button class="${String(S[key]) === String(v) ? 'on' : ''}" data-act="set" data-key="${key}" data-val="${v}">${l}</button>`)
      .join('')}</div>`;
  const trow = (key, title, sub) =>
    `<button class="trow" data-act="toggle" data-key="${key}"><span><b>${title}</b><small>${sub}</small></span><i class="tg${S[key] ? ' on' : ''}"></i></button>`;

  function renderSettings(p) {
    const body = p.querySelector('.pop-body');
    const scroll = body ? body.scrollTop : 0;
    p.innerHTML = `
      ${popHead('Settings', 'Make the studio yours')}
      <div class="pop-body">
        <div class="sec">
          <h4>Appearance</h4>
          <div class="row"><span>Theme</span>${seg('theme', [['dark', 'Dark'], ['light', 'Light'], ['auto', 'Auto']])}</div>
          <div class="row"><span>Accent</span><div class="sw">${Object.entries(ACCENTS)
            .map(([k, v]) => `<button class="dotsw${S.accent === k ? ' on' : ''}" style="--c:${v.c}" data-act="set" data-key="accent" data-val="${k}" title="${v.label}"></button>`)
            .join('')}</div></div>
          <div class="bds">${Object.entries(BACKDROPS)
            .map(([k, l]) => `<button class="bd${S.backdrop === k ? ' on' : ''}" data-act="set" data-key="backdrop" data-val="${k}"><i class="bdp-${k}"></i>${l}</button>`)
            .join('')}</div>
        </div>
        <div class="sec">
          <h4>Hardware</h4>
          <div class="row"><span>Finish</span><div class="sw">${Object.entries(FINISHES)
            .map(([k, v]) => `<button class="dotsw${S.finish === k ? ' on' : ''}" style="--c:linear-gradient(140deg, ${v.a}, ${v.b})" data-act="set" data-key="finish" data-val="${k}" title="${v.label}"></button>`)
            .join('')}</div></div>
          ${trow('frame', 'Device frame', 'Realistic bezels, buttons & cut-outs')}
          ${trow('labels', 'Device labels', 'Name, size and quick actions above each device')}
        </div>
        <div class="sec">
          <h4>Behaviour</h4>
          ${trow('touch', 'Touch cursor', 'Show a fingertip instead of the mouse pointer')}
          ${trow('syncNav', 'Sync navigation', 'Clicking a link in one device opens it in all')}
          ${trow('syncScroll', 'Sync scrolling', 'Scroll every device together')}
          <p class="note">Settings are saved in this browser.</p>
        </div>
      </div>`;
    p.querySelector('.pop-body').scrollTop = scroll;
  }

  function renderZoom(p) {
    const pct = Math.round(lastScale * 100);
    p.innerHTML = `
      ${popHead('Zoom', 'Scale of every device')}
      <div class="pop-body">
        <div class="zoom-big"><span class="zv">${pct}%</span><small>${S.zoom === 'fit' ? 'Fit to window' : 'Manual'}</small></div>
        <input class="range" type="range" min="20" max="150" step="5" value="${pct}" style="--p:${((pct - 20) / 130) * 100}%" aria-label="Zoom">
        <div class="seg wide">${[['fit', 'Fit'], [0.5, '50%'], [0.75, '75%'], [1, '100%']]
          .map(([v, l]) => `<button class="${String(S.zoom) === String(v) ? 'on' : ''}" data-act="zoom-set" data-val="${v}">${l}</button>`)
          .join('')}</div>
      </div>`;
  }

  function renderHelp(p) {
    const keys = [
      ['D', 'Device library'],
      ['/', 'Search devices'],
      ['A', 'Add a device'],
      ['R', 'Rotate selected device'],
      ['S', 'Screenshot selected device'],
      ['Z', 'Zoom panel'],
      ['+ / −', 'Zoom in / out'],
      ['0', 'Fit to window'],
      ['T', 'Toggle theme'],
      ['Esc', 'Close panel / studio'],
      ['Alt ⇧ M', 'Open / close studio'],
    ];
    p.innerHTML = `
      ${popHead('Shortcuts', 'Work faster with the keyboard')}
      <div class="pop-body"><div class="keys">${keys.map(([k, l]) => `<div class="key"><span>${l}</span><kbd>${k}</kbd></div>`).join('')}</div>
      <p class="note">Shortcuts work while the studio has focus — click its background if a page captured the keyboard.</p></div>`;
  }

  // ---------- events ----------
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    const slotEl = e.target.closest('.slot');
    if (slotEl && (!t || t.dataset.act !== 'slot-remove')) setActive(slotEl.dataset.uid);
    if (!t) {
      if (popName && !e.target.closest('.pop')) closePop();
      return;
    }
    const act = t.dataset.act;
    const uid = slotEl ? slotEl.dataset.uid : t.dataset.uid;
    const L = uid ? live.get(uid) : null;
    switch (act) {
      case 'close': return close();
      case 'devices': return togglePop('devices');
      case 'settings': return togglePop('settings');
      case 'help': return togglePop('help');
      case 'zoom': return togglePop('zoom');
      case 'pop-close': return closePop();
      case 'add': return addSlot();
      case 'rotate': return rotate(S.active);
      case 'shot': return screenshot(S.active);
      case 'sync': return update('syncNav', !S.syncNav);
      case 'theme': return toggleTheme(t);
      case 'slot-pick': return openPop('devices');
      case 'slot-back': return L && goBack(L);
      case 'slot-reload': return L && reloadSlot(L);
      case 'slot-rotate': return rotate(uid);
      case 'slot-shot': return screenshot(uid);
      case 'slot-remove': return removeSlot(uid);
      case 'sp-select': return setActive(t.dataset.uid);
      case 'sp-remove': e.stopPropagation(); return removeSlot(t.dataset.uid);
      case 'cat':
        pick.cat = t.dataset.cat;
        renderPop();
        { const list = $('.pick-list'); if (list) list.scrollTop = 0; }
        return;
      case 'pick-dev': return changeDevice(S.active, t.dataset.id);
      case 'del-custom': return deleteCustom(t.dataset.id);
      case 'custom-new':
        pick.form = !pick.form;
        renderList();
        if (pick.form) {
          const f = $('.cform input');
          if (f) { f.focus(); f.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
        }
        return;
      case 'ctype':
        t.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === t));
        return;
      case 'set': return update(t.dataset.key, t.dataset.val, t);
      case 'toggle': return update(t.dataset.key, !S[t.dataset.key]);
      case 'zoom-set': return setZoom(t.dataset.val === 'fit' ? 'fit' : parseFloat(t.dataset.val));
    }
  });

  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.classList.contains('cform')) {
      addCustom(f);
    }
  });

  root.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('.search input')) {
      pick.q = t.value;
      renderList();
    } else if (t.matches('.range')) {
      const v = parseInt(t.value, 10);
      t.style.setProperty('--p', ((v - 20) / 130) * 100 + '%');
      S.zoom = v / 100;
      save();
      // follow the thumb 1:1 (no easing lag), one layout per frame
      root.classList.add('scrubbing');
      motion(400);
      cancelAnimationFrame(scrubRaf);
      scrubRaf = requestAnimationFrame(() => layout());
      const zv = $('.zv');
      if (zv) zv.textContent = v + '%';
      const small = $('.zoom-big small');
      if (small) small.textContent = 'Manual';
      root.querySelectorAll('[data-act="zoom-set"]').forEach((b) => b.classList.remove('on'));
    }
  });

  let scrubRaf = 0;
  root.addEventListener('change', (e) => {
    if (e.target.matches('.range')) {
      root.classList.remove('scrubbing');
      motion(500);
    }
  });


  function onMsg(e) {
    const d = e.data;
    if (!d || d.__msim !== 1) return;
    let L = null;
    for (const x of live.values()) {
      if (x.iframe && x.iframe.contentWindow === e.source) { L = x; break; }
    }
    if (!L) return;
    switch (d.kind) {
      case 'hello':
        post(L, { kind: 'config', touch: S.touch });
        break;
      case 'nav': {
        const changed = d.href !== L.href;
        const wasExpected = L.expect;
        L.expect = false;
        if (d.href && L.hist[L.hist.length - 1] !== d.href) L.hist.push(d.href);
        updateBack(L);
        L.href = d.href || L.href;
        L.screen.classList.add('ready');
        setStatusColor(L, d.color);
        if (L.uid === S.active) updateOmni();
        if (S.syncNav && changed && !wasExpected) {
          for (const o of live.values()) if (o !== L && o.href !== d.href) loadInto(o, d.href);
        }
        break;
      }
      case 'scroll':
        if (S.syncScroll) for (const o of live.values()) if (o !== L) post(o, { kind: 'scrollTo', ratio: d.ratio });
        break;
    }
  }

  const probe = document.createElement('i');
  probe.style.display = 'none';
  root.appendChild(probe);
  function setStatusColor(L, color) {
    if (!color) return;
    probe.style.color = '';
    probe.style.color = color;
    const rgb = getComputedStyle(probe).color.match(/[\d.]+/g);
    if (!rgb) return;
    const [r, g, b] = rgb.map(Number);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    L.screen.style.setProperty('--sbg', `rgb(${r}, ${g}, ${b})`);
    L.screen.style.setProperty('--sfg', lum > 0.6 ? '#000' : '#fff');
  }

  function onKey(e) {
    const a = shadow.activeElement;
    const inField = a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT');
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (inField) a.blur();
      else if (popName) closePop();
      else close();
      return;
    }
    if (inField || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const map = {
      d: () => togglePop('devices'),
      a: addSlot,
      r: () => rotate(S.active),
      s: () => screenshot(S.active),
      z: () => togglePop('zoom'),
      t: toggleTheme,
      '?': () => togglePop('help'),
      '+': () => zoomBy(1),
      '=': () => zoomBy(1),
      '-': () => zoomBy(-1),
      '0': () => setZoom('fit'),
      '/': () => {
        if (popName !== 'devices') openPop('devices');
        const i = $('.search input');
        if (i) i.focus();
      },
    };
    const fn = map[k];
    if (fn) {
      e.preventDefault();
      e.stopPropagation();
      fn();
    }
  }

  function onBlur() {
    setTimeout(() => {
      const a = shadow.activeElement;
      if (!a || a.tagName !== 'IFRAME') return;
      for (const L of live.values()) {
        if (L.iframe === a) {
          setActive(L.uid);
          closePop();
          break;
        }
      }
    }, 0);
  }

  let resizeT = 0;
  function onResize() {
    cancelAnimationFrame(resizeT);
    resizeT = requestAnimationFrame(() => {
      if (S.zoom === 'fit') layout();
    });
  }
  const onScheme = () => S.theme === 'auto' && applyLook();
  const onHide = () => send({ type: 'msim:closed' });

  // ---------- lifecycle ----------
  let prevOverflow = '';
  let clockT = 0;
  let closed = false;

  function close() {
    if (closed) return;
    closed = true;
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('message', onMsg);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('pagehide', onHide);
    mq.removeEventListener('change', onScheme);
    clearInterval(clockT);
    root.classList.add('leaving');
    setTimeout(() => host.remove(), 200);
    document.documentElement.style.overflow = prevOverflow;
    send({ type: 'msim:closed' });
    delete window.__msim;
  }

  window.__msim = { close };

  (async () => {
    const saved = await store.get();
    S = Object.assign({}, DEFAULTS, saved || {});
    S.custom = Array.isArray(S.custom) ? S.custom.filter((d) => d && d.id && d.w && d.h) : [];
    const ids = new Set(allDevices().map((d) => d.id));
    S.slots = (Array.isArray(S.slots) && S.slots.length ? S.slots : DEFAULTS.slots)
      .slice(0, MAX_SLOTS)
      .map((s) => ({ uid: s.uid || uidGen(), id: ids.has(s.id) ? s.id : 'iphone-17-pro', land: !!s.land }));
    if (!S.slots.some((s) => s.uid === S.active)) S.active = S.slots[0].uid;
    if (S.zoom !== 'fit' && !(S.zoom > 0)) S.zoom = 'fit';

    applyLook();
    document.documentElement.appendChild(host);
    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    try { host.focus({ preventScroll: true }); } catch (_) {}

    window.addEventListener('keydown', onKey, true);
    window.addEventListener('message', onMsg);
    window.addEventListener('resize', onResize);
    window.addEventListener('blur', onBlur);
    window.addEventListener('pagehide', onHide);
    mq.addEventListener('change', onScheme);

    await syncHeaderUA();
    if (closed) return;
    layout();
    updateOmni();
    tick();
    clockT = setInterval(tick, 15000);
    setTimeout(() => root.classList.add('settled'), 300);
  })();
})();
