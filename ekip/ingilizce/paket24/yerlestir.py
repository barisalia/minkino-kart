from esya import raw,p,d,rows
from PIL import Image
import json,cv2,numpy as np
R=Image.Resampling.LANCZOS
for row in rows:
 n=row['id'];w,h=row['size']
 if not (p/f'{n}-1-kaynak.png').exists():continue
 aa=[raw(n,i) for i in [0,1]]
 # Register the shared physical feature: width of bowl, train, pot, bag etc.; height for hinged openings.
 measure='height' if n in ['kart','ayna','dolap','pencere','kapi','saat','gece-lambasi','fanus','ahir'] else 'width'
 ref=[a.height if measure=='height' else a.width for a in aa]
 anchor={'renk-lambasi':'blue','salincak':'blue','kup-kule':'blue','robot':'cyan','donence':'red','yildiz-fener':'gold'}
 centers=[v.width/2 for v in aa]
 if n in anchor:
  for i,v in enumerate(aa):
   rgb=np.array(v);hsv=cv2.cvtColor(rgb[:,:,:3],cv2.COLOR_RGB2HSV);hue=hsv[:,:,0];sat=hsv[:,:,1]
   lo,hi={'blue':(95,132),'cyan':(85,105),'red':(0,8),'gold':(15,42)}[anchor[n]]
   mask=((hue>=lo)&(hue<=hi)&(sat>110)&(rgb[:,:,3]>170)).astype('uint8')
   if n=='robot':mask[v.height//2:]=0
   if n=='yildiz-fener':mask[v.height//4:]=0
   yy,xx=np.nonzero(mask)
   if len(xx):
    ref[i]=xx.max()-xx.min()+1
    if n=='salincak':centers[i]=(xx.max()+xx.min())/2
 if n=='kup-kule':ref=[aa[0].width*.30,aa[1].width*.95]
 if n=='robot':ref=[a.height for a in aa]
 if n=='renk-lambasi':ref=[aa[0].width*.88,aa[1].width*.62]
 if n=='salincak':
  ref=[aa[0].width*.99,aa[1].width*.69]
  centers=[aa[0].width*.50,aa[1].width*.345]
 ratios=[r/ref[0] for r in ref]
 sc=min(min(w*.48/(max(c,a.width-c)/r),h/(a.height/r)) for a,r,c in zip(aa,ratios,centers))
 for st,(a,r) in enumerate(zip(aa,ratios)):
  sz=tuple(max(1,round(v*sc/r)) for v in a.size);a=a.resize(sz,R);o=Image.new('RGBA',(w,h));y=0 if n in ['salincak','donence','yildiz-fener'] else h-a.height
  if n in ['ayna','saat','pencere']:y=(h-a.height)//2
  o.alpha_composite(a,(round(w/2-centers[st]*sc/r),y));o.save(d/f'{n}-{st}.webp',lossless=True)
for st in [0,1]:
 scene=Image.open(d/'fon.webp').convert('RGBA');bird=Image.open(d/f'polly-{st}.webp').convert('RGBA').resize((280,420),R);scene.alpha_composite(bird,(940,140))
 for row in rows:
  fn=d/(row['id']+f'-{st}.webp')
  if fn.exists():
   x,y,w,h=row['rect'];scene.alpha_composite(Image.open(fn).convert('RGBA').resize((w,h),R),(x,y))
 scene.thumbnail((960,540));scene.save(p/f'ev-{st}.png')
