from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,shutil,numpy as np,cv2
q=Path('ekip/ingilizce/paket15');data=json.loads((q/'uretim.json').read_text(encoding='utf-8'));g=int(sys.argv[1]);names=json.loads((q/'gruplar.json').read_text())[g-1]
report=[];large=Image.new('RGB',(1800,1260),'#fff5df');small=Image.new('RGB',(720,350),'#c9e5ef');d=ImageDraw.Draw(large);sd=ImageDraw.Draw(small)
for i,n in enumerate(names):
 src=Path(data[n]['path']);shutil.copy2(src,q/(n+'-kaynak.png'));im=Image.open(src).convert('RGBA');a=np.array(im);mask=(a[:,:,3]>128);ys,xs=np.where(mask)
 box=(int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1));crop=im.crop(box)
 size=640 if n not in ['lamb','puppy','kitten','chick','duckling','calf','piglet','foal'] else 520
 crop.thumbnail((size,size),Image.Resampling.LANCZOS);out=Image.new('RGBA',(800,800));out.alpha_composite(crop,((800-crop.width)//2,720-crop.height));dest=Path('assets/ingilizce/kelime')/(n+'.webp')
 if dest.exists():raise RuntimeError('Do not overwrite '+str(dest))
 out.save(dest,lossless=True,exact=True)
 # Detect closed transparent holes for visual review, not automatic removal.
 a=np.array(out);cnt,l,stats,c=cv2.connectedComponentsWithStats((a[:,:,3]<128).astype('uint8'),8);holes=[]
 for x,y,w,h,area in stats[1:]:
  if x>0 and y>0 and x+w<800 and y+h<800 and area>5:holes.append([int(v) for v in (x,y,w,h,area)])
 report.append({'name':n,'size':[800,800],'sourceSize':list(im.size),'holesForReview':holes})
 big=out.resize((600,600));large.paste(big,(i%3*600,i//3*630),big);d.text((i%3*600+15,i//3*630+603),n,fill='black')
 thumb=out.resize((120,120));small.paste(thumb,(i%6*120,25),thumb);sd.text((i%6*120+5,150),n,fill='black')
 thumb=out.resize((90,90));small.paste(thumb,(i%6*120+15,215),thumb)
large.save(q/f'H{g}-kontrol.jpg',quality=95);small.save(q/f'H{g}-kucuk.png');(q/f'H{g}-kontrol.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
