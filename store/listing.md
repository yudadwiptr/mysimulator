# Chrome Web Store listing — MY Simulator

Copy these fields into the Chrome Web Store Developer Dashboard (Store listing tab).
The **name** and **short description** come from `manifest.json`; keep them in sync.

## Name (max 75)
MY Simulator – Mobile & Responsive Website Tester

## Short description / summary (max 132)
Test responsive websites on iPhone, Android, iPad, laptop & TV frames side by side. Rotate, screenshot & sync scroll.

## Category
Developer Tools

## Language
English (primary) · Bahasa Indonesia (add as a second localized listing)

---

## Detailed description — English

MY Simulator shows your website on realistic phones, tablets, laptops and TVs — side by side, right inside Chrome. No emulator to install, no account, no tracking.

★ WHAT YOU GET
• 56 device presets: iPhone 17 Pro / Pro Max / Air, iPhone 16, iPhone SE, Galaxy S25 Ultra, Galaxy Z Fold7 & Flip7, Pixel 10 Pro, Xiaomi 15, OPPO Reno14, vivo V50, Infinix Hot 50, iPad Pro, iPad mini, Galaxy Tab, MacBook Air & Pro, Full HD & QHD monitors, Smart TV, smartwatch, kiosk
• Up to 4 devices at once, automatically scaled to fit your screen
• Real mobile behaviour: matching iOS / Android / iPad user agent, client hints and touch support
• Portrait & landscape rotation with accurate notches, Dynamic Island and punch-hole cameras
• Status bar that tints to the page's colour, just like a real phone
• One-click screenshots with the device frame and transparent rounded corners
• Synced navigation and synced scrolling across all devices
• Custom device sizes
• Dark & light themes, 5 accent colours, 6 hardware finishes, frameless mode
• Keyboard shortcuts: D devices · R rotate · S screenshot · Z zoom · Alt+Shift+M open/close

★ WORKS EVERYWHERE
Live sites, staging servers and localhost. Chrome, Edge and Brave.

★ PRIVACY
Everything runs locally. Settings are stored in Chrome storage, screenshots are saved straight to your computer. Nothing is collected or sent anywhere.

Device names are trademarks of their respective owners. MY Simulator is not affiliated with any manufacturer.

---

## Deskripsi lengkap — Bahasa Indonesia

MY Simulator menampilkan website kamu di HP, tablet, laptop, dan TV yang realistis — berdampingan, langsung di Chrome. Tanpa emulator, tanpa akun, tanpa pelacakan.

★ FITUR
• 56 preset perangkat: iPhone 17 Pro / Pro Max / Air, iPhone 16, iPhone SE, Galaxy S25 Ultra, Galaxy Z Fold7 & Flip7, Pixel 10 Pro, Xiaomi 15, OPPO Reno14, vivo V50, Infinix Hot 50, iPad Pro, iPad mini, Galaxy Tab, MacBook, monitor Full HD & QHD, Smart TV, smartwatch, kiosk
• Hingga 4 perangkat sekaligus, otomatis menyesuaikan layar
• Perilaku mobile asli: user agent iOS / Android / iPad, client hints, dan dukungan sentuh
• Rotasi potret & lanskap dengan notch, Dynamic Island, dan kamera punch-hole yang akurat
• Status bar mengikuti warna halaman seperti HP sungguhan
• Screenshot sekali klik lengkap dengan bingkai perangkat dan sudut transparan
• Sinkronisasi navigasi dan scroll di semua perangkat
• Ukuran perangkat kustom
• Tema gelap & terang, 5 warna aksen, 6 warna bodi, mode tanpa bingkai
• Pintasan keyboard: D perangkat · R putar · S screenshot · Z zoom · Alt+Shift+M buka/tutup

★ BISA DI MANA SAJA
Website live, server staging, dan localhost. Chrome, Edge, dan Brave.

★ PRIVASI
Semua berjalan lokal di browser. Tidak ada data yang dikumpulkan atau dikirim.

---

## Search keywords to weave in (the Web Store has no keyword field — use them naturally in the description)
mobile simulator, responsive design tester, responsive viewer, iphone simulator, android simulator, device mockup, screen size tester, mobile view chrome, cek tampilan mobile, simulator hp, tes responsive website

## Graphic assets
| Asset | Size | File |
|---|---|---|
| Store icon | 128×128 | `icons/icon128.png` |
| Small promo tile | 440×280 | `store/promo-small-440x280.png` |
| Marquee promo tile | 1400×560 | `store/promo-marquee-1400x560.png` |
| Screenshots (1–5) | 1280×800 | capture the studio in Chrome at 1280×800 (see README) |

## Privacy tab answers
- Single purpose: "Preview the current web page inside realistic device frames for responsive testing."
- `activeTab`, `scripting`: inject the simulator UI into the tab when the user clicks the icon.
- `storage`: remember the user's devices and settings.
- `declarativeNetRequest` + host access: inside the simulator's frames only, set the device's user agent and allow the page to be framed.
- Data collection: none.
