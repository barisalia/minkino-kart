from pathlib import Path
import cv2,numpy as np,json
from PIL import Image,ImageDraw
p=Path('ekip/ingilizce/paket27');d=Path('assets/ingilizce/abc');R=Image.Resampling.LANCZOS
report={}
for k in 'mndy':
 if k in 'mn':
  a=Image.open(p/f'harf-{k}-yeni.png').convert('RGBA');a=a.crop(a.getchannel('A').point(lambda v:255 if v>96 else 0).getbbox());a.thumbnail((680,680),R);o=Image.new('RGBA',(800,800));o.alpha_composite(a,((800-a.width)//2,(800-a.height)//2))
 else:o=Image.open(d/f'harf-{k}.webp').convert('RGBA')
 arr=np.array(o);rgb=arr[:,:,:3];al=arr[:,:,3];hsv=cv2.cvtColor(rgb,cv2.COLOR_RGB2HSV);ink=(rgb.max(2)<80)&(al>110)
 barriers=cv2.morphologyEx(ink.astype('uint8'),cv2.MORPH_CLOSE,np.ones((3,3),np.uint8));_,lab,stats,_=cv2.connectedComponentsWithStats(1-barriers)
 ids=[i for i in range(1,len(stats)) if stats[i,0]>0 and stats[i,1]>0 and stats[i,4]>45000];assert ids,k
 j=max(ids,key=lambda i:stats[i,4]);inside=lab==j;core=cv2.erode(inside.astype('uint8'),np.ones((3,3),np.uint8)).astype(bool);color=np.median(rgb[inside&(al>240)&(hsv[:,:,1]>110)],axis=0).astype('uint8');assert max(map(int,color))-min(map(int,color))>80
 arr[core]=[*color,255];res=Image.fromarray(arr);res.save(d/f'harf-{k}.webp',lossless=True)
 back=np.array(Image.open(d/f'harf-{k}.webp'));assert np.all(back[core]==[*color,255]);assert all(back[y,x,3]==0 for x,y in [(0,0),(799,0),(0,799),(799,799)])
 report[k]={'solid_pixels':int(core.sum()),'RGB':color.tolist(),'size':res.size,'alpha_corners':0}
# Single horizontal coordinate map shared by the entire image preserves the level floor.
im=np.array(Image.open(p/'fon-yeni.png').convert('RGB'));h,w=im.shape[:2];xx=np.interp(np.arange(1920),[0,120,420,520,1400,1920],[0,50,175,216,584,800])*w/800; yy=np.interp(np.arange(1080),[0,140,560,780,797,820,1080],[0,58,235,325,345,360,450])*h/450
im=cv2.remap(im,np.tile(xx,(1080,1)).astype('float32'),np.tile(yy[:,None],(1,1920)).astype('float32'),cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE);Image.fromarray(im).save(d/'fon.webp',lossless=True)
for x in (5,500,1000,1500,1915):
 ys=np.where(im[787:807,x].max(1)<125)[0]+787;assert len(ys) and abs(np.median(ys)-797)<4,(x,ys)
report['fon']={'board':[520,140,1400,780],'perch':[120,560,420,820],'floor_y':797};(p/'duzeltme-kontrol.json').write_text(json.dumps(report,indent=2))
o=Image.new('RGB',(740,440),'#c5e2e8')
for i,k in enumerate('mndy'):
 a=Image.open(d/f'harf-{k}.webp').convert('RGBA');x=i%2*370;y=i//2*220
 for dx,v in [(0,216),(235,80)]:
  b=a.resize((v,v),R);o.paste(b,(x+dx,y+(220-v)//2),b)
o.save(p/'mn-dy-son.png');Image.fromarray(im).resize((800,450),R).save(p/'fon-son.png')
