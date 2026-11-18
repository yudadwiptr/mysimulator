// MY Simulator · service worker
// Toggles the studio overlay and manages per-tab network rules so pages can be
// framed (X-Frame-Options / CSP frame-ancestors stripped) and requested with a
// mobile User-Agent while the studio is open.

const KEY = 'msimRules';

async function readRules() {
  const got = await chrome.storage.session.get(KEY);
  return got[KEY] || { map: {}, seq: 1 };
}

async function writeRules(st) {
  await chrome.storage.session.set({ [KEY]: st });
}

async function setRules(tabId, profile) {
  const st = await readRules();
  const old = st.map[tabId] || [];
  const ids = [st.seq++, st.seq++];
  const condition = { tabIds: [tabId], resourceTypes: ['sub_frame'] };

  const addRules = [
    {
      id: ids[0],
      priority: 100,
      action: {
        type: 'modifyHeaders',
        responseHeaders: ['x-frame-options', 'frame-options', 'content-security-policy'].map((header) => ({
          header,
          operation: 'remove',
        })),
      },
      condition,
    },
  ];

  if (profile && profile.ua) {
    const requestHeaders = [{ header: 'user-agent', operation: 'set', value: profile.ua }];
    if (profile.ch) {
      requestHeaders.push(
        { header: 'sec-ch-ua-mobile', operation: 'set', value: profile.mobile ? '?1' : '?0' },
        { header: 'sec-ch-ua-platform', operation: 'set', value: `"${profile.ch}"` }
      );
    } else {
      // Safari & friends don't send client hints at all.
      for (const header of ['sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform']) {
        requestHeaders.push({ header, operation: 'remove' });
      }
    }
    addRules.push({
      id: ids[1],
      priority: 100,
      action: { type: 'modifyHeaders', requestHeaders },
      condition,
    });
  }

  st.map[tabId] = ids;
  await writeRules(st);
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: old, addRules });
}

async function clearRules(tabId) {
  const st = await readRules();
  const old = st.map[tabId];
  if (!old) return;
  delete st.map[tabId];
  await writeRules(st);
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: old });
}

async function flash(tabId, text) {
  try {
    await chrome.action.setBadgeBackgroundColor({ tabId, color: '#ff6b5a' });
    await chrome.action.setBadgeText({ tabId, text });
    setTimeout(() => chrome.action.setBadgeText({ tabId, text: '' }).catch(() => {}), 2500);
  } catch (_) {}
}

async function toggle(tab) {
  if (!tab || tab.id == null) return;
  const tabId = tab.id;
  try {
    const [probe] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => !!window.__msim,
    });
    if (probe && probe.result) {
      await chrome.scripting.executeScript({ target: { tabId }, func: () => window.__msim && window.__msim.close() });
      return;
    }
    const css = await (await fetch(chrome.runtime.getURL('src/overlay.css'))).text();
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (text) => {
        window.__MSIM_CSS = text;
      },
      args: [css],
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/devices.js', 'src/icons.js', 'src/overlay.js'],
    });
  } catch (err) {
    // chrome://, the Web Store and a few other pages can't be scripted.
    console.warn('[MY Simulator] cannot open on this page:', err);
    flash(tabId, '!');
  }
}

chrome.action.onClicked.addListener(toggle);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tabId = sender.tab && sender.tab.id;
  if (!msg || tabId == null) return;

  if (msg.type === 'msim:ua') {
    setRules(tabId, msg.profile)
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }

  if (msg.type === 'msim:closed') {
    clearRules(tabId).finally(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg.type === 'msim:capture') {
    chrome.tabs
      .captureVisibleTab(sender.tab.windowId, { format: 'png' })
      .then((dataUrl) => sendResponse({ dataUrl }))
      .catch((e) => sendResponse({ error: String(e) }));
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  clearRules(tabId).catch(() => {});
});
