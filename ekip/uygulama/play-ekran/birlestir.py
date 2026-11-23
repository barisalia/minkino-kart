"""Claude'un ham/<cihaz>/<ad>.png karelerini hazırlanan çerçevelerle birleştir."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent

def birlestir():
    for cerceve in sorted((ROOT / "cerceveler").glob("*/*.png")):
        goreli = cerceve.relative_to(ROOT / "cerceveler")
        ham = ROOT / "ham" / goreli
        if not ham.is_file():
            print("Ham kare bekleniyor:", goreli)
            continue
        ust = Image.open(cerceve).convert("RGBA")
        pencere = ImageOps.invert(ust.getchannel("A")).getbbox()
        x, y, sag, alt = pencere
        with Image.open(ham) as kaynak:
            ekran = ImageOps.contain(ImageOps.exif_transpose(kaynak).convert("RGB"),
                                     (sag-x, alt-y), Image.Resampling.LANCZOS)
        sayfa = Image.new("RGB", ust.size, "#252734")
        sayfa.paste(ekran, (x+(sag-x-ekran.width)//2, y+(alt-y-ekran.height)//2))
        sayfa.paste(ust, mask=ust.getchannel("A"))
        hedef = ROOT / goreli
        hedef.parent.mkdir(exist_ok=True)
        sayfa.save(hedef)
        print("Hazır:", goreli)

if __name__ == "__main__":
    birlestir()
