"""Extract the four hand-drawn cells at the original vocabulary sprite's scale."""
from pathlib import Path
import json,sys,shutil,os
import numpy as np,cv2
from PIL import Image,ImageDraw
p=Path(__file__).resolve().parent
d=p.parents[2]/'assets/ingilizce/kelime'
qa=p/'kontrol'
def extract(source):
 a=np.array(Image.open(source).convert('RGBA'));alpha=a[:,:,3].copy()
 _,labels,stats,centers=cv2.connectedComponentsWithStats((alpha>190).astype('uint8'))
 bodies=sorted(range(1,len(stats)),key=lambda i:stats[i,-1],reverse=True)[:4]
 if len(bodies)!=4 or min(stats[i,-1] for i in bodies)<.12*max(stats[i,-1] for i in bodies):raise ValueError(f'{source}: inspect disconnected figures')
 bodies=sorted(bodies,key=lambda i:centers[i,1]);order=sorted(bodies[:2],key=lambda i:centers[i,0])+sorted(bodies[2:],key=lambda i:centers[i,0]);cells=[]
 for k in order:
  mask=np.uint8(labels==k)
  for j in range(1,len(stats)):
   if j in bodies or stats[j,-1]<45:continue
   if k==min(bodies,key=lambda i:np.sum((centers[j]-centers[i])**2)):mask|=np.uint8(labels==j)
  ar=a.copy();ar[:,:,3]=alpha*cv2.dilate(mask,np.ones((3,3),np.uint8));im=Image.fromarray(ar)
  cells.append(im.crop(im.getbbox()))
 return cells
def run(n):
 original=d/(n+'.webp');src=Image.open(original).convert('RGBA')
 W,H=src.size;assert src.getchannel('A').getextrema()[0]==0
 L,T,R,B=src.getbbox();width=R-L;height=B-T;cx=(L+R)/2
 cells=extract(p/'sheet'/(n+'.png'))
 nominal=min(width/cells[0].width,height/cells[0].height)
 lift=55 if T>=58 else 38
 frames=[src];stage=p/'stage'/n;stage.mkdir(parents=True,exist_ok=True)
 shutil.copyfile(original,stage/f'{n}-z0.webp')
 for j,cell in enumerate(cells[1:],1):
  floor=B-(lift if j==2 else 0);scale=min(nominal,(W-4)/cell.width,(floor-2)/cell.height)
  s=cell.resize((max(1,round(cell.width*scale)),max(1,round(cell.height*scale))),Image.Resampling.LANCZOS)
  x=min(W-s.width-1,max(1,round(cx-s.width/2)));y=floor-s.height
  im=Image.new('RGBA',src.size);im.alpha_composite(s,(x,y))
  f=stage/f'{n}-z{j}.webp';im.save(f,lossless=True,exact=True,method=1)
  with Image.open(f) as check:
   box=check.getbbox();assert check.mode=='RGBA' and check.size==src.size and box[3]==floor and box[1]>=1 and box[2]<W
  frames.append(im)
 assert (stage/f'{n}-z0.webp').read_bytes()==original.read_bytes()
 proof=Image.new('RGB',(800,200),'#cadad9');anim=[]
 for j,frame in enumerate(frames):
  fr=frame.copy();fr.thumbnail((194,194),Image.Resampling.LANCZOS);bg=Image.new('RGBA',(200,200),'#cadad9');bg.alpha_composite(fr,((200-fr.width)//2,(200-fr.height)//2));proof.paste(bg,(j*200,0));anim.append(bg.convert('RGB'))
 proof.save(qa/f'{n}-poz.jpg',quality=95)
 seq=[anim[k] for k in [0,1,2,3,0]*4+[0]]
 seq[0].save(qa/f'{n}.gif',save_all=True,append_images=seq[1:],duration=[120]*20+[100],loop=0)
 return [n,W,H,B,lift]
if __name__=='__main__':
 for n in sys.argv[1:]:print(run(n))
