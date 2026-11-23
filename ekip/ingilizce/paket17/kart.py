from pathlib import Path
from PIL import Image,ImageDraw
import json
p=Path('ekip/ingilizce/paket17')
def card(a):
 a=a.convert('RGBA'); a=a.crop(a.getchannel('A').point(lambda v:255 if v>64 else 0).getbbox());a.thumbnail((600,600),Image.Resampling.LANCZOS);o=Image.new('RGBA',(800,800));o.alpha_composite(a,((800-a.width)//2,(800-a.height)//2));return o
if __name__=='__main__':
 for i,(n,src) in enumerate(json.loads((p/'ilk-kaynaklar.json').read_text('utf-8-sig')).items()):
  if i%6==0:s=Image.new('RGB',(900,550),'#deeff1')
  a=card(Image.open(src));target=Path('assets/ingilizce/kelime')/(n+'.webp');assert not target.exists();a.save(target,lossless=True);a.thumbnail((265,240));x=i%3*300;y=(i%6)//3*275;s.paste(a,(x,y),a);ImageDraw.Draw(s).text((x+10,y+240),n,fill='black')
  if i%6==5:s.save(p/f'P17-{i//6+1}.png')
