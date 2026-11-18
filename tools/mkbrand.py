import sys, os
from PIL import Image, ImageDraw, ImageFilter
root = sys.argv[1]
B = lambda *p: os.path.join(root, *p)
BG = (41, 49, 62)
mark = Image.open(B('brand', 'logo-mark-source.webp')).convert('RGB').crop((50, 100, 893, 741))  # 843x641
word = Image.open(B('brand', 'logo-wordmark-source.jpg')).convert('RGB')

def vgrad(s, c1, c2):
    g = Image.new('RGB', (s, s)); d = ImageDraw.Draw(g)
    for y in range(s):
        t = y / (s - 1); d.line([(0, y), (s, y)], fill=tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)))
    return g

def icon(S, maskable=False, fill=0.86):
    s = S * 4
    bg = vgrad(s, (48, 57, 72), (30, 36, 47))
    out = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    m = Image.new('L', (s, s), 0)
    if maskable: ImageDraw.Draw(m).rectangle([0, 0, s, s], fill=255); fill = 0.68
    else: ImageDraw.Draw(m).rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * .225), fill=255)
    out.paste(bg, (0, 0), m)
    # key out the source background so the mark sits on our gradient
    mk = mark.copy()
    w = int(s * fill); h = int(w * mk.height / mk.width)
    mk = mk.resize((w, h), Image.LANCZOS)
    px = mk.load(); a = Image.new('L', mk.size); ap = a.load()
    for y in range(h):
        for x in range(w):
            p = px[x, y]; d = max(abs(p[i] - BG[i]) for i in range(3))
            ap[x, y] = max(0, min(255, int((d - 12) * 4)))
    out.paste(mk, ((s - w) // 2, (s - h) // 2 + int(s * .01)), a)
    return out.resize((S, S), Image.LANCZOS)

os.makedirs(B('icons'), exist_ok=True)
for n in (16, 32, 48, 128):
    icon(n, fill=0.9 if n <= 32 else 0.86).save(B('icons', f'icon{n}.png'))
icon(256).save(B('brand', 'logo-icon-256.png'))
S = B('site')
for n in (16, 32): icon(n, fill=0.9).save(os.path.join(S, f'favicon-{n}x{n}.png'))
icon(180).convert('RGB').save(os.path.join(S, 'apple-touch-icon.png'))
icon(192).save(os.path.join(S, 'icon-192.png'))
icon(512).save(os.path.join(S, 'icon-512.png'))
icon(512, True).save(os.path.join(S, 'icon-maskable-512.png'))
icon(256).save(os.path.join(S, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
icon(128).save(os.path.join(S, 'logo.png'))
if os.path.exists(os.path.join(S, 'favicon.svg')): os.remove(os.path.join(S, 'favicon.svg'))

def banner(W, H, pad):
    c = Image.new('RGB', (W, H), BG)
    cw = word.crop((150, 290, 1850, 830))  # tight around mark + wordmark
    k = min((W - 2 * pad) / cw.width, (H - 2 * pad) / cw.height)
    cw = cw.resize((int(cw.width * k), int(cw.height * k)), Image.LANCZOS)
    c.paste(cw, ((W - cw.width) // 2, (H - cw.height) // 2))
    return c
banner(1200, 630, 70).save(os.path.join(S, 'og-image.png'), optimize=True)
banner(440, 280, 28).save(B('store', 'promo-small-440x280.png'))
banner(1400, 560, 70).save(B('store', 'promo-marquee-1400x560.png'))

print('ok')
