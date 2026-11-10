"""Assemble the individually drawn cels into lossless runtime sheets."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "medya"
OUT.mkdir(exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument("--sheet", help="Rebuild a single named sheet after retouching its source cels.")
only = parser.parse_args().sheet
catalog = ROOT / "cizimler.js"
frames = json.loads(catalog.read_text("utf-8").split("=",1)[1].strip().rstrip(";")) if only else {}


def trim(image):
    mask = image.getchannel("A").point(lambda value: 255 if value > 32 else 0)
    x, y, r, b = mask.getbbox()
    return image.crop((max(0, x-2), max(0, y-2), min(image.width, r+2), min(image.height, b+2)))


def pose(name):
    return trim(Image.open(ROOT / "pozlar" / (name + ".png")).convert("RGBA"))


def sheet(name, items, columns=2):
    assert 1 <= len(items) <= 6
    w = max(im.width for _, im in items) + 4
    h = max(im.height for _, im in items) + 4
    canvas = Image.new("RGBA", (w * min(columns, len(items)), h * ((len(items)+columns-1)//columns)))
    for index, (key, im) in enumerate(items):
        x, y = (index % columns)*w+2, (index//columns)*h+2
        canvas.paste(im, (x, y))
        frames[key] = [name, x, y, im.width, im.height]
    canvas.save(OUT / (name + ".webp"), lossless=True, method=3)


groups = {
    "kino-ev": ["kino-dinle", "kino-soyle", "kino-dusun", "kino-otur"],
    "kino-park": ["kino-saklan", "kino-sobe", "kino-sut", "kino-uzul"],
    "kino-kosu": ["kino-kos1", "kino-pas", "kino-kos2", "kino-contact"],
    "lokum-ev": ["lokum-tren", "lokum-yaklas", "lokum-otur", "lokum-alkis", "lokum-ray"],
    "lokum-yuruyus": ["lokum-tren-adim", "lokum-tren-temas"],
    "lokum-park": ["lokum-el", "lokum-izle", "lokum-kos", "lokum-adim", "lokum-sol", "lokum-karpuz"],
    "arkadaslar": ["mino-bekle", "mino-kale", "mino-saklan", "bulut-davet"],
    "tilki": ["zipzip-yuvarlak", "zipzip-bekle", "zipzip-hazir", "zipzip-sut", "zipzip-say", "tilki-golcuk"],
    "oyuncaklar": ["tren-kirmizi", "top"],
    "salincak-hareket": ["uyku-oturak","salincak-aski"],
    "sut-hareket": ["mac-hazir","mac-vurus"],
    "son-oyuncaklar": ["obj-vagon","obj-plajtopu","obj-baloncuk"],
}
for group, names in groups.items():
    if not only or group==only:
        sheet(group, [(n, pose(n)) for n in names])

# Registration lives in the staging code; each source here is a separate full-size drawing.
for group,count in {"atla":5,"sut":5,"sobe":5,"ayakkabi":4,"kaleci":4,"say":3,"uzgun":3,"lokum":3,"bak":3,"kalk":2,"sicra":2}.items():
    name = "oyna-" + group
    if only and only not in (name, "oyunculuk"):
        continue
    items = []
    for index in range(1,count+1):
        source = f"{group}-{index}"
        im = Image.open(ROOT / "oyunculuk" / (source+".png")).convert("RGBA")
        items.append(("oyna-"+source, trim(im)))
    sheet(name, items, columns=2)

if not only or only == "oyunculuk":
    for group in ["kurabiye","salincak","masal","pencere","davet","dal","ray","sula","kale","ara","veda","cikis","golcuk"]:
        for source in (ROOT / "oyunculuk").glob(group+"-*.png"):
            Image.open(source).convert("RGB").save(OUT / ("oyna-"+source.stem+".webp"), lossless=True, method=3)

mouths = [pose(f"agiz-{n}") for n in range(3)]
# Registered to the centre and bottom edge of each individually drawn muzzle.
placement = {
    "kino": (.504,.542,.145), "lokum": (.504,.536,.14),
    "mino": (.507,.607,.16), "zipzip": (.496,.622,.155),
    "anne": (.502,.545,.143), "dede": (.50,.618,.105),
    "baba": (.501,.592,.15), "bulut": (.503,.596,.13),
    "kino-uzgun": (.5,.548,.13), "mino-fisilti": (.51,.607,.13),
}
for who, (cx, cy, fraction) in placement.items():
    if only and only!="konusma-"+who:
        continue
    head = pose("yuz-" + who)
    items = []
    for n, art in enumerate(mouths):
        cel = head.copy()
        width = round(head.width * fraction * (0.52 if n==2 else 1))
        ink = art.resize((width, round(width*art.height/art.width)), Image.Resampling.LANCZOS)
        cel.alpha_composite(ink, (round(cx*head.width-width/2), round(cy*head.height)))
        items.append((f"{who}-ses{n}", cel))
    sheet("konusma-"+who, items, columns=2)

for f in (ROOT / "sahneler").glob("*.png"):
    if only and not (only == "finaller" and f.stem.startswith(("son-", "ara-"))):
        continue
    target = OUT / (f.stem+".webp")
    # Register the acting area over the original exposure; hold the rest of the camera still.
    areas = {"sobe": ("SON1", (500,246,857,712)),
             "dilim": ("karpuz", (306,415,611,843)),
             "ortu": ("ERKEN5", (160,325,1454,850))}
    action = f.stem.split("-", 1)[-1]
    if f.stem.startswith(("son-", "ara-")) and action in areas:
        name, bounds = areas[action]
        base = Image.open(ROOT / "sahneler" / (name+".png")).convert("RGB")
        frame = Image.open(f).convert("RGB").resize(base.size, Image.Resampling.LANCZOS)
        mask = Image.new("L", base.size)
        ImageDraw.Draw(mask).rectangle(bounds, fill=255)
        base.paste(frame, (0,0), mask.filter(ImageFilter.GaussianBlur(3)))
        base.save(target, lossless=True, method=3)
        continue
    if not target.exists() or target.stat().st_mtime < f.stat().st_mtime:
        Image.open(f).convert("RGB").save(target, lossless=True, method=3)

# The front of a real drawn prop hides actors passing behind it. Preserve its actual ink.
def foreground(name, seeds):
    art = Image.open(ROOT / "sahneler" / (name+".png")).convert("RGBA")
    rgb = np.asarray(art)[:,:,:3].astype(int)
    mask = np.zeros((art.height,art.width),dtype=bool)
    for fx,fy in seeds:
        x,y=round(fx*art.width),round(fy*art.height)
        candidate = np.abs(rgb-rgb[y,x]).max(axis=2)<58
        region = Image.fromarray(candidate.astype("uint8")*255).copy()
        ImageDraw.floodfill(region,(x,y),128)
        solid = Image.fromarray(((np.asarray(region)==128)*255).astype("uint8")).copy()
        ImageDraw.floodfill(solid,(0,0),96)
        mask |= np.asarray(solid)!=96
    edge = Image.fromarray(mask.astype("uint8")*255).filter(ImageFilter.MaxFilter(9))
    art.putalpha(edge)
    art.save(OUT / (name+"-on.webp"),lossless=True,method=3)

if not only or only == "camur-top":
    plate = Image.open(ROOT / "sahneler/camur.png").convert("RGBA")
    ball = pose("top")
    height = round(83 * plate.height / 900)
    width = round(83 * ball.width / ball.height * plate.width / 1600)
    ball = ball.resize((width, height), Image.Resampling.LANCZOS)
    plate.alpha_composite(ball, (round(630 * plate.width / 1600 - width / 2),
                                round(686 * plate.height / 900) - height))
    plate.convert("RGB").save(OUT / "camur-top.webp", lossless=True, method=3)

if not only:
    foreground("ray",[(.592,.555),(.779,.573)])
    foreground("sakla",[(.927,.712)])
(ROOT / "cizimler.js").write_text("const cizimler = "+json.dumps(frames,ensure_ascii=False)+";\n",encoding="utf-8")

