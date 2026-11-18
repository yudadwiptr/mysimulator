// Device catalog. Sizes are CSS-pixel viewports (portrait).
// frame: island | notch | home | punch | fold | tablet | laptop | monitor | tv | kiosk | watch
// ua:    ios | ipad | android | androidTab | tv | desktop
(() => {
  const UA = {
    ios: {
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      vendor: 'Apple Computer, Inc.',
      touch: 1,
      mobile: 1,
      ch: '',
    },
    ipad: {
      ua: 'Mozilla/5.0 (iPad; CPU OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
      platform: 'iPad',
      vendor: 'Apple Computer, Inc.',
      touch: 1,
      mobile: 0,
      ch: '',
    },
    android: {
      ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
      platform: 'Linux armv81',
      vendor: 'Google Inc.',
      touch: 1,
      mobile: 1,
      ch: 'Android',
    },
    androidTab: {
      ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      platform: 'Linux armv81',
      vendor: 'Google Inc.',
      touch: 1,
      mobile: 0,
      ch: 'Android',
    },
    tv: {
      ua: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 9.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.0.0/9.0 TV Safari/537.36',
      platform: 'Linux armv7l',
      vendor: 'Google Inc.',
      touch: 0,
      mobile: 0,
      ch: 'Linux',
    },
  };

  const P = (cat, ua) => (id, name, w, h, frame, extra) => Object.assign({ id, name, cat, w, h, frame, ua }, extra || {});
  const iphone = P('iphone', 'ios');
  const android = P('android', 'android');
  const tablet = (id, name, w, h, ua, extra) => Object.assign({ id, name, cat: 'tablet', w, h, frame: 'tablet', ua }, extra || {});
  const desk = P('desktop', 'desktop');
  const NEW = { tag: 'New' };

  const list = [
    // iPhone
    iphone('iphone-duo-open', 'iPhone Duo', 626, 890, 'fold', { variant: 'Unfolded', tag: 'New' }),
    iphone('iphone-duo-closed', 'iPhone Duo', 466, 678, 'island', { variant: 'Folded', tag: 'New' }),
    iphone('iphone-18-pro-max', 'iPhone 18 Pro Max', 440, 956, 'island', NEW),
    iphone('iphone-18-pro', 'iPhone 18 Pro', 402, 874, 'island', NEW),
    iphone('iphone-17-pro-max', 'iPhone 17 Pro Max', 440, 956, 'island'),
    iphone('iphone-17-pro', 'iPhone 17 Pro', 402, 874, 'island'),
    iphone('iphone-air', 'iPhone Air', 420, 912, 'island'),
    iphone('iphone-17', 'iPhone 17', 402, 874, 'island'),
    iphone('iphone-16-pro-max', 'iPhone 16 Pro Max', 440, 956, 'island'),
    iphone('iphone-16-pro', 'iPhone 16 Pro', 402, 874, 'island'),
    iphone('iphone-16', 'iPhone 16', 393, 852, 'island'),
    iphone('iphone-16e', 'iPhone 16e', 390, 844, 'notch'),
    iphone('iphone-15-pro-max', 'iPhone 15 Pro Max', 430, 932, 'island'),
    iphone('iphone-15', 'iPhone 15', 393, 852, 'island'),
    iphone('iphone-14-plus', 'iPhone 14 Plus', 428, 926, 'notch'),
    iphone('iphone-14', 'iPhone 14', 390, 844, 'notch'),
    iphone('iphone-13-mini', 'iPhone 13 mini', 375, 812, 'notch'),
    iphone('iphone-se', 'iPhone SE', 375, 667, 'home'),

    // Android — 2026 flagships first
    android('galaxy-s26-ultra', 'Galaxy S26 Ultra', 412, 891, 'punch', NEW),
    android('galaxy-s26-plus', 'Galaxy S26+', 384, 832, 'punch', NEW),
    android('galaxy-s26', 'Galaxy S26', 360, 780, 'punch', NEW),
    android('galaxy-z-fold8-open', 'Galaxy Z Fold8', 704, 933, 'fold', { variant: 'Unfolded', tag: 'New' }),
    android('galaxy-z-fold8-closed', 'Galaxy Z Fold8', 411, 960, 'punch', { variant: 'Folded', tag: 'New' }),
    android('galaxy-z-fold8-ultra-open', 'Galaxy Z Fold8 Ultra', 954, 859, 'fold', { variant: 'Unfolded', tag: 'New' }),
    android('galaxy-z-flip8', 'Galaxy Z Flip8', 412, 960, 'punch', NEW),
    android('pixel-11-pro-xl', 'Pixel 11 Pro XL', 414, 921, 'punch', NEW),
    android('pixel-11-pro', 'Pixel 11 Pro', 410, 914, 'punch', NEW),
    android('pixel-11', 'Pixel 11', 412, 923, 'punch', NEW),
    android('pixel-10-pro-fold-open', 'Pixel 10 Pro Fold', 791, 820, 'fold', { variant: 'Unfolded' }),
    android('pixel-10-pro-fold-closed', 'Pixel 10 Pro Fold', 411, 900, 'punch', { variant: 'Folded' }),
    android('xiaomi-17-ultra', 'Xiaomi 17 Ultra', 412, 915, 'punch', NEW),
    android('xiaomi-17-pro', 'Xiaomi 17 Pro', 393, 873, 'punch', NEW),
    android('xiaomi-17', 'Xiaomi 17', 393, 873, 'punch', NEW),
    android('xiaomi-17t', 'Xiaomi 17T', 412, 915, 'punch', NEW),
    android('motorola-razr-70-ultra', 'Motorola Razr 70 Ultra', 412, 1004, 'punch', NEW),
    android('moto-g87', 'Moto G87', 412, 915, 'punch', NEW),
    android('oneplus-15', 'OnePlus 15', 412, 919, 'punch', NEW),
    android('oppo-find-x9-pro', 'OPPO Find X9 Pro', 412, 915, 'punch', NEW),
    android('vivo-x300-pro', 'vivo X300 Pro', 412, 915, 'punch', NEW),
    android('galaxy-a57', 'Galaxy A57', 412, 915, 'punch', NEW),
    android('galaxy-s25-ultra', 'Galaxy S25 Ultra', 412, 891, 'punch'),
    android('galaxy-s25-plus', 'Galaxy S25+', 384, 832, 'punch'),
    android('galaxy-s25', 'Galaxy S25', 360, 780, 'punch'),
    android('galaxy-a56', 'Galaxy A56', 412, 915, 'punch'),
    android('galaxy-z-flip7', 'Galaxy Z Flip7', 412, 960, 'punch'),
    android('galaxy-z-fold7-closed', 'Galaxy Z Fold7', 411, 960, 'punch', { variant: 'Folded' }),
    android('galaxy-z-fold7-open', 'Galaxy Z Fold7', 750, 832, 'fold', { variant: 'Unfolded' }),
    android('pixel-10-pro-xl', 'Pixel 10 Pro XL', 414, 921, 'punch'),
    android('pixel-10-pro', 'Pixel 10 Pro', 410, 914, 'punch'),
    android('pixel-10', 'Pixel 10', 412, 923, 'punch'),
    android('pixel-9a', 'Pixel 9a', 412, 915, 'punch'),
    android('xiaomi-15', 'Xiaomi 15', 393, 873, 'punch'),
    android('redmi-note-14', 'Redmi Note 14', 393, 873, 'punch'),
    android('oppo-reno-14', 'OPPO Reno14', 412, 915, 'punch'),
    android('vivo-v50', 'vivo V50', 412, 915, 'punch'),
    android('realme-14-pro', 'realme 14 Pro', 412, 915, 'punch'),
    android('infinix-hot-50', 'Infinix Hot 50', 393, 873, 'punch'),
    android('oneplus-13', 'OnePlus 13', 412, 905, 'punch'),
    android('nothing-phone-3a', 'Nothing Phone (3a)', 412, 915, 'punch'),

    // Tablets
    tablet('ipad-pro-13', 'iPad Pro 13"', 1032, 1376, 'ipad', { variant: 'M5' }),
    tablet('ipad-pro-11', 'iPad Pro 11"', 834, 1210, 'ipad', { variant: 'M5' }),
    tablet('ipad-air-13', 'iPad Air 13"', 1024, 1366, 'ipad'),
    tablet('ipad-air-11', 'iPad Air 11"', 820, 1180, 'ipad'),
    tablet('ipad-11', 'iPad 11"', 820, 1180, 'ipad', { variant: 'A16' }),
    tablet('ipad-mini', 'iPad mini', 744, 1133, 'ipad'),
    tablet('galaxy-tab-s11-ultra', 'Galaxy Tab S11 Ultra', 924, 1480, 'androidTab', NEW),
    tablet('galaxy-tab-s11', 'Galaxy Tab S11', 800, 1280, 'androidTab', NEW),
    tablet('galaxy-tab-s10', 'Galaxy Tab S10', 800, 1280, 'androidTab'),
    tablet('pixel-tablet', 'Pixel Tablet', 800, 1280, 'androidTab'),
    tablet('surface-pro', 'Surface Pro', 912, 1368, 'desktop'),

    // Laptops & desktops
    desk('macbook-air-13', 'MacBook Air 13"', 1280, 832, 'laptop', { variant: 'M5' }),
    desk('macbook-air-15', 'MacBook Air 15"', 1440, 932, 'laptop'),
    desk('macbook-pro-14', 'MacBook Pro 14"', 1512, 982, 'laptop', { variant: 'M5' }),
    desk('macbook-pro-16', 'MacBook Pro 16"', 1728, 1117, 'laptop'),
    desk('laptop-14-wuxga', 'Laptop 14"', 1536, 960, 'laptop', { variant: 'WUXGA 125%' }),
    desk('laptop-fhd', 'Laptop 15" FHD', 1536, 864, 'laptop'),
    desk('laptop-hd', 'Laptop HD', 1366, 768, 'laptop'),
    desk('studio-display', 'Studio Display 27"', 2560, 1440, 'monitor', NEW),
    desk('imac-24', 'iMac 24"', 2240, 1260, 'monitor'),
    desk('monitor-fhd', 'Monitor 24"', 1920, 1080, 'monitor', { variant: 'Full HD' }),
    desk('monitor-qhd', 'Monitor 27"', 2560, 1440, 'monitor', { variant: 'QHD' }),

    // Specials
    { id: 'watch-46', name: 'Smartwatch 46mm', cat: 'special', w: 208, h: 248, frame: 'watch', ua: 'ios' },
    { id: 'watch-ultra', name: 'Smartwatch Ultra', cat: 'special', w: 205, h: 251, frame: 'watch', ua: 'ios' },
    { id: 'smart-tv', name: 'Smart TV', cat: 'special', w: 1920, h: 1080, frame: 'tv', ua: 'tv', variant: '4K' },
    { id: 'kiosk', name: 'Self-service Kiosk', cat: 'special', w: 1080, h: 1920, frame: 'kiosk', ua: 'desktop' },
    { id: 'smart-display', name: 'Smart Display 10"', cat: 'special', w: 1280, h: 800, frame: 'tablet', ua: 'androidTab' },
    { id: 'smart-panel', name: 'Smart Home Panel', cat: 'special', w: 480, h: 480, frame: 'tablet', ua: 'androidTab', tag: 'New' },
    { id: 'handheld-scanner', name: 'Rugged Handheld', cat: 'special', w: 360, h: 640, frame: 'home', ua: 'android' },
  ];

  window.MSIM_DEVICES = { UA, list };
})();
