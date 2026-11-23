from pathlib import Path
import numpy as np,cv2,json
from PIL import Image
p=Path('ekip/ingilizce/paket24');dest=Path('assets/ingilizce/agac-evi');dest.mkdir(parents=True,exist_ok=True);s=json.loads((p/'kaynak.json').read_text('utf-8-sig'));R=Image.Resampling.LANCZOS
a=Image.open(s['fon']).convert('RGB');w,h=a.size
# Map painted support edges to logical room coordinates. Use a continuous mapping across depth.
Y=np.arange(1080);ystops=[0,520,620,870,1010,1080];srcy=[0,222,254,358,416,450];my=np.interp(Y,ystops,srcy)*h/450
X=np.arange(1920);levels=[(0,[0,960,1200,1920],[0,395,499,800]),(520,[0,960,1200,1920],[0,395,499,800]),(620,[0,240,720,1220,1890,1920],[0,93,299,505,760,800]),(870,[0,900,1160,1920],[0,363,492,800]),(1010,[0,900,1160,1920],[0,363,492,800]),(1080,[0,900,1160,1920],[0,363,492,800])]
# Horizontal shift across blank wall only; hold shelf/table geometry throughout furniture thickness.
levels=[levels[0],(535,*levels[1][1:]),(580,*levels[2][1:]),(710,*levels[2][1:]),(820,*levels[3][1:]),levels[4],levels[5]]
mx=np.zeros((1080,1920),np.float32)
for (y0,dx0,sx0),(y1,dx1,sx1) in zip(levels,levels[1:]):
 q=np.arange(y1-y0)[:,None]/(y1-y0);mx[y0:y1]=((1-q)*np.interp(X,dx0,sx0)+q*np.interp(X,dx1,sx1))*w/800
room=Image.fromarray(cv2.remap(np.asarray(a),mx,np.repeat(my[:,None],1920,1).astype('float32'),cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE));room.save(dest/'fon.webp',lossless=True)
def tight(a):return a.crop(a.getchannel('A').point(lambda x:255 if x>110 else 0).getbbox())
def fit(a,sz):a.thumbnail(sz,R);return a
card=fit(tight(Image.open(s['kart']).convert('RGBA')),(530,530));o=Image.new('RGBA',(600,600));o.alpha_composite(card,((600-card.width)//2,(600-card.height)//2));o.save(dest/'kart.webp',lossless=True)
a=Image.open(s['polly']).convert('RGBA');sc=a.width/800
for i,(left,right,feet) in enumerate([(10,180,104),(585,797,672)]):
 c=a.crop((round(left*sc),0,round(right*sc),a.height));bb=c.getchannel('A').point(lambda x:255 if x>110 else 0).getbbox();v=c.crop(bb);factor=.91;v=v.resize(tuple(round(n*factor) for n in v.size),R);x=round(234-((feet-left)*sc-bb[0])*factor);o=Image.new('RGBA',(560,840));o.alpha_composite(v,(x,760-v.height));o.save(dest/f'polly-{i}.webp',lossless=True)
