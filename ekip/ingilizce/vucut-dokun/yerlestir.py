from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np,cv2,json
p=Path('ekip/ingilizce/vucut-dokun');d=Path('assets/ingilizce/oyun/vucut');d.mkdir(parents=True,exist_ok=True)
a=Image.open(p/'taslak.png').convert('RGBA')
x=np.arange(800);y=np.arange(1200);ys=np.interp(y,[0,24,144,288,372,394,540,600,710,720,840,888,984,1104,1190,1199],[0,24,160,354,454,476,561,615,681,689,847,888,984,1104,1190,1199])
# Align each hand and shoe box while retaining one continuous static silhouette.
hand=np.interp(x,[0,16,144,270,530,656,784,799],[0,30,176,270,530,623,768,799])
feet=np.interp(x,[0,192,384,416,608,799],[0,148,380,414,645,799]);wh=np.interp(y,[0,540,715,841,889,1199],[0,0,1,1,0,0]);wf=np.interp(y,[0,985,1090,1199],[0,0,1,1])
mx=x[None,:]+wh[:,None]*(hand-x)+wf[:,None]*(feet-x);my=np.tile(ys[:,None],(1,800))
a=Image.fromarray(cv2.remap(np.array(a.convert('RGBa')),mx.astype('float32'),my.astype('float32'),cv2.INTER_LINEAR)).convert('RGBA');a.save(d/'kino.webp',lossless=True)
boxes={'hair':[264,24,536,144],'teeth':[336,288,464,372],'shoulders':[160,444,304,540],'shoulders-2':[496,444,640,540],'arms':[48,480,176,720],'arms-2':[624,480,752,720],'fingers':[16,720,144,840],'fingers-2':[656,720,784,840],'tummy':[304,600,496,768],'knees':[240,888,384,984],'knees-2':[416,888,560,984],'toes':[192,1104,384,1188],'toes-2':[416,1104,608,1188]}
points={'hair':[415,62],'teeth':[395,301],'shoulders':[264,492],'shoulders-2':[531,491],'arms':[163,616],'arms-2':[637,616],'fingers':[88,761],'fingers-2':[716,761],'tummy':[400,681],'knees':[292,933],'knees-2':[497,935],'toes':[282,1143],'toes-2':[515,1144]}
o=Image.new('RGB',a.size,'#d6ecf1');o.paste(a,mask=a.getchannel('A'));draw=ImageDraw.Draw(o)
for k,(x1,y1,x2,y2) in boxes.items():
 x,y=points[k];assert x1<=x<=x2 and y1<=y<=y2 and a.getpixel((x,y))[3]>240,(k,a.getpixel((x,y)));draw.rectangle((x1,y1,x2,y2),outline='#24788c',width=2);draw.ellipse((x-3,y-3,x+3,y+3),fill='#ec4276')
o.resize((480,720),Image.Resampling.LANCZOS).save(p/'bolgeler.png');(p/'koordinatlar.json').write_text(json.dumps(dict(boxes=boxes,points=points),indent=2))

