import json
from pathlib import Path
from PIL import Image,ImageDraw
p=Path('ekip/ingilizce/paket24');rows=json.loads((p/'esyalar.json').read_text());d=Path('assets/ingilizce/agac-evi')
def raw(id,i):
 a=Image.open(p/f'{id}-{i}-kaynak.png').convert('RGBA')
 if id=='yildiz-fener':
  import cv2,numpy as np
  rgb=np.array(a);hsv=cv2.cvtColor(rgb[:,:,:3],cv2.COLOR_RGB2HSV);valid=((rgb[:,:,3]>170)&((hsv[:,:,1]>70)|(hsv[:,:,2]<110))).astype('uint8')
  contours=cv2.findContours(valid,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)[0];mask=np.zeros(valid.shape,np.uint8);cv2.drawContours(mask,[max(contours,key=cv2.contourArea)],-1,255,cv2.FILLED)
  if i==0:rgb[:,:,3]=np.minimum(rgb[:,:,3],mask)
  else:rgb[:,:,3]=np.where((hsv[:,:,1]<32)&(mask==0),0,rgb[:,:,3])
  a=Image.fromarray(rgb)
 return a.crop(a.getchannel('A').point(lambda v:255 if v>100 else 0).getbbox())
def previews():
 for page in range(8):
  o=Image.new('RGB',(840,480),'#d5ecef');pen=ImageDraw.Draw(o)
  for i,row in enumerate(rows[3*page:3*page+3]):
   for st in [0,1]:
    f=p/f"{row['id']}-{st}-kaynak.png"
    if not f.exists():continue
    a=raw(row['id'],st);a.thumbnail((255,195));x=i*280;y=st*240;o.paste(a,(x+(280-a.width)//2,y+195-a.height),a);pen.text((x+10,y+200),row['id']+str(st),fill='black')
  o.save(p/f'ham-{page+3}.jpg')
if __name__=='__main__':previews()
