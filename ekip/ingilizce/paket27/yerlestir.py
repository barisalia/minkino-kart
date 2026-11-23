from pathlib import Path
from PIL import Image,ImageDraw
import string,cv2,numpy as np
p=Path('ekip/ingilizce/paket27');out=Path('assets/ingilizce/abc');R=Image.Resampling.LANCZOS
def crop(a):
 return a.crop(a.getchannel('A').point(lambda x:255 if x>96 else 0).getbbox())
def restore_letter(a):
 # Restore opaque fill only inside closed ink contours containing a dominant letter color.
 rgba=np.array(a);rgb=rgba[:,:,:3];alpha=rgba[:,:,3];ink=(rgb.max(axis=2)<72)&(alpha>100)
 barrier=cv2.morphologyEx(ink.astype('uint8'),cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
 _,labels,stats,_=cv2.connectedComponentsWithStats(1-barrier)
 for j in range(1,len(stats)):
  x,y,w,h,area=stats[j]
  if x<2 or y<2 or x+w>=a.width-1 or y+h>=a.height-1 or area<15000:continue
  region=labels==j;sample=rgb[region&(alpha>225)]
  if len(sample)<area*.28:continue
  col=np.median(sample,axis=0)
  if max(col)-min(col)<60:continue
  if np.mean(np.max(np.abs(sample.astype(float)-col),axis=1)<36)<.65:continue
  missing=region&(alpha<245)
  if missing.sum()>150:rgba[missing]=[*col.astype(int),255]
 return Image.fromarray(rgba)
def write():
 for f in p.glob('*-kaynak.png'):
  n=f.stem.removesuffix('-kaynak');d=out/(n+'.webp')
  if d.exists() and d.stat().st_mtime>=f.stat().st_mtime:continue
  a=Image.open(f)
  if n=='polly':continue
  if n=='fon':a.convert('RGB').resize((1920,1080),R).save(d,lossless=True);continue
  a=a.convert('RGBA');a=restore_letter(a) if n.startswith('harf-') else a;a=crop(a);side=680 if n.startswith('harf-') else 600;a.thumbnail((side,side),R);o=Image.new('RGBA',(800,800));o.alpha_composite(a,((800-a.width)//2,(800-a.height)//2));o.save(d,lossless=True)
def sheets():
 groups=[['harf-'+k for k in string.ascii_lowercase[i:i+6]] for i in range(0,24,6)]+[['harf-y','harf-z','igloo','quilt','umbrella','van'],['yo-yo','polly-goster','polly-sevin']]
 for idx,group in enumerate(groups,1):
  o=Image.new('RGB',(880,460),'#dfedf1');pen=ImageDraw.Draw(o)
  for i,k in enumerate(group):
   f=out/(k+'.webp')
   if not f.exists():continue
   a=Image.open(f).convert('RGBA');x=i%3*290;y=i//3*230
   for side,dx,dy in [(205,0,0),(75,210,100)]:
    v=a.resize((side,side),R);o.paste(v,(x+dx,y+dy),v)
   pen.text((x+12,y+207),k,fill='black')
  o.save(p/f'sayfa-{idx}.jpg',quality=93)
if __name__=='__main__':write();sheets()
