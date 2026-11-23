"""Teslim edilen dosyaların ölçülerini, kart köşelerini ve yapboz birleşimlerini denetler."""
import json
from pathlib import Path

import numpy as np
from PIL import Image


here=Path(__file__).resolve().parent
root=here.parents[2]
spec=json.loads((here/'cizimler.json').read_text(encoding='utf-8'))
report={}
errors=[]


def inspect(folder,name,dimensions,alpha=False,rounded=False):
    path=folder/(name+'.webp')
    if not path.is_file():
        errors.append(str(path.relative_to(root))+' eksik')
        return
    with Image.open(path) as img:
        if img.size!=tuple(dimensions):
            errors.append(f'{name} ölçü {img.size}')
        if alpha and 'A' not in img.getbands():
            errors.append(f'{name} alfa katmanı eksik')
        if rounded:
            a=img.convert('RGBA').getchannel('A')
            w,h=a.size
            if any(a.getpixel(p)!=0 for p in [(0,0),(0,h-1),(w-1,0),(w-1,h-1)]):
                errors.append(f'{name} köşeler')
            if a.getpixel((w//2,h//2))!=255:
                errors.append(f'{name} merkez saydam')


for pack,folder in spec['packages'].items():
    dest=root/'assets'/('alfabe' if pack=='H9' else 'matematik')/folder
    files=[]
    for key,w,h,kind,_ in spec['specs'][pack]:
        names=[key] if kind!='sheet' else [key+'-'+str(i) for i in range(4 if key=='lokum' else 2)]
        for name in names:
            inspect(dest,name,(w,h),alpha=kind not in ('bg','card'))
        files.extend(names)
    report[pack]=len(files)

for text in range(40,100):
    inspect(root/'assets/alfabe/cumle',f'cumle-{text}',(800,560),True,True)
for n in range(1,11):
    for i in (1,2,3,4,'4-sonra'):
        inspect(root/'assets/alfabe/oyku',f'oyku-{n}-{i}',(800,560),True,True)
report['cümle']=60
report['öykü']=50

folder=root/'assets/matematik/butun-yarim'
for item in ('elma','armut','ekmek','simit'):
    names=[folder/(item+'-'+v+'.webp') for v in ('butun','sol','sag')]
    if not all(p.exists() for p in names):continue
    whole,left,right=[np.asarray(Image.open(path).convert('RGBA'))[:,:,3] for path in names]
    if np.any(left[:,180:]) or np.any(right[:,:180]) or not np.array_equal(np.maximum(left,right),whole):
        errors.append(f'{item} yarımlar bütünün dış hattını vermiyor')

garden=root/'assets/matematik/elma-sandik/elma-bahcesi.webp'
if garden.exists():
    with Image.open(garden) as g:
        for row in range(4):
            for col in range(5):
                p=(130+100*col+(20 if row%2 else -20),115+92*row)
                r,green,b=g.convert('RGB').getpixel(p)
                if not green>max(r,b)+40:errors.append(f'Ağaçta {p} konumu yeşil değil')

for key,xy in [('lokum-balon-0',(300,300)),('bulut-balon-0',(330,110))]:
    file=root/'assets/matematik/balonlar'/(key+'.webp')
    if file.exists():
        a=Image.open(file).convert('RGBA').getchannel('A')
        if a.getpixel(xy)<180:errors.append(f'{key} ip eli kaçırıyor')

data={'dosyalar':report,'kontrol_edilen':sum(report.values()),'hatalar':errors}
(here/'prova'/'teslim-denetimi.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(data,ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))
