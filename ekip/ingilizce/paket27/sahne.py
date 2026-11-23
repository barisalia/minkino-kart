from PIL import Image
import numpy as np,cv2,json
from pathlib import Path
p=Path('ekip/ingilizce/paket27');o=Path('assets/ingilizce/abc');s=Image.open(p/'polly-kaynak.png').convert('RGBA');sc=s.width/900
for n,l,r,feet in [('goster',0,230,105),('sevin',663,900,768)]:
 c=s.crop((round(l*sc),0,round(r*sc),s.height));b=c.getchannel('A').point(lambda v:255 if v>110 else 0).getbbox();c=c.crop(b);z=.90;c=c.resize(tuple(round(v*z) for v in c.size),Image.Resampling.LANCZOS);a=Image.new('RGBA',(700,700));a.alpha_composite(c,(round(320-((feet-l)*sc-b[0])*z),680-c.height));a.save(o/('polly-'+n+'.webp'),lossless=True)
# Use measured edges on the 782 x 440 inspection render.
s=Image.open(p/'fon-kaynak.png').convert('RGB');xx=np.arange(1920);yy=np.arange(1080)
mx=np.interp(xx,[0,120,420,520,1400,1920],[0,26,153,162,620,782])*s.width/782
left=np.interp(yy,[0,560,820,1080],[0,274,409,440]);right=np.interp(yy,[0,140,780,1080],[0,77,352,440]);blend=np.clip((xx-420)/100,0,1)
my=((1-blend[None,:])*left[:,None]+blend[None,:]*right[:,None])*s.height/440
a=cv2.remap(np.array(s),np.tile(mx,(1080,1)).astype('float32'),my.astype('float32'),cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE);Image.fromarray(a).save(o/'fon.webp',lossless=True)
# Güncel fon üretimi denetim-duzelt.py içinde.
