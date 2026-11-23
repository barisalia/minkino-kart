from pathlib import Path
from PIL import Image
import cv2,numpy as np
p=Path(__file__).resolve().parent
d=p.parents[2]/'assets/ingilizce/kitap/gol'
rs=Image.Resampling.LANCZOS
def save(n,img):
 img.save(d/(n+'.webp'),lossless=True,method=2)
def cells(name,cols,rows):
 im=Image.open(p/'kaynak'/(name+'.png')).convert('RGBA')
 result=[]
 for j in range(cols*rows):
  x=j%cols;y=j//cols
  a=im.crop((round(x*im.width/cols),round(y*im.height/rows),round((x+1)*im.width/cols),round((y+1)*im.height/rows)))
  arr=np.array(a);al=arr[:,:,3].copy();count,lab,st,_=cv2.connectedComponentsWithStats((al>95).astype('uint8'))
  keep=np.zeros(al.shape,np.uint8)
  for k in range(1,count):
   if st[k,-1]>100 and st[k,2]>5 and st[k,3]>5:keep[lab==k]=1
  arr[:,:,3]=al*cv2.dilate(keep,np.ones((3,3),np.uint8));a=Image.fromarray(arr);result.append(a.crop(a.getbbox()))
 return result
def render(a,size,h,bottom,center=None,paper=False):
 w=round(a.width*h/a.height);a=a.resize((w,h),rs)
 if paper:
  mask=np.asarray(a.getchannel('A'));outline=cv2.dilate(mask,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
 b=Image.new('RGBA',size);x=(center if center is not None else size[0]//2)-w//2
 b.alpha_composite(a,(x,bottom-h))
 if paper:
  mask=np.array(b.getchannel('A'));edge=cv2.dilate(mask,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
  edge[bottom:,:]=0;white=Image.new('RGBA',size,'white');white.putalpha(Image.fromarray(edge));white.alpha_composite(b);b=white
 return b
def feature(base,variant,box):
 # Register to the same face before transferring the redrawn eyes or mouth.
 b=np.array(base.convert('RGB'));v=np.array(variant.convert('RGB'))
 x,y,r,t=box;m=np.zeros(b.shape[:2],np.uint8);cv2.rectangle(m,(max(0,x-33),max(0,y-30)),(min(b.shape[1]-1,r+33),min(b.shape[0]-1,t+30)),255,-1);m[y:t,x:r]=0
 scores=[]
 for dy in range(-16,17,2):
  for dx in range(-16,17,2):
   ys,xs=np.nonzero(m[::4,::4]);ys*=4;xs*=4
   scores.append((np.abs(b[ys,xs].astype(float)-v[ys+dy,xs+dx]).mean(),dx,dy))
 _,dx,dy=min(scores);out=base.copy();out.paste(variant.crop((x+dx,y+dy,r+dx,t+dy)),(x,y));return out
def series(name,cols,rows,names,size,height,base,paper=False):
 variants=[render(a,size,height,base,paper=paper) for a in cells(name,cols,rows)]
 for n,v in zip(names,variants):save(n,v)
 return variants
ducks=['ordek-muz-'+n for n in ['0','kirp','1','2','3','evet']]
v=series('ordek',3,2,ducks,(800,800),545,740)
k4=['kino-diz-0','kino-diz-kirp','kino-sasir','kino-gul'];v=series('kino4',2,2,k4,(800,800),600,760)
k3=['kino-sor-'+str(i) for i in range(3)];v=series('kino3',3,1,k3,(800,800),600,760,True)
ps=['polly-kitap-'+n for n in ['0','kirp','konus-1','konus-2','gul','sasir']]
v=series('polly',3,2,ps,(600,600),480,540,True)
cs=['ceren-kitap-'+n for n in ['0','1','kirp']]
v=series('ceren',3,1,cs,(900,1000),970,1000,True)
for names,title in [(ducks,'ordek'),(k4,'kino4'),(k3,'kino3'),(ps,'polly'),(cs,'ceren')]:
 out=Image.new('RGB',(len(names)*200,200),'#bdcdd2')
 for j,n in enumerate(names):
  v=Image.open(d/(n+'.webp')).resize((200,200),rs);out.paste(v,(j*200,0),v)
 out.save(p/(title+'-kareler.jpg'),quality=96)
def registered_pair(base,other,normalized):
 w,h=base.size
 box=tuple(round(v*(w if i%2==0 else h)/200) for i,v in enumerate(normalized))
 return feature(base,other,box)
def get(n):return Image.open(d/(n+'.webp')).convert('RGBA')
for bn,vn,rect in [(k4[0],k4[1],(92,65,135,92)),(k3[0],k3[1],(104,91,125,107)),(k3[0],k3[2],(104,91,125,109)),(ps[0],ps[1],(89,53,137,84)),(ps[2],ps[3],(98,64,129,99)),(cs[0],cs[1],(83,95,121,117)),(cs[0],cs[2],(55,57,145,92)),(ducks[0],ducks[1],(70,91,115,116))]:
 save(vn,registered_pair(get(bn),get(vn),rect))
for n in k4+k3:
 a=np.array(get(n));y,x=np.indices(a.shape[:2]);r,g,b=a[:,:,:3].transpose(2,0,1).astype(float);mask=(y>490)&(x<346)&(r>g*1.45)&(g>b*1.45)&(r>90)&(a[:,:,3]>20)
 a[mask,:3]=[255,254,249];save(n,Image.fromarray(a))
for n in ps:
 a=get(n);ar=np.asarray(a);yy,xx=np.indices(ar.shape[:2]);r,g,b=ar[:,:,:3].transpose(2,0,1).astype(float);feet=(yy>494)&(r>155)&(g>90)&(b<90)&(ar[:,:,3]>180)
 if feet.any():
  dx=round(300-(xx[feet].min()+xx[feet].max())/2);o=Image.new('RGBA',a.size);o.alpha_composite(a,(dx,0));save(n,o)
for n,size in {**{f'kabarcik-{i}':(400,400) for i in range(2)},**{f'sicrama-{i}':(600,400) for i in range(3)},'halka':(500,500),'etiket-evet':(360,260),'etiket-hayir':(360,260),'etiket-sozcuk':(420,170),'muz-suda':(300,200)}.items():
 a=Image.open(p/'kaynak'/(n+'.png')).convert('RGBA');al=np.array(a.getchannel('A'));al[al<26]=0;a.putalpha(Image.fromarray(al));a=a.crop(a.getbbox())
 w,h=size; scale=min((w-16)/a.width,(h-28)/a.height)
 if n.startswith('sicrama'):scale*= {'sicrama-0':0.55,'sicrama-1':1,'sicrama-2':0.8}[n]
 a=a.resize((round(a.width*scale),round(a.height*scale)),rs);o=Image.new('RGBA',size);o.alpha_composite(a,((w-a.width)//2,(380-a.height) if n.startswith('sicrama') else (h-a.height)//2));save(n,o)
# Transfer the complete eyelid drawing, including the old eye's lower contour.
for sn,cols,rows,names,sz,h,bt,paper,rect in [('kino4',2,2,k4,(800,800),600,760,False,(89,52,141,98)),('ordek',3,2,ducks,(800,800),545,740,False,(61,81,119,125)),('polly',3,2,ps,(600,600),480,540,True,(86,48,139,88))]:
 aa=cells(sn,cols,rows);variant=render(aa[1],sz,h,bt,paper=paper)
 baseimg=get(names[0]);save(names[1],registered_pair(baseimg,variant,rect))
# Restore fully opaque paper behind the printed green label.
n='etiket-evet';im=get(n);ar=np.array(im);rr,gg,bb=ar[:,:,:3].transpose(2,0,1).astype(int)
green=(gg>rr*1.3)&(gg>bb*1.3);m=green.astype(np.uint8)
cts,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);filled=np.zeros_like(m);cv2.drawContours(filled,[max(cts,key=cv2.contourArea)],-1,1,-1)
inside=cv2.erode(filled,np.ones((3,3),np.uint8)).astype(bool);bad=inside&((ar[:,:,3]<245)|green);ar[bad]=[40,161,67,255];save(n,Image.fromarray(ar))
# Alternate positions of the independently drawn bubbles for the loop.
im=get('kabarcik-1');ar=np.array(im);_,lab,st,_=cv2.connectedComponentsWithStats((ar[:,:,3]>70).astype('uint8'));o=Image.new('RGBA',im.size)
for j,k in enumerate(sorted(range(1,len(st)),key=lambda i:st[i,1])):
 x,y,w,h,area=st[k]
 if area<30:continue
 patch=im.crop((max(0,x-2),max(0,y-2),min(400,x+w+2),min(400,y+h+2)));o.alpha_composite(patch,(max(0,x-2)+[5,-8,11,-5,8,-9,3][j%7],max(0,y-2)+[0,-5,5,-6,3,-4,1][j%7]))
save('kabarcik-1',o)
