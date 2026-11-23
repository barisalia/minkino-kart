from pathlib import Path
from PIL import Image, ImageDraw
import sys
p=Path('ekip/ingilizce/paket38/kontrol')
names=sys.argv[2:];base=sys.argv[1]
for i in range(0,len(names),2):
 current=names[i:i+2]
 out=Image.new('RGB',(800,len(current)*214),'#e6eddf');dr=ImageDraw.Draw(out)
 for j,n in enumerate(current):
  out.paste(Image.open(p/(n+'-poz.jpg')),(0,j*214));dr.text((7,j*214+200),n,fill='#343a34')
 out.save(p/f'{base}-{i//2}.jpg',quality=92)
