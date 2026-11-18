// Inline SVG icon set (stroke icons + filled status-bar glyphs).
(() => {
  const I = (d, w = 1.8) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  window.MSIM_ICONS = {
    logo: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2.5" y="4.5" width="17" height="23" rx="4.5" fill="none" stroke="currentColor" stroke-width="2" opacity=".45"/><rect x="12" y="8" width="17.5" height="21.5" rx="5" style="fill:var(--accent)"/><rect x="18" y="10.6" width="5.5" height="1.8" rx=".9" style="fill:var(--accent-ink)" opacity=".7"/></svg>`,

    close: I('<path d="M18 6 6 18M6 6l12 12"/>'),
    devices: I('<rect x="2" y="4" width="13" height="10" rx="2"/><path d="M6 18h5"/><rect x="16" y="8" width="6" height="12" rx="1.6"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    rotate: I('<rect x="3" y="11" width="14" height="9.5" rx="2.2"/><path d="M7 7.5a8 8 0 0 1 13 2"/><path d="m20.6 4.8-.5 4.9-4.6-1.4"/>'),
    zoom: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6M11 8v6M8 11h6"/>'),
    reload: I('<path d="M20 12a8 8 0 1 1-2.4-5.7L20 8.6"/><path d="M20 3.5v5.1h-5.1"/>'),
    camera: I('<path d="M4 8h3l1.8-2.6h6.4L17 8h3a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.4"/>'),
    sliders: I('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>'),
    sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'),
    moon: I('<path d="M20 14.6A8 8 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z"/>'),
    search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>'),
    check: I('<path d="M20 6 9 17l-5-5"/>', 2.6),
    back: I('<path d="M15 18 9 12l6-6"/>'),
    forward: I('<path d="m9 18 6-6-6-6"/>'),
    external: I('<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
    keyboard: I('<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14h9"/>'),
    link: I('<path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1"/><path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1"/>'),
    lock: I('<rect x="5" y="11" width="14" height="9.5" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6h.01"/>'),
    image: I('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-9 9"/>'),
    trash: I('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7M9 7V4.5h6V7"/>'),
    fit: I('<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>'),

    cat_all: I('<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>'),
    cat_iphone: I('<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 5.5h3"/>'),
    cat_android: I('<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><circle cx="12" cy="5.6" r=".6"/>'),
    cat_tablet: I('<rect x="4" y="2.5" width="16" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
    cat_desktop: I('<rect x="4" y="4.5" width="16" height="11" rx="1.8"/><path d="M2 19h20"/>'),
    cat_special: I('<rect x="6.5" y="6.5" width="11" height="11" rx="3"/><path d="M9 6.5 9.6 3h4.8l.6 3.5M9 17.5l.6 3.5h4.8l.6-3.5"/>'),
    cat_custom: I('<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><rect x="7" y="7" width="10" height="10" rx="2.5"/>'),

    // status bar glyphs (filled)
    sSignal: `<svg viewBox="0 0 18 12" fill="currentColor" aria-hidden="true"><rect x="0" y="7.5" width="3" height="4.5" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>`,
    sWifi: `<svg viewBox="0 0 16 12" fill="currentColor" aria-hidden="true"><path d="M8 2.3a9.1 9.1 0 0 1 6.3 2.5l1.2-1.2A10.9 10.9 0 0 0 8 .5 10.9 10.9 0 0 0 .5 3.6l1.2 1.2A9.1 9.1 0 0 1 8 2.3Z"/><path d="M8 5.9a5.5 5.5 0 0 1 3.8 1.5L13 6.2a7.2 7.2 0 0 0-10 0l1.2 1.2A5.5 5.5 0 0 1 8 5.9Z"/><path d="M8 9.3c.6 0 1.1.2 1.5.6L8 11.5 6.5 9.9c.4-.4.9-.6 1.5-.6Z"/></svg>`,
    sBatt: `<svg viewBox="0 0 28 13" fill="currentColor" aria-hidden="true" class="bat"><rect x=".6" y=".6" width="23.6" height="11.8" rx="3.6" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".4"/><rect x="2.3" y="2.3" width="19.2" height="8.4" rx="2"/><path d="M25.6 4.4v4.2c.9-.3 1.6-1.1 1.6-2.1s-.7-1.8-1.6-2.1Z" opacity=".45"/></svg>`,
    aSignal: `<svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M14 0v14H0Z"/></svg>`,
    aWifi: `<svg viewBox="0 0 18 14" fill="currentColor" aria-hidden="true"><path d="M9 14 0 3.6A14.1 14.1 0 0 1 9 .4c3.4 0 6.6 1.2 9 3.2Z"/></svg>`,
    aBatt: `<svg viewBox="0 0 9 15" fill="currentColor" aria-hidden="true"><path d="M3 0h3v1.4h1.8A1.2 1.2 0 0 1 9 2.6v11.2A1.2 1.2 0 0 1 7.8 15H1.2A1.2 1.2 0 0 1 0 13.8V2.6a1.2 1.2 0 0 1 1.2-1.2H3Z"/></svg>`,
  };
})();
