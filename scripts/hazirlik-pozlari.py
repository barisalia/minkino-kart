"""Keep native sheet pixels and register poses by their planted feet, not props."""
from pathlib import Path
from shutil import copyfile
import argparse, json
from PIL import Image, ImageDraw, ImageOps
import numpy as np

root = Path(__file__).resolve().parents[1]
archive = root/'ekip/film/ortak-poz-arsivi/karakter-hareketleri/yil-sonu'
dest = root/'assets/hazirlik/kres'
check = root/'output/hazirlik/gosteri-kontrol'

def zemin_golgesini_ayir(img, name):
    """Ground belongs to the set. Only remove exterior-connected ink of the
    known baked oval, below the ankles; never erase inside the silhouette."""
    if name not in ('zip-selam','mino-seyirci','lokum-seyirci','kino-kupa-yesil'):
        return img
    pix=np.array(img)
    a=pix[:,:,3]; rgb=pix[:,:,:3].astype(np.int16)
    ys=np.nonzero(a>105)[0]
    if not len(ys): return img
    t=max(0,int(ys.max()-(ys.max()-ys.min())*.093))
    rgb=rgb[t:];al=a[t:];r,g,b=rgb.transpose((2,0,1))
    if name=='zip-selam':
        golge=(r>62)&(r<213)&(g>55)&(g-b<33)&(r-g<34)&(r-g>-9)&(b>47)
    else:
        golge=(r>70)&(r<(213 if name=='kino-kupa-yesil' else 192))&(b>61)&(np.max(rgb,axis=2)-np.min(rgb,axis=2)<31)
    aday=Image.fromarray(((al<70)|golge).astype('uint8')*255)
    # Give all exterior edges one shared starting point for flood filling.
    dis=ImageOps.expand(aday,border=1,fill=255)
    ImageDraw.floodfill(dis,(0,0),128)
    al[np.asarray(dis)[1:-1,1:-1]==128]=0
    return Image.fromarray(pix)

