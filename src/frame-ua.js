// Runs in the page's MAIN world inside every frame, but only acts inside frames
// created by the studio (their window.name carries the emulation profile).
(() => {
  if (window.top === window) return;
  let name = '';
  try {
    name = window.name || '';
  } catch (_) {
    return;
  }
  if (!name.startsWith('__msim__')) return;
  let p;
  try {
    p = JSON.parse(name.slice(8));
  } catch (_) {
    return;
  }
  if (!p || !p.ua) return;

  const N = Navigator.prototype;
  const define = (obj, prop, value) => {
    try {
      Object.defineProperty(obj, prop, { get: () => value, configurable: true });
    } catch (_) {}
  };

  const originalUAData = navigator.userAgentData;

  define(N, 'userAgent', p.ua);
  define(N, 'appVersion', p.ua.replace(/^Mozilla\//, ''));
  define(N, 'platform', p.platform || '');
  define(N, 'vendor', p.vendor || '');
  define(N, 'maxTouchPoints', p.touch ? 5 : 0);

  if (p.touch && !('ontouchstart' in window)) {
    try {
      window.ontouchstart = null;
    } catch (_) {}
  }

  if (!p.ch) {
    // Safari doesn't expose User-Agent Client Hints.
    define(N, 'userAgentData', undefined);
  } else if (originalUAData) {
    const brands = originalUAData.brands;
    const low = { brands, mobile: !!p.mobile, platform: p.ch };
    const data = {
      brands,
      mobile: !!p.mobile,
      platform: p.ch,
      getHighEntropyValues: (hints) =>
        Promise.resolve(
          Object.assign({}, low, {
            architecture: 'arm',
            bitness: '64',
            model: '',
            platformVersion: '14.0.0',
            fullVersionList: brands,
            uaFullVersion: '',
          })
        ),
      toJSON: () => low,
    };
    define(N, 'userAgentData', data);
  }
})();
