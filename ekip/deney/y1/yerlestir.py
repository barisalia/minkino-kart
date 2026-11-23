"""Yerleşim şablonundaki temas noktalarına göre kaynak çizimleri oyun tuvaline oturtur."""
import re
from pathlib import Path
from PIL import Image

here = Path(__file__).resolve().parent
root = here.parents[2]
out = root / "assets/deney/parkur"
quality = Image.Resampling.LANCZOS
written = set()

def source(name):
    return Image.open(here / "kaynak" / (name + ".png")).convert("RGBA")

def trim(im):
    alpha = im.getchannel("A")
    im.putalpha(alpha.point(lambda v: 0 if v < 15 else v))
    return im.crop(im.getchannel("A").getbbox())

def save(name, im):
    tmp = out / (name + ".tmp")
    im.save(tmp,"WEBP",lossless=True,method=1)
    tmp.replace(out / (name + ".webp"))
    written.add(name)

def place(name, canvas, box, im=None):
    layer = Image.new("RGBA",canvas)
    art = trim(source(name)) if im is None else im
    x,y,w,h = box
    layer.alpha_composite(art.resize((w,h),quality),(x,y))
    save(name,layer)

def remap(im, src, dst, horizontal=False):
    if horizontal:
        im = im.transpose(Image.Transpose.TRANSPOSE)
    layer = Image.new(im.mode,(im.width,dst[-1]))
    for a,b,c,d in zip(src,src[1:],dst,dst[1:]):
        layer.paste(im.crop((0,a,im.width,b)).resize((im.width,d-c),quality),(0,c))
    return layer.transpose(Image.Transpose.TRANSPOSE) if horizontal else layer

bg = source("atolye-bos").convert("RGB").resize((1672,941),quality)
bg = remap(bg,[0,451,699,826,941],[0,470,700,825,941])
# Keep the rail's thickness independent of the distance between desk and tower.
tower = trim(source("kule"))
tower = remap(tower,[0,round(tower.width*.332),tower.width],[0,94,354],True)
tower = remap(tower,[0,round(tower.height*.113),tower.height],[0,50,390])
bg.paste(tower,(76,300),tower)
save("parkur-fon",bg)
place("top",(80,80),(7,7,66,66))
place("kol-taban",(140,160),(40,12,60,143))
place("kol-sap",(140,200),(42,1,56,196))
place("yuva",(260,140),(2,2,256,136))
place("konfeti",(300,300),(10,10,280,280))
place("zil",(150,110),(3,10,144,98))
place("zil-calar",(150,110),(3,16,144,92))
for color in ("kirmizi","sari","yesil","mavi"):
    place("domino-"+color,(50,145),(3,3,44,140))

ramp = trim(source("parca-rampa"))
ramp = remap(ramp,[0,round(ramp.height*.199),ramp.height],[0,50,320])
place("parca-rampa",(240,330),(9,9,211,320),ramp)
spring = trim(source("parca-trambolin"))
spring = remap(spring,[0,round(spring.height*.18),spring.height],[0,17,85])
place("parca-trambolin",(240,90),(5,3,230,85),spring)
funnel = trim(source("parca-huni"))
funnel = remap(funnel,[0,round(funnel.height*.52),round(funnel.height*.64),round(funnel.height*.84),funnel.height],[0,168,197,257,298])
funnel = remap(funnel,[0,round(funnel.width*.48),round(funnel.width*.93),funnel.width],[0,94,188,217],True)
place("parca-huni",(230,302),(5,3,217,298),funnel)

sheet = source("kino-bekle-sheet")
for i in (0,1):
    frame = trim(sheet.crop((i*sheet.width//2,0,(i+1)*sheet.width//2,sheet.height)))
    h = 382
    w = round(frame.width*h/frame.height)
    place("kino-bekle-"+str(i),(520,420),((520-w)//2,20,w,h),frame)
for name in ("kino-saskin","kino-sevin","ceren-bekle","ceren-alkis","ceren-gul"):
    kino = name.startswith("kino")
    size = (520,420) if kino else (420,460)
    h = 382 if kino else 418
    im = trim(source(name))
    w = round(im.width*h/im.height)
    place(name,size,((size[0]-w)//2,20 if kino else 23,w,h),im)

loader = (root / "deney/src/parkur/main.ts").read_text(encoding="utf8")
names = set(re.findall(r"'([^']+)'",loader.split("const CIZIMLER = [")[1].split("] as const")[0]))
assert written == names, written ^ names
print(f"{len(written)} çizim yükleme listesiyle eşleşti.")
