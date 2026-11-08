"""Gera icones e telas de abertura do Vive Gostoso a partir do logo original (public/brand/logo-quadrado.png).
Nada de recorte do sol: o logo inteiro, como o Victor desenhou."""
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = r"C:\Users\Victor Lima\Desktop\sites\gostoso\vive-gostoso\.worktrees\home-perfis-app\public"
logo = Image.open(os.path.join(ROOT, "brand", "logo-quadrado.png")).convert("RGB")
word = Image.open(os.path.join(ROOT, "brand", "wordmark-horizontal.png")).convert("RGBA")

CREAM = (243, 240, 236)
BG = (245, 242, 238)  # #F5F2EE do manifest
HORIZON = 756

def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))

def sol_cor(d):
    t = min(1.0, d / 270.0) ** 1.25
    return lerp((241, 181, 103), (192, 124, 40), t)

def maskable(size=512, ocupa=0.74):
    """Sangria total: o fundo continua para fora do logo e as bordas do logo se dissolvem nele."""
    S = int(round(1080 / ocupa))
    off = (S - 1080) // 2
    img = Image.new("RGB", (S, S), CREAM)
    d = ImageDraw.Draw(img)
    hy = off + HORIZON
    top, bot = (18, 157, 157), (9, 101, 101)
    for y in range(hy, S):
        t = min(1.0, (y - hy) / max(1, (off + 1080 - hy)))
        d.line([(0, y), (S, y)], fill=lerp(top, bot, t))
    cx, cy, r = off + 815, off + 113, 275
    sun = Image.new("RGB", (2 * r, 2 * r))
    sp = sun.load()
    for yy in range(2 * r):
        for xx in range(2 * r):
            sp[xx, yy] = sol_cor(math.hypot(xx - (r + (790 - 815)), yy - (r + (20 - 113))))
    m = Image.new("L", (8 * r, 8 * r), 0)
    ImageDraw.Draw(m).ellipse([0, 0, 8 * r - 1, 8 * r - 1], fill=255)
    m = m.resize((2 * r, 2 * r), Image.LANCZOS)
    img.paste(sun, (cx - r, cy - r), m)
    F = 80
    ramp = np.clip(np.arange(1080) / F, 0, 1)
    ramp = np.minimum(ramp, ramp[::-1])
    a = np.minimum(ramp[:, None], ramp[None, :])
    mask = Image.fromarray((a * 255).astype(np.uint8), "L")
    img.paste(logo, (off, off), mask)
    return img.resize((size, size), Image.LANCZOS)

def arredondar(im, raio_pct=0.2237):
    n = im.size[0]
    k = 4
    m = Image.new("L", (n * k, n * k), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, n * k - 1, n * k - 1], radius=int(n * k * raio_pct), fill=255)
    m = m.resize((n, n), Image.LANCZOS)
    out = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    out.paste(im.convert("RGBA"), (0, 0), m)
    return out

def salvar(im, *partes):
    p = os.path.join(ROOT, *partes)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, optimize=True)
    print("ok", partes[-1], im.size)

al = np.array(word)[:, :, 3]
cols = (al > 20).any(axis=0)
xs = np.where(cols)[0]
gaps = [(xs[i + 1] - xs[i], xs[i + 1]) for i in range(len(xs) - 1) if xs[i + 1] - xs[i] > 20]
inicio_texto = max(gaps)[1] if gaps else 0
rows = (al[:, inicio_texto:] > 20).any(axis=1)
ys = np.where(rows)[0]
word_txt = word.crop((inicio_texto, ys.min(), xs.max() + 1, ys.max() + 1))
print("wordmark texto", word_txt.size)

for s in (72, 96, 128, 144, 152, 180, 192, 384, 512):
    salvar(logo.resize((s, s), Image.LANCZOS), "icons", "pwa", f"icon-{s}.png")
salvar(logo.resize((180, 180), Image.LANCZOS), "apple-touch-icon.png")
salvar(maskable(512, 0.68), "icons", "pwa", "icon-512-maskable.png")
salvar(maskable(192, 0.68), "icons", "pwa", "icon-192-maskable.png")

def splash(w, h):
    img = Image.new("RGB", (w, h), BG)
    lado = int(w * 0.42)
    ic = arredondar(logo.resize((lado, lado), Image.LANCZOS))
    sombra = Image.new("RGBA", (lado + 120, lado + 120), (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rounded_rectangle([60, 76, 60 + lado, 76 + lado], radius=int(lado * 0.2237), fill=(26, 26, 26, 40))
    sombra = sombra.filter(ImageFilter.GaussianBlur(26))
    x = (w - lado) // 2
    y = int(h * 0.34)
    img.paste(sombra, (x - 60, y - 60), sombra)
    img.paste(ic, (x, y), ic)
    ww = int(w * 0.46)
    wm = word_txt.resize((ww, int(word_txt.size[1] * ww / word_txt.size[0])), Image.LANCZOS)
    img.paste(wm, ((w - ww) // 2, y + lado + int(h * 0.035)), wm)
    return img

for w, h in [(1290, 2796), (1179, 2556), (1170, 2532), (1284, 2778), (1125, 2436), (1242, 2688), (828, 1792), (750, 1334), (1206, 2622), (1320, 2868)]:
    salvar(splash(w, h), "splash", f"splash-{w}x{h}.png")

