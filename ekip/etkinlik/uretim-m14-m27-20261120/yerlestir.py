"""ImageGen kaynaklarını oyun tuvaline ve ortak tabana yerleştirir."""
import argparse
import json
import shutil
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
DATA = json.loads((HERE / 'cizimler.json').read_text(encoding='utf-8'))
RAW, OUT = HERE / 'kaynak', HERE / 'prova'
LANCZOS = Image.Resampling.LANCZOS


def canvas(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))


def source_path(name):
    costume = ['-tulum-sheet'] if name=='lokum-balon' else []
    for ending in (*costume, '-v2', ''):
        p = RAW / (name + ending + '.png')
        if p.exists():
            return p


def source(name):
    path=source_path(name)
    if path is None:return None
    im=Image.open(path).convert('RGBA')
    if name=='zipzip-bayrak':
        pixels=np.array(im)
        pale=(pixels[:,:,:3].min(axis=2)>205)
        _,regions,_,_=cv2.connectedComponentsWithStats(pale.astype('uint8'))
        border=np.unique(np.r_[regions[0],regions[-1],regions[:,0],regions[:,-1]])
        pixels[np.isin(regions,border[border!=0]),3]=0
        im=Image.fromarray(pixels)
    if name=='lokum' and (RAW/'lokum-tulum-sheet.png').exists():
        box=(0,0,round(im.width/4),round(im.height/2))
        corrected=Image.open(RAW/'lokum-tulum-sheet.png').convert('RGBA')
        iw,ih=corrected.size
        first=corrected.crop((0,0,round(iw/4),round(ih/2))).resize(box[2:],LANCZOS)
        im.paste(first,box[:2])
    return im


def bound(img):
    return img.getchannel('A').point(lambda a: 255 if a > 64 else 0).getbbox()


def cut(img):
    return img.crop(bound(img))


def edges(img, w, h, old_x, new_x, old_y, new_y):
    """Register illustrated landmarks to the coordinates of interactive elements."""
    def extend(size, fractions):
        return [0, *[round(size * x) for x in fractions], size]
    ix, iy = extend(img.width, old_x), extend(img.height, old_y)
    ox, oy = [0, *new_x, w], [0, *new_y, h]
    out = canvas(w, h)
    for j in range(len(iy) - 1):
        for i in range(len(ix) - 1):
            patch = img.crop((ix[i], iy[j], ix[i+1], iy[j+1]))
            out.paste(patch.resize((ox[i+1]-ox[i], oy[j+1]-oy[j]), LANCZOS), (ox[i], oy[j]))
    return out


