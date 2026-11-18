# MY Simulator

Ekstensi Chrome (Manifest V3) untuk mengetes tampilan website di HP, tablet, laptop, dan TV secara berdampingan.

## Pasang (mode developer)
1. Buka `chrome://extensions` → aktifkan **Developer mode**.
2. Klik **Load unpacked** → pilih folder ini (`mobilesimulator`).
3. Pin ikon MY Simulator, buka website apa saja, lalu klik ikonnya atau tekan **Alt+Shift+M**.

## Fitur
- 88 perangkat (iPhone Duo, iPhone 18 Pro, Galaxy S26, Z Fold8/Flip8, Pixel 11, Xiaomi 17, iPad, MacBook, TV, smartwatch, kiosk) + ukuran kustom
- Hingga 4 perangkat sekaligus, auto-fit atau zoom manual 20–150%
- User agent + touch emulation per perangkat, rotasi, status bar mengikuti warna halaman
- Screenshot per perangkat (dengan bingkai, sudut transparan)
- Sinkronisasi navigasi & scroll, tema gelap/terang, 5 aksen, 6 warna bodi, mode tanpa bingkai

Pintasan: `D` perangkat · `/` cari · `A` tambah · `R` putar · `S` screenshot · `Z` zoom · `+`/`-`/`0` · `T` tema · `Esc` tutup.

## Struktur
| Path | Isi |
|---|---|
| `manifest.json` | Manifest ekstensi |
| `src/background.js` | Toggle overlay, aturan header per-tab (UA, X-Frame-Options/CSP), screenshot |
| `src/overlay.js` / `overlay.css` | UI studio (shadow DOM) |
| `src/devices.js` | Katalog perangkat & profil user agent |
| `src/frame-agent.js`, `src/frame-ua.js` | Skrip di dalam frame simulator (warna status bar, sync, UA di JS) |
| `icons/` | Ikon ekstensi 16/32/48/128 |
| `brand/`, `tools/mkbrand.py` | Logo sumber + skrip pembuat ikon, favicon, OG image, promo tile |
| `site/` | Landing page SEO + favicon, OG image, webmanifest, robots, sitemap |
| `store/` | Teks listing Chrome Web Store (EN + ID) dan promo tile |
| `dev/` | Harness pratinjau UI tanpa memasang ekstensi |

## Landing page (`site/`)
Semua URL absolut memakai `https://example.com/` sebagai placeholder. Ganti dengan domain asli sebelum deploy:

```bash
grep -rl "https://example.com" site | xargs sed -i "s#https://example.com#https://domain-kamu.com#g"
```

Lalu ganti `href="#install"` di `site/index.html` dengan link Chrome Web Store setelah ekstensi terbit.

## Pratinjau UI tanpa ekstensi
```bash
python -m http.server 5178
```
Buka `http://localhost:5178/dev/preview.html` (screenshot dinonaktifkan di mode ini).

## Batasan
- Halaman `chrome://` dan Chrome Web Store tidak bisa disimulasikan (aturan Chrome).
- Header User-Agent berlaku per tab: jika iPhone dan Android dicampur, request jaringan memakai UA perangkat pertama; `navigator.userAgent` di JS tetap benar per perangkat.
- Situs yang memblokir login dalam iframe (mis. beberapa halaman Google/bank) bisa menolak tampil.
