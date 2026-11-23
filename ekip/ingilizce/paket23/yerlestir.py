from PIL import Image,ImageDraw
import json
from pathlib import Path
p=Path('ekip/ingilizce/paket23'); dest=Path('assets/ingilizce/oyun/saklambac'); src=json.loads((p/'kaynaklar.json').read_text('utf-8-sig'))
im=Image.open(src['oda']).convert('RGB').resize((1600,900),Image.Resampling.LANCZOS); room=Image.new('RGB',im.size)
# Resample the four painted furniture sections onto the touch map, preserving horizontal supports.
xs=[0,42,244,326,712,758,1038,1076,1572,1600]; xd=[0,64,256,480,864,928,1120,1184,1584,1600]
ys=[[0,434,622,782,900],[0,536,782,900],[0,637,782,900],[0,604,782,900]]; yd=[[0,260,520,810,900],[0,470,810,900],[0,600,810,900],[0,560,810,900]]
for i,g in enumerate([0,0,0,1,1,2,2,3,3]):
 for j in range(len(ys[g])-1):
  t=(xd[i],yd[g][j],xd[i+1],yd[g][j+1]);room.paste(im.crop((xs[i],ys[g][j],xs[i+1],ys[g][j+1])).resize((t[2]-t[0],t[3]-t[1]),Image.Resampling.LANCZOS),t)
room.save(dest/'oda.webp',lossless=True)
spec={'mino-kutuda':(1025,606,130,142),'mino-masa-altinda':(680,810,200,245),'mino-yatakta':(1380,563,240,160),'mino-sandalye-yaninda':(360,810,160,270),'mino-buldum':(300,580,550,555),'top':(150,289,278,278),'ayi':(150,289,278,278)}
sheet=Image.new('RGB',(1000,800),'#d9eff1');d=ImageDraw.Draw(sheet)
for i,(n,(x,y,w,h)) in enumerate(spec.items()):
 a=Image.open(src[n]).convert('RGBA');bb=a.getchannel('A').point(lambda v:255 if v>100 else 0).getbbox();a=a.crop(bb);a.thumbnail((w,h),Image.Resampling.LANCZOS);sz=(1600,900) if i<4 else ((600,600) if i==4 else (300,300));layer=Image.new('RGBA',sz);layer.alpha_composite(a,(x-a.width//2,y-a.height));layer.save(dest/(n+'.webp'),lossless=True)
 if i<4:
  preview=Image.alpha_composite(room.convert('RGBA'),layer);preview.thumbnail((500,280));sheet.paste(preview,(i%2*500,i//2*280))
 else:
  a.thumbnail((200,200));sheet.paste(a,((i-4)*300,580),a)
sheet.save(p/'yerlesim.png')