def fit(img, w, h, bottom=None, margin=0):
    height = bottom-margin if bottom is not None else h-2*margin
    small = ImageOps.contain(img, (max(1, w-margin*2), max(1, height)), LANCZOS)
    out = canvas(w, h)
    out.alpha_composite(small, ((w-small.width)//2, bottom-small.height if bottom is not None else (h-small.height)//2))
    return out


def no_wall(tile):
    raw=np.array(tile)
    r,g,b=raw[:,:,:3].transpose(2,0,1).astype(int)
    yellow=(r>170)&(g>132)&(b<110)
    _,cc,_,_=cv2.connectedComponentsWithStats(yellow.astype('uint8'))
    labels=np.unique(np.r_[cc[0],cc[-1],cc[:,0],cc[:,-1]])
    raw[np.isin(cc,labels[labels!=0]),3]=0
    return Image.fromarray(raw)


def water(k,img):
    pix=np.array(img)
    h,w=pix.shape[:2]
    ink=(pix[:,:,:3].max(axis=2)<125)&(pix[:,:,3]>140)
    kernel=np.ones((3,3),np.uint8)
    border=cv2.morphologyEx(ink.astype('uint8'),cv2.MORPH_CLOSE,kernel)
    _,region,_,_=cv2.connectedComponentsWithStats(1-cv2.dilate(border,np.ones((2,2),np.uint8)))
    yy=np.arange(h)[:,None]
    # Recover only the interior bounded by ImageGen's original pen line.
    # A transparent matte in a colored liquid must not show the countertop.
    def fill(x,y,color,limit=None):
        ident=region[round(h*y),round(w*x)]
        if not ident or ident==region[0,0]:return
        mask=(region==ident).astype('uint8')
        contours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:cv2.drawContours(mask,[contour],-1,1,cv2.FILLED)
        ok=mask.astype(bool)
        if limit is not None:ok &= limit
        pix[ok]=color
    blue=(83,194,247,255)
    glass=(165,238,245,126)
    if k=='bardak-dolu':fill(.44,.65,blue,yy>=52)
    if k=='bardak-yarim':fill(.44,.73,blue,yy>=140)
    if k=='surahi-bos':fill(.44,.56,glass)
    if k=='surahi-yarim':
        fill(.44,.48,glass)
        fill(.44,.75,blue)
    if k=='surahi-dolu':fill(.44,.55,blue,yy>=137)
    if k=='surahi-egik':fill(.49,.5,blue,yy>=140)
    result=Image.fromarray(pix)
    if k=='surahi-egik':
        return edges(result,w,h,[33/w,133/w],[70,149],[],[])
    return result


def puzzle(k,im):
    house=k.startswith('ev-')
    w,h=(600,640) if house else (400,700 if k.endswith('taslak') else 900)
    art=im.resize((w,h),LANCZOS)
    if k=='ev-taslak':
        ix=[48,112,150,224,253,347,376,449,487,552]; ox=[40,100,140,220,250,350,380,460,500,560]
        iy=[20,253,303,387,450,624]; oy=[20,240,300,380,470,639]
        return edges(art,w,h,[x/w for x in ix],ox,[y/h for y in iy],oy)
    if k=='roket-taslak':
        out=canvas(w,h)
        middle=art.crop((102,27,297,619))
        middle=edges(middle,160,540,[42/195,152/195],[40,120],
                     [173/592,254/592,365/592],[160,240,320])
        out.alpha_composite(middle,(120,20))
        for bx,left in [((18,440,107,619),30),((293,440,382,619),280)]:
            out.alpha_composite(art.crop(bx).resize((90,200),LANCZOS),(left,420))
        return out
    def tile(n,width,height):
        return cut(source(n)).resize((width,height),LANCZOS)
    if house:
        out=canvas(w,h)
        chimney=art.crop((390,3,492,202))
        # The red roof of the illustrated chimney goes behind the finished roof.
        px=np.array(chimney);red=(px[:,:,0]>154)&(px[:,:,1]<100)&(px[:,:,2]<90)
        px[red,3]=0
        out.alpha_composite(Image.fromarray(px).resize((75,145),LANCZOS),(367,0))
        out.alpha_composite(tile('ev-govde',400,400),(100,240))
        out.alpha_composite(tile('ev-cati',520,220),(40,20))
        out.alpha_composite(tile('ev-kapi',100,170),(250,470))
        out.alpha_composite(tile('ev-pencere',80,80),(380,300))
        window=no_wall(art.crop((126,282,288,435))).resize((85,83),LANCZOS)
        out.alpha_composite(window,(137,298))
        for source_x,dest_x in [(143,178),(390,375)]:
            flower=no_wall(art.crop((source_x,508,source_x+70,623))).resize((49,76),LANCZOS)
            out.alpha_composite(flower,(dest_x,560))
        return out
    out=canvas(w,h)
    plume=cut(art.crop((133,566,266,895))).resize((112,340),LANCZOS)
    out.alpha_composite(plume,(144,560))
    out.alpha_composite(tile('roket-kanat-sol',90,200),(30,420))
    out.alpha_composite(tile('roket-kanat-sag',90,200),(280,420))
    out.alpha_composite(tile('roket-govde',160,380),(120,180))
    out.alpha_composite(tile('roket-burun',160,160),(120,20))
    window=art.crop((129,199,272,451)).resize((80,80),LANCZOS)
    window.putalpha(tile('roket-pencere',80,80).getchannel('A'))
    out.alpha_composite(window,(160,260))
    return out


def save(name, img, folder):
    (OUT / folder).mkdir(exist_ok=True)
    img.save(OUT / folder / (name + '.webp'), lossless=True, method=3)


def sheet(name, img, w, h, folder, publish):
    rows, cols = (2, 4) if name == 'lokum' else (1, 4)
    cells = []
    for r in range(rows):
        for c in range(cols):
            cells.append(img.crop((round(c*img.width/cols),round(r*img.height/rows),
                                   round((c+1)*img.width/cols),round((r+1)*img.height/rows))))
    indices = [0, 2, 5, 6] if name == 'lokum' else [0,3]
    b = [bound(cell) for cell in cells]
    if any(x is None for x in b):
        raise ValueError(f'{name}: boş hücre')
    # Use one camera scale per movement. Raised arms do not enlarge the head.
    bottom = {'lokum':570,'lokomotif-mino':480,'asansor-lokum':168}.get(name, h-20)
    visible = bottom - 12
    if name == 'lokum-balon':
        visible = 350
    scale = min((w-14)/max(x[2]-x[0] for x in b), visible/max(x[3]-x[1] for x in b))
    if name=='bulut-balon':
        scale *= 1.014
    if name=='lokum-balon':
        scale *= .91
    base_x = sum(b[0][::2])/2
    frame_offsets = []
    for j, i in enumerate(indices):
        bbox = b[i]
        crop = cells[i].crop(bbox)
        pixel_size = (max(1, round(crop.width*scale)), max(1, round(crop.height*scale)))
        cx = max(0,min(w-pixel_size[0], round(w/2 + (bbox[0]-base_x)*scale)))
        if name=='bulut-balon':
            cx -= 60
        if name=='lokum-balon':
            cx -= 48
        top = bottom - pixel_size[1]
        frame = canvas(w,h)
        frame.alpha_composite(crop.resize(pixel_size,LANCZOS),(cx,top))
        if name=='asansor-lokum':
            cabin=cut(frame)
            frame=canvas(w,h)
            span=round(cabin.width*.58)
            kept=(w-span)//2
            expanded=edges(cabin,w,bottom,[.21,.79],[kept,kept+span],[],[])
            frame.alpha_composite(expanded,(0,0))
        save(f'{name}-{j}',frame,folder)
        frame_offsets.append({'kaynak':i,'sol':cx,'ust':top,'boyut':pixel_size})
    if publish:
        archive = ROOT/'ekip/film/ortak-poz-arsivi/karakter-hareketleri'/('alfabe-h9' if name=='lokum' else 'matematik-'+folder)/name
        archive.mkdir(parents=True,exist_ok=True)
        if name=='lokum' and (RAW/'lokum-tulum-sheet.png').exists():
            img.save(archive/'sheet.png')
        else:
            shutil.copyfile(source_path(name), archive/'sheet.png')
        (archive/'hareket.json').write_text(json.dumps({'oyun':folder,'sutun':cols,'satir':rows,'okuma':'soldan sağa, yukarıdan aşağıya','tuval':[w,h],'taban':bottom,'olcek':scale,'pozlar':frame_offsets,'zamanlama':'Oyun eylemiyle tetiklenen ana pozlar; ara çizimler kaynak sırasındadır.'}, ensure_ascii=False,indent=2),encoding='utf-8')
    return [f'{name}-{i}' for i in range(len(indices))]


def prop(k, im, w, h, kind):
    if kind in ('bg','card'):
        if k=='elma-bahcesi':
            return edges(im,w,h,[],[],[168/941,390/941,480/941],[115,390,480])
        if k=='istasyon':
            return edges(im,w,h,[],[],[.766],[720])
        if k=='babaanne-mutfagi':
            return edges(im,w,h,[],[],[616/h,798/h],[470,840])
        if k=='mutfak-firin':
            return edges(im,w,h,[366/w,521/w,1150/w,1304/w],[380,560,1110,1290],
                         [45/h,350/h,545/h,783/h],[80,330,420,700])
        if k=='resim-masasi':
            return edges(im,w,h,[399/w,1272/w],[500,1170],[47/h,893/h],[60,880])
        if k=='mutfak-tezgahi':
            return edges(im,w,h,[],[],[603/h,809/h],[470,820])
        if k=='muzik-kosesi':
            return edges(im,w,h,[],[],[718/h,874/h],[700,880])
        if k=='kesme-tahtasi':
            return edges(im,w,h,[341/w,1329/w],[420,1250],[334/h,848/h],[360,800])
        if k=='zaman-duvari':
            ix=[132,541,632,1040,1131,1540]
            ox=[180,560,646,1026,1112,1492]
            return edges(im,w,h,[x/w for x in ix],ox,[249/h,496/h,664/h,775/h],[150,450,600,880])
        if k=='bayrak-direkleri':
            return edges(im,w,h,[],[],[217/h],[200])
        if k=='apartman':
            ix=[742,930,959,1074]
            iy=[139,180,255,338,413,492,567,645,720,796,872,907]
            oy=[40,85,175,255,345,425,515,595,685,765,855,900]
            return edges(im,w,h,[n/im.width for n in ix],[720,960,990,1100],
                         [n/im.height for n in iy],oy)
        return im.resize((w,h), LANCZOS)
    obj = cut(im)
    if k in ('onluk-sandik','besli-sepet','tepsi'):
        geom = {'onluk-sandik':([.043,.958],[40,560],[.075,.925],[50,280]),
                'besli-sepet':([.052,.948],[30,370],[.18,.79],[40,160]),
                'tepsi':([.034,.966],[30,490],[.074,.927],[40,270])}[k]
        return edges(obj,w,h,*geom)
    if k.startswith('balon-'):
        return fit(obj,w,h,bottom=h-4,margin=2)
    if k.startswith('vagon-'):
        a=np.array(obj)
        mask=(np.min(a[:,:,:3],axis=2)>220)&(a[:,:,3]>180)
        n,l,st,c=cv2.connectedComponentsWithStats(mask.astype('uint8'))
        big=max(st[1:],key=lambda row:row[4])
        x,y,sw,sh,_=big
        small=edges(obj,w,h-10,[x/obj.width,(x+sw)/obj.width],[110,270],
                    [y/obj.height,(y+sh)/obj.height],[60,170])
        out=canvas(w,h);out.paste(small,(0,0));return out
    if k.startswith('halka-'):
        i=int(k[-1]); small=ImageOps.contain(obj,([155,280,390][i],[65,116,164][i]),LANCZOS)
        out=canvas(w,h);out.paste(small,((w-small.width)//2,(h-small.height)//2));return out
    if k.startswith('bayrak-'):
        flag=ImageOps.contain(obj,(w-6,h-12),LANCZOS)
        if k=='bayrak-kirmizi-ucgen':
            bits=np.array(flag)
            closed=(bits[:,:,3]>95).astype('uint8')
            contours,_=cv2.findContours(closed,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
            contour=max(contours,key=cv2.contourArea)
            cv2.drawContours(closed,[contour],-1,1,cv2.FILLED)
            inset=cv2.erode(closed,np.ones((5,5),np.uint8)).astype(bool)
            color=np.median(bits[(bits[:,:,0]>180)&(bits[:,:,1]<100)&(bits[:,:,3]>245),:3],axis=0)
            bits[inset]=[*color,255]
            flag=Image.fromarray(bits)
        out=canvas(w,h)
        out.alpha_composite(flag,((w-flag.width)//2,8))
        return out
    if k=='tas-bos':
        out=fit(obj,w,h,margin=4);out.putalpha(out.getchannel('A').point(lambda x:round(x*.84)));return out
    if k=='sehpa':
        panel=obj.resize((w,h),LANCZOS)
        paper=panel.crop((34,123,38,127)).convert('RGB')
        panel.paste(paper.resize((307,220)),(27,57))
        return edges(panel,w,h,[27/w,334/w],[60,300],[57/h,277/h],[40,280])
    if k in ('ev-taslak','ev-canli','roket-taslak','roket-canli'):
        return puzzle(k,im)
    if kind=='storycard':
        return im.resize((w,h),LANCZOS)
    if k.endswith(('-sol','-sag')) and k.split('-')[0] in ('elma','armut','ekmek','simit'):
        base=k.split('-')[0]
        whole=prop(base+'-butun',source(base+'-butun'),w,h,'obj')
        left=k.endswith('-sol')
        mask=whole.getchannel('A').copy()
        mask.paste(0, (w//2,0,w,h) if left else (0,0,w//2,h))
        box=mask.getbbox()
        target=obj.resize((box[2]-box[0],box[3]-box[1]),LANCZOS)
        # Keep the registered outer contour of the original drawing. Use the
        # separately illustrated interior only in the band beside the cut.
        art=whole.copy()
        strip=canvas(w,h)
        strip.alpha_composite(target,(box[0],box[1]))
        band=max(8,round(w*.18))
        seam=(w//2-band,0,w//2,h) if left else (w//2,0,w//2+band,h)
        art.alpha_composite(strip.crop(seam),(seam[0],seam[1]))
        art.putalpha(mask)
        return art
    if k.endswith('-butun'):
        return fit(obj,w,h,margin=round(w*.05))
    if k.startswith('bardak-') or k.startswith('surahi-'):
        return water(k,fit(obj,w,h,bottom=h-5,margin=3))
    if k=='rakam-bayragi':
        return fit(obj,w,h,bottom=h-5,margin=3)
    if k in ('oval','yildiz','kalp','altigen'):
        return fit(obj,w,h,margin=50)
    if k.startswith(('ev-','roket-')):
        return obj.resize((w,h),LANCZOS)
    if kind=='singlechar':
        return fit(obj,w,h,bottom=h-20,margin=7)
    return fit(obj,w,h,margin=max(1,round(min(w,h)*.014)))


def package(key, publish):
    folder = DATA['packages'][key]
    keys=[]
    for k,w,h,kind,_ in DATA['specs'][key]:
        registered=RAW/(k+'-hizali.png')
        if registered.is_file():
            with Image.open(registered) as im:
                if im.size!=(w,h):
                    raise ValueError(f'{k}: {im.size} yerine {(w,h)} bekleniyor')
                save(k,im,folder)
            keys.append(k)
            continue
        im=source(k)
        if im is None:continue
        if kind=='sheet':
            keys.extend(sheet(k,im,w,h,folder,publish))
        else:
            save(k,prop(k,im,w,h,kind),folder);keys.append(k)
    if publish:
        game=ROOT/'assets'/('alfabe' if key=='H9' else 'matematik')/folder
        game.mkdir(parents=True,exist_ok=True)
        for k in keys:
            shutil.copyfile(OUT/folder/(k+'.webp'),game/(k+'.webp'))
    print(key, len(keys), 'oyuna' if publish else 'provaya')


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('keys',nargs='+')
    parser.add_argument('--publish',action='store_true')
    args=parser.parse_args()
    for key in args.keys:package(key,args.publish)