def export(name, source, count, ref):
    directory = archive/name
    directory.mkdir(parents=True, exist_ok=True)
    target = directory/'sheet.png'
    if source.resolve() != target.resolve():
        copyfile(source, target)
    sheet = Image.open(target).convert('RGBA')
    cols, rows = count//2, 2
    cells, pieces, feet, sole_y = [], [], [], []
    for n in range(count):
        x, y = n%cols, n//cols
        cell = tuple(round(v) for v in (sheet.width*x/cols,sheet.height*y/rows,sheet.width*(x+1)/cols,sheet.height*(y+1)/rows))
        if name=='lokum-kurdele' and sheet.size==(1774,887):
            splits=([0,434,866,1268,1774] if y==0 else [0,434,866,1315,1774])
            cell=(splits[x],cell[1],splits[x+1],cell[3])
        img = zemin_golgesini_ayir(sheet.crop(cell),name)
        mask = img.getchannel('A').point(lambda a: 255 if a>105 else 0)
        bounds = mask.getbbox()
        if not bounds: raise ValueError(f'Empty pose {name}/{n}')
        left, top, right, bottom = bounds
        if name=='lokum-kurdele':
            a=np.asarray(img).astype('int16')
            white=(a[:,:,3]>170)&(a[:,:,:3].min(axis=2)>198)&(a[:,:,:3].max(axis=2)-a[:,:,:3].min(axis=2)<38)
            white[:top+round((bottom-top)*.78)]=False
            ys,xs=np.nonzero(white)
            if len(ys):
                foot_y=int(ys.max())+3
                row=xs[ys>foot_y-17]
                if len(row):feet_x=round((int(row.min())+int(row.max()))/2)-left
            else: raise ValueError('Missing feet')
        sole = mask.crop((left, bottom-max(4,round((bottom-top)*.04)),right,bottom)).getbbox()
        foot_x = round((sole[0]+sole[2])/2)
        if name=='lokum-kurdele':foot_x=feet_x
        if name.startswith('kino-kupayla-'):
            # Feet alternate between forward/backward contact; centring each sole
            # would make the entire torso jerk back and forth. Register nose X
            # across the cycle and register the lowest planted sole in Y.
            face=mask.crop((left,top,right,top+round((bottom-top)*.47))).getbbox()
            foot_x=face[2]
        if name=='zip-sahneye-yuru' or name.startswith('kino-sola-yuru-') or name in ('mino-davulla-yuru','lokum-kurdeleyle-yuru'):
            # Sola yürüyen tilkinin kuyruğu ve ayakları uzayıp kısalır.
            # Yatay referans olarak maskenin baş bölgesindeki burun ucunu al.
            face=mask.crop((left,top,right,top+round((bottom-top)*.47))).getbbox()
            foot_x=face[2] if name=='mino-davulla-yuru' else face[0]
        cells.append([cell, bounds]); pieces.append(img.crop(bounds)); feet.append(foot_x)
        sole_y.append(foot_y-top if name=='lokum-kurdele' else bottom-top)
    center = max(feet)+5
    width = center+max(p.width-f for p,f in zip(pieces,feet))+5
    baseline=max(sole_y)+5
    height=baseline+max(p.height-f for p,f in zip(pieces,sole_y))+5
    manifest = directory/'hareket.json'
    meta = json.loads(manifest.read_text(encoding='utf-8-sig')) if manifest.exists() else {}
    meta.update(kaynak='sheet.png',referans=ref,eylem=name,yon=meta.get('yon','sağa üç çeyrek'),kareler=[],hucreler_ve_alfa_sinirlari=cells,tuval=[width,height],temas=[center,baseline],taban_x=feet,olcek='Kareler yeniden ölçeklenmeden taban noktasına yerleşir.')
    meta.setdefault('zamanlama_ms',[220,170,210,245,185,260][:count])
    if name.startswith('kino-zil-'):
        meta.update(yon='profil sağ',zamanlama_ms=[135]*8)
    if name.startswith('kino-esikte-don-'):
        meta.update(yon='sağ profilden önden geçerek sol üç çeyreğe',zamanlama_ms=[155]*8)
    if name.startswith('kino-kupayla-'):
        meta.update(yon='profil sağ',olcek='Basılı taban y’de, sabit burun ucu x’te hizalanır; her kare aynı ölçektedir.',yatay_kayit='burun ucu',zamanlama_ms=[102]*8)
    if name=='zip-sahneye-yuru':
        meta.update(yon='profil sol',olcek='Taban y’de ve burun ucu x’te aynı noktadadır.',yatay_kayit='burun ucu',zamanlama_ms=[99]*8)
    if name.startswith('kino-sola-yuru-'):
        meta.update(yon='profil sol, göz lekesi görünen yan',yatay_kayit='burun ucu',zamanlama_ms=[95]*8)
    if name in ('mino-davulla-yuru','lokum-kurdeleyle-yuru'):
        meta.update(yon='sağa üç çeyrek' if name=='mino-davulla-yuru' else 'sola üç çeyrek',yatay_kayit='baş bölgesinin ön kenarı',zamanlama_ms=[100]*8)
    if name.startswith('kino-sohbet-'):
        meta.update(yon='sağa üç çeyrek, anneye doğru',zamanlama_ms=[80]*6)
    compare = Image.new('RGB',(200*cols,244*rows),'#e6dbc1')
    for n,p in enumerate(pieces):
        canvas = Image.new('RGBA',(width,height))
        canvas.alpha_composite(p,(center-feet[n],baseline-sole_y[n]))
        path = dest/f'{name}-{n}.webp'
        canvas.save(path,method=6,quality=94,exact=True)
        meta['kareler'].append(path.relative_to(root).as_posix())
        thumb=canvas.copy(); thumb.thumbnail((194,238))
        compare.paste(thumb,(n%cols*200+(200-thumb.width)//2,n//cols*244+240-thumb.height),thumb)
    manifest.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    check.mkdir(parents=True,exist_ok=True)
    compare.save(check/f'{name}-kareler.jpg',quality=91)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('name');p.add_argument('source',type=Path)
    p.add_argument('count',type=int);p.add_argument('ref',nargs='?',default='ekip/film/youtube-referans-2026-11-06/01-anne-kino-mino.jpg')
    a=p.parse_args()
    if a.count: export(a.name,a.source,a.count,a.ref)
    else: Image.open(a.source).convert('RGB').save(dest/(a.name+'.webp'),quality=94,method=6)
