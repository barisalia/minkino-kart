from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,numpy as np,cv2
q=Path('ekip/ingilizce/paket15');groups=json.loads((q/'gruplar.json').read_text());report=[]
for g,names in enumerate(groups,1):
 large=Image.new('RGB',(1800,1260),'#fff5df');small=Image.new('RGB',(720,350),'#c9e5ef');d=ImageDraw.Draw(large);sd=ImageDraw.Draw(small)
 for i,n in enumerate(names):
  p=Path('assets/ingilizce/kelime')/(n+'.webp');im=Image.open(p).convert('RGBA');assert im.size==(800,800);a=np.array(im);assert a[0,0,3]==0
  cnt,l,stats,c=cv2.connectedComponentsWithStats((a[:,:,3]<128).astype('uint8'),8);holes=[]
  for x,y,w,h,area in stats[1:]:
   if x>0 and y>0 and x+w<800 and y+h<800 and area>5:holes.append([int(v) for v in (x,y,w,h,area)])
  report.append({'name':n,'file':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':list(im.size),'holesForReview':holes})
  big=im.resize((600,600));large.paste(big,(i%3*600,i//3*630),big);d.text((i%3*600+15,i//3*630+603),n,fill='black')
  for s,y in [(120,25),(90,215)]:
   t=im.resize((s,s));small.paste(t,(i*120+(120-s)//2,y),t)
  sd.text((i*120+5,150),n,fill='black')
 large.save(q/f'H{g}-kontrol.jpg',quality=95);small.save(q/f'H{g}-kucuk.png')
(q/'teslim-84.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
pairs=[('sheep','lamb'),('dog','puppy'),('cat','kitten'),('chicken','chick'),('duck','duckling'),('cow','calf'),('frog','tadpole'),('horse','foal')]
for page in range(2):
 board=Image.new('RGB',(1200,680),'#d5eaf1');dr=ImageDraw.Draw(board)
 for i,(adult,baby) in enumerate(pairs[page*4:page*4+4]):
  for j,n in enumerate((adult,baby)):
   im=Image.open(Path('assets/ingilizce/kelime')/(n+'.webp')).convert('RGBA');im.thumbnail((150,150));x=i%2*600+j*200+70;y=i//2*340+90;board.paste(im,(x,y),im);dr.text((x,y+160),n,fill='black')
 board.save(q/f'yavru-karsilastirma-{page+1}.png')
print('84 files checked; alpha regions:',[(r['name'],r['holesForReview']) for r in report if r['holesForReview']])
