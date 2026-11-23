from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import shutil
here=Path(__file__).resolve().parent
root=here.parents[3]
dest=root/'assets/ingilizce/masal2';dest.mkdir(exist_ok=True)
src=here/'kaynak'
gen=Path.home()/'.codex/generated_images/01a1e14b-4481-7412-b62b-3926a207c1dc'
ids=dict(bank='768a',shore='03ee',path='fe4e',sunset='58df',walk='508c',cow='0d5b',hat='aac1',reach='f2f7',surprise='6ec3')
for key,prefix in ids.items():
 f=src/(key+'.png')
 if not f.exists(): shutil.copyfile(next(gen.glob('exec-'+prefix+'*.png')),f)
lib=root/'assets/ingilizce'
def sprite(key):
 f=src/(key+'.png') if key in ids else lib/(key+'.webp')
 im=Image.open(f).convert('RGBA')
 return im.crop(im.getchannel('A').point(lambda x:255 if x>32 else 0).getbbox())
def back(key):
 return ImageOps.fit(Image.open(src/(key+'.png')).convert('RGBA'),(1600,1200))
def put(im,key,x,y,w,h,angle=0):
 s=sprite(key)
 if angle:s=s.rotate(angle,resample=Image.Resampling.BICUBIC,expand=True)
 s.thumbnail((w,h),Image.Resampling.LANCZOS) if max(w/s.width,h/s.height)<=1 else None
 scale=min(w/s.width,h/s.height);s=s.resize((round(s.width*scale),round(s.height*scale)),Image.Resampling.LANCZOS)
 im.alpha_composite(s,(int(x+(w-s.width)/2),int(y+(h-s.height)/2)))
def save(im,n):
 im.convert('RGB').save(dest/('gol-'+str(n)+'.webp'),quality=94,method=4)
im=back('path');put(im,'walk',440,310,520,740);put(im,'hat',557,158,344,240);save(im,1)
save(back('gol-2-tam-sahne'),2)
im=back('path');put(im,'surprise',350,352,456,660);put(im,'hat',1050,250,300,230,18)
d=ImageDraw.Draw(im)
for x,y,w in [(855,310,150),(913,350,100),(876,395,100)]:d.arc((x,y,x+w,y+25),10,160,fill='#44768b',width=4)
save(im,3)
im=back('shore');put(im,'kisi/kino-0',35,400,340,580)
d=ImageDraw.Draw(im)
for x,y,w,h in [(650,782,475,110),(710,798,355,69),(772,812,226,40)]: d.arc((x,y,x+w,y+h),3,340,fill='#d6faff',width=6)
save(im,4)
water=im.copy()
put(im,'kelime/duckling',735,612,290,255)
im.paste(water.crop((720,833,1040,880)),(720,833))
d.arc((783,811,992,845),3,160,fill='#d6faff',width=5)
for x,y in [(730,776),(1010,808),(749,791)]: d.ellipse((x,y,x+9,y+16),fill='#dbfaff',outline='#317696',width=2)
joke=im.copy();put(im,'hat',772,554,197,123);save(im,'4b')
put(joke,'kelime/banana',765,549,215,120,-8);save(joke,'saka')
im=back('bank');put(im,'reach',360,510,535,497);put(im,'kelime/duckling',900,650,350,350);put(im,'hat',790,685,222,131,-12);save(im,5)
im=back('sunset');put(im,'kelime/cow',750,473,700,510);put(im,'kisi/kino-1',320,435,432,611);put(im,'hat',352,327,272,190);put(im,'kelime/duckling',780,857,197,189);save(im,6)
for page,nums in enumerate([[1,2,3,4],['4b',5,6,'saka']],1):
 sheet=Image.new('RGB',(800,600))
 for i,n in enumerate(nums):
  a=Image.open(dest/f'gol-{n}.webp');sheet.paste(a.resize((400,300),Image.Resampling.LANCZOS),(i%2*400,i//2*300))
 sheet.save(here/f'S{page}.jpg',quality=94)
