"""Stage inspected Minkino bakery postage stamps with opaque inner panels.

python scripts/sef/pul-paneli.py --kaynak <source file or directory> --hedef <output directory>
The defaults stage ekip/sef/uretim/pullar into ekip/sef/yayin-oncesi/pullar.
The scalloped paper and its transparent exterior stay unchanged.
"""

import argparse
import os
import re
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]


def duzelt(kaynak):
    with Image.open(kaynak) as im:
        rgba = np.array(im.convert("RGBA"))
    h, w = rgba.shape[:2]
    if not 0.8 <= w / h <= 1.22 or min(h, w) < 96:
        raise ValueError("Kare pul kadrajı belirlenemedi")

    y, x = np.indices((h, w))
    nx, ny = x / w, y / h
    rgb = rgba[:, :, :3].astype(float)
    alpha = rgba[:, :, 3].copy()
    kose = (((nx > .13) & (nx < .24)) | ((nx > .76) & (nx < .87))) & (
        ((ny > .13) & (ny < .24)) | ((ny > .76) & (ny < .87)))
    ornek = rgb[kose & (alpha > 235)]
    if len(ornek) < 24:
        ornek = rgb[kose & (alpha > 200)]
    if len(ornek) < 24:
        raise ValueError("Panel rengini doğrulayacak köşe alanı yok")

    renkler = ornek.astype(int) // 16
    palet, adetler = np.unique(renkler, axis=0, return_counts=True)
    ana_renk = np.median(ornek[np.all(renkler == palet[adetler.argmax()], axis=1)], axis=0)
    uzaklik = np.max(np.abs(rgb - ana_renk), axis=2)
    aday = (uzaklik < 43) & (alpha > 160) & (nx > .04) & (nx < .96) & (ny > .04) & (ny < .96)
    sutunlar = np.flatnonzero(aday.sum(axis=0) > .24 * h)
    satirlar = np.flatnonzero(aday.sum(axis=1) > .24 * w)
    if not (sutunlar.size and satirlar.size):
        raise ValueError("İç panel bulunamadı")
    x0, x1 = sutunlar.min(), sutunlar.max()
    y0, y1 = satirlar.min(), satirlar.max()
    if x0 > .19*w or x1 < .81*w or y0 > .19*h or y1 < .81*h:
        raise ValueError("İç panel kenarları doğrulanamadı")
    panel = (x > x0) & (x < x1) & (y > y0) & (y < y1)

    # Sadece kenardan ulaşılan fonu boya. Gıdanın ince siyah kontürü sınır olur.
    kontur = (rgb.mean(axis=2) < 65) & (alpha > 180)
    fon = panel & ((uzaklik < 48) | (alpha <= 230)) & ~kontur
    maske = Image.fromarray(fon.astype("uint8") * 255).copy()
    noktalar = [(sx, sy) for sx in (x0+2, x0+4, x1-2, x1-4) for sy in range(y0+3, y1-2, 8)]
    noktalar += [(sx, sy) for sy in (y0+2, y1-2) for sx in range(x0+4, x1-3, 8)]
    for nokta in noktalar:
        if maske.getpixel(nokta) == 255:
            ImageDraw.floodfill(maske, nokta, 128)
    fon = np.asarray(maske) == 128
    if np.count_nonzero(fon) < .06*w*h:
        raise ValueError("Figürün dışındaki fon ayrılamadı")

    # Saydam lekenin çevresinde RGB kanallarına işlemiş dar halkayı da doldur.
    delikler = Image.fromarray((fon & (alpha < 192)).astype("uint8") * 255)
    cevre = np.asarray(delikler.filter(ImageFilter.MaxFilter(11))) > 0
    fon |= panel & cevre & (rgb.sum(axis=2) > 242) & (uzaklik < 128)
    # Opaque speckles left in the centre of an otherwise flat panel can have
    # arbitrary RGB. Close small gaps only outside the protected food outline.
    alan = Image.fromarray(fon.astype("uint8") * 255)
    kapali = np.asarray(alan.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.MinFilter(11))) > 0
    cizgi_cevresi = np.asarray(Image.fromarray(kontur.astype("uint8")*255).filter(ImageFilter.MaxFilter(9))) > 0
    fon |= panel & kapali & ~cizgi_cevresi
    yumusak = np.asarray(Image.fromarray(fon.astype("uint8") * 255).filter(ImageFilter.GaussianBlur(.48))) / 255
    agirlik = np.where(fon, np.maximum(.55, yumusak), 0)[:, :, None]
    rgba[:, :, :3] = np.rint(rgb * (1 - agirlik) + ana_renk * agirlik)
    rgba[:, :, 3] = np.where(panel, 255, alpha)
    return Image.fromarray(rgba), (x0+1, y0+1, x1, y1)


def hazirla(kaynak, hedef):
    resim, panel = duzelt(kaynak)
    hedef.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=hedef.parent, suffix=".webp", delete=False) as dosya:
        gecici = Path(dosya.name)
    try:
        resim.save(gecici, lossless=True, method=4)
        with Image.open(gecici) as sonuc:
            if sonuc.convert("RGBA").getchannel("A").crop(panel).getextrema() != (255, 255):
                raise ValueError("Kodlanmış WEBP iç panelinde saydam piksel var")
        os.replace(gecici, hedef)
    finally:
        gecici.unlink(missing_ok=True)


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--kaynak", type=Path, default=ROOT/"ekip/sef/uretim/pullar")
    cli.add_argument("--hedef", type=Path, default=ROOT/"ekip/sef/yayin-oncesi/pullar")
    args = cli.parse_args()
    kaynak, hedef = args.kaynak.resolve(), args.hedef.resolve()
    adaylar = [kaynak] if kaynak.is_file() else sorted(kaynak.glob("pul-*.*"))
    dosyalar = [p for p in adaylar if re.fullmatch(r"pul-(?:0[0-9][0-9]|100)\.(?:webp|png)", p.name, re.I) and p.stem!="pul-000"]
    if not dosyalar:
        cli.error("pul-001 … pul-100 adlarıyla PNG/WEBP kaynağı bulunamadı")
    if len({p.stem for p in dosyalar}) != len(dosyalar):
        cli.error("Aynı sıra için birden çok kaynak var")
    if any(p.parent == hedef for p in dosyalar):
        cli.error("Kaynak yeri ve çıktı dizini ayrı olmalı")
    for p in dosyalar:
        try:
            hazirla(p, hedef/(p.stem+".webp"))
        except (OSError, ValueError) as hata:
            cli.exit(1, f"{p.name}: {hata}\n")
        print(f"{p.stem}: iç panel doğrulandı")


if __name__ == "__main__":
    main()
