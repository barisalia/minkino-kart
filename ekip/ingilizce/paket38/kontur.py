from pathlib import Path
from PIL import Image
import cv2,numpy as np,sys,json
p=Path(__file__).resolve().parent
for name in sys.argv[1:]:
 arr=[];q=[]
 for i in range(4):
  im=Image.open(p/'stage'/name/f'{name}-z{i}.webp').convert('RGBA');a=np.array(im);arr.append(a[:,:,3]>127);q.append(a)
 out=Image.new('RGB',(im.width*3,im.height),'white')
 for j in range(1,4):
  layer=np.full((*arr[0].shape,3),249,np.uint8)
  for ix,color in [(0,(242,72,66)),(j,(33,113,230))]:
   contours,_=cv2.findContours(arr[ix].astype('uint8'),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);cv2.drawContours(layer,contours,-1,color,3)
  out.paste(Image.fromarray(layer),((j-1)*im.width,0))
 out.save(p/'kontrol'/f'{name}-kontur.webp',lossless=True,method=2)
 ratios=[round(float(a.sum()/arr[0].sum()),3) for a in arr]
 (p/'kontrol'/f'{name}-oran.json').write_text(json.dumps(ratios));print(name,ratios)
