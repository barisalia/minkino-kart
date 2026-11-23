from pathlib import Path
import json
from PIL import Image
p=Path('ekip/ingilizce/paket18');s=json.loads((p/'ilk-kaynaklar.json').read_text('utf-8-sig'));dest=Path('assets/ingilizce/ada')
items={'meyve-set':(500,837,810,430),'meyve-karpuz':(230,842,135,100),'meyve-kelebek':(675,440,83,80),'hava-set':(475,840,770,362),'hava-bulut':(344,376,185,112),'hava-gunes':(778,392,129,129),'hava-gokkusagi':(650,508,265,124)}
def crop(a):return a.crop(a.getchannel('A').point(lambda v:255 if v>100 else 0).getbbox())
def put(n,a,x,y):
 o=Image.new('RGBA',(1000,900));o.alpha_composite(a,(int(x-a.width/2),y-a.height));o.save(dest/(n+'.webp'),lossless=True)
for n,(x,y,w,h) in items.items():
 a=crop(Image.open(s[n]).convert('RGBA'));a.thumbnail((w,h),Image.Resampling.LANCZOS);put(n,a,x,y)
for n,windows,x in [('meyve-mino',[(4,51,164,282),(836,51,996,282)],505),('hava-kino',[(2,10,147,310),(807,5,996,310)],580)]:
 a=Image.open(s[n]).convert('RGBA');scale=a.width/1000
 for i,box in enumerate(windows):
  part=crop(a.crop(tuple(round(v*scale) for v in box)));part=part.resize(tuple(round(v*.56) for v in part.size),Image.Resampling.LANCZOS);put(n+'-'+str(i),part,x+(20 if n=='hava-kino' and i else 0),842)
for island,char in [('meyve','mino'),('hava','kino')]:
 sheet=Image.new('RGB',(860,380),'#dbf1f1')
 for i in [0,1]:
  o=Image.new('RGBA',(1000,900));layers=[island+'-set']+[k for k in s if k.startswith(island+'-') and k!=island+'-set' and k!=island+'-'+char]+[island+'-'+char+'-'+str(i)]
  for k in layers:o.alpha_composite(Image.open(dest/(k+'.webp')).convert('RGBA'))
  o.thumbnail((425,380));sheet.paste(o,(i*430,0),o)
 sheet.save(p/(island+'-birlesim.png'))
