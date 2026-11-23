from PIL import Image
from pathlib import Path
import sys,shutil,json
n,p=sys.argv[1:];q=Path('ekip/ingilizce/paket15');im=Image.open(p).convert('RGBA');im=im.crop(im.getchannel('A').point(lambda v:255 if v>128 else 0).getbbox());im.thumbnail((640,640),Image.Resampling.LANCZOS);o=Image.new('RGBA',(800,800));o.alpha_composite(im,((800-im.width)//2,720-im.height));o.save(f'assets/ingilizce/kelime/{n}.webp',lossless=True,exact=True);shutil.copy2(p,q/(n+'-duzeltilmis-kaynak.png'));bg=Image.new('RGBA',(800,800),'#fff5df');bg.alpha_composite(o);bg.convert('RGB').save(q/(n+'-son-kontrol.png'))
